/**
 * THE BREAKDOWN OS — Knowledge Graph Updater
 *
 * Ingests stories into the Knowledge Graph:
 *   1. Extract entities from the story
 *   2. Create/update nodes for each entity
 *   3. Create edges based on relationships mentioned
 *   4. Run inference for implied relationships
 *   5. Batch persist to disk
 *
 * Called by the orchestrator's `knowledge-graph` step
 * after the `memory` step ingests a story.
 */

import { EntityManager } from './entity-manager';
import { RelationshipManager } from './relationship-manager';
import type { GraphNode, GraphEdge, GraphConfig } from './types';

export class GraphUpdater {
  private entities: EntityManager;
  private relationships: RelationshipManager;
  private config: GraphConfig;

  constructor(config: GraphConfig, entities: EntityManager, relationships: RelationshipManager) {
    this.config = config;
    this.entities = entities;
    this.relationships = relationships;
  }

  /**
   * Ingest a story into the Knowledge Graph.
   * Called after a story is published and the Memory Engine has stored it.
   */
  async ingestStory(story: StoryInput): Promise<IngestReport> {
    const report: IngestReport = {
      nodesCreated: 0,
      nodesUpdated: 0,
      edgesCreated: 0,
      edgesUpdated: 0,
      errors: [],
    };

    try {
      // 1. Extract entities from story content
      const entities = this.extractEntities(story);

      // 2. Extract relationships from story content
      const relationships = this.extractRelationships(story);

      // 3. Create/update nodes
      for (const entity of entities) {
        try {
          const nodeKey = this.makeNodeKey(entity.type, entity.label);
          const existingNode = await this.entities.get(nodeKey);

          if (existingNode) {
            await this.entities.update(nodeKey, {
              ...entity,
              storyCount: (existingNode.storyCount || 0) + 1,
            });
            report.nodesUpdated++;
          } else {
            await this.entities.create({
              id: nodeKey,
              ...entity,
            });
            report.nodesCreated++;
          }
        } catch (err: any) {
          report.errors.push(`Failed to process entity '${entity.label}': ${err.message}`);
        }
      }

      // 4. Create edges
      for (const rel of relationships) {
        try {
          const fromNode = await this.entities.get(rel.from);
          const toNode = await this.entities.get(rel.to);

          if (!fromNode) {
            report.errors.push(`Cannot create edge: source node '${rel.from}' not found`);
            continue;
          }
          if (!toNode) {
            report.errors.push(`Cannot create edge: target node '${rel.to}' not found`);
            continue;
          }

          try {
            await this.relationships.create({
              from: rel.from,
              to: rel.to,
              relationship: rel.relationship,
              confidence: rel.confidence || 0.85,
              weight: rel.weight || 1.0,
              sources: rel.sources || [story.url],
              metadata: rel.metadata || {},
            });
            report.edgesCreated++;
          } catch {
            // Edge exists — update confidence/weight
            const existingEdges = await this.relationships.query({
              from: rel.from,
              relationship: rel.relationship,
              to: rel.to,
            });
            if (existingEdges.length > 0) {
              const existing = existingEdges[0];
              await this.relationships.create({
                from: existing.from,
                to: existing.to,
                relationship: existing.relationship,
                confidence: Math.max(existing.confidence, rel.confidence || 0.85),
                weight: (existing.weight || 1.0) + (rel.weight || 1.0),
                sources: [...new Set([...(existing.sources || []), ...(rel.sources || [story.url])])],
                metadata: { ...(existing.metadata || {}), ...(rel.metadata || {}) },
              });
              report.edgesUpdated++;
            }
          }
        } catch (err: any) {
          report.errors.push(`Failed to create edge: ${err.message}`);
        }
      }

      // 5. Run transitive inference (depth 2)
      try {
        const inference = await this.runInference();
        report.inferredEdges = inference.inferred;
        report.inferenceErrors = inference.errors;
      } catch (err: any) {
        report.errors.push(`Inference failed: ${err.message}`);
      }

    } catch (err: any) {
      report.errors.push(`Story ingestion failed: ${err.message}`);
    }

    return report;
  }

