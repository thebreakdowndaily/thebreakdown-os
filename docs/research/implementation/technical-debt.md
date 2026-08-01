# Technical Debt Register – Research Implementation

## Debt Entry
- **Identifier**: DEBT-A2-REPORTED-MIX
- **Description**: The `REPORTED` status mixes source‑characterization (whether a value was reported by a source) with value‑availability semantics (whether the value is known, unknown, NOT_FOUND, etc.). While `amount_operator = GREATER_THAN` correctly preserves the lower‑bound nature of the ₹111 billion figure, the `REPORTED` flag still conflates these concerns, making downstream analytics harder to interpret.
- **Impact**: May lead to ambiguous queries when distinguishing between *reported* but *incomplete* data versus fully verified values.
- **Proposed Remedy**: Introduce a separate `value_availability` enum (e.g., `KNOWN`, `LOWER_BOUND`, `UNKNOWN`, `NOT_FOUND`) and deprecate `REPORTED` for financial records where appropriate.

## Debt Entry
- **Identifier**: DEBT-FIN-CANONICAL-ID-NULLS
- **Created**: 20 Jul 2026
- **Closed**: 20 Jul 2026
- **Migration**: 007_close_financial_canonical_id_nulls.sql
- **Description**: Migration 006 adds `canonical_id VARCHAR(100) UNIQUE` to `research_financial_records`, but pre-existing A1-style financial records (inserted before the column existed) have `canonical_id = NULL`. PostgreSQL treats NULLs as distinct for UNIQUE purposes, so multiple NULL rows are valid. However, these rows are outside the canonical-ID identity invariant.
- **Resolution**: Migration 007 backfills any NULL canonical_ids with generated identifiers (`FIN-LEGACY-{SHORT_ID}`), then adds NOT NULL constraint. All test INSERT statements updated to include `canonical_id`. The debt is now closed — all financial records participate in the canonical-ID identity invariant.

## Debt Entry
- **Identifier**: DEBT-SSL-MISSING
- **Created**: 22 Jul 2026
- **Closed**: 22 Jul 2026
- **Description**: `batch-ingest.js` pg client was missing `ssl: { rejectUnauthorized: false }`. Supabase's connection pooler silently dropped all INSERT/UPDATE writes without SSL, causing complete data loss on every ingestion run. Schema (DDL) persisted because migrations ran via a different path. Row data (DML) was silently discarded. This caused three complete data losses before root cause was identified.
- **Resolution**: Added `ssl: { rejectUnauthorized: false }` to the pg Client constructor in `batch-ingest.js` line 860. Verified with persistence test (row survives across connections). All subsequent ingestion runs persist correctly.

## Debt Entry
- **Identifier**: DEBT-RESUME-DUPLICATION
- **Created**: 22 Jul 2026
- **Closed**: 22 Jul 2026
- **Description**: `batch-ingest.js` resume logic failed when `completedStage === 'COMPLETED'`. `STAGES.indexOf('COMPLETED')` returns -1 (COMPLETED is not in the STAGES array), so `startIdx` became 0, re-running all stages and duplicating data. The `insertOrVerify` deduplication prevented duplicate claims/sources/evidence/financial, but junction tables (CSR) had no unique constraint and accumulated duplicates.
- **Resolution**: Added explicit check for `completedStage === 'COMPLETED'` before `indexOf` lookup (line ~739). Added partial unique indexes on `research_claim_subject_relationships`: `uq_csr_claim_constituency` on `(claim_id, constituency_id, scope) WHERE constituency_id IS NOT NULL` and `uq_csr_claim_project` on `(claim_id, project_id, scope) WHERE project_id IS NOT NULL`. Cleaned up 44 duplicate project-linked CSR rows.

*Recorded in `docs/research/implementation/technical-debt.md`.*
