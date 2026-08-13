# THE BREAKDOWN — W3/W4 FORENSIC AUDIT

- **Date:** 13 Aug 2026
- **Author:** Independent forensic audit (read-only; first pass)
- **Head:** `6e2d666` · **Baseline:** `v1.0.0-audit-fixes` = `1ab15b1` · **Branch:** `audit-fixes-20260812`
- **Mode:** Read-only. No code, migration, model, or production state was modified. This report is the deliverable.
- **Source of truth:** Repository code + git history, not documentation claims. All file:line references verified.

---

## 1. Executive Verdict

### REQUIRES REMEDIATION — and migrations 009–013 are specifically ARCHITECTURALLY UNSAFE as written (MUST NOT be executed against any database).

The W3/W4 regime is **not** one system. It is three distinct populations with very different dispositions:

1. **The committed `lib/intel/*` intelligence system (97 tracked files, 11 `feat(intel)` commits, 11 tracked test suites wired into `test:all`)** — real, tested, computation over the frozen 403 dataset. This is the retained canonical intelligence layer.
2. **The untracked W3 operational pipeline** (`services/intelligence/*`, `packages/intelligence|iql|kap-sdk|mgcf-runtime`, `lib/intelligence|fusion|kap`, `app/api/v2/intelligence|kap|corrections`) — 249 working-tree files, zero commits. Conceptually sound ingestion stages with real SSRF guards, hashing, deduplication and idempotent upserts, **but** an evidence-provenance dead-end, mock providers, simulated monitoring, orphaned tests, and **no RLS on any table it would write**.
3. **The untracked W4 experiment stack** (`lib/events`, `lib/graph`, `lib/gaps`, `lib/workflow`, `lib/watchlists`, `services/monitoring`, `services/search/canonical-repository.ts`) — parallel experiments and duplicated functionality; most terminates at tests or never runs.

**The single most important fact:** the migration chain `001→013` **cannot execute on a clean database**. Migration 005 references enum value `REPORTED` that migration 004 never defines (and no `ALTER TYPE ADD VALUE` exists anywhere). The chain stops at 005; **009–013 never run at all**. The production database must have been patched out-of-band (the 005 comment falsely claims `REPORTED` was added in 004).

**Why not "ARCHITECTURALLY UNSAFE" for everything:** the W3 pipeline design itself (stages, guards, idempotency) is sound and worth salvaging; the committed intel system is genuinely good. The verdict is remediation-with-gates, not wholesale rejection. But nothing untracked may be committed, migrated, or deployed until the gates in §13/§14 are closed.

**Primary blockers:**
- P0 migration chain failure (005 `REPORTED`) — everything downstream unreachable.
- P0 zero RLS/policies/grants across all 29 tables in 009–013 — investigation notes, submitter emails, budgets, ingestion queues, signals and claims world-readable/writable if ever applied.
- P0 bare `git add -A` sweeps the untracked regime into the frozen baseline.
- P1 evidence provenance dead-end — `claim_evidence` table, repository methods and interface exist; **zero production callers**.
- P1 W3/W4 test suites orphaned from every CI command.
- P2 duplicate-model fragmentation — no single canonical Claim/Source/Evidence/Candidate/Constituency (≥4 Claim, ≥5 Evidence, ≥4 Constituency, 3 conflicting `ConfidenceTier` enums).

---

## 2. W3 Intel Architecture — the real pipeline

The W3 operational pipeline exists only in the working tree:

```
SOURCE registry           services/intelligence/repositories/supabase/source.ts → newsroom.sources
  ↓
DISCOVERY/capture         services/intelligence/capture.ts CaptureService.captureEndpoint
  ↓ providers             providers/rss.ts (STUB: supports()=false, fetchLatest throws "Not implemented")
                          providers/api.ts (resolveJsonPath) / providers/web.ts (meta+JSON-LD)
  ↓ SSRF guard            utils/http.ts isPrivateIP + safeRequest (tested, real)
  ↓ hashing               utils/hash.ts computeObservationHash (SHA-256, NFKC) → observation.contentHash
  ↓ DEDUP                 utils/deduplicator.ts (external_id, content_hash, canonical_url → link to oldest)
  ↓ NORMALIZATION         processing/canonicalizationService.ts (stripHtml, utm/fbclid/gclid removal)
  ↓ ENTITY RESOLUTION     processing/mentionExtractionService.ts (EN+Devanagari) →
                          processing/entityResolutionService.ts (ambiguous → null entityId)
  ↓ CLAIMS                processing/claimExtractionService.ts (deterministic markers; NEVER emits 'fact'|'speculation')
  ↓ NEAR-DUP              processing/nearDuplicateDetectionService.ts (token Jaccard + entity + temporal)
  ↓ SIMILARITY            processing/storySimilarityService.ts (weights 0.40/0.25/0.20/0.10/0.05)
  ↓ CLUSTERING            processing/clusteringOrchestrator.ts (HIGH≥0.85 join / MEDIUM 0.65–0.8499 provisional / LOW<0.65 new)
  ↓ JOBS                  jobs/intelligence-processing-job.ts (retryPolicy 3× EXPONENTIAL), jobs/capture-job.ts
  ↓ STORAGE               supabase repositories → newsroom schema (migration 012, UNTRACKED)
  ↓ EVIDENCE→CLAIMS→INTEL ✗ STOPS HERE — no story authoring; claim_evidence never written
```

