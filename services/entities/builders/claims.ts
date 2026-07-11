import { EntityBase, Entity, Claim } from '@/types/canonical';
import { EntityBuilder } from '../pipeline';

/**
 * ClaimBuilder
 * 
 * Derives verified claims and source URLs for an entity.
 */
export class ClaimBuilder implements EntityBuilder {
  build(base: EntityBase, rawContext: Entity): EntityBase {
    let claims: Claim[] = [];

    if (rawContext.evidenceScore > 80) {
      claims.push({
        id: `claim-${base.slug}-1`,
        claim: `${base.name} is a highly verified entity within The Breakdown database.`,
        data: `Derived deterministically from evidence score: ${rawContext.evidenceScore}`,
        source: 'The Breakdown Verification Engine',
        sourceUrl: 'https://thebreakdown.news/verification',
        confidence: 0.98,
        tier: 1,
        status: 'verified'
      });
    }

    if (rawContext.storyCount > 10) {
      claims.push({
        id: `claim-${base.slug}-2`,
        claim: `${base.name} has been featured in over 10 major investigative stories.`,
        data: `Derived deterministically from story count: ${rawContext.storyCount}`,
        source: 'The Breakdown Archives',
        sourceUrl: 'https://thebreakdown.news/archives',
        confidence: 0.95,
        tier: 2,
        status: 'verified'
      });
    }

    return {
      ...base,
      claims: [...(base.claims || []), ...claims]
    };
  }
}
