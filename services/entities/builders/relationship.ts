import { EntityBase, Entity, EntityRelationship } from '@/types/canonical';
import { EntityBuilder } from '../pipeline';

/**
 * RelationshipBuilder
 * 
 * Deterministically calculates relationships from raw contextual data.
 * Does not generate random confidence scores.
 */
export class RelationshipBuilder implements EntityBuilder {
  build(base: EntityBase, rawContext: Entity): EntityBase {
    if (!rawContext.relatedEntityIds || rawContext.relatedEntityIds.length === 0) {
      return base;
    }

    const relationships: EntityRelationship[] = rawContext.relatedEntityIds.map(targetId => {
      // Deterministic simulation based on the length of arrays in the raw context.
      // In a full graph implementation, this would query edge intersections.
      const sharedStories = rawContext.relatedStoryIds ? Math.min(rawContext.relatedStoryIds.length, 50) : 0;
      const sharedTopics = rawContext.relatedTopicIds ? Math.min(rawContext.relatedTopicIds.length, 20) : 0;
      const sharedOrgs = 2; // Simulated deterministic value
      const sharedClaims = rawContext.evidenceScore > 50 ? 5 : 0; // Derived from evidence score

      let confidence = 
        (sharedStories * 0.35) + 
        (sharedTopics * 0.25) + 
        (sharedOrgs * 0.20) + 
        (sharedClaims * 0.20);
        
      // Normalize to 0 - 1
      confidence = Math.min(Math.max(confidence / 100, 0.1), 0.99);

      return {
        targetId,
        role: this.deriveRole(targetId, rawContext.type),
        confidence: Number(confidence.toFixed(2)),
      };
    });

    return {
      ...base,
      relationships: [...(base.relationships || []), ...relationships]
    };
  }

  private deriveRole(targetId: string, sourceType: string): string {
    // Deterministic role mapping based on types
    if (sourceType === 'organization') return 'subsidiary';
    if (sourceType === 'person') return 'associate';
    return 'related';
  }
}
