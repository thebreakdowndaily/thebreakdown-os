/**
 * THE BREAKDOWN OS — Knowledge Graph Builder
 *
 * Full rebuild of the Knowledge Graph from the Memory Engine store.
 * Used for:
 *   1. Initial graph construction (first run)
 *   2. Full rebuild (after schema changes)
 *   3. Incremental index refresh (periodic)
 *
 * The builder iterates through all memory entities and discovers
 * relationships based on co-occurrence in stories and shared references.
 */

import { EntityManager } from './entity-manager';
import { RelationshipManager } from './relationship-manager';
import type { GraphNode, GraphConfig } from './types';
import { BuildReport } from './graph-manager';
import * as fs from 'fs/promises';
import * as path from 'path';

export class GraphBuilder {
  private entities: EntityManager;
  private relationships: RelationshipManager;
  private config: GraphConfig;

  constructor(config: GraphConfig, entities: EntityManager, relationships: RelationshipManager) {
    this.config = config;
    this.entities = entities;
    this.relationships = relationships;
  }

  /**
   * Full graph rebuild from the Memory Engine store.
   * Expects a path to the memory entities directory.
   */
  async buildFromMemory(memoryStorePath: string): Promise<BuildReport> {
    const startTime = Date.now();
    const report: BuildReport = {
      nodesCreated: 0,
      nodesUpdated: 0,
      edgesCreated: 0,
      edgesUpdated: 0,
      errors: [],
      duration: 0,
    };

    try {
      // 1. Discover all memory entity directories
      const entityDirs = await this.discoverMemoryEntities(memoryStorePath);

      // 2. Create graph nodes from memory entities
      for (const entityFile of entityDirs) {
        try {
          const memoryEntity = JSON.parse(await fs.readFile(entityFile, 'utf-8'));
          const nodeKey = this.makeNodeKey(memoryEntity.type || 'topic', memoryEntity.name || memoryEntity.id);

          const existing = await this.entities.get(nodeKey);
          if (existing) {
            await this.entities.update(nodeKey, {
              label: memoryEntity.name || memoryEntity.title || existing.label,
              description: memoryEntity.description || memoryEntity.summary || existing.description,
              aliases: [...new Set([...(existing.aliases || []), memoryEntity.name, memoryEntity.title].filter(Boolean))],
              metadata: { ...(existing.metadata || {}), restoredFromMemory: true },
            });
            report.nodesUpdated++;
          } else {
            await this.entities.create({
              id: nodeKey,
              type: this.mapMemoryType(memoryEntity.type || 'topic'),
              label: memoryEntity.name || memoryEntity.title || nodeKey,
              description: memoryEntity.description || memoryEntity.summary || '',
              aliases: [memoryEntity.name, memoryEntity.title].filter(Boolean),
              metadata: { restoredFromMemory: true, memorySource: entityFile },
            });
            report.nodesCreated++;
          }
        } catch (err: any) {
          report.errors.push(`Failed to process memory file '${entityFile}': ${err.message}`);
        }
      }

      // 3. Discover relationships by co-occurrence
      const coOccurrenceEdges = await this.discoverCoOccurrence(entityDirs);

      for (const edge of coOccurrenceEdges) {
        try {
          await this.relationships.create(edge);
          report.edgesCreated++;
        } catch {
          report.edgesUpdated++;
        }
      }

      // 4. Rebuild search indices
      await this.entities.loadIndices();

      report.duration = Date.now() - startTime;

    } catch (err: any) {
      report.errors.push(`Build failed: ${err.message}`);
    }

    return report;
  }

  /**
   * Incremental index rebuild (faster, only updates indices without touching nodes).
   */
  async rebuildIndices(): Promise<void> {
    await this.entities.loadIndices();
  }

  // ── Private: Memory Discovery ─────────────────────────────────────────

  private async discoverMemoryEntities(memoryStorePath: string): Promise<string[]> {
    const files: string[] = [];

    async function walk(dir: string): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('_')) {
            files.push(fullPath);
          }
        }
      } catch {
        // Skip unreadable directories
      }
    }

    await walk(memoryStorePath);
    return files;
  }

  // ── Private: Co-occurrence Discovery ──────────────────────────────────

  private async discoverCoOccurrence(entityFiles: string[]): Promise<EdgeInput[]> {
    const edges: EdgeInput[] = [];
    const storyMap = new Map<string, string[]>(); // story_url → node IDs

    // Group entities by story
    for (const filePath of entityFiles) {
      try {
        const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const stories = content.stories || content.references || [];
        if (typeof stories === 'string') {
          // Single story reference
          if (!storyMap.has(stories)) storyMap.set(stories, []);
          const nodeKey = this.makeNodeKey(content.type || 'topic', content.name || content.id);
          storyMap.get(stories)!.push(nodeKey);
        } else if (Array.isArray(stories)) {
          for (const story of stories) {
            const storyUrl = story.url || story.id || story;
            if (!storyMap.has(storyUrl)) storyMap.set(storyUrl, []);
            const nodeKey = this.makeNodeKey(content.type || 'topic', content.name || content.id);
            storyMap.get(storyUrl)!.push(nodeKey);
          }
        }
      } catch {
        continue;
      }
    }

    // Create edges for co-occurring entities within same story
    const seenPairs = new Set<string>();
    for (const [storyUrl, nodeIds] of storyMap.entries()) {
      const uniqueIds = [...new Set(nodeIds)];
      if (uniqueIds.length < 2) continue;

      // Connect every pair
      for (let i = 0; i < uniqueIds.length; i++) {
        for (let j = i + 1; j < uniqueIds.length; j++) {
          const pairKey = [uniqueIds[i], uniqueIds[j]].sort().join('||');
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);

          edges.push({
            from: uniqueIds[i],
            to: uniqueIds[j],
            relationship: 'related_to',
            confidence: 0.6, // Co-occurrence starts at lower confidence
            weight: 1.0,
            sources: [storyUrl],
            metadata: { discoveryMethod: 'co_occurrence' },
          });
        }
      }
    }

    return edges;
  }

  // ── Private: Type Mapping ─────────────────────────────────────────────

  private mapMemoryType(memoryType: string): string {
    const typeMap: Record<string, string> = {
      person: 'person',
      people: 'person',
      organization: 'organization',
      company: 'company',
      country: 'country',
      state: 'state',
      district: 'district',
      city: 'city',
      law: 'law',
      policy: 'policy',
      scheme: 'scheme',
      budget: 'budget',
      report: 'report',
      committee: 'committee',
      'court-case': 'court-case',
      'court case': 'court-case',
      technology: 'technology',
      project: 'project',
      event: 'event',
      article: 'article',
      dataset: 'dataset',
      statistic: 'statistic',
      topic: 'topic',
    };

    return typeMap[memoryType.toLowerCase()] || 'topic';
  }

  // ── Private: Utilities ────────────────────────────────────────────────

  private makeNodeKey(type: string, label: string): string {
    const sanitized = label.replace(/[^a-z0-9|_-]/gi, '_').toLowerCase();
    return `${type}::${sanitized}`;
  }
}

interface EdgeInput {
  from: string;
  to: string;
  relationship: string;
  confidence: number;
  weight: number;
  sources: string[];
  metadata: Record<string, any>;
}
