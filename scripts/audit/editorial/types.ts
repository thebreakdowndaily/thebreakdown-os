// scripts/audit/editorial/types.ts
// Pure typescript definitions for the Phase 2 Editorial & Evidence Audit Pipeline

export type ContentSourceType = 'STANDALONE_STORY' | 'KNOWLEDGE_LIBRARY_CHAPTER';
export type EnumerationStatus = 'PUBLIC' | 'NON_PUBLIC' | 'RESOLUTION_FAILURE';

export interface EnumerationRecord {
  slug: string;
  sourceType: ContentSourceType;
  canonicalId?: string;
  title?: string;
  status: EnumerationStatus;
  isPublic: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

export interface EnumerationSummary {
  rawDiscovered: number;
  uniqueDiscovered: number;
  publicCount: number;
  nonPublicCount: number;
  resolutionFailuresCount: number;
  duplicateSlugs: string[];
  canonicalIdCollisions: string[];
  records: EnumerationRecord[];
}

export interface RiskFactor {
  name: string;
  score: number; // 0-10 scale
  weight: number;
  indicatorType: 'STRUCTURAL_INDICATOR' | 'CONTENT_VOLATILITY' | 'IMPACT_BURDEN';
  rationale: string;
}

export interface StoryRiskProfile {
  slug: string;
  title: string;
  sourceType: ContentSourceType;
  compositeRiskScore: number; // For triage ordering only, NOT quality
  rank: number;
  factors: {
    freshnessRisk: RiskFactor;
    geopoliticalRisk: RiskFactor;
    healthSafetyRisk: RiskFactor;
    financialComplexityRisk: RiskFactor;
    policyConsequenceRisk: RiskFactor;
    causalClaimDensityRisk: RiskFactor;
    factualBurdenRisk: RiskFactor;
    structuralEvidenceGapRisk: RiskFactor;
    fastChangingFactsRisk: RiskFactor;
  };
  selectionCategory: 'BATCH_1' | 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'STANDARD_QUEUE';
  selectionRationale: string;
}

export interface RiskRankingReport {
  generatedAt: string;
  totalPublicAudited: number;
  methodology: string;
  batch1Selected: StoryRiskProfile[];
  fullRanking: StoryRiskProfile[];
}

export type AssessmentMethod = 'AUTOMATED' | 'EDITORIAL_REVIEW' | 'EXTERNAL_VERIFICATION';
export type VerificationStatus = 'CHECKED' | 'REQUIRES_REVIEW' | 'NOT_APPLICABLE' | 'EXTERNAL_VERIFICATION_REQUIRED';

export type ClaimFactualSurface = 
  | 'headline'
  | 'dek'
  | 'orientation'
  | 'quick_brief'
  | 'key_takeaways'
  | 'narrative_block'
  | 'key_numbers'
  | 'financial_statement'
  | 'timeline'
  | 'chart_caption'
  | 'faq'
  | 'why_it_matters';

export type CandidateClaimType = 'NUMERIC' | 'CAUSAL' | 'FACTUAL_ASSERTION' | 'POLICY_STATEMENT' | 'HISTORICAL_EVENT';

export interface MaterialClaimRecord {
  id: string;
  surface: ClaimFactualSurface;
  claimText: string;
  normalizedText: string;
  blockId?: string;
  claimType: CandidateClaimType;
  extractionMethod: AssessmentMethod;
  status: 'CANDIDATE' | 'CONFIRMED';
  canonicalClaimId?: string;
  registeredClaimMatch?: {
    id: string;
    statement: string;
    confidence?: number;
  };
  isEvidenceLinked: boolean;
  isSourceLinked: boolean;
  linkedSourceCount: number;
  supportStrength?: 'STRONG' | 'MODERATE' | 'WEAK' | 'UNSUPPORTED' | 'CONTRADICTED';
  deduplicatedWithClaimId?: string;
}

export interface ClaimCoverageMetrics {
  totalFactualSurfacesScanned: number;
  candidateClaimsExtracted: number;
  confirmedMaterialClaims: number;
  registeredCanonicalClaims: number;
  registeredAndEvidenceLinked: number;
  registeredButUnsupported: number;
  materialClaimsMissingFromRegistry: number;
  orphanEvidenceCount: number;
  orphanSourceCount: number;
}

export interface SourceSemanticAssessment {
  sourceTitle: string;
  sourceUrl?: string;
  sourceType: string;
  tier: number;
  authorityScore: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  directness: 'PRIMARY' | 'SECONDARY' | 'AGGREGATOR';
  recencyStatus: 'CURRENT' | 'OUTDATED' | 'UNDATED';
  traceability: 'FULL' | 'PARTIAL' | 'BROKEN';
  independence: 'INDEPENDENT' | 'CONFLICTED' | 'UNCHECKED';
  assessmentMethod: AssessmentMethod;
  verificationStatus: VerificationStatus;
  supportsClaim: boolean;
  editorialNotes?: string;
}

export type FinancialSemanticStage = 'SANCTION' | 'BUDGET_PROVISION' | 'ALLOCATION' | 'ESTIMATED_COST' | 'REVISED_COST' | 'REPORTED_EXPENDITURE' | 'ACTUAL_EXPENDITURE';

export interface FinancialClaimAssessment {
  claimId: string;
  rawValue: string;
  numericValue?: number;
  currencyUnit: string; // e.g. "crore", "lakh", "USD"
  periodOrDate: string;
  scope: string;
  semanticStage: FinancialSemanticStage;
  sourceCited?: string;
  comparableSemanticsVerified: boolean;
  hasOverrunOrUnderspendInference: boolean;
  inferenceJustified: boolean;
  assessmentMethod: AssessmentMethod;
  verificationStatus: VerificationStatus;
  notes?: string;
}

export type CausalClassification = 
  | 'ESTABLISHED_CAUSAL_EVIDENCE'
  | 'STRONG_INFERENCE'
  | 'PLAUSIBLE_INTERPRETATION'
  | 'CORRELATION_ONLY'
  | 'UNSUPPORTED_CAUSAL_CLAIM';

export interface CausalClaimAssessment {
  claimId: string;
  text: string;
  classification: CausalClassification;
  assessmentMethod: AssessmentMethod;
  verificationStatus: VerificationStatus;
  justification: string;
}

export type TimelineEventRelevance = 'ESSENTIAL' | 'USEFUL_CONTEXT' | 'WEAKLY_RELEVANT' | 'IRRELEVANT';

export interface TimelineEventAssessment {
  eventId: string;
  date: string;
  title: string;
  description: string;
  relevance: TimelineEventRelevance;
  chronologyCorrect: boolean;
  provenanceVerified: boolean;
  assessmentMethod: AssessmentMethod;
  verificationStatus: VerificationStatus;
}

export type VisualPedagogicalValue = 'ESSENTIAL' | 'USEFUL' | 'DECORATIVE' | 'IRRELEVANT' | 'MISLEADING';

export interface VisualAssetAssessment {
  assetId: string;
  type: string; // image, chart, map
  title?: string;
  pedagogicalValue: VisualPedagogicalValue;
  provenanceVerified: boolean;
  captionAccurate: boolean;
  altTextPresent: boolean;
  unitsAndAxesDeclared: boolean;
  assessmentMethod: AssessmentMethod;
  verificationStatus: VerificationStatus;
  notes?: string;
}

export interface ReadingModeSemanticAssessment {
  mode: 'quick' | 'standard' | 'deep';
  technicalIntegrityPass: boolean;
  targetReadingTimeMinutes: number;
  coherenceRating: 'HIGH' | 'ADEQUATE' | 'DEFICIENT';
  independentSufficiency: boolean;
  depthValueAdded: boolean;
  assessmentMethod: AssessmentMethod;
  verificationStatus: VerificationStatus;
  notes?: string;
}

export type FreshnessStatus = 'CURRENT' | 'NEEDS_UPDATE' | 'TEMPORALLY_AMBIGUOUS' | 'OUTDATED';

export interface FreshnessAssessment {
  lastUpdatedDate?: string;
  timeSensitiveClaimsCount: number;
  overallFreshness: FreshnessStatus;
  outdatedClaimIds: string[];
  assessmentMethod: AssessmentMethod;
  verificationStatus: VerificationStatus;
  notes?: string;
}

export type ExternalVerificationConclusion = 
  | 'SUPPORTED'
  | 'MOSTLY_SUPPORTED'
  | 'MIXED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_SUPPORTED'
  | 'OUTDATED'
  | 'MISLEADINGLY_FRAMED';

export interface ExternalVerificationRecord {
  claimId: string;
  claimText: string;
  citedSource: string;
  citedSourceDate?: string;
  authoritativeVerificationSource: string;
  sourceHierarchyTier: 1 | 2 | 3 | 4 | 5; // 1: statutory/gov, 2: official dataset, 3: research/report, 4: peer-reviewed, 5: journalism
  verificationDate: string;
  comparisonDetails: string;
  conclusion: ExternalVerificationConclusion;
  assessmentMethod: AssessmentMethod;
}

export type SeverityLevel = 'P0' | 'P1' | 'P2' | 'P3';
export type QualityTier = 'Tier A — Defensible' | 'Tier B — Solid with Minor Gaps' | 'Tier C — Substantial Editorial Debt' | 'Tier D — Unacceptable / P0 Risk';

export interface IssueFinding {
  id: string;
  severity: SeverityLevel;
  category: 'FACTUAL' | 'SOURCE' | 'FINANCIAL' | 'CAUSAL' | 'TIMELINE' | 'VISUAL' | 'FRESHNESS' | 'READABILITY';
  summary: string;
  details: string;
  affectedClaimId?: string;
  recommendation: string;
}

export interface P0CandidateRecord {
  id: string;
  storySlug: string;
  affectedClaim: string;
  publishedWording: string;
  existingEvidenceOrSource: string;
  authoritativeComparison: string;
  whyMaterial: string;
  confidence: number;
  recommendedContainment: string;
}

export interface Batch1StoryAuditReport {
  storySlug: string;
  storyTitle: string;
  sourceType: ContentSourceType;
  auditedAt: string;
  riskProfile: StoryRiskProfile;
  technicalIntegrity: {
    passed: boolean;
    quickModePass: boolean;
    standardModePass: boolean;
    deepModePass: boolean;
    error?: string;
  };
  claimCoverage: ClaimCoverageMetrics;
  claims: MaterialClaimRecord[];
  sourcesAudit: SourceSemanticAssessment[];
  financialAudit: FinancialClaimAssessment[];
  causalAudit: CausalClaimAssessment[];
  timelineAudit: TimelineEventAssessment[];
  visualAudit: VisualAssetAssessment[];
  readingModesAudit: ReadingModeSemanticAssessment[];
  freshnessAudit: FreshnessAssessment;
  externalVerifications: ExternalVerificationRecord[];
  issues: IssueFinding[];
  p0Candidate?: P0CandidateRecord;
  editorialTier: QualityTier;
  verdictRationale: string;
}
