/**
 * ─── Phase 4B-3E: Cell Lineage Foundation Test Suite ──────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency, Platform Beta)
 *   - .planning/PHASE-4B-3D-EDITORIAL-INTEGRATION-DESIGN.md
 *
 * Test Matrix Criteria:
 *   1. Valid CellAddress construction & validation
 *   2. Malformed CellAddress rejection (missing coordinates, negative index, non-finite numbers)
 *   3. Round-trip serialization & deserialization
 *   4. Snapshot preservation (raw, valueNumeric, unit, period, denominator)
 *   5. Equality & comparison
 *   6. Missing lineage backward compatibility (null returns, no exceptions)
 *   7. Ambiguous/incomplete lineage rejection (ambiguous_row_*, AMBIGUOUS, blank strings)
 *   8. Deterministic serialization (key-order independent bit-for-bit equality)
 *   9. Safe attachment to claim objects
 */

import { describe, it, expect } from 'vitest';
import {
  constructCellAddress,
  validateCellAddress,
  isCellAddress,
  compareCellAddresses,
  serializeCellAddress,
  deserializeCellAddress,
  attachCellLineage,
  extractCellLineage,
} from '../tables';
import type { CanonicalCell, CellAddress } from '@/types/canonical-table';
import type { Claim } from '@/types/canonical';