**Verdict:** the SOURCE→…→CLUSTER chain is real, coherent, and guarded. The EVIDENCE→INTELLIGENCE→EDITORIAL-SIGNAL→STORY segment is **missing or disconnected**. Editorial signal comes from the *tracked* `lib/intel/*` (static analysis over the frozen dataset), not from this pipeline; the two systems never talk to each other.

A parallel KAP pipeline (`lib/kap/pipeline.ts` download→verify→parse→normalize→validate→identity-merge) exists and is consumed **only** by `bin/eos.ts` and tests — no app consumer. `eci-collector.ts` (tracked) is a mock (hardcoded Lucknow West / Anjaneya Mishra / checksum).

---

## 3. W4 Investigation Architecture — the real pipeline

**Verdict: NOT one coherent Investigation OS. It is a set of parallel experiments and duplicated functionality with one thin reader-facing slice.**

Duplication inventory (verified):

| Concept | Parallel implementations |
|---------|--------------------------|
| Graph | 1) `services/graph/service.ts` (production, BFS+confidence scoring) · 2) `lib/graph/*` (dead mock query engine, hardcoded `relation==='receives' ? 'PROJ-JAL-001' : 'UP-AC-061'`) · 3) `packages/graph/*` (plugin-only) · 4) `lib/knowledge/knowledge-graph.ts` (zero consumers) · 5) `services/fixes/fix-graph.service.ts` (genuinely used) |
| Event bus | `lib/events/eventBus.ts` (test-only) AND `lib/events/event-bus.ts` (kebab, one subscriber `MemoryGraphProjectionService.subscribeToEvents`, **zero publishers anywhere**) |
| Search | `MemorySearchService` (live on /search) + `lib/search/universal` (in-memory) + library matcher + **`CanonicalSearchService` (real Postgres FTS — dead code, never imported)** |
| Watchlist | `lib/watchlists/watchEngine.ts` (dead) vs `app/intel/watch-list/page.tsx` (different system) |
| Monitoring | `services/monitoring/service.ts` (SIMULATED, feeds dashboard) vs real-but-unwired `services/intelligence/providers/*` |
| Gaps | `lib/gaps/gapDetector.ts` (dead) vs `lib/quality/types.ts` vs `services/intelligence/intelligence-types.ts` |
| Bootstrap | `lib/bootstrap.ts` (sync) vs `services/bootstrap.ts` (async) |

The only coherent end-to-end path: Reader → `app/explorer/page.tsx` → `components/explorer/KnowledgeExplorerView.tsx` → `GET /api/v2/explorer` → `KnowledgeExplorerService` → in-memory store. Everything else terminates at tests or never runs.

**Monitoring is simulated, not real.** All 13 watchers (`SupremeCourtWatcher`, `RBIWatcher`, `ECIWatcher`, …) never fetch any external API. Each `check()` is a clock-condition returning hard-coded titles ("Constitution Bench to Hear Electoral Bond Review Pleas"). URLs are hard-coded homepages, never requested. No credentials exist in the file. `createMonitorService()` calls `runAllChecks()` at init, so the dashboard's "All 13 monitors active" reflects simulated data. `app/dashboard/page.tsx` (tracked) imports this untracked simulated service.

---

## 4. Evidence / Provenance Integrity

### What CAN be traced (verified in code)

| Path | Works? | Evidence |
|------|--------|----------|
| claim → observation → source | ✅ | `IntelligenceClaim.observationId` → `Observation.id` → `Observation.sourceId` FK → `newsroom.sources` |
| cluster → claims/observations | ✅ | `story_observations` (supports/originates), `story_claims` (role primary) |
| source → evidence → claims (reverse) | ❌ | `IClaimRepository.saveEvidence/getEvidenceForClaim` exist (supabase + memory) and table `newsroom.claim_evidence` exists with FKs — **called only in tests**, never by any production service |

### What CANNOT be traced

- **`claim_evidence` is never populated by the pipeline.** No claim extraction, clustering, signal, alert or job writes an evidence row. The dedicated evidence edge (with passage, strength, sourceUrl, sourceTier) is dead.
- **The W3 "Evidence" provenance object** (`packages/evidence/core/Evidence.ts`, W5a-blocked) is a **UI-only artifact** — `packages/evidence/src` is CitationLink/ClaimCard/ProvenanceDrawer/VerificationTimeline/EvidenceBadge. `compileProvenanceChain` returns 3 **hardcoded steps** ("Collector Ingestion"/"Parser Extraction"/"Graph Normalization") with fabricated checksum suffixes and a runtime `new Date().toISOString()` (non-deterministic). `verifyEvidenceIntegrity` is plain string equality — no tamper detection.
- The real ingestion checksum (`computeObservationHash`) is stored as `Observation.contentHash` and **never propagated** into any ClaimEvidence/Evidence object.

### Category separation (FACT / DERIVED / INFERENCE / SPECULATION)

