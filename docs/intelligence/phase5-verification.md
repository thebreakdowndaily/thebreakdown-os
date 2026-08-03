# Phase V — Verification Operating System Implementation & Certification

**Certification Date:** 03 Aug 2026
**Status:** ✅ **GO**
**Scope:** Verification Service + `/intel/verification` workspace + Mission Control + Toolkit integration

---

## 1. Mission

Implement the **Verification Operating System**: a reusable Verification Service (`lib/intel/verification`) that aggregates the certified intel engines into **Verification Cases**, and the `/intel/verification` workspace that renders them.

The requirement is absolute:

> A Verification Case owns **workflow metadata only** — status, reviewer, review notes, editorial decisions, and an append-only audit trail. It never duplicates source content. Every claim, conflict, evidence review, field plan, and readiness score traces to a certified engine output.

The Verification Service is **reusable** by the Verification Workspace (this sprint), Story Builder (via the readiness handoff), Mission Control (via the Executive Intelligence Service), and future surfaces (APIs, dashboards). It never re-implements prediction, research, evidence, scenario, editorial, trust, or toolkit intelligence.

---

## 2. Architecture

### 2.1 Verification Service modules (`lib/intel/verification/`)

| Module | Produces |
|---|---|
| `types.ts` | Canonical types: 11-state status model, `VerificationCase`, `AuditEntry`, `VerificationClaim`, `ConflictRecord`, `EvidenceReview`, `FieldVerificationPlan`, `EditorialReadiness`, `VerificationOverview`, `VerificationExecutiveSummary` |
| `status.ts` | Explicit transition map (`TRANSITION_MAP`), `canTransition`/`nextTransitions`/`isTerminal`/`isOpenStatus`, status labels + counting |
| `claims.ts` | Claim Register — projection over toolkit `VerificationItem`s + Editorial Investigation factors |
| `conflicts.ts` | Conflict Detector — toolkit conflicting-evidence items + deterministic factor-driven rules |
| `evidence-review.ts` | Evidence Review — full evidence graph when available, factor-derived fallback |
| `field.ts` | Field Verification Plan — reuses toolkit workspace documents/ground-reporting/datasets + field-pack places/people |
| `readiness.ts` | Editorial Readiness — deterministic score, blockers, publish gate, Story Builder handoff |
| `derive.ts` | Case assembly — merges investigation + toolkit + workflow overlay into one `VerificationCase` |
| `store.ts` | In-memory workflow overlay — status transitions (transition-map-validated), reviewer assignment, notes, append-only audit trail, idempotent seed |
| `overview.ts` | `computeVerificationOverview()`, `computeVerificationCaseDetail()`, `getVerificationCaseIds()`, `buildVerificationExecutiveSummary()` |
| `index.ts` | Barrel — the ONLY entry point surfaces import from |

### 2.2 The 11-state workflow

`Unreviewed → In Review → (Evidence Complete | Evidence Incomplete | Needs Field Verification | Needs Official Confirmation | Conflicting Evidence) → Verified | Rejected`, plus `Deferred` and `Archived`. Every transition is explicit and validated by `TRANSITION_MAP`. Review outcomes (`Verified`, `Rejected`) may only reopen to `In Review` or archive — never silently shift sideways. `Archived` is terminal.

### 2.3 Persistence posture (honest, matching the platform)

The repository has no runtime-writable persistence: Supabase schema changes are Level C (forbidden), and the Vercel filesystem is read-only at runtime. The workflow overlay therefore follows the **EOS store precedent** (`lib/editorial/eos/eos-store.ts`): module-level in-memory state, seeded idempotently, valid for the lifetime of the server process. This is declared to readers in the overview (`storeNote`), in every case, and in the documented limitations. The audit trail is append-only within that lifetime.

### 2.4 RBAC

`guardIntelModule('verification')` (min role `fact_checker`) runs before **any** computation on both pages. Server actions in `app/intel/verification/actions.ts` re-authorize from the session server-side before any mutation — there is no client-side security boundary. The client `IntelModuleGuard` is a secondary rendering layer only.

### 2.5 Mission Control integration (conforming to the executive rule)

Mission Control consumes only the Executive Intelligence Service. Phase V adds an additive `verificationOS: VerificationExecutiveSummary` field to `ExecutiveBriefing`, computed by the executive service from the Verification Service's pure `buildVerificationExecutiveSummary()`. The existing `VerificationPanel` renders the queue and the new case posture strip. No logic moves into the page.

### 2.6 Toolkit integration

Every case links to its constituency toolkit (`/intel/toolkit?constituency=<id>`). The field verification plan reuses the certified toolkit `VerificationWorkspace` and `FieldPack` — the Verification Service never re-derives field intelligence.

