# Phase 10A — Independent Audit of the Research Intelligence Engine (RIE v1.0)

```
Current Ticket:     PHASE-10A-INDEPENDENT-AUDIT (RIE v1.0)
Status:             In Progress — audit complete, report issued
Objective:          Prove RIE is a real evidence-first research pipeline, not a mock.
                    Publish the required A–K report with an explicit verdict.
Blocked By:         None
Depends On:         Frozen MVP Specification v1.1; Governing doc
                    docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md (Level 4)
Acceptance Criteria:
  ✓ All evidence-first guarantees verified against code, not claims
  ✓ Deterministic audit test suite added (tests/research/audit.test.ts)
  ✓ Live E2E against real network feeds with honest metrics
  ✓ 20-claim sample × 8 checks with five thresholds
  ✓ No new top-level folders; no schema/API/route changes; Level A only
  ✓ A–K report with explicit verdict + COMMIT / DO NOT COMMIT instruction
Definition of Done:
  ✓ Build passes  ✓ tsc passes  ✓ research suite passes (excl. db-integration)
  ✓ Audit suite passes  ✓ No scope expansion  ✓ Report issued
```

---

## Verdict

> **READY TO COMMIT** — `COMMIT`
>
> RIE v1.0 is a real, deterministic, evidence-first research pipeline. The
> orchestration (13-stage pipeline), engines, persistence, API routes and UI are
> implemented — the fixture adapter is a deterministic acceptance corpus, not a
> placeholder. A live run against four real RSS feeds completed with **zero
> errors**, extracted 57 claims from real articles, and a 20-claim sample passed
> **all five thresholds at 100%**. Idempotency was confirmed on live data.
>
> The audit found and fixed **nine small defects** (including two security-relevant
> and two correctness bugs). Larger issues are documented as findings, not fixed,
> per the audit's "small fixes only" mandate. No architecture, schema, API or
> navigation changed; no new top-level folders; every change is Level A additive.
>
> **No `git commit` was performed in this session.** The worktree is left
> uncommitted as instructed; the commit is the user's action.

---

## A. What was audited

The Research Intelligence Engine (`services/intelligence/research/`, `lib/intel/research/`)
in the uncommitted worktree: the pipeline orchestrator, all 14 engine modules, the
adapter layer (fixture + RSS), the persistence layer (memory/supabase/file), the
bootstrap, the five `/api/v2/research/**` routes, the auth gates, and the
`app/intel/research/rie/**` UI + server actions.

The central audit question — "is this a mock?" — resolves to:

> **Orchestration and engines: real. Data-source default: deterministic corpus.**
> The pipeline is genuinely wired; every query type previously routed to the
> `fixture` adapter, and production discovery is fixture-only until real feeds are
> configured. That is a configuration and routing defect (now fixed), not a
> placeholder architecture.

## B. Method

- Full source forensics: every engine, stage, adapter, repository, route and auth
  path read in this session (not inferred from names).
- New deterministic audit suite (`tests/research/audit.test.ts`, 22 tests, 10 areas)
  using a custom offline `AuditAdapter` for adversarial fixtures (syndication
  chains, prompt injection, viral social, fetch failures).
- Live E2E against four real public RSS feeds with the real `RssAdapter`, real
  `fetch`, `AbortSignal.timeout`, retries disabled, honest metric capture.
- Verification vocabulary: `IMPLEMENTED / PARTIALLY IMPLEMENTED / MOCKED /
  UNWIRED / UNSAFE / REGRESSION / NOT APPLICABLE`.
- Governance: AGENTS.md Platform Beta (Level A only, no new top-level folders,
  frozen baseline `v1.0.0-chapter1`); governing standard §11 excludes
  `tests/research/db-integration.test.ts` from the verdict.

## C. Inventory examined

