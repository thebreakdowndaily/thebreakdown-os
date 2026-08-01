// ── Platform Resilience Projection Builder (Phase 21B WP6) ─────────────────────

import { PlatformResilienceProjection } from '../../types/resilience';
import { BlastRadiusAnalyzer } from './blast-radius-analyzer';
import { ControlledFaultSimulator } from './fault-simulator';
import { AdaptiveRunbookEngine } from './adaptive-runbooks';
import { OperationalReadinessIndexCalculator } from './readiness-index';

export class PlatformResilienceProjectionBuilder {
  /**
   * Builds an immutable PlatformResilienceProjection for UI visualization.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    currentTime?: Date;
  }): PlatformResilienceProjection {
    const timestamp = options?.currentTime || new Date();
    const readinessIndex = OperationalReadinessIndexCalculator.computeReadinessScore();
    const dependencies = BlastRadiusAnalyzer.listDependencies();
    const blastRadiusAssessments = [BlastRadiusAnalyzer.analyzeBlastRadius('SearchCache')];
    const recentSimulations = ControlledFaultSimulator.getSimulationHistory();
    const adaptiveRunbooks = AdaptiveRunbookEngine.generateRunbooks();
    const historicalSnapshots = OperationalReadinessIndexCalculator.getHistoricalSnapshots();

    return Object.freeze({
      projectionId: options?.projectionId || `proj-res-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      readinessIndex,
      dependencies,
      blastRadiusAssessments: Object.freeze(blastRadiusAssessments.map((b) => Object.freeze({ ...b }))),
      recentSimulations,
      adaptiveRunbooks,
      historicalSnapshots,
    });
  }
}
