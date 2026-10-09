/**
 * ─── HTML Table Extractor (Phase 4B-3B) ───────────────────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency)
 *   - .planning/PHASE-4B-3A-STRUCTURED-MUTATION-DESIGN.md
 *
 * Robust, zero-dependency HTML table extractor supporting thead, tbody, tr,
 * th, td, rowspan, and colspan. Produces deterministic CanonicalTable structures
 * before any HTML text flattening occurs.
 */

import { createHash } from 'node:crypto';
import type {
  CanonicalTable,
  ColumnDescriptor,
  TableRowRecord,
  CanonicalCell,
  CanonicalDataType,
} from '@/types/canonical-table';
import { normalizeColumnKey, parseCellContent } from './normalizer';

interface ParsedRawCell {
  text: string;
  isHeader: boolean;
  rowspan: number;
  colspan: number;
  isSpanned?: boolean;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–');
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

export function extractHtmlTables(
  html: string,
  options: {
    archiveId: string;
    sourceId?: string;
    sourceUrl?: string;
    sourceRevisionId?: string;
  }
): CanonicalTable[] {
  if (!html) return [];

  const tables: CanonicalTable[] = [];
  const tableRegex = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch: RegExpExecArray | null;
  let tableIndex = 0;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];

    // 1. Extract Title / Caption
    let title: string | undefined;
    const captionMatch = tableHtml.match(/<caption\b[^>]*>([\s\S]*?)<\/caption>/i);
    if (captionMatch && captionMatch[1]) {
      title = stripTags(captionMatch[1]);
    }

    // 2. Extract Footnotes / Metadata from summary or surrounding text
    const footnotes: string[] = [];
    const noteMatch = tableHtml.match(/<(?:tfoot|tr|p|div)\b[^>]*>([\s\S]*?(?:Note|Source|Footnote|\*)[^<]*)<\/(?:tfoot|tr|p|div)>/i);
    if (noteMatch && noteMatch[1]) {
      const fnText = stripTags(noteMatch[1]);
      if (fnText.length > 3) footnotes.push(fnText);
    }

    // 3. Extract Rows and parse 2D Grid with Rowspan/Colspan
    const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;
    const rawRows: Array<{ isThead: boolean; cells: ParsedRawCell[] }> = [];

    // Check if the table has an explicit <thead> block
    const theadRegex = /<thead\b[^>]*>([\s\S]*?)<\/thead>/gi;
    const theadBlocks: string[] = [];
    let theadMatch: RegExpExecArray | null;
    while ((theadMatch = theadRegex.exec(tableHtml)) !== null) {
      theadBlocks.push(theadMatch[1]);
    }

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowContent = rowMatch[1];
      const isTheadRow = theadBlocks.some((block) => block.includes(rowContent));

      const cellRegex = /<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>|<(th|td)\b([^>]*)>([^<]*)/gi;
      let cellMatch: RegExpExecArray | null;
      const rowCells: ParsedRawCell[] = [];

      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        const tag = (cellMatch[1] || cellMatch[4] || 'td').toLowerCase();
        const attrs = cellMatch[2] || cellMatch[5] || '';
        const innerContent = cellMatch[3] !== undefined ? cellMatch[3] : (cellMatch[6] || '');

