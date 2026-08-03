# Phase IV — Mission Control Implementation & Certification

**Certification Date:** 03 Aug 2026
**Status:** ✅ **GO**
**Scope:** Executive Intelligence Surface + Institutional Trust Index service

---

## 1. Mission

Rebuild `/intel` (Mission Control) as the **Executive Intelligence Surface** that consumes a single shared service — the Executive Intelligence Service (`lib/intel/executive`) — instead of computing analytics inline. Add the **Institutional Trust Index** as a reusable, engine-agnostic service (`lib/intel/trust`).

The requirement is absolute:

> Mission Control owns **zero business logic**. It consumes only the Executive Intelligence Service. Nothing is recreated or duplicated from the certified engines.

This satisfies the Phase III readiness report's gap analysis: the Trust Index computation (the only missing executive metric) is now a pure, versioned, tested service, and the page is a read-only surface over verified engines.

---

## 2. Architecture

### 2.1 New services (both pure, test-covered, no engine re-implementation)

| Service | Location | Role |
|---|---|---|
| Institutional Trust Index | `lib/intel/trust/{types,index}.ts` | Pure, engine-agnostic weighted index. Explicit, versioned weights (`TRUST_VERSION = '1.0.0'`). Consumable by any surface (Mission Control, daily briefing, /trust dashboard). |
| Executive Intelligence Service | `lib/intel/executive/*` | The ONLY service Mission Control consumes. Aggregates the five certified engine overviews exactly once per briefing and reshapes them into presentation-ready summaries. |

### 2.2 Executive Intelligence Service modules

| Module | Produces |
|---|---|
| `index.ts` | `computeExecutiveBriefing()` (aggregation entry), `buildExecutiveBriefingFrom()` (pure sync reshaper, unit-testable) |
| `types.ts` | Canonical briefing types |
| `trust.ts` | Adapter between engine overviews and the reusable Trust Index |
| `metrics.ts` | 7 executive metrics (`EXECUTIVE_CALC_VERSION = '1.0.0'`) |
| `watchlist.ts` | Top-8 editorial watchlist (IPI-ranked, reason + action + next step) |
| `alerts.ts` | Capped-10 editorial alerts (severity-sorted, actionable) |
| `verification.ts` | Verification queue with canonical kinds + required documents |
| `scenarios.ts` | Scenario monitor (meaningful flips ≥ 3, top-5 per scenario) |
| `evidence.ts` | Evidence health (coverage, debt, category coverage) |
| `research.ts` | Research watch (findings + gaps) |
| `newsroom.ts` | Newsroom productivity (read-only, `persistence: 'none'`) |

### 2.3 Widgets

`components/intel/mission-control/*` — presentational only (TrustIndexPanel, MetricsGrid, WatchlistPanel, AlertsPanel, VerificationPanel, ScenarioMonitorPanel, EvidenceHealthPanel, ResearchWatchPanel, NewsroomPanel). All compose the shared `components/intel/shared/primitives.tsx`. No widget computes intelligence.

### 2.4 Page

`app/intel/page.tsx` calls `guardIntelModule('dashboard')` first, then `computeExecutiveBriefing()` once. No client-side filtering. Navigation updated in `app/intel/layout.tsx` (Mission Control first, then the engine surfaces it links to).

---

## 3. Institutional Trust Index

### 3.1 Weights (explicit, versioned `1.0.0`, per AGENTS.md)

| Component | Weight |
|---|---|
| evidence_coverage | 0.25 |
| evidence_confidence | 0.20 |
| verification_completeness | 0.15 |
| prediction_stability | 0.15 |
| scenario_consistency | 0.15 |
| research_completeness | 0.10 |

`validateWeights()` asserts the sum is 1. Every component carries value, weight, contribution (value × weight), confidence, evidence, limitation, and engine source — the calculation is never hidden.

### 3.2 Reusability

`computeTrustIndex(inputs, dataSource)` is engine-agnostic. Mission Control's adapter (`lib/intel/executive/trust.ts`) derives the six component inputs from the certified engine overviews; any future surface (daily briefing, /trust dashboard) can consume the same service with its own adapter.

---

## 4. Honesty rules applied

- **Frozen dataset, no temporal history:** alerts, trends, and metrics report cross-sectional signals only. Metric trends are `direction: 'na'` with an explicit note. No fabricated deltas anywhere.
- **No AI estimation:** every component and metric explains itself with evidence and limitations.
- **Evidence scale corrected:** the Evidence Engine emits `coverage` as a 0–100 percentage. The Executive Evidence Health module uses a local 0–100 `round100` (not the 0–1 `clamp100` from `lib/intel/scoring/util`), so coverage 84% is reported as 84, never clamped to 100.
- **Read-only newsroom:** `persistence: 'none'` — no fake assignments, no write path, no demo mode.

---

## 5. Authorization boundary (unchanged, re-verified)

`/intel` remains server-gated: `guardIntelModule('dashboard')` runs before `computeExecutiveBriefing()`. All 13 `/intel` routes remain `ƒ (Dynamic)` in the build. No intelligence data streams to unauthorized sessions.

---

## 6. Test coverage

| Suite | Assertions | Status |
|---|---|---|
| `tests/intel-trust.test.ts` (`test:intel-trust`) | 55 | ✅ passing |
| `tests/intel-executive.test.ts` (`test:intel-executive`) | 207 | ✅ passing |
| Existing intel suites (scoring/predictions/scenarios/evidence/toolkit/editorial) | 459 | ✅ all passing |

New scripts wired into `test:all`. Executive tests assert: seven bounded metrics, trust value equals the sum of contributions, watchlist sorted descending by IPI with action + next step, alerts severity-sorted with no fabricated deltas, verification kinds canonical and counts consistent, scenario flips ≥ meaningful threshold, evidence health within bounds, newsroom read-only, and key numbers match the certified engine outputs (no re-implementation).

---

## 7. Quality gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean (only 9 pre-existing `mgcf-runtime` module-resolution errors, unrelated) |
| `npm run lint` | ✅ no findings in new files (repo-wide pre-existing findings unchanged) |
| `npm run build` | ✅ passes; `/intel` route `ƒ (Dynamic)` at 578 B (delegates to service + components) |
| Core test suite | ✅ 53 passed |

---

## 8. Definition of Done

- ✓ Build passes
- ✓ Lint passes (no new findings)
- ✓ TypeScript passes
- ✓ Accessibility preserved (semantic sections, aria-labels, keyboard-friendly details/summary)
- ✓ Performance unchanged or improved (single aggregation, presentational widgets)
- ✓ Documentation updated (this document)
- ✓ Public APIs unchanged
- ✓ Tests added and passing
- ✓ No scope expansion (no new registries, abstractions, or rendering engines)

---

## 9. Traceability

| Artifact | Governing document |
|---|---|
| Mission Control page | `docs/intelligence/tbios-master-prompt-v1.md` (Mission Control) + Phase IV sprint brief |
| Institutional Trust Index | `AGENTS.md` (Institutional Trust Index composition) + `docs/intelligence/mission-control-readiness.md` (Phase III deliverable 5) |
| Executive Intelligence Service | Phase IV sprint brief (Executive Intelligence Surface) |
| Widgets | Phase IV sprint brief (presentational only) |
