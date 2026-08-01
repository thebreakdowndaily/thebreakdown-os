// ── Platform Observability Projection Builder (Phase 21A WP6) ──────────────────

import { PlatformObservabilityProjection } from '../../types/observability';
import { UnifiedObservabilityTracer } from './tracer';
import { OperationalIntelligenceEngine } from './intelligence-engine';
import { ReliabilityAnalyticsEngine } from './reliability-analytics';
import { KnowledgeDrivenInsightsEngine } from './recommendation-engine';

export class PlatformObservabilityProjectionBuilder {
  /**
   * Builds an immutable PlatformObservabilityProjection for UI visualization.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    currentTime?: Date;
  }): PlatformObservabilityProjection {
    const timestamp = options?.currentTime || new Date();
    const traceSpans = UnifiedObservabilityTracer.generateTrace();
    const anomalyAlerts = OperationalIntelligenceEngine.detectAnomalies();
    const capacityForecasts = OperationalIntelligenceEngine.generateCapacityForecasts();
    const reliabilityScore = ReliabilityAnalyticsEngine.computeScore();
    const recommendations = KnowledgeDrivenInsightsEngine.generateRecommendations();

    return Object.freeze({
      projectionId: options?.projectionId || `proj-obs-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      systemHealthScore: reliabilityScore.overallScore,
      traceSpans,
      anomalyAlerts,
      capacityForecasts,
      reliabilityScore,
      recommendations,
    });
  }
}
