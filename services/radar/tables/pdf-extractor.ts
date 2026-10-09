/**
 * ─── PDF Table Extractor (Phase 4B-3B) ────────────────────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency)
 *   - .planning/PHASE-4B-3A-STRUCTURED-MUTATION-DESIGN.md
 *
 * Uses existing in-house PDF parser capabilities.
 * Does NOT invent spatial coordinates.
 * Returns explicit 'unsupported' or 'partial' status when deterministic 2D
 * coordinates cannot be recovered from raw FlateDecode text streams.
 */

import { createHash } from 'node:crypto';
import type { CanonicalTable } from '@/types/canonical-table';
import { parsePdfBuffer } from '../collectors/pdf-parser';
import { extractCsvTable } from './csv-adapter';

export function extractPdfTables(
  pdfInput: Buffer | string,
  options: {
    archiveId: string;
    sourceId?: string;
    sourceUrl?: string;
    sourceRevisionId?: string;
  }
): CanonicalTable[] {
  let extractedText = '';

  if (Buffer.isBuffer(pdfInput)) {
    try {
      const parsedDoc = parsePdfBuffer(pdfInput);
      extractedText = parsedDoc.text;
    } catch {
      // Fallback
      extractedText = pdfInput.toString('utf-8');
    }
  } else if (typeof pdfInput === 'string') {
    extractedText = pdfInput;
  }

  // Check if text has explicit tab-delimited blocks (e.g. copied text with tabs)
  const lines = extractedText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const tabLines = lines.filter((l) => l.includes('\t'));

  if (tabLines.length >= 2) {
    // Attempt partial tab-separated table recovery
    const tsvContent = tabLines.map((l) => l.split('\t').map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const table = extractCsvTable(tsvContent, {
      archiveId: options.archiveId,
      sourceId: options.sourceId,
      sourceUrl: options.sourceUrl,
      sourceRevisionId: options.sourceRevisionId,
      title: 'Extracted Tab-Delimited PDF Table',
      tableIndex: 0,
    });

    if (table) {
      table.metadata.extractionStatus = 'partial';
      table.metadata.extractionWarnings = [
        'Extracted from plain tab-delimited text without 2D bounding boxes.',
      ];
      table.metadata.extractorVersion = '1.0-pdf-tab-fallback';
      return [table];
    }
  }

  // Deterministic refusal: Cannot invent spatial coordinates from unstructured 1D PDF streams
  const tableId = createHash('sha256')
    .update(`${options.archiveId}::pdf_unsupported::0`)
    .digest('hex');

  const unsupportedTable: CanonicalTable = {
    id: tableId,
    archiveId: options.archiveId,
    sourceId: options.sourceId,
    tableIndex: 0,
    title: 'Unsupported PDF Tabular Layout',
    columns: [],
    rows: [],
    metadata: {
      extractionStatus: 'unsupported',
      extractionWarnings: [
        'PDF tabular 2D spatial layout cannot be deterministically reconstructed from raw text streams without font bounding box coordinates.',
      ],
      sourceUrl: options.sourceUrl,
      sourceId: options.sourceId,
      sourceRevisionId: options.sourceRevisionId,
      extractorVersion: '1.0-pdf-deterministic-refusal',
    },
  };

  return [unsupportedTable];
}
