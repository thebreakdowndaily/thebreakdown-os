# THE BREAKDOWN
# Platform Integration Master Plan
Version: 2.0
Status: SUPERSEDED — replaced by docs/assessment/PLATFORM-CONVERGENCE-PROGRAM.md

---

# Purpose

This document governs the convergence of the entire Breakdown Platform.

The objective is NOT to build new systems.

The objective is to make the live website faithfully implement the institution that has already been designed.

During this project:

❌ No new architecture
❌ No new systems
❌ No speculative features
✅ Assessment
✅ Integration
✅ Publication

Every engineering task must trace back to this document.

---

# Mission

Transform The Breakdown from

"Collection of excellent subsystems"

into

"One coherent digital knowledge institution."

---

# Guiding Principles

1. Documentation before implementation
2. Assessment before coding
3. One capability at a time
4. Reader journey over page boundaries
5. Integration over expansion
6. Reuse before building
7. Publish over platform work
8. Freeze completed systems

## Reader Journey Principle

The platform is not organized around pages.

It is organized around the reader journey:

```
Arrival → Orientation → Understanding → Verification → Exploration → Trust → Return
```

Every wave targets a stage in this journey. Page scores are an engineering metric. Journey scores are the institutional metric.

## One Story System

Version 1.x has one canonical reading experience.

The `StoryShell` component (`components/rxs/StoryShell`) and the `/chapter/[id]` route define the single canonical story architecture. The legacy `/story/[slug]` path is a technical debt that must not receive new reader-facing features.

All future improvements to the reading experience — TOC, progress, reading modes, evidence proximity, version badges — land in the StoryShell path only.

The legacy path may eventually become a thin wrapper or redirect. Until then, it is frozen for new feature work.

---

# Success Definition

The project is complete when a first-time visitor immediately understands, without reading documentation:

- What this institution is
- Why it is trustworthy
- Where to begin
- How to investigate
- How to continue learning

**Target Maturity:** 4.5 / 5

---

# Current Platform Inventory

| System | Status |
|--------|--------|
| Editorial Constitution | Frozen |
| Editorial OS | Frozen |
| RXS | Frozen |
| VXS | Frozen |
| KIS | Frozen |
| Story Runtime | Active |
| Trust System | Active |
| Knowledge Library | Active |
| Homepage | Active |
| Story Experience | Active |
| Investigation | Active |
| Learning | Active |
| Visual System | Active |
| Knowledge Graph | Active |
| Product Quality | Ratified |
| Living Knowledge | Active |

---

# Assessment Documents

The following documents encode everything learned during Phase 1. They are reference material, not execution plans.

| Document | Location | Purpose |
|----------|----------|---------|
| Institutional Assessment | `docs/assessment/institutional-assessment.md` | Narrative evaluation of every public surface against governing documents |
| Implementation Gap Matrix | `docs/assessment/implementation-gap-matrix.md` | Capability-by-capability scored matrix (~120 capabilities) |
| Platform Baseline | `docs/assessment/platform-baseline.md` | Full inventory of routes, components, data sources, dependencies |
| Scoring Rubric | `docs/assessment/scoring-rubric.md` | 10-dimension methodology used for all scoring |
| Executive Dashboard | `docs/assessment/EXECUTIVE-DASHBOARD.md` | One-page daily snapshot — maturity, problems, next wave |

---

# Wave Execution Plan

The roadmap is organized around the reader journey. Each wave answers one reader question and targets a specific maturity score.

---

## Wave 0 — Platform Stabilization

**Status:** ACTIVE

**Question:** (None — no new work)

**Objective:** Accept assessment. Freeze roadmap. Prepare.

**Deliverables:**
- Phase 1 assessment accepted
- Roadmap restructured to reader-journey waves
- Executive Dashboard created
- Platform Principle "One Story System" ratified

**Exit Criteria:** Roadmap frozen. Wave 1 ready to begin.

---

## Wave 1 — Reader Arrival

**Status:** LOCKED

**Question:** What does this institution do?

