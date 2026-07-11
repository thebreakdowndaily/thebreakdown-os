import type { KnowledgeSearch, SearchBuilder } from './builder';

export class IntentResolver implements SearchBuilder {
  async build(search: KnowledgeSearch): Promise<KnowledgeSearch> {
    const queryLower = search.query.toLowerCase();
    const rawResults = search.rawResults || [];
    
    let primaryType: 'Entity' | 'Topic' | 'Story' | 'Concept' | 'Unknown' = 'Unknown';
    let confidence = 0;
    let matchedId = undefined;

    // Simplistic intent matching: if top result is exact text match
    if (rawResults.length > 0) {
      const topMatch = rawResults[0];
      if (topMatch.title.toLowerCase() === queryLower) {
        if (topMatch.type === 'topic') {
          primaryType = 'Topic';
          confidence = 100;
          matchedId = topMatch.id;
        } else if (['organization', 'person', 'country'].includes(topMatch.type)) {
          primaryType = 'Entity';
          confidence = 100;
          matchedId = topMatch.id;
        } else if (topMatch.type === 'story') {
          primaryType = 'Story';
          confidence = 90;
          matchedId = topMatch.id;
        }
      } else {
        // Semantic clustering approximation
        const entityCount = rawResults.filter(r => ['organization', 'person', 'country'].includes(r.type)).length;
        const topicCount = rawResults.filter(r => r.type === 'topic').length;
        
        if (entityCount > rawResults.length / 2) {
          primaryType = 'Concept';
          confidence = 60;
        }
      }
    }

    search.intent = {
      primaryType,
      confidence,
      matchedId
    };

    return search;
  }
}
