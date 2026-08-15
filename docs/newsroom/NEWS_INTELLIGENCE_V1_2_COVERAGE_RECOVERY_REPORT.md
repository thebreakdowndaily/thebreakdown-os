# News Intelligence v1.2 — Coverage Recovery Report

**Date:** 15 Aug 2026
**Status:** Coverage-recall recovery evaluation against a frozen holdout
**Verdict:** **RECALL RECOVERED**
**Auditor:** Newsroom Systems Auditor

---

## 1. Executive Summary

The v1.1 longitudinal benchmark (31-day window, 15 Jul – 14 Aug 2026) measured a
detection recall of **74.0%** and returned verdict `INCONCLUSIVE`. Before any
recovery engineering, v1.2 reclassified all **26 missed events** against
repository evidence instead of the v1.1 miss-analysis narrative. The evidence
separates the recall gap into two independent components:

| Component | Definition | v1.1 measurement |
| :--- | :--- | :---: |
| **Coverage recall** | eligible events whose source release entered the system | **74.0%** (74/100) |
| **Intelligence recall** | detected / successfully ingested (signal creation is unconditional) | **100.0%** (74/74) |

The entire recall gap was collection-side: **24/26** misses are
`SOURCE_NOT_INGESTED` and **2/26** are `OBSERVABILITY_GAP` (collection-side by
their v1.1 evidence). No missed event was lost to entity extraction, beat
routing, deduplication, or a filter — verified by running the real production
pipeline (26/26 entity matches, 26/26 routes to the expected beat) in
`data/newsroom-advantage-v1.2-pipeline-diagnostics.json`.

Three bounded collection-side interventions were implemented (I1 bounded retry +
fetch-failure gap, I2 feed-rotation gap detection, I3 coverage telemetry). They
were evaluated on a **frozen, pre-registration holdout** (`data/newsroom-advantage-v1.2-holdout.json`,
54 ground-truth releases, new observation period 17–18 Aug 2026) replayed
through the real adapter code in both configurations:

> **Coverage recall: 66.7% (36/54) → 77.8% (42/54) — +11.1 points.**
> **Silent losses: 6 → 0.** **False-positive gaps: 0.** **Regressions: 0.**

**VERDICT: RECALL RECOVERED** — coverage recall rose materially, every
unobserved release is now either recovered by retry or surfaced as a
`COVERAGE_GAPS` queue item for backfill, and no healthy feed window raised a
spurious gap.

---

## 2. Reclassification: Evidence vs the v1.1 Miss-Analysis Narrative

The v1.1 miss-analysis attributed misses to mechanisms that do not exist in the
repository: a cosine-similarity model (claimed scores like 0.42/0.51/0.54),
entity-confidence thresholds (0.58/0.59/0.65), filter rules (`isro-mou-02`,
`isro-mou-09`, "< Rs 100 crore rule"), and title-entity-similarity dedup. A grep
of `services/intelligence/newsroom` and `lib/intelligence` confirms none of
these exist. v1.1 was an authored benchmark, not runtime telemetry.

v1.2 rebuilt the miss classification from the actual pipeline contract:

- Signal creation is **unconditional on ingestion**
  (`pullPibObservations → upsertCluster → SignalEngine.evaluateSignal`, no
  gating). Entity extraction only affects routing.
- The real `getCanonicalEntityLexicon() + extractEntities()` **matched an entity
  for 26/26** missed events and `determineSignalBeats()` **routed 26/26 to the
  expected beat** (run in `scripts/run-news-intelligence-v1.2-diagnostics.ts`).
- No observation or signal exists for any missed event's canonical URL ⇒ the
  release never entered the system.

Result (`data/newsroom-advantage-v1.2-miss-diagnostics.json`):

| Primary failure category | Count | Meaning |
| :--- | :---: | :--- |
| `SOURCE_NOT_INGESTED` | 24 | Release was never present in a polled feed window (v1.1 categories FILTERING, DEDUPLICATION, ENTITY_MATCH_FAILURE, EVENT_MATCH_FAILURE refuted) |
| `OBSERVABILITY_GAP` | 2 | Collection-side category preserved from v1.1 (`pib-v11-036`, `pib-v11-068`; both also entity-match + route correctly) |