- `EpistemicStatus` = `fact|reported|inference|analysis|speculation|unknown` is declared, but `claimExtractionService.detectEpistemicStatus` **never emits `fact` or `speculation`** — markers map only to reported/analysis/inference. The union is wider than the detector can produce.
- The four-layer discipline exists in the type system but is not enforced by the detector; DB columns are bare `TEXT` with **no CHECK constraints** (`epistemic_status TEXT NOT NULL DEFAULT 'unknown'`, `verification_state TEXT NOT NULL DEFAULT 'discovered'`), so the DB cannot reject invalid states.

---

## 5. Database Migration Audit

### Chain verdict: the chain FAILS on a clean database at 005. 006–013 unreachable.

### Migration table

| Migration | Purpose | Risk | Dependency | RLS | Status |
|-----------|---------|------|------------|-----|--------|
| 001 `create_tables` | 15 flat tables | none | — | ✗ | SUPERSEDED (dropped by 002) |
| 002 `canonical_schema` | multi-schema rebuild, 33 tables | MED: drops all 001 tables; destructive on re-run in autocommit; trigger loop breaks UPDATE on 5 join tables (no `updated_at`); unguarded `CREATE TYPE` | — | ✗ | EXISTING |
| 003 `image_intelligence` | media metadata | LOW (unguarded `ADD COLUMN`, fails safely) | 002 | ✗ | EXISTING |
| 004 `canonical_research` | bitemporal research schema, 11 tables, first RLS | HIGH: `research_evidence_items.extracted_text`, `research_corrections`, person/party master data have NO RLS | btree_gist (created here) | **partial** (3/11 tables) | EXISTING |
| 005 `research_gap` | gaps/protocols/semantics | **CRITICAL: references `REPORTED` not in `value_availability_status_type` → aborts; drops non-existent constraint name (silent no-op); old CHECK survives conflicting with new** | 004 | partial (3 tables) | **BROKEN** |
| 006 `financial_identity` | finance canonical_id/geo | none (all `IF NOT EXISTS`) | 004/005 | inherits | EXISTING |
| 007 `close_financial_nulls` | backfill NULL canonical_id | none (guarded) | 004–006 | — | EXISTING |
| 008 `relax_constituency_check` | widen canonical_id | none (transaction-wrapped) | 004 | — | EXISTING |
| 009 `knowledge_acquisition` | KAP ingestion tables | **CRITICAL RLS: none** — `research_ingestion_queue` (raw URLs, conflicts, errors), `research_diff_alerts` (field diffs) world-readable/writable | 004 | ✗ | UNTRACKED, UNSAFE |
| 010 `investigation_workspace` | workspace cases/evidence/notes | **CRITICAL RLS: none** — internal investigation notes, evidence, exports world-readable/writable | 002, **`auth.users`** (fails on bare Postgres) | ✗ | UNTRACKED, UNSAFE |
| 011 `governance_intelligence` | budgets/schemes/audits | **HIGH RLS: none** — budget amounts, audit findings open | — | ✗ | UNTRACKED, UNSAFE |
| 012 `create_intelligence_schema` | newsroom schema, 17 tables | HIGH: no RLS anywhere; protected only by schema obscurity + absence of grants — one grant/exposure change away from full disclosure | 002 (pgcrypto) | ✗ | UNTRACKED, UNSAFE |
| 013 `create_corrections_schema` | corrections + reader_corrections | **CRITICAL: `reader_corrections.submitter_email` commented "Private" but nothing enforces it — world-readable/writable PII** | 002, 012 | ✗ | UNTRACKED, UNSAFE |

### Order test (verified)
- **FAILS at 005.** `004:12` defines `value_availability_status_type AS ENUM ('KNOWN','UNKNOWN','NOT_FOUND','WITHHELD','NOT_REPORTED','NOT_APPLICABLE')`. `005:59-63` adds CHECK `amount_status IN ('KNOWN','REPORTED') …`. Enum input coercion throws at DDL time. `005:5-7` comment claiming "REPORTED was added in 004" is **false**. No `ALTER TYPE ADD VALUE` exists anywhere (grep-verified).
- **`005:58` drops `research_financial_records_check` — a name that does not exist.** 004 defines the CHECK column-level on `amount_value`, auto-named `research_financial_records_amount_value_check`. `IF EXISTS` → silent no-op → old constraint survives alongside the new → `REPORTED` rows would violate the old CHECK.
- **`010:8` references `auth.users`** — Supabase-only; breaks on bare Postgres.
- Checks that PASS: pgcrypto/uuid-ossp/btree_gist ordering, cross-migration FK ordering, no duplicate object names, schema-qualified refs, 008 widening compatible.

### Idempotency (re-run)
- SAFE: 001, 006, 007, 008, 009, 010, 011, 012, 013 (all `IF NOT EXISTS` / guarded).
- FAILS-SAFELY: 003, 004, 005 (unguarded `CREATE TYPE`/`ADD COLUMN` abort cleanly in transaction).
- **DANGEROUS: 002** — drops all tables first, then fails at `CREATE TYPE entity_kind` in autocommit mode → data loss. Safe only under per-file transaction rollback.

---

## 6. Security Findings

