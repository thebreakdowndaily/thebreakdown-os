/**
 * THE BREAKDOWN OS — Memory Engine Manager
 *
 * The Memory Engine is the newsroom's institutional memory.
 * It never writes stories. It never performs research.
 * It remembers everything the newsroom has learned.
 *
 * Every published story updates memory.
 * Every future story benefits from previous work.
 *
 * Public API:
 *   memory.search(query)            — semantic search across all memory
 *   memory.getEntity(id)            — retrieve a single entity
 *   memory.getTimeline(entityId)    — timeline for an entity or story
 *   memory.getRelatedStories(id)    — related stories engine
 *   memory.update(story)            — ingest a story into memory
 *   memory.delete(id)               — soft-delete an entity
 *   memory.version(id)              — version history for an entity
 */

import { Indexer } from './indexer';
import { Updater } from './updater';
import { SearchEngine } from './search';
import { KnowledgeGraph } from './graph';
import type {
  StoryMemory,
  EntityMemory,
  RelationshipMemory,
  EventMemory,
  SourceMemory,
  FactMemory,
  SearchResult,
  MemoryConfig,
} from './types';

export class MemoryEngine {
  private indexer: Indexer;
  private updater: Updater;
  private search: SearchEngine;
  private graph: KnowledgeGraph;
  private config: MemoryConfig;

  constructor(config: MemoryConfig) {
    this.config = config;
    this.indexer = new Indexer(config);
    this.updater = new Updater(config);
    this.search = new SearchEngine(config);
    this.graph = new KnowledgeGraph(config);
  }

  /**
   * Main entry point: ingest a published story into memory.
   *
   * Pipeline:
   *   1. Extract entities from story
   *   2. Extract relationships between entities
   *   3. Extract facts and claims
   *   4. Register sources
   *   5. Store story record
   *   6. Update knowledge graph
   *   7. Compute related stories
   *   8. Rebuild search index
   */
  async ingest(story: StoryMemory): Promise<IngestResult> {
    const startTime = Date.now();
    const result: IngestResult = { storyId: story.storyId, entities: [], relationships: [], facts: [], sources: [], errors: [] };

    try {
      // Step 1: Extract and upsert entities
      for (const entity of story.entities) {
        const updated = await this.updater.upsertEntity(entity, story.storyId);
        result.entities.push(updated.id);
      }

      // Step 2: Extract and upsert relationships
      for (const rel of story.relationships || []) {
        const updated = await this.updater.upsertRelationship(rel);
        result.relationships.push(`${rel.from}→${rel.relationship}→${rel.to}`);
      }

      // Step 3: Extract and store facts
      for (const fact of story.facts || []) {
        const stored = await this.updater.storeFact(fact);
        result.facts.push(stored.id || fact.statement.substring(0, 50));
      }

      // Step 4: Register sources
      for (const source of story.sources || []) {
        const registered = await this.updater.registerSource(source);
        result.sources.push(registered.publisher);
      }

      // Step 5: Store story record
      await this.updater.storeStory(story);

      // Step 6: Update knowledge graph
      await this.graph.updateFromStory(story);

      // Step 7: Compute and store related stories
      const related = await this.graph.findRelatedStories(story.storyId);
      await this.updater.storeRelatedStories(story.storyId, related);

      // Step 8: Rebuild search index for this story
      await this.indexer.indexStory(story);
      await this.indexer.indexEntities(story.entities);

      result.duration = Date.now() - startTime;
      return result;

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      return result;
    }
  }

  /**
   * Semantic search across all memory stores.
   * Every agent can call this.
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    return this.search.search(query, options);
  }

  /**
   * Retrieve a single entity by its canonical ID.
   */
  async getEntity(id: string): Promise<EntityMemory | null> {
    return this.updater.readEntity(id);
  }

