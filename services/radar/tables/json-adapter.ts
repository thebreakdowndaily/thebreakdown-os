/**
 * ─── JSON Table Adapter (Phase 4B-3B) ─────────────────────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency)
 *   - .planning/PHASE-4B-3A-STRUCTURED-MUTATION-DESIGN.md
 *
 * Minimum adapter converting array-of-object JSON into a CanonicalTable.
 */

import { createHash } from 'node:crypto';
import type {
  CanonicalTable,
  ColumnDescriptor,
  TableRowRecord,
  CanonicalCell,
} from '@/types/canonical-table';
import { normalizeColumnKey, parseCellContent } from './normalizer';

export function extractJsonTable(
  jsonData: string | Record<string, unknown>[],
  options: {
    archiveId: string;
    sourceId?: string;
    sourceUrl?: string;
    sourceRevisionId?: string;
    title?: string;
    tableIndex?: number;
  }
): CanonicalTable | null {
  let records: Record<string, unknown>[];

  if (typeof jsonData === 'string') {
    try {
      const parsed = JSON.parse(jsonData);
      if (!Array.isArray(parsed)) return null;
      records = parsed;
    } catch {
      return null;
    }
  } else if (Array.isArray(jsonData)) {
    records = jsonData;
  } else {
    return null;
  }

  if (records.length === 0) return null;

  // Determine all distinct keys in deterministic sorted order (preserving first row key order first)
  const keyOrder: string[] = [];
  const seenKeys = new Set<string>();

  for (const item of records) {
    if (item && typeof item === 'object') {
      for (const k of Object.keys(item)) {
        if (!seenKeys.has(k)) {
          seenKeys.add(k);
          keyOrder.push(k);
        }
      }
    }
  }

  if (keyOrder.length === 0) return null;

  const existingColKeys = new Set<string>();
  const columns: ColumnDescriptor[] = keyOrder.map((key) => {
    const columnKey = normalizeColumnKey(key, existingColKeys);
    const parsedHeader = parseCellContent(key);

    return {
      columnKey,
      label: key,
      dataType: parsedHeader.dataType !== 'text' ? parsedHeader.dataType : 'unknown',
      unit: parsedHeader.unit,
      period: parsedHeader.period,
      denominator: parsedHeader.denominator,
    };
  });

  const rows: TableRowRecord[] = [];
  const existingRowKeys = new Set<string>();

  for (let r = 0; r < records.length; r++) {
    const item = records[r] || {};
    const cells: Record<string, CanonicalCell> = {};

    for (let c = 0; c < columns.length; c++) {
      const colDesc = columns[c];
      const rawVal = item[colDesc.label] !== undefined && item[colDesc.label] !== null
        ? String(item[colDesc.label])
        : '';
      const parsed = parseCellContent(rawVal, colDesc.unit, colDesc.period, colDesc.denominator);
      cells[colDesc.columnKey] = parsed;
    }

    // Determine rowKey from first categorical/text column
    let naturalRowKey = '';
    for (let c = 0; c < columns.length; c++) {
      const raw = cells[columns[c].columnKey]?.raw?.trim();
      if (raw && !/^-?\d+(?:\.\d+)?$/.test(raw.replace(/,/g, ''))) {
        naturalRowKey = raw;
        break;
      }
    }

    const rowIndex = r;
    const baseRowKey = naturalRowKey ? naturalRowKey : `row_${rowIndex + 1}`;
    let finalRowKey = baseRowKey;
    let dupCounter = 2;
    while (existingRowKeys.has(finalRowKey)) {
      finalRowKey = `${baseRowKey}__${dupCounter}`;
      dupCounter++;
    }
    existingRowKeys.add(finalRowKey);

    rows.push({
      rowKey: finalRowKey,
      rowIndex,
      cells,
    });
  }

  // Refine column data types from row values
  columns.forEach((col) => {
    const colCells = rows.map((r) => r.cells[col.columnKey]).filter((c) => c && c.valueNumeric !== null);
    if (colCells.length > 0 && colCells.length >= rows.length * 0.5) {
      const hasPct = colCells.some((c) => c.unit === '%');
      const hasCurrency = colCells.some((c) => c.unit?.includes('inr') || c.unit?.includes('usd'));
      if (hasPct) col.dataType = 'percentage';
      else if (hasCurrency) col.dataType = 'currency';
      else col.dataType = 'numeric';
    } else if (col.dataType === 'unknown') {
      col.dataType = 'text';
    }
  });

  const tableIndex = options.tableIndex ?? 0;
  const colKeySignature = columns.map((c) => c.columnKey).join(';');
  const tableId = createHash('sha256')
    .update(`${options.archiveId}::json_${tableIndex}::${colKeySignature}`)
    .digest('hex');

  return {
    id: tableId,
    archiveId: options.archiveId,
    sourceId: options.sourceId,
    tableIndex,
    title: options.title,
    columns,
    rows,
    metadata: {
      declaredUnit: columns.find((c) => c.unit)?.unit,
      declaredDenominator: columns.find((c) => c.denominator)?.denominator,
      extractionStatus: 'complete',
      sourceUrl: options.sourceUrl,
      sourceId: options.sourceId,
      sourceRevisionId: options.sourceRevisionId,
      extractorVersion: '1.0-json-adapter',
    },
  };
}
