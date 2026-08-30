# RIE v1.1 — Source Expansion & Recall Standard

**Status:** Ratified (Level 4 — Project Document)
**Version:** 1.1
**Date:** 15 Aug 2026
**Governance:** Subordinate to the Editorial Constitution (Level 1), AGENTS.md (Level 2), and the RIE v1.0 Operating Standard (`docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md`). Additive Level A/B surface only. Where this document is silent, the v1.0 standard governs.

---

## 1. Purpose

RIE v1.0 established a governed, verifiable research pipeline. RIE v1.1 measures and materially improves RIE's ability to **discover important information earlier and more completely than a reasonable human newsroom researcher**.

v1.1 is **benchmark-driven**, not additive-for-its-own-sake. The loop is:

```
known research universe → human/editorial gold corpus → RIE discovery
→ recall measurement → missed-source analysis → query/source/adapter improvement
→ re-run → measured improvement
```

No recall claim is made without a measured baseline. No source is added without a benchmark-grounded reason and editorial approval.

## 2. Objectives

RIE v1.1 optimizes:

- **RECALL** — the fraction of gold sources the system discovers
- **PRIMARY-SOURCE COVERAGE** — official/regulatory/judicial/parliamentary sources
- **SOURCE INDEPENDENCE** — distinct original reporting vs. wire/syndicated/derivative copies
- **FRESHNESS** — age of discovered information at retrieval
- **TIME-TO-DISCOVERY (TTD)** — `discoveredAt − publishedAt` for gold items
- **RELEVANCE / PRECISION** — fetched sources relevant to the research question
- **EDITORIAL USEFULNESS** — verification state, independence, and primary-source signal of what is surfaced

Explicitly **not** optimized: raw feed count, document count, AI summaries, social post count.

## 3. Benchmark-First Doctrine

1. **Measure before you claim.** A baseline is recorded (frozen) before any expansion. Improvements are only claimed as deltas against that baseline.
2. **Never game the benchmark.** The gold corpus is never hard-coded into search queries or adapter behavior; benchmark answers are never injected into the engine; benchmark fixtures are never detected and answered.
3. **No automatic self-modification.** Queries, domains, sources, and adapters change only through human governance: `DISCOVER → EVALUATE → BENCHMARK → APPROVE → ACTIVATE`.
4. **Separation of concerns.** Discovery is never truth. The signal chain is preserved: `SIGNAL → DISCOVERY → SOURCE → DOCUMENT → CLAIM → EVIDENCE → VERIFIED CLAIM`.
5. **Source independence is preserved.** Original, wire, syndicated, derivative, and independent sources are never treated equally.
6. **Security inherits from v1.0.** Every adapter uses the bounded fetch path, `assertSafeOutboundUrl` (never bypassed), timeouts, size limits, and rate limiting. No workaround around access controls, robots, or API terms.
7. **Determinism and cost control.** Matching and metric computation are pure and deterministic. Runs are bounded. Results are serialized to artifacts so scoring is reproducible.

## 4. Gold Corpus Standard

- Every benchmark topic is a **real, verifiable event or research question**. Fabricated events are forbidden.
- Every gold source is a **real, documented URL** that exists and is discoverable in real sources (a search engine or registry-approved feed).
- Every gold source record carries: `sourceId`, `category`, `title`, `url`, `publisher`, `sourceClass` (RIE class), `goldCategory` (one of the v1.1 categories below), `publishedAt` when known, the **reason for inclusion**, and the **specific facts** it establishes.
- Topics are assigned a `category` (see §5) and a `difficulty` (`EASY` / `MEDIUM` / `HARD` / `ADVERSARIAL`).
- Corpus provenance: `corpusId`, `corpusVersion`, `createdBy`, `createdAt`, `verifiedAt`, and a verification note per source.

### Gold source categories

`PRIMARY`, `SECONDARY`, `ACADEMIC`, `REGIONAL`, `INDEPENDENT`, `SOCIAL_SIGNAL`, `DATASET`, `COURT`, `REGULATORY`, `PARLIAMENTARY`.

### Topic categories

`POLICY_CHANGE`, `GOVERNMENT_ACTION`, `COURT_DECISION`, `REGULATORY_CHANGE`, `ECONOMIC_DEVELOPMENT`, `CORPORATE_DEVELOPMENT`, `POLITICAL_DEVELOPMENT`, `PUBLIC_PROGRAM`, `LOCAL/REGIONAL_EVENT`, `BREAKING_EVENT`, `HISTORICAL_RESEARCH`.

## 5. Benchmark Framework

The framework (`lib/intel/research/benchmark/`) is additive and pure where possible:

- **Matching** (`matching.ts`) — deterministic matching of discovered/fetched sources and documents against gold items:
  - `EXACT_URL` — canonicalized URL equality
  - `DOMAIN_HIT` — same registrable domain as a gold item (weak, informational)
  - `TITLE_MATCH` — key-term overlap ≥ threshold (near-hit)
