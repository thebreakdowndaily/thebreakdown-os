# Intelligence Workspace — Capability Roadmap (Master Prompt, v1)

**Status:** Living — version-controlled design document
**Source:** Consolidated from the original capability master prompt and implementation record. Replaces conversation-history reliance. Governing doctrine now persisted at `docs/intelligence/tbios-master-prompt-v1.md` — read it first.
**Last updated:** 03 Aug 2026

This document is the canonical roadmap for the `/intel` intelligence workspace. It is version-controlled so future contributors, code reviews, and architecture discussions reference a stable spec instead of chat history.

---

## Mission

The Breakdown's `UP403` evidence layer (public, SEO-indexed) feeds an internal, auth-gated intelligence workspace (`/intel`) that turns evidence into reporting. The public atlas never shows predictions, confidence intervals, or intelligence scores. The internal layer is where analysis lives.

Dependency chain (each layer consumes the previous):

```
Evidence → Derived Metrics → Intelligence Scores → Predictions → Scenario Simulator → Journalist Toolkit → Published Journalism
```

---

## Delivery Rule

- **One new reader-facing capability per sprint.** A sprint delivers exactly one capability a first-time analyst can notice within five minutes. If a sprint accumulates unrelated improvements, split it.
- **No hallucinated data.** Every score, prediction, scenario, and evidence item traces to the frozen canonical dataset (`data/master-dataset-v1/v1.1.0/up403-master-dataset-v1.json`, 403 records × 150 fields, frozen v1.1.0).
- **Explainability is mandatory.** Every derived number carries drivers, assumptions, evidence, and data gaps. Evidence overrides AI output.
- **Public vs internal separation.** Public pages never render internal scores/predictions. RBAC governs `/intel` only.

---

## Shipped Capabilities

### Part 4 — Prediction Engine ✅

Answer: **What is the likely winner in each constituency, and how sure are we?**

- Recency-weighted base strength from vote-share history (2012→1, 2017→2, 2022→3) + derived competitiveness signals.
- Adjustment drivers: incumbency-risk penalty, momentum boost, volatility/competitiveness flattening.
- Win probability 0–100 with confidence interval, per-party probabilities, confidence tier (VERY_HIGH…VERY_LOW), sensitivity (±10 pts per score), why-leading / why-not / what-could-change-it narratives, assumptions, data gaps.
- Aggregates: seat share, avg winner probability, high-confidence count, sensitive seats.
- Consumers: `/intel/predictions` (analyst+).

### Part 5 — Scenario Simulator ✅

Answer: **What-if electoral swings — how does the assembly change?**

- Pure swing engine: scope (all / region / district), positive & negative deltas, renormalisation, winner projection, flip detection, seat-share build, coalition arithmetic (`MAJORITY = 202`).
- Concrete scenarios: baseline, BJP wave (+4), SP surge (+4), Western UP RLD surge (+8 regional), BSP comeback (+6), anti-incumbent stress (−5 vs sitting MLA).
- Coalitions: NDA, SP+INC+RLD, BSP, Others.
- Consumers: `/intel/scenarios` (analyst+).

### Part 7 — Evidence & Research KB ✅

Answer: **What evidence exists for a constituency — and where is the evidence debt?**

- Built as an **Evidence Graph**, not a document library. Every dataset field is a registered evidence node with provenance (authority, source dataset, quality) and confidence.
- Categories: Official Election Data, Historical Results, Political DNA, Government Reports, Development Indicators, Research Sources, Known Data Gaps.
- Honest debt accounting: development indicators (demographics/economy/infrastructure) are NOT available at constituency level in the frozen dataset — they register as gaps, never as zeros.
- Per-constituency coverage %, confidence tier, evidence timeline (elections, LS2024, by-elections, vacancies, verification).
- **Prediction evidence linkage:** every prediction driver resolves through its intelligence score to the underlying evidence nodes — "which evidence supports this?" is answerable.
- Consumers: `/intel/research` (researcher+).

### Part 14 — Editorial Intelligence ✅

Answer: **Which constituencies demand investigation, and why?**

Surfaces investigation-ready seats from scoring + evidence debt, feeding the editorial desk.

