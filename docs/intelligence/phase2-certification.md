# Phase II Certification — Intelligence Operating System (TBIOS)

**Certification Date:** 03 Aug 2026
**Certifier:** Phase II Architecture Certification (read-only audit)
**Status:** For review

---

## 0. Scope, Method, and Evidence Discipline

This certification evaluates whether the Intelligence Operating System (the UP403 Public Atlas, the Intel Workspace, scoring/prediction/scenario/evidence/toolkit/editorial engines, and the auth/RBAC layer) is coherent enough to become a professional newsroom's daily operating system.

**Method.** Read-only audit. No features were built. No production code was modified. No UI was redesigned. Every finding below carries an evidence trace to a file, test suite, build run, or command executed during this audit. Findings are separated into four layers throughout:

- **Verified** — directly observed in source, tests, or command output during this audit.
- **Inference** — reasoned from verified facts; the reasoning is stated.
- **Opinion** — editorial judgment on a verified or inferred basis.
- **Recommendation** — proposed action, scoped and justified.

**Yardsticks.** The governing doctrine is `docs/intelligence/tbios-master-prompt-v1.md` (v1.0, canonical). The roadmap is `docs/intelligence/roadmap.md`. Where the two conflict, the master-prompt doctrine wins. All module capabilities described in the doctrine are treated as **production assets** — a gap between doctrine and implementation is a finding, not an excuse.

**Gate runs during this audit:**

| Gate | Command | Result |
|---|---|---|
| Intel test suites (6) | `npm run test:intel-*` | **459/459 passed, 0 failed** |
| Build | `npm run build` | ✅ Compiled successfully in 10.3s (253 pages) |
| TypeScript | `npx tsc --noEmit` | 9 errors — all in pre-existing `packages/mgcf-runtime` + `services/mgcf-runtime` scaffolds; **zero intel errors** |
| Lint | `npm run lint` (baseline) | 1,428 problems (1,398 errors / 30 warnings) — all in pre-existing public `types/`, `app/editorial/*`, `hooks/useTracking.ts`; **zero intel-scope lint findings observed** |

**Baseline trust boundary.** The entire Intel Workspace, the auth layer additions, and the two doctrine documents are **uncommitted** on the current branch (verified via `git status`). Nothing in this audit treated that as an excuse — it is recorded as a repository-hygiene finding in Part 10.

---

## Part 1 — Architecture Audit

### 1.1 The core architecture is sound and discipline-compliant

**Verified.** The system is a clean layered DAG:

```
frozen dataset (data/master-dataset-v1/v1.1.0/up403-master-dataset-v1.json)
  └─ lib/up403/loader.ts          (single canonical loader, getCachedData)
       └─ lib/up403/*             (types, timeline, provenance, analytics…)
            └─ lib/intel/scoring/*    (leaf: score types, weights, per-seat)
                 ├─ lib/intel/predictions/*   (certainty, top-movers)
                 ├─ lib/intel/evidence/*      (field registry, debt, graph)
                 └─ lib/intel/scenarios/*     (definitions + engine)
                      └─ lib/intel/toolkit/*  (brief, verification workspace)
                      └─ lib/intel/editorial/* (IPI pipeline)
                           └─ app/intel/*  (7 real routes, server components)
```

Verified composition facts:
- `lib/intel/toolkit/index.ts` imports `scoring`, `predictions`, `evidence`, `scenarios/definitions`, `scenarios/engine`.
- `lib/intel/editorial/index.ts` imports the same five; it **reuses** the shipped `investigation_priority` driver rather than recomputing it (verified: `EDITORIAL_FACTORS`, `EDITORIAL_WEIGHTS`).
- No import cycles were found. `grep` of `@/lib/intel` in `app/intel` = 15 matches across the 6 real pages; in `components/intel` = 8 type-only matches across 5 files.
- The Editorial Intelligence factor `scenario_exposure` is derived from the scenarios engine (`projectSeat` flips); `prediction_instability` from predictions; `evidence_debt` from the evidence graph (`100 − coverage`); `verification_pressure` from verification metadata. **Verified: no duplicated logic.**
- `app/up403/*` (public Atlas) contains **zero** imports of `@/lib/intel` (verified via grep). Prediction/scores never leak into public pages.