| Severity | Finding | Evidence |
|----------|---------|----------|
| **P0** | **Zero RLS, zero policies, zero grants on all 29 tables in 009–013** (incl. 17-table newsroom schema). Public-schema tables (009, 010, 011, 013) world-readable/writable under standard Supabase defaults | 009–013: no `ENABLE ROW LEVEL SECURITY`/`CREATE POLICY`/`GRANT` anywhere (grep-verified) |
| **P0** | `reader_corrections.submitter_email` — "Private (never exposed to public API)" is a comment, not enforcement | 013:37; table in `public` schema, RLS off |
| **P0** | Investigation workspace — `workspace_notes.content`, `workspace_evidence.notes`, `workspace_exports.file_url/checksum` fully open | 010:18–65 |
| **P0** | `research_evidence_items.extracted_text`, `research_corrections`, person/party master data unprotected | 004:119–231 |
| **P1** | `newsroom.*` (signals.recommended_action/why_it_matters, alerts, editorial_feedback, claims) — RLS off; locked only by non-exposed schema + no grants | 012 |
| **P1** | Middleware working-tree modification adds `/api/v2/explorer` to `PUBLIC_API_PATHS` (public, no x-api-key) and `/explorer` to authenticated pages, plus `isDemoMode()` bypass (tracked file, uncommitted change) | `middleware.ts:22,98` (working tree) |
| **P1** | gov budgets/audit findings open (011) · `research_diff_alerts`/`research_ingestion_queue` open (009) | 011:12–57; 009:21–58 |
| **P2** | `(db() as any).schema('newsroom')` pervasive — `any` casts defeat TS strictness at every repo boundary; hand-mapped camelCase↔snake_case, single column typo = silent runtime 4xx | all supabase repos |
| **P2** | `SSRF guards are REAL` (positive finding) — `isPrivateIP` + `safeRequest` tested against 9.9.9.9 | services/intelligence/utils/http.ts + tests/intelligence/ingestion.test.ts |
| **P3** | `CorrectionSubmitModal` posts category `'typo'` — not in `CorrectionCategory` nor the DB CHECK → POST rejected by real schema | components/rxs/CorrectionSubmitModal.tsx:26,205 vs types/corrections.ts:5, 013:12 |
| **P3** | No watchlist table exists in any migration (the watchlist UI is the different tracked system) | grep migrations |
| **P4** | 002 trigger loop breaks UPDATE on 5 join tables (no `updated_at`) at runtime | 002:606–625 |
| — | No secrets/API keys found in any W3/W4 code (positive). KAP getSecret is always faked (`'mock-secret'`/`'test-key'`). Monitoring contains no credentials. | grep-verified |

---

## 7. Model Conflicts

Confirmed duplicates (documented, NOT consolidated per audit rules):

| Concept | Competing definitions | Recommended owner |
|---------|----------------------|-------------------|
| `Claim` | `types/canonical.ts:668` · `types/models.ts:22` (legacy) · `packages/models/src/claim.ts` (confidence 0–100, conflicting status) · `types/research/domain/evidence.ts:30` · `IntelligenceClaim` `types/newsroom-intelligence.ts:199` · `CanonicalClaim` `types/canonical.ts:1847` | per-domain canonical (see §14) |
| `Evidence` | `types/canonical.ts:614` · `CanonicalEvidence:1947` · `types/models.ts:31` (legacy) · `packages/models/src/evidence.ts` (no id/sourceId — defective) · `packages/evidence/core/Evidence.ts` (provenance-only, no confidence) · `EvidenceItem` research · `ClaimEvidence` newsroom | research/newsroom split |
| `Source` | canonical · research · newsroom (`IntelligenceSource`) · `packages/models` (no id) · legacy `types/models.ts` | research/newsroom split |
| `Constituency` | `packages/models/src/constituency.ts` (403 flat, ~60 snake_case) vs `types/research/domain/geography.ts` (canonicalId + provenance) vs `lib/up403/types.ts` | research canonical |
| `Candidate` | `packages/domains/candidates/core/Candidate.ts` (rich) vs `packages/models/src/candidate.ts` (no id) vs `types/research/domain/elections.ts:9` (thin join) | research canonical (join) |
| `ConfidenceTier` | **3 variants**: `packages/iql/ast.ts:36` `C1..C5` vs `lib/intel/scoring/types.ts:5` `VERY_HIGH..VERY_LOW` vs `types/research/domain/evidence.ts:9` `C5..C0` (**reversed**) | single owner + aliases |
| `ConstituencyIntelligence` | **identical field set** in `packages/intelligence/src/types.ts:9` and `lib/intel/scoring/types.ts:33`; same `ScoreKey` names | `lib/intel/scoring` |
| `IntelligenceScore` | different shapes (packages:intelligence `{value,label,drivers}` vs lib/intel `{key,value,range,confidence,confidenceReason,drivers,assumptions,dataGaps,interpretation}`) | `lib/intel/scoring` (richer) |
| Alerts | `MonitorAlert` canonical:1301 vs `IntelligenceAlert` newsroom:327 vs `utils/dashboard-data.ts:32` (mock) | canonical |
| Gaps | **5 models**: `KnowledgeGap` intel-types:21, `CoverageGap` newsroom:362, `GapRecord` lib/quality:9, `ResearchGap` research/governance:24, `DataGapNotice` lib/up403/query-builder:204 | research canonical |
| Event bus | camelCase `eventBus` vs kebab `event-bus` (no publishers) | consolidate to kebab |
| Story | canonical:122 · models.ts:3 (legacy→delete) · packages/models/src/story.ts · TBSStory canonical:176 · render-layer block types | canonical |

