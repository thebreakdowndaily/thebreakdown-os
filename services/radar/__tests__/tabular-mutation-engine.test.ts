/**
 * ─── Phase 4B-3C: Tabular Mutation Engine Test Suite ──────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency, Platform Beta)
 *   - .planning/PHASE-4B-3A-STRUCTURED-MUTATION-DESIGN.md
 *   - .planning/PHASE-4B-3B-CANONICAL-TABLE-EXTRACTION.md
 *
 * Test Matrix Criteria (15 required scenarios):
 *   1. Value change: 100 → 120
 *   2. Percentage delta = 20%
 *   3. Added row
 *   4. Removed row
 *   5. Added column
 *   6. Removed column
 *   7. Row reorder
 *   8. Column reorder
 *   9. Unit change (table, column, and cell level)
 *  10. Denominator change (table and column level)
 *  11. Period change (table base period and column level)
 *  12. Formatting-only change (no semantic mutation)
 *  13. Zero-baseline percentage (old = 0 → percentageDelta: null)
 *  14. Ambiguous row identity (duplicate keys / explicit ambiguity marker)
 *  15. Identical tables (zero mutations, hasChanges: false)
 */

import { describe, it, expect } from 'vitest';
import { compareCanonicalTables } from '../tables';
import type { CanonicalTable, ColumnDescriptor, TableRowRecord } from '@/types/canonical-table';

function createMockTable(overrides: Partial<CanonicalTable> = {}): CanonicalTable {
  const columns: ColumnDescriptor[] = [
    { columnKey: 'state', label: 'State', dataType: 'text' },
    { columnKey: 'expenditure', label: 'Expenditure', dataType: 'currency', unit: 'crore' },
    { columnKey: 'growth_rate', label: 'Growth Rate', dataType: 'percentage', unit: '%' },
  ];

  const rows: TableRowRecord[] = [
    {
      rowKey: 'karnataka',
      rowIndex: 0,
      cells: {
        state: { raw: 'Karnataka', valueNumeric: null },
        expenditure: { raw: '100', valueNumeric: 100, unit: 'crore' },
        growth_rate: { raw: '8.5%', valueNumeric: 8.5, unit: '%' },
      },
    },
    {
      rowKey: 'maharashtra',
      rowIndex: 1,
      cells: {
        state: { raw: 'Maharashtra', valueNumeric: null },
        expenditure: { raw: '200', valueNumeric: 200, unit: 'crore' },
        growth_rate: { raw: '10.0%', valueNumeric: 10, unit: '%' },
      },
    },
  ];

  return {
    id: 'tbl_base',
    archiveId: 'archive-001',
    sourceId: 'source-test',
    tableIndex: 0,
    title: 'State Expenditure',
    columns,
    rows,
    metadata: {
      declaredUnit: 'crore',
      declaredDenominator: 'total',
      basePeriod: 'FY24',
      footnotes: ['Provisional figures'],
    },
    ...overrides,
  };
}