**Impact.** A reader of the codebase can trace any number on any intel screen back to a single canonical dataset and a single engine path. This satisfies the platform's "knowledge first / single source of truth" discipline.

**Risk.** The frozen-dataset dependency means the entire intelligence stack is a function of one JSON file. If the dataset version bumps, the stack's integrity depends on `loader.ts` remaining canonical.

**Recommendation.** Do not build anything new on top of `lib/intel` until the workspace is committed to a branch with its governing doctrine. (Priority: High — this is a precondition, not a feature.)

### 1.2 Mission Control is a gap in the architecture, not a feature gap

**Verified.** `app/intel/page.tsx` renders a static analytics dashboard: party holds, DNA distribution, competitiveness distribution, dataset version, a link out to `/up403`. It does **not** render the executive surface the doctrine defines (Part 7 details this).

**Impact.** The primary landing surface is a readout of the public Atlas, not the operating system's decision surface.

---

## Part 2 — Workflow Certification (Six-Role Simulation)

Each workflow is simulated from verified page/module access, using `roles.ts` (module-to-min-role matrix, verified) and the real vs placeholder module status (verified, Part 4).

Legend: ✅ reachable with real capability · ⚠️ reachable but placeholder or context-losing · ❌ not reachable.

### 2.1 Reporter

| Step | Module | Result |
|---|---|---|
| Pick a constituency to report on | toolkit (reporter+) | ✅ `toolkit?constituency=<id>` → Reporter Brief, Interviews, Checklist, Field Pack, Markdown export |
| See ranked attention list | watch-list (analyst+) | ❌ rank is analyst-only |
| Pull evidence for a seat | research (researcher+) | ❌ evidence KB is researcher-only |

**Verified conclusion.** A reporter can produce a field brief for a single seat but cannot see *why* the desk prioritizes it. The reporter's job-to-be-done ("what am I reporting today and why") requires the analyst/editor layer to hand them a seat. **The handoff is not enforced by the system** — it happens out-of-band. Once the field pack is produced, there is **no write path** to record findings, no task entry, and no verification handoff (tasks and story-builder are placeholders).

**Impact/Risk.** Reporting field work lives outside the OS. The OS cannot learn from the field. This is the core "readout, not operating system" symptom.

### 2.2 Editor

| Step | Module | Result |
|---|---|---|
| See ranked investigations | editorial (editor+) | ✅ IPI-ranked pipeline, by-region, factor aggregates, global limitations |
| Drill into a seat | editorial → InvestigationCard | ✅ card links to toolkit + research + factor breakdown |
| Open the field pack | toolkit | ✅ (editor ≥ reporter, so reachable) |
| Create an assignment | tasks (reporter+) | ❌ placeholder |
| Begin drafting | story-builder (editor+) | ❌ placeholder |

**Verified conclusion.** The editorial loop — *prioritize → investigate → brief → assign → draft* — breaks exactly at the two write-capable steps. The editor's highest-value output (an assignment) cannot be expressed in the system.

### 2.3 Researcher

| Step | Module | Result |
|---|---|---|
| See evidence debt per seat | research (researcher+) | ✅ evidence overview, confidence distribution, linkage |
| Open evidence graph for a seat | research | ✅ `buildEvidenceGraph` + linkage |
| Register a new source / close a gap | (none) | ❌ no write path exists anywhere in the workspace |

**Verified conclusion.** Research is a pure readout of evidence debt. The researcher cannot log "source acquired for field X." The evidence graph is therefore **static** — it can only reflect dataset state, never research progress.

### 2.4 Analyst

| Step | Module | Result |
|---|---|---|
| See watch list, predictions, scenarios | watch-list/predictions/scenarios (analyst+) | ✅ full read capability |
| Record an assumption override | (none) | ❌ no write path |

**Verified conclusion.** The analyst is a consumer. The system cannot capture analyst judgment (`scenario assumptions`, `prediction adjustments`), which is precisely the judgment the doctrine wants to make explicit and reviewable.

### 2.5 Managing Editor

