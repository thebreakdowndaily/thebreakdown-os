import type { SearchIndexEntry, APIListParams, APIResponse, Story, Topic, Entity, Timeline, Fix, Dataset } from '@/types/canonical';

export interface SearchService {
  index(items: SearchIndexEntry[]): void;
  indexOne(item: SearchIndexEntry): void;
  search(query: string, params?: APIListParams): APIResponse<SearchIndexEntry[]>;
  searchByType(query: string, type: string, params?: APIListParams): APIResponse<SearchIndexEntry[]>;
  rebuild(stories: Story[], topics: Topic[], entities: Entity[], timelines: Timeline[], fixes: Fix[], datasets?: Dataset[]): void;
}

function toEntry(id: string, type: SearchIndexEntry['type'], title: string, slug: string, description: string, tags: string[], content: string, updatedAt: string): SearchIndexEntry {
  return { id, type, title, slug, description, tags, content, score: 0, updatedAt };
}

function scoreEntry(entry: SearchIndexEntry, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (entry.title.toLowerCase().includes(q)) score += 10;
  if (entry.description.toLowerCase().includes(q)) score += 5;
  if (entry.tags.some(t => t.toLowerCase().includes(q))) score += 3;
  if (entry.content.toLowerCase().includes(q)) score += 1;
  return score;
}

export class MemorySearchService implements SearchService {
  private entries: SearchIndexEntry[] = [];

  index(items: SearchIndexEntry[]): void {
    for (const item of items) {
      const existing = this.entries.findIndex(i => i.id === item.id && i.type === item.type);
      if (existing >= 0) {
        this.entries[existing] = item;
      } else {
        this.entries.push(item);
      }
    }
  }

  indexOne(item: SearchIndexEntry): void {
    this.index([item]);
  }

  search(query: string, params?: APIListParams): APIResponse<SearchIndexEntry[]> {
    if (!query.trim()) {
      return { data: [], meta: { total: 0, page: params?.page || 1, pageSize: params?.pageSize || 0 } };
    }
    let results = this.entries
      .map(e => ({ ...e, score: scoreEntry(e, query) }))
      .filter(e => e.score > 0)
      .sort((a, b) => b.score - a.score);
    const total = results.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      results = results.slice(start, start + params.pageSize);
    }
    return { data: results, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || results.length } };
  }

  searchByType(query: string, type: string, params?: APIListParams): APIResponse<SearchIndexEntry[]> {
    const all = this.search(query, { ...params, pageSize: undefined });
    const filtered = all.data.filter(e => e.type === type);
    const total = filtered.length;
    let page = filtered;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      page = page.slice(start, start + params.pageSize);
    }
    return { data: page, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || filtered.length } };
  }

  rebuild(stories: Story[], topics: Topic[], entities: Entity[], timelines: Timeline[], fixes: Fix[], datasets?: Dataset[]): void {
    this.entries = [];
    const items: SearchIndexEntry[] = [
      ...stories.map(s => toEntry(s.id, 'story', s.title, s.slug, s.summary, s.tags, s.blocks.map(b => JSON.stringify(b.data)).join(' '), s.updatedAt)),
      ...topics.map(t => toEntry(t.id, 'topic', t.name, t.slug, t.description, [], t.overview || '', t.updatedAt)),
      ...entities.map(e => toEntry(e.id, 'entity', e.name, e.slug, e.description, e.aliases, e.statistics.map(s => s.label + ' ' + s.value).join(' '), e.updatedAt)),
      ...timelines.map(t => toEntry(t.id, 'timeline', t.title, '', t.description, [], t.events.map(e => e.title + ' ' + e.description).join(' '), t.updatedAt)),
      ...fixes.map(f => toEntry(f.id, 'fix', f.title, f.slug, f.problem, [], f.rootCauses.join(' ') + ' ' + f.recommendedActions.map(a => a.action).join(' '), f.updatedAt)),
      ...(datasets || []).map(d => toEntry(d.id, 'dataset', d.title, d.slug, d.description, d.tags, d.metrics.map(m => m.label).join(' ') + ' ' + d.methodology, d.updatedAt)),
    ];
    this.index(items);
  }
}
