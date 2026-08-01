// ── Platform Resilience & Adaptive Operations Specification (Phase 21B) ─────
// Immutable Resilience domain interfaces.

export type CriticalityTier = 'TIER_1_CRITICAL' | 'TIER_2_HIGH' | 'TIER_3_MEDIUM';
export type DependencyType = 'SYNCHRONOUS' | 'ASYNCHRONOUS' | 'EXTERNAL';

export interface ResilienceDependency {
  serviceId: string;
  dependencyType: DependencyType;
  criticalityTier: CriticalityTier;
  ownership: string;
  redundancyLevel: 'HA_REDUNDANT' | 'FAILOVER_READY' | 'SINGLE_POINT_OF_FAILURE';
  graphVersion: string;
}

export interface BlastRadiusAssessment {
  targetServiceId: string;
  affectedServices: readonly string[];
  affectedCapabilities: readonly string[];
  blastRadiusPercent: number;
  estimatedUserImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recoveryDependencies: readonly string[];
  confidenceScore: number;
}

export interface FaultSimulationScenario {
  scenarioId: string;
  targetServiceId: string;
  faultType: 'LATENCY_SPIKE' | 'DEPENDENCY_OUTAGE' | 'CACHE_INVALIDATION';
  environment: 'SANDBOX' | 'STAGING';
  durationSeconds: number;
}

export interface FaultSimulationResult {
  simulationId: string;
  scenarioId: string;
  executedTime: string;
  environment: string;
  recoveryTimeSeconds: number;
  recoveryPassed: boolean;
  notes: string;
}

export interface AdaptiveRunbook {
  runbookId: string;
  title: string;
  triggeringCondition: string;
  supportingEvidence: readonly string[];
  prerequisiteChecks: readonly string[];
  recommendedActions: readonly string[];
  expectedOutcome: string;
  escalationCriteria: string;
}

export interface DecomposableReadinessScore {
  overallReadiness: number; // 0 to 100
  resilienceScore: number;
  lifecycleReadinessScore: number;
  governanceScore: number;
  securityScore: number;
  performanceScore: number;
  observabilityCoverageScore: number;
}

export interface HistoricalResilienceSnapshot {
  snapshotId: string;
  timestamp: string;
  overallReadiness: number;
  meanRecoveryTimeSeconds: number;
  simulationSuccessRatePercent: number;
}

export interface PlatformResilienceProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  readinessIndex: DecomposableReadinessScore;
  dependencies: readonly ResilienceDependency[];
  blastRadiusAssessments: readonly BlastRadiusAssessment[];
  recentSimulations: readonly FaultSimulationResult[];
  adaptiveRunbooks: readonly AdaptiveRunbook[];
  historicalSnapshots: readonly HistoricalResilienceSnapshot[];
}
