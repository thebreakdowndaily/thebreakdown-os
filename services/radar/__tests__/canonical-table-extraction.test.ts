/**
 * ─── Phase 4B-3B: Canonical Table Extraction Test Suite ───────────────────────
 *
 * Test Matrix Criteria:
 *   1. HTML multi-column table
 *   2. HTML rowspan/colspan
 *   3. CSV multi-column
 *   4. JSON array-of-objects
 *   5. Same input → identical output (byte-for-byte determinism)
 *   6. Numeric parsing
 *   7. Percentage parsing
 *   8. Unit preservation
 *   9. Period preservation
 *  10. Missing/null values
 *  11. Unsupported/ambiguous structure
 */

import { describe, it, expect } from 'vitest';
import {
  extractHtmlTables,
  extractCsvTable,
  extractJsonTable,
  extractPdfTables,
  parseCellContent,
  convertDevanagariDigits,
} from '../tables';

describe('PHASE 4B-3B: CANONICAL TABLE EXTRACTION (MILESTONE 1)', () => {
  const archiveId = '71628590-9799-42ac-9496-7653539d9ba6';
  const sourceId = 'radar-mpinfo-html';

  // ── 1. HTML Multi-Column Table ──────────────────────────────────────────────
  it('1. HTML multi-column table: Extracts 2D structure with normalized headers', () => {
    const html = `
      <table id="budget-summary">
        <caption>Madhya Pradesh Departmental Allocations</caption>
        <thead>
          <tr>
            <th>Department</th>
            <th>Budget Estimate (FY25)</th>
            <th>Revised Estimate (FY24)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Health & Family Welfare</td>
            <td>12,500.50</td>
            <td>11,200.00</td>
          </tr>
          <tr>
            <td>School Education</td>
            <td>18,400.25</td>
            <td>17,100.00</td>
          </tr>
        </tbody>
      </table>
    `;

    const tables = extractHtmlTables(html, { archiveId, sourceId });
    expect(tables.length).toBe(1);

    const table = tables[0];
    expect(table.archiveId).toBe(archiveId);
    expect(table.sourceId).toBe(sourceId);
    expect(table.title).toBe('Madhya Pradesh Departmental Allocations');
    expect(table.columns.length).toBe(3);
    expect(table.columns[0].columnKey).toBe('department');
    expect(table.columns[1].columnKey).toBe('budget_estimate_fy25');
    expect(table.columns[2].columnKey).toBe('revised_estimate_fy24');

    expect(table.rows.length).toBe(2);
    expect(table.rows[0].rowKey).toBe('Health & Family Welfare');
    expect(table.rows[0].cells['department'].raw).toBe('Health & Family Welfare');
    expect(table.rows[0].cells['budget_estimate_fy25'].valueNumeric).toBe(12500.5);
    expect(table.rows[0].cells['revised_estimate_fy24'].valueNumeric).toBe(11200.0);

    expect(table.rows[1].rowKey).toBe('School Education');
    expect(table.rows[1].cells['budget_estimate_fy25'].valueNumeric).toBe(18400.25);
  });

  // ── 2. HTML Rowspan and Colspan ─────────────────────────────────────────────
  it('2. HTML rowspan/colspan: Resolves multi-dimensional grid spanning correctly', () => {
    const html = `
      <table>
        <thead>
          <tr>
            <th rowspan="2">State / District</th>
            <th colspan="2">Financial Figures (₹ Cr)</th>
          </tr>
          <tr>
            <th>Allocated</th>
            <th>Disbursed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="2">Madhya Pradesh</td>
            <td>1,217.05</td>
            <td>950.00</td>
          </tr>
          <tr>
            <td>340.50</td>
            <td>300.00</td>
          </tr>
        </tbody>
      </table>
    `;

    const tables = extractHtmlTables(html, { archiveId, sourceId });
    expect(tables.length).toBe(1);

    const table = tables[0];
    expect(table.columns.length).toBe(3);
    // Hierarchical header labels resolved
    expect(table.columns[0].label).toBe('State / District');
    expect(table.columns[1].label).toBe('Financial Figures (₹ Cr) - Allocated');
    expect(table.columns[2].label).toBe('Financial Figures (₹ Cr) - Disbursed');

    expect(table.rows.length).toBe(2);
    // Row 0 has Madhya Pradesh
    expect(table.rows[0].cells[table.columns[0].columnKey].raw).toBe('Madhya Pradesh');
    expect(table.rows[0].cells[table.columns[1].columnKey].valueNumeric).toBe(1217.05);

    // Row 1 inherits Madhya Pradesh from rowspan with spanned flag
    expect(table.rows[1].cells[table.columns[0].columnKey].raw).toBe('Madhya Pradesh');
    expect(table.rows[1].cells[table.columns[0].columnKey].flags).toContain('spanned');
    expect(table.rows[1].cells[table.columns[1].columnKey].valueNumeric).toBe(340.5);
    expect(table.rows[1].cells[table.columns[2].columnKey].valueNumeric).toBe(300.0);
  });

  // ── 3. CSV Multi-Column ─────────────────────────────────────────────────────
  it('3. CSV multi-column: Ingests RFC 4180 style CSV with quoted tokens and numbers', () => {
    const csv = `District,Crop,Production (MT),"Yield Rate (kg/ha)",Status\n` +
      `Rewa,Wheat,"1,45,000",2450.5,Final\n` +
      `Satna,Paddy,"1,12,000",2100.0,Provisional\n`;

    const table = extractCsvTable(csv, { archiveId, sourceId, title: 'Crop Production' });
    expect(table).not.toBeNull();
    expect(table?.title).toBe('Crop Production');
    expect(table?.columns.length).toBe(5);
    expect(table?.columns[0].columnKey).toBe('district');
    expect(table?.columns[2].columnKey).toBe('production_mt');
    expect(table?.columns[2].unit).toBe('metric_tonnes');

    expect(table?.rows.length).toBe(2);
    expect(table?.rows[0].rowKey).toBe('Rewa');
    expect(table?.rows[0].cells['production_mt'].valueNumeric).toBe(145000);
    expect(table?.rows[0].cells['yield_rate_kg_ha'].valueNumeric).toBe(2450.5);
    expect(table?.rows[0].cells['status'].raw).toBe('Final');

    expect(table?.rows[1].rowKey).toBe('Satna');
    expect(table?.rows[1].cells['production_mt'].valueNumeric).toBe(112000);
  });

  // ── 4. JSON Array-of-Objects ────────────────────────────────────────────────
  it('4. JSON array-of-objects: Extracts canonical table from JSON records', () => {
    const jsonRecords = [
      { year: '2022-23', gdp_growth: '7.2%', inflation: '6.7%', fdi: '71.3 billion usd' },
      { year: '2023-24', gdp_growth: '8.2%', inflation: '5.4%', fdi: '70.9 billion usd' },
      { year: '2024-25', gdp_growth: '7.0%', inflation: '4.8%', fdi: '75.0 billion usd' },
    ];

    const table = extractJsonTable(jsonRecords, { archiveId, sourceId, title: 'Macro Indicators' });
    expect(table).not.toBeNull();
    expect(table?.columns.length).toBe(4);
    expect(table?.columns[0].columnKey).toBe('year');
    expect(table?.columns[1].columnKey).toBe('gdp_growth');

    expect(table?.rows.length).toBe(3);
    expect(table?.rows[0].rowKey).toBe('2022-23');
    expect(table?.rows[0].cells['gdp_growth'].valueNumeric).toBe(7.2);
    expect(table?.rows[0].cells['gdp_growth'].unit).toBe('%');
    expect(table?.rows[0].cells['fdi'].valueNumeric).toBe(71.3);
    expect(table?.rows[0].cells['fdi'].unit).toBe('billion_usd');

    expect(table?.rows[1].cells['gdp_growth'].valueNumeric).toBe(8.2);
  });

  // ── 5. Same Input → Identical Output (Byte-for-Byte Determinism) ────────────
  it('5. Determinism: Parsing same source twice produces byte-for-byte identical JSON', () => {
    const html = `
      <table>
        <tr><th>Metric</th><th>2024</th><th>2025</th></tr>
        <tr><td>Capital Outlay</td><td>450.25</td><td>520.10</td></tr>
        <tr><td>Revenue Deficit</td><td>110.00</td><td>95.50</td></tr>
      </table>
    `;

    const run1 = extractHtmlTables(html, { archiveId, sourceId });
    const run2 = extractHtmlTables(html, { archiveId, sourceId });

    const json1 = JSON.stringify(run1);
    const json2 = JSON.stringify(run2);

    expect(json1).toBe(json2);
    expect(run1[0].id).toBe(run2[0].id);
    expect(run1[0].id.length).toBe(64); // Valid SHA-256
  });

  // ── 6. Numeric Parsing (Indian Comma, International, Devanagari, Negatives) ───
  it('6. Numeric parsing: Correctly parses complex numbering conventions and Devanagari numerals', () => {
    expect(convertDevanagariDigits('१२१७.०५')).toBe('1217.05');

    const indianComma = parseCellContent('1,21,705.50');
    expect(indianComma.valueNumeric).toBe(121705.5);

    const intlComma = parseCellContent('121,705.50');
    expect(intlComma.valueNumeric).toBe(121705.5);

    const accountingNegative = parseCellContent('(450.75)');
    expect(accountingNegative.valueNumeric).toBe(-450.75);

    const devanagariParsed = parseCellContent('४५०.२५');
    expect(devanagariParsed.valueNumeric).toBe(450.25);

    const footnoteAttached = parseCellContent('1,217.05*');
    expect(footnoteAttached.valueNumeric).toBe(1217.05);
    expect(footnoteAttached.flags).toContain('footnote');

    const provisionalAttached = parseCellContent('8.2%(P)');
    expect(provisionalAttached.valueNumeric).toBe(8.2);
    expect(provisionalAttached.unit).toBe('%');
    expect(provisionalAttached.flags).toContain('provisional');
  });

  // ── 7. Percentage Parsing ───────────────────────────────────────────────────
  it('7. Percentage parsing: Correctly tags percentage numbers and units', () => {
    const pct1 = parseCellContent('14.5%');
    expect(pct1.valueNumeric).toBe(14.5);
    expect(pct1.unit).toBe('%');
    expect(pct1.dataType).toBe('percentage');

    const pct2 = parseCellContent('+6.8 percent');
    expect(pct2.valueNumeric).toBe(6.8);
    expect(pct2.unit).toBe('%');
    expect(pct2.dataType).toBe('percentage');
  });

  // ── 8. Unit Preservation ────────────────────────────────────────────────────
  it('8. Unit preservation: Retains original currency, scale, and physical units', () => {
    const inrCrore = parseCellContent('₹1,217.05 crore');
    expect(inrCrore.valueNumeric).toBe(1217.05);
    expect(inrCrore.unit).toBe('crore_inr');

    const lakhVal = parseCellContent('50.25 lakh');
    expect(lakhVal.valueNumeric).toBe(50.25);
    expect(lakhVal.unit).toBe('lakh');

    const metricTonnes = parseCellContent('12,000 MT');
    expect(metricTonnes.valueNumeric).toBe(12000);
    expect(metricTonnes.unit).toBe('metric_tonnes');
  });

  // ── 9. Period Preservation ──────────────────────────────────────────────────
  it('9. Period preservation: Extracts temporal periods from header labels and cells', () => {
    const fiscalCell = parseCellContent('FY 2024-25');
    expect(fiscalCell.period).toBe('FY2024-25');

    const quarterCell = parseCellContent('Q2 FY24');
    expect(quarterCell.period).toBe('Q2FY24');
  });

  // ── 10. Missing / Null Values ───────────────────────────────────────────────
  it('10. Missing/null values: Accurately represents blanks, hyphens, and N/A markers', () => {
    const hyphen = parseCellContent('-');
    expect(hyphen.valueNumeric).toBeNull();
    expect(hyphen.raw).toBe('-');
    expect(hyphen.flags).toContain('empty_placeholder');

    const na = parseCellContent('N/A');
    expect(na.valueNumeric).toBeNull();
    expect(na.raw).toBe('N/A');

    const nil = parseCellContent('nil');
    expect(nil.valueNumeric).toBeNull();
    expect(nil.raw).toBe('nil');

    const blank = parseCellContent('');
    expect(blank.valueNumeric).toBeNull();
    expect(blank.raw).toBe('');
  });

  // ── 11. Unsupported / Ambiguous Structure ───────────────────────────────────
  it('11. Unsupported structure: Deterministically flags refusal on uncoordinated PDF streams', () => {
    const rawPdfUnstructuredText = 'Random unstructured text without any table markers or tabs.';
    const pdfTables = extractPdfTables(rawPdfUnstructuredText, { archiveId, sourceId });

    expect(pdfTables.length).toBe(1);
    expect(pdfTables[0].metadata.extractionStatus).toBe('unsupported');
    expect(pdfTables[0].metadata.extractionWarnings).toBeDefined();
    expect(pdfTables[0].metadata.extractionWarnings?.[0]).toContain('without font bounding box coordinates');
    expect(pdfTables[0].columns.length).toBe(0);
    expect(pdfTables[0].rows.length).toBe(0);
  });
});
