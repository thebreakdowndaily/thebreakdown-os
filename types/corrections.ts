/**
 * ─── The Breakdown OS — Corrections & Errata Domain Types ───────────────────
 * Governing Document: Editorial Constitution v1.1 (Article XIII) & Migration 013
 *
 * Implements canonical types for Reader Corrections Intake and Published Errata.
 */

export type CorrectionCategory =
  | 'factual'
  | 'source'
  | 'interpretive'
  | 'clarification'
  | 'context_update'
  | 'retraction';

export type ReaderCorrectionStatus =
  | 'received'
  | 'triaged'
  | 'in_review'
  | 'resolved'
  | 'rejected';

/**
 * Public, append-only errata notice projected from public.corrections.
 * Read-accessible by anonymous readers.
 */
export interface PublishedCorrection {
  id: string;
  storyId: string;
  storyTitle?: string;
  storySlug?: string;
  storyVersionId?: string;
  claimId?: string;
  verificationEventId?: string;
  category: CorrectionCategory;
  previousWording: string;
  correctedWording: string;
  explanation: string;
  supersededById?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Private reader correction submission record in public.reader_corrections.
 * Read-accessible strictly by editorial staff.
 */
export interface ReaderCorrection {
  id: string;
  storyId?: string;
  storySlug: string;
  claimId?: string;
  category: CorrectionCategory;
  passageExcerpt: string;
  suggestedCorrection: string;
  submitterEmail?: string;
  supportingEvidenceUrl?: string;
  status: ReaderCorrectionStatus;
  triageNotes?: string;
  resolvedCorrectionId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Validated reader intake payload submitted via POST /api/corrections/submit.
 */
export interface ReaderCorrectionSubmissionInput {
  storySlug: string;
  storyId?: string;
  claimId?: string;
  category: CorrectionCategory;
  passageExcerpt: string;
  suggestedCorrection: string;
  submitterEmail?: string;
  supportingEvidenceUrl?: string;
}

/**
 * Result returned to the public reader upon intake submission.
 * Never leaks internal editorial state or submitter emails.
 */
export interface ReaderCorrectionSubmissionResult {
  success: boolean;
  submissionId?: string;
  status: 'received';
  message: string;
  receivedAt: string;
}

/**
 * Staff triage mutation input.
 */
export interface TriageCorrectionInput {
  correctionId: string;
  status: 'triaged' | 'in_review' | 'resolved' | 'rejected';
  triageNotes?: string;
  publishedCorrection?: {
    category: CorrectionCategory;
    previousWording: string;
    correctedWording: string;
    explanation: string;
  };
}
