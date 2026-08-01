// ── Platform Knowledge Intelligence & Semantic Reasoning Specification (Phase 23B) ─
// Immutable Knowledge Intelligence domain interfaces.

export type SemanticRelationType =
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'ELABORATES'
  | 'DEPENDS_ON'
  | 'EVOLVES_FROM'
  | 'CITES'
  | 'VALIDATES'
  | 'REFERENCES'
  | 'DUPLICATES'
  | 'RELATED_TO';

export type InconsistencyCategory =
  | 'FACTUAL_CONTRADICTION'
  | 'STALE_CITATION'
  | 'OBSOLETE_POLICY'
  | 'DUPLICATE_CLAIM'
  | 'CONFLICTING_ADR'
  | 'BROKEN_PROVENANCE'
  | 'MISSING_EVIDENCE'
  | 'INCOMPLETE_VERIFICATION';

export interface InferredSemanticRelationship {
  relationshipId: string;
  sourceId: string;
  targetId: string;
  relationType: SemanticRelationType;
  originatingRule: string;
  supportingEvidence: readonly string[];
  confidenceScore: number; // 0.0 to 1.0
  reasoningTrail: string;
  timestamp: string;
  graphVersion: string;
}

export interface CompleteEvidenceProvenanceChain {
  chainId: string;
  claimId: string;
  claimText: string;
  evidenceId: string;
  primarySourceId: string;
  verificationAuditId: string;
  editorialApprovalId: string;
  publicationVersion: string;
}

export interface CrossDomainDiscoveryItem {
  itemId: string;
  queryContext: string;
  sourceDomain: 'EDITORIAL' | 'ARCHITECTURAL' | 'OPERATIONAL' | 'RESEARCH';
  targetDomain: 'EDITORIAL' | 'ARCHITECTURAL' | 'OPERATIONAL' | 'RESEARCH';
  title: string;
  relationshipDescription: string;
  confidenceScore: number;
}

export interface KnowledgeConsistencyIssue {
  issueId: string;
  category: InconsistencyCategory;
  description: string;
  affectedEntities: readonly string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedRemediation: string;
}

export interface HistoricalIntelligenceSnapshot {
  snapshotId: string;
  timestamp: string;
  inferenceCount: number;
  averageConfidenceScore: number;
  provenanceCompletenessPercent: number;
  consistencyScore: number;
}

export interface PlatformKnowledgeIntelligenceProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  consistencyScore: number; // 0 to 100
  averageConfidenceScore: number;
  inferredRelationships: readonly InferredSemanticRelationship[];
  provenanceChains: readonly CompleteEvidenceProvenanceChain[];
  discoveryItems: readonly CrossDomainDiscoveryItem[];
  consistencyIssues: readonly KnowledgeConsistencyIssue[];
  historicalTrends: readonly HistoricalIntelligenceSnapshot[];
}
