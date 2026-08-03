import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type { VerificationKind } from '@/lib/intel/toolkit/types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace)
// + docs/intelligence/roadmap.md (Part 14 — Editorial Intelligence)
// Canonical types for the Verification Operating System.
//
// The Verification Service owns workflow, status, review metadata, editorial decisions,
// and the audit trail. It never re-implements prediction, research, evidence, scenario,
// editorial, trust, or toolkit intelligence — it aggregates certified engine outputs into
// Verification Cases. A case owns metadata only: claims, conflicts, evidence reviews, and
// field plans are references to engine outputs, never duplicated content.

/** Eleven-state verification status model. Transitions are explicit — see status.ts. */
export type VerificationStatus =
  | 'unreviewed'
  | 'in_review'
  | 'evidence_complete'
  | 'evidence_incomplete'
  | 'needs_field_verification'
  | 'needs_official_confirmation'
  | 'conflicting_evidence'
  | 'verified'
  | 'rejected'
  | 'deferred'
  | 'archived';

export const VERIFICATION_STATUSES: readonly VerificationStatus[] = [
  'unreviewed',
  'in_review',
  'evidence_complete',
  'evidence_incomplete',
  'needs_field_verification',
  'needs_official_confirmation',
  'conflicting_evidence',
  'verified',
  'rejected',
  'deferred',
  'archived',
];

export type VerificationStatusCounts = Record<VerificationStatus, number>;

export type AuditAction = 'created' | 'status_transition' | 'reviewer_assigned' | 'review_note';

/** Append-only audit entry. Entries are immutable once written. */
export interface AuditEntry {
  id: string;
  caseId: string;
  at: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  from?: VerificationStatus;
  to?: VerificationStatus;
  note?: string;
}

export type ClaimRegisterStatus = 'unverified' | 'verified' | 'contested';

/** A single register row — a claim to verify, its provenance, and its disposition. */
export interface VerificationClaim {
  id: string;
  text: string;
  source: string;
  kind: VerificationKind;
  confidence: ConfidenceTier;
  status: ClaimRegisterStatus;
}

export interface ConflictRecord {
  id: string;
  title: string;
  detail: string;
  between: string[];
  severity: 'high' | 'medium' | 'low';
  resolutionSteps: string[];
  source: string;
}

export interface EvidenceReview {
  coveragePct: number;
  totalFields: number;
  availableFields: number;
  confidence: ConfidenceTier;
  missingCategories: Array<{ category: string; label: string; missing: number; total: number }>;
  lowConfidenceItems: Array<{ label: string; value: string; confidence: ConfidenceTier; source: string }>;
  derivedFrom: string;
}

export interface FieldVerificationPlan {
  recommendedDocuments: string[];
  groundReporting: string[];
  officialDatasets: string[];
  placesToVisit: string[];
  peopleToInterview: string[];
  taskCount: number;
}

export interface EditorialBlocker {
  label: string;
  detail: string;
}

export interface EditorialReadiness {
  score: number;
  canPublish: boolean;
  blockers: EditorialBlocker[];
  verifiedClaims: number;
  totalClaims: number;
  openConflicts: number;
  openFieldTasks: number;
  recommendation: string;
}

export interface CaseReviewer {
  id: string;
  name: string;
}

export type VerificationPriorityTier = 'critical' | 'high' | 'medium' | 'low';

export interface VerificationCase {
  id: string;
  constituencyId: string;
  constituencyName: string;
  acNumber: number;
  district: string;
  region: string;
  reservationType: string;
  currentMlaParty: string;
  predictedWinner: string;
  winnerProbability: number;
  ipi: number;
  priorityTier: VerificationPriorityTier;
  confidence: ConfidenceTier;
  summary: string;
  status: VerificationStatus;
  reviewer?: CaseReviewer;
  assignedAt?: string;
  reviewNotes: string[];
  claimRegister: VerificationClaim[];
  conflicts: ConflictRecord[];
  evidenceReview: EvidenceReview;
  fieldPlan: FieldVerificationPlan;
  readiness: EditorialReadiness;
  lastTransition?: { at: string; by?: string; from?: VerificationStatus; to: VerificationStatus };
  audit: AuditEntry[];
  updatedAt: string;
  source: string;
}

export interface VerificationOverview {
  generatedAt: string;
  dataSource: string;
  researchCutoff: string;
  totalCases: number;
  statusCounts: VerificationStatusCounts;
  openCases: number;
  verifiedCases: number;
  rejectedCases: number;
  backlogCount: number;
  highPriorityOpen: number;
  openConflicts: number;
  evidenceDebt: number;
  overallConfidence: ConfidenceTier;
  cases: VerificationCase[];
  limitations: string[];
  storeNote: string;
}

/** Mission Control projection — computed by the Executive Intelligence Service from the Verification Service. */
export interface VerificationExecutiveSummary {
  generatedAt: string;
  totalCases: number;
  openCases: number;
  highPriorityOpen: number;
  verifiedCases: number;
  backlogCount: number;
  openConflicts: number;
  verifiedRecently: Array<{ caseId: string; constituencyName: string; verifiedAt: string }>;
  blockedInvestigations: Array<{ caseId: string; constituencyName: string; reason: string }>;
  statusCounts: VerificationStatusCounts;
  persistence: 'none';
  note: string;
}

export interface Actor {
  id: string;
  name: string;
}

export type VerificationTransitionResult =
  | { success: true; status: VerificationStatus }
  | { success: false; error: string };
