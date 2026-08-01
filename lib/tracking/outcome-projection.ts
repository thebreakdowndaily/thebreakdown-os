// ── Outcome Tracking Projection Builder (Phase 26A WP3) ─────────────────────────

import { OutcomeTrackingProjection } from '../../types/outcome-tracking';
import { OutcomeTrackingService } from './outcome-tracking-service';

export class OutcomeTrackingProjectionBuilder {
  /**
   * Builds an immutable OutcomeTrackingProjection for UI visualization.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    problemSlug?: string;
    currentTime?: Date;
  }): OutcomeTrackingProjection {
    const timestamp = options?.currentTime || new Date();
    let metrics = OutcomeTrackingService.getCanonicalMetrics();

    if (options?.problemSlug) {
      metrics = metrics.filter((m) => m.relatedProblemSlugs.includes(options.problemSlug!));
    }

    return Object.freeze({
      projectionId: options?.projectionId || `proj-track-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      problemSlug: options?.problemSlug,
      metricCount: metrics.length,
      metrics: Object.freeze(metrics.map((m) => Object.freeze({ ...m }))),
      descriptiveDisclaimer:
        'Outcome Tracking observes, measures, and contextualises time. Outcome Tracking never attributes causation without supporting evidence or forecasts future outcomes.',
    });
  }
}