### 2.7 UI

- `app/intel/verification/page.tsx` — dashboard (workflow distribution, posture, evidence debt) + case list, Server Component.
- `app/intel/verification/cases/[id]/page.tsx` — case detail: claim register, conflict detector, evidence review, field verification, editorial readiness, audit trail, and the workflow panel.
- `components/intel/verification/*` — presentational only, composing `components/intel/shared/primitives.tsx`. The `TransitionPanel` is a Server Component whose forms call server actions (no client JS needed).

---

## 3. Honesty rules applied

- **Cases own metadata only** — claims/conflicts/field plans are projections over engine outputs, never copied content.
- **No fabricated workflow** — the store seeds deterministically; actors are real authenticated session users at mutation time; `persistence: 'none'` is declared.
- **Explicit transitions only** — no "any state to any state"; invalid transitions fail without side effects.
- **Append-only audit** — entries are immutable, ordered, and uniquely id'd; the trail grows monotonically within a process.
- **Readiness is gated** — `canPublish` requires status `verified`, zero open conflicts, and ≥ 80% verified claims.
- **Factor fallback is labeled** — the evidence review marks `derivedFrom` (evidence engine vs editorial factor) so readers know the source depth.

---

## 4. Test coverage

| Suite | Assertions | Status |
|---|---|---|
| `tests/intel-verification.test.ts` (`test:intel-verification`) | 175 | ✅ passing |
| `tests/intel-auth.test.ts` (`test:intel-auth`) | 1094 | ✅ passing |

Tests cover: 11-state machine integrity (all non-terminal states have outgoing transitions, no self-transitions, review-outcome reopen/archive only, terminal `archived`), case derivation from certified engines, conflict detection + evidence review, deterministic readiness with verified floor, workflow store (valid/invalid transitions, no side effects on failure, reviewer assignment, notes, append-only audit with unique ids and no mutation leakage), overview aggregation (IPI-ranked, status counts sum, detail resolution, null for unknown), Mission Control integration (executive briefing carries `verificationOS`), and RBAC (guest denied; `fact_checker` and above allowed).

**Note:** adding the two `/intel/verification` routes required updating the structural route-count assertion in `tests/intel-auth.test.ts` from 13 to 14 (`app/intel` now holds 14 `page.tsx` files). Both new pages gate via `guardIntelModule('verification')` before any computation and render `IntelDenied`, so the structural gating invariant is preserved.

New script wired into `test:all`. The only failing suite in `test:all` is the **pre-existing** `packages/plugin-sdk/tests/compatibility.test.ts` (`isCompatible` assertion, untouched by Phase V — last modified in commit `52516ce`).

---

## 5. Quality gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean for all new files (only 9 pre-existing `mgcf-runtime` module-resolution errors, unrelated) |
| `npm run lint` | ✅ no new findings in new files |
| `npm run build` | ✅ passes; `/intel/verification` and `/intel/verification/cases/[id]` both `ƒ (Dynamic)` |
| `npm run test:all` | ✅ all suites pass except pre-existing `test:plugin-sdk` `isCompatible` failure (unrelated to Phase V, untouched) |

---

## 6. Definition of Done

- ✓ Build passes
- ✓ Lint passes (no new findings)
- ✓ TypeScript passes
- ✓ Accessibility preserved (semantic sections, aria-labels, keyboard-friendly forms and details/summary)
- ✓ Performance unchanged or improved (server components, single aggregation, lazy detail only when opened)
- ✓ Documentation updated (this document)
- ✓ Public APIs unchanged (existing `ExecutiveBriefing` fields untouched; `verificationOS` is additive)
- ✓ Tests added and passing
- ✓ No scope expansion (no new registries, abstractions, or rendering engines)

---

## 7. Traceability

| Artifact | Governing document |
|---|---|
| Verification Service | `docs/intelligence/tbios-master-prompt-v1.md` (Verification Workspace) + `docs/intelligence/roadmap.md` (Part 14) |
| `/intel/verification` pages + components | Verification Workspace brief (dashboard, case list, case detail, workflow panel) |
| 11-state workflow + audit trail | Verification Workspace brief (explicit transitions, append-only audit) |
| RBAC | `features/auth/roles.ts` (`verification` min role `fact_checker`) |
| Mission Control integration | Executive Intelligence Service rule (Phase IV) — additive `verificationOS` field |
| Field Verification reuse | Journalist Toolkit (certified `VerificationWorkspace`/`FieldPack`) |
| Workflow store precedent | `AGENTS.md` + EOS store (`lib/editorial/eos/eos-store.ts`) |
