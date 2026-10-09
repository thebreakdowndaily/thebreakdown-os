/**
 * ─── Canonical Table Model (Phase 4B-3B Milestone 1) ──────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1 (Articles I, III, IV)
 *   - AGENTS.md (Platform Beta v1.0 — Evidence First, Minimal Surface)
 *   - .planning/PHASE-4B-3A-STRUCTURED-MUTATION-DESIGN.md
 *
 * Defines the canonical structured representation for tabular source material.
 * This is a deterministic derived projection of raw Evidence Vault artifacts.
 * It NEVER replaces or alters raw archived payloads.
 */

export type CanonicalDataType =
  | 'numeric'
  | 'percentage'
  | 'currency'
  | 'date'
  | 'categorical'
  | 'text'
  | 'unknown';

export interface ColumnDescriptor {
  columnKey: string;           // Normalized deterministic key (e.g. "budget_estimate_fy25")
  label: string;               // Display header text (e.g. "Budget Estimate (2024-25)")
  dataType: CanonicalDataType;
  unit?: string;               // Optional column-specific unit override (e.g. "crore", "%")
  period?: string;             // Optional temporal reference (e.g. "2024-25", "2024-Q1")
  denominator?: string;        // Optional rate denominator (e.g. "per_capita", "per_lakh")
}

export interface CanonicalCell {
  raw: string;                 // Original raw wire string (exact whitespace/punctuation preserved)
  valueNumeric: number | null; // Deterministically parsed number (or null if text/null/invalid)
  valueFormatted?: string;     // Canonical formatted representation (e.g. "1217.05")
  unit?: string;               // Inferred/inherited unit (e.g. "crore", "%")
  period?: string;             // Inherited period if applicable
  denominator?: string;        // Inherited denominator if applicable
  flags?: string[];            // Optional annotation markers (e.g. ["footnote", "spanned", "estimated"])
}

export interface TableRowRecord {
  rowKey: string;              // Deterministic row identifier (natural key, indicator, or row:index)
  rowIndex: number;            // 0-indexed physical row sequence in source
  cells: Record<string, CanonicalCell>; // Keyed by ColumnDescriptor.columnKey
}

export interface CanonicalTableMetadata {
  declaredUnit?: string;
  declaredDenominator?: string;
  basePeriod?: string;
  footnotes?: string[];
  extractionStatus?: 'complete' | 'partial' | 'unsupported';
  extractionWarnings?: string[];
  sourceUrl?: string;
  sourceId?: string;
  sourceRevisionId?: string;
  extractorVersion?: string;
}

export interface CanonicalTable {
  id: string;                  // Deterministic table hash: sha256(archiveId + tableIndex + orderedColKeys)
  archiveId: string;           // Provenance foreign key to newsroom.archived_artifacts.id
  sourceId?: string;           // Optional source identifier (e.g. "radar-mpinfo-html")
  tableIndex: number;          // 0-indexed order of table in artifact
  title?: string;              // Caption, preceding heading, or table title
  columns: ColumnDescriptor[]; // Ordered column definitions
  rows: TableRowRecord[];      // Ordered row records
  metadata: CanonicalTableMetadata;
}

// ─── Tabular Mutation & Diff Contracts (Phase 4B-3C Milestone 2) ─────────────

export type TabularMutationType =
  | 'CHANGED_CELL'
  | 'ADDED_ROW'
  | 'REMOVED_ROW'
  | 'ADDED_COLUMN'
  | 'REMOVED_COLUMN'
  | 'REORDERED_ROW'
  | 'REORDERED_COLUMN'
  | 'UNIT_CHANGED'
  | 'DENOMINATOR_CHANGED'
  | 'PERIOD_CHANGED'
  | 'METHODOLOGY_CHANGED'
  | 'AMBIGUOUS_MATCH';

export interface CellDelta {
  columnKey: string;
  rowKey: string;
  oldValue: CanonicalCell;
  newValue: CanonicalCell;
  absoluteDelta: number | null;
  percentageDelta: number | null;
  unitChanged?: boolean;
}

