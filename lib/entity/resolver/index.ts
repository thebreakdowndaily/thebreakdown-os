import { EntityResolverStrategy, EntityResolverContext, EntityResolverResult } from '../core/types';

export class EntityResolver implements EntityResolverStrategy {
  private strategies: EntityResolverStrategy[];

  constructor(strategies: EntityResolverStrategy[]) {
    this.strategies = strategies;
  }

  async resolve(context: EntityResolverContext): Promise<EntityResolverResult> {
    for (const strategy of this.strategies) {
      try {
        const result = await strategy.resolve(context);
        if (result && result.entity) {
          if (!context.confidenceThreshold || result.confidence >= context.confidenceThreshold) {
            return result;
          }
        }
      } catch (error) {
        console.warn(`Entity Resolver strategy failed for: ${context.rawText}`, error);
      }
    }
    throw new Error(`Failed to resolve entity for text: ${context.rawText}`);
  }
}

// ─── Concrete Strategies ────────────────────────────────────────────────────────

export class ExactMatchResolver implements EntityResolverStrategy {
  async resolve(context: EntityResolverContext): Promise<EntityResolverResult> {
    // Stub: Exact string match against entity.name or slug
    throw new Error('ExactMatchResolver not implemented');
  }
}

export class AliasResolver implements EntityResolverStrategy {
  async resolve(context: EntityResolverContext): Promise<EntityResolverResult> {
    // Stub: Match against entity.aliases array
    throw new Error('AliasResolver not implemented');
  }
}

export class SemanticResolver implements EntityResolverStrategy {
  async resolve(context: EntityResolverContext): Promise<EntityResolverResult> {
    // Stub: Vector embedding match against database
    throw new Error('SemanticResolver not implemented');
  }
}

export class AIResolver implements EntityResolverStrategy {
  async resolve(context: EntityResolverContext): Promise<EntityResolverResult> {
    // Stub: NLP model inference to categorize and link unseen text
    throw new Error('AIResolver not implemented');
  }
}