**Hard facts:** no election types exist in the tracked canonical layer. `types/canonical.ts` `EntityKind` has no person-role; Person/Organization/Policy/Scheme/Budget/Report/Dataset/Source/Country only. The entire election domain is a parallel untracked model tree.

---

## 8. Provider Conflicts (memory vs Supabase vs W3/W4)

| Divergence | Evidence |
|------------|----------|
| **ID types** | newsroom DB = UUID `gen_random_uuid()` vs TS `id: string` (no brand) vs KAP slug strings (in-memory, never persisted) vs governance `VARCHAR(255)` vs 403 `canonical_constituency_id 'UP-AC-171'` vs research branded `CanonicalResearchId`/`InternalPrimaryKey` |
| **Timestamps** | Supabase repos stamp `updated_at` on every upsert; memory repos never touch timestamps |
| **`upsertMetadata`** | Supabase = non-atomic read-modify-write; memory = in-place merge |
| **Enum enforcement** | W3 enums are bare TEXT without CHECK; TS unions strict — DB cannot reject invalid states |
| **Health status** | 3 variants: KAP `'HEALTHY'|'WARNING'|…` vs newsroom `'healthy'|'warning'|…` (lowercase) vs DB `'HEALTHY'` (uppercase default) |
| **Claim confidence** | packages/models 0–100 vs newsroom 0–1 vs research C0–C5 tier strings |
| **Signal on cluster** | Supabase N+1 (second query per cluster) vs direct field in memory — observable divergence in `findById`/`findCandidates` |
| **RLS** | Research tables only (004/005); newsroom/KAP/governance/corrections have none |

---

## 9. API Inventory

### W3 (all untracked)

| Route | Method | Data | Auth | Consumer | Verdict |
|-------|--------|------|------|----------|---------|
| `/api/v2/intelligence/dossier` | GET | REAL (frozen dataset + lib/intel/scoring+predictions) | x-api-key (via middleware) | none | REAL, ORPHANED |
| `/api/v2/intelligence/explain` | GET | REAL fusion rules + **MOCK_PROJECTS** | x-api-key | `lib/intelligence/client.ts` (itself unconsumed) | REAL+RULES, MOCK DATA |
| `/api/v2/intelligence/compare` | GET | REAL (lib/up403/compare) | x-api-key | none | REAL, ORPHANED |
| `/api/v2/intelligence/seat-flip` | GET | REAL (scenario engine + flips) | x-api-key | none | REAL, ORPHANED |
| `/api/v2/intelligence/constituency/[id]` | GET | REAL (lib/intel/api-response) | x-api-key | api-contract test only | REAL, ORPHANED |
| `/api/v2/intelligence/timeline/[id]` | GET | REAL timeline + **MOCK_PROJECTS** | x-api-key | none | MIXED |
| `/api/v2/intelligence/relationship-graph/[id]` | GET | REAL (dataset graph) | x-api-key | none | REAL, ORPHANED |
| `/api/v2/kap/metrics` | GET | **HARDCODED MOCK** (HEALTHY, coverage 100.0) | none | none | MOCK, SELF-DEPRECATED |
| `/api/v2/corrections` | GET+POST | **IN-MEMORY** only (claim bridges DB, but no DB calls); POST throttled 3/15min/IP | x-api-key | `CorrectionSubmitModal.tsx:82` + `app/trust/corrections/page.tsx` | MOCK PERSISTENCE |

### W4

| Route | Method | Data | Auth | Consumer | Verdict |
|-------|--------|------|------|----------|---------|
| `/api/v2/explorer` | GET | REAL, in-memory store → KnowledgeExplorerService | **PUBLIC** (added to PUBLIC_API_PATHS in working tree) | `KnowledgeExplorerView.tsx:129` | INTEGRATED, untracked, in-memory |

**Orphaned APIs:** dossier, seat-flip, timeline, relationship-graph, kap/metrics (zero consumers). **Mock APIs:** kap/metrics, corrections (in-memory), explain/timeline projects (mock). **Public exposure risk:** `/api/v2/explorer` made public via uncommitted middleware change while its route is untracked.

---

## 10. Test Evidence

### Reality of test orchestration
- **No standard CI command runs any W3/W4 suite.** `npm test` = 10 tsx harnesses. `test:vitest` explicit include list excludes `tests/intelligence/*`, `tests/evidence/*`, `tests/quality/*`, `tests/graph/*`, `tests/workflow/*`, `tests/events/*`, `tests/fusion/*`, `tests/candidates/*`, `tests/explorer/*`, `tests/iql/*`, `tests/observation-monitor.test.ts` (verified). `test:research` (jest) catches only `tests/research/*.test.ts` (weak invariant, script-style kap-platform, env-gated db-integration). `test:all` chains tsx only. The AGENTS.md "106/106" refers to a different, canonical set.
- The untracked W3 suites use self-executing harnesses with `process.exit` and global monkey-patching (`ingestion.test.ts` patches `dns.lookup`/`http.request`/`https.request` at module load).

