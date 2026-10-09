/**
 * ─── Tabular Claim Impact Mapper (Phase 4B-3F) ─────────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency, Platform Beta)
 *   - .planning/PHASE-4B-3F-CLAIM-CELL-IMPACT-MAPPER.md
 *
 * Pure, deterministic impact mapper mapping a TabularDiffResult + CellAddress
 * to a TabularClaimImpactResult.
 *
 * Derived analysis only. Zero side effects on claims, evidence, or publication.
 */

import type { Claim } from '@/types/canonical';
import type {
  CanonicalTable,
  TabularDiffResult,
  TabularClaimImpactResult,
  ClaimTabularImpact,
  TabularImpactClassification,
  CellSnapshot
} from '@/types/canonical-table';

export function analyzeTabularClaimImpact(
  diff: TabularDiffResult,
  claims: Claim[],
  tableNew?: CanonicalTable
): TabularClaimImpactResult {
  const impacts: ClaimTabularImpact[] = [];

  // Short-circuit if diff is missing identifiers
  if (!diff.tableIdOld || !diff.archiveIdOld) {
    return {
      tableIdOld: diff.tableIdOld,
      tableIdNew: diff.tableIdNew,
      archiveIdOld: diff.archiveIdOld,
      archiveIdNew: diff.archiveIdNew,
      impacts: [],
    };
  }

  for (const claim of claims) {
    if (!claim.cellAddress) continue;

    const address = claim.cellAddress;

    // Fail closed if lineage is incomplete
    if (!address.tableId || !address.archiveId || !address.rowKey || !address.columnKey) {
      continue; 
    }

    // Match exact old table / archive 
    if (address.tableId !== diff.tableIdOld || address.archiveId !== diff.archiveIdOld) {
      continue; 
    }

    let classification: TabularImpactClassification = 'NO_IMPACT';
    const oldSnapshot: CellSnapshot | undefined = address.snapshot;
    let newSnapshot: CellSnapshot | undefined = undefined;

    // Try to extract new snapshot if tableNew is provided
    if (tableNew) {
      const newRow = tableNew.rows.find((r) => r.rowKey === address.rowKey);
      if (newRow && newRow.cells[address.columnKey]) {
        const newCell = newRow.cells[address.columnKey];
        newSnapshot = {
          raw: newCell.raw,
          valueNumeric: newCell.valueNumeric,
          unit: newCell.unit,
          period: newCell.period,
          denominator: newCell.denominator,
        };
      }
    }

    const hasAmbiguity = diff.mutations.some((m) => m.type === 'AMBIGUOUS_MATCH');
    if (hasAmbiguity) {
      impacts.push({
        claimId: claim.id,
        classification: 'AMBIGUOUS',
        cellAddress: address,
        oldSnapshot,
        newSnapshot,
      });
      continue;
    }

    // Find specific cell impacts
    const removedRow = diff.mutations.find((m) => m.type === 'REMOVED_ROW' && m.rowKey === address.rowKey);
    const removedCol = diff.mutations.find((m) => m.type === 'REMOVED_COLUMN' && m.columnKey === address.columnKey);
    const changedCell = diff.mutations.find((m) => m.type === 'CHANGED_CELL' && m.rowKey === address.rowKey && m.columnKey === address.columnKey);
    
    // Global impacts
    const unitChanged = diff.mutations.find((m) => m.type === 'UNIT_CHANGED');
    const denomChanged = diff.mutations.find((m) => m.type === 'DENOMINATOR_CHANGED');
    const periodChanged = diff.mutations.find((m) => m.type === 'PERIOD_CHANGED');
    const methChanged = diff.mutations.find((m) => m.type === 'METHODOLOGY_CHANGED');

    if (removedRow) {
      classification = 'REMOVED_ROW';
    } else if (removedCol) {
      classification = 'REMOVED_COLUMN';
    } else if (changedCell) {
      if (changedCell.cellDelta?.unitChanged) {
        classification = 'UNIT_CHANGE';
      } else {
        classification = 'MATERIAL_VALUE_CHANGE';
      }
    } else if (unitChanged) {
      classification = 'UNIT_CHANGE';
    } else if (denomChanged) {
      classification = 'DENOMINATOR_CHANGE';
    } else if (periodChanged) {
      classification = 'PERIOD_CHANGE';
    } else if (methChanged) {
      classification = 'METHODOLOGY_REVIEW';
    }

    impacts.push({
      claimId: claim.id,
      classification,
      cellAddress: address,
      oldSnapshot,
      newSnapshot,
    });
  }

  // Sort deterministically by claim ID
  impacts.sort((a, b) => a.claimId.localeCompare(b.claimId));

  return {
    tableIdOld: diff.tableIdOld,
    tableIdNew: diff.tableIdNew,
    archiveIdOld: diff.archiveIdOld,
    archiveIdNew: diff.archiveIdNew,
    impacts,
  };
}