  /**
   * Run transitive closure inference across the graph.
   * e.g., A → implements → B → managed_by → C  =>  A → managed_by → C
   */
  async runInference(): Promise<{ inferred: number; errors: string[] }> {
    let inferred = 0;
    const errors: string[] = [];

    const transitiveRelationships: Array<{ via: string; infer: string }> = [
      { via: 'implements',      infer: 'references'    },
      { via: 'references',      infer: 'related_to'    },
      { via: 'managed_by',      infer: 'reports_to'    },
      { via: 'member_of',       infer: 'reports_to'    },
      { via: 'funded_by',       infer: 'regulated_by'  },
      { via: 'located_in',      infer: 'related_to'    },
    ];

    for (const rule of transitiveRelationships) {
      try {
        const viaEdges = await this.relationships.getByType(rule.via);
        const edgeMap = new Map<string, Array<{ from: string; to: string; sources: string[] }>>();

        // Group edges by source node
        for (const edge of viaEdges) {
          if (!edge.active) continue;
          if (!edgeMap.has(edge.from)) edgeMap.set(edge.from, []);
          edgeMap.get(edge.from)!.push({
            from: edge.from,
            to: edge.to,
            sources: edge.sources || [],
          });
        }

        // For each chain A →via→ B, check if B has outgoing via edges
        for (const [fromId, outgoing] of edgeMap) {
          for (const outEdge of outgoing) {
            const nextEdges = edgeMap.get(outEdge.to) || [];
            for (const nextEdge of nextEdges) {
              // A →infer→ C
              const inferEdgeId = `${sanitizeId(fromId)}|${rule.infer}|${sanitizeId(nextEdge.to)}`;
              const existing = await this.relationships.query({
                from: fromId,
                relationship: rule.infer,
                to: nextEdge.to,
              });

              if (existing.length === 0) {
                // Only infer if the edge doesn't already exist
                const fromNode = await this.entities.get(fromId);
                const toNode = await this.entities.get(nextEdge.to);
                if (fromNode && toNode) {
                  await this.relationships.create({
                    from: fromId,
                    to: nextEdge.to,
                    relationship: rule.infer,
                    confidence: 0.5, // Inferred edges start at lower confidence
                    weight: 0.5,
                    sources: [...new Set([...(outEdge.sources || []), ...(nextEdge.sources || [])])],
                    metadata: { inferred: true, via: rule.via, chain: [fromId, outEdge.to, nextEdge.to] },
                  });
                  inferred++;
                }
              }
            }
          }
        }
      } catch (err: any) {
        errors.push(`Transitive inference for '${rule.via}→${rule.infer}' failed: ${err.message}`);
      }
    }

    return { inferred, errors };
  }

  /**
   * Decay confidence for stale edges.
   * Called periodically (e.g., nightly).
   */
  async decayStaleEdges(maxAgeDays: number = 90): Promise<number> {
    let decayed = 0;
    const now = Date.now();
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

    const allEdges = await this.relationships.query({});
    for (const edge of allEdges) {
      const lastObserved = new Date(edge.lastObserved || edge.firstObserved || now).getTime();
      const age = now - lastObserved;

      if (age > maxAge) {
        const ageFactor = Math.min(1, age / (maxAge * 2));
        const decayedConfidence = edge.confidence * (1 - ageFactor * 0.5);
        if (decayedConfidence < 0.1) {
          // Mark as inactive if confidence is too low
          await this.relationships.delete(edge.id);
        } else {
          await this.relationships.create({
            from: edge.from,
            to: edge.to,
            relationship: edge.relationship,
            confidence: decayedConfidence,
            weight: edge.weight,
            sources: edge.sources,
            metadata: { ...(edge.metadata || {}), decayed: true, decayFactor: ageFactor },
          });
        }
        decayed++;
      }
    }

    return decayed;
  }

  // ── Private: Entity Extraction ────────────────────────────────────────

  private extractEntities(story: StoryInput): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const seen = new Set<string>();

    // From explicit story entities
    for (const entity of (story.entities || [])) {
      const key = this.makeNodeKey(entity.type, entity.label);
      if (!seen.has(key)) {
        seen.add(key);
        entities.push({
          id: key,
          type: entity.type,
          label: entity.label,
          description: entity.description || '',
          aliases: entity.aliases || [],
          metadata: entity.metadata || {},
          storyCount: 1,
        });
      }
    }

    // Parse story content for named entities
    const content = `${story.title || ''} ${story.summary || ''} ${story.body || ''}`;
    const extractedNames = this.extractNamedEntities(content);

    for (const extracted of extractedNames) {
      const key = this.makeNodeKey(extracted.type, extracted.label);
      if (!seen.has(key)) {
        seen.add(key);
        entities.push({
          id: key,
          type: extracted.type,
          label: extracted.label,
          description: '',
          aliases: [extracted.label],
          metadata: { extracted_from: story.url || '', extraction_method: 'text_parse' },
          storyCount: 1,
        });
      }
    }

