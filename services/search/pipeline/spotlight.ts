import type { KnowledgeSearch, SearchBuilder } from './builder';
import { getServices } from '@/services/registry';

export class KnowledgeSpotlight implements SearchBuilder {
  async build(search: KnowledgeSearch): Promise<KnowledgeSearch> {
    if (!search.intent || search.intent.confidence < 90 || !search.intent.matchedId) {
      return search;
    }

    const { primaryType, matchedId } = search.intent;
    
    if (primaryType === 'Entity') {
      const entity = getServices().entities.getEntity(matchedId);
      if (entity) {
        search.spotlight = {
          type: 'Entity',
          data: entity
        };
      }
    } else if (primaryType === 'Topic') {
      const topic = getServices().topics.getTopic(matchedId);
      if (topic) {
        search.spotlight = {
          type: 'Topic',
          data: topic
        };
      }
    }

    return search;
  }
}