- Built per `docs/intelligence/tbios-master-prompt-v1.md` (Editorial Intelligence) — a **weighted factor surface over the shipped engines**, never a re-implementation. The Investigation Priority Index (IPI) consumes `investigation_priority` scoring, prediction instability/sensitivity, scenario flip exposure (via `projectSeat`), evidence coverage/debt, and per-seat verification pressure.
- **Traceable pipeline.** Every ranked seat carries 5 factors (structural priority, prediction instability, scenario exposure, evidence debt, verification pressure), each with value, weight, contribution, confidence, named evidence, and a limitation — plus top reasons, desk recommendations, and honest limitations. The structural factor IS the shipped `investigation_priority` score (reuse, not duplicate).
- **Honest limitations.** Population, development indicators, and public-relevance signals are unavailable at constituency level — registered as gaps, never values. "Predictions changed materially" is proxied by model sensitivity (no prediction history is stored) and that proxy is disclosed. Candidate finance/affidavit data is not present in the frozen dataset.
- Shared UI primitives moved to `components/intel/shared/primitives.tsx` (consumed by toolkit + editorial) — no duplicated UI patterns.
- Tests: `tests/intel-editorial.test.ts` (`npm run test:intel-editorial`) — 145 assertions including scoring reuse, weighted-sum, traceability, and no-leak honesty checks.
- Consumers: `/intel/editorial` (editor+).

---

## Planned Capabilities

### Part 6 — Media Intelligence ⏳

Answer: **What is being said about these subjects/constituencies?**

Media monitoring across UP403. **Open question:** no media corpus exists in the frozen dataset — needs a source decision before implementation. Do not scaffold on empty data.

### Part 8 — Journalist Toolkit ✅

Answer: **What does a reporter need to go into the field?**

Interview plans, source contacts, reporting checklists generated from prediction/scenario/scoring/evidence outputs. No new data required — pure synthesis of shipped layers.

- Built as a **presentation layer over the shipped engines** — no duplicated scoring/prediction/evidence logic. Every section is a pure consumer of `scoring`, `predictions`, `scenarios`, and `evidence` (`lib/intel/toolkit/*`).
- Per-constituency workspace at `/intel/toolkit?constituency=UP-AC-014` (deep link or searchable picker over all 403 seats).
- Sections: Reporter Brief (synthesis + risks + data gaps), Interview Briefs (12 personas, ~36–38 questions, each citing the signal and engine basis), Reporting Checklist (honest state — warnings for registered gaps), Story Angles (confidence from underlying scores), Verification Workspace (claims / missing / weak / conflicting separated), Field Reporting Pack (places, people, documents, 5-day plan — never invents geography), Evidence Explorer (prediction → drivers → evidence → history → gaps → confidence), Research Summary, Scenario Analysis (per-seat flips).
- **Export:** Reporter Brief as Markdown (download/copy), full JSON, print-to-PDF (relies on `styles/print.css`; nav/controls hidden via `.print-hidden`).
- **No hallucinated facts:** development indicators, governance issues, and health/education counts are not available at constituency level in the frozen dataset — they register as gaps and the workspace labels them as missing, never fills them. `area_sq_km`/`terrain_type`/`major_rivers` empty → travel notes say "not available in the frozen dataset".
- Tests: `tests/intel-toolkit.test.ts` (`npm run test:intel-toolkit`) — 174 assertions including honesty checks (no leaked null/undefined, gaps surfaced, LS2024 change flagged as conflicting evidence).
- Consumers: `/intel/toolkit` (reporter+).

### Other modules (placeholders)

Candidates, Story Builder, Verification queue, RTI tracker, Tasks. Each depends on the evidence graph (Part 7) — the consistent evidence model every future module shares.

---

## Architecture Notes

- All intelligence code lives under `lib/intel/` as standalone engines (`scoring/`, `predictions/`, `scenarios/`, `evidence/`) plus synthesis layers (`toolkit/`, `editorial/`), with overview bindings to the frozen loader (`lib/up403/loader.ts`). Synthesis layers consume engines — they never re-implement them.
- Tests: `tests/intel-*.test.ts` via `npx tsx`, registered as `test:intel-*` npm scripts, wired into `test:all`.
- RBAC: `features/auth/roles.ts` maps modules to minimum roles; `IntelModuleGuard` enforces on every page; middleware gates the route group.
- Never create parallel systems. Extend `lib/intel/*` and the canonical loader. Evidence graph reuses `lib/up403/provenance.ts` for field authority.