export interface TabularMutation {
  type: TabularMutationType;
  description: string;
  columnKey?: string;
  rowKey?: string;
  oldValue?: unknown;
  newValue?: unknown;
  cellDelta?: CellDelta;
}

export interface TabularDiffSummary {
  hasChanges: boolean;
  totalMutations: number;
  changedCellsCount: number;
  addedRowsCount: number;
  removedRowsCount: number;
  addedColumnsCount: number;
  removedColumnsCount: number;
  hasReordering: boolean;
  hasMetadataChanges: boolean;
  hasAmbiguity: boolean;
}

export interface TabularDiffResult {
  tableIdOld?: string;
  tableIdNew?: string;
  archiveIdOld?: string;
  archiveIdNew?: string;
  summary: TabularDiffSummary;
  mutations: TabularMutation[];
}

// ─── Cell Lineage Foundation (Phase 4B-3E) ──────────────────────────────────

/**
 * Immutable verified snapshot of a canonical cell at the moment of human verification.
 */
export interface CellSnapshot {
  raw: string;
  valueNumeric: number | null;
  unit?: string;
  period?: string;
  denominator?: string;
}

/**
 * Deterministic coordinate address mapping a verified claim to an authoritative
 * cell within a canonical table derived from an Evidence Vault archived artifact.
 */
export interface CellAddress {
  /** References newsroom.archived_artifacts.id */
  archiveId: string;
  /** 0-indexed sequence of the table within the source artifact */
  tableIndex: number;
  /** Deterministic table hash: sha256(archiveId + tableIndex + orderedColKeys) */
  tableId: string;
  /** Normalized deterministic row identifier */
  rowKey: string;
  /** Normalized deterministic column identifier */
  columnKey: string;
  /** Exact snapshot captured when human verification occurred */
  snapshot: CellSnapshot;
}

// ─── Tabular Claim Impact Mapper (Phase 4B-3F) ───────────────────────────────

export type TabularImpactClassification =
  | 'MATERIAL_VALUE_CHANGE'
  | 'REMOVED_ROW'
  | 'REMOVED_COLUMN'
  | 'UNIT_CHANGE'
  | 'DENOMINATOR_CHANGE'
  | 'PERIOD_CHANGE'
  | 'METHODOLOGY_REVIEW'
  | 'AMBIGUOUS'
  | 'NO_IMPACT';

export interface ClaimTabularImpact {
  claimId: string;
  classification: TabularImpactClassification;
  cellAddress: CellAddress;
  oldSnapshot?: CellSnapshot;
  newSnapshot?: CellSnapshot;
}

export interface TabularClaimImpactResult {
  tableIdOld?: string;
  tableIdNew?: string;
  archiveIdOld?: string;
  archiveIdNew?: string;
  impacts: ClaimTabularImpact[];
}

// ─── Editorial Mutation Dossier (Phase 4B-3G) ────────────────────────────────

export type DossierReviewState = 'REVIEW_REQUIRED' | 'NO_REVIEW_REQUIRED' | 'AMBIGUOUS_REVIEW_REQUIRED';

export interface DossierClaimImpact {
  claimId: string;
  storyId?: string;
  classification: TabularImpactClassification;
  cellAddress: CellAddress;
  oldSnapshot?: CellSnapshot;
  newSnapshot?: CellSnapshot;
  absoluteDelta?: number | null;
  percentageDelta?: number | null;
  unitChanged?: boolean;
  reviewState: DossierReviewState;
}

export interface EditorialMutationDossier {
  dossierId: string;
  archiveIdOld?: string;
  archiveIdNew?: string;
  tableIdOld?: string;
  tableIdNew?: string;
  globalMutations: TabularMutation[];
  affectedClaims: DossierClaimImpact[];
  hasAmbiguity: boolean;
  generatedAt: string;
}

