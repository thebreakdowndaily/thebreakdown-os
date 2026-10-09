/**
 * ─── Tabular Mutation Engine (Phase 4B-3C Milestone 2) ────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency, Platform Beta)
 *   - .planning/PHASE-4B-3A-STRUCTURED-MUTATION-DESIGN.md
 *
 * Pure, deterministic comparison engine between two CanonicalTable instances:
 * CanonicalTable A → CanonicalTable B → TabularDiffResult
 *
 * Derived analysis only. Zero side effects on claims, evidence, or publication.
 */

import type {
  CanonicalTable,
  TabularDiffResult,
  TabularDiffSummary,
  TabularMutation,
  TabularMutationType,
  CellDelta,
} from '@/types/canonical-table';

const MUTATION_TYPE_ORDER: Record<TabularMutationType, number> = {
  AMBIGUOUS_MATCH: 1,
  UNIT_CHANGED: 2,
  DENOMINATOR_CHANGED: 3,
  PERIOD_CHANGED: 4,
  METHODOLOGY_CHANGED: 5,
  REMOVED_COLUMN: 6,
  ADDED_COLUMN: 7,
  REORDERED_COLUMN: 8,
  REMOVED_ROW: 9,
  ADDED_ROW: 10,
  REORDERED_ROW: 11,
  CHANGED_CELL: 12,
};

