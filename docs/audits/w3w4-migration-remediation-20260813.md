# THE BREAKDOWN — W3/W4 DATABASE MIGRATION REMEDIATION

- **Date:** 13 Aug 2026
- **Author:** Migration remediation (write pass) — companion to `docs/audits/w3w4-forensic-audit-20260813.md`
- **Head:** `100050d` · **Baseline:** `v1.0.0-audit-fixes` = `1ab15b1` · **Branch:** `audit-fixes-20260812`
- **Mode:** Write pass. Migrations 001–013 repaired and secured. Verified on a throwaway embedded PostgreSQL 18.4 cluster replayed from empty. No production database was touched.
- **Source of truth:** Repository code + replay output. Every assertion is reproducible via `node scripts/db-migration-replay.js`.

---

## 1. Executive Summary

All P0 migration-chain and security blockers identified by the forensic audit are **closed**:

1. **Chain executes from empty.** Migration 005 no longer aborts. `REPORTED` is defined at `CREATE TYPE` time (004) and guarded by an out-of-transaction `ALTER TYPE ADD VALUE` (005) for pre-existing databases. Verified `001→013` on a throwaway cluster.
2. **Trigger recursion fixed.** Migration 002's auto-trigger loop now creates `updated_at` triggers only on tables that actually have the column; the 5 join tables no longer break `UPDATE`.
3. **Every protected table has RLS.** Exactly **31 public tables + 17 newsroom tables** are now row-security-enabled and role-gated. This closes the audit's P0 finding of zero RLS across 009–013 and the unprotected legacy 004 research tables.
4. **PII protection.** `reader_corrections.submitter_email` is no longer world-readable. `reader_corrections` accepts anon *submissions* only under a real content-and-status `WITH CHECK`; reads/updates are internal-only. The public `corrections` projection remains publicly readable (deliberate — Corrections Policy mandates publication), with the rationale documented inline.
5. **Stale integration test repaired.** `tests/research/db-integration.test.ts` now covers 001–013 (was 001–004), with corrected financial fixtures (`canonical_id`, `currency`), a `COMMIT_SPLIT`-aware apply loop, and 013/RLS verification.