**Verified.** Can reach all real modules (rank 6 ≥ every min role). Same read-only limitation as every other role: visibility without a feedback loop. The one screen that should aggregate *institution-level* attention (Mission Control) is a static analytics dashboard (Part 7).

### 2.6 Fact Checker

| Step | Module | Result |
|---|---|---|
| Verify a claim | verification (fact_checker+) | ❌ placeholder route |
| Use the verification workspace | toolkit (reporter+) | ⚠️ `buildVerificationWorkspace` exists and is reusable (claims / missing / weak / conflicting) — but reachable only *inside* the single-seat toolkit, with no queue, no assignment, no status, and no aggregation |

**Verified conclusion.** The verification discipline that the Editorial Constitution makes mandatory (Gold Standard Review, evidence audit) has **infrastructure** but no **workflow**. The `verification` module is a placeholder; the reusable workspace is buried in the toolkit; there is no per-claim status lifecycle anywhere.

### 2.7 Workflow Synthesis (Part 2 verdict)

**Verified pattern across all six roles:** every role *reads* perfectly and *writes* not at all. The system is an intelligence **readout** with a complete sensing layer (scoring → predictions → scenarios → evidence → editorial IPI) and a **missing actuation layer** (assignment, verification status, story building, feedback capture).

**Impact.** As a *sensing* system it is production-credible. As an *operating system* it currently cannot close a single loop. The doctrine's own write-side modules (verification, tasks, story-builder, rti) are exactly the six placeholders.

**Recommendation.** The next phase must be the **first write capability** (Part 14) — not another readout, not another engine. Until one loop closes, the OS claim is untestable.

---

## Part 3 — Product / OS Certification

**Verified surface.** 7 real routes (`watch-list`, `predictions`, `scenarios`, `research`, `toolkit`, `editorial`, `dashboard`/Mission Control) plus 6 placeholder routes, behind a single 13-tab role-filtered nav in `app/intel/layout.tsx`.

### 3.1 What the product does well (verified)

- **Explainability is the standout.** Every number is self-documenting: drivers, confidence tiers, assumptions, and explicit limitations (`GLOBAL_LIMITATIONS` in `lib/intel/editorial/overview.ts`). The product tells the reader what it does *not* know. This is rare and institutionally valuable.
- **Visual consistency.** All real pages share one design language: CSS-variable theming, `SectionCard`, `ConfidencePill`, details/summary expanders, and consistent stat/panel patterns (`components/intel/shared/primitives.tsx`).
- **Public/private separation is clean.** The public Atlas is fully isolated from the intelligence engine (verified, Part 1).
- **Navigation is role-aware.** `intelModulesForRole(role)` filters the 13-tab nav (verified in layout).

### 3.2 What the product does not do yet (verified)

- **Placeholders are visible to authorized roles.** An editor sees `Story Builder`, `Verification`, `RTI`, `Tasks` as active tabs that land on a 10-line `ModulePlaceholder`. The impression is a half-built tool, not a scoped product.
- **No cross-module journey.** `InvestigationCard` links forward into toolkit/research, but nothing links into a verification state or a task; there is no journey that begins on Mission Control and ends in a draft.
- **Cognitive load is high.** 13 tabs for an editor; dense full-width tables (403 rows) on predictions/scenarios/editorial with no pagination, search, or density control observed.

### 3.3 Product verdict (opinion)

**Inference + opinion:** as a **decision-support dashboard** for analysts and editors, the current product is creditable and shippable. As a **daily operating system for a professional newsroom**, it fails the definition today because the write-side does not exist. The gap is not cosmetic — it is architectural (a missing actuation layer).

---

## Part 4 — Module Audit

Status per module (verified via route contents):

