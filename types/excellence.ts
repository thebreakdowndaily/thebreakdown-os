// ── Platform Continuous Improvement & Engineering Excellence Specification (Phase 22A) ─
// Immutable Excellence domain interfaces.

export type TechnicalDebtCategory = 'ARCHITECTURAL' | 'DEPENDENCY' | 'DOCUMENTATION' | 'TESTING' | 'OPERATIONAL' | 'SECURITY';
export type RuleSeverity = 'LOW' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface ArchitecturalRule {
  ruleId: string;
  version: string;
  category: string;
  rationale: string;
  severity: RuleSeverity;
  evidence: string;
  remediationGuidance: string;
}

export interface ArchitecturalFitnessResult {
  fitnessCheckId: string;
  rule: ArchitecturalRule;
  passed: boolean;
  score: number; // 0 to 100
  evaluatedAt: string;
}

export interface TechnicalDebtEntry {
  debtId: string;
  title: string;
  category: TechnicalDebtCategory;
  severity: RuleSeverity;
  impact: string;
  remediationEffortDays: number;
  ownership: string;
}

export interface DecomposableEngineeringScorecard {
  subsystemName: string;
  overallScore: number; // 0 to 100
  maintainabilityScore: number;
  architectureComplianceScore: number;
  typeSafetyScore: number;
  documentationScore: number;
  testQualityScore: number;
  operationalReadinessScore: number;
  dependencyHealthScore: number;
}

export interface ArchitectureRuleViolation {
  violationId: string;
  ruleId: string;
  sourceModule: string;
  targetModule: string;
  description: string;
  severity: RuleSeverity;
}

export interface HistoricalEngineeringTrend {
  snapshotId: string;
  timestamp: string;
  averageScorecard: number;
  openTechnicalDebtItems: number;
  fitnessPassRatePercent: number;
}

export interface PlatformExcellenceProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  overallEngineeringHealthScore: number; // 0 to 100
  fitnessResults: readonly ArchitecturalFitnessResult[];
  technicalDebtEntries: readonly TechnicalDebtEntry[];
  scorecards: readonly DecomposableEngineeringScorecard[];
  violations: readonly ArchitectureRuleViolation[];
  historicalTrends: readonly HistoricalEngineeringTrend[];
}
