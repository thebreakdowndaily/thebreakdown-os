import { Entity, EntityBase } from '@/types/canonical';

/**
 * LegacyEntityAdapter
 * 
 * Sole responsibility: Map the legacy monolithic APIEntity 
 * to the base canonical KnowledgeEntity structure (EntityBase).
 * 
 * This keeps the legacy raw store isolated from the intelligence pipeline.
 */
export class LegacyEntityAdapter {
  static adapt(legacyEntity: Entity): EntityBase {
    return {
      id: legacyEntity.id,
      slug: legacyEntity.slug,
      type: legacyEntity.type,
      name: legacyEntity.name,
      description: legacyEntity.description,
      aliases: legacyEntity.aliases || [],
      
      // Default empty arrays to be populated by the Pipeline Builders
      assets: [],
      relationships: [],
      timeline: [],
      claims: [],
      faq: legacyEntity.faq || [],
      statistics: legacyEntity.statistics || [],
      evidenceScore: legacyEntity.evidenceScore || 0,
      
      // Legacy fields to preserve compatibility while view-models are slowly migrated
      image: legacyEntity.image,
      storyCount: legacyEntity.storyCount || 0,
      relatedEntityIds: legacyEntity.relatedEntityIds || [],
      relatedStoryIds: legacyEntity.relatedStoryIds || [],
      relatedTopicIds: legacyEntity.relatedTopicIds || [],
      
      version: 1,
      usageGraph: { stories: [], topics: [], collections: [] },
      
      createdAt: legacyEntity.createdAt,
      updatedAt: legacyEntity.updatedAt,
    };
  }
}