**Coverage recall = 74.0% (74/100). Intelligence recall = 100.0% (74/74).**
The intelligence layer was never the bottleneck. The bottleneck was collection:
the rolling feed window did not contain these releases, or the pipeline was not
observing the feed during their publication window (all 26 published on
2026-08-14, hours 10:00–23:00 UTC).

---

## 3. Interventions (bounded, collection-side, evidence-based)

Governing document for traceability: this report. All changes are Level A/B
additive — no schema change, no API break, no new registry.

### I1 — Bounded retry + fetch-failure gap (`lib/intelligence/pib-adapter.ts`)

- `fetchPibReleases` retries transient feed failures up to `retries` (default 2)
  with `retryDelayMs` backoff (default 1000).
- On persistent `PibFeedError`, `pullPibObservations` registers a
  `gap-source-pib-fetch-failed-*` **source_gap** (severity `critical`) before
  rethrowing — no silent 502-only loss.
- Adapter options: `retries`, `retryDelayMs` (both defaulted, additive).

### I2 — Feed-window rotation-gap detection (`lib/intelligence/pib-adapter.ts`)

- When a feed's oldest item is newer than the previously ingested newest
  (+5-minute tolerance), `pullPibObservations` registers a
  `gap-source-pib-rotation-*` **source_gap** (severity `high`) recording the
  unobserved `[gapStart, gapEnd]` span and recommending archive backfill.
- This directly targets the dominant v1.1 miss mechanism: releases published
  while the rolling window rotated past them were never in any polled feed.
- Gate: `detectRotationGap` (default true; disabled in deterministic replay).

### I3 — Coverage telemetry (`PullPibResult.coverage`, `PibCoverageWindow`)

- Every pull exposes `oldestPublicationDate`, `newestPublicationDate`,
  `itemCount`, `rotationGapDetected`, `gapStart`, `gapEnd`, and
  `registeredGapIds`.
- Registered gaps surface in the editorial queue's **`COVERAGE_GAPS`** section
  (`queue-service.ts`) and the pull route already spreads `...result`.

### Enabling core method (`services/intelligence/newsroom/index.ts`)

- `registerCoverageGap(gap)` is an additive public method; gaps are persisted,
  returned by `getCoverageGaps()`, and mapped into `COVERAGE_GAPS` queue items.

### What these interventions do NOT do (explicit scope boundary)

The adapter cannot backfill releases that were never in a polled feed window.
For rotation-lost and persistent-failure releases the interventions **surface
the loss** so the editorial queue can act on the documented remedy (re-run the
pull / backfill from the PIB archive). Auto-backfill is out of scope for v1.2.

---

## 4. Pre-registration & Holdout Design

Frozen before evaluation in `data/newsroom-advantage-v1.2-holdout.json`
(`frozen_at: 2026-08-15T00:00:00Z`):

- **New observation period:** 17–18 Aug 2026 (after the v1.1 window).
- **Ground truth:** 54 PIB releases with canonical URLs; 48 appear in exactly
  one of 8 scheduled pulls, 6 (2100031–33, 2100060–62) appear in **no** window
  (rotation-lost — inside the w5 same-day gap 11:20–12:00, or the w6 overnight
  gap 12:50 Aug 17 → 08:00 Aug 18).
- **Feed behaviors per pull:** `ok` × 5, `transient_failure` (w3), `rotation`
  (w5), `persistent_failure` (w7), `ok` with expected overnight rotation (w6).
- **Configurations (only variables under test):**
  - Baseline: `retries=0`, `detectRotationGap=false`.
  - Intervention: `retries=2`, `retryDelayMs=1`, `detectRotationGap=true`.
- **Pre-registered metrics:** coverage recall, intelligence recall, recovered-by-
  retry, regressed events, silent losses, gaps registered, false-positive gaps,
  duplicate rate. The VELT/timing family (median/P90 VELT, positive lead rate,
  valid comparator rate) requires external t2 comparators and is unaffected by
  collection interventions — reported N/A for this holdout.

Every pull runs the real production path (`fetch → normalize → dedup → ingest →
cluster → signal`); only the two adapter options differ between runs.

---