describe('PHASE 4B-3E: CELL LINEAGE FOUNDATION', () => {
  const validArchiveId = '71628590-9799-42ac-9496-7653539d9ba6';
  const validTableId = 'sha256-table-hash-test-001';

  const sampleCell: CanonicalCell = {
    raw: '1,21,705.50',
    valueNumeric: 121705.5,
    unit: 'crore',
    period: '2024-25',
    denominator: 'total',
  };

  // ── 1. Valid CellAddress Construction & Validation ──────────────────────────
  it('1. Constructs and validates a complete CellAddress', () => {
    const address = constructCellAddress({
      archiveId: validArchiveId,
      tableIndex: 0,
      tableId: validTableId,
      rowKey: 'karnataka',
      columnKey: 'expenditure_fy25',
      cell: sampleCell,
    });

    expect(isCellAddress(address)).toBe(true);
    expect(address.archiveId).toBe(validArchiveId);
    expect(address.tableIndex).toBe(0);
    expect(address.tableId).toBe(validTableId);
    expect(address.rowKey).toBe('karnataka');
    expect(address.columnKey).toBe('expenditure_fy25');

    const validation = validateCellAddress(address);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(validation.address).toEqual(address);
  });

  // ── 2. Malformed CellAddress Rejection ───────────────────────────────────────
  it('2. Rejects malformed or incomplete CellAddress candidates', () => {
    // Missing archiveId
    expect(
      validateCellAddress({
        tableIndex: 0,
        tableId: validTableId,
        rowKey: 'karnataka',
        columnKey: 'expenditure',
        snapshot: { raw: '100', valueNumeric: 100 },
      }).valid
    ).toBe(false);

    // Negative tableIndex
    expect(
      validateCellAddress({
        archiveId: validArchiveId,
        tableIndex: -1,
        tableId: validTableId,
        rowKey: 'karnataka',
        columnKey: 'expenditure',
        snapshot: { raw: '100', valueNumeric: 100 },
      }).valid
    ).toBe(false);

    // Floating-point tableIndex
    expect(
      validateCellAddress({
        archiveId: validArchiveId,
        tableIndex: 1.5,
        tableId: validTableId,
        rowKey: 'karnataka',
        columnKey: 'expenditure',
        snapshot: { raw: '100', valueNumeric: 100 },
      }).valid
    ).toBe(false);

    // Missing tableId
    expect(
      validateCellAddress({
        archiveId: validArchiveId,
        tableIndex: 0,
        tableId: '   ',
        rowKey: 'karnataka',
        columnKey: 'expenditure',
        snapshot: { raw: '100', valueNumeric: 100 },
      }).valid
    ).toBe(false);

    // Non-finite valueNumeric (NaN)
    expect(
      validateCellAddress({
        archiveId: validArchiveId,
        tableIndex: 0,
        tableId: validTableId,
        rowKey: 'karnataka',
        columnKey: 'expenditure',
        snapshot: { raw: 'NaN', valueNumeric: Number.NaN },
      }).valid
    ).toBe(false);

    // Non-finite valueNumeric (Infinity)
    expect(
      validateCellAddress({
        archiveId: validArchiveId,
        tableIndex: 0,
        tableId: validTableId,
        rowKey: 'karnataka',
        columnKey: 'expenditure',
        snapshot: { raw: 'Inf', valueNumeric: Number.POSITIVE_INFINITY },
      }).valid
    ).toBe(false);

    // Non-string snapshot raw
    expect(
      validateCellAddress({
        archiveId: validArchiveId,
        tableIndex: 0,
        tableId: validTableId,
        rowKey: 'karnataka',
        columnKey: 'expenditure',
        snapshot: { raw: 100 as unknown as string, valueNumeric: 100 },
      }).valid
    ).toBe(false);
  });

  // ── 3. Round-Trip Serialization & Deserialization ───────────────────────────
  it('3. Safely serializes and deserializes CellAddress', () => {
    const original = constructCellAddress({
      archiveId: validArchiveId,
      tableIndex: 1,
      tableId: validTableId,
      rowKey: 'maharashtra',
      columnKey: 'revenue_receipts',
      cell: sampleCell,
    });

    const serialized = serializeCellAddress(original);
    expect(typeof serialized).toBe('string');

    const deserialized = deserializeCellAddress(serialized);
    expect(deserialized).not.toBeNull();
    expect(deserialized).toEqual(original);
    expect(compareCellAddresses(original, deserialized)).toBe(true);
  });

  it('3b. Returns null when deserializing malformed JSON or invalid schema', () => {
    expect(deserializeCellAddress('not json')).toBeNull();
    expect(deserializeCellAddress('')).toBeNull();
    expect(deserializeCellAddress('{"archiveId": "test"}')).toBeNull();
  });

  // ── 4. Snapshot Preservation ────────────────────────────────────────────────
  it('4. Preserves all verified snapshot attributes faithfully', () => {
    const address = constructCellAddress({
      archiveId: validArchiveId,
      tableIndex: 0,
      tableId: validTableId,
      rowKey: 'gujarat',
      columnKey: 'growth_rate',
      cell: {
        raw: '8.5%',
        valueNumeric: 8.5,
        unit: '%',
        period: 'Q3',
        denominator: 'YoY',
      },
    });

    expect(address.snapshot.raw).toBe('8.5%');
    expect(address.snapshot.valueNumeric).toBe(8.5);
    expect(address.snapshot.unit).toBe('%');
    expect(address.snapshot.period).toBe('Q3');
    expect(address.snapshot.denominator).toBe('YoY');

    // Text cell with null valueNumeric
    const textAddress = constructCellAddress({
      archiveId: validArchiveId,
      tableIndex: 0,
      tableId: validTableId,
      rowKey: 'department_name',
      columnKey: 'label',
      cell: {
        raw: 'Finance and Taxation Department',
        valueNumeric: null,
      },
    });

    expect(textAddress.snapshot.raw).toBe('Finance and Taxation Department');
    expect(textAddress.snapshot.valueNumeric).toBeNull();
    expect(textAddress.snapshot.unit).toBeUndefined();
  });

  // ── 5. Equality & Comparison ────────────────────────────────────────────────
  it('5. Correctly compares CellAddresses for structural and coordinate equality', () => {
    const a = constructCellAddress({
      archiveId: validArchiveId,
      tableIndex: 0,
      tableId: validTableId,
      rowKey: 'karnataka',
      columnKey: 'expenditure',
      cell: sampleCell,
    });

    const b = constructCellAddress({
      archiveId: validArchiveId,
      tableIndex: 0,
      tableId: validTableId,
      rowKey: 'karnataka',
      columnKey: 'expenditure',
      cell: sampleCell,
    });

    const differentRow = constructCellAddress({
      archiveId: validArchiveId,
      tableIndex: 0,
      tableId: validTableId,
      rowKey: 'kerala', // different row
      columnKey: 'expenditure',
      cell: sampleCell,
    });

    const differentValue = constructCellAddress({
      archiveId: validArchiveId,
      tableIndex: 0,
      tableId: validTableId,
      rowKey: 'karnataka',
      columnKey: 'expenditure',
      cell: { ...sampleCell, valueNumeric: 999 },
    });

    expect(compareCellAddresses(a, b)).toBe(true);
    expect(compareCellAddresses(a, differentRow)).toBe(false);
    expect(compareCellAddresses(a, differentValue)).toBe(false);
    expect(compareCellAddresses(a, null)).toBe(false);
    expect(compareCellAddresses(null, null)).toBe(true);
  });

  // ── 6. Missing Lineage Backward Compatibility ───────────────────────────────
  it('6. Preserves 100% backward compatibility for legacy claims without lineage', () => {
    const legacyClaim: Claim = {
      id: 'claim-101',
      claim: 'Historical literacy rate was 18% in 1951',
      data: '18%',
      source: 'Census 1951',
      sourceUrl: 'https://census.gov.in',
      tier: 1,
      isLegacy: true,
      confidence: 0.95,
      status: 'verified',
    };

    // Extracting lineage from a legacy claim safely returns null without throwing
    expect(extractCellLineage(legacyClaim)).toBeNull();
    expect(extractCellLineage({})).toBeNull();
    expect(extractCellLineage(null)).toBeNull();
    expect(extractCellLineage(undefined)).toBeNull();
  });

  // ── 7. Ambiguous/Incomplete Lineage Rejection ────────────────────────────────
  it('7. Rejects ambiguous row markers to fail closed on indeterminate identity', () => {
    // ambiguous_ prefix rejected
    expect(() =>
      constructCellAddress({
        archiveId: validArchiveId,
        tableIndex: 0,
        tableId: validTableId,
        rowKey: 'ambiguous_row_2',
        columnKey: 'col_1',
        cell: sampleCell,
      })
    ).toThrow(/ambiguous row identity/i);

    // explicit AMBIGUOUS marker rejected
    expect(() =>
      constructCellAddress({
        archiveId: validArchiveId,
        tableIndex: 0,
        tableId: validTableId,
        rowKey: 'AMBIGUOUS',
        columnKey: 'col_1',
        cell: sampleCell,
      })
    ).toThrow(/ambiguous row identity/i);
  });

  // ── 8. Deterministic Serialization ──────────────────────────────────────────
  it('8. Produces bit-for-bit deterministic serialization regardless of property insertion order', () => {
    const address1: CellAddress = {
      archiveId: validArchiveId,
      tableIndex: 0,
      tableId: validTableId,
      rowKey: 'karnataka',
      columnKey: 'expenditure',
      snapshot: {
        raw: '100',
        valueNumeric: 100,
        unit: 'crore',
        period: 'FY24',
        denominator: 'total',
      },
    };

    // Constructed with reverse order of properties
    const address2: CellAddress = {
      snapshot: {
        denominator: 'total',
        period: 'FY24',
        unit: 'crore',
        valueNumeric: 100,
        raw: '100',
      },
      columnKey: 'expenditure',
      rowKey: 'karnataka',
      tableId: validTableId,
      tableIndex: 0,
      archiveId: validArchiveId,
    };

    const str1 = serializeCellAddress(address1);
    const str2 = serializeCellAddress(address2);

    expect(str1).toBe(str2);
  });

  // ── 9. Safe Attachment to Claim Objects ──────────────────────────────────────
  it('9. Safely attaches CellAddress to modern verified claims', () => {
    const claim: Claim = {
      id: 'claim-202',
      claim: 'Madhya Pradesh allocated ₹1,21,705.50 crore to major schemes',
      data: '₹1,21,705.50 crore',
      source: 'MP State Budget',
      sourceUrl: 'https://mpinfo.org/budget',
      tier: 2,
      archiveId: validArchiveId,
      isLegacy: false,
      confidence: 0.98,
      status: 'verified',
    };

    const address = constructCellAddress({
      archiveId: validArchiveId,
      tableIndex: 0,
      tableId: validTableId,
      rowKey: 'total_allocation',
      columnKey: 'amount_crore',
      cell: sampleCell,
    });

    const updatedClaim = attachCellLineage(claim, address);

    expect(updatedClaim.cellAddress).toBeDefined();
    expect(updatedClaim.cellAddress?.rowKey).toBe('total_allocation');

    // Extract helper successfully retrieves the attached lineage
    const extracted = extractCellLineage(updatedClaim);
    expect(extracted).not.toBeNull();
    expect(compareCellAddresses(extracted, address)).toBe(true);
  });
});
