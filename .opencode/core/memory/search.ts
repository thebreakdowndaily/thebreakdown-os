/**
 * THE BREAKDOWN OS — Memory Engine Search
 *
 * Semantic search across all memory stores.
 * Every agent can call memory.search() and get instant results.
 *
 * Search modes:
 *   - full-text:   tokenized inverted index lookup
 *   - entity:      name/alias fuzzy match
 *   - category:    filter by entity type
 *   - date-range:  filter by time period
 *   - tag:         filter by tag
 *   - cross-category: search across all categories and return grouped results
 */

import { Indexer } from './indexer';
import { Updater } from './updater';
import type { EntityMemory, SearchResult, SearchOptions } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class SearchEngine {
  private indexer: Indexer;
  private updater: Updater;
  private storePath: string;

  constructor(config: { storePath: string }) {
    this.storePath = config.storePath;
    this.indexer = new Indexer(config as any);
    this.updater = new Updater(config);
  }

  /**
   * Main search API. Accepts a natural language query and optional filters.
   * Returns ranked results across all memory categories.
   *
   * Every agent in the system can call this.
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const limit = options?.limit || 50;
    const minConfidence = options?.minConfidence || 0.5;
    const categories = options?.categories;

    // 1. Full-text search across indexed documents
    const docResults = this.indexer.searchFullText(query);
    for (const docId of docResults.slice(0, limit)) {
      const result = await this.resolveDocResult(docId, query);
      if (result && result.score >= minConfidence) {
        results.push(result);
      }
    }

    // 2. Entity name/alias search
    const entityIds = this.indexer.searchByName(query);
    for (const entityId of entityIds.slice(0, limit)) {
      const entity = await this.updater.readEntity(entityId);
      if (entity) {
        if (categories && !categories.includes(entity.type)) continue;
        results.push({
          id: entity.id,
          type: 'entity',
          category: entity.type,
          title: entity.name,
          snippet: entity.aliases?.join(', ') || '',
          score: this.scoreEntityMatch(entity, query),
          entity: entity,
        });
      }
    }

    // 3. Category-specific search
    if (categories) {
      for (const category of categories) {
        const catIds = this.indexer.getByCategory(category);
        for (const id of catIds.slice(0, limit)) {
          const entity = await this.updater.readEntity(id);
          if (entity) {
            results.push({
              id: entity.id,
              type: 'entity',
              category: entity.type,
              title: entity.name,
              snippet: entity.aliases?.join(', ') || '',
              score: this.scoreEntityMatch(entity, query),
              entity: entity,
            });
          }
        }
      }
    }

    // 4. Cross-category: group and rank
    const grouped = this.groupByCategory(results);

    // 5. Sort by score, deduplicate by id
    const deduped = this.deduplicate(results);
    deduped.sort((a, b) => b.score - a.score);

    // 6. Apply limit
    return deduped.slice(0, limit);
  }

  /**
   * Cross-category search: returns grouped results for related-story sidebar.
   * Every story gets automatic recommendations.
   */
  async crossCategorySearch(query: string): Promise<CrossCategoryResult> {
    const results = await this.search(query, { limit: 100 });

    const grouped: CrossCategoryResult = {
      stories: [],
      people: [],
      organizations: [],
      countries: [],
      laws: [],
      schemes: [],
      budgets: [],
      reports: [],
      courtCases: [],
      events: [],
      topics: [],
    };

    for (const r of results) {
      switch (r.category) {
        case 'story': grouped.stories.push(r); break;
        case 'person': grouped.people.push(r); break;
        case 'organization': grouped.organizations.push(r); break;
        case 'country': grouped.countries.push(r); break;
        case 'law': grouped.laws.push(r); break;
        case 'scheme': grouped.schemes.push(r); break;
        case 'budget': grouped.budgets.push(r); break;
        case 'report': grouped.reports.push(r); break;
        case 'court-case': grouped.courtCases.push(r); break;
        case 'event': grouped.events.push(r); break;
        case 'topic': grouped.topics.push(r); break;
      }
    }

    return grouped;
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private async resolveDocResult(docId: string, query: string): Promise<SearchResult | null> {
    const [type, ...idParts] = docId.split(':');
    const id = idParts.join(':');

    if (type === 'story') {
      try {
        const storyPath = path.join(this.storePath, 'stories', `${id}.json`);
        const story = JSON.parse(await fs.readFile(storyPath, 'utf-8'));
        return {
          id: story.storyId,
          type: 'story',
          category: 'story',
          title: story.headline,
          snippet: story.summary || '',
          score: this.tfidfScore(query, `${story.headline} ${story.summary || ''}`),
          url: story.url,
          publishedAt: story.publishedAt,
        };
      } catch {
        return null;
      }
    }

    return null;
  }

  private scoreEntityMatch(entity: EntityMemory, query: string): number {
    let score = 0;
    const q = query.toLowerCase();

    // Exact name match
    if (entity.name.toLowerCase() === q) score += 1.0;
    else if (entity.name.toLowerCase().includes(q)) score += 0.8;

    // Alias match
    for (const alias of entity.aliases || []) {
      if (alias.toLowerCase() === q) { score += 0.9; break; }
      if (alias.toLowerCase().includes(q)) { score += 0.6; break; }
    }

    // Token overlap
    const queryTokens = new Set(q.split(/\s+/));
    const nameTokens = new Set(entity.name.toLowerCase().split(/\s+/));
    const overlap = [...queryTokens].filter(t => nameTokens.has(t)).length;
    score += overlap * 0.3;

    // Recency boost
    if (entity.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(entity.updatedAt).getTime()) / 86400000;
      if (daysSinceUpdate < 7) score += 0.2;
      else if (daysSinceUpdate < 30) score += 0.1;
    }

    // Story count boost
    const storyCount = entity.stories?.length || 0;
    if (storyCount > 10) score += 0.15;
    else if (storyCount > 5) score += 0.1;
    else if (storyCount > 0) score += 0.05;

    return Math.min(score, 1.0);
  }

  private tfidfScore(query: string, document: string): number {
    const queryTokens = query.toLowerCase().split(/\s+/);
    const docTokens = document.toLowerCase().split(/\s+/);

    let matchCount = 0;
    for (const qt of queryTokens) {
      if (docTokens.includes(qt)) matchCount++;
    }

    return Math.min(matchCount / queryTokens.length, 1.0);
  }

  private groupByCategory(results: SearchResult[]): Map<string, SearchResult[]> {
    const grouped = new Map<string, SearchResult[]>();
    for (const r of results) {
      const cat = r.category || 'unknown';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(r);
    }
    return grouped;
  }

  private deduplicate(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }
}

export interface CrossCategoryResult {
  stories: SearchResult[];
  people: SearchResult[];
  organizations: SearchResult[];
  countries: SearchResult[];
  laws: SearchResult[];
  schemes: SearchResult[];
  budgets: SearchResult[];
  reports: SearchResult[];
  courtCases: SearchResult[];
  events: SearchResult[];
  topics: SearchResult[];
}
