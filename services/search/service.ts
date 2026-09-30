import type { SearchIndexEntry, APIListParams, APIResponse, Story, Topic, Entity, Timeline, Fix, Dataset } from '@/types/canonical';
import type { Problem } from '@/lib/problem-helpers';

export interface SearchService {
  index(items: SearchIndexEntry[]): void;
  indexOne(item: SearchIndexEntry): void;
  search(query: string, params?: APIListParams): APIResponse<SearchIndexEntry[]>;
  searchByType(query: string, type: string, params?: APIListParams): APIResponse<SearchIndexEntry[]>;
  rebuild(stories: Story[], topics: Topic[], entities: Entity[], timelines: Timeline[], fixes: Fix[], datasets?: Dataset[], problems?: Problem[]): void;
}

function toEntry(id: string, type: SearchIndexEntry['type'], title: string, slug: string, description: string, tags: string[] | undefined, content: string, updatedAt: string): SearchIndexEntry {
  return {
    id,
    type,
    title: title || '',
    slug: slug || '',
    description: description || '',
    tags: Array.isArray(tags) ? tags : [],
    content: content || '',
    score: 0,
    updatedAt: updatedAt || '',
  };
}

function scoreEntry(entry: SearchIndexEntry, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  let score = 0;
  const title = (entry.title || '').toLowerCase();
  const desc = (entry.description || '').toLowerCase();
  const tags = Array.isArray(entry.tags) ? entry.tags : [];

  // Exact or prefix title match
  if (title === q) score += 50;
  else if (title.startsWith(q)) score += 25;
  else if (title.includes(q)) score += 10;

  // Exact alias/tag match (e.g. acronym queries like 'cag', 'sc', 'mgnrega')
  if (tags.some((t) => t.toLowerCase() === q)) score += 35;
  else if (tags.some((t) => t.toLowerCase().includes(q))) score += 5;

  if (desc.includes(q)) score += 5;
  if ((entry.content || '').toLowerCase().includes(q)) score += 1;
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

  rebuild(stories: Story[], topics: Topic[], entities: Entity[], timelines: Timeline[], fixes: Fix[], datasets?: Dataset[], problems?: Problem[]): void {
    this.entries = [];
    const items: SearchIndexEntry[] = [
      ...stories.map(s => toEntry(
        s.id,
        'story',
        s.title,
        s.slug,
        s.summary,
        Array.isArray(s.tags) ? s.tags : [],
        Array.isArray(s.blocks) ? s.blocks.map(b => JSON.stringify(b?.data || '')).join(' ') : '',
        s.updatedAt
      )),
      ...topics.map(t => toEntry(
        t.id,
        'topic',
        t.name,
        t.slug,
        t.description,
        [],
        t.overview || '',
        t.updatedAt
      )),
      ...entities.map(e => {
        let statsStr = '';
        if (Array.isArray(e.statistics)) {
          statsStr = e.statistics.map(s => `${s?.label || ''} ${s?.value || ''}`).join(' ');
        } else if (e.statistics && typeof e.statistics === 'object') {
          statsStr = Object.entries(e.statistics).map(([k, v]) => `${k} ${v}`).join(' ');
        }
        return toEntry(
          e.id,
          'entity',
          e.name,
          e.slug,
          e.description,
          Array.isArray(e.aliases) ? e.aliases : [],
          statsStr,
          e.updatedAt
        );
      }),
      ...timelines.map(t => toEntry(
        t.id,
        'timeline',
        t.title,
        '',
        t.description,
        [],
        Array.isArray(t.events) ? t.events.map(e => `${e?.title || ''} ${e?.description || ''}`).join(' ') : '',
        t.updatedAt
      )),
      ...fixes.map(f => toEntry(
        f.id,
        'fix',
        f.headline,
        f.slug,
        f.problem?.content || '',
        [],
        `${f.rootCauses?.content || ''} ${Array.isArray(f.recommendedActions) ? f.recommendedActions.map(a => a?.title || '').join(' ') : ''}`,
        f.updatedAt
      )),
      ...(datasets || []).map(d => toEntry(
        d.id,
        'dataset',
        d.title,
        d.slug,
        d.description,
        Array.isArray(d.tags) ? d.tags : [],
        `${Array.isArray(d.metrics) ? d.metrics.map(m => m?.label || '').join(' ') : ''} ${d.methodology || ''}`,
        d.updatedAt
      )),
      ...(problems || []).map(p => toEntry(
        p.slug,
        'problem',
        p.title,
        p.slug,
        p.description,
        Array.isArray(p.tags) ? p.tags : [],
        '',
        p.lastUpdated
      )),
    ];
    this.index(items);
  }
}
