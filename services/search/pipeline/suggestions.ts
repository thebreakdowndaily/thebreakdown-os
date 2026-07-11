import type { KnowledgeSearch, SearchBuilder } from './builder';

export class SearchSuggestionsBuilder implements SearchBuilder {
  async build(search: KnowledgeSearch): Promise<KnowledgeSearch> {
    const suggestions = {
      relatedSearches: [] as string[],
      relatedTopics: [] as string[],
      relatedEntities: [] as string[]
    };

    if (search.spotlight) {
      if (search.spotlight.type === 'Entity') {
        const entity = search.spotlight.data;
        if (entity.relationships) {
          suggestions.relatedEntities = entity.relationships.slice(0, 3).map((r: any) => r.targetId);
        }
      } else if (search.spotlight.type === 'Topic') {
        const topic = search.spotlight.data;
        suggestions.relatedTopics = [topic.name + ' context', topic.name + ' history'];
      }
    } else if (search.rawResults && search.rawResults.length > 0) {
      // synthesize from top results
      const topEntities = search.rawResults.filter(r => ['organization', 'person', 'country'].includes(r.type));
      suggestions.relatedEntities = topEntities.slice(0, 3).map(e => e.title);
    }

    search.suggestions = suggestions;
    return search;
  }
}
