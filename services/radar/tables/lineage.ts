/**
 * ─── Cell Lineage Foundation (Phase 4B-3E) ────────────────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1 (Articles I, III, IV)
 *   - AGENTS.md (Verification & Idempotency, Platform Beta)
 *   - .planning/PHASE-4B-3D-EDITORIAL-INTEGRATION-DESIGN.md
 *
 * Pure helpers for constructing, validating, comparing, serializing, and
 * attaching CellAddress records to verified claims.
 *
 * Invariants:
 *   - Raw Evidence Vault artifact remains authoritative.
 *   - CellAddress is a derived coordinate pointer into canonical table data.
 *   - Reject malformed or incomplete lineage rather than guessing.
 *   - Ambiguity (e.g. non-unique/ambiguous row keys) strictly fails closed.
 *   - Backward compatibility: Claims without cell lineage remain completely valid.
 */

import type { CanonicalCell, CellAddress, CellSnapshot } from '@/types/canonical-table';

export interface CellAddressValidationResult {
  valid: boolean;
  address?: CellAddress;
  errors: string[];
}

/**
 * Validates and normalizes an unknown candidate against the CellAddress contract.
 * Rejects incomplete, malformed, or ambiguous structures.
 */
export function validateCellAddress(candidate: unknown): CellAddressValidationResult {
  const errors: string[] = [];

  if (!candidate || typeof candidate !== 'object') {
    return { valid: false, errors: ['Candidate CellAddress must be a non-null object'] };
  }

  const obj = candidate as Record<string, unknown>;

  // 1. archiveId validation
  if (typeof obj.archiveId !== 'string' || obj.archiveId.trim().length === 0) {
    errors.push('archiveId must be a non-empty string');
  }

  // 2. tableIndex validation
  if (
    typeof obj.tableIndex !== 'number' ||
    !Number.isInteger(obj.tableIndex) ||
    obj.tableIndex < 0
  ) {
    errors.push('tableIndex must be a non-negative integer');
  }

  // 3. tableId validation
  if (typeof obj.tableId !== 'string' || obj.tableId.trim().length === 0) {
    errors.push('tableId must be a non-empty string');
  }

  // 4. rowKey validation (must be non-empty and NOT an ambiguous marker)
  if (typeof obj.rowKey !== 'string' || obj.rowKey.trim().length === 0) {
    errors.push('rowKey must be a non-empty string');
  } else {
    const trimmedRow = obj.rowKey.trim();
    if (trimmedRow.startsWith('ambiguous_') || trimmedRow === 'AMBIGUOUS') {
      errors.push(`rowKey "${trimmedRow}" indicates ambiguous row identity; cannot attach verified lineage`);
    }
  }

  // 5. columnKey validation
  if (typeof obj.columnKey !== 'string' || obj.columnKey.trim().length === 0) {
    errors.push('columnKey must be a non-empty string');
  }

  // 6. snapshot validation
  if (!obj.snapshot || typeof obj.snapshot !== 'object') {
    errors.push('snapshot must be a non-null object');
  } else {
    const snap = obj.snapshot as Record<string, unknown>;

    if (typeof snap.raw !== 'string') {
      errors.push('snapshot.raw must be a string');
    }

    if (
      snap.valueNumeric !== null &&
      (typeof snap.valueNumeric !== 'number' || !Number.isFinite(snap.valueNumeric))
    ) {
      errors.push('snapshot.valueNumeric must be a finite number or null');
    }

    if (snap.unit !== undefined && typeof snap.unit !== 'string') {
      errors.push('snapshot.unit must be a string if provided');
    }

    if (snap.period !== undefined && typeof snap.period !== 'string') {
      errors.push('snapshot.period must be a string if provided');
    }

    if (snap.denominator !== undefined && typeof snap.denominator !== 'string') {
      errors.push('snapshot.denominator must be a string if provided');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const snap = obj.snapshot as Record<string, unknown>;
  const normalizedSnapshot: CellSnapshot = {
    raw: String(snap.raw),
    valueNumeric: snap.valueNumeric === null ? null : Number(snap.valueNumeric),
    unit: typeof snap.unit === 'string' && snap.unit.trim().length > 0 ? snap.unit.trim() : undefined,
    period: typeof snap.period === 'string' && snap.period.trim().length > 0 ? snap.period.trim() : undefined,
    denominator:
      typeof snap.denominator === 'string' && snap.denominator.trim().length > 0
        ? snap.denominator.trim()
        : undefined,
  };

  const address: CellAddress = {
    archiveId: String(obj.archiveId).trim(),
    tableIndex: Number(obj.tableIndex),
    tableId: String(obj.tableId).trim(),
    rowKey: String(obj.rowKey).trim(),
    columnKey: String(obj.columnKey).trim(),
    snapshot: normalizedSnapshot,
  };

  return { valid: true, address, errors: [] };
}

/**
 * Type guard for CellAddress.
 */
export function isCellAddress(candidate: unknown): candidate is CellAddress {
  return validateCellAddress(candidate).valid;
}

export interface ConstructCellAddressParams {
  archiveId: string;
  tableIndex: number;
  tableId: string;
  rowKey: string;
  columnKey: string;
  cell: CanonicalCell;
}

/**
 * Constructs a verified CellAddress from coordinates and an extracted CanonicalCell.
 * Throws a descriptive error if parameters are malformed.
 */
export function constructCellAddress(params: ConstructCellAddressParams): CellAddress {
  const snapshot: CellSnapshot = {
    raw: params.cell.raw,
    valueNumeric: params.cell.valueNumeric,
    unit: params.cell.unit,
    period: params.cell.period,
    denominator: params.cell.denominator,
  };

  const candidate = {
    archiveId: params.archiveId,
    tableIndex: params.tableIndex,
    tableId: params.tableId,
    rowKey: params.rowKey,
    columnKey: params.columnKey,
    snapshot,
  };

  const result = validateCellAddress(candidate);
  if (!result.valid || !result.address) {
    throw new Error(`Failed to construct CellAddress: ${result.errors.join('; ')}`);
  }

  return result.address;
}

/**
 * Compares two CellAddresses for exact structural and coordinate equality.
 */
export function compareCellAddresses(
  a: CellAddress | null | undefined,
  b: CellAddress | null | undefined
): boolean {
  if (!a || !b) return a === b;

  return (
    a.archiveId === b.archiveId &&
    a.tableIndex === b.tableIndex &&
    a.tableId === b.tableId &&
    a.rowKey === b.rowKey &&
    a.columnKey === b.columnKey &&
    a.snapshot.raw === b.snapshot.raw &&
    a.snapshot.valueNumeric === b.snapshot.valueNumeric &&
    (a.snapshot.unit || '') === (b.snapshot.unit || '') &&
    (a.snapshot.period || '') === (b.snapshot.period || '') &&
    (a.snapshot.denominator || '') === (b.snapshot.denominator || '')
  );
}

/**
 * Deterministically serializes a CellAddress into a canonical JSON string.
 * Keys are ordered deterministically to guarantee bit-for-bit equality.
 */
export function serializeCellAddress(address: CellAddress): string {
  const validation = validateCellAddress(address);
  if (!validation.valid || !validation.address) {
    throw new Error(`Cannot serialize invalid CellAddress: ${validation.errors.join('; ')}`);
  }

  const v = validation.address;
  const canonicalObj = {
    archiveId: v.archiveId,
    columnKey: v.columnKey,
    rowKey: v.rowKey,
    snapshot: {
      denominator: v.snapshot.denominator ?? null,
      period: v.snapshot.period ?? null,
      raw: v.snapshot.raw,
      unit: v.snapshot.unit ?? null,
      valueNumeric: v.snapshot.valueNumeric,
    },
    tableId: v.tableId,
    tableIndex: v.tableIndex,
  };

  return JSON.stringify(canonicalObj);
}

/**
 * Safely deserializes and validates a CellAddress from a JSON string.
 * Returns null if the string is invalid JSON or fails CellAddress validation.
 */
export function deserializeCellAddress(serialized: string): CellAddress | null {
  if (typeof serialized !== 'string' || serialized.trim().length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(serialized);
    const result = validateCellAddress(parsed);
    return result.valid && result.address ? result.address : null;
  } catch {
    return null;
  }
}

/**
 * Attaches a validated CellAddress to any claim or evidence record.
 * Throws if the CellAddress is malformed.
 */
export function attachCellLineage<T extends object>(
  target: T,
  address: CellAddress
): T & { cellAddress: CellAddress } {
  const validation = validateCellAddress(address);
  if (!validation.valid || !validation.address) {
    throw new Error(`Cannot attach invalid cell lineage: ${validation.errors.join('; ')}`);
  }

  return {
    ...target,
    cellAddress: validation.address,
  };
}

/**
 * Safely extracts CellAddress from a claim or evidence record if present.
 * Returns null if missing or not tabular (preserving 100% backward compatibility).
 */
export function extractCellLineage(target: unknown): CellAddress | null {
  if (!target || typeof target !== 'object') {
    return null;
  }

  const obj = target as Record<string, unknown>;

  // Check direct cellAddress property
  if (obj.cellAddress) {
    const res = validateCellAddress(obj.cellAddress);
    return res.valid && res.address ? res.address : null;
  }

  // Check nested metadata.cellAddress property if present
  if (obj.metadata && typeof obj.metadata === 'object') {
    const meta = obj.metadata as Record<string, unknown>;
    if (meta.cellAddress) {
      const res = validateCellAddress(meta.cellAddress);
      return res.valid && res.address ? res.address : null;
    }
  }

  return null;
}