| Area | Status |
|------|--------|
| `services/intelligence/research/pipeline.ts` | IMPLEMENTED (13 stages, wired) |
| 14 engines in `lib/intel/research/` (extraction, linking, corroboration, contradiction, dedup, gaps, social-signals, query-gen, topic-expansion, timeline, priority, source-quality, normalization, ids) | IMPLEMENTED; see §F for UNWIRED gaps |
| `adapters/{interface,fixture,rss,registry}.ts` | IMPLEMENTED (fixture = deterministic corpus; rss = real network) |
| `persistence/{index,memory,supabase,file,state}.ts` | IMPLEMENTED (prod provider: Supabase, single fixed row, merge-by-id) |
| `lib/intelligence/research-bootstrap.ts` | IMPLEMENTED (fixture + rss; `DEFAULT_RESEARCH_FEEDS = []`) |
| 5 API routes (`app/api/v2/research/**`) | IMPLEMENTED, dual-gated |
| `app/intel/research/rie/**` (UI + actions) | IMPLEMENTED |
| News Intelligence integration | PARTIALLY INTEGRATED — sibling subsystem; shared `pipeline_metrics` table only; no cross-subsystem data flow |

## D. Findings by area

| # | Area | Verdict | Detail |
|---|------|---------|--------|
| D1 | Pipeline orchestration | IMPLEMENTED | 13 stages; error semantics COMPLETED / PARTIAL / FAILED accurate; `run.errors` drives PARTIAL; FAILED = no adapters / project missing. |
| D2 | Adapter routing | FIXED | `SOURCE_TYPE_TO_ADAPTER_HINT` forced every query type to `'fixture'`; RSS was dead code in production. Removed; all adapters queried. |
| D3 | Change detection | FIXED | Claim extraction used `() => new Date()` → `claim.firstSeenAt ≠ run.startedAt` in production → `IMPORTANT_ACTOR_STATEMENT` / `BREAKING_DEVELOPMENT` never fired. Now `now: () => new Date(nowIso)`. |
| D4 | Outbound fetch safety | FIXED | Raw `fetch` with no URL validation = SSRF vector. Added `assertSafeOutboundUrl` (scheme + localhost/private/link-local/metadata/IPv6). The live E2E then caught a precision bug: IPv6 prefixes `f[c-f]` also matched real hostnames (`feeds.bbci.co.uk`). Guard now applies IPv6 patterns only to IPv6 literals and validates dotted-quad IPv4 properly. DNS-rebinding remains a documented residual. |
| D5 | Corroboration independence | FIXED | `isIndependent` was exported but unused; only `uniquePublishers.size` counted. A wire copy + its 4 reprints counted as 4 publishers. Now parent-presence and sibling-parent dedup make the file's own "never treats syndicated copies as independent corroboration" promise true. |
| D6 | Syndication detection | FIXED | `isSyndicated` compared `publisher.toUpperCase().includes(w)` with mixed-case `w` — the publisher path could never match; only the content-scan fallback worked. Uppercased both sides. |
| D7 | Deduplication integrity | FIXED | Content-dedup branch re-pushed the surviving document's id into `project.documentIds`, so `getDocuments` returned the same document twice. Removed the duplicate push. |
| D8 | Idempotency | FIXED | Social signals were created with fresh random ids every run (duplicated on re-run). Now deduped by permalink. Confirmed on live data: re-run added 0 documents, 0 claims. |
| D9 | Contradiction classification | PARTIALLY IMPLEMENTED | `SCOPE_DIFFERENCE` was unreachable: scope words ("all" vs "some") stayed in the predicate key, so differing scope → different keys → `null`. Fixed by stripping scope words from the predicate skeleton. `DEFINITION_MISMATCH` still requires differing claimType + differing values; identical wording with equal values correctly returns `null` (deterministic, value-driven). |
| D10 | Viral social / prompt injection | IMPLEMENTED | Hostile document text is inert data (deterministic engines, no LLM in the loop). Injected "VERIFIED…" instructions cannot force verification; viral single-source claims stay `PARTIALLY_CORROBORATED`. |
| D11 | Provenance | IMPLEMENTED | claim → evidence (`linkEvidence`/`locatorResolves`) → document → source → canonical URL → `retrievedAt`. Verified on every corroborated claim and in the live sample (100%). |
| D12 | Failure semantics | IMPLEMENTED | PARTIAL recorded on fetch/discover errors with per-source `ACCESS_UNAVAILABLE` + `failureReason`; never fabricated. FAILED for no-adapters / project-not-found. |

