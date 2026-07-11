import type { KnowledgeSearch, SearchBuilder } from './builder';

export class SearchQualityBuilder implements SearchBuilder {
  async build(search: KnowledgeSearch): Promise<KnowledgeSearch> {
    const rawResults = search.rawResults || [];
    const exactMatch = !!search.spotlight;
    const confidence = search.intent?.confidence || 0;
    const coverage = Math.min(100, rawResults.length * 10);
    
    let reason = 'Standard search results';
    if (exactMatch) {
      reason = `Exact match found for ${search.intent?.primaryType}`;
    } else if (confidence > 50) {
      reason = 'High confidence semantic grouping';
    } else if (rawResults.length === 0) {
      reason = 'No results found';
    }

    search.quality = {
      exactMatch,
      confidence,
      coverage,
      reason
    };

    return search;
  }
}