### Genuine proof (orphaned but real)
`tests/intelligence/processing.test.ts` (real pipeline stages, in-memory repos, idempotency; but band assertions self-certify — HIGH pre-seeds metadata, MEDIUM assertions conditional) · `ingestion.test.ts` (real SSRF defenses) · `tests/iql/compiler.test.ts` (real lexer/parser/planner) · `tests/graph/executor.test.ts` · `tests/workflow/workflowEngine.test.ts` · `tests/events/eventEngine.test.ts` · `tests/fusion/fusionEngine.test.ts` · `tests/explorer/knowledge-explorer.test.ts` · `tests/research/kap-platform.test.ts` (mocked).

### Self-certifying / meaningless
`tests/evidence/provenance.test.ts` (hardcoded mockEvidence, trivial checksum equality, runtime timestamp) · `tests/observation-monitor.test.ts` (asserts literals from hardcoded snapshot — fixture vs fixture) · `tests/research/invariant.test.ts` (mostly tautologies: `expect(type).toBe(type)`) · `tests/search.test.ts` ("returns an array") · `tests/evidence/verification.test.ts` (`typeof Component === 'function'`) · band assertions that accept any of HIGH/MEDIUM/LOW.

### Gaps
No test exercises: claim_evidence population (production never writes it), RLS at API level for 009–013, migrations 005–013 schema validity, the corrections `typo` rejection, non-determinism in provenance chain. `db-integration.test.ts` (1285 lines, careful, interlocked, env-gated) is **stale**: `EXPECTED_MIGRATIONS` lists only 001–004 but the directory has 13 files → would fail today if enabled.

---

## 11. Reader / Editorial Integration

| Surface | Status |
|---------|--------|
| `/explorer` (KnowledgeExplorerView) | **LIVE** in working tree (untracked API route, public, in-memory) |
| `/search` | LIVE (in-memory; 3 parallel engines on one page) |
| `/graph` | LIVE (services.graph) |
| `/dashboard` | LIVE but **monitors are simulated**; feed/panels mock |
| `/trust/corrections` + submit modal | LIVE in working tree, **in-memory persistence** |
| `/investigations` | LIVE (services.investigations) |
| `app/intel/*` (committed) | LIVE, RBAC-gated, real computation |
| `lib/events, lib/workflow, lib/watchlists, lib/gaps, lib/graph, canonical-search, newsroom pipeline, IQL, KAP, MGCF` | **BACKEND-INFRASTRUCTURE ONLY** — no reader/editorial consumer |

The only W3/W4 reader-observable surfaces (explorer, corrections) run on in-memory/mock data and are themselves untracked. Everything else is unreachable from the reader.

---

## 12. Production Readiness

Scale 0–5 (0 absent · 1 prototype · 2 partial · 3 functional · 4 verified · 5 production-ready). Not inflated.

| Subsystem | Arch | Code | Data | Sec | Tests | Integr | Prod |
|-----------|:----:|:----:|:----:|:---:|:-----:|:------:|:----:|
| Committed `lib/intel/*` (scoring, story, verification, executive) | 4 | 4 | 3 | 3 | 4 | 3 | 2 |
| W3 pipeline `services/intelligence` (capture→cluster) | 3 | 3 | 1 | 3 | 2 | 1 | 0 |
| W3 supabase repos / newsroom schema | 2 | 2 | 1 | 0 | 1 | 1 | 0 |
| `packages/iql` | 3 | 2 | 1 | 2 | 2 | 0 | 0 |
| `packages/kap-sdk` + `lib/kap` | 3 | 2 | 0 | 1 | 1 | 0 | 0 |
| `packages/mgcf-runtime` | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `app/api/v2/intelligence/*` | 3 | 3 | 2 | 2 | 1 | 0 | 0 |
| `app/api/v2/kap/metrics` | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `app/api/v2/corrections` | 2 | 2 | 0 | 1 | 1 | 2 | 0 |
| `app/api/v2/explorer` | 3 | 3 | 1 | 1 | 3 | 4 | 1 |
| Migrations 001–008 | 3 | 2 | 2 | 1 | 1 | 3 | 1 |
| Migrations 009–013 | 2 | 1 | 0 | **0** | 0 | 0 | **0** |
| `services/monitoring` | 2 | 2 | 0 | 2 | 0 | 3 | 0 |
| `services/search` (memory live / canonical dead) | 2 | 2 | 1 | 2 | 1 | 2 | 1 |
| `lib/events|graph|gaps|workflow|watchlists` | 2 | 2 | 0 | 1 | 2 | 0 | 0 |

---

## 13. Decision Matrix

