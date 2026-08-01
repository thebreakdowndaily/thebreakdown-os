# RELEASE-4.0 — Editorial Operating System (EOS)

**Governing documents:** Editorial Constitution v1.1 (Locked) · AGENTS.md v1.0 · Baseline v1.0.0-chapter1 · RELEASE-3 certification · RELEASE-4 brief
**Status:** In Progress
**Baseline:** The Breakdown Intelligence Platform v1.0 (Production Candidate) · UP403 Dataset v1.1.0 · Research API v1 · Editorial Workspace (2B) · Public Reader Platform (3)

## Objective

Build the **Editorial Operating System (EOS)** — the primary research, planning, publishing, and verification environment for journalists, editors, researchers, and analysts working on the Intelligence Platform. Reduce research time, improve factual accuracy, preserve provenance, support evidence-first journalism. EOS adds **editorial workflows, not new research datasets**.

## Hard Constraints (from brief + governance)

1. Do NOT modify canonical datasets. Do NOT rewrite Research API logic. Do NOT duplicate intelligence calculations. Do NOT bypass provenance.
2. Do NOT allow publication without verification status.
3. No AI-written copy. Story Builder assembles **verified research only**, via deterministic rules over the canonical UP403 dataset.
4. No parallel systems: EOS reuses the existing editorial backbone (`lib/editorial/workflow-state-machine.ts` stages, `types/canonical.ts` `Claim`/`Evidence`/`Source`/`EditorialTask`, `lib/up403/*` canonical services, `PluginAnalyticsService`).
5. Every story packet's evidence points to canonical provenance (`lib/up403/provenance.ts` / `getApiProvenance`) — evidence spine: Claim → Evidence → Source → Verification → Publication.
6. No journalist ranking. Editorial analytics improve workflow, not surveillance.

## Data Access Doctrine

- **Server pages** (app/editor/*) consume EOS services + canonical UP403 services (`lib/up403/loader.ts`, `stories.ts`, `provenance.ts`, `format.ts`) directly — same canonical code path as the Research API, no HTTP round-trip.
- **Interactive components** (fact-check entry, collaboration) operate on the EOS in-memory store (same pattern as existing EditorialDashboardView: server page → service projection → view component).
- Story Discovery extends `lib/up403/stories.ts` deterministic rules — it never duplicates existing calculations.

## Editorial Stage Mapping (Module 7 ↔ existing backbone)

EOS workflow: `assigned → research → writing → fact_check → editorial_review → published → archived` (brief Module 7).

Mapped onto the canonical `EditorialStage` machine (`lib/editorial/workflow-state-machine.ts`):

| EOS stage | Canonical stage | Gate |
|-----------|-----------------|------|
| assigned | draft | Assignment record complete |
| research | research_complete | Dossier evidence registered |
| writing | evidence_verified | Draft links claims to evidence |
| fact_check | evidence_verified → gold_standard_review | Fact Check Report complete; no blocking issues |
| editorial_review | gold_standard_review | Editor approval; verification status present |
| published | published | All gates pass |
| archived | archived | — |

Publication is blocked unless every claim carries a verification status (`Verified` / `Partially Verified` / `Needs Verification` / `Unsupported`) and unresolved claims are editor-approved. `transitionEditorialState` is reused for the canonical side; EOS adds its own guarded machine with the same transition-discipline pattern.

## Module → Asset Map

| # | Module | Primary assets | Status |
|---|--------|----------------|--------|
| 1 | Editorial Dashboard | `app/editor/page.tsx` + `components/editorial/eos/EosDashboardView.tsx` | Planned |
| 2 | Research Workspace (dossiers) | `types/editorial-newsroom.ts` + `lib/editorial/dossiers.ts` + `app/editor/dossier/[id]/page.tsx` | Planned |
| 3 | Story Builder (packets) | `lib/editorial/story-packet.ts` + `app/editor/stories/[id]/page.tsx` | Planned |
| 4 | Evidence Review (claim status) | `lib/editorial/evidence-review.ts` (Verified / Partially Verified / Needs Verification / Unsupported) | Planned |
| 5 | Story Discovery Engine | `lib/editorial/discovery.ts` (extends `lib/up403/stories.ts` deterministic rules) | Planned |
| 6 | Editorial Collections | `lib/editorial/collections.ts` (dynamic, query-based) + `app/editor/collections/page.tsx` | Planned |
| 7 | Assignment Board | `lib/editorial/assignment-board.ts` + `app/editor/assignments/page.tsx` | Planned |
| 8 | Fact Check Console | `lib/editorial/fact-check.ts` (deterministic vs canonical data) + `app/editor/fact-check/[id]/page.tsx` | Planned |
| 9 | Citation Generator | `lib/editorial/citation.ts` (inline, appendix, source list, dossier) | Planned |
| 10 | Publishing Integration | `lib/editorial/newsroom-workflow.ts` (stages incl. scheduled; blocks on unverified) | Planned |
| 11 | Editorial Analytics | `lib/editorial/newsroom-analytics.ts` (research time, verification rate, turnaround, source diversity, corrections; no ranking) | Planned |
| 12 | Knowledge Capture | `lib/editorial/knowledge-capture.ts` (published story → institutional knowledge) | Planned |
| 13 | Collaboration | `lib/editorial/collaboration.ts` (notes, comments, mentions, activity, change history) | Planned |
| 14 | Editorial Governance | `release-4/editorial-governance/` (7 policy docs → newsroom standards) | Planned |
| 15 | Release Acceptance | `tests/release-4-acceptance.test.ts` + `release-4/release-acceptance/` | Planned |

## Output Structure

```
release-4/
  editorial-dashboard/
  story-builder/
  fact-check-console/
  assignment-board/
  citation-engine/
  editorial-governance/
  release-acceptance/
  RELEASE-4-CERTIFICATION.md
```

## Definition of Done

- All 15 modules deliver at least one demonstrable editorial capability.
- E2E workflow operational: story creation → verification → editorial review → publication → correction (covered by `tests/release-4-acceptance.test.ts`).
- Gates: `npm run lint` (new files clean), `npx tsc --noEmit` (no new errors), `npx next build` passes.
- No canonical data changed. No API routes modified. No duplicated business logic.
- Certification verdict emitted.
