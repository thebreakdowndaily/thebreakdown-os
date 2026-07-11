import type { Topic, Entity, Story } from '@/types/canonical';
import type { KnowledgeTopic, TopicAggregator } from './builder';
import { getServices } from '@/services/registry';

export class EntityAggregator implements TopicAggregator {
  async aggregate(topic: Topic, currentKnowledge: KnowledgeTopic): Promise<KnowledgeTopic> {
    const stories = topic.storyIds
      .map(id => getServices().stories.getStory(id))
      .filter((s): s is Story => s !== null);

    const entityMap = new Map<string, { entity: Entity, frequency: number, maxEvidence: number }>();

    stories.forEach(story => {
      story.relatedEntityIds.forEach((eid: string) => {
        const entity = getServices().entities.getEntity(eid);
        if (entity) {
          const existing = entityMap.get(eid);
          if (existing) {
            existing.frequency += 1;
            existing.maxEvidence = Math.max(existing.maxEvidence, story.evidenceScore);
          } else {
            entityMap.set(eid, { entity, frequency: 1, maxEvidence: story.evidenceScore });
          }
        }
      });
    });

    const maxFreq = Math.max(1, ...Array.from(entityMap.values()).map(v => v.frequency));

    const rankedEntities = Array.from(entityMap.values()).map(({ entity, frequency, maxEvidence }) => {
      // Importance Score = Story Frequency × 35% + Evidence Score × 30% + Relationship Count × 20% + Recency × 15%
      // Simplified approximation
      const freqScore = (frequency / maxFreq) * 100;
      const evidenceScore = maxEvidence;
      const relationScore = Math.min(100, ((entity as any).relationships?.length || 0) * 10);
      const recencyScore = 80; // Placeholder for recency

      const score = (freqScore * 0.35) + (evidenceScore * 0.30) + (relationScore * 0.20) + (recencyScore * 0.15);
      
      let importance: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
      if (score >= 80) importance = 'Critical';
      else if (score >= 60) importance = 'High';
      else if (score >= 40) importance = 'Medium';

      return { entity, score, importance };
    }).sort((a, b) => b.score - a.score);

    return {
      topic,
      rankedEntities
    };
  }
}
