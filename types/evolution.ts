// ── Platform Release Governance & Evolution Management Specification (Phase 22B) ─
// Immutable Evolution domain interfaces.

export type ADRStatus = 'PROPOSED' | 'ACCEPTED' | 'DEPRECATED' | 'SUPERSEDED';
export type ChangeRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ArchitectureDecisionRecord {
  adrId: string;
  version: string;
  title: string;
  status: ADRStatus;
  context: string;
  decision: string;
  alternativesConsidered: readonly string[];
  consequences: readonly string[];
  linkedRoadmapPhase: string;
  linkedArchitecturalRules: readonly string[];
  traceabilityReferences: readonly string[];
}

export interface ArchitectureEvolutionRoadmap {
  roadmapId: string;
  currentPhase: string;
  supportedVersions: readonly string[];
  compatibilityWindowDays: number;
  migrationPaths: readonly string[];
  deprecationSchedule: readonly string[];
}

export interface ChangeImpactAssessment {
  changeId: string;
  targetSubsystem: string;
  affectedSubsystems: readonly string[];
  dependencyRippleGraph: readonly string[];
  compatibilityImpact: 'BACKWARD_COMPATIBLE' | 'DEPRECATED_ALIAS' | 'BREAKING_CHANGE';
  migrationEffortDays: number;
  operationalRisk: ChangeRiskLevel;
  testingImpact: string;
  documentationImpact: string;
  rolloutComplexity: string;
  confidenceScore: number;
}

export interface DecomposableReleaseQualityIndex {
  overallReleaseQuality: number; // 0 to 100
  architectureComplianceScore: number;
  engineeringExcellenceScore: number;
  resilienceReadinessScore: number;
  observabilityCoverageScore: number;
  governanceComplianceScore: number;
  securityPostureScore: number;
  dependencyCompatibilityScore: number;
  regressionStatusScore: number;
}

export interface HistoricalEvolutionSnapshot {
  snapshotId: string;
  timestamp: string;
  overallReleaseQuality: number;
  activeADRCount: number;
  migrationCompletionPercent: number;
}

export interface PlatformEvolutionProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  releaseQualityIndex: DecomposableReleaseQualityIndex;
  roadmap: ArchitectureEvolutionRoadmap;
  activeADRs: readonly ArchitectureDecisionRecord[];
  recentImpactAssessments: readonly ChangeImpactAssessment[];
  historicalEvolution: readonly HistoricalEvolutionSnapshot[];
}