        const rowspanMatch = attrs.match(/rowspan=["']?(\d+)["']?/i);
        const colspanMatch = attrs.match(/colspan=["']?(\d+)["']?/i);

        const rowspan = rowspanMatch ? Math.max(1, parseInt(rowspanMatch[1], 10)) : 1;
        const colspan = colspanMatch ? Math.max(1, parseInt(colspanMatch[1], 10)) : 1;

        rowCells.push({
          text: stripTags(innerContent),
          isHeader: tag === 'th' || isTheadRow,
          rowspan,
          colspan,
        });
      }

      if (rowCells.length > 0) {
        rawRows.push({ isThead: isTheadRow, cells: rowCells });
      }
    }

    if (rawRows.length === 0) {
      continue;
    }

    // 4. Build 2D Virtual Grid resolving Rowspan and Colspan
    const grid: ParsedRawCell[][] = [];

    for (let r = 0; r < rawRows.length; r++) {
      if (!grid[r]) grid[r] = [];
      const currentRawCells = rawRows[r].cells;
      let cellPointer = 0;
      let c = 0;

      while (cellPointer < currentRawCells.length) {
        // Advance column index past any cell already placed by a previous row's rowspan
        while (grid[r][c] !== undefined) {
          c++;
        }

        const cell = currentRawCells[cellPointer];
        cellPointer++;

        // Place cell and all its spanned copies in the virtual grid
        for (let dr = 0; dr < cell.rowspan; dr++) {
          const targetRow = r + dr;
          if (!grid[targetRow]) grid[targetRow] = [];

          for (let dc = 0; dc < cell.colspan; dc++) {
            const targetCol = c + dc;
            grid[targetRow][targetCol] = {
              text: cell.text,
              isHeader: cell.isHeader,
              rowspan: 1,
              colspan: 1,
              isSpanned: dr > 0 || dc > 0,
            };
          }
        }

        c += cell.colspan;
      }
    }

    if (grid.length === 0) continue;

    // 5. Determine Header Rows vs Data Rows
    // Header candidates: either marked with isHeader or in thead
    let headerRowCount = 0;
    while (
      headerRowCount < grid.length &&
      (grid[headerRowCount].some((cell) => cell.isHeader) ||
        (headerRowCount === 0 && rawRows[0]?.isThead))
    ) {
      headerRowCount++;
    }

    // If no explicit <th> or <thead> found, check if row 0 has all non-numeric text labels
    if (headerRowCount === 0 && grid.length > 1) {
      const row0 = grid[0];
      const allTextLabels = row0.every(
        (cell) => !/^\d+(?:\.\d+)?$/.test(cell.text.replace(/,/g, '').trim())
      );
      if (allTextLabels) {
        headerRowCount = 1;
      }
    }

    // Maximum column count across all rows in grid
    const maxCols = Math.max(...grid.map((row) => row.length));
    if (maxCols === 0) continue;

    // 6. Construct Column Descriptors
    const columnLabels: string[] = [];
    for (let c = 0; c < maxCols; c++) {
      const headerParts: string[] = [];
      for (let hr = 0; hr < headerRowCount; hr++) {
        const text = grid[hr]?.[c]?.text?.trim();
        if (text && !headerParts.includes(text)) {
          headerParts.push(text);
        }
      }
      const label = headerParts.join(' - ') || `Column ${c + 1}`;
      columnLabels.push(label);
    }

    const existingKeys = new Set<string>();
    const columns: ColumnDescriptor[] = columnLabels.map((label) => {
      const columnKey = normalizeColumnKey(label, existingKeys);
      let inferredType: CanonicalDataType = 'text';

      // Detect column-level unit / period / denominator from header label
      const parsedHeader = parseCellContent(label);
      if (parsedHeader.unit) inferredType = parsedHeader.dataType;

      return {
        columnKey,
        label,
        dataType: inferredType,
        unit: parsedHeader.unit,
        period: parsedHeader.period,
        denominator: parsedHeader.denominator,
      };
    });

    // 7. Construct Row Records
    const dataStartRow = headerRowCount;
    const rows: TableRowRecord[] = [];
    const existingRowKeys = new Set<string>();

    for (let r = dataStartRow; r < grid.length; r++) {
      const gridRow = grid[r] || [];
      const cells: Record<string, CanonicalCell> = {};

      for (let c = 0; c < columns.length; c++) {
        const colDesc = columns[c];
        const cellGrid = gridRow[c];
        const rawText = cellGrid?.text || '';

        const parsed = parseCellContent(
          rawText,
          colDesc.unit,
          colDesc.period,
          colDesc.denominator
        );

        if (cellGrid?.isSpanned) {
          parsed.flags = [...(parsed.flags || []), 'spanned'];
        }

        cells[colDesc.columnKey] = parsed;
      }

      // Determine deterministic row key
      let naturalRowKey = '';
      for (let c = 0; c < columns.length; c++) {
        const raw = cells[columns[c].columnKey]?.raw?.trim();
        // Pick first non-empty text column
        if (raw && !/^-?\d+(?:\.\d+)?$/.test(raw.replace(/,/g, ''))) {
          naturalRowKey = raw;
          break;
        }
      }

      const rowIndex = r - dataStartRow;
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

    // Refine column data types based on row values
    columns.forEach((col) => {
      const colCells = rows.map((r) => r.cells[col.columnKey]).filter((c) => c && c.valueNumeric !== null);
      if (colCells.length > 0 && colCells.length >= rows.length * 0.5) {
        const hasPct = colCells.some((c) => c.unit === '%');
        const hasCurrency = colCells.some((c) => c.unit?.includes('inr') || c.unit?.includes('usd'));
        if (hasPct) col.dataType = 'percentage';
        else if (hasCurrency) col.dataType = 'currency';
        else col.dataType = 'numeric';
      }
    });

    // 8. Generate Deterministic Table ID
    const colKeySignature = columns.map((c) => c.columnKey).join(';');
    const tableId = createHash('sha256')
      .update(`${options.archiveId}::table_${tableIndex}::${colKeySignature}`)
      .digest('hex');

    tables.push({
      id: tableId,
      archiveId: options.archiveId,
      sourceId: options.sourceId,
      tableIndex,
      title,
      columns,
      rows,
      metadata: {
        declaredUnit: columns.find((c) => c.unit)?.unit,
        declaredDenominator: columns.find((c) => c.denominator)?.denominator,
        footnotes: footnotes.length > 0 ? footnotes : undefined,
        extractionStatus: 'complete',
        sourceUrl: options.sourceUrl,
        sourceId: options.sourceId,
        sourceRevisionId: options.sourceRevisionId,
        extractorVersion: '1.0-deterministic-grid',
      },
    });

    tableIndex++;
  }

  return tables;
}
