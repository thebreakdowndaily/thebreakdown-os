/**
 * ─── Tabular Review Orchestrator (Phase 4B-3J) ─────────────────────────
 *
 * Coordinates the application of tabular review decisions.
 * Implements a pure Node.js Saga mapping a human decision into:
 *   1. Vault artifact retention locking (if new baseline).
 *   2. Story JSON claim mutation.
 *   3. Publication Token re-verification.
 *   4. Immutable EventBus audit trail.
 */

import { CanonicalStoryService } from '@/services/stories/canonical-repository';
import { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';
import { evaluateHumanReviewDecision, HumanReviewDecision, StateTransitionResult } from './decision-engine';
import { validateStoryEvidenceCompleteness } from '@/lib/story/evidence-guard';
import { issuePublicationToken } from '@/lib/editorial/publication-token';
import { EventBus } from '@/lib/events/event-bus';
import type { EditorialMutationDossier } from '@/types/canonical-table';

export type SagaOutcome =
  | 'APPLIED'
  | 'ALREADY_APPLIED'
  | 'REJECTED'
  | 'RECONCILIATION_REQUIRED';

export interface TabularReviewSagaResult {
  outcome: SagaOutcome;
  transition?: StateTransitionResult;
  errorReason?: string;
  reconciliationAnomalyId?: string;
}

export async function applyTabularReviewDecision(
  reviewerId: string,
  dossier: EditorialMutationDossier,
  storyId: string,
  claimId: string,
  decision: HumanReviewDecision,
  vaultService: EvidenceVaultService,
  storyService: CanonicalStoryService
): Promise<TabularReviewSagaResult> {
  // 1. Authenticated Reviewer
  if (!reviewerId || reviewerId.trim() === '') {
    return { outcome: 'REJECTED', errorReason: 'Authentication failure: Reviewer ID is required.' };
  }

  // 2. Load latest story for OCC safety
  const story = await storyService.getStory(storyId);
  if (!story) {
    return { outcome: 'REJECTED', errorReason: `Story ${storyId} not found.` };
  }

  const claimIndex = story.claims.findIndex(c => c.id === claimId);
  if (claimIndex === -1) {
    return { outcome: 'REJECTED', errorReason: `Claim ${claimId} not found in story.` };
  }
  const claim = story.claims[claimIndex];

  // 3. Evaluate Decision
  const transition = evaluateHumanReviewDecision(claim, dossier, decision);
  
  if (transition.reasonCode !== 'SUCCESS') {
    return { outcome: 'REJECTED', transition, errorReason: transition.blockReason };
  }

  // 4. Idempotency Check
  if (transition.decision === 'APPROVE_NEW_BASELINE') {
    if (claim.cellAddress?.snapshot?.raw === transition.newCellAddress?.snapshot?.raw) {
      return { outcome: 'ALREADY_APPLIED', transition };
    }
  } else if (transition.decision === 'RETRACT_CLAIM') {
    if (claim.status === 'unverified') {
      return { outcome: 'ALREADY_APPLIED', transition };
    }
  } else if (transition.decision === 'DISMISS_IRRELEVANT') {
    return { outcome: 'ALREADY_APPLIED', transition };
  }

  // 5. Apply required Vault transition using EXISTING API ONLY
  // If we have a new baseline, we must ensure the new archive artifact is retention-locked.
  let vaultTransitioned = false;
  try {
    if (transition.evidenceAction === 'SUPERSEDE_OLD' && transition.newArchiveId) {
      await vaultService.lockRetention(transition.newArchiveId, {
        verifierId: reviewerId,
        reason: 'Human approval of tabular mutation baseline'
      });
    }
    vaultTransitioned = true;
  } catch (error: any) {
    return { outcome: 'REJECTED', transition, errorReason: `Vault lock failed: ${error.message}` };
  }

  // 6. Apply claim/story transition
  try {
    // Clone and mutate claim
    const updatedClaim = { ...claim, status: transition.proposedState };
    if (transition.newCellAddress) {
      updatedClaim.cellAddress = transition.newCellAddress;
    }
    if (transition.newArchiveId) {
      updatedClaim.archiveId = transition.newArchiveId;
    }

    const updatedStory = { ...story };
    updatedStory.claims = [...story.claims];
    updatedStory.claims[claimIndex] = updatedClaim;

    // 7. Re-check publication state
    const validation = await validateStoryEvidenceCompleteness(updatedStory, vaultService);
    
    const saveOptions: { publicationToken?: string } = {};
    if (validation.valid && updatedStory.publicationStatus === 'published') {
      saveOptions.publicationToken = issuePublicationToken(updatedStory.id);
    } else if (!validation.valid && updatedStory.publicationStatus === 'published') {
      // Retraction or missing evidence invalidates publication guard. Downgrade to review.
      updatedStory.publicationStatus = 'review';
      updatedStory.status = 'review';
    }

    // Save story
    try {
      await storyService.saveStoryOCC!(updatedStory, story.version || 0, saveOptions);
    } catch (err: any) {
      if (err.message && err.message.includes('OCC_FAILURE')) {
        // Concurrency failure
        if (vaultTransitioned) {
          // Vault was updated, but story failed to save. Cross-system boundary anomaly.
          return { outcome: 'RECONCILIATION_REQUIRED', transition };
        } else {
          // Vault was not modified (e.g., RETRACT or DISMISS), pure abort
          throw new Error('Concurrent mutation conflict detected. Please retry.');
        }
      }
      throw err;
    }

    // 8. Emit existing audit mechanism
    EventBus.getInstance().publish({
      type: 'story:updated',
      userId: reviewerId,
      payload: {
        storyId,
        claimId,
        decision,
        evidenceAction: transition.evidenceAction
      }
    });

    return { outcome: 'APPLIED', transition };
  } catch (error: any) {
    if (vaultTransitioned) {
      return { 
        outcome: 'RECONCILIATION_REQUIRED', 
        transition, 
        errorReason: `Story save failed, but Vault updated. Cross-system atomicity lost. Error: ${error.message}` 
      };
    }
    return { outcome: 'REJECTED', transition, errorReason: error.message };
  }
}
