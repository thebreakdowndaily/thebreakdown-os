// ── Platform Evolution Projection Builder (Phase 22B WP6) ──────────────────────

import { PlatformEvolutionProjection, HistoricalEvolutionSnapshot } from '../../types/evolution';
import { ArchitectureEvolutionPlanner } from './evolution-planner';
import { ReleaseGovernanceEngine } from './release-governance';
import { ChangeImpactAnalyzer } from './impact-analyzer';
import { ArchitectureDecisionRegistry } from './adr-registry';

export class PlatformEvolutionProjectionBuilder {
  /**
   * Builds an immutable PlatformEvolutionProjection for UI visualization.
   */
  public static buildProjection(options?: {
    projectionId?: string;
    platformVersion?: string;
    currentTime?: Date;
  }): PlatformEvolutionProjection {
    const timestamp = options?.currentTime || new Date();
    const releaseQualityIndex = ReleaseGovernanceEngine.computeReleaseQualityIndex();
    const roadmap = ArchitectureEvolutionPlanner.getRoadmap();
    const activeADRs = ArchitectureDecisionRegistry.listADRs();
    const recentImpactAssessments = ChangeImpactAnalyzer.getRecentImpactAssessments();

    const historicalEvolution: HistoricalEvolutionSnapshot[] = [
      {
        snapshotId: 'snap-evo-2026-07-25-01',
        timestamp: timestamp.toISOString(),
        overallReleaseQuality: releaseQualityIndex.overallReleaseQuality,
        activeADRCount: activeADRs.length,
        migrationCompletionPercent: 100.0,
      },
    ];

    return Object.freeze({
      projectionId: options?.projectionId || `proj-evo-${Date.now()}`,
      projectionVersion: 1,
      platformVersion: options?.platformVersion || 'v1.0.0',
      generatedAt: timestamp.toISOString(),
      releaseQualityIndex,
      roadmap,
      activeADRs,
      recentImpactAssessments,
      historicalEvolution: Object.freeze(historicalEvolution.map((h) => Object.freeze({ ...h }))),
    });
  }
}
