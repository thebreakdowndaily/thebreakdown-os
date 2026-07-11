import { KnowledgeStory, StoryBuilder } from './builder';
import { getServices } from '@/services/registry';

export class EntityBuilder implements StoryBuilder {
  async build(story: KnowledgeStory): Promise<KnowledgeStory> {
    const s = story.raw;
    
    const relatedEntities = s.relatedEntityIds
      .map(id => getServices().entities.getEntity(id))
      .filter(Boolean);

    story.resolvedEntities = {
      primary: relatedEntities.length > 0 ? relatedEntities[0] : null,
      supporting: relatedEntities.slice(1)
    };

    return story;
  }
}
