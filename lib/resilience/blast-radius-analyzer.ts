// ── Blast Radius & Service Criticality Analyzer (Phase 21B WP2) ────────────────

import { ResilienceDependency, BlastRadiusAssessment } from '../../types/resilience';

export class BlastRadiusAnalyzer {
  private static dependencies: ResilienceDependency[] = [
    {
      serviceId: 'APIGateway',
      dependencyType: 'SYNCHRONOUS',
      criticalityTier: 'TIER_1_CRITICAL',
      ownership: 'PlatformTeam',
      redundancyLevel: 'HA_REDUNDANT',
      graphVersion: 'v1.0.0-graph',
    },
    {
      serviceId: 'SecuritySubsystem',
      dependencyType: 'SYNCHRONOUS',
      criticalityTier: 'TIER_1_CRITICAL',
      ownership: 'SecurityTeam',
      redundancyLevel: 'HA_REDUNDANT',
      graphVersion: 'v1.0.0-graph',
    },
    {
      serviceId: 'ProjectionService',
      dependencyType: 'SYNCHRONOUS',
      criticalityTier: 'TIER_1_CRITICAL',
      ownership: 'CoreDomainTeam',
      redundancyLevel: 'HA_REDUNDANT',
      graphVersion: 'v1.0.0-graph',
    },
    {
      serviceId: 'SearchCache',
      dependencyType: 'ASYNCHRONOUS',
      criticalityTier: 'TIER_2_HIGH',
      ownership: 'PerformanceTeam',
      redundancyLevel: 'FAILOVER_READY',
      graphVersion: 'v1.0.0-graph',
    },
  ];

  public static listDependencies(): readonly ResilienceDependency[] {
    return Object.freeze(this.dependencies.map((d) => Object.freeze({ ...d })));
  }

  /**
   * Calculates deterministic blast radius assessment for a target service.
   */
  public static analyzeBlastRadius(targetServiceId = 'SearchCache'): BlastRadiusAssessment {
    const affectedServices = targetServiceId === 'SearchCache'
      ? ['ProjectionService', 'KnowledgeExplorer']
      : ['APIGateway', 'PublicPlatform'];

    const affectedCapabilities = targetServiceId === 'SearchCache'
      ? ['Fast Fix Search', 'Knowledge Explorer Indexing']
      : ['Public API Projections', 'Editorial Mission Control'];

    return Object.freeze({
      targetServiceId,
      affectedServices: Object.freeze(affectedServices),
      affectedCapabilities: Object.freeze(affectedCapabilities),
      blastRadiusPercent: targetServiceId === 'SearchCache' ? 15.0 : 45.0,
      estimatedUserImpact: targetServiceId === 'SearchCache' ? 'LOW' : 'HIGH',
      recoveryDependencies: Object.freeze(['TelemetryCollector', 'CacheWarmupJob']),
      confidenceScore: 0.96,
    });
  }
}
