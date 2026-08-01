// ── Platform Editorial Decision Intelligence Specification (Phase 24A) ───────
// Immutable Editorial Decision Intelligence domain interfaces.

export type RiskAxis =
  | 'LEGAL'
  | 'FACTUAL_UNCERTAINTY'
  | 'NEUTRALITY_BIAS'
  | 'PRESENTISM_HINDSIGHT'
  | 'EVIDENCE_SUFFICIENCY'
  | 'SOURCE_FRAGILITY';

export interface MultidimensionalStoryImpact {
  storyId: string;
  overallImpactScore: number; // 0 to 100
  topicImportanceScore: number;
  publicInterestScore: number;
  knowledgeGapScore: number;
  crossCollectionConnectivityScore: number;
  referenceValueScore: number;
  readerLearningImpactScore: number;
}

export interface EvidenceQualityRating {
  overallQualityScore: number; // 0 to 100
  coverageScore: number;
  diversityScore: number;
  qualityScore: number;
  freshnessScore: number;
  independenceScore: number;
  traceabilityScore: number;
}

export interface SourceDiversityMetrics {
  primarySourceCount: number;
  academicSourceCount: number;
  officialRecordCount: number;
  judicialDocumentCount: number;
  archivalMaterialCount: number;
  expertInterviewCount: number;
  statisticalDatasetCount: number;
  investigativeReportCount: number;
  singleSourceDependencyDetected: boolean;
  concentrationRiskWarnings: readonly string[];
}

export interface EditorialRiskAssessment {
  riskAxis: RiskAxis;
  score: number; // 0 to 100 (0 = low risk, 100 = high risk)
  summary: string;
  mitigationRecommendation: string;
}

export interface ActionableReadinessRecommendation {
  readinessPercent: number; // 0 to 100
  editorialConfidencePercent: number; // 0 to 100
  strengths: readonly string[];
  concerns: readonly string[];
  recommendedActions: readonly string[];
  advisoryDisclaimer: string;
}

export interface PlatformEditorialIntelligenceProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  storyImpact: MultidimensionalStoryImpact;
  evidenceQuality: EvidenceQualityRating;
  sourceDiversity: SourceDiversityMetrics;
  riskAssessments: readonly EditorialRiskAssessment[];
  readinessRecommendation: ActionableReadinessRecommendation;
}