- **Metrics** (`metrics.ts`) — pure computation of the §6 metric set from a benchmark run.
- **Runner** (`run.ts`) — orchestrates topic runs through a dependency-injected discovery driver. The production driver is `runApprovedSourceDiscovery` (registry-approved sources only). Tests inject deterministic drivers; the gold corpus is never an input to any driver.

### Miss classification

Every gold item not recalled gets exactly one primary classification:

`NO_SOURCE`, `WRONG_QUERY`, `LANGUAGE_GAP`, `REGIONAL_GAP`, `PRIMARY_SOURCE_GAP`, `SEARCH_ENGINE_GAP`, `ADAPTER_GAP`, `INDEXING_GAP`, `ENTITY_RESOLUTION_GAP`, `TEMPORAL_GAP`, `SOURCE_REGISTRY_GAP`, `PARSER_GAP`, `DEDUP_ERROR`, `OTHER`.

### Coverage gaps (discovery) vs. content research gaps

Discovery coverage gaps describe the **discovery surface**, never research findings:

`NO_PRIMARY_SOURCE_COVERAGE`, `NO_REGIONAL_COVERAGE`, `NO_ACADEMIC_COVERAGE`, `NO_LEGAL_COVERAGE`, `NO_STATE_COVERAGE`, `NO_LANGUAGE_COVERAGE`.

These are distinct from content research gaps (e.g., `UNVERIFIED_CLAIM`, `MISSING_PRIMARY_SOURCE` in the RIE gap registry), which mean "we don't know whether X is true." Mixing them is forbidden.

## 6. Metrics

Computed per run and aggregated per corpus:

- **Source recall** — gold sources recalled / gold sources eligible (known `publishedAt` within window, or no window restriction per run mode)
- **Primary recall** — gold `PRIMARY`-class sources recalled / eligible
- **Claim recall** — gold facts represented in extracted claims
- **Event recall** — gold timeline events represented
- **Independent recall** — gold independent-publisher sources recalled / eligible
- **Regional recall** — gold `REGIONAL` category sources recalled / eligible
- **Precision** — topic-relevant fetched sources / all fetched sources
- **False-positive rate** — irrelevant fetched sources / all fetched sources
- **TTD** — `discoveredAt − publishedAt` per gold item, in hours
- **Freshness percentiles** — median / p50 / p90 / p95 (hours) for TTD and for fetched-source age
- **Time-to-first-source / first-primary / corroboration / meaningful-update** — per topic
- **Source independence ratio** — independent publisher keys / source count, with counts of `original` / `wire` / `syndicated` / `derivative` / `independent` sources
- **Tracked costs** — fetch count, search count, AI calls (0 at v1.0), tokens, wall-clock latency

Per-dimension results are reported as `baseline / target / observed / delta`. No universal threshold is imposed; improvement is a measured delta in ≥1 coverage dimension with no regression in provenance, security, or source independence.

## 7. Source Governance Extension

v1.0 governance (`docs/research/source-governance.md`) is extended with the activation loop:

```
DISCOVER (benchmark miss / editor suggestion)
→ EVALUATE (class, authority, reachability, legality)
→ BENCHMARK (does adding it measurably improve a coverage dimension?)
→ APPROVE (Editor-in-Chief, recorded: approvedBy / approvedAt / rationale)
→ ACTIVATE (registry status ACTIVE)
```

New sources are only activated when they (a) map to a documented coverage gap, (b) are reachable and legal to access, and (c) do not regress precision or independence. Primary-source domains are preferred over additional secondary feeds.

## 8. Adapter Security & Behavior

- All network adapters use the pipeline's bounded fetcher with `assertSafeOutboundUrl`; SSRF, DNS-rebinding, and private-range vectors remain guarded.
- Adapters are rate-limited, time-limited, and size-limited; failures degrade to `PARTIAL` runs with recorded errors — never fabricated content, never fixture fallback.
- Respect API terms, robots, copyright, and authentication boundaries. No workaround around access controls.
- Registry health (consecutive failures, latency) already drives `DEGRADED`/`FAILING` states in v1.0; new adapters report the same `onFeedOutcome`-style health signals.

## 9. Implementation Order (fixed)

1. Benchmark framework + gold corpus
2. Baseline run (current registry surface) → frozen baseline
3. Miss analysis (classification, coverage-gap mapping)
4. Primary-source expansion (parliament, courts, regulators, PIB-style)
5. Academic/literature coverage
6. Indian regional-language / regional source coverage
7. Source-independence improvements
8. Time-to-discovery improvements
9. Re-runs + regression (no precision/provenance/independence regression)
10. Production activation of validated sources only

## 10. Definition of Done

- `npx tsc --noEmit` clean
- `npm run test:research` passes (excluding `db-integration.test.ts` environmental suite)
- `npm run build` passes
- Frozen baseline recorded before any expansion
- Measured improvement in ≥1 coverage dimension; no regression in provenance, security, or source independence
- Artifacts written: baseline + results + miss diagnostics
- No new top-level folders; additive surface only

## 11. Traceability

Every file in `lib/intel/research/benchmark/`, the gold corpus, and the v1.1 tests carries a header citing this document.