## E. Fixes applied (all small, well-scoped, Level A)

1. `pipeline.ts` — removed `SOURCE_TYPE_TO_ADAPTER_HINT`; `adaptersForQuery` returns all registered adapters. (P1)
2. `pipeline.ts` — added + exported `assertSafeOutboundUrl`; wired into `adapterContext().fetcher`; IPv6/hostname precision fix after live E2E. (P1)
3. `pipeline.ts` — claim extraction uses the run's fixed `nowIso`. (P2)
4. `pipeline.ts` — content-dedup branch no longer re-pushes the surviving document id. (P2)
5. `pipeline.ts` — social signals deduped by permalink (idempotency). (P2)
6. `adapters/fixture.ts` — `discover` filters `relevance > 0.3` (inert for unrelated topics). (P1)
7. `lib/intel/research/corroboration.ts` — syndication-aware independent-source count (parent present ⇒ skip; sibling copies of an absent parent ⇒ count once). (P2)
8. `lib/intel/research/deduplication.ts` — `isSyndicated` publisher case bug. (P1)
9. `lib/intel/research/contradiction.ts` — scope words stripped from the predicate skeleton so `SCOPE_DIFFERENCE` is reachable. (P3)

No new top-level folders. No schema changes. No public API/route changes. No registry/service-layer changes.

## F. Findings documented (not fixed)

- **Production discovery is fixture-only until feeds are configured.** `DEFAULT_RESEARCH_FEEDS = []` (research-bootstrap.ts). This is operational configuration — **do not invent feed URLs**. Fix: populate the feed list from an approved editorial source list.
- **Social-signals engine (`velocityScore` / `createSocialSignal` / `classifySignalTopic` / `signalHasClaim` / `claimFromSignal`) is UNWIRED.** The pipeline inlines minimal signals (`engagement {}`, `velocityScore 0`, `topicClassified []`, status `SIGNAL_ONLY`); `claimFromSignal` even emits ids with a `claim_` prefix inconsistent with the `rc_` convention. (P3)
- **Gap detection never emits `MISSING_GEOGRAPHY` / `MISSING_ACTOR` / `INSUFFICIENT_CORROBORATION`** — only the 5 emitted types plus `UNKNOWN`. (P3)
- **`classifySource` engine unused** by design (adapters provide `sourceClass`). Note only.
- **`findSyndicatedSource` effectively dead** — exact-hash-only, redundant with content-dedup. (P3)
- **`persist()` is fire-and-forget** (`void Promise.resolve(...).catch(...)`, core.ts:102–107). Durability caveat: a hard failure between save and run record is silent. (P3)
- **Empty-text documents** (parseStatus `EMPTY`) are still pushed to `project.documentIds`; an empty `contentHash` collision is theoretically possible. (P3)
- **`BREAKING_DEVELOPMENT` uses real `Date.now()`** against the 3-day `publishedAt` window — wall-clock test fragility. (P3)
- **`tests/research/db-integration.test.ts`** fails (57) because the live Supabase instance is unreachable from this environment — excluded from the verdict per governing doc §11.
- **RIE is outside the configured eslint scope** (`app components providers styles hooks types features`). 30 pre-existing lint findings exist in `services/` / `lib/` / `tests/`; the audit added none.
- **`tests/research/invariant.test.ts`** is pre-existing and tests `schemas/research/*` (Methodology v1.0), not RIE; it matched the jest glob and trivially passes. Note only.
- **Single-snapshot corroboration is inherently low**: in the live run, 0 of 57 claims reached `CORROBORATED` — correct, since a single article per proposition cannot corroborate itself. The corroboration mechanism is proven by the fixture and audit suites.

## G. Test results

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| Research suite (jest, excl. db-integration) | **59/59 pass** — 22 audit (new) + 9 acceptance + 8 core + 20 invariant |
| `tests/research/audit.test.ts` | 22/22: provenance, independence pyramid, dedup layers, 4 contradiction classes + documented limit, viral social, prompt injection, idempotency, failure semantics, SSRF guard, adapter routing, corpus health |
| `npm run build` | ✓ Compiled successfully (~253 pages) |
| eslint (changed files) | 30 pre-existing findings in out-of-scope dirs; none added |
| `git diff --check` | clean (CRLF warnings only) |

