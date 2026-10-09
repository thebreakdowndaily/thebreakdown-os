/**
 * ─── CSV Table Adapter (Phase 4B-3B) ──────────────────────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency)
 *   - .planning/PHASE-4B-3A-STRUCTURED-MUTATION-DESIGN.md
 *
 * Minimum adapter converting multi-column CSV text into a CanonicalTable.
 * Does not modify or replace the existing legacy dataset subsystem.
 */

import { createHash } from 'node:crypto';
import type {
  CanonicalTable,
  ColumnDescriptor,
  TableRowRecord,
  CanonicalCell,
} from '@/types/canonical-table';
import { normalizeColumnKey, parseCellContent } from './normalizer';

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function extractCsvTable(
  csvText: string,
  options: {
    archiveId: string;
    sourceId?: string;
    sourceUrl?: string;
    sourceRevisionId?: string;
    title?: string;
    tableIndex?: number;
  }
): CanonicalTable | null {
  if (!csvText || csvText.trim().length === 0) return null;

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return null; // Must have at least 1 header line and 1 data row
  }

  const rawHeaders = parseCsvLine(lines[0]);
  if (rawHeaders.length === 0) return null;

  const existingColKeys = new Set<string>();
  const columns: ColumnDescriptor[] = rawHeaders.map((headerLabel, idx) => {
    const cleanLabel = headerLabel || `Column ${idx + 1}`;
    const columnKey = normalizeColumnKey(cleanLabel, existingColKeys);
    const parsedHeader = parseCellContent(cleanLabel);

    return {
      columnKey,
      label: cleanLabel,
      dataType: parsedHeader.dataType !== 'text' ? parsedHeader.dataType : 'unknown',
      unit: parsedHeader.unit,
      period: parsedHeader.period,
      denominator: parsedHeader.denominator,
    };
  });

  const rows: TableRowRecord[] = [];
  const existingRowKeys = new Set<string>();

  for (let r = 1; r < lines.length; r++) {
    const rawTokens = parseCsvLine(lines[r]);
    const cells: Record<string, CanonicalCell> = {};

    for (let c = 0; c < columns.length; c++) {
      const colDesc = columns[c];
      const rawVal = rawTokens[c] !== undefined ? rawTokens[c] : '';
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

    const rowIndex = r - 1;
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
    .update(`${options.archiveId}::csv_${tableIndex}::${colKeySignature}`)
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
      extractorVersion: '1.0-csv-adapter',
    },
  };
}
