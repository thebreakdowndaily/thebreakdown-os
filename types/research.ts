// Types related to Research Methodology v1.0
// Controlled vocabularies used throughout the platform

export const ClaimType = [
  'FACT',
  'ANALYSIS',
  'INTERPRETATION',
  'OPINION',
  'HYPOTHESIS',
] as const;
export type ClaimType = typeof ClaimType[number];

export const SourceTier = [
  'OFFICIAL_DOCUMENT',
  'AUDIT_FINDING',
  'COURT_RECORD',
  'SCIENTIFIC_STUDY',
  'GOVERNMENT_RESPONSE',
  'RTI_RESPONSE',
  'PARLIAMENT_RECORD',
  'FIELD_REPORTING',
  'VERIFIED_DATASET',
] as const;
export type SourceTier = typeof SourceTier[number];

export const ConfidenceLevel = [
  'A',
  'B',
  'C',
  'D',
  'E',
] as const;
export type ConfidenceLevel = typeof ConfidenceLevel[number];

export const VerificationStatus = [
  'PENDING',
  'EDITOR_VERIFIED',
  'SOURCE_VERIFIED',
  'AI_REVIEWED',
  'REJECTED',
  'ARCHIVED',
] as const;
export type VerificationStatus = typeof VerificationStatus[number];

export const HumanReviewStatus = [
  'UNREVIEWED',
  'IN_REVIEW',
  'APPROVED',
  'REJECTED',
] as const;
export type HumanReviewStatus = typeof HumanReviewStatus[number];

export const EvidenceRelationship = [
  'SUPPORTS',
  'CONTRADICTS',
  'QUALIFIES',
  'SUPERSEDES',
  'CONTEXTUALIZES',
] as const;
export type EvidenceRelationship = typeof EvidenceRelationship[number];

export const CandidateStatus = [
  'CANDIDATE',
  'PROPOSED',
  'APPROVED',
  'REJECTED',
] as const;
export type CandidateStatus = typeof CandidateStatus[number];

export const IssueSeverity = [
  'BLOCKER',
  'MAJOR',
  'MINOR',
] as const;
export type IssueSeverity = typeof IssueSeverity[number];

export const IssueStatus = [
  'PENDING',
  'ASSIGNED',
  'IN_REVIEW',
  'RESOLVED',
  'DISMISSED',
] as const;
export type IssueStatus = typeof IssueStatus[number];

export const PromiseStatus = [
  'PROMISED',
  'FULFILLED',
  'BROKEN',
] as const;
export type PromiseStatus = typeof PromiseStatus[number];

export const ProjectStatus = [
  'IDEATION',
  'PLANNED',
  'EXECUTING',
  'COMPLETED',
  'ARCHIVED',
] as const;
export type ProjectStatus = typeof ProjectStatus[number];

export const BoundaryComparability = [
  'COMPARABLE',
  'NON_COMPARABLE',
] as const;
export type BoundaryComparability = typeof BoundaryComparability[number];

export const DemographicEvidenceType = [
  'CENSUS',
  'SURVEY',
  'ADMINISTRATIVE',
] as const;
export type DemographicEvidenceType = typeof DemographicEvidenceType[number];

export const ForecastRating = [
  'HIGH',
  'MEDIUM',
  'LOW',
] as const;
export type ForecastRating = typeof ForecastRating[number];

export const EvidenceCoverage = [
  'FULL',
  'PARTIAL',
  'MINIMAL',
] as const;
export type EvidenceCoverage = typeof EvidenceCoverage[number];

export const ResearchPriority = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
] as const;
export type ResearchPriority = typeof ResearchPriority[number];

export const ResponsibilityType = [
  'LEGAL',
  'ADMINISTRATIVE',
  'FINANCIAL',
  'IMPLEMENTING',
  'REGULATORY',
  'POLITICAL',
] as const;
export type ResponsibilityType = typeof ResponsibilityType[number];

export const ContradictionStatus = [
  'UNRESOLVED',
  'RESOLVED',
] as const;
export type ContradictionStatus = typeof ContradictionStatus[number];

export const FinancialStage = [
  'ANNOUNCEMENT',
  'BUDGET_PROVISION',
  'ADMIN_APPROVAL',
  'FINANCIAL_SANCTION',
  'FUNDS_RELEASED',
  'TENDER_VALUE',
  'CONTRACT_AWARD',
  'PAYMENT',
  'REPORTED_EXPENDITURE',
  'UTILIZATION_REPORTED',
  'PHYSICAL_PROGRESS',
  'PHYSICALLY_COMPLETE',
  'OPERATIONAL',
  'FINAL_COST',
  'OUTCOME',
] as const;
export type FinancialStage = typeof FinancialStage[number];

export const FreshnessStatus = [
  'FRESH',
  'MONITORING',
  'CHANGED',
  'REVIEW_REQUIRED',
  'APPROVED',
  'ARCHIVED',
] as const;
export type FreshnessStatus = typeof FreshnessStatus[number];