| Module | Min role | Status | Evidence |
|---|---|---|---|
| Mission Control (`/intel`) | guest | ⚠️ **Real but doctrine-gap** | static analytics; no `IntelModuleGuard`; no IPI/executive surface |
| Watch List (`/intel/watch-list`) | analyst | ✅ Real | `computeScoringOverview`, `SCORE_ORDER/LABELS`, ranked 25 |
| Predictions (`/intel/predictions`) | analyst | ✅ Real | `computePredictionsOverview`, certainty, tossups |
| Scenarios (`/intel/scenarios`) | analyst | ✅ Real | `computeScenariosOverview`, majority logic, flips |
| Research KB (`/intel/research`) | researcher | ✅ Real | `computeEvidenceOverview`, `buildEvidenceGraph`, linkage |
| Toolkit (`/intel/toolkit`) | reporter | ✅ Real | `computeToolkitOverview`, `getConstituencyToolkit`, workspace |
| Editorial (`/intel/editorial`) | editor | ✅ Real | `computeEditorialOverview`, IPI, `InvestigationCard` |
| Candidates (`/intel/candidates`) | researcher | ⚠️ Placeholder | `ModulePlaceholder` |
| Media (`/intel/media`) | reporter | ⚠️ Placeholder | `ModulePlaceholder` |
| Story Builder (`/intel/story-builder`) | editor | ⚠️ Placeholder | `ModulePlaceholder` |
| Verification (`/intel/verification`) | fact_checker | ⚠️ Placeholder | `ModulePlaceholder` |
| RTI (`/intel/rti`) | researcher | ⚠️ Placeholder | `ModulePlaceholder` |
| Tasks (`/intel/tasks`) | reporter | ⚠️ Placeholder | `ModulePlaceholder` |

**Verified summary: 7 real, 6 placeholder.** The placeholders are precisely the write-side and intake-side modules. Placeholder status is proven: `grep module="..."` = 18 matches, all six placeholders render `components/intel/ModulePlaceholder.tsx` wrapped in `IntelModuleGuard`.

**Risk (inference).** The six placeholders are where *new user-generated data* would enter the system. Because they are absent, there is no user data model, no persistence design, and no write path — the OS is structurally incapable of accumulating institutional memory beyond the frozen dataset.

---

## Part 5 — Editorial Story Trace (IPI → Investigation → Field Pack)

Trace of the one end-to-end capability that is fully real:

1. **Prioritize** — `lib/intel/editorial/overview.ts` computes IPI per seat: `structural_priority` (0.25, reuses `investigation_priority`), `prediction_instability` (0.25), `scenario_exposure` (0.15, from `projectSeat` flips), `evidence_debt` (0.20, from evidence graph), `verification_pressure` (0.15). Ranked pipeline + by-region + factor aggregates.
2. **Investigate** — `components/intel/editorial/InvestigationCard.tsx` surfaces the ranked seat with factor breakdown (`factorColor`: >70 error, >40 warning), IPI badge, confidence pill.
3. **Brief** — `components/intel/toolkit/ToolkitWorkspace.tsx` (server) renders `toReporterBriefMarkdown` + `toToolkitJson`; `ReporterBriefExport` (client) provides copy / download / print; `sections/*` give the field pack: core brief, interviews, checklist, evidence, verification, field pack.
4. **Verify** — `lib/intel/toolkit/verification.ts` can build a per-seat verification workspace (claims / missing evidence / weak evidence / conflicting evidence) — **infrastructure exists, route does not**.

**Verified conclusion.** Steps 1–3 are complete and tested. Step 4's *infrastructure* is complete; its *surface* is not. Step 5 (assign/draft/publish) does not exist.

**Impact.** A single seat can be carried from "why does this matter" to "here is a field brief," but the loop dies at the boundary where a human would respond. This is the strongest proof of the readout-vs-OS verdict.

---

## Part 6 — Knowledge Graph Review

**Verified structure.** The evidence graph is **per-seat vertical**: `evidence/index.ts` exposes `buildEvidenceGraph`, `buildEvidenceGraphAll`, and linkage; confidence distribution is 5-tier; `aggregateEvidence` produces by-category availability/coverage and total debt. Editorial `scenario_exposure` and `evidence_debt` consume this graph correctly.

**Inference on missing structure.** There is no **cross-seat horizontal graph** in the intelligence layer: no seat→candidate edges (candidates blocked — dataset has no candidate-level records, verified in `GLOBAL_LIMITATIONS`), no claim→verification-status edges (no verification state exists), no source→multi-seat edges surfaced in intel (source metadata lives in the public provenance layer, not linked into the IPI pipeline).