export function compareCanonicalTables(
  tableOld: CanonicalTable,
  tableNew: CanonicalTable
): TabularDiffResult {
  const mutations: TabularMutation[] = [];

  // ── 1. Table-Level Metadata Comparison ──────────────────────────────────────
  const oldMeta = tableOld.metadata || {};
  const newMeta = tableNew.metadata || {};

  // Table-level Unit change
  if (oldMeta.declaredUnit && newMeta.declaredUnit && oldMeta.declaredUnit !== newMeta.declaredUnit) {
    mutations.push({
      type: 'UNIT_CHANGED',
      description: `Table declared unit changed from "${oldMeta.declaredUnit}" to "${newMeta.declaredUnit}"`,
      oldValue: oldMeta.declaredUnit,
      newValue: newMeta.declaredUnit,
    });
  }

  // Table-level Denominator change
  if (
    oldMeta.declaredDenominator &&
    newMeta.declaredDenominator &&
    oldMeta.declaredDenominator !== newMeta.declaredDenominator
  ) {
    mutations.push({
      type: 'DENOMINATOR_CHANGED',
      description: `Table declared denominator changed from "${oldMeta.declaredDenominator}" to "${newMeta.declaredDenominator}"`,
      oldValue: oldMeta.declaredDenominator,
      newValue: newMeta.declaredDenominator,
    });
  }

  // Base Period / Methodology change
  if (oldMeta.basePeriod && newMeta.basePeriod && oldMeta.basePeriod !== newMeta.basePeriod) {
    mutations.push({
      type: 'PERIOD_CHANGED',
      description: `Table base period changed from "${oldMeta.basePeriod}" to "${newMeta.basePeriod}"`,
      oldValue: oldMeta.basePeriod,
      newValue: newMeta.basePeriod,
    });
  }

  // Footnote / Methodology text change
  const oldFootnotes = (oldMeta.footnotes || []).join(' | ').trim();
  const newFootnotes = (newMeta.footnotes || []).join(' | ').trim();
  if (oldFootnotes !== newFootnotes && (oldFootnotes.length > 0 || newFootnotes.length > 0)) {
    mutations.push({
      type: 'METHODOLOGY_CHANGED',
      description: `Table footnotes or methodology statement modified`,
      oldValue: oldMeta.footnotes || [],
      newValue: newMeta.footnotes || [],
    });
  }

  // ── 2. Column Schema Comparison ─────────────────────────────────────────────
  const oldColumns = tableOld.columns || [];
  const newColumns = tableNew.columns || [];

  const oldColMap = new Map(oldColumns.map((c) => [c.columnKey, c]));
  const newColMap = new Map(newColumns.map((c) => [c.columnKey, c]));

  const oldColKeys = oldColumns.map((c) => c.columnKey);
  const newColKeys = newColumns.map((c) => c.columnKey);

  // Removed columns
  for (const c of oldColumns) {
    if (!newColMap.has(c.columnKey)) {
      mutations.push({
        type: 'REMOVED_COLUMN',
        description: `Column "${c.label}" (${c.columnKey}) was removed`,
        columnKey: c.columnKey,
        oldValue: c,
      });
    }
  }

  // Added columns
  for (const c of newColumns) {
    if (!oldColMap.has(c.columnKey)) {
      mutations.push({
        type: 'ADDED_COLUMN',
        description: `Column "${c.label}" (${c.columnKey}) was added`,
        columnKey: c.columnKey,
        newValue: c,
      });
    }
  }

  // Column order check
  const commonOldColKeys = oldColKeys.filter((k) => newColMap.has(k));
  const commonNewColKeys = newColKeys.filter((k) => oldColMap.has(k));
  if (commonOldColKeys.join(';') !== commonNewColKeys.join(';')) {
    mutations.push({
      type: 'REORDERED_COLUMN',
      description: `Columns were reordered`,
      oldValue: commonOldColKeys,
      newValue: commonNewColKeys,
    });
  }

  // Column-level metadata changes for common columns
  for (const k of commonOldColKeys) {
    const colOld = oldColMap.get(k)!;
    const colNew = newColMap.get(k)!;

    if (colOld.unit !== colNew.unit && (colOld.unit || colNew.unit)) {
      mutations.push({
        type: 'UNIT_CHANGED',
        description: `Column "${colOld.label}" unit changed from "${colOld.unit || 'none'}" to "${colNew.unit || 'none'}"`,
        columnKey: k,
        oldValue: colOld.unit,
        newValue: colNew.unit,
      });
    }

    if (colOld.period !== colNew.period && (colOld.period || colNew.period)) {
      mutations.push({
        type: 'PERIOD_CHANGED',
        description: `Column "${colOld.label}" period changed from "${colOld.period || 'none'}" to "${colNew.period || 'none'}"`,
        columnKey: k,
        oldValue: colOld.period,
        newValue: colNew.period,
      });
    }

    if (colOld.denominator !== colNew.denominator && (colOld.denominator || colNew.denominator)) {
      mutations.push({
        type: 'DENOMINATOR_CHANGED',
        description: `Column "${colOld.label}" denominator changed from "${colOld.denominator || 'none'}" to "${colNew.denominator || 'none'}"`,
        columnKey: k,
        oldValue: colOld.denominator,
        newValue: colNew.denominator,
      });
    }
  }

  // ── 3. Row Matching & Ambiguity Check ───────────────────────────────────────
  const oldRows = tableOld.rows || [];
  const newRows = tableNew.rows || [];

  // Check for duplicate row keys within tableOld
  const seenOldKeys = new Set<string>();
  const duplicateOldKeys = new Set<string>();
  for (const r of oldRows) {
    if (seenOldKeys.has(r.rowKey)) duplicateOldKeys.add(r.rowKey);
    seenOldKeys.add(r.rowKey);
  }

  // Check for duplicate row keys within tableNew
  const seenNewKeys = new Set<string>();
  const duplicateNewKeys = new Set<string>();
  for (const r of newRows) {
    if (seenNewKeys.has(r.rowKey)) duplicateNewKeys.add(r.rowKey);
    seenNewKeys.add(r.rowKey);
  }

  let hasAmbiguousKeys = false;
  if (duplicateOldKeys.size > 0 || duplicateNewKeys.size > 0) {
    hasAmbiguousKeys = true;
    const dupes = Array.from(new Set([...duplicateOldKeys, ...duplicateNewKeys]));
    mutations.push({
      type: 'AMBIGUOUS_MATCH',
      description: `Ambiguous row identity detected due to non-unique row keys: ${dupes.join(', ')}`,
      oldValue: Array.from(duplicateOldKeys),
      newValue: Array.from(duplicateNewKeys),
    });
  }

  // Explicit ambiguity check: if row keys contain explicit ambiguous marker
  const oldHasAmbiguousMarker = oldRows.some((r) => r.rowKey.startsWith('ambiguous_') || r.rowKey === 'AMBIGUOUS');
  const newHasAmbiguousMarker = newRows.some((r) => r.rowKey.startsWith('ambiguous_') || r.rowKey === 'AMBIGUOUS');
  if (oldHasAmbiguousMarker || newHasAmbiguousMarker) {
    hasAmbiguousKeys = true;
    mutations.push({
      type: 'AMBIGUOUS_MATCH',
      description: `Row identity marked explicitly ambiguous`,
    });
  }

  const oldRowMap = new Map(oldRows.map((r) => [r.rowKey, r]));
  const newRowMap = new Map(newRows.map((r) => [r.rowKey, r]));

  const oldRowKeys = oldRows.map((r) => r.rowKey);
  const newRowKeys = newRows.map((r) => r.rowKey);

  // Removed rows
  for (const r of oldRows) {
    if (!newRowMap.has(r.rowKey)) {
      mutations.push({
        type: 'REMOVED_ROW',
        description: `Row with key "${r.rowKey}" was removed`,
        rowKey: r.rowKey,
        oldValue: r,
      });
    }
  }

  // Added rows
  for (const r of newRows) {
    if (!oldRowMap.has(r.rowKey)) {
      mutations.push({
        type: 'ADDED_ROW',
        description: `Row with key "${r.rowKey}" was added`,
        rowKey: r.rowKey,
        newValue: r,
      });
    }
  }

  // Row order check
  const commonOldRowKeys = oldRowKeys.filter((k) => newRowMap.has(k));
  const commonNewRowKeys = newRowKeys.filter((k) => oldRowMap.has(k));
  if (commonOldRowKeys.join(';') !== commonNewRowKeys.join(';')) {
    mutations.push({
      type: 'REORDERED_ROW',
      description: `Rows were reordered`,
      oldValue: commonOldRowKeys,
      newValue: commonNewRowKeys,
    });
  }

  // ── 4. Cell-by-Cell Comparison ──────────────────────────────────────────────
  // Only compare cells for common rows and common columns when row keys are unambiguous
  if (!hasAmbiguousKeys) {
    for (const rKey of commonOldRowKeys) {
      const rowOld = oldRowMap.get(rKey)!;
      const rowNew = newRowMap.get(rKey)!;

      for (const cKey of commonOldColKeys) {
        const cellOld = rowOld.cells[cKey] || { raw: '', valueNumeric: null };
        const cellNew = rowNew.cells[cKey] || { raw: '', valueNumeric: null };

        const isBothNumeric = cellOld.valueNumeric !== null && cellNew.valueNumeric !== null;

        if (isBothNumeric) {
          const numOld = cellOld.valueNumeric!;
          const numNew = cellNew.valueNumeric!;
          const unitsEqual = (cellOld.unit || '') === (cellNew.unit || '');

          // Check numerical equality
          if (numOld === numNew && unitsEqual) {
            // Equivalent! Formatting changes (e.g. 10000 vs 10,000) produce no mutation
            continue;
          }

          // Incompatible units check: never calculate numerical delta across mismatched units
          if (!unitsEqual && cellOld.unit && cellNew.unit) {
            mutations.push({
              type: 'CHANGED_CELL',
              description: `Cell [${rKey}, ${cKey}] unit changed from "${cellOld.unit}" to "${cellNew.unit}"`,
              rowKey: rKey,
              columnKey: cKey,
              cellDelta: {
                rowKey: rKey,
                columnKey: cKey,
                oldValue: cellOld,
                newValue: cellNew,
                absoluteDelta: null,
                percentageDelta: null,
                unitChanged: true,
              },
            });
            continue;
          }

          // Calculate Deltas
          const absoluteDelta = Number((numNew - numOld).toFixed(6));
          let percentageDelta: number | null = null;

          if (numOld !== 0) {
            percentageDelta = Number((((numNew - numOld) / Math.abs(numOld)) * 100).toFixed(4));
          } else {
            // Zero baseline: percentage change is mathematically invalid / undefined
            percentageDelta = null;
          }

          mutations.push({
            type: 'CHANGED_CELL',
            description: `Cell [${rKey}, ${cKey}] changed from ${numOld} to ${numNew} (Δ: ${absoluteDelta}${percentageDelta !== null ? `, ${percentageDelta}%` : ''})`,
            rowKey: rKey,
            columnKey: cKey,
            cellDelta: {
              rowKey: rKey,
              columnKey: cKey,
              oldValue: cellOld,
              newValue: cellNew,
              absoluteDelta,
              percentageDelta,
              unitChanged: false,
            },
          });
        } else {
          // Textual comparison
          const oldText = cellOld.raw.trim();
          const newText = cellNew.raw.trim();

          if (oldText !== newText) {
            mutations.push({
              type: 'CHANGED_CELL',
              description: `Cell [${rKey}, ${cKey}] text changed from "${oldText}" to "${newText}"`,
              rowKey: rKey,
              columnKey: cKey,
              cellDelta: {
                rowKey: rKey,
                columnKey: cKey,
                oldValue: cellOld,
                newValue: cellNew,
                absoluteDelta: null,
                percentageDelta: null,
                unitChanged: cellOld.unit !== cellNew.unit,
              },
            });
          }
        }
      }
    }
  }

  // ── 5. Deterministic Mutation Sorting ───────────────────────────────────────
  mutations.sort((a, b) => {
    const rankA = MUTATION_TYPE_ORDER[a.type] || 99;
    const rankB = MUTATION_TYPE_ORDER[b.type] || 99;
    if (rankA !== rankB) return rankA - rankB;

    const rowComp = (a.rowKey || '').localeCompare(b.rowKey || '');
    if (rowComp !== 0) return rowComp;

    return (a.columnKey || '').localeCompare(b.columnKey || '');
  });

  // ── 6. Summary Computation ──────────────────────────────────────────────────
  const changedCellsCount = mutations.filter((m) => m.type === 'CHANGED_CELL').length;
  const addedRowsCount = mutations.filter((m) => m.type === 'ADDED_ROW').length;
  const removedRowsCount = mutations.filter((m) => m.type === 'REMOVED_ROW').length;
  const addedColumnsCount = mutations.filter((m) => m.type === 'ADDED_COLUMN').length;
  const removedColumnsCount = mutations.filter((m) => m.type === 'REMOVED_COLUMN').length;
  const hasReordering = mutations.some((m) => m.type === 'REORDERED_ROW' || m.type === 'REORDERED_COLUMN');
  const hasMetadataChanges = mutations.some((m) =>
    ['UNIT_CHANGED', 'DENOMINATOR_CHANGED', 'PERIOD_CHANGED', 'METHODOLOGY_CHANGED'].includes(m.type)
  );
  const hasAmbiguity = mutations.some((m) => m.type === 'AMBIGUOUS_MATCH');

  const summary: TabularDiffSummary = {
    hasChanges: mutations.length > 0,
    totalMutations: mutations.length,
    changedCellsCount,
    addedRowsCount,
    removedRowsCount,
    addedColumnsCount,
    removedColumnsCount,
    hasReordering,
    hasMetadataChanges,
    hasAmbiguity,
  };

  return {
    tableIdOld: tableOld.id,
    tableIdNew: tableNew.id,
    archiveIdOld: tableOld.archiveId,
    archiveIdNew: tableNew.archiveId,
    summary,
    mutations,
  };
}
