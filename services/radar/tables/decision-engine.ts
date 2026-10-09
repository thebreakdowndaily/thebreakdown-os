/**
 * ─── Human Review Decision Engine (Phase 4B-3H) ──────────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency, Platform Beta)
 *   - .planning/PHASE-4B-3H-HUMAN-REVIEW-DECISION-ENGINE.md
 *
 * Pure decision-transition engine for mapping human editorial decisions
 * on tabular mutations into explicit, deterministic state transitions.
 *
 * Derived analysis only. Zero side effects on claims, evidence, or publication.
 */

import type { Claim } from '@/types/canonical';
import type { EditorialMutationDossier, CellAddress, DossierClaimImpact } from '@/types/canonical-table';

export type HumanReviewDecision = 'APPROVE_NEW_BASELINE' | 'RETRACT_CLAIM' | 'DISMISS_IRRELEVANT';

export interface StateTransitionResult {
  decision: HumanReviewDecision;
  previousState: Claim['status'];
  proposedState: Claim['status'];
  previousEvidenceId?: string;
  newEvidenceId?: 'PENDING_NEW_EVIDENCE'; // Represents requirement for new evidence record
  previousArchiveId?: string;
  newArchiveId?: string;
  previousCellAddress?: CellAddress;
  newCellAddress?: CellAddress;
  reasonCode: string;
  blockReason?: string;
  evidenceAction: 'SUPERSEDE_OLD' | 'PRESERVE_OLD' | 'INVALIDATE_OLD' | 'NONE';
}

export function evaluateHumanReviewDecision(
  claim: Claim,
  dossier: EditorialMutationDossier | undefined,
  decision: HumanReviewDecision
): StateTransitionResult {
  const previousState = claim.status;
  const previousEvidenceId = claim.evidenceId;
  const previousArchiveId = claim.archiveId;
  const previousCellAddress = claim.cellAddress;

  const baseResult: StateTransitionResult = {
    decision,
    previousState,
    proposedState: previousState, // Defaults to no change unless explicitly modified
    previousEvidenceId,
    previousArchiveId,
    previousCellAddress,
    reasonCode: 'UNKNOWN',
    evidenceAction: 'NONE'
  };

  // 1. Check for missing/invalid dossier
  if (!dossier) {
    return {
      ...baseResult,
      reasonCode: 'REJECTED_MISSING_DOSSIER',
      blockReason: 'Cannot process decision without a valid EditorialMutationDossier.'
    };
  }

  // 2. Legacy claims
  if (!previousCellAddress) {
    return {
      ...baseResult,
      reasonCode: 'REJECTED_LEGACY_CLAIM',
      blockReason: 'Claim has no cell lineage. Cannot automatically transition tabular state.'
    };
  }

  // Find the claim in the dossier
  const impact = dossier.affectedClaims.find(c => c.claimId === claim.id);
  if (!impact) {
    return {
      ...baseResult,
      reasonCode: 'REJECTED_UNRELATED_CLAIM',
      blockReason: 'Claim is not present in the provided dossier.'
    };
  }

  // 3. Evaluate based on human decision
  switch (decision) {
    case 'APPROVE_NEW_BASELINE':
      if (dossier.hasAmbiguity || impact.reviewState === 'AMBIGUOUS_REVIEW_REQUIRED' || impact.classification === 'AMBIGUOUS') {
        return {
          ...baseResult,
          reasonCode: 'REJECTED_AMBIGUOUS_LINEAGE',
          blockReason: 'Cannot approve new baseline due to ambiguous table lineage.'
        };
      }

      if (!impact.newSnapshot) {
        return {
          ...baseResult,
          reasonCode: 'REJECTED_MISSING_NEW_BASELINE',
          blockReason: 'Cannot approve new baseline. The cell was removed or not successfully extracted.'
        };
      }

      // Valid approval
      return {
        ...baseResult,
        proposedState: 'verified', // Remains/returns to verified
        newArchiveId: dossier.archiveIdNew,
        newCellAddress: {
          ...previousCellAddress,
          archiveId: dossier.archiveIdNew || previousCellAddress.archiveId,
          snapshot: impact.newSnapshot
        },
        newEvidenceId: 'PENDING_NEW_EVIDENCE',
        reasonCode: 'SUCCESS',
        evidenceAction: 'SUPERSEDE_OLD' // Old evidence becomes superseded
      };

    case 'RETRACT_CLAIM':
      // The existing claim status model handles retraction by moving back to unverified
      return {
        ...baseResult,
        proposedState: 'unverified',
        reasonCode: 'SUCCESS',
        evidenceAction: 'INVALIDATE_OLD'
      };

    case 'DISMISS_IRRELEVANT':
      // Preserves current state
      return {
        ...baseResult,
        proposedState: previousState,
        reasonCode: 'SUCCESS',
        evidenceAction: 'PRESERVE_OLD'
      };

    default:
      return {
        ...baseResult,
        reasonCode: 'REJECTED_INVALID_DECISION',
        blockReason: 'Unrecognized decision requested.'
      };
  }
}