**Verification:** 17/17 replay assertions pass on an empty cluster, and the upgrade path (`001–008` → `009–013`) passes its integrity checks. Typecheck is clean for all changed files (the single `rss-parser` error is a pre-existing missing dependency in an untracked W3 file, outside this remediation's scope).

---

## 2. Deliverables

| Commit | Message | Files |
|--------|---------|-------|
| `7ef87bf` | `fix(db): repair migration 005 enum and constraint` | `004` (enum), `005` (guarded ADD VALUE, constraint drop/re-add) |
| `82b47db` | `fix(db): prevent recursive migration 002 trigger` | `002` (trigger loop) |
| `192f850` | `fix(db): add security policies for protected legacy tables` | `004` (RLS pass, 8 tables) |
| `125dcdc` | `fix(db): secure W3/W4 migration tables` | `009`–`013` (new files: triggers + RLS) |
| `32d8d34` | `test(db): add migration replay and RLS coverage` | `scripts/db-migration-replay.js`, `tests/research/db-integration.test.ts`, `package.json`/`package-lock.json` |
| `100050d` | `fix(test): scope replay harness to migrations 001-013` | `scripts/db-migration-replay.js` (glob fix) |

### 2.1 Why the sixth commit exists

The replay harness was initially committed with a generic glob (`/^\d{3}_.*\.sql$/`) that swept in the untracked `014_reader_workspace_schema.sql` (Reader Workspace — out of the audit's 001–013 scope). 014 adds an `auth.users` trigger referencing `raw_user_meta_data`/`email`, columns absent from the harness's minimal `auth.users` stub, so the workspace RLS assertion failed with `record "new" has no field "raw_user_meta_data"`. The harness now matches only `00[1-9]|01[0-3]`, its documented scope. **The audit-fixes baseline never contained 014; this was a harness test-selection bug, not a schema bug.**

---

## 3. Fix Detail

### 3.1 Migration 005 — enum and constraint repair (P0 chain failure)

- **004:** `value_availability_status_type` now defines `'REPORTED'` at `CREATE TYPE` time: `('KNOWN','REPORTED','UNKNOWN','NOT_FOUND','WITHHELD','NOT_REPORTED','NOT_APPLICABLE')`.
- **005:** a guarded `DO $$` block runs *before* the `-- COMMIT_SPLIT` marker and adds `'REPORTED'` only if absent — covering pre-existing databases that applied the original 004 enum. The split guarantees the new label is committed before the constraint references it (PostgreSQL forbids using a newly `ADD VALUE`d label later in the same transaction).
- **Constraint:** the audit asserted 005 dropped a non-existent name (`research_financial_records_amount_value_check`). That claim is inaccurate: 004's column-level CHECK is auto-promoted by PostgreSQL to a table constraint named `research_financial_records_check`, and the original `DROP CONSTRAINT IF EXISTS research_financial_records_check` is therefore correct. The drop is retained and re-adds the `REPORTED`-aware check under the same name, so the old KNOWN-only constraint cannot survive alongside it.

### 3.2 Migration 002 — trigger loop (audit finding P4)

The auto-trigger `DO $$` loop now joins `information_schema.columns` on `updated_at`, creating `trg_<t>_updated_at` only where the column exists. The 5 join tables without `updated_at` (`story_topics`, `story_entities`, `topic_entities`, `entity_relationships`, `story_timelines`) get no trigger, so their `UPDATE` no longer fails with `record "new" has no field "updated_at"`.

### 3.3 Migration 004 — RLS pass on unprotected research tables (audit P0)

Eight tables created without policies are now role-gated (`research_constituencies`, `research_persons`, `research_political_parties`, `research_projects`, `research_sources`, `research_evidence_items`, `research_claim_subject_relationships`, `research_corrections`). The gate mirrors the existing `research_claims` pattern:

```sql
(SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
IN ('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')
```

- `research_corrections` uses editorial gates (`editor`/`administrator`) for insert/update.
- **No `DELETE` policy is created on any table** — hard-delete protection, matching the audit's recommendation.
- No redundant `service_role` policies (BYPASSRLS already covers service contexts).

### 3.4 Migrations 009–013 — triggers + RLS (audit P0)

- **009** (`research_collectors`, `research_ingestion_queue`, `research_diff_alerts`): internal read/insert/update; `trg_research_ingestion_queue_updated_at` added (table created after 002's loop, so it lacked the auto-trigger).
- **010** (workspace): `workspace_cases` gated to `owner_id = auth.uid()` OR internal role; the five child tables (`workspace_evidence`, `workspace_notes`, `workspace_timeline_events`, `workspace_tasks`, `workspace_exports`) gate via `EXISTS` on `workspace_cases` for owner and internal role. `updated_at` triggers added for cases/notes/tasks.
- **011** (governance): internal read/insert/update on all six tables (`gov_ministries`, `gov_budgets`, `gov_schemes`, `gov_projects`, `gov_contractors`, `gov_audits`).
- **012** (newsroom): a `DO $$` loop enables RLS and creates the three internal policies on all 17 tables in the `newsroom` schema, which stays unexposed (kept schema-private; API/service-layer access remains the only path).
- **013** (corrections):
  - `public.corrections` — **publicly readable** (deliberate; Corrections Policy requires public publication). The inline rationale comment records the decision. Inserts/updates internal-only.
  - `public.reader_corrections` — open to `anon`/`authenticated` **INSERT only** with a real constraint: `status = 'received' AND passage_excerpt <> '' AND suggested_correction <> ''`. Reads and updates are internal-only. `submitter_email` is no longer world-readable.

### 3.5 Replay harness (`scripts/db-migration-replay.js`)

Runs 001–013 against a throwaway embedded PostgreSQL 18.4 cluster (`embedded-postgres`, `persistent:false`, wiped on exit), with a Supabase-compatible bootstrap: `anon`/`authenticated`/`service_role` NOLOGIN roles, `service_role` BYPASSRLS, `auth.jwt()`/`auth.uid()` stubs backed by `request.jwt.claims`, and a minimal `auth.users(id)`. Blanket default grants (mirroring Supabase `ALTER DEFAULT PRIVILEGES`) are re-applied **after** migrations so new tables have privileges. Replays run as superuser; RLS behaviour is exercised by switching role per transaction (`SET LOCAL role` + `set_config('request.jwt.claims', …)`).

---

## 4. Verification

### 4.1 Assertions — 17/17 pass on an empty cluster

1. `REPORTED` is present in `value_availability_status_type` after `KNOWN`
2. exactly one `research_financial_records_check` with a `REPORTED`-aware definition
3. financial record accepts `amount_status = 'REPORTED'` with a value
4. financial record rejects `REPORTED` with NULL value
5. financial record still rejects `KNOWN` with NULL value
6. every public table with `updated_at` has an auto-update trigger
7. join tables without `updated_at` have **no** auto-update trigger
8. `UPDATE` on a join table (`story_topics`) succeeds (non-recursive)
9. `UPDATE` on a trigger-bearing table bumps `updated_at`
10. RLS enabled on every protected table and nothing else
11. `anon` cannot read `research_evidence_items`; `researcher` can
12. workspace cases visible to owner and internal roles only
13. `public.corrections` readable by `anon`; `reader_corrections` is not
14. `reader_corrections` accepts anon submissions but only in `received` state
15. `researcher` cannot DELETE `research_financial_records` (no DELETE policy)
16. newsroom tables are internal-only (anon denied, researcher allowed)
17. every declared 009–013 foreign key is materialized (via `pg_constraint`; 18 expected pairs + ≥15 newsroom FKs)

### 4.2 Upgrade path

A second throwaway cluster applies 001–008 (25 public tables before 009), then 009–013. Integrity checks pass: `newsroom.sources` exists, `public.corrections` exists, `research_sources.organization` exists.

### 4.3 Full and partial RLS coverage

**31 public tables with RLS:** `corrections`, `reader_corrections`, `workspace_cases`, `workspace_evidence`, `workspace_exports`, `workspace_notes`, `workspace_tasks`, `workspace_timeline_events`, `gov_audits`, `gov_budgets`, `gov_contractors`, `gov_ministries`, `gov_projects`, `gov_schemes`, `research_claim_evidence_relationships`, `research_claim_subject_relationships`, `research_claims`, `research_collectors`, `research_constituencies`, `research_corrections`, `research_diff_alerts`, `research_evidence_items`, `research_financial_records`, `research_gaps`, `research_ingestion_queue`, `research_party_affiliation_history`, `research_persons`, `research_political_parties`, `research_projects`, `research_search_protocols`, `research_sources`.

**17 newsroom tables with RLS:** `sources`, `source_endpoints`, `source_health_log`, `source_reputation`, `observations`, `claims`, `claim_evidence`, `verification_events`, `story_clusters`, `story_observations`, `story_claims`, `story_velocity`, `signals`, `alerts`, `editorial_feedback`, `coverage_gaps`, `pipeline_metrics`.

**Not RLS-protected (deliberate):** the 18-table public content layer created by 002 (stories, topics, entities, fixes, media_items, datasets, and their join tables). This is the pre-existing public-content design; reader access is mediated by the API/service layer. RLS-adding those tables is a schema-level decision that requires its own ACP and is out of scope for this remediation.

### 4.4 Typecheck

`npx tsc --noEmit` reports exactly one error, pre-existing and unrelated: `services/intelligence/providers/rss.ts(2,20): Cannot find module 'rss-parser'` (missing dependency in an untracked W3 file). All files changed by this remediation are clean.

### 4.5 Test bugs corrected during verification (harness, not schema)

1. The workspace assertion initially expected an internal role to be denied another user's case; the policy deliberately allows internal roles cross-case access. The assertion now checks that a *plain authenticated user* (no research role) is denied while internal roles are allowed.
2. The FK assertion initially used `information_schema.constraint_column_usage`, which misreports cross-schema foreign keys. Switched to `pg_constraint`.

---

## 5. Idempotency Classification (audit §5, re-verified)

| Class | Migrations | Notes |
|-------|-----------|-------|
| SAFE on re-run (all guarded / `IF NOT EXISTS`) | 001, 006, 007, 008, 009, 010, 011, 012, 013 | confirmed in replay |
| FAILS-SAFELY (unguarded `CREATE TYPE`/`ADD COLUMN` abort cleanly in transaction) | 003, 004, 005 | unchanged |
| DANGEROUS in autocommit | 002 | drops tables before recreating; safe only under per-file transaction rollback. **Left unchanged** — migration 002 is pre-existing tracked baseline and no re-run path exists in the Supabase one-shot model. |

**Doctrine:** migrations are one-shot, not idempotent (Supabase's tracked-migration model; `CREATE TYPE`/`CREATE POLICY`/`CREATE TRIGGER` intentionally have no `IF NOT EXISTS`). This classification is documented, not tested — the replay and integration tests exercise the *fresh-apply* path, which is the only path Supabase takes.

---

## 6. Deliberately Out of Scope (audit findings NOT touched by this pass)

| Audit item | Status |
|-----------|--------|
| `014_reader_workspace_schema.sql` | Untracked, untouched. Reader Workspace feature migration — out of the 001–013 audit scope. The harness excludes it by design (§2.1). |
| P1 middleware `/api/v2/explorer` public exposure + `isDemoMode()` bypass | W7 auth decision; not a migration-chain issue. |
| P1 evidence provenance dead-end (`claim_evidence` never populated) | Audit §14 step 5 — pipeline work, not migration work. |
| P2 model reconciliation (ConfidenceTier, Claim/Evidence/Source duplicates) | Audit §14 step 4 — Level A/B ACP, not migration work. |
| P1 simulated monitoring | Audit §14 step 8 — W4 surface decision. |
| P3 corrections `typo` category mismatch | UI/schema category decision, deferred. |
| W3/W4 test wiring into vitest | Audit §14 step 6 — post-remediation; requires converting `process.exit` harnesses. |

---

## 7. Remaining Gates (audit §14, post-remediation)

Migration repair (step 2) is now complete. The remaining audit gates are unchanged and still bind:

1. **Step 3 — newsroom exposure decision** (schema-private + RLS-gated functions) and corrections category set.
2. **Step 4 — model reconciliation** (one owner per concept, single `ConfidenceTier`).
3. **Step 5 — evidence provenance repair** (wire `claim_evidence`, propagate real `contentHash`).
4. **Step 6 — test wiring** (convert self-executing harnesses to vitest suites; extend include list).
5. **Steps 7–9** — W3 pipeline integration and W4 surface decisions, each gated by the above, each delivering one reader-visible capability per Platform Beta rules.

Nothing in this remediation authorizes committing the broader untracked W3/W4 regime; the audit's P0 "bare `git add -A`" quarantine rule still applies.

---

## 8. Reproduction

```
node scripts/db-migration-replay.js
```

Expect: `Results: 17/17 assertions passed.` followed by `UPGRADE PATH (001-008, then 009-013) … [OK] upgrade-path integrity checks`. The cluster is ephemeral and removed on exit. Requires network to download the embedded Postgres binaries on first run.