## 5. Evaluation Results

Full payload: `data/newsroom-advantage-v1.2-evaluation.json`.

| Metric | Baseline (off) | Intervention (on) | Change |
| :--- | :---: | :---: | :---: |
| **Coverage recall** | **66.7%** (36/54) | **77.8%** (42/54) | **+11.1 pts** |
| Recovered by retry | — | 6 (w3: 2100013–18) | +6 events |
| Regressed events | — | 0 | — |
| **Silent losses** | **6** (2100031–33, 2100060–62) | **0** | **6 → 0** |
| Gaps registered | 2 fetch-failed (w3, w7) | 2 rotation (w5, w6) + 1 fetch-failed (w7) | rotation surfaced |
| False-positive gaps | 0 | 0 | — |
| Intelligence recall | 100% | 100% | unchanged |
| Duplicate rate | 0% | 0% | unchanged |

Per-window behavior (intervention run):

- **w3 (transient_failure):** first fetch throws, retry succeeds → 6/6 ingested.
  Baseline threw with `retries=0` and lost all 6 silently.
- **w5 (rotation):** feed oldest (12:00) newer than previously ingested newest
  (11:20) → rotation gap surfaced, covering 2100031–33 (published 11:30–11:50,
  present in no window).
- **w6 (overnight pull gap):** after 19 hours without a scheduled pull, the
  feed's oldest item (08:00 Aug 18) is newer than the previous newest (12:50
  Aug 17) → rotation gap surfaced, covering overnight releases 2100060–62.
- **w7 (persistent_failure):** all attempts fail → `PibFeedError` + fetch-failed
  gap covering 2100040–45. No silent loss.
- **w1/w2/w4/w8 (healthy, contiguous windows):** no rotation gap raised — the
  tolerance correctly distinguishes overlap/boundary from rotation.

Verdict rule (pre-registered): `RECALL RECOVERED` requires recall delta ≥ 10 pts
and silent losses reduced to zero with losses present at baseline. Both hold.

> **VERDICT: RECALL RECOVERED**

---

## 6. Honest Limitations & Residual Risk

1. **Rotation-lost and persistent-failure releases are surfaced, not
   auto-recovered.** 6 holdout releases (and, structurally, releases published
   during extended unobserved periods such as the v1.1 2026-08-14 span) require
   a backfill from the PIB archive. The interventions convert a silent loss into
   an actionable `COVERAGE_GAPS` item; they do not by themselves ingest the
   missed release. Adapter-level archive backfill is the natural v1.3 candidate.
2. **Retry recovers transient failures only.** It cannot recover a window that
   was never polled (rotation) or an upstream outage that outlives the bounded
   retry budget (the persistent-failure case is surfaced, not recovered).
3. **The holdout is a replay model, not live telemetry.** It exercises the real
   adapter code with scripted feed behavior. It is deterministic and frozen, but
   the feed-window boundary is simulated at the adapter's fetch contract.
4. **VELT/timing metrics are out of scope** for this holdout (no t2 external
   comparators). Collection interventions do not touch timing; the v1.1 timing
   findings (median VELT +40.0 min, P90 +43.0 min) stand unchanged.
5. **Coverage vs intelligence decomposition is v1.1-population-specific.** On the
   v1.1 population the intelligence layer was 100%; the same decomposition must
   be re-run on future populations to confirm it holds beyond a single window.

---

## 7. Regression Verification

All quality gates pass with the interventions in place:

| Gate | Result |
| :--- | :---: |
| `npm run test:vitest` | **682/682** (58 files; +6 new recovery tests) |
| `npx tsc --noEmit` | clean |
| `npm run smoke:newsroom` | PASS |
| v1.1 integrity (`news-intelligence-benchmark-v1.1-integrity.test.ts`) | 11/11 |

New regression suite `tests/newsroom-pib-recovery.test.ts` (registered in
`vitest.config.js`) certifies I1-RETRY, I1-GAP, I2-ROTATION, I2-NO-ROTATION,
I3-TELEMETRY, and I3-QUEUE behaviors independently of the holdout.

---

## 8. Reproducibility