**Target:** A visitor understands the product within 30 seconds.

**Surfaces:**
- Homepage hero — institutional identity, not news branding
- Navigation — primary paths visible (Start Here, Knowledge Library, Investigations)
- Trust signals in viewport — version badge, Trust Score, methodology link
- "Start Here" section — guided entry point for new readers

**Gaps closed:**
- Continue Learning section (homepage §3.2)
- Governance footer links (/methodology, /trust, /constitution)
- Homepage restructured: Hero → Continue Learning → Featured Investigations → Knowledge Library → Latest

**Target maturity:** 3.5 / 5

---

## Wave 2 — Reader Orientation

**Status:** LOCKED

**Question:** Where am I?

**Target:** A reader can always answer "how far through am I?" and "what section comes next?"

**Surfaces:**
- Table of Contents (sticky, section-level)
- Reading progress indicator
- Breadcrumb on all narrative pages
- Reading mode toggle (Focus / Reference / Learning)
- Contextual position — "You are in Chapter 3 of 12"

**Target maturity:** 3.5 / 5

---

## Wave 3 — Reader Understanding

**Status:** LOCKED

**Question:** Can I actually understand this topic?

**Surfaces:**
- StoryShell — single canonical reading experience
- Visual Spine — every section has an explanatory visual with provenance metadata
- Learning blocks — objectives, glossary, key takeaways, review questions
- Stage flow — narrative progresses through defined stages
- Glossary — inline hover definitions for key terms

**Target maturity:** 4.0 / 5

---

## Wave 4 — Reader Verification

**Status:** LOCKED

**Question:** How do you know?

**Surfaces:**
- KIS (Key Information Sources) — visible per claim
- Evidence panel — reachable from any claim in one interaction
- Documents — primary source facsimiles with analysis
- Sources — full citation with authority/trust/freshness indicators
- Counterarguments — scholarly disagreements surfaced alongside claims

**Target maturity:** 4.0 / 5

---

## Wave 5 — Reader Exploration

**Status:** LOCKED

**Question:** What should I learn next?

**Surfaces:**
- Knowledge Library — search, filter, sort within collections
- Search — knowledge-object type facets (claim, evidence, source, thinker)
- Collections — cross-collection progress, "What to Read Next"
- Thinkers — thinker profiles with cross-references
- Timeline — interactive chronological exploration

**Target maturity:** 3.5 / 5

---

## Wave 6 — Reader Trust

**Status:** LOCKED

**Question:** Can I rely on this institution?

**Surfaces:**
- Methodology page — expanded with visual verification, source intelligence
- Editorial Constitution page — sticky TOC, version badge, cross-references
- Trust Dashboard — live Institutional Trust Score computed from canonical data
- Corrections — surfaced on affected content
- Version — every knowledge object shows version, last-verified, freshness

**Target maturity:** 4.5 / 5

---

## Wave 7 — Institutional Polish

**Status:** LOCKED

**Question:** (None — refinement only)

**Surfaces:**
- Typography — consistent heading hierarchy, line length, spacing
- Animation — purposeful, not decorative
- Accessibility — WCAG AA minimum, AAA wherever practical
- Performance — LCP < 2.5s, CLS < 0.1, INP < 200ms

**Target maturity:** 4.5 / 5

---

# Execution Rules

- One PR, one capability
- Maximum 500 lines per PR
- Every PR: Assessment → Implementation → Verification → Build → Review → Merge
- Every PR closes one approved gap from the wave's gap list
- No wave begins until the previous wave is accepted
- No implementation outside this document
- No feature additions without formal amendment

---

# Definition of Done

- Feature implemented
- Reader-visible
- Accessibility passed
- Mobile passed
- Build passed
- Typecheck passed
- Quality gates passed
- Documentation updated
- No architectural drift

---

# Change Control

- No wave may begin until the previous wave is accepted.
- No implementation outside this document.
- No feature additions without formal amendment.

---

# Completion

When this document reaches 100%, the platform enters **Publishing Season One** and engineering shifts to publication-driven development.