**Impact.** The knowledge graph answers "how complete is this seat's evidence?" but not "which evidence objects cross-cut many seats, and what does that mean institutionally?" The former is enough for the current phase; the latter is the doctrine's Media/Cross-cut promise and is honestly deferred.

**Recommendation.** Do not build the horizontal graph until the write-side exists. Building graph breadth on top of a readout multiplies the readout; it does not make it an OS.

---

## Part 7 — Mission Control Audit

**Doctrine (verified).** `tbios-master-prompt-v1.md` defines Mission Control as the **executive surface**: "what deserves our attention today? what will move? what does the desk need to act on?" The user prompt also states Mission Control must not be a static dashboard.

**Implementation (verified).** `app/intel/page.tsx` renders a static analytics dashboard of the public dataset (party holds, DNA/competitiveness distributions, version, `/up403` link). It does not render:
- the IPI-ranked pipeline (already computed in `lib/intel/editorial/overview.ts`),
- prediction instability / tossups (already computed),
- scenario exposure / flips (already computed),
- evidence debt / verification pressure (already computed),
- the Institutional Trust Index or freshness signals from the Editorial Constitution.

**Impact (opinion).** Every signal the doctrine wants on the executive surface is *already computed* and *already tested* — the engines produce them. Mission Control is a **presentation gap**, not an engine gap. This is the highest-leverage, lowest-risk improvement in the system: it turns the landing page from a mirror of the public Atlas into the desk's daily operating surface, using only verified, shipped outputs.

**Recommendation.** Part 14 adopts this as the next phase. (See Part 14 for the full, single-objective case.)

---

## Part 8 — Media Intelligence Readiness

**Doctrine (verified).** Media Intelligence is the full ingestion pipeline (ingestion → normalization → dedup → entity extraction → constituency mapping → topic classification → credibility scoring → evidence linking → version history → retention → scheduling → provenance) extending the Evidence Graph. Roadmap marks Part 6 **⏳ deferred** — consistent with doctrine (deferral is allowed; absence is not a violation).

**Implementation (verified).** `app/intel/media` is a placeholder. No ingestion, storage, scheduler, or corpus exists. The platform's data architecture is a frozen JSON dataset loaded by `lib/up403/loader.ts`; there is **no write/ingestion data layer anywhere**.

**Readiness verdict (inference).** Media Intelligence **cannot be built without architecture changes**: it requires a persistence/ingestion layer (database or event bus + storage), a scheduler, and normalization services — none of which exist, and all of which the Platform Beta rules classify as new generic infrastructure (Level C, requiring an ACP and a new baseline). The doctrine's own constraint — "do not scaffold on empty data" — correctly keeps this deferred.

**Impact.** Deferral is correct. Attempting Media Intelligence now would violate the architecture freeze and would build on a non-existent data substrate. **No action recommended** beyond keeping it deferred and recording the dependency.

---

## Part 9 — Verification Workspace Readiness

**The largest functional gap in the doctrine-mandated workflow.**

**Verified infrastructure available today:**
- `lib/intel/toolkit/verification.ts` — `buildVerificationWorkspace(seat)` produces separated claims / missing-evidence / weak-evidence / conflicting-evidence lists (reusable, tested via `tests/intel-toolkit.test.ts`).
- `lib/intel/editorial/factors.ts` — `verification_pressure` factor (0.15 of IPI) already computes per-seat verification pressure.
- `lib/intel/evidence/*` — confidence tiers, coverage, debt per field/category.
- `lib/intel/scoring/types.ts` — `ScoreDriver` / `ScoreAssumption` / confidence-tier types that a verification state would consume.

**Verified absence:**
- `app/intel/verification` is a placeholder.
- No **queue** (which claims need verification, in what order, by whom).
- No **assignment** (fact-checker vs editor ownership).
- No **status lifecycle** (pending → in progress → passed → rejected → corrected) — nothing persists.
- No **aggregation** across seats (the toolkit workspace is single-seat by design).

**Impact.** The Gold Standard Review discipline in the Editorial Constitution (Phase 3 Evidence Audit; Verification Bureau has stop-publication authority) has no software home. A newsroom adopting the OS cannot demonstrate verification state, cannot report verification progress, and cannot recover evidence debt — the exact metrics the doctrine says define institutional trust.