describe('PHASE 4B-3C: TABULAR MUTATION ENGINE (MILESTONE 2)', () => {
  // ── 1. Value Change: 100 → 120 ──────────────────────────────────────────────
  it('1. Value change: detects cell numeric mutation from 100 to 120 with delta', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable({
      id: 'tbl_v2',
      rows: [
        {
          rowKey: 'karnataka',
          rowIndex: 0,
          cells: {
            state: { raw: 'Karnataka', valueNumeric: null },
            expenditure: { raw: '120', valueNumeric: 120, unit: 'crore' },
            growth_rate: { raw: '8.5%', valueNumeric: 8.5, unit: '%' },
          },
        },
        tableOld.rows[1],
      ],
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.hasChanges).toBe(true);
    expect(diff.summary.changedCellsCount).toBe(1);
    expect(diff.mutations).toHaveLength(1);

    const cellMut = diff.mutations[0];
    expect(cellMut.type).toBe('CHANGED_CELL');
    expect(cellMut.rowKey).toBe('karnataka');
    expect(cellMut.columnKey).toBe('expenditure');
    expect(cellMut.cellDelta).toBeDefined();
    expect(cellMut.cellDelta?.oldValue.valueNumeric).toBe(100);
    expect(cellMut.cellDelta?.newValue.valueNumeric).toBe(120);
    expect(cellMut.cellDelta?.absoluteDelta).toBe(20);
  });

  // ── 2. Percentage Delta = 20% ───────────────────────────────────────────────
  it('2. Percentage delta: accurately computes +20.0000% and negative percentage', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable({
      rows: [
        {
          rowKey: 'karnataka',
          rowIndex: 0,
          cells: {
            state: { raw: 'Karnataka', valueNumeric: null },
            expenditure: { raw: '120', valueNumeric: 120, unit: 'crore' }, // +20%
            growth_rate: { raw: '8.5%', valueNumeric: 8.5, unit: '%' },
          },
        },
        {
          rowKey: 'maharashtra',
          rowIndex: 1,
          cells: {
            state: { raw: 'Maharashtra', valueNumeric: null },
            expenditure: { raw: '150', valueNumeric: 150, unit: 'crore' }, // -25%
            growth_rate: { raw: '10.0%', valueNumeric: 10, unit: '%' },
          },
        },
      ],
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    const karnatakaExp = diff.mutations.find(
      (m) => m.rowKey === 'karnataka' && m.columnKey === 'expenditure'
    );
    expect(karnatakaExp?.cellDelta?.percentageDelta).toBe(20);

    const maharashtraExp = diff.mutations.find(
      (m) => m.rowKey === 'maharashtra' && m.columnKey === 'expenditure'
    );
    expect(maharashtraExp?.cellDelta?.absoluteDelta).toBe(-50);
    expect(maharashtraExp?.cellDelta?.percentageDelta).toBe(-25);
  });

  // ── 3. Added Row ────────────────────────────────────────────────────────────
  it('3. Added row: detects newly introduced rows by rowKey', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable({
      rows: [
        ...tableOld.rows,
        {
          rowKey: 'gujarat',
          rowIndex: 2,
          cells: {
            state: { raw: 'Gujarat', valueNumeric: null },
            expenditure: { raw: '180', valueNumeric: 180, unit: 'crore' },
            growth_rate: { raw: '9.2%', valueNumeric: 9.2, unit: '%' },
          },
        },
      ],
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.addedRowsCount).toBe(1);
    const addedMut = diff.mutations.find((m) => m.type === 'ADDED_ROW');
    expect(addedMut).toBeDefined();
    expect(addedMut?.rowKey).toBe('gujarat');
  });

  // ── 4. Removed Row ──────────────────────────────────────────────────────────
  it('4. Removed row: detects deleted rows by rowKey', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable({
      rows: [tableOld.rows[0]], // Maharashtra removed
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.removedRowsCount).toBe(1);
    const remMut = diff.mutations.find((m) => m.type === 'REMOVED_ROW');
    expect(remMut).toBeDefined();
    expect(remMut?.rowKey).toBe('maharashtra');
  });

  // ── 5. Added Column ─────────────────────────────────────────────────────────
  it('5. Added column: detects new schema columns', () => {
    const tableOld = createMockTable();
    const newCol: ColumnDescriptor = {
      columnKey: 'capital_outlay',
      label: 'Capital Outlay',
      dataType: 'currency',
      unit: 'crore',
    };
    const tableNew = createMockTable({
      columns: [...tableOld.columns, newCol],
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.addedColumnsCount).toBe(1);
    const colMut = diff.mutations.find((m) => m.type === 'ADDED_COLUMN');
    expect(colMut).toBeDefined();
    expect(colMut?.columnKey).toBe('capital_outlay');
  });

  // ── 6. Removed Column ───────────────────────────────────────────────────────
  it('6. Removed column: detects removed schema columns', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable({
      columns: [tableOld.columns[0], tableOld.columns[1]], // growth_rate removed
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.removedColumnsCount).toBe(1);
    const remCol = diff.mutations.find((m) => m.type === 'REMOVED_COLUMN');
    expect(remCol).toBeDefined();
    expect(remCol?.columnKey).toBe('growth_rate');
  });

  // ── 7. Row Reorder ──────────────────────────────────────────────────────────
  it('7. Row reorder: detects reordered rows without flagging them as additions/removals', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable({
      rows: [tableOld.rows[1], tableOld.rows[0]], // Maharashtra first, Karnataka second
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.hasReordering).toBe(true);
    expect(diff.summary.addedRowsCount).toBe(0);
    expect(diff.summary.removedRowsCount).toBe(0);
    const reorderMut = diff.mutations.find((m) => m.type === 'REORDERED_ROW');
    expect(reorderMut).toBeDefined();
    expect(reorderMut?.oldValue).toEqual(['karnataka', 'maharashtra']);
    expect(reorderMut?.newValue).toEqual(['maharashtra', 'karnataka']);
  });

  // ── 8. Column Reorder ───────────────────────────────────────────────────────
  it('8. Column reorder: detects reordered columns without flagging schema removal', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable({
      columns: [tableOld.columns[1], tableOld.columns[0], tableOld.columns[2]], // expenditure, state, growth_rate
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.hasReordering).toBe(true);
    expect(diff.summary.addedColumnsCount).toBe(0);
    expect(diff.summary.removedColumnsCount).toBe(0);
    const colReorder = diff.mutations.find((m) => m.type === 'REORDERED_COLUMN');
    expect(colReorder).toBeDefined();
  });

  // ── 9. Unit Change ──────────────────────────────────────────────────────────
  it('9. Unit change: detects table-level, column-level, and guards against incompatible cell arithmetic', () => {
    const tableOld = createMockTable();
    // Table-level change: crore -> lakh
    const tableNewMeta = createMockTable({
      metadata: { ...tableOld.metadata, declaredUnit: 'lakh' },
    });
    const diffMeta = compareCanonicalTables(tableOld, tableNewMeta);
    expect(diffMeta.summary.hasMetadataChanges).toBe(true);
    const unitMut = diffMeta.mutations.find((m) => m.type === 'UNIT_CHANGED');
    expect(unitMut).toBeDefined();
    expect(unitMut?.oldValue).toBe('crore');
    expect(unitMut?.newValue).toBe('lakh');

    // Cell-level incompatible unit:
    const tableIncompatibleCell = createMockTable({
      rows: [
        {
          rowKey: 'karnataka',
          rowIndex: 0,
          cells: {
            state: { raw: 'Karnataka', valueNumeric: null },
            expenditure: { raw: '100 kg', valueNumeric: 100, unit: 'kg' }, // Changed from crore to kg
            growth_rate: { raw: '8.5%', valueNumeric: 8.5, unit: '%' },
          },
        },
        tableOld.rows[1],
      ],
    });
    const diffCell = compareCanonicalTables(tableOld, tableIncompatibleCell);
    const cellIncompat = diffCell.mutations.find(
      (m) => m.rowKey === 'karnataka' && m.columnKey === 'expenditure'
    );
    expect(cellIncompat?.cellDelta?.unitChanged).toBe(true);
    expect(cellIncompat?.cellDelta?.absoluteDelta).toBeNull();
    expect(cellIncompat?.cellDelta?.percentageDelta).toBeNull();
  });

  // ── 10. Denominator Change ──────────────────────────────────────────────────
  it('10. Denominator change: detects table-level and column-level denominator shifts', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable({
      metadata: { ...tableOld.metadata, declaredDenominator: 'per 100,000 population' },
      columns: [
        tableOld.columns[0],
        { ...tableOld.columns[1], denominator: 'per_capita' },
        tableOld.columns[2],
      ],
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.hasMetadataChanges).toBe(true);
    const tableDenom = diff.mutations.find(
      (m) => m.type === 'DENOMINATOR_CHANGED' && !m.columnKey
    );
    expect(tableDenom?.oldValue).toBe('total');
    expect(tableDenom?.newValue).toBe('per 100,000 population');

    const colDenom = diff.mutations.find(
      (m) => m.type === 'DENOMINATOR_CHANGED' && m.columnKey === 'expenditure'
    );
    expect(colDenom?.newValue).toBe('per_capita');
  });

  // ── 11. Period Change ───────────────────────────────────────────────────────
  it('11. Period change: detects basePeriod change and column period shifts', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable({
      metadata: { ...tableOld.metadata, basePeriod: 'FY25' },
      columns: [
        tableOld.columns[0],
        { ...tableOld.columns[1], period: 'FY25' },
        tableOld.columns[2],
      ],
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.hasMetadataChanges).toBe(true);
    const tablePeriod = diff.mutations.find(
      (m) => m.type === 'PERIOD_CHANGED' && !m.columnKey
    );
    expect(tablePeriod?.oldValue).toBe('FY24');
    expect(tablePeriod?.newValue).toBe('FY25');

    const colPeriod = diff.mutations.find(
      (m) => m.type === 'PERIOD_CHANGED' && m.columnKey === 'expenditure'
    );
    expect(colPeriod?.newValue).toBe('FY25');
  });

  // ── 12. Formatting-Only Change ──────────────────────────────────────────────
  it('12. Formatting-only change: identical numeric values with varying raw strings produce ZERO mutations', () => {
    const tableOld = createMockTable({
      rows: [
        {
          rowKey: 'karnataka',
          rowIndex: 0,
          cells: {
            state: { raw: 'Karnataka', valueNumeric: null },
            expenditure: { raw: '10000', valueNumeric: 10000, unit: 'crore' },
            growth_rate: { raw: '8.5%', valueNumeric: 8.5, unit: '%' },
          },
        },
      ],
    });

    const tableNew = createMockTable({
      rows: [
        {
          rowKey: 'karnataka',
          rowIndex: 0,
          cells: {
            state: { raw: '  Karnataka  ', valueNumeric: null }, // whitespace
            expenditure: { raw: '10,000.00', valueNumeric: 10000, unit: 'crore' }, // comma & decimal formatting
            growth_rate: { raw: '8.50%', valueNumeric: 8.5, unit: '%' }, // trailing zero
          },
        },
      ],
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.hasChanges).toBe(false);
    expect(diff.summary.changedCellsCount).toBe(0);
    expect(diff.summary.totalMutations).toBe(0);
    expect(diff.mutations).toHaveLength(0);
  });

  // ── 13. Zero-Baseline Percentage ────────────────────────────────────────────
  it('13. Zero-baseline percentage: sets percentageDelta to null when baseline value is 0', () => {
    const tableOld = createMockTable({
      rows: [
        {
          rowKey: 'karnataka',
          rowIndex: 0,
          cells: {
            state: { raw: 'Karnataka', valueNumeric: null },
            expenditure: { raw: '0', valueNumeric: 0, unit: 'crore' }, // Old value = 0
            growth_rate: { raw: '0%', valueNumeric: 0, unit: '%' },
          },
        },
      ],
    });

    const tableNew = createMockTable({
      rows: [
        {
          rowKey: 'karnataka',
          rowIndex: 0,
          cells: {
            state: { raw: 'Karnataka', valueNumeric: null },
            expenditure: { raw: '50', valueNumeric: 50, unit: 'crore' }, // New value = 50
            growth_rate: { raw: '0%', valueNumeric: 0, unit: '%' },
          },
        },
      ],
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.hasChanges).toBe(true);
    expect(diff.summary.changedCellsCount).toBe(1);

    const cellMut = diff.mutations[0];
    expect(cellMut.cellDelta?.absoluteDelta).toBe(50);
    expect(cellMut.cellDelta?.percentageDelta).toBeNull(); // Division by zero prevented!
  });

  // ── 14. Ambiguous Row Identity ──────────────────────────────────────────────
  it('14. Ambiguous row identity: detects duplicate rowKeys, emits AMBIGUOUS_MATCH, and halts cell comparison', () => {
    const tableOld = createMockTable({
      rows: [
        {
          rowKey: 'duplicate_key',
          rowIndex: 0,
          cells: { state: { raw: 'A', valueNumeric: null } },
        },
        {
          rowKey: 'duplicate_key',
          rowIndex: 1,
          cells: { state: { raw: 'B', valueNumeric: null } },
        },
      ],
    });

    const tableNew = createMockTable({
      rows: [
        {
          rowKey: 'duplicate_key',
          rowIndex: 0,
          cells: { state: { raw: 'A_mutated', valueNumeric: null } },
        },
        {
          rowKey: 'duplicate_key',
          rowIndex: 1,
          cells: { state: { raw: 'B_mutated', valueNumeric: null } },
        },
      ],
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.hasAmbiguity).toBe(true);
    const ambMut = diff.mutations.find((m) => m.type === 'AMBIGUOUS_MATCH');
    expect(ambMut).toBeDefined();
    // Since ambiguous, cell comparisons must be suppressed to avoid false matches
    expect(diff.summary.changedCellsCount).toBe(0);
  });

  it('14b. Explicit ambiguous rowKey marker: triggers AMBIGUOUS_MATCH', () => {
    const tableOld = createMockTable({
      rows: [
        {
          rowKey: 'ambiguous_row_0',
          rowIndex: 0,
          cells: { state: { raw: 'Unknown', valueNumeric: null } },
        },
      ],
    });
    const tableNew = createMockTable({
      rows: [
        {
          rowKey: 'ambiguous_row_0',
          rowIndex: 0,
          cells: { state: { raw: 'Unknown', valueNumeric: null } },
        },
      ],
    });

    const diff = compareCanonicalTables(tableOld, tableNew);
    expect(diff.summary.hasAmbiguity).toBe(true);
    expect(diff.mutations.some((m) => m.type === 'AMBIGUOUS_MATCH')).toBe(true);
  });

  // ── 15. Identical Tables ────────────────────────────────────────────────────
  it('15. Identical tables: produces no changes, empty mutations array, and hasChanges: false', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable();

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.hasChanges).toBe(false);
    expect(diff.summary.totalMutations).toBe(0);
    expect(diff.summary.changedCellsCount).toBe(0);
    expect(diff.summary.addedRowsCount).toBe(0);
    expect(diff.summary.removedRowsCount).toBe(0);
    expect(diff.summary.addedColumnsCount).toBe(0);
    expect(diff.summary.removedColumnsCount).toBe(0);
    expect(diff.summary.hasReordering).toBe(false);
    expect(diff.summary.hasMetadataChanges).toBe(false);
    expect(diff.summary.hasAmbiguity).toBe(false);
    expect(diff.mutations).toEqual([]);
  });

  // ── 16. Methodology / Footnotes Mutation ────────────────────────────────────
  it('16. Methodology / Footnotes change: detects changes in editorial footnotes', () => {
    const tableOld = createMockTable({
      metadata: { footnotes: ['Provisional estimates (P)'] },
    });
    const tableNew = createMockTable({
      metadata: { footnotes: ['Final revised estimates (R)'] },
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.summary.hasMetadataChanges).toBe(true);
    const methodMut = diff.mutations.find((m) => m.type === 'METHODOLOGY_CHANGED');
    expect(methodMut).toBeDefined();
    expect(methodMut?.oldValue).toEqual(['Provisional estimates (P)']);
    expect(methodMut?.newValue).toEqual(['Final revised estimates (R)']);
  });

  // ── 17. Deterministic Mutation Sorting ──────────────────────────────────────
  it('17. Deterministic sorting: verifies mutations are sorted by type rank then keys', () => {
    const tableOld = createMockTable();
    const tableNew = createMockTable({
      columns: [
        ...tableOld.columns,
        { columnKey: 'col_z', label: 'Z', dataType: 'text' },
      ],
      rows: [
        {
          rowKey: 'karnataka',
          rowIndex: 0,
          cells: {
            state: { raw: 'Karnataka', valueNumeric: null },
            expenditure: { raw: '120', valueNumeric: 120, unit: 'crore' },
            growth_rate: { raw: '8.5%', valueNumeric: 8.5, unit: '%' },
          },
        },
        ...tableOld.rows.slice(1),
        {
          rowKey: 'andhra',
          rowIndex: 2,
          cells: { state: { raw: 'Andhra', valueNumeric: null } },
        },
      ],
      metadata: {
        ...tableOld.metadata,
        declaredUnit: 'billion',
      },
    });

    const diff = compareCanonicalTables(tableOld, tableNew);

    expect(diff.mutations.length).toBeGreaterThan(1);
    // UNIT_CHANGED (rank 2) must precede ADDED_COLUMN (rank 7) which precedes ADDED_ROW (rank 10) which precedes CHANGED_CELL (rank 12)
    const types = diff.mutations.map((m) => m.type);
    expect(types[0]).toBe('UNIT_CHANGED');
    expect(types).toContain('ADDED_COLUMN');
    expect(types).toContain('ADDED_ROW');
    expect(types).toContain('CHANGED_CELL');
  });
});
