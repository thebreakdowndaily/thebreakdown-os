/**
 * ─── Editorial Mutation Dossier Builder (Phase 4B-3G) ────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency, Platform Beta)
 *   - .planning/PHASE-4B-3G-EDITORIAL-MUTATION-DOSSIER.md
 *
 * Pure, deterministic dossier builder that maps TabularDiffResult and
 * TabularClaimImpactResult into a human-readable EditorialMutationDossier.
 *
 * Derived analysis only. Zero side effects on claims, evidence, or publication.
 */

import type { Claim } from '@/types/canonical';
import type {
  TabularDiffResult,
  TabularClaimImpactResult,
  EditorialMutationDossier,
  DossierClaimImpact,
  DossierReviewState,
} from '@/types/canonical-table';

export function buildEditorialMutationDossier(
  diff: TabularDiffResult,
  impactResult: TabularClaimImpactResult,
  claims: Claim[],
  timestamp: string = new Date().toISOString()
): EditorialMutationDossier {
  const globalMutations = diff.mutations.filter(
    (m) =>
      m.type === 'UNIT_CHANGED' ||
      m.type === 'DENOMINATOR_CHANGED' ||
      m.type === 'PERIOD_CHANGED' ||
      m.type === 'METHODOLOGY_CHANGED'
  );

  const hasAmbiguity =
    diff.mutations.some((m) => m.type === 'AMBIGUOUS_MATCH') ||
    impactResult.impacts.some((i) => i.classification === 'AMBIGUOUS');

  const affectedClaims: DossierClaimImpact[] = [];

  const claimsById = new Map<string, Claim>();
  for (const c of claims) {
    claimsById.set(c.id, c);
  }

  for (const impact of impactResult.impacts) {
    const claim = claimsById.get(impact.claimId);
    if (!claim) continue; // Should not happen in consistent input

    const cellMutation = diff.mutations.find(
      (m) =>
        m.type === 'CHANGED_CELL' &&
        m.rowKey === impact.cellAddress.rowKey &&
        m.columnKey === impact.cellAddress.columnKey
    );

    let reviewState: DossierReviewState = 'REVIEW_REQUIRED';
    if (impact.classification === 'NO_IMPACT') {
      reviewState = 'NO_REVIEW_REQUIRED';
    } else if (impact.classification === 'AMBIGUOUS') {
      reviewState = 'AMBIGUOUS_REVIEW_REQUIRED';
    }

    const hasGlobalUnitChange = globalMutations.some((m) => m.type === 'UNIT_CHANGED');
    const hasCellUnitChange = cellMutation?.cellDelta?.unitChanged || false;
    const unitChanged = hasGlobalUnitChange || hasCellUnitChange;

    affectedClaims.push({
      claimId: impact.claimId,
      storyId: (claim as any).storyId,
      classification: impact.classification,
      cellAddress: impact.cellAddress,
      oldSnapshot: impact.oldSnapshot,
      newSnapshot: impact.newSnapshot,
      absoluteDelta: cellMutation?.cellDelta?.absoluteDelta ?? null,
      percentageDelta: cellMutation?.cellDelta?.percentageDelta ?? null,
      unitChanged,
      reviewState,
    });
  }

  // Deterministic sorting
  affectedClaims.sort((a, b) => {
    // 1. Review state (AMBIGUOUS > REVIEW > NO_REVIEW)
    const stateOrder = { AMBIGUOUS_REVIEW_REQUIRED: 0, REVIEW_REQUIRED: 1, NO_REVIEW_REQUIRED: 2 };
    if (stateOrder[a.reviewState] !== stateOrder[b.reviewState]) {
      return stateOrder[a.reviewState] - stateOrder[b.reviewState];
    }
    // 2. Story ID
    if (a.storyId !== b.storyId) {
      return (a.storyId || '').localeCompare(b.storyId || '');
    }
    // 3. Claim ID
    return a.claimId.localeCompare(b.claimId);
  });

  // Strip milliseconds and punctuation for a clean ID
  const cleanTimestamp = timestamp.replace(/[-:.TZ]/g, '');

  return {
    dossierId: `dossier-${diff.archiveIdNew || 'unknown'}-${cleanTimestamp}`,
    archiveIdOld: diff.archiveIdOld,
    archiveIdNew: diff.archiveIdNew,
    tableIdOld: diff.tableIdOld,
    tableIdNew: diff.tableIdNew,
    globalMutations,
    affectedClaims,
    hasAmbiguity,
    generatedAt: timestamp,
  };
}
