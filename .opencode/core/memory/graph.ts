/**
 * THE BREAKDOWN OS — Memory Engine Knowledge Graph
 *
 * Manages the knowledge graph: entities, relationships, and graph traversal.
 *
 * Operations:
 *   - updateFromStory:        Ingest all relationships from a story into the graph
 *   - findRelatedStories:     Traverse the graph to find related content
 *   - getEntityTimeline:      Build a chronological timeline for an entity
 *   - getAllEvents:           Return all stored events
 *   - findPath:               Find a path between two entities
 *   - getNeighbors:           Get all directly connected entities
 *   - getRelationship:        Get the relationship between two entities
 */

import type { EntityMemory, StoryMemory, RelationshipMemory, EventMemory } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class KnowledgeGraph {
  private storePath: string;
  private relationshipCache: Map<string, RelationshipMemory> = new Map();

  constructor(config: { storePath: string }) {
    this.storePath = config.storePath;
  }

  /**
   * Update the knowledge graph from a published story.
   * Extracts all entity → relationship → entity triples.
   */
  async updateFromStory(story: StoryMemory): Promise<void> {
    const relationships = story.relationships || [];

    for (const rel of relationships) {
      const key = this.relKey(rel.from, rel.relationship, rel.to);
      this.relationshipCache.set(key, {
        ...rel,
        version: 1,
        createdAt: new Date().toISOString(),
        lastObserved: new Date().toISOString(),
        firstObserved: new Date().toISOString(),
        active: true,
        history: [{
          version: 1,
          timestamp: new Date().toISOString(),
          updatedBy: story.storyId,
          changes: ['relationship-created-from-story'],
        }],
      });
    }

    // Persist new relationships
    await this.persistRelationships();
  }

  /**
   * Find stories, laws, budgets, organizations, people related to an entity or story.
   * Uses BFS traversal from the seed node up to depth 2.
   */
  async findRelatedStories(seedId: string, options?: { limit?: number }): Promise<RelatedResult> {
    const limit = options?.limit || 20;
    const result: RelatedResult = {
      stories: [],
      laws: [],
      budgets: [],
      organizations: [],
      people: [],
      countries: [],
      events: [],
    };

    // Load all relationships
    await this.loadRelationships();

    // BFS from seed
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: seedId, depth: 0 }];
    visited.add(seedId);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.depth > 2) continue; // Limit traversal depth

      const neighbors = this.getNeighbors(current.id).filter(n => !visited.has(n));
      for (const neighborId of neighbors) {
        visited.add(neighborId);
        queue.push({ id: neighborId, depth: current.depth + 1 });

        // Categorize by entity type
        const entity = await this.readEntityById(neighborId);
        if (entity) {
          switch (entity.type) {
            case 'story':
              if (result.stories.length < limit) result.stories.push(neighborId);
              break;
            case 'law':
              if (result.laws.length < limit) result.laws.push(neighborId);
              break;
            case 'budget':
              if (result.budgets.length < limit) result.budgets.push(neighborId);
              break;
            case 'organization':
              if (result.organizations.length < limit) result.organizations.push(neighborId);
              break;
            case 'person':
              if (result.people.length < limit) result.people.push(neighborId);
              break;
            case 'country':
              if (result.countries.length < limit) result.countries.push(neighborId);
              break;
            case 'event':
              if (result.events.length < limit) result.events.push(neighborId);
              break;
          }
        }
      }

      // Early exit if we have enough results
      if (result.stories.length + result.laws.length + result.budgets.length + result.organizations.length + result.people.length + result.countries.length + result.events.length >= limit * 3) {
        break;
      }
    }

    return result;
  }

  /**
   * Build a chronological timeline for a given entity.
   * Merges entity-level timeline with all events referencing the entity.
   */
  async getEntityTimeline(entityId: string): Promise<EventMemory[]> {
    const events: EventMemory[] = [];

    // 1. Get events from the entity's own timeline
    const entity = await this.readEntityById(entityId);
    if (entity?.timeline) {
      for (const entry of entity.timeline) {
        events.push({
          event: entry.event,
          date: entry.date,
          entities: [entityId],
          sources: entry.source ? [entry.source] : [],
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [],
        });
      }
    }

    // 2. Get all stored events that reference this entity
    const eventsDir = path.join(this.storePath, 'events');
    try {
      const eventFiles = await fs.readdir(eventsDir);
      for (const file of eventFiles) {
        if (!file.endsWith('.json')) continue;
        const event = JSON.parse(await fs.readFile(path.join(eventsDir, file), 'utf-8'));
        if (event.entities?.includes(entityId)) {
          events.push(event);
        }
      }
    } catch {
      // No events directory yet
    }

    // 3. Sort chronologically
    events.sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });

    return events;
  }

  /**
   * Return all stored events, sorted by date.
   */
  async getAllEvents(): Promise<EventMemory[]> {
    const events: EventMemory[] = [];
    const eventsDir = path.join(this.storePath, 'events');

    try {
      const eventFiles = await fs.readdir(eventsDir);
      for (const file of eventFiles) {
        if (!file.endsWith('.json')) continue;
        const event = JSON.parse(await fs.readFile(path.join(eventsDir, file), 'utf-8'));
        events.push(event);
      }
    } catch {
      return [];
    }

    events.sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });

    return events;
  }

  /**
   * Find the shortest path between two entities (BFS).
   */
  async findPath(from: string, to: string): Promise<string[] | null> {
    await this.loadRelationships();

    const visited = new Set<string>();
    const queue: Array<{ id: string; path: string[] }> = [{ id: from, path: [from] }];
    visited.add(from);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.id === to) return current.path;

      const neighbors = this.getNeighbors(current.id);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ id: neighbor, path: [...current.path, neighbor] });
        }
      }
    }

    return null; // No path found
  }

  /**
   * Get all entities directly connected to the given entity.
   */
  private getNeighbors(entityId: string): string[] {
    const neighbors = new Set<string>();

    for (const [key, rel] of this.relationshipCache.entries()) {
      if (rel.from === entityId && rel.to) {
        neighbors.add(rel.to);
      }
      if (rel.to === entityId && rel.from) {
        neighbors.add(rel.from);
      }
    }

    return Array.from(neighbors);
  }

  /**
   * Get the relationship between two entities.
   */
  async getRelationship(from: string, to: string): Promise<RelationshipMemory | null> {
    await this.loadRelationships();

    for (const rel of this.relationshipCache.values()) {
      if (rel.from === from && rel.to === to) return rel;
      if (rel.from === to && rel.to === from) return rel; // undirected lookup
    }

    return null;
  }

  /**
   * Health check.
   */
  async health(): Promise<boolean> {
    try {
      const relDir = path.join(this.storePath, 'relationships');
      await fs.access(relDir);
      return true;
    } catch {
      return false;
    }
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private relKey(from: string, type: string, to: string): string {
    return `${from}|${type}|${to}`;
  }

  private async loadRelationships(): Promise<void> {
    if (this.relationshipCache.size > 0) return; // Already loaded

    const relDir = path.join(this.storePath, 'relationships');
    try {
      const files = await fs.readdir(relDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const rel: RelationshipMemory = JSON.parse(await fs.readFile(path.join(relDir, file), 'utf-8'));
        const key = this.relKey(rel.from, rel.relationship, rel.to);
        this.relationshipCache.set(key, rel);
      }
    } catch {
      // No relationships yet
    }
  }

  private async persistRelationships(): Promise<void> {
    const relDir = path.join(this.storePath, 'relationships');
    await fs.mkdir(relDir, { recursive: true });

    for (const [key, rel] of this.relationshipCache.entries()) {
      const safe = key.replace(/[^a-z0-9|_-]/gi, '_');
      await fs.writeFile(path.join(relDir, `${safe}.json`), JSON.stringify(rel, null, 2), 'utf-8');
    }
  }

  private async readEntityById(id: string): Promise<EntityMemory | null> {
    const categories = ['people', 'organizations', 'countries', 'laws', 'schemes', 'budgets', 'reports', 'court-cases', 'events', 'topics', 'stories'];

    for (const cat of categories) {
      const filePath = path.join(this.storePath, cat, `${id}.json`);
      try {
        return JSON.parse(await fs.readFile(filePath, 'utf-8'));
      } catch {
        continue;
      }
    }

    return null;
  }
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
