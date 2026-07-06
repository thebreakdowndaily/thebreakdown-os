import type { SearchIndexEntry } from '@/types/canonical';
import type { Services } from '@/services/registry';

export interface SearchPageViewModel {
  query: string;
  results: SearchIndexEntry[];
  total: number;
  grouped: {
    stories: SearchIndexEntry[];
    topics: SearchIndexEntry[];
    entities: SearchIndexEntry[];
    organizations: SearchIndexEntry[];
    countries: SearchIndexEntry[];
    timelines: SearchIndexEntry[];
    fixes: SearchIndexEntry[];
    other: SearchIndexEntry[];
  };
}

export function buildSearchPage(services: Services, query: string): SearchPageViewModel {
  const response = services.search.search(query);
  const results = response.data;
  const grouped: SearchPageViewModel['grouped'] = {
    stories: [],
    topics: [],
    entities: [],
    organizations: [],
    countries: [],
    timelines: [],
    fixes: [],
    other: [],
  };
  for (const entry of results) {
    if (entry.type === 'organization') grouped.organizations.push(entry);
    else if (entry.type === 'country') grouped.countries.push(entry);
    else if (entry.type in grouped) (grouped as Record<string, SearchIndexEntry[]>)[entry.type].push(entry);
    else grouped.other.push(entry);
  }
  return {
    query,
    results,
    total: response.meta?.total ?? results.length,
    grouped,
  };
}
