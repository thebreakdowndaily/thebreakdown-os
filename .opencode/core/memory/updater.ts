/**
 * THE BREAKDOWN OS — Memory Engine Updater
 *
 * Handles all write operations to the memory store.
 * Never overwrites — always versioned.
 * Detects duplicates before creating new entries.
 *
 * Operations:
 *   - upsertEntity:       Create or update an entity (dedup-aware)
 *   - upsertRelationship: Create or update a relationship
 *   - storeFact:          Store a verified fact
 *   - registerSource:     Register or update a source
 *   - storeStory:         Store the story record
 *   - storeRelatedStories: Cache related story links
 *   - readEntity:         Read an entity by ID
 *   - writeEntity:        Write an entity file
 *   - count:              Count total entities
 */

import type { EntityMemory, RelationshipMemory, FactMemory, SourceMemory, StoryMemory } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class Updater {
  private storePath: string;

  constructor(config: { storePath: string }) {
    this.storePath = config.storePath;
  }

  /**
   * Create or update an entity.
   * If an entity with the same ID or matching aliases exists, update it.
   * Never creates duplicates.
   */
  async upsertEntity(entity: EntityMemory, sourceStoryId?: string): Promise<EntityMemory> {
    const existing = await this.findExisting(entity);

    if (existing) {
      return this.mergeEntity(existing, entity, sourceStoryId);
    }

    // New entity
    const newEntity: EntityMemory = {
      ...entity,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stories: sourceStoryId ? [sourceStoryId] : [],
      history: [{
        version: 1,
        timestamp: new Date().toISOString(),
        updatedBy: sourceStoryId || 'memory-engine',
        changes: ['entity-created'],
      }],
      active: true,
    };

    await this.writeEntity(entity.id, newEntity);
    return newEntity;
  }

  /**
   * Create or update a relationship.
   */
  async upsertRelationship(rel: RelationshipMemory): Promise<RelationshipMemory> {
    const relPath = this.relationshipPath(rel.from, rel.relationship, rel.to);

    try {
      const existing = JSON.parse(await fs.readFile(relPath, 'utf-8'));
      const updated: RelationshipMemory = {
        ...existing,
        ...rel,
        version: existing.version + 1,
        lastObserved: new Date().toISOString(),
        history: [
          ...(existing.history || []),
          {
            version: existing.version + 1,
            timestamp: new Date().toISOString(),
            updatedBy: 'memory-engine',
            changes: ['relationship-updated'],
          },
        ],
      };
      await fs.writeFile(relPath, JSON.stringify(updated, null, 2), 'utf-8');
      return updated;
    } catch {
      // New relationship
      const newRel: RelationshipMemory = {
        ...rel,
        version: 1,
        createdAt: new Date().toISOString(),
        lastObserved: new Date().toISOString(),
        firstObserved: new Date().toISOString(),
        active: true,
        history: [{
          version: 1,
          timestamp: new Date().toISOString(),
          updatedBy: 'memory-engine',
          changes: ['relationship-created'],
        }],
      };
      await fs.mkdir(path.dirname(relPath), { recursive: true });
      await fs.writeFile(relPath, JSON.stringify(newRel, null, 2), 'utf-8');
      return newRel;
    }
  }

  /**
   * Store a verified fact.
   */
  async storeFact(fact: FactMemory): Promise<FactMemory> {
    const factId = this.generateFactId(fact);
    const factPath = path.join(this.storePath, 'facts', `${factId}.json`);

    try {
      const existing = JSON.parse(await fs.readFile(factPath, 'utf-8'));
      const updated: FactMemory = {
        ...existing,
        ...fact,
        version: existing.version + 1,
        lastVerified: new Date().toISOString(),
        history: [
          ...(existing.history || []),
          {
            version: existing.version + 1,
            timestamp: new Date().toISOString(),
            updatedBy: 'memory-engine',
            changes: ['fact-updated'],
          },
        ],
      };
      await fs.writeFile(factPath, JSON.stringify(updated, null, 2), 'utf-8');
      return updated;
    } catch {
      const newFact: FactMemory = {
        ...fact,
        id: factId,
        version: 1,
        createdAt: new Date().toISOString(),
        lastVerified: new Date().toISOString(),
        history: [{
          version: 1,
          timestamp: new Date().toISOString(),
          updatedBy: 'memory-engine',
          changes: ['fact-created'],
        }],
      };
      await fs.mkdir(path.dirname(factPath), { recursive: true });
      await fs.writeFile(factPath, JSON.stringify(newFact, null, 2), 'utf-8');
      return newFact;
    }
  }

  /**
   * Register or update a source.
   */
  async registerSource(source: SourceMemory): Promise<SourceMemory> {
    const sourceId = source.publisher.toLowerCase().replace(/\s+/g, '-');
    const sourcePath = path.join(this.storePath, 'sources', `${sourceId}.json`);

    try {
      const existing = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));
      const updated: SourceMemory = {
        ...existing,
        lastUsed: new Date().toISOString(),
        stories: [...new Set([...(existing.stories || []), ...(source.stories || [])])],
        version: existing.version + 1,
        history: [
          ...(existing.history || []),
          {
            version: existing.version + 1,
            timestamp: new Date().toISOString(),
            updatedBy: 'memory-engine',
            changes: ['source-updated'],
          },
        ],
      };
      await fs.writeFile(sourcePath, JSON.stringify(updated, null, 2), 'utf-8');
      return updated;
    } catch {
      const newSource: SourceMemory = {
        ...source,
        id: sourceId,
        version: 1,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        history: [{
          version: 1,
          timestamp: new Date().toISOString(),
          updatedBy: 'memory-engine',
          changes: ['source-created'],
        }],
      };
      await fs.mkdir(path.dirname(sourcePath), { recursive: true });
      await fs.writeFile(sourcePath, JSON.stringify(newSource, null, 2), 'utf-8');
      return newSource;
    }
  }

  /**
   * Store a story record.
   */
  async storeStory(story: StoryMemory): Promise<void> {
    const storyPath = path.join(this.storePath, 'stories', `${story.storyId}.json`);
    await fs.mkdir(path.dirname(storyPath), { recursive: true });

    const record = {
      ...story,
      storedAt: new Date().toISOString(),
      version: 1,
    };

    await fs.writeFile(storyPath, JSON.stringify(record, null, 2), 'utf-8');
  }

  /**
   * Cache related story links alongside the story record.
   */
  async storeRelatedStories(storyId: string, related: { stories: string[]; laws: string[]; budgets: string[]; organizations: string[]; people: string[]; countries: string[]; events: string[] }): Promise<void> {
    const storyPath = path.join(this.storePath, 'stories', `${storyId}.json`);

    try {
      const existing = JSON.parse(await fs.readFile(storyPath, 'utf-8'));
      existing.related = related;
      existing.version += 1;
      existing.updatedAt = new Date().toISOString();
      await fs.writeFile(storyPath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch {
      // Story file doesn't exist — nothing to attach to
    }
  }

  /**
   * Read an entity by its canonical ID.
   */
  async readEntity(id: string): Promise<EntityMemory | null> {
    const category = id.split('-')[0];
    const filePath = path.join(this.storePath, this.categoryToDir(category), `${id}.json`);

    try {
      return JSON.parse(await fs.readFile(filePath, 'utf-8'));
    } catch {
      // Try scanning all directories
      return this.scanForEntity(id);
    }
  }

  /**
   * Write an entity file.
   */
  async writeEntity(id: string, entity: EntityMemory): Promise<void> {
    const category = entity.type || id.split('-')[0];
    const dir = path.join(this.storePath, this.categoryToDir(category));
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${id}.json`), JSON.stringify(entity, null, 2), 'utf-8');
  }

  /**
   * Count total entities across all categories.
   */
  async count(): Promise<number> {
    let total = 0;
    const categories = ['people', 'organizations', 'countries', 'laws', 'schemes', 'budgets', 'reports', 'court-cases', 'events', 'stories', 'relationships', 'sources', 'topics'];

    for (const cat of categories) {
      const dir = path.join(this.storePath, cat);
      try {
        const files = await fs.readdir(dir);
        total += files.filter(f => f.endsWith('.json')).length;
      } catch {
        // Directory doesn't exist yet
      }
    }

    return total;
  }

  /**
   * Health check — verify store is writable.
   */
  async health(): Promise<boolean> {
    try {
      await fs.access(this.storePath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private async findExisting(entity: EntityMemory): Promise<EntityMemory | null> {
    // 1. Check by ID
    const byId = await this.readEntity(entity.id);
    if (byId) return byId;

    // 2. Check by aliases (fuzzy)
    if (entity.aliases) {
      for (const alias of entity.aliases) {
        const byAlias = await this.scanByAlias(alias);
        if (byAlias) return byAlias;
      }
    }

    return null;
  }

  private async mergeEntity(existing: EntityMemory, incoming: EntityMemory, sourceStoryId?: string): Promise<EntityMemory> {
    const merged: EntityMemory = {
      ...existing,
      name: existing.name || incoming.name,
      aliases: [...new Set([...(existing.aliases || []), ...(incoming.aliases || [])])],
      roles: [...new Set([...(existing.roles || []), ...(incoming.roles || [])])],
      organizations: [...new Set([...(existing.organizations || []), ...(incoming.organizations || [])])],
      stories: [...new Set([...(existing.stories || []), ...(sourceStoryId ? [sourceStoryId] : []), ...(incoming.stories || [])])],
      timeline: [...(existing.timeline || []), ...(incoming.timeline || [])],
      sources: [...new Set([...(existing.sources || []), ...(incoming.sources || [])])],
      metadata: { ...(existing.metadata || {}), ...(incoming.metadata || {}) },
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      history: [
        ...(existing.history || []),
        {
          version: existing.version + 1,
          timestamp: new Date().toISOString(),
          updatedBy: sourceStoryId || 'memory-engine',
          changes: Object.keys(incoming).filter(k => k !== 'history' && k !== 'version'),
        },
      ],
    };

    await this.writeEntity(existing.id, merged);
    return merged;
  }

  private async scanForEntity(id: string): Promise<EntityMemory | null> {
    const categories = ['people', 'organizations', 'countries', 'laws', 'schemes', 'budgets', 'reports', 'court-cases', 'events', 'topics'];

    for (const cat of categories) {
      const dir = path.join(this.storePath, cat);
      try {
        const content = await fs.readFile(path.join(dir, `${id}.json`), 'utf-8');
        return JSON.parse(content);
      } catch {
        continue;
      }
    }

    return null;
  }

  private async scanByAlias(alias: string): Promise<EntityMemory | null> {
    const categories = ['people', 'organizations', 'countries', 'laws', 'schemes', 'budgets', 'reports', 'court-cases', 'events', 'topics'];

    for (const cat of categories) {
      const dir = path.join(this.storePath, cat);
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          const content = JSON.parse(await fs.readFile(path.join(dir, file), 'utf-8'));
          if (content.aliases?.some((a: string) => a.toLowerCase() === alias.toLowerCase())) {
            return content;
          }
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  private relationshipPath(from: string, type: string, to: string): string {
    const safe = (s: string) => s.replace(/[^a-z0-9-]/gi, '_');
    return path.join(this.storePath, 'relationships', `${safe(from)}__${safe(type)}__${safe(to)}.json`);
  }

  private generateFactId(fact: FactMemory): string {
    const hash = simpleHash(fact.statement);
    return `fact-${hash}`;
  }

  private categoryToDir(category: string): string {
    const map: Record<string, string> = {
      person: 'people',
      organization: 'organizations',
      country: 'countries',
      law: 'laws',
      scheme: 'schemes',
      budget: 'budgets',
      report: 'reports',
      'court-case': 'court-cases',
      event: 'events',
      topic: 'topics',
    };
    return map[category] || category;
  }
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}
