# Phase VI — Story Builder & Editorial Production System Implementation & Certification

**Certification Date:** 03 Aug 2026
**Status:** ✅ **GO**
**Scope:** Story Service + `/intel/story-builder` workspace (list, editorial workspace, publication-package export) + Mission Control integration

---

## 1. Mission

Implement the **Story Builder & Editorial Production System**: a reusable Story Service (`lib/intel/story`) that transforms verified intelligence into **editorial plans** — briefs, structured story outlines, impact estimates, source panels, and a canonical publication package — and the `/intel/story-builder` workspace that renders them.

The requirement is absolute:

> The Story Builder owns **editorial workflow and planning metadata only** — status, editor, notes, version, and an append-only audit trail. It never duplicates source content. Every brief section, outline item, impact dimension, and source-panel entry traces to a certified engine output. It never re-implements evidence, research, predictions, scenarios, verification, or scoring intelligence.

The Story Service is **reusable** by the Story Builder workspace (this sprint), Mission Control (via the Executive Intelligence Service), and future surfaces (CMS ingest, publication queues). Verification is a hard dependency: a story cannot reach editorial readiness until its linked Verification case is **Verified** — the store refuses to advance past it.

---

## 2. Architecture

### 2.1 Story Service modules (`lib/intel/story/`)

| Module | Produces |
|---|---|
| `types.ts` | Canonical types: 10-state editorial status model, `StoryDraft`, `StoryBrief`, `StoryOutlineBlock`, `StoryImpact`, `StorySourcePanelEntry`, `StoryReferenceSet`, `StoryEditorialReadiness`, `StoryOverview`, `StoryExecutiveSummary`, `StoryPackage` |
| `status.ts` | Explicit editorial transition map (`STORY_TRANSITION_MAP`), `canTransitionStory`/`nextStoryTransitions`/`isTerminalStory`/`isStoryOpen`/`isVerificationGated`, status labels + counting |
| `readiness.ts` | Editorial Readiness — priority-ordered rules gated on the Verification Service's case; `ready` only when verified and clear of blockers at `ready_for_publication` |
| `impact.ts` | Story Impact — eight weighted, explainable dimensions over certified signals; weights explicit, versioned, and validated to sum to 1 |
| `sources.ts` | Source Panel — six domains (evidence graph, research KB, verification workspace, prediction engine, scenario engine, toolkit) with honest confidence/coverage |
| `brief.ts` | Editorial Brief — 11 planning sections, every item traced to an engine source |
| `outline.ts` | Story Structure — 15 structured planning blocks (headline options through related stories); structured plans only, never drafted prose |
| `store.ts` | In-memory workflow overlay — status transitions (transition-map-validated **and** verification-gated), editor assignment, notes, append-only audit trail, idempotent seed |
| `derive.ts` | Draft assembly — merges investigation + toolkit + verification case + workflow overlay into one `StoryDraft`; factor-only projection when detail is unavailable (each section labels its proxy) |
| `overview.ts` | `computeStoryOverview()`, `computeStoryDetail()`, `getStoryIds()`, `buildStoryExecutiveSummary()` |
| `export.ts` | Publication package (`story-package-v1` JSON), JSON, Markdown, print brief, editorial summary — pure, side-effect-free |
| `index.ts` | Barrel — the ONLY entry point surfaces import from |

### 2.2 The 10-state editorial workflow

`Idea → Planned → Researching → Verification Required → Verification Complete → Drafting → Editorial Review → Ready for Publication → Published`, plus `Archived` (terminal). Every transition is explicit and validated by `STORY_TRANSITION_MAP`. `Published` can reopen to `Editorial Review`. No "any state to any state".

### 2.3 Verification gate (Verification before editorial readiness)

Reaching `verification_complete`, `editorial_review`, or `ready_for_publication` requires the linked Verification case to be **Verified**. The gate is enforced in `store.ts` `transitionStory()` — not merely displayed in the UI — so no code path can advance a story past verification without a verified case. `Published` is only reachable through `ready_for_publication`, making verification transitively mandatory for publication. The readiness rules surface the same discipline: an unverified story is always `needs_verification`, never `ready`.

### 2.4 Persistence posture (honest, matching the platform)

The repository has no runtime-writable persistence: Supabase schema changes are Level C (forbidden), and the Vercel filesystem is read-only at runtime. The workflow overlay follows the **EOS / Verification store precedent**: module-level in-memory state, seeded idempotently, valid for the lifetime of the server process. This is declared in the overview (`storeNote`), in the Mission Control projection (`persistence: 'none'`), and in the documented limitations. The audit trail is append-only within that lifetime.

### 2.5 RBAC

`guardIntelModule('story-builder')` (min role `editor`) runs before **any** computation on both pages. Server actions in `app/intel/story-builder/actions.ts` re-authorize from the session server-side before any mutation — there is no client-side security boundary. The client `IntelModuleGuard` is a secondary rendering layer only. The export route handler (`/intel/story-builder/[id]/export`) also authorizes server-side before computing the package.

### 2.6 Mission Control integration (conforming to the executive rule)

Mission Control consumes only the Executive Intelligence Service. Phase VI adds an additive `storyOS: StoryExecutiveSummary` field to `ExecutiveBriefing`, computed by the executive service from the Story Service's pure `buildStoryExecutiveSummary()` (top-10 factor-only projection + workflow overlay). A new `StoryPanel` renders the posture on `/intel`. No logic moves into the page.

### 2.7 UI

