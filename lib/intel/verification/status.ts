import type { VerificationStatus } from './types';
import { VERIFICATION_STATUSES } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace)
// Canonical verification workflow. Every status transition is explicit — there is no
// "any state to any state". Terminal states (archived) admit no outgoing transitions.
// Verified and Rejected are review-outcome states: they may only be reopened to in_review
// or archived, never silently shifted to another state.

export const TRANSITION_MAP: Record<VerificationStatus, readonly VerificationStatus[]> = {
  unreviewed: ['in_review', 'deferred', 'archived'],
  in_review: [
    'evidence_complete',
    'evidence_incomplete',
    'needs_field_verification',
    'needs_official_confirmation',
    'conflicting_evidence',
    'verified',
    'rejected',
    'deferred',
  ],
  evidence_complete: [
    'in_review',
    'needs_field_verification',
    'needs_official_confirmation',
    'conflicting_evidence',
    'verified',
    'rejected',
    'deferred',
  ],
  evidence_incomplete: [
    'in_review',
    'evidence_complete',
    'needs_field_verification',
    'needs_official_confirmation',
    'rejected',
    'deferred',
  ],
  needs_field_verification: [
    'in_review',
    'evidence_complete',
    'needs_official_confirmation',
    'conflicting_evidence',
    'verified',
    'rejected',
    'deferred',
  ],
  needs_official_confirmation: [
    'in_review',
    'evidence_complete',
    'needs_field_verification',
    'conflicting_evidence',
    'verified',
    'rejected',
    'deferred',
  ],
  conflicting_evidence: [
    'in_review',
    'evidence_complete',
    'evidence_incomplete',
    'needs_field_verification',
    'needs_official_confirmation',
    'verified',
    'rejected',
    'deferred',
  ],
  verified: ['in_review', 'archived'],
  rejected: ['in_review', 'archived'],
  deferred: ['in_review', 'unreviewed', 'archived'],
  archived: [],
};

export function canTransition(from: VerificationStatus, to: VerificationStatus): boolean {
  if (from === to) return false;
  return TRANSITION_MAP[from].includes(to);
}

export function nextTransitions(from: VerificationStatus): VerificationStatus[] {
  return [...TRANSITION_MAP[from]];
}

export function isTerminal(status: VerificationStatus): boolean {
  return TRANSITION_MAP[status].length === 0;
}

export function isReviewOutcome(status: VerificationStatus): boolean {
  return status === 'verified' || status === 'rejected';
}

export function isOpenStatus(status: VerificationStatus): boolean {
  return !isTerminal(status) && status !== 'verified' && status !== 'rejected' && status !== 'archived';
}

const STATUS_LABEL: Record<VerificationStatus, string> = {
  unreviewed: 'Unreviewed',
  in_review: 'In Review',
  evidence_complete: 'Evidence Complete',
  evidence_incomplete: 'Evidence Incomplete',
  needs_field_verification: 'Needs Field Verification',
  needs_official_confirmation: 'Needs Official Confirmation',
  conflicting_evidence: 'Conflicting Evidence',
  verified: 'Verified',
  rejected: 'Rejected',
  deferred: 'Deferred',
  archived: 'Archived',
};

export function verificationStatusLabel(status: VerificationStatus): string {
  return STATUS_LABEL[status];
}

export function emptyStatusCounts(): Record<VerificationStatus, number> {
  const counts = {} as Record<VerificationStatus, number>;
  for (const s of VERIFICATION_STATUSES) counts[s] = 0;
  return counts;
}

export function countStatuses(statuses: VerificationStatus[]): Record<VerificationStatus, number> {
  const counts = emptyStatusCounts();
  for (const s of statuses) counts[s] += 1;
  return counts;
}