## H. Live E2E (real network, real RSS adapter)

Topic: *India-US trade*. Feeds: BBC Business, BBC World, The Guardian World, The Hindu (4 public feeds).

| Metric | Value |
|--------|-------|
| Run status | **COMPLETED** (0 errors) |
| Feeds reachable | 4 / 4 |
| Queries generated | 6 |
| Sources discovered | 24 (item-level dedup across queries) |
| Sources fetched → documents | 7 |
| Duplicates removed | 17 |
| Claims extracted (real articles) | 57 |
| Gaps found | 1 |
| Duration | ~6.4 s |
| Fetch calls | 11 (4 feed + 7 article); LLM calls **0** (deterministic); retries 0; DB ops 0 (memory provider; Supabase would be one merge-upsert per run) |
| Re-run idempotency | COMPLETED; 0 new documents, 0 new claims |

**20-claim sample × 8 checks** (n=20; the remaining checks — unauthorized access, no fabricated evidence — are covered by the API/auth route audit and the deterministic suites):

| Check | Pass | Target | Met |
|-------|------|--------|-----|
| Source validity (URL + status) | 20/20 | 100% | ✓ |
| Provenance (evidence → doc → URL + retrievedAt) | 20/20 | 100% | ✓ |
| Attribution (statement present) | 20/20 | 100% | ✓ |
| Evidence support (`locatorResolves` + span containment) | 20/20 | ≥95% | ✓ |
| Entity resolution (≥1 entity mention) | 20/20 | ≥95% | ✓ |
| Unauthorized access | 0 (authz verified in code: `guardIntelModule('research')` + session; API keys cannot elevate) | 0 | ✓ |
| Critical security findings | 0 after SSRF guard fix | 0 | ✓ |

## I. Security

- API-key roles (`admin/editor/reader`) cannot reach intel surfaces; session role is authoritative; all five research routes dual-gate `guardIntelModule('research')` (min role `researcher`) plus `getSession()` for mutations; middleware 401s `/api/*` without a valid key. — verified in code.
- SSRF guard now precise (see D4); DNS-rebinding is a documented residual risk, not a fixable defect at this layer.
- No secrets, tokens, or credentials exposed by the audited code; none added.

## J. Architecture & traceability

- All code carries the governing-document header (`docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md`).
- Frozen baseline `v1.0.0-chapter1` untouched: no schema migration, no navigation change, no public API change, no new top-level folder. All fixes Level A (additive/behavioral), no ACP required.
- Pre-existing non-RIE modifications in the worktree (not authored by this audit) are acknowledged: `app/series/…/chapter/page.tsx`, `app/trust/page.tsx`, `components/home/*`, `components/knowledge-library/ChapterPage.tsx`, `components/rxs/StoryShell.tsx`, `data/newsroom-observation-2026-08-15.json`, `lib/certification/canonical-certification.ts`, `lib/knowledge/{evidence-registry,knowledge-core}.ts`, `tsconfig.tsbuildinfo`, plus untracked non-RIE `lib/knowledge/trust-metrics.ts` and `tests/chapter-rendering.test.ts`.

## K. Cost / performance

- Live run: ~6.4 s wall-clock for 24 sources → 7 documents → 57 claims; 11 fetches; 0 LLM calls; 0 retries; bounded by `maxQueries`/`maxSources`/`maxDocuments`/`maxDiscoveryResultsPerQuery`.
- Persistence: one merge-upsert per run in production (fire-and-forget — see F).
- No memoization or caching added; none required for the audited scope.

---

## Verdict restated

**READY TO COMMIT — `COMMIT`.**

Thresholds: all five sample thresholds met (100/100/100/100/100); 0 unauthorized access; 0 critical security findings; idempotency proven on live data; deterministic audit suite green; build/tsc/tests green; architecture frozen-baseline-safe. The remaining operational requirement before meaningful production discovery is real feed configuration (an editorial decision, not an engineering one).

**No commit performed in this session.**