| Component | Evidence | Migration | Security | Tests | Integration | **Decision** |
|-----------|----------|-----------|----------|-------|-------------|--------------|
| Committed `lib/intel/*` | strong | none needed | adequate (RBAC) | 11 suites wired | editorial/executive UIs | **KEEP SEPARATE** (tracked; already canonical — do not merge W3 into it) |
| W3 pipeline `services/intelligence` | sound stages | BLOCKED (012) | SSRF good, RLS missing | real but orphaned | none | **REFACTOR THEN INTEGRATE** |
| W3 supabase repos / newsroom schema | good | **BLOCKED** | **P0 RLS** | weak | none | **BLOCKED** |
| `packages/iql` | prototype | — | fine | 1 unwired | none | **ARCHIVE** (over-engineered for domain; 4/7 keywords dead; no executor) |
| `packages/kap-sdk` + `lib/kap` | frozen ADR-0016 concept, clean interfaces | 009 BLOCKED | mock secrets | harness | bin/eos + tests only | **KEEP SEPARATE** (concept sound; execution not production) |
| `packages/mgcf-runtime` | stub, `RuleDefinition = any`, duplicates `services/mgcf-runtime`, never built (no dist), 0 consumers | — | — | none | none | **DELETE** |
| `app/api/v2/intelligence/*` | real computation | none | x-api-key | api-contract | no UI consumer | **KEEP SEPARATE** (real but orphaned; no reader/editorial consumer yet) |
| `app/api/v2/kap/metrics` | hardcoded mock, self-deprecated | — | none | none | none | **DELETE** |
| `app/api/v2/corrections` | in-memory only; real reader surface | 013 BLOCKED (RLS, typo) | PII risk | none | trust page + modal | **COMPLETE THEN INTEGRATE** |
| `app/api/v2/explorer` | real in-memory | none | **P1 public exposure** (middleware, untracked) | 3 tests (untracked) | explorer UI | **REFACTOR THEN INTEGRATE** (commit tracked, decide exposure, wire DB) |
| Migrations 001–008 | reviewed | chain BROKEN at 005 | research partial RLS; 004 gaps | db-integration stale | — | **REMEDIATION REQUIRED** (fix 005 `REPORTED` + constraint name + 002 trigger loop + RLS on research_evidence_items/corrections) |
| Migrations 009–013 | reviewed | unreachable after 005 | **P0: zero RLS** | none | none | **BLOCKED — DO NOT EXECUTE.** Redesign with RLS + PII protection before any run |
| `services/monitoring` | simulated | — | fine | none | dashboard (live, fake data) | **REFACTOR THEN INTEGRATE** — either wire real watchers or clearly label simulated; stop implying live monitoring |
| `services/search/canonical-repository.ts` | real Postgres FTS | none | fine | none | dead | **COMPLETE THEN INTEGRATE** (wire as /search data source or delete) |
| `lib/events` (two buses) | duplicated; zero publishers | — | — | test-only | none | **DELETE** (consolidate into kebab EventBus if ever needed; wire a publisher first) |
| `lib/graph` | mock traversal; superseded by services.graph | — | — | test-only | none | **DELETE** |
| `lib/gaps`, `lib/workflow`, `lib/watchlists` | real logic, unused | — | — | test-only | none | **ARCHIVE** |
| W3/W4 test suites | genuine but orphaned | — | — | — | — | **COMPLETE THEN INTEGRATE** — wire into vitest/jest after remediation; convert `process.exit` harnesses to real suites |
| `packages/domains|models|intelligence|intelligence-contracts|evidence/core` | duplicate model tree | — | — | — | — | **BLOCKED** — model reconciliation decision required first (Level A ACP) |
| Untracked working-tree middleware change (`/api/v2/explorer` public + demo-mode) | — | — | **P1** | — | live | **BLOCKED / W7 DECISION** — auth-gating decision before any commit |

---

## 14. Exact Next Implementation Sequence

Only steps justified by this audit. Dependency-ordered; each is gated by the previous.

