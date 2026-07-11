import { EntityBase, Entity } from '@/types/canonical';
import { LegacyEntityAdapter } from './legacy-adapter';

// Builder Interface
export interface EntityBuilder {
  build(base: EntityBase, rawContext: Entity): EntityBase;
}

/**
 * KnowledgeEntityPipeline
 * 
 * Orchestrates the execution of pure builders to enrich a KnowledgeEntity.
 * Builders do not fetch data or mutate state; they return an augmented entity.
 */
export class KnowledgeEntityPipeline {
  private builders: EntityBuilder[] = [];

  addBuilder(builder: EntityBuilder): this {
    this.builders.push(builder);
    return this;
  }

  execute(legacyEntity: Entity): EntityBase {
    // 1. Map via Adapter
    let entity = LegacyEntityAdapter.adapt(legacyEntity);

    // 2. Pass through builder pipeline sequentially
    for (const builder of this.builders) {
      entity = builder.build(entity, legacyEntity);
    }

    return entity;
  }
}