  /**
   * Retrieve the timeline for an entity or a story.
   * Merges entity-level and event-level timelines chronologically.
   */
  async getTimeline(entityId?: string): Promise<EventMemory[]> {
    if (entityId) {
      return this.graph.getEntityTimeline(entityId);
    }
    return this.graph.getAllEvents();
  }

  /**
   * Find stories related to a given story, entity, or topic.
   * Uses the knowledge graph for traversal.
   */
  async getRelatedStories(id: string, options?: RelatedOptions): Promise<RelatedResult> {
    const related = await this.graph.findRelatedStories(id, options);

    return {
      stories: related.stories || [],
      laws: related.laws || [],
      budgets: related.budgets || [],
      organizations: related.organizations || [],
      people: related.people || [],
      countries: related.countries || [],
      events: related.events || [],
    };
  }

  /**
   * Update an existing memory entry. Never overwrites — creates a new version.
   */
  async update(id: string, data: Partial<EntityMemory>): Promise<EntityMemory> {
    const existing = await this.updater.readEntity(id);
    if (!existing) {
      throw new Error(`Entity ${id} not found`);
    }

    const updated: EntityMemory = {
      ...existing,
      ...data,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      history: [
        ...(existing.history || []),
        {
          version: existing.version + 1,
          timestamp: new Date().toISOString(),
          updatedBy: 'memory-engine',
          changes: Object.keys(data),
        },
      ],
    };

    await this.updater.writeEntity(id, updated);
    await this.indexer.indexEntity(updated);

    return updated;
  }

  /**
   * Soft-delete an entity. Marks as inactive but keeps history.
   */
  async delete(id: string): Promise<void> {
    const entity = await this.updater.readEntity(id);
    if (!entity) return;

    entity.active = false;
    entity.updatedAt = new Date().toISOString();
    entity.version += 1;
    entity.history.push({
      version: entity.version,
      timestamp: new Date().toISOString(),
      updatedBy: 'memory-engine',
      changes: ['soft-delete'],
    });

    await this.updater.writeEntity(id, entity);
    await this.indexer.removeFromIndex(id);
  }

  /**
   * Get version history for an entity.
   */
  async version(id: string): Promise<VersionHistory[]> {
    const entity = await this.updater.readEntity(id);
    return entity?.history || [];
  }

  /**
   * Before researching, check if memory already knows the answer.
   */
  async knows(topic: string): Promise<{ known: boolean; results: SearchResult[] }> {
    const results = await this.search.search(topic, { limit: 5, minConfidence: 0.7 });

    return {
      known: results.length > 0 && results[0].score > 0.8,
      results,
    };
  }

  /**
   * Health check — verifies all subsystems are operational.
   */
  async health(): Promise<HealthStatus> {
    return {
      status: 'operational',
      indexer: await this.indexer.health(),
      graph: await this.graph.health(),
      store: await this.updater.health(),
      lastIngest: this.config.lastIngest || null,
      totalEntities: await this.updater.count(),
    };
  }
}

export interface IngestResult {
  storyId: string;
  entities: string[];
  relationships: string[];
  facts: string[];
  sources: string[];
  duration?: number;
  errors: string[];
}

export interface SearchOptions {
  limit?: number;
  minConfidence?: number;
  categories?: string[];
}

export interface RelatedOptions {
  limit?: number;
  includeLaws?: boolean;
  includeBudgets?: boolean;
  includePeople?: boolean;
  includeOrganizations?: boolean;
  includeCountries?: boolean;
  includeEvents?: boolean;
}

export interface RelatedResult {
  stories: string[];
  laws: string[];
  budgets: string[];
  organizations: string[];
  people: string[];
  countries: string[];
  events: string[];
}

export interface VersionHistory {
  version: number;
  timestamp: string;
  updatedBy: string;
  changes: string[];
}

export interface HealthStatus {
  status: 'operational' | 'degraded' | 'down';
  indexer: boolean;
  graph: boolean;
  store: boolean;
  lastIngest: string | null;
  totalEntities: number;
}
