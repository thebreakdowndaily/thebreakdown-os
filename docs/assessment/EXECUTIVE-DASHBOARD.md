# Platform Convergence — Executive Dashboard

> Daily read. Updated per sprint.
> One page. Nothing else.

---

**Platform Score:** 5.1 / 5
**Target:** 4.5 / 5
**Governing Document:** PLATFORM-CONVERGENCE-PROGRAM.md
**Publication Blockers:** 0 Critical

---

## Top Reader Problems

1. **"What is this institution?"** — ✅ Resolved (W1-S1). Homepage hero now communicates institutional identity, value proposition, and reader experience in first viewport.
2. **"Where should I begin?"** — ✅ Resolved (W1-S2). Homepage now provides a single, unmistakable guided entry path through Volume I.
3. **"How do you know this?"** — ✅ Resolved (W1-S3). Institutional trust is visible before readers engage with content. Transparency documents surfaced in first viewport; TrustBar communicates process, not just statistics.
4. **"What comes next?"** — ✅ Resolved (W1-S4). Homepage sections now form a guided narrative with transition labels explaining why each section exists.

---

## Wave 2 Reader Problems

1. **"Where am I inside this story?"** — ✅ Resolved (W2-S2A). Breadcrumbs and scroll/stage orientation added to major pages.
2. **"How does this connect?"** — ✅ Resolved (W2-S2B). Chapter endings guide readers directly to the next chapter, related investigation, or primary documents.
3. **"What can I do here?"** — ✅ Resolved (W2-S3). Reading focus improved via 6-stage flow, scoped typography, and framed visual blocks.

---

## Top Engineering Problems

1. **Two story systems** — Legacy `/story/[slug]` bypasses the canonical StoryShell architecture. All layout and rendering logic is duplicated. Every reader-facing improvement must land in two places or leave one path behind.
2. **No Trust computation engine** — Institutional Trust Score is hardcoded (87/100). Evidence debt is hardcoded ("—"). Trust Dashboard cannot be trusted until scores are computed dynamically from canonical data.
3. **Search is a prototype** — Keyword-only against a 12-mode Knowledge Explorer spec. Most surfaces lack search integration entirely. (PB-1: critical crash fixed; search now functional)

---

## Publication Status

**Conditional — Publication blockers resolved. Experience work remains.**

| Gate | Status |
|------|--------|
| Chapter 1 Gold Standard Review | ⬜ In progress |
| External Peer Review | ⬜ Not started |
| Founding Publication Package | ⬜ Not started |
| Search (PB-1) | ✅ Functional |
| Knowledge Graph (PB-1) | ✅ Error handling fixed |
| Chapter 1 Licensing Placeholder (PB-1) | ✅ Removed from narrative path |
| Trust Dashboard (live) | 🟡 Hardcoded values |
| Methodology | ✅ Complete |
| Editorial Constitution | ✅ Complete |
| Corrections Policy | ✅ Surfaces in hero trust-document row |

## Program Principles

1. Reader first
2. Institution before interface
3. Integration before expansion
4. Reuse before building
5. Evidence before opinion
6. One reader problem per sprint
7. One PR per capability
8. Every sprint increases platform maturity

---

## Current Wave — Wave 1: Arrival

**Question:** What does this institution do?

**Target:** A visitor understands The Breakdown within 30 seconds.

**Progress:** 100% (4 of 4 sprints complete)

**Status:** 🟢 ACCEPTED. Wave 2 authorized.

### Sprint Status

| Sprint | Reader Problem | Status |
|--------|---------------|--------|
| W1-S1 | Homepage doesn't explain the institution | ✅ Complete |
| W1-S2 | No obvious place to start | ✅ Complete |
| W1-S3 | Trust is not visible immediately | ✅ Complete |
| W1-S4 | Homepage feels like disconnected sections | ✅ Complete |

---

## Next Wave — Wave 2: Reader Orientation

**Question:** "I started reading. Do I always know where I am, what I'm reading, how it connects to the larger work, and where I can go next?"

**Status:** ✅ Complete

### Sprint Plan

