import type { KnowledgeSearch, SearchBuilder } from './builder';

export class SearchGroupingBuilder implements SearchBuilder {
  async build(search: KnowledgeSearch): Promise<KnowledgeSearch> {
    const rawResults = search.rawResults || [];
    
    const grouped = {
      latestStories: [] as any[],
      entities: [] as any[],
      topics: [] as any[],
      documents: [] as any[],
      media: [] as any[]
    };

    rawResults.forEach(r => {
      if (r.type === 'story') {
        grouped.latestStories.push(r);
      } else if (['organization', 'person', 'country'].includes(r.type)) {
        grouped.entities.push(r);
      } else if (r.type === 'topic') {
        grouped.topics.push(r);
      } else {
        grouped.documents.push(r);
      }
    });

    search.groupedResults = grouped;
    return search;
  }
}