- `app/intel/story-builder/page.tsx` — dashboard (workflow distribution, posture, high-impact opportunities) + draft list, Server Component.
- `app/intel/story-builder/[id]/page.tsx` — editorial workspace: headline, readiness, workflow panel (transitions/editor/notes/audit), brief, structure, impact, source panel, and publication package.
- `app/intel/story-builder/[id]/export/route.ts` — authorized `story-package-v1` JSON download.
- `components/intel/story/*` — presentational only, composing `components/intel/shared/primitives.tsx`. The `StoryTransitionPanel` is a Server Component whose forms call server actions (no client JS needed). The verification-gated transition warning is surfaced in the panel.

---

## 3. Honesty rules applied

- **Drafts own metadata only** — brief/outline/impact/source panel are projections over engine outputs, never copied content.
- **No fabricated workflow** — the store seeds deterministically; actors are real authenticated session users at mutation time; `persistence: 'none'` is declared.
- **Explicit transitions only** — invalid transitions fail without side effects; the verification gate is enforced in the store.
- **Append-only audit** — entries are immutable, ordered, and uniquely id'd; the trail grows monotonically within a process.
- **Readiness is gated** — `ready` requires a verified Verification case and zero conflicts/blockers; unverified stories are always `needs_verification`.
- **Factor fallback is labeled** — factor-only projections (overview, Mission Control) state their proxy per section; toolkits and verification detail are fetched on the detail surface.
- **Impact is explainable** — every dimension carries inputs, weight, contribution, limitation, and source; weights are versioned (`1.0.0`) and validated to sum to 1.
- **Outlines are plans, not articles** — structured blocks reference intelligence; no drafted prose is generated.

---

## 4. Test coverage

| Suite | Assertions | Status |
|---|---|---|
| `tests/intel-story.test.ts` (`test:intel-story`) | 190 | ✅ passing |
| `tests/intel-executive.test.ts` (`test:intel-executive`) | 207 | ✅ passing (regression) |
| `tests/intel-verification.test.ts` (`test:intel-verification`) | 175 | ✅ passing (regression) |
| `tests/intel-auth.test.ts` (`test:intel-auth`) | 1097 | ✅ passing |

Tests cover: 10-state machine integrity (all non-terminal states have outgoing transitions, no self-transitions, canonical happy path, sideways shifts rejected, reopen semantics), draft derivation from certified engines (11 brief sections, 10+ outline blocks, 8 impact dimensions, 6 source domains, seeded determinism), deterministic classification/tiers/slugs, brief/outline/impact/source builders (source tracing, weights sum to 1, contribution math), readiness rules (unverified never ready; ready only at `ready_for_publication` with verified case; conflicts → blocked; field tasks → `needs_field_reporting`), workflow store (verification gate refusal without a verified case, happy-path walk to `published`, version/audit monotonicity, editor assignment, notes, defensive copies), overview/detail aggregation (counts sum, top seats critical/high, detail resolution, null for unknown), Executive integration (`storyOS` present and internally consistent, `persistence: 'none'`), publication-package exports (round-trip JSON, Markdown, print brief, editorial summary), and RBAC (guest/researcher/fact-checker/reporter denied; `editor` and above allowed).

**Note:** adding the `/intel/story-builder/[id]` route required updating the structural route-count assertion in `tests/intel-auth.test.ts` from 14 to 15 (`app/intel` now holds 15 `page.tsx` files). Both new pages gate via `guardIntelModule('story-builder')` before any computation and render `IntelDenied`, so the structural gating invariant is preserved.

New script wired into `test:all`. The only failing suite in `test:all` is the **pre-existing** `packages/plugin-sdk/tests/compatibility.test.ts` (`isCompatible` assertion, untouched by Phase VI — last modified in commit `52516ce`).

---

## 5. Quality gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean for all new files (only 9 pre-existing `mgcf-runtime` module-resolution errors, unrelated) |
| `npm run lint` | ✅ no new findings in new files (Story service is lint-clean; components follow the established intel-module pattern) |
| `npm run build` | ✅ passes; `/intel/story-builder` and `/intel/story-builder/[id]` both `ƒ (Dynamic)` |
| `npm run test:all` | ✅ all suites pass except pre-existing `test:plugin-sdk` `isCompatible` failure (unrelated to Phase VI, untouched) |

---

## 6. Definition of Done

- ✓ Build passes
- ✓ Lint passes (no new findings)
- ✓ TypeScript passes
- ✓ Accessibility preserved (semantic sections, aria-labels, keyboard-friendly forms and details/summary)
- ✓ Performance unchanged or improved (server components, single aggregation, lazy detail only when opened)
- ✓ Documentation updated (this document)
- ✓ Public APIs unchanged (existing `ExecutiveBriefing` fields untouched; `storyOS` is additive)
- ✓ Tests added and passing
- ✓ No scope expansion (no new registries, abstractions, or rendering engines)

---

## 7. Traceability

| Artifact | Governing document |
|---|---|
| Story Service | `docs/intelligence/tbios-master-prompt-v1.md` (Story Builder) + `docs/intelligence/roadmap.md` (Part 14) |
| `/intel/story-builder` pages + components | Story Builder brief (dashboard, editorial workspace, workflow panel) |
| 10-state workflow + audit trail | Story Builder brief (explicit transitions, append-only audit) |
| Verification gate | Story Builder brief (Verification before editorial readiness) + Verification Service handoff |
| RBAC | `features/auth/roles.ts` (`story-builder` min role `editor`) |
| Mission Control integration | Executive Intelligence Service rule (Phase IV) — additive `storyOS` field |
| Publication package | Story Builder brief (exportable `story-package-v1` payload) |
| Workflow store precedent | `AGENTS.md` + EOS / Verification store (`lib/editorial/eos/eos-store.ts`, `lib/intel/verification/store.ts`) |
