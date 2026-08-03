# Mission Control Readiness Report

**Report Date:** 03 Aug 2026
**Phase:** Phase III Security & Intelligence Boundary Certification — deliverable 5 of 6
**Verdict:** ✅ **Mission Control is ready to build.** Every required capability already exists as a pure, gated, test-covered service. No new infrastructure is required; the next build is a read-only surface over verified engines.

The sprint brief for Phase III explicitly did **not** authorize implementing Mission Control. This report answers only: *can it be built safely on what exists?* Per the baseline doctrine, implementation remains a separate decision.

---

## 1. Which existing engines can Mission Control consume today?

All intelligence engines are **pure functions over the frozen public dataset** (`lib/data`). None require live Supabase. None have side effects. All have test suites.

| Engine | Module | Entry points | Consumed by | Test suite |
|---|---|---|---|---|
| Constituency Scoring | `lib/intel/scoring` | `computeScoringOverview(query)`, `getConstituencyIntelligence(id)` | `/intel` dashboard, `/intel/watch-list` | `tests/intel-scoring.test.ts` |
| Prediction Model | `lib/intel/predictions` | `computePredictionsOverview(limit)` | `/intel/predictions` | `tests/intel-predictions.test.ts` |
| Scenario Engine | `lib/intel/scenarios` | `computeScenariosOverview()` | `/intel/scenarios` | `tests/intel-scenarios.test.ts` |
| Evidence Registry | `lib/intel/evidence` | `computeEvidenceOverview(limit)`, graph/linkage/registry modules | `/intel/research` | `tests/intel-evidence.test.ts` |
| Editorial Intelligence | `lib/intel/editorial` | `computeEditorialOverview(limit)`, factor modules | `/intel/editorial` | `tests/intel-editorial.test.ts` |
| Reporter Toolkit | `lib/intel/toolkit` | `computeToolkitOverview()`, `getConstituencyToolkit(id)`, brief/field-pack/checklist submodules | `/intel/toolkit` | `tests/intel-toolkit.test.ts` |

**Readiness:** every engine can be consumed **without modification**. This was already verified in Phase II (engine registry audit, 459 passing engine assertions) and re-verified in this sprint (all six suites still green after the authorization layer was added).

**Pre-condition now met:** each engine is only reachable through a `guardIntelModule(module)`-gated Server Component (`app/intel/*`). Mission Control can call the same functions through the same gate with zero new plumbing.

---

## 2. Which shared services exist?

| Service | Location | Role for Mission Control |
|---|---|---|
| Authorization core | `features/auth/intel-auth.ts` | Pure `decideIntelAccess`, `guardIntel`, `intelModuleFromPath`, `normalizeIntelRole` — unit-tested |
| Server binding | `features/auth/intel-server.ts` | `guardIntelModule` (session-aware) used by every intel route |
| Session | `features/auth/auth-server.ts` | `getSession()` — fail-closed |
| Role policy | `features/auth/roles.ts` | Role hierarchy + module minimums (source of truth) |
| Session provider | `features/auth/components/SessionProvider.tsx` | Client-side session context |
| View models | `features/*/view-model.ts` (auth, editorial, dataset, workspace, story, topic, fix, entity, graph, search, home) | Established pattern for projecting canonical data into presentation |

**Readiness:** the shared service layer is complete. Mission Control needs no new service. If it adds one (e.g., a Trust Index aggregation service), it must follow the existing pure-function + structural-test pattern.

---

## 3. Which reusable widgets exist?

| Widget family | Location | Notes |
|---|---|---|
| Intel primitives | `components/intel/shared/primitives.tsx` | Shared card/stat/chart primitives used by existing intel pages |
| Denial surface | `components/intel/IntelDenied.tsx` | Authorization denial + login redirect (new this sprint) |
| Module placeholder | `components/intel/ModulePlaceholder.tsx` | Stub for the 6 deferred modules |
| Editorial cards | `components/intel/editorial/InvestigationCard.tsx` | Reusable investigation card |
| Toolkit workspace | `components/intel/toolkit/*` | `ToolkitWorkspace`, `ConstituencyPicker`, `ReporterBriefExport`, section components |
| Dashboard widgets | `components/dashboard/*`, `components/statistics/*`, `components/charts/*`, `components/graph/*`, `components/maps/*` | Chart, graph, map, statistics components used by public surfaces |
| Auth UI | `features/auth/components/*` | Guards, profile, login/register, reader dashboard |

**Readiness:** Mission Control's widgets can be composed from existing primitives (`components/intel/shared`, `components/charts`, `components/statistics`). No widget primitives need inventing.

---

## 4. Which executive metrics are already computed?

| Metric | Engine | Where |
|---|---|---|
| Watch-list scoring (competitiveness, incumbency risk, momentum, volatility, investigation priority) | `lib/intel/scoring/*` | `computeScoringOverview` |
| Prediction model outputs | `lib/intel/predictions/*` | `computePredictionsOverview` |
| Scenario coverage | `lib/intel/scenarios/*` | `computeScenariosOverview` |
| Evidence coverage, claim counts, evidence debt signals, linkage | `lib/intel/evidence/*` | `computeEvidenceOverview` |
| Editorial pipeline metrics | `lib/intel/editorial/*` | `computeEditorialOverview` |
| Institutional Trust Index | defined in AGENTS.md (25/15/15/10/10/10/10/5 weighting) | **not yet computed** — the only missing executive metric |

**Readiness:** six of the seven executive metrics that Mission Control is defined to show already exist and are covered by tests. The single missing computation is the Institutional Trust Index (Trust Dashboard component weights). That is one new pure function, not new infrastructure.

---

## 5. Does the read-only API exist to support Mission Control?

Mission Control is best served by Server Components (per the rendering doctrine: Server Components, streaming, Suspense). The read-only API already exists for any public-surface consumption and can be reused:

| Capability | API route(s) |
|---|---|
| Constituency / election data | `app/api/v1/...`, `app/api/up403/v1/constituencies/...` |
| Datasets + series + history + chart + download | `app/api/v1/datasets/...` |
| Stories, fixes, entities, topics, timelines, media, search | `app/api/v1/*` (read-only) |
| Knowledge graph | `app/api/v2/graph/...` |
| Claims, sources | `app/api/v2/claims`, `app/api/v2/sources` |
| Analytics | `app/api/v1/analytics`, `app/api/analytics/...` |
| Health | `app/api/health` |

**Readiness:** no new API surface is required. Any Mission Control endpoint must be read-only and must not import intelligence engines directly (structural test enforced).

---

## 6. Gap analysis — what a Mission Control build would add

| Gap | Severity | Effort |
|---|---|---|
| Institutional Trust Index computation (one pure function + tests) | Must add | Small |
| Mission Control page layout composing existing overview functions under `guardIntelModule('dashboard')` | Build | Small |
| "Can a first-time reader notice this in five minutes?" — Mission Control is an editor tool, not a reader surface; it competes with Chapter 1 publication priority under the 90/10 rule | Governance decision | n/a |

Per the founding directive, no platform feature (including Mission Control) is authorized before Chapter 1 is published. This report confirms the technical readiness; the governance decision to build remains with the Editor-in-Chief.

---

## 7. Conclusion

**Mission Control can safely consume the existing engines today.** Authorization is server-enforced, every engine is pure and tested, shared services and widgets exist, six of seven executive metrics are already computed, and the read-only API is complete. The only new computation required is the Institutional Trust Index. This satisfies the Phase III success criterion: *"Mission Control can safely consume existing engines."*
