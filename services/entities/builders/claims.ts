import { EntityBase, Entity, Claim } from '@/types/canonical';
import { EntityBuilder } from '../pipeline';

/**
 * ClaimBuilder
 * 
 * Derives verified claims and source URLs for an entity.
 */
export class ClaimBuilder implements EntityBuilder {
  build(base: EntityBase, rawContext: Entity): EntityBase {
    // Only retain authentic documentary claims without injecting synthetic self-referential claims
    const authoredClaims = rawContext.claims || [];

    return {
      ...base,
      claims: [...(base.claims || []), ...authoredClaims]
    };
  }
}
