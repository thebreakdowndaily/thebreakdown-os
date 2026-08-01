// ── Platform Evidence Evolution & Historical Snapshot Specification (Phase 26B) ──
// Immutable Evidence Evolution domain interfaces.

export type RevisionClassification =
  | 'NEW_EVIDENCE_ADDED'
  | 'EVIDENCE_REMOVED'
  | 'CLAIM_WORDING_UPDATED'
  | 'SOURCE_CORRECTED'
  | 'CONFIDENCE_REVISED'
  | 'METADATA_AMENDED';

export interface ClaimRevisionEvent {
  eventId: string;
  timestamp: string;
  classification: RevisionClassification;
  summary: string;
  rationale: string;
  evidenceSourceTitle: string;
  priorConfidence: string;
  newConfidence: string;
}

export interface HistoricalSnapshotPoint {
  snapshotId: string;
  snapshotDate: string;
  snapshotLabel: string;
  activeClaimCount: number;
  activeEvidenceCount: number;
  confidenceGrade: 'High' | 'Moderate' | 'Low' | 'Contested';
  summaryStateNote: string;
}

export interface ConfidenceTrajectoryNode {
  nodeId: string;
  claimId: string;
  claimTitle: string;
  currentConfidence: 'High' | 'Moderate' | 'Low' | 'Contested';
  historicalSnapshots: readonly HistoricalSnapshotPoint[];
  revisionHistory: readonly ClaimRevisionEvent[];
  knowledgeDriftSummary: string;
  relatedProblemSlugs: readonly string[];
  relatedFixIds: readonly string[];
}

export interface EvidenceEvolutionProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  problemSlug?: string;
  nodeCount: number;
  trajectoryNodes: readonly ConfidenceTrajectoryNode[];
  evolutionDisclaimer: string;
}
