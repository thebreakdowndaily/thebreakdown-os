// ── Global Precedent Projection Builder (Phase 25B WP3) ─────────────────────────

import { GlobalPrecedentProjection, RegionCategory } from '../../types/precedent-explorer';
import { PrecedentIntelligenceService } from './precedent-intelligence-service';

export class GlobalPrecedentProjectionBuilder {
  /**
   * Builds an immutable GlobalPrecedentProjection for UI visualization.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    problemSlug?: string;
    filterRegion?: RegionCategory;
    currentTime?: Date;
  }): GlobalPrecedentProjection {
    const timestamp = options?.currentTime || new Date();
    let precedents = PrecedentIntelligenceService.getCanonicalPrecedents();

    if (options?.problemSlug) {
      precedents = precedents.filter((p) => p.relatedProblemSlugs.includes(options.problemSlug!));
    }

    if (options?.filterRegion) {
      precedents = precedents.filter((p) => p.region === options.filterRegion);
    }

    return Object.freeze({
      projectionId: options?.projectionId || `proj-prec-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      problemSlug: options?.problemSlug,
      precedentCount: precedents.length,
      precedents: Object.freeze(precedents.map((p) => Object.freeze({ ...p }))),
      descriptiveDisclaimer:
        'Global Precedents describe, contextualise, and compare circumstances. Global Precedents never imply historical equivalence or prescribe transferability.',
    });
  }
}
