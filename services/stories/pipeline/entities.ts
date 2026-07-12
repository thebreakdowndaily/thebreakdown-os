import { KnowledgeStory, StoryBuilder } from './builder';
import { getServices } from '@/services/registry';
import type { EntityBase } from '@/types/canonical';

const ENTITY_TYPE_PRIORITY: Record<string, number> = {
  person: 100,
  organization: 80,
  country: 60,
  policy: 50,
  scheme: 40,
  budget: 40,
  report: 30,
  dataset: 20,
  source: 10,
};

function scoreEntity(entity: EntityBase, headlineTokens: Set<string>): number {
  const typeScore = ENTITY_TYPE_PRIORITY[entity.type] || 0;
  const evidenceScore = entity.evidenceScore || 0;
  const nameMatch = entity.name && headlineTokens.has(entity.name.toLowerCase()) ? 30 : 0;
  return typeScore + evidenceScore + nameMatch;
}

export class EntityBuilder implements StoryBuilder {
  async build(story: KnowledgeStory): Promise<KnowledgeStory> {
    const s = story.raw;
    
    const entityResults = await Promise.all(
      s.relatedEntityIds.map(id => getServices().entities.getEntity(id))
    );
    const relatedEntities = entityResults.filter((e): e is EntityBase => !!e);

    // If primaryEntityId is set, use it as primary; rest are supporting
    if (s.primaryEntityId) {
      const primary = relatedEntities.find(e => e.id === s.primaryEntityId || e.slug === s.primaryEntityId) || null;
      const supporting = relatedEntities.filter(e => e !== primary);
      story.resolvedEntities = { primary, supporting };
      return story;
    }

    // Rank entities: prefer persons, high-evidence, headline-matched
    const headlineTokens = new Set(s.headline.toLowerCase().split(/\s+/));
    const ranked = [...relatedEntities].sort(
      (a, b) => scoreEntity(b, headlineTokens) - scoreEntity(a, headlineTokens)
    );

    story.resolvedEntities = {
      primary: ranked.length > 0 ? ranked[0] : null,
      supporting: ranked.slice(1)
    };

    return story;
  }
}
