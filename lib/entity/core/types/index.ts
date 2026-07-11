import { KnowledgeEntity } from '@/types/canonical';

export interface EntityResolverContext {
  rawText: string;
  sourceType: 'story' | 'search' | 'topic' | 'nlp_extraction';
  confidenceThreshold?: number;
}

export interface EntityResolverResult {
  entity: KnowledgeEntity;
  confidence: number;
  reason: string;
  matchType: 'exact' | 'alias' | 'semantic' | 'ai';
}

export interface EntityResolverStrategy {
  resolve(context: EntityResolverContext): Promise<EntityResolverResult>;
}

export interface EntityLinker {
  link(text: string): Promise<KnowledgeEntity[]>;
}

export interface KnowledgeGraphTraverser {
  getRelatedEntities(entityId: string, depth?: number): Promise<KnowledgeEntity[]>;
  getTimeline(entityId: string): Promise<any[]>; // Returns TimelineEvent[]
}
