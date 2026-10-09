import { describe, it, expect } from 'vitest';
import { buildEditorialMutationDossier } from '../tables/dossier-builder';
import { TabularDiffResult, TabularClaimImpactResult, TabularMutation } from '@/types/canonical-table';
import { Claim } from '@/types/canonical';

describe('Editorial Mutation Dossier Builder (Phase 4B-3G)', () => {
  const timestamp = '2026-10-03T12:00:00.000Z';

  const baseDiff: TabularDiffResult = {
    tableIdOld: 't1',
    tableIdNew: 't1',
    archiveIdOld: 'arch-1',
    archiveIdNew: 'arch-2',
    summary: { hasChanges: true, totalMutations: 1 } as any,
    mutations: []
  };

  const getClaim = (id: string, storyId: string, rowKey: string, columnKey: string): Claim => {
    return Object.assign({
      id,
      
      claim: `Claim ${id}`,
      status: 'verified',
      source: 'src1',
      cellAddress: {
        archiveId: 'arch-1',
        tableIndex: 0,
        tableId: 't1',
        rowKey,
        columnKey,
        snapshot: { raw: '10', valueNumeric: 10,   }
      },
      data: '',
      sourceUrl: '',
      tier: 1 as const,
      confidence: 1
    }, { storyId }) as unknown as Claim;
  };

  it('handles a single affected claim with MATERIAL_VALUE_CHANGE', () => {
    const claims = [getClaim('c1', 's1', 'row-1', 'col-A')];
    const diff: TabularDiffResult = {
      ...baseDiff,
      mutations: [
        {
          type: 'CHANGED_CELL',
          description: 'changed',
          rowKey: 'row-1',
          columnKey: 'col-A',
          cellDelta: {
            rowKey: 'row-1',
            columnKey: 'col-A',
            oldValue: { raw: '10', valueNumeric: 10,   },
            newValue: { raw: '20', valueNumeric: 20,   },
            absoluteDelta: 5,
            percentageDelta: 50,
            unitChanged: false
          }
        }
      ]
    };
    const impact: TabularClaimImpactResult = {
      ...baseDiff,
      impacts: [
        {
          claimId: 'c1',
          classification: 'MATERIAL_VALUE_CHANGE',
          cellAddress: claims[0].cellAddress!
        }
      ]
    };

    const dossier = buildEditorialMutationDossier(diff, impact, claims, timestamp);
    
    expect(dossier.dossierId).toContain('arch-2');
    expect(dossier.affectedClaims.length).toBe(1);
    expect(dossier.affectedClaims[0].claimId).toBe('c1');
    expect(dossier.affectedClaims[0].reviewState).toBe('REVIEW_REQUIRED');
    expect(dossier.affectedClaims[0].absoluteDelta).toBe(5);
    expect(dossier.affectedClaims[0].percentageDelta).toBe(50);
    expect(dossier.affectedClaims[0].unitChanged).toBe(false);
  });

  it('handles multiple claims on the same cell', () => {
    const c1 = getClaim('c1', 's1', 'row-1', 'col-A');
    const c2 = getClaim('c2', 's2', 'row-1', 'col-A');
    const claims = [c1, c2];
    const impact: TabularClaimImpactResult = {
      ...baseDiff,
      impacts: [
        { claimId: 'c1', classification: 'REMOVED_ROW', cellAddress: c1.cellAddress! },
        { claimId: 'c2', classification: 'REMOVED_ROW', cellAddress: c2.cellAddress! }
      ]
    };

    const dossier = buildEditorialMutationDossier(baseDiff, impact, claims, timestamp);
    expect(dossier.affectedClaims.length).toBe(2);
    expect(dossier.affectedClaims[0].storyId).toBe('s1'); // s1 < s2
    expect(dossier.affectedClaims[1].storyId).toBe('s2');
  });

  it('handles tolerated drift (NO_IMPACT -> NO_REVIEW_REQUIRED)', () => {
    const claims = [getClaim('c1', 's1', 'row-1', 'col-A')];
    const impact: TabularClaimImpactResult = {
      ...baseDiff,
      impacts: [
        { claimId: 'c1', classification: 'NO_IMPACT', cellAddress: claims[0].cellAddress! }
      ]
    };
    const dossier = buildEditorialMutationDossier(baseDiff, impact, claims, timestamp);
    expect(dossier.affectedClaims[0].reviewState).toBe('NO_REVIEW_REQUIRED');
  });

  it('extracts global mutations and unit change flags correctly', () => {
    const claims = [getClaim('c1', 's1', 'row-1', 'col-A')];
    const diff: TabularDiffResult = {
      ...baseDiff,
      mutations: [
        { type: 'UNIT_CHANGED', description: 'unit global' }
      ]
    };
    const impact: TabularClaimImpactResult = {
      ...baseDiff,
      impacts: [
        { claimId: 'c1', classification: 'UNIT_CHANGE', cellAddress: claims[0].cellAddress! }
      ]
    };

    const dossier = buildEditorialMutationDossier(diff, impact, claims, timestamp);
    expect(dossier.globalMutations.length).toBe(1);
    expect(dossier.globalMutations[0].type).toBe('UNIT_CHANGED');
    expect(dossier.affectedClaims[0].unitChanged).toBe(true);
  });

  it('sets hasAmbiguity and AMBIGUOUS_REVIEW_REQUIRED correctly', () => {
    const claims = [getClaim('c1', 's1', 'row-1', 'col-A')];
    const diff: TabularDiffResult = {
      ...baseDiff,
      mutations: [
        { type: 'AMBIGUOUS_MATCH', description: 'ambiguity' }
      ]
    };
    const impact: TabularClaimImpactResult = {
      ...baseDiff,
      impacts: [
        { claimId: 'c1', classification: 'AMBIGUOUS', cellAddress: claims[0].cellAddress! }
      ]
    };

    const dossier = buildEditorialMutationDossier(diff, impact, claims, timestamp);
    expect(dossier.hasAmbiguity).toBe(true);
    expect(dossier.affectedClaims[0].reviewState).toBe('AMBIGUOUS_REVIEW_REQUIRED');
  });

  it('sorts deterministically (Ambiguous > Review > No Review, then story, then claim)', () => {
    const c1 = getClaim('c1', 's2', 'r', 'c');
    const c2 = getClaim('c2', 's2', 'r', 'c');
    const c3 = getClaim('c3', 's1', 'r', 'c'); // Ambiguous
    const c4 = getClaim('c4', 's1', 'r', 'c'); // No impact
    const claims = [c1, c2, c3, c4];
    
    const impact: TabularClaimImpactResult = {
      ...baseDiff,
      impacts: [
        { claimId: 'c1', classification: 'MATERIAL_VALUE_CHANGE', cellAddress: c1.cellAddress! }, // REVIEW, s2, c1
        { claimId: 'c2', classification: 'MATERIAL_VALUE_CHANGE', cellAddress: c2.cellAddress! }, // REVIEW, s2, c2
        { claimId: 'c3', classification: 'AMBIGUOUS', cellAddress: c3.cellAddress! },             // AMBIGUOUS, s1, c3
        { claimId: 'c4', classification: 'NO_IMPACT', cellAddress: c4.cellAddress! }              // NO_REVIEW, s1, c4
      ]
    };

    const dossier = buildEditorialMutationDossier(baseDiff, impact, claims, timestamp);
    
    expect(dossier.affectedClaims.length).toBe(4);
    expect(dossier.affectedClaims[0].claimId).toBe('c3'); // AMBIGUOUS goes first
    expect(dossier.affectedClaims[1].claimId).toBe('c1'); // REVIEW goes next (s2, c1)
    expect(dossier.affectedClaims[2].claimId).toBe('c2'); // REVIEW goes next (s2, c2)
    expect(dossier.affectedClaims[3].claimId).toBe('c4'); // NO_REVIEW goes last
  });

  it('ignores unrelated claims that were not mapped', () => {
    const claims = [
      getClaim('c1', 's1', 'r', 'c'),
      { id: 'c2', storyId: 's2', claim: 'legacy', status: 'verified', source: 'src', data: '', sourceUrl: '', tier: 1 as const, confidence: 1 } as unknown as Claim
    ];
    const impact: TabularClaimImpactResult = {
      ...baseDiff,
      impacts: [
        { claimId: 'c1', classification: 'REMOVED_ROW', cellAddress: claims[0].cellAddress! }
      ]
    };

    const dossier = buildEditorialMutationDossier(baseDiff, impact, claims, timestamp);
    expect(dossier.affectedClaims.length).toBe(1);
    expect(dossier.affectedClaims[0].claimId).toBe('c1');
  });
});