- Holdout (frozen): `data/newsroom-advantage-v1.2-holdout.json`
- Reclassification (26 records): `data/newsroom-advantage-v1.2-miss-diagnostics.json`
- Pipeline evidence (26/26 match + route): `data/newsroom-advantage-v1.2-pipeline-diagnostics.json`
- Evaluation payload: `data/newsroom-advantage-v1.2-evaluation.json`
- Generators: `scripts/run-news-intelligence-v1.2-diagnostics.ts`,
  `scripts/run-news-intelligence-v1.2-evaluation.ts`

---

## 9. Recommendation

Ship the v1.2 interventions as the current coverage baseline. Track the
`COVERAGE_GAPS` queue as the standing operational surface for backfill actions,
and schedule the v1.3 archive-backfill capability only if the editorial queue
demonstrates a recurring volume of rotation-lost releases that the 6-hour feed
window cannot cover.

---

## 10. Baseline 1.2 Freeze — News Intelligence Baseline 1.2

**Frozen:** 15 Aug 2026 · `data/newsroom-advantage-v1.2-baseline.json`

Baseline 1.2 is the production operating baseline for the newsroom intelligence
system. It captures the exact holdout reference and the quality gates it passed.

| Metric | Frozen value |
| :--- | :---: |
| Coverage recall (holdout) | **77.8%** (42/54) |
| Intelligence recall (holdout) | **100%** |
| Silent losses (holdout) | **0** |
| False-positive gaps (holdout) | **0** |
| Recovered by retry | 6 |
| Regressed events | 0 |
| Duplicate rate | 0% |
| Quality gates | tests 682 · tsc PASS · smoke PASS · v1.1 integrity 11/11 |

The baseline is guarded by `tests/news-intelligence-benchmark-v1.2-integrity.test.ts`
(INT12-01…10). Any drift from the frozen numbers fails the gate.

**Immutable:** the holdout and evaluation artifacts are preserved unchanged:
`data/newsroom-advantage-v1.2-holdout.json`,
`data/newsroom-advantage-v1.2-evaluation.json`,
`data/newsroom-advantage-v1.2-miss-diagnostics.json`,
`data/newsroom-advantage-v1.2-pipeline-diagnostics.json`.

## 11. Observation Mode — 7–14 Day Live Operating Window

Baseline 1.2 is frozen **as the reference, not as a live guarantee**. The system
now runs in a bounded observation window (≥ 7 days) measuring real operational
telemetry against the frozen holdout reference. No targets are defined; the
purpose is to establish operating baselines from measurement.

### 11.1 What is observed (Newsroom Intelligence Scorecard)

Surface: `/newsroom/scorecard` · JSON: `/api/v2/newsroom/scorecard` ·
Service: `services/intelligence/newsroom/scorecard-service.ts`.

| Family | Metrics |
| :--- | :--- |
| Detection | observations, clusters, signals, P0–P3 split, duplicate rate |
| Coverage | open / total / critical / high / resolved coverage gaps |
| Alerts | generated, acknowledged, **editor acknowledgement rate**, shadow mode |
| Editorial loop | triage actions, assignments, resolutions, **false-positive rate**, **published-from-alert** |
| Latency | **median detection latency**, **median time-to-alert**, **median time-to-editor**, **median time-to-action**, v1.1 reference (42 min) |
| Observation period | start, days elapsed, 7-day window flag |

### 11.2 The operating question

> **Did the signal reach a human editor before it mattered?**

Time-to-editor (`triggeredAt → acknowledgedAt`) and time-to-action
(`triggeredAt → first triage action`) are the strongest measured signals of that
question. Acknowledge and triage alerts through the command center so the
scorecard can measure them.

### 11.3 Observation rules

1. Live coverage recall is **not** claimed from live numbers. Live recall
   requires a ground-truth audit of the observation window; until then the
   scorecard surfaces the frozen holdout recall as the reference.
2. The scorecard defines no pass/fail. It records measured baselines.
3. Missed important events during the window are logged as coverage gaps and
   audited at window close.

### 11.4 v1.3 decision gate

v1.3 (archive backfill) starts **only after** the observation window completes
and live telemetry confirms a recurring volume of rotation-lost releases that
the 6-hour feed window cannot cover. Source expansion is deferred further, one
source family at a time.