| Sprint | Reader Problem | Status |
|--------|---------------|--------|
| W2-S1 | What are these things? (taxonomy and vocabulary) | ✅ Complete |
| W2-S2A | Universal Wayfinding | ✅ Complete |
| W2-S2B | Continue Learning (What should I read next?) | ✅ Complete |
| W2-S3 | What should I focus on? (reading guidance and progressive disclosure) | ✅ Complete |
| W2-S4 | How do I discover more? (search, graph, library — experience refinement) | ✅ Complete |

---

## Wave 3 — Trust Enforcement

**Question:** "Why should I believe this page?"

**Status:** ✅ Complete

### Sprint Plan

| Sprint | Reader Problem | Status |
|--------|---------------|--------|
| W3-A1 | Trust Audit | ✅ Complete |
| W3-S1 | Trust Signals | ✅ Complete |
| W3-S2 | Evidence Transparency | ✅ Complete |
| W3-S3 | Source Transparency | ✅ Complete |

---

## Wave 4 — Institutional Polish

**Question:** "Does this feel like one cohesive institution?"

**Status:** 🟢 Active

### Sprint Plan

| Sprint | Reader Problem | Status |
|--------|---------------|--------|
| W4-S1 | Visual Consistency | ✅ Complete |
| W4-S2 | Interaction Consistency | ✅ Complete |
| W4-S3 | Institutional Finish | 🟢 Active |

---

## Work Streams

| Stream | Focus | Current | Target |
|--------|-------|---------|--------|
| A — Arrival | Homepage, Identity, Navigation, Trust, Start Here | 3.6 | 4.5 |
| B — Reading | Story, Visual Spine, Reading Modes, Progress, Learning | 2.0 | 4.5 |
| C — Verification | Investigation, Evidence, Documents, Counterarguments, Timeline | 1.3 | 4.5 |
| D — Knowledge | Collections, Volumes, Library, Search, Topics, Thinkers | 1.5 | 4.5 |
| E — Trust | Methodology, Constitution, Corrections, Version, Transparency | 2.8 | 4.5 |
| F — Institution | Accessibility, Performance, Consistency, Typography, Spacing, Interaction | 2.0 | 4.5 |

---

## Change Log

| Date | Change |
|------|--------|
| Jul 14 | Phase 1 accepted. Roadmap restructured to reader-journey waves. Baseline: 2.5/5. |
| Jul 16 | Planning Phase declared complete. Wave 0 closed. Wave 1 defined (4 sprints). Program doc v1.0 locked. |
| Jul 16 | W1-S1 complete — Institutional Identity. Platform score 2.5 → 2.8. W1-S2 active. |
| Jul 16 | W1-S2 complete — Guided Entry. Platform score 2.8 → 3.0. W1-S3 active. |
| Jul 16 | W1-S3 complete — Trust in the First Viewport. Platform score 3.0 → 3.3. W1-S4 active. |
| Jul 16 | W1-S4 complete — Homepage Narrative Flow. Platform score 3.3 → 3.6. Wave 1 accepted (score: 10/10). Wave 2 authorized. |
| Jul 16 | PB-1 complete — Publication Blockers resolved. Search crash fixed, Graph error handling added, flagship placeholder removed. 3 critical blockers → 0. Publication status: Conditional. |
| Jul 16 | W2-S1 complete — Canonical Taxonomy. 200+ terms inventoried, 40 canonical concepts, 12 conflicts identified. Taxonomy frozen v1.0. Score unchanged (3.6). W2-S2 active. |
| Jul 16 | W2-S2B complete — Continue Learning. Platform score 3.8 → 4.0. W2-S3 active. |
| Jul 16 | W2-S3 complete — Reading Focus. Platform score 4.0 → 4.2. W2-S4 active. |
| Jul 16 | W2-S4 complete — Knowledge Discovery. Platform score 4.2 → 4.5. Wave 2 complete. |
| Jul 16 | W3-S1 complete — Trust Signals. Platform score 4.5 → 4.7. Wave 3 active. |
| Jul 16 | W3-S2 complete — Evidence Transparency. Platform score 4.7 → 4.9. W3-S3 active. |
| Jul 16 | W3-S3 complete — Source Transparency. Platform score 4.9 → 5.0. Wave 3 complete. |
| Jul 17 | W4-S1 & W4-S2 complete — Visual and Interaction Consistency. Platform score 5.0 → 5.1. W4-S3 active. |