    return entities;
  }

  /**
   * Simple named entity extraction from text.
   * This is a basic implementation — the orchestrator's entity-extraction step
   * runs a dedicated agent for this. The graph updater's version is
   * a lightweight fallback for relationship mapping.
   */
  private extractNamedEntities(text: string): Array<{ label: string; type: string }> {
    // Look for known patterns
    const entities: Array<{ label: string; type: string }> = [];
    const lower = text.toLowerCase();

    // Detect schemes (uppercase acronyms with years)
    const schemePattern = /\b([A-Z]{2,10})\s*(\d{4})?\b/g;
    let match;
    while ((match = schemePattern.exec(text)) !== null) {
      const acronym = match[1];
      if (this.isLikelyScheme(acronym)) {
        entities.push({ label: acronym, type: 'scheme' });
      }
    }

    // Detect budget references
    if (/\bbudget\b/i.test(text) || /\bfiscal\s*year\b/i.test(text)) {
      const fyMatch = text.match(/(?:FY|budget)\s*(\d{4})-(\d{2})/i);
      if (fyMatch) {
        entities.push({ label: `Budget ${fyMatch[1]}-${fyMatch[2]}`, type: 'budget' });
      }
    }

    // Detect ministry references
    const ministryPattern = /Ministry\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g;
    while ((match = ministryPattern.exec(text)) !== null) {
      entities.push({ label: `Ministry of ${match[1].trim()}`, type: 'organization' });
    }

    // Detect law references (Act, Bill)
    const lawPattern = /([A-Z][A-Za-z\s,]+(?:Act|Bill))\b/g;
    while ((match = lawPattern.exec(text)) !== null) {
      entities.push({ label: match[1].trim(), type: 'law' });
    }

    return entities;
  }

  private isLikelyScheme(acronym: string): boolean {
    const knownSchemes = new Set([
      'PMKVY', 'PMGDISHA', 'MGNREGA', 'PMFBY', 'PM-KISAN', 'PMJJBY',
      'PMSBY', 'APY', 'PMSSY', 'PMGSY', 'HRIDAY', 'AMRUT', 'SBM',
      'DAY-NULM', 'PMKSY', 'RKVY', 'MIDH', 'NMSA', 'NHM', 'NRHM',
      'SSA', 'RMSA', 'RUSA', 'TEQIP', 'MCM', 'UGC', 'AICTE', 'NTA',
      'PMKVY', 'NSQF', 'CPS', 'UDAY', 'IPDS', 'DDUGJY', 'SAUBHAGYA',
      'MUDRA', 'SIDBI', 'NHB', 'RBI', 'SEBI', 'IRDAI', 'LIC', 'BSNL',
    ]);
    return knownSchemes.has(acronym.toUpperCase());
  }

  // ── Private: Relationship Extraction ──────────────────────────────────

  private extractRelationships(story: StoryInput): ExtractedRelationship[] {
    const relationships: ExtractedRelationship[] = [];
    const content = `${story.title || ''} ${story.summary || ''} ${story.body || ''}`;

    // From explicit story relationships
    for (const rel of (story.relationships || [])) {
      relationships.push({
        from: rel.from,
        to: rel.to,
        relationship: rel.type,
        confidence: rel.confidence || 0.85,
        weight: rel.weight || 1.0,
        sources: rel.sources || [story.url || ''],
        metadata: rel.metadata || {},
      });
    }

    // From story category
    if (story.category === 'budget') {
      relationships.push({
        from: this.makeNodeKey('budget', story.title),
        to: this.makeNodeKey('country', 'India'),
        relationship: 'references',
        confidence: 0.9,
        weight: 1.0,
        sources: [story.url || ''],
        metadata: {},
      });
    }

    if (story.category === 'policy' || story.category === 'government') {
      relationships.push({
        from: this.makeNodeKey('article', story.title),
        to: this.makeNodeKey('policy', story.title),
        relationship: 'references',
        confidence: 0.8,
        weight: 1.0,
        sources: [story.url || ''],
        metadata: {},
      });
    }

    return relationships;
  }

  // ── Private: Utilities ────────────────────────────────────────────────

  private makeNodeKey(type: string, label: string): string {
    return `${type}::${sanitizeId(label)}`;
  }
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-z0-9|_-]/gi, '_').toLowerCase();
}

// ── Types ───────────────────────────────────────────────────────────────

export interface StoryInput {
  id?: string;
  title?: string;
  url?: string;
  summary?: string;
  body?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  entities?: Array<{
    type: string;
    label: string;
    description?: string;
    aliases?: string[];
    metadata?: Record<string, any>;
  }>;
  relationships?: Array<{
    from: string;
    to: string;
    type: string;
    confidence?: number;
    weight?: number;
    sources?: string[];
    metadata?: Record<string, any>;
  }>;
}

export interface ExtractedEntity {
  id: string;
  type: string;
  label: string;
  description?: string;
  aliases?: string[];
  metadata?: Record<string, any>;
  storyCount: number;
}

export interface ExtractedRelationship {
  from: string;
  to: string;
  relationship: string;
  confidence: number;
  weight: number;
  sources: string[];
  metadata: Record<string, any>;
}

export interface IngestReport {
  nodesCreated: number;
  nodesUpdated: number;
  edgesCreated: number;
  edgesUpdated: number;
  inferredEdges?: number;
  inferenceErrors?: string[];
  errors: string[];
}