```
1.  Protect baseline
    └── Add .gitignore-style quarantine rules for untracked regime (P0 bare git add -A risk).
        No code changes.

2.  Migration repair (Level B ACP required — 001–013 are the schema; breaking)
    ├── Fix 005: add 'REPORTED' to value_availability_status_type via CREATE TYPE rewrite
    │   OR a guarded ALTER TYPE (out of transaction), then drop the CORRECT constraint
    │   name (research_financial_records_amount_value_check) before re-adding.
    ├── Fix 002 trigger loop (skip tables without updated_at) — medium, but only if
    │   touching 002.
    ├── RLS pass on 004/005 unprotected tables (research_evidence_items,
    │   research_corrections, persons, parties, constituencies, sources,
    │   claim_subject_relationships) — role-gated SELECT/INSERT/UPDATE/DELETE.
    ├── Verify chain on a THROWAWAY database (supabase db reset in a scratch project):
    │   001→013 executes, idempotent re-run safe.
    ├── Update tests/research/db-integration.test.ts EXPECTED_MIGRATIONS to 001–013
    │   and add newsroom-schema RLS assertions.
    └── Gate: chain green on scratch DB. Only then consider 009–013.

3.  Redesign 009–013 (BLOCKED → do NOT merge as-is)
    ├── Add RLS + policies to every table (ingestion, workspace, governance, newsroom,
    │   corrections). reader_corrections.submitter_email → never exposed; add explicit
    │   SECURITY DEFINER/function boundary or move to identity schema.
    ├── Move newsroom tables' exposure decision: keep schema-private, expose via
    │   RLS-gated functions only.
    ├── Decide corrections category set (remove 'typo' from UI or add to schema).
    └── Gate: migration review + RLS test in db-integration suite.

4.  Model reconciliation (Level A/B ACP) — one owner per concept, no consolidation of
    W3 code yet
    ├── Owner per concept from §7 (research canonical for research domain; newsroom
    │   for newsroom; lib/intel/scoring for scoring).
    ├── Collapse 3 ConfidenceTier variants → single + aliases.
    ├── Remove defective packages/models Claim/Evidence (no id) or fold into dataset
    │   types.
    └── Gate: typecheck + canonical.invariant test updated.

5.  Evidence provenance repair (the core W3 integrity gap)
    ├── Wire claim_evidence: claimExtractionService writes a claim_evidence row
    │   (passage, sourceUrl, sourceTier from the source observation) on every claim.
    ├── Propagate real contentHash into ClaimEvidence.
    ├── Replace fabricated provenanceChain with real hashing + deterministic chain.
    └── Gate: new test asserts claim→evidence→source round-trip AND source→evidence→claims
        reverse (currently impossible).

6.  Test wiring
    ├── Convert self-executing process.exit harnesses → vitest suites.
    ├── Add tests/intelligence, /explorer, /fusion, /candidates to vitest include list
    │   (post-fix).
    ├── Fix self-certifying assertions (deterministic fixtures; no `if band===`).
    └── Gate: vitest green in clean checkout.

7.  W3 pipeline integration (REFACTOR THEN INTEGRATE)
    └── Commit services/intelligence + repos + jobs as an atomic changeset AFTER
        migrations 009–013 are verified and RLS-green, wired into test:all,
        with an editorial consumer (e.g., editorial dashboard consuming pipeline
        signals) — per Platform Beta Experience Rule.

8.  W4 surface decisions
    ├── Monitoring: wire real watchers or re-label simulated; remove fake "active"
    │   claims from dashboard. (Reader-visible trust.)
    ├── CanonicalSearchService: wire as /search data source or delete.
    ├── Delete lib/events, lib/graph, packages/mgcf-runtime; archive lib/gaps,
    │   lib/workflow, lib/watchlists.
    └── W7 auth decision: /api/v2/explorer exposure + isDemoMode bypass — before the
        explorer route is ever committed.

9.  Reader-visible capability (Experience Rule)
    └── Exactly one: e.g., "Search now returns DB-backed results with provenance"
        or "Corrections are persisted and versioned." Ship one, measure the reader
        journey, then next.
```

**Deliberately excluded (no evidence justifies them):** IQL executor beyond EXPLAIN, MGCF runtime, KAP production wiring, intelligence→story authoring pipeline, temporal bitemporal extension, workspace UI.

---

## Success Condition Check

| Question | Answer |
|----------|--------|
| What does W3 actually do? | Committed `lib/intel/*` computes real editorial intelligence over the frozen 403 dataset (scoring/predictions/story/verification/executive). Untracked `services/intelligence` is an ingestion pipeline (capture→dedup→normalize→entities→claims→cluster) that stops before evidence/intelligence/story and is not integrated. |
| What does W4 actually do? | Reader surfaces (explorer, search, graph, dashboard, investigations) run in-memory/simulated data. The investigation machinery (events, workflow, watchlists, gaps, graph query, DB search) is unintegrated, duplicated, test-only infrastructure. |
| Which database tables do they require? | Newsroom schema (17 tables, 012), KAP (009), workspace (010), governance (011), corrections (013) — all untracked, all currently unreachable because the chain breaks at 005. |
| Are the migrations safe? | **No.** Chain cannot run on clean DB (005 `REPORTED`). 009–013 have zero RLS/policies/grants (P0). 002 destructive in autocommit. |
| Are internal intelligence objects protected? | **No.** Protected only where 004/005 RLS exists. Newsroom signals/alerts/claims, workspace notes, PII email are unprotected if the tables are created. |
| Can every claim be traced to evidence? | **Forward yes** (claim→observation→source). **Reverse no** (source→evidence→claims impossible; claim_evidence never populated). |
| Which models are canonical? | Rendering/knowledge-layer: `types/canonical.ts`. Research: `types/research/domain/*`. Newsroom: `types/newsroom-intelligence.ts`. The rest are duplicates/legacy — no single source of truth exists across domains. |
| Which systems are duplicates? | 5 graph engines, 2 event buses (0 publishers), 4 search paths, 2 watchlists, 5 gap models, 2 bootstraps, 2 monitor systems, 3 ConfidenceTier, 2 scoring layers. |
| Which APIs are actually consumed? | `/api/v2/explorer` (explorer UI), `/search`/`/graph`/`/investigations`/dashboard internals, `/api/v2/corrections` (modal + trust page). All intel/dossier/seat-flip/timeline/relationship-graph/kap/metrics are orphaned. |
| Which components are production-ready? | None in the untracked regime. Committed `lib/intel/*` is the closest (4/5 on the core dimensions, tests wired). |
| What should be integrated first? | The migration-chain repair (005) — it unblocks everything. Then RLS for 009–013. Nothing else is safe to touch until those two gates close. |
