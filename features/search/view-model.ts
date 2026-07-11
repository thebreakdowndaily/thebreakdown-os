import type { SearchIndexEntry, SearchTerminalViewModel } from '@/types/canonical';
import type { Services } from '@/services/registry';
import { KnowledgeSearchPipeline } from '@/services/search/pipeline';
import { IntentResolver } from '@/services/search/pipeline/intent';
import { KnowledgeSpotlight } from '@/services/search/pipeline/spotlight';
import { SearchGroupingBuilder } from '@/services/search/pipeline/grouping';
import { SearchSuggestionsBuilder } from '@/services/search/pipeline/suggestions';
import { SearchQualityBuilder } from '@/services/search/pipeline/quality';

export async function buildSearchPage(services: Services, query: string, typeFilter?: string): Promise<SearchTerminalViewModel> {
  let results: SearchIndexEntry[] = [];
  let total = 0;

  if (query.trim()) {
    const res = typeFilter
      ? services.search.searchByType(query, typeFilter, { page: 1, pageSize: 20 })
      : services.search.search(query, { page: 1, pageSize: 20 });
    results = res.data;
    total = res.meta?.total ?? 0;
  }

  const pipeline = new KnowledgeSearchPipeline()
    .add(new IntentResolver())
    .add(new KnowledgeSpotlight())
    .add(new SearchGroupingBuilder())
    .add(new SearchSuggestionsBuilder())
    .add(new SearchQualityBuilder());

  const searchViewModel = await pipeline.execute(query, results);

  return {
    query,
    intent: searchViewModel.intent || { primaryType: 'Unknown', confidence: 0 },
    spotlight: searchViewModel.spotlight,
    results,
    grouped: searchViewModel.groupedResults || {
      latestStories: [], entities: [], topics: [], documents: [], media: []
    },
    suggestions: searchViewModel.suggestions || {
      relatedSearches: [], relatedTopics: [], relatedEntities: []
    },
    quality: searchViewModel.quality || {
      exactMatch: false, confidence: 0, coverage: 0, reason: ''
    },
    total
  };
}
