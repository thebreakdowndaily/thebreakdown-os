/**
 * THE BREAKDOWN OS — Memory Engine Indexer
 *
 * Builds and maintains search indices across all memory stores.
 * Supports full-text search, entity lookup, and cross-category queries.
 *
 * Indices:
 *   - entity-name:   name → entity ID mapping (fuzzy)
 *   - entity-alias:  alias → entity ID mapping
 *   - full-text:     term → document IDs (inverted index)
 *   - category:      category → entity IDs
 *   - date:          date → event/story/entity IDs
 *   - tag:           tag → entity IDs
 */

import type { EntityMemory, StoryMemory, IndexEntry, IndexConfig } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class Indexer {
  private config: IndexConfig;
  private indexDir: string;

  // In-memory indices (persisted to disk)
  private entityNameIndex: Map<string, Set<string>> = new Map();
  private aliasIndex: Map<string, Set<string>> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();
  private dateIndex: Map<string, Set<string>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();

  constructor(config: IndexConfig) {
    this.config = config;
    this.indexDir = path.join(config.storePath, '.index');
  }

  /**
   * Initialize: load existing indices from disk.
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.indexDir, { recursive: true });
      await this.loadIndex('entity-name', this.entityNameIndex);
      await this.loadIndex('alias', this.aliasIndex);
      await this.loadIndex('inverted', this.invertedIndex);
      await this.loadIndex('category', this.categoryIndex);
      await this.loadIndex('date', this.dateIndex);
      await this.loadIndex('tag', this.tagIndex);
    } catch {
      // First run — no indices to load
    }
  }

  /**
   * Index a published story: extract all searchable terms.
   */
  async indexStory(story: StoryMemory): Promise<void> {
    const terms = this.tokenize(`${story.headline} ${story.summary || ''}`);
    const docId = `story:${story.storyId}`;

    for (const term of terms) {
      this.addToIndex(this.invertedIndex, term, docId);
    }

    // Index by category
    for (const topic of story.topics || []) {
      this.addToIndex(this.categoryIndex, topic, docId);
    }

    // Index by date
    if (story.publishedAt) {
      const dateKey = story.publishedAt.substring(0, 10); // YYYY-MM-DD
      this.addToIndex(this.dateIndex, dateKey, docId);
    }

    // Index tags
    for (const tag of story.tags || []) {
      this.addToIndex(this.tagIndex, tag, docId);
    }

    await this.persistIndex('inverted', this.invertedIndex);
    await this.persistIndex('category', this.categoryIndex);
    await this.persistIndex('date', this.dateIndex);
    await this.persistIndex('tag', this.tagIndex);
  }

  /**
   * Index an entity: name, aliases, roles, categories.
   */
  async indexEntity(entity: EntityMemory): Promise<void> {
    const entityId = entity.id;

    // Index by primary name
    const nameTokens = this.tokenize(entity.name);
    for (const token of nameTokens) {
      this.addToIndex(this.entityNameIndex, token, entityId);
    }

    // Index by aliases
    for (const alias of entity.aliases || []) {
      this.addToIndex(this.aliasIndex, alias.toLowerCase(), entityId);
      const aliasTokens = this.tokenize(alias);
      for (const token of aliasTokens) {
        this.addToIndex(this.entityNameIndex, token, entityId);
      }
    }

    // Index by category
    this.addToIndex(this.categoryIndex, entity.type, entityId);

    // Index by tags
    for (const tag of entity.tags || []) {
      this.addToIndex(this.tagIndex, tag, entityId);
    }

    // Persist
    await this.persistIndex('entity-name', this.entityNameIndex);
    await this.persistIndex('alias', this.aliasIndex);
    await this.persistIndex('category', this.categoryIndex);
    await this.persistIndex('tag', this.tagIndex);
  }

  /**
   * Index multiple entities at once (batch).
   */
  async indexEntities(entities: EntityMemory[]): Promise<void> {
    for (const entity of entities) {
      await this.indexEntity(entity);
    }
  }

  /**
   * Search the entity name index with fuzzy matching.
   */
  searchByName(query: string): string[] {
    const tokens = this.tokenize(query);
    const results = new Set<string>();

    for (const token of tokens) {
      const exact = this.entityNameIndex.get(token);
      if (exact) {
        exact.forEach(id => results.add(id));
      }

      // Fuzzy match: find keys that start with the token
      for (const [key, ids] of this.entityNameIndex.entries()) {
        if (this.fuzzyMatch(token, key, this.config.fuzzyThreshold || 0.85)) {
          ids.forEach(id => results.add(id));
        }
      }
    }

    return Array.from(results);
  }

  /**
   * Search by alias (exact match).
   */
  searchByAlias(alias: string): string[] {
    const result = this.aliasIndex.get(alias.toLowerCase());
    return result ? Array.from(result) : [];
  }

  /**
   * Full-text search across all indexed documents.
   */
  searchFullText(query: string): string[] {
    const tokens = this.tokenize(query);
    const results = new Map<string, number>(); // docId → score

    for (const token of tokens) {
      const docs = this.invertedIndex.get(token);
      if (docs) {
        for (const docId of docs) {
          results.set(docId, (results.get(docId) || 0) + 1);
        }
      }
    }

    // Sort by score descending
    return Array.from(results.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([docId]) => docId);
  }

  /**
   * Get all entities of a given category.
   */
  getByCategory(category: string): string[] {
    const result = this.categoryIndex.get(category);
    return result ? Array.from(result) : [];
  }

  /**
   * Remove an entity from all indices (soft/hard delete).
   */
  async removeFromIndex(entityId: string): Promise<void> {
    // Remove from all in-memory indices
    for (const index of [this.entityNameIndex, this.aliasIndex, this.categoryIndex, this.tagIndex]) {
      for (const [key, ids] of index.entries()) {
        if (ids.has(entityId)) {
          ids.delete(entityId);
          if (ids.size === 0) index.delete(key);
        }
      }
    }

    // Persist
    await this.persistIndex('entity-name', this.entityNameIndex);
    await this.persistIndex('alias', this.aliasIndex);
    await this.persistIndex('category', this.categoryIndex);
    await this.persistIndex('tag', this.tagIndex);
  }

  /**
   * Health check.
   */
  async health(): Promise<boolean> {
    try {
      await fs.access(this.indexDir);
      return true;
    } catch {
      return false;
    }
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOP_WORDS.has(t));
  }

  private fuzzyMatch(a: string, b: string, threshold: number): boolean {
    if (a === b) return true;
    if (a.includes(b) || b.includes(a)) return true;

    const distance = this.levenshteinDistance(a, b);
    const maxLen = Math.max(a.length, b.length);
    return 1 - distance / maxLen >= threshold;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  private addToIndex(index: Map<string, Set<string>>, key: string, value: string): void {
    if (!index.has(key)) index.set(key, new Set());
    index.get(key)!.add(value);
  }

  private async loadIndex(name: string, target: Map<string, Set<string>>): Promise<void> {
    const filePath = path.join(this.indexDir, `${name}.json`);
    try {
      const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      for (const [key, values] of Object.entries(data)) {
        target.set(key, new Set(values as string[]));
      }
    } catch {
      // File doesn't exist yet
    }
  }

  private async persistIndex(name: string, source: Map<string, Set<string>>): Promise<void> {
    const filePath = path.join(this.indexDir, `${name}.json`);
    const data: Record<string, string[]> = {};
    for (const [key, values] of source.entries()) {
      data[key] = Array.from(values);
    }
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'some', 'same',
  'also', 'than', 'that', 'this', 'what', 'when', 'where', 'which', 'their',
  'there', 'these', 'they', 'with', 'would', 'could', 'should', 'about',
]);