**Recommendation.** The Verification Workspace is the natural **second** phase (after Mission Control), because it is the first *write* capability and reuses already-built, tested infrastructure. It is intentionally not the next phase (see Part 14) because it introduces the persistence question the platform has not yet decided; Mission Control does not.

---

## Part 10 — Tech Debt Inventory

| # | Finding | Verified evidence | Severity |
|---|---|---|---|
| 1 | **Entire workspace uncommitted.** All of `app/intel/`, `components/intel/`, `features/auth/` additions, `lib/intel/`, `lib/up403/*`, `docs/intelligence/`, 6 test suites, and the two `mgcf-runtime` trees are untracked; `middleware.ts`, `package.json`, `tsconfig.tsbuildinfo` modified. | `git status` | High |
| 2 | **Module RBAC is client-side only.** `IntelModuleGuard` is `'use client'`; the server computes and serializes module data into the RSC payload before the guard can hide it. An authenticated user with `guest`/`reader` role can receive full predictions/scenarios/editorial data for all 403 seats in the HTML payload despite "Access Denied" UI. | `app/intel/predictions/page.tsx` (server compute + `<IntelModuleGuard>` wrap); `IntelModuleGuard.tsx`; `middleware.ts` gates only authentication | **Critical** |
| 3 | **Public self-registration can mint a session that passes middleware.** Register route (`app/api/v1/auth/register/route.ts`) is public and sets only `name` in `user_metadata` — never a role. `normalizeIntelRole('reader')` → `guest` (not in `ROLE_RANK`). Guest is denied all modules *in the UI* but the middleware only checks "has session," so the RSC payload of any real module is reachable. | register route; `roles.ts:91-94`; middleware `AUTHENTICATED_PAGES` | Critical (compound of #2) |
| 4 | **Dead code: server-side role guard exists but is unused.** `features/auth/role-guard.ts` (`getIntelAccess`) has **zero imports** anywhere (verified via grep). The server-side enforcement it was built to provide does not exist. | grep `getIntelAccess|role-guard` | Medium |
| 5 | **Demo-mode / middleware split-brain.** Demo login stores a flag in `localStorage` (`tb_demo_session`) and `SessionProvider` fabricates the session client-side; middleware checks Supabase cookies server-side. A demo-editor session therefore cannot pass the `/intel` middleware gate. Demo mode works only for pages the middleware lets through. | `features/auth/demo.ts`; `SessionProvider.tsx`; middleware | Medium |
| 6 | **Repo-wide gates fail for reasons unrelated to intel.** `npx tsc --noEmit` fails (9 errors) because `packages/mgcf-runtime/src/{metadata,snapshot,state}.ts` import nonexistent `./ids` / `./types`, and `services/mgcf-runtime/src/index.ts:5` imports nonexistent `./registry/RuleRegistry.js`. `npm run lint` baseline = 1,398 errors / 30 warnings in pre-existing `types/canonical.ts`, `types/models.ts`, `app/editorial/*`, `hooks/useTracking.ts`. **Intel-scope code is clean** under both. | tsc run; lint baseline | High (gates, not intel) |
| 7 | **`@thebreakdown/mgcf-runtime` is an incomplete scaffold** (package 0.1.0: yaml, zod, zod-to-json-schema, ajv, winston, prom-client, graphlib, tiny-lru, p-limit, fast-deep-equal) with no `ids.ts`/`types.ts`/`RuleRegistry`. Its 9 errors block `tsc --noEmit` for the whole repo. | `packages/mgcf-runtime/src/*`; `services/mgcf-runtime/src/*` | Medium |
| 8 | **Duplicated presentation constants across pages.** `SCORE_ORDER`, `SCORE_LABELS`, `CONFIDENCE_COLOR`, `PARTY_COLORS`, plus local `StatCard`/`IntelPanel` helpers are re-declared in `watch-list`, `predictions`, `scenarios`, `research`, `editorial`, `toolkit` pages even though `components/intel/shared/primitives.tsx` exists and is used by toolkit sections + `InvestigationCard`. | page sources | Low |
| 9 | **Engine tests only.** The 459 passing tests cover `lib/intel/*` engines. No route/UI tests, no RBAC tests, and no test asserting the public/private payload boundary (the #2/#3 leak). | `tests/intel-*.test.ts` inventory | Medium |

**Priority ordering (impact-weighted):** #2/#3 (Critical) > #1 (High) > #6 (High) > #4/#5/#7/#9 (Medium) > #8 (Low).

---

## Part 11 — Roadmap Review

**Verified status.** Roadmap: Parts 1–13 defined; **Part 14 (Editorial Intelligence) marked ✅ Complete**; **Part 6 (Media) marked ⏳ Deferred**. Editorial IPI shipped with full test coverage (145 tests). The roadmap is honest about deferral.

**Gaps between roadmap + doctrine and delivered reality:**

1. **Mission Control as an executive surface is absent from the roadmap entirely.** It is doctrine-mandated and it is the landing page. This is the single largest roadmap blind spot.
2. **Verification (Part 9 finding) is not a roadmap line item** — yet it is the first write capability and the doctrine's most visible trust workflow.
3. **RBAC enforcement (Part 10 #2/#3) is not a roadmap line item** — yet it is a critical confidentiality defect in an "intelligence" system.

**Verdict (opinion).** The roadmap is accurate about what was *built* but silent about the three things the audit proves are next. Roadmap-completion is not product-completion; the doctrine is the yardstick, and the doctrine's two biggest promises (executive surface, verification workflow) are unmet.

---

## Part 12 — Maturity Ratings (13 dimensions)

Scale 1–10. Ratings are opinions grounded in verified evidence.

| # | Dimension | Rating | Basis |
|---|---|---|---|
| 1 | Data integrity & honesty | **9** | `GLOBAL_LIMITATIONS`, confidence tiers, explicit unknowns (verified) |
| 2 | Explainability | **9** | every metric self-documents drivers/assumptions (verified) |
| 3 | Architecture & layering | **8** | clean DAG, single loader, zero cycles, no duplication (verified) |
| 4 | Module completeness | **4** | 7/13 real; 6 placeholders incl. all write-side modules (verified) |
| 5 | Workflow integration | **2** | all six roles read-only; no closed loop (verified simulation) |
| 6 | RBAC & security | **3** | client-only guard; RSC payload leak; public register mints sessions (verified) |
| 7 | UI consistency | **7** | shared primitives exist; some page-level duplication (verified) |
| 8 | Performance | **7** | build 10.3s; per-request recompute over 403 seats, no memoization observed (verified) |
| 9 | Accessibility | **6** | semantics/aria-labels present in primitives; no a11y test coverage; dense tables (verified/inferred) |
| 10 | Testing | **6** | 459 engine assertions pass; zero route/RBAC/security tests (verified) |
| 11 | Documentation | **8** | doctrine + roadmap + traceability tags (verified) |
| 12 | Public/private separation | **9** | zero intel imports in public pages; robots/noindex; no leakage in public layer (verified) |
| 13 | Repository hygiene | **2** | entire workspace uncommitted; repo-wide gates red on non-intel debt (verified) |

**Weighted verdict:** Sensing layer (1, 2, 12) is near production; actuation layer (4, 5, 6) is pre-product; discipline layer (3, 8, 9, 11) is strong; hygiene (13) is the operational blocker.

---

## Part 13 — Go / No-Go

**Certification question:** "Can this system serve as a professional newsroom's daily operating system?"

**Verdict: CONDITIONAL NO-GO** — with a precise and actionable condition.

**No-Go on the claim as stated**, because an operating system must close loops, and this system closes none (Parts 2, 4, 5, 9). It is an intelligence readout of exceptional quality, not yet an operating system.

**But:** the audit shows the condition is *achievable with existing, tested assets*. The gap is not engineering capability — every engine the executive surface and verification workflow need is built and passing 459 tests. The gap is **three decisions**: (1) enforce module RBAC at the data/server boundary, (2) convert Mission Control into the executive surface, (3) build the first write capability (Verification Workspace).

**What would flip this to GO:**
- ✅ Close Part 10 #2/#3 (server-side RBAC enforcement; role provisioning path) — mandatory, regardless of phase.
- ✅ Commit the workspace (Part 10 #1).
- ✅ Ship Mission Control as the executive surface (Part 7).
- ✅ Ship one closed loop end-to-end (Verification Workspace with status lifecycle, or Tasks with assignment).
- 🔁 Then re-certify.

**Scores (opinion, grounded in the audit):**
- **Architecture:** 8/10
- **Product:** 5/10 (sensing 9, actuation 2 → blended, weighted toward the OS claim)
- **Engineering:** 7/10 (engine quality 9, hygiene 2 → blended)
- **Operational readiness for daily newsroom use:** **Not ready** until RBAC + one closed loop + commit.

---

## Part 14 — Recommended Next Phase (ONE objective)

**The objective, chosen from audit evidence, not roadmap habit:**

> **Deliver Mission Control as the executive surface.** Convert `/intel` from a static analytics dashboard into the desk's daily operating surface — "what deserves attention today?" — using only already-shipped, already-tested outputs, and enforce server-side module RBAC as a mandatory precondition within the same phase.

**Why this objective (evidence chain):**
1. **It is doctrine-defined** (`tbios-master-prompt-v1.md`, Mission Control = executive surface) — not a new idea the audit invented.
2. **It is the landing page.** Every role starts here; it is the highest-visibility screen in the product. The Platform Beta "Experience Rule" (a first-time user notices within five minutes) is satisfied by showing the desk its actual priorities on open.
3. **It is the lowest-risk phase in the audit.** All inputs are computed and tested: IPI pipeline, prediction instability, scenario exposure/flips, evidence debt, verification pressure, freshness. Zero new engines. Zero new data. Zero new persistence. This respects the frozen architecture (Level A/B, no ACP required).
4. **It closes the sensing loop** the workflow audit (Part 2) found broken: analysts/editors see *why* a seat ranks, which is exactly the context reporters currently lack.
5. **It does not preempt the persistence decision.** Unlike Verification (Part 9), Mission Control needs no write path, no new data layer, and no schema change — so it cannot collide with the platform's still-open persistence decision.

**Mandatory preconditions bundled in the same phase (do not ship without them):**
- **Server-side module RBAC** (Part 10 #2/#3): gate each real module page *at the server* (e.g., wire `features/auth/role-guard.ts` — currently dead code — into each real page's server component before it computes/serializes), and add a role-provisioning path (an editor/owner-managed role assignment route) so roles are no longer only achievable via demo or manual DB metadata.
- **Commit the workspace** to a branch with the governing doctrine referenced (Part 10 #1), resolving repo-wide tsc/lint blockers *without touching non-intel debt* (Part 10 #6/#7 documented, not fixed, in this phase).

**What this phase explicitly does NOT do (anti-scope):**
- No Verification Workspace (that is the *next* phase — the first write capability, reusing `buildVerificationWorkspace`, `verification_pressure`, and the evidence graph).
- No Media Intelligence (correctly deferred; requires Level C architecture change — Part 8).
- No Candidates (data-blocked; honestly deferred).
- No new registries, engines, services, or rendering systems (Platform Beta Infrastructure Ban).

**Success metric for the phase:** An editor and an analyst can both answer "what should the desk do today?" from a single screen that ranks all 403 seats by IPI with factor drill-down, and a reporter cannot receive a single byte of that ranking's underlying payload without the `analyst` role or higher.

---

## Appendix — Test & Gate Evidence

```
Intel suites (this audit):           459/459 passed, 0 failed
  tests/intel-scoring.test.ts        51
  tests/intel-predictions.test.ts    30
  tests/intel-scenarios.test.ts      25
  tests/intel-evidence.test.ts       34
  tests/intel-toolkit.test.ts        174
  tests/intel-editorial.test.ts      145
Build:                               ✅ Compiled successfully in 10.3s (253 pages)
TypeScript:                          9 errors — all packages/mgcf-runtime + services/mgcf-runtime (non-intel, pre-existing)
Lint baseline (repo):                1,398 errors / 30 warnings — non-intel, pre-existing
```

---

*This certification was produced as a read-only audit. No production code was modified, no features were added, and no architecture was changed. All findings are traceable to source, tests, or command output captured during the audit.*
