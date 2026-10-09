import { describe, it, expect } from 'vitest';
import { evaluateHumanReviewDecision, HumanReviewDecision } from '../tables/decision-engine';
import { EditorialMutationDossier } from '@/types/canonical-table';
import { Claim } from '@/types/canonical';

describe('Human Review Decision Engine (Phase 4B-3H)', () => {
  const getBaseClaim = (id: string, status: 'verified' | 'unverified' = 'verified', withLineage = true): Claim => {
    return {
      id,
      storyId: 's1',
      claim: `Claim ${id}`,
      status,
      source: 'src1',
      evidenceId: `ev-${id}`,
      archiveId: 'arch-1',
      cellAddress: withLineage ? {
        archiveId: 'arch-1',
        tableIndex: 0,
        tableId: 't1',
        rowKey: 'r1',
        columnKey: 'c1',
        snapshot: { raw: '10', valueNumeric: 10,   }
      } : undefined
    } as unknown as Claim;
  };

  const getBaseDossier = (claimId: string, overrides: any = {}): EditorialMutationDossier => {
    return {
      dossierId: 'd-1',
      archiveIdOld: 'arch-1',
      archiveIdNew: 'arch-2',
      tableIdOld: 't1',
      tableIdNew: 't1',
      globalMutations: [],
      affectedClaims: [
        {
          claimId,
          classification: overrides.classification || 'MATERIAL_VALUE_CHANGE',
          cellAddress: {
            archiveId: 'arch-1',
            tableIndex: 0,
            tableId: 't1',
            rowKey: 'r1',
            columnKey: 'c1',
            snapshot: { raw: '10', valueNumeric: 10,   }
          },
          oldSnapshot: { raw: '10', valueNumeric: 10,   },
          newSnapshot: overrides.missingNewSnapshot ? undefined : { raw: '20', valueNumeric: 20,   },
          reviewState: overrides.reviewState || 'REVIEW_REQUIRED'
        }
      ],
      hasAmbiguity: overrides.hasAmbiguity || false,
      generatedAt: 'now'
    };
  };

  it('fails closed when missing dossier', () => {
    const claim = getBaseClaim('c1');
    const result = evaluateHumanReviewDecision(claim, undefined, 'APPROVE_NEW_BASELINE');
    expect(result.reasonCode).toBe('REJECTED_MISSING_DOSSIER');
    expect(result.proposedState).toBe('verified');
  });

  it('fails closed for legacy claim (no lineage)', () => {
    const claim = getBaseClaim('c1', 'verified', false);
    const dossier = getBaseDossier('c1');
    const result = evaluateHumanReviewDecision(claim, dossier, 'APPROVE_NEW_BASELINE');
    expect(result.reasonCode).toBe('REJECTED_LEGACY_CLAIM');
    expect(result.proposedState).toBe('verified');
  });

  it('fails closed when claim is not in dossier', () => {
    const claim = getBaseClaim('c2'); // c2 != c1
    const dossier = getBaseDossier('c1');
    const result = evaluateHumanReviewDecision(claim, dossier, 'APPROVE_NEW_BASELINE');
    expect(result.reasonCode).toBe('REJECTED_UNRELATED_CLAIM');
  });

  it('approves valid new baseline', () => {
    const claim = getBaseClaim('c1');
    const dossier = getBaseDossier('c1');
    const result = evaluateHumanReviewDecision(claim, dossier, 'APPROVE_NEW_BASELINE');
    
    expect(result.reasonCode).toBe('SUCCESS');
    expect(result.decision).toBe('APPROVE_NEW_BASELINE');
    expect(result.proposedState).toBe('verified'); // Status remains verified
    expect(result.evidenceAction).toBe('SUPERSEDE_OLD');
    expect(result.newEvidenceId).toBe('PENDING_NEW_EVIDENCE');
    expect(result.newArchiveId).toBe('arch-2');
    expect(result.newCellAddress?.snapshot?.raw).toBe('20');
  });

  it('rejects APPROVE_NEW_BASELINE if missing new lineage (removed row)', () => {
    const claim = getBaseClaim('c1');
    const dossier = getBaseDossier('c1', { missingNewSnapshot: true });
    const result = evaluateHumanReviewDecision(claim, dossier, 'APPROVE_NEW_BASELINE');
    
    expect(result.reasonCode).toBe('REJECTED_MISSING_NEW_BASELINE');
    expect(result.proposedState).toBe('verified');
  });

  it('rejects APPROVE_NEW_BASELINE if dossier is ambiguous', () => {
    const claim = getBaseClaim('c1');
    const dossier = getBaseDossier('c1', { hasAmbiguity: true });
    const result = evaluateHumanReviewDecision(claim, dossier, 'APPROVE_NEW_BASELINE');
    
    expect(result.reasonCode).toBe('REJECTED_AMBIGUOUS_LINEAGE');
  });

  it('processes RETRACT_CLAIM successfully', () => {
    const claim = getBaseClaim('c1');
    const dossier = getBaseDossier('c1');
    const result = evaluateHumanReviewDecision(claim, dossier, 'RETRACT_CLAIM');
    
    expect(result.reasonCode).toBe('SUCCESS');
    expect(result.proposedState).toBe('unverified');
    expect(result.evidenceAction).toBe('INVALIDATE_OLD');
    // New evidence doesn't apply to retraction
    expect(result.newEvidenceId).toBeUndefined();
  });

  it('processes DISMISS_IRRELEVANT successfully', () => {
    const claim = getBaseClaim('c1');
    const dossier = getBaseDossier('c1');
    const result = evaluateHumanReviewDecision(claim, dossier, 'DISMISS_IRRELEVANT');
    
    expect(result.reasonCode).toBe('SUCCESS');
    expect(result.proposedState).toBe('verified'); // Unchanged
    expect(result.evidenceAction).toBe('PRESERVE_OLD');
  });

  it('handles already invalidated/unverified claim on retract', () => {
    const claim = getBaseClaim('c1', 'unverified');
    const dossier = getBaseDossier('c1');
    const result = evaluateHumanReviewDecision(claim, dossier, 'RETRACT_CLAIM');
    
    expect(result.reasonCode).toBe('SUCCESS');
    expect(result.previousState).toBe('unverified');
    expect(result.proposedState).toBe('unverified');
    expect(result.evidenceAction).toBe('INVALIDATE_OLD');
  });

  it('produces deterministic structured output', () => {
    const claim = getBaseClaim('c1');
    const dossier = getBaseDossier('c1');
    const result = evaluateHumanReviewDecision(claim, dossier, 'APPROVE_NEW_BASELINE');
    
    expect(Object.keys(result)).toEqual(expect.arrayContaining([
      'decision', 'previousState', 'proposedState', 'previousEvidenceId',
      'previousArchiveId', 'previousCellAddress', 'reasonCode', 'evidenceAction'
    ]));
  });
});
