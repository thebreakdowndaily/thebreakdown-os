// ── Platform Solution Comparison & Policy Matrix Specification (Phase 25A) ─────
// Immutable Solution Comparison domain interfaces.

export type ComparisonDimension =
  | 'EVIDENCE_QUALITY'
  | 'FISCAL_IMPACT'
  | 'SCALABILITY'
  | 'POLITICAL_FEASIBILITY'
  | 'TIME_TO_IMPACT'
  | 'IMPLEMENTATION_COMPLEXITY';

export interface EvaluationDimensionProfile {
  dimension: ComparisonDimension;
  score: number; // 0 to 100
  ratingLabel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' | 'FAST' | 'SLOW';
  explanation: string;
  supportingEvidenceCount: number;
  isEvidenceBacked: boolean;
}

export interface TradeOffRelation {
  tradeOffId: string;
  sourceDimension: ComparisonDimension;
  targetDimension: ComparisonDimension;
  description: string;
}

export interface PrecedentReference {
  precedentId: string;
  jurisdiction: string;
  implementationYear: number;
  statusSummary: string;
}

export interface SolutionFixComparisonNode {
  fixId: string;
  fixTitle: string;
  status: 'PROPOSED' | 'ACTIVE' | 'EVALUATED' | 'ARCHIVED';
  dimensionProfiles: readonly EvaluationDimensionProfile[];
  tradeOffs: readonly TradeOffRelation[];
  precedents: readonly PrecedentReference[];
  evidenceGaps: readonly string[];
}

export interface SolutionComparisonProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  problemId: string;
  problemSlug: string;
  problemTitle: string;
  fixCount: number;
  solutions: readonly SolutionFixComparisonNode[];
  comparisonDisclaimer: string;
}
