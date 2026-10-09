import { describe, it, expect } from 'vitest';
import { analyzeTabularClaimImpact } from '../tables/impact-mapper';
import { CanonicalTable, TabularDiffResult } from '@/types/canonical-table';
import { Claim } from '@/types/canonical';

describe('Tabular Claim Impact Mapper (Phase 4B-3F)', () => {
  const baseTableOld: CanonicalTable = {
    tableIndex: 0,
    id: 't1',
    archiveId: 'arch-1',
    metadata: {},

    columns: [{ columnKey: 'col-A', label: 'A', dataType: 'numeric' as const }, { columnKey: 'col-B', label: 'B', dataType: 'numeric' as const }],
    rows: [
      {
        rowKey: 'row-1', rowIndex: 0,
        cells: {
          'col-A': { raw: '10', valueNumeric: 10,   },
          'col-B': { raw: '20', valueNumeric: 20,   }
        }
      }
    ]
  };

  const baseTableNew: CanonicalTable = {
    ...baseTableOld,
    archiveId: 'arch-2',
  };

  const baseDiff: TabularDiffResult = {
    tableIdOld: 't1',
    tableIdNew: 't1',
    archiveIdOld: 'arch-1',
    archiveIdNew: 'arch-2',
    summary: { hasChanges: true, totalMutations: 1 } as any,
    mutations: []
  };

    const getClaim = (id: string, rowKey?: string, columnKey?: string): Claim => {
    const claim: Claim = {
      id,
      // 
      claim: 'Dummy claim',
      status: 'verified',
      source: 'src1',
      data: '',
      sourceUrl: '',
      tier: 1,
      confidence: 1
    };
    if (rowKey && columnKey) {
      claim.cellAddress = {
        archiveId: 'arch-1',

        tableIndex: 0,
        tableId: 't1',
        rowKey,
        columnKey,
        snapshot: ({ raw: '' } as any) as any
      };
    }
    return claim;
  };

  it('ignores claims without cellAddress (legacy claims)', () => {
    const claim = getClaim('c1');
    const result = analyzeTabularClaimImpact(baseDiff, [claim]);
    expect(result.impacts.length).toBe(0);
  });

  it('fails closed when lineage points to different archiveId', () => {
    const claim = getClaim('c1', 'row-1', 'col-A');
    claim.cellAddress!.archiveId = 'other-arch';
    const result = analyzeTabularClaimImpact(baseDiff, [claim]);
    expect(result.impacts.length).toBe(0);
  });

  it('returns NO_IMPACT when diff has no mutations affecting the cell', () => {
    const claim = getClaim('c1', 'row-1', 'col-A');
    const result = analyzeTabularClaimImpact(baseDiff, [claim], baseTableNew);
    expect(result.impacts[0].classification).toBe('NO_IMPACT');
  });

  it('classifies MATERIAL_VALUE_CHANGE when CHANGED_CELL occurs on mapped cell', () => {
    const claim = getClaim('c1', 'row-1', 'col-A');
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
            percentageDelta: 50
          } as any
        }
      ]
    };
    const result = analyzeTabularClaimImpact(diff, [claim]);
    expect(result.impacts[0].classification).toBe('MATERIAL_VALUE_CHANGE');
  });

  it('classifies UNIT_CHANGE when CHANGED_CELL has unitChanged flag', () => {
    const claim = getClaim('c1', 'row-1', 'col-A');
    const diff: TabularDiffResult = {
      ...baseDiff,
      mutations: [
        {
          type: 'CHANGED_CELL',
          description: 'changed unit',
          rowKey: 'row-1',
          columnKey: 'col-A',
          cellDelta: {
            rowKey: 'row-1',
            columnKey: 'col-A',
            oldValue: { raw: '10', valueNumeric: 10,   },
            newValue: undefined,
            absoluteDelta: 0,
            percentageDelta: 0,
            unitChanged: true
          } as any
        }
      ]
    };
    const result = analyzeTabularClaimImpact(diff, [claim]);
    expect(result.impacts[0].classification).toBe('UNIT_CHANGE');
  });

  it('classifies REMOVED_ROW when row is missing', () => {
    const claim = getClaim('c1', 'row-1', 'col-A');
    const diff: TabularDiffResult = {
      ...baseDiff,
      mutations: [
        { type: 'REMOVED_ROW', description: 'removed', rowKey: 'row-1' }
      ]
    };
    const result = analyzeTabularClaimImpact(diff, [claim]);
    expect(result.impacts[0].classification).toBe('REMOVED_ROW');
  });

  it('classifies REMOVED_COLUMN when col is missing', () => {
    const claim = getClaim('c1', 'row-1', 'col-B');
    const diff: TabularDiffResult = {
      ...baseDiff,
      mutations: [
        { type: 'REMOVED_COLUMN', description: 'removed', columnKey: 'col-B' }
      ]
    };
    const result = analyzeTabularClaimImpact(diff, [claim]);
    expect(result.impacts[0].classification).toBe('REMOVED_COLUMN');
  });

  it('classifies AMBIGUOUS when AMBIGUOUS_MATCH mutation is present', () => {
    const claim = getClaim('c1', 'row-1', 'col-A');
    const diff: TabularDiffResult = {
      ...baseDiff,
      mutations: [
        { type: 'AMBIGUOUS_MATCH', description: 'ambiguous' }
      ]
    };
    const result = analyzeTabularClaimImpact(diff, [claim]);
    expect(result.impacts[0].classification).toBe('AMBIGUOUS');
  });

  it('classifies global METHODOLOGY_CHANGED correctly', () => {
    const claim = getClaim('c1', 'row-1', 'col-A');
    const diff: TabularDiffResult = {
      ...baseDiff,
      mutations: [
        { type: 'METHODOLOGY_CHANGED', description: 'methodology' }
      ]
    };
    const result = analyzeTabularClaimImpact(diff, [claim]);
    expect(result.impacts[0].classification).toBe('METHODOLOGY_REVIEW');
  });

  it('extracts newSnapshot if newTable is provided and cell exists', () => {
    const claim = getClaim('c1', 'row-1', 'col-A');
    const diff: TabularDiffResult = { ...baseDiff, mutations: [] };
    const newTable: CanonicalTable = {
      ...baseTableNew,
      rows: [
        {
          rowKey: 'row-1', rowIndex: 0,
          cells: {
            'col-A': { raw: '10', valueNumeric: 10,   },
            'col-B': { raw: '20', valueNumeric: 20,   }
          }
        }
      ]
    };
    const result = analyzeTabularClaimImpact(diff, [claim], newTable);
    expect(result.impacts[0].classification).toBe('NO_IMPACT');
    expect(result.impacts[0].newSnapshot).toBeDefined();
    expect(result.impacts[0].newSnapshot?.raw).toBe('10');
  });

  it('handles multi-claim impact deterministically sorted by claimId', () => {
    const claim2 = getClaim('c2', 'row-1', 'col-B');
    const claim1 = getClaim('c1', 'row-1', 'col-A');
    const diff: TabularDiffResult = {
      ...baseDiff,
      mutations: [
        { type: 'REMOVED_ROW', description: 'removed', rowKey: 'row-1' }
      ]
    };
    const result = analyzeTabularClaimImpact(diff, [claim2, claim1]);
    expect(result.impacts.length).toBe(2);
    expect(result.impacts[0].claimId).toBe('c1');
    expect(result.impacts[0].classification).toBe('REMOVED_ROW');
    expect(result.impacts[1].claimId).toBe('c2');
    expect(result.impacts[1].classification).toBe('REMOVED_ROW');
  });
});
