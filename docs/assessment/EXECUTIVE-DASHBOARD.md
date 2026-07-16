# Platform Convergence — Executive Dashboard

> Daily read. Updated per sprint.
> One page. Nothing else.

---

**Platform Score:** 2.8 / 5
**Target:** 4.5 / 5
**Governing Document:** PLATFORM-CONVERGENCE-PROGRAM.md

---

## Top Reader Problems

1. **"What is this institution?"** — ✅ Resolved (W1-S1). Homepage hero now communicates institutional identity, value proposition, and reader experience in first viewport.
2. **"Where should I begin?"** — Active (W1-S2). PrimaryPath exists but Start Here path is not unmistakable. No guided entry for new readers.
2. **"Where am I in the story?"** — No sticky TOC, no reading progress indicator, no breadcrumb on legacy story path. Reader cannot answer "how far through am I?" or "what section comes next?"
3. **"How do you know this?"** — Evidence is not reachable from claims in one interaction on the legacy path. No version badge, no last-verified timestamp, no State of the Evidence block. Trust signals are absent from the reading experience.

---

## Top Engineering Problems

1. **Two story systems** — Legacy `/story/[slug]` bypasses the canonical StoryShell architecture. All layout and rendering logic is duplicated. Every reader-facing improvement must land in two places or leave one path behind.
2. **No Trust computation engine** — Institutional Trust Score is hardcoded (87/100). Evidence debt is hardcoded ("—"). Trust Dashboard cannot be trusted until scores are computed dynamically from canonical data.
3. **Search is a prototype** — Keyword-only against a 12-mode Knowledge Explorer spec. Most surfaces lack search integration entirely.

---

## Publication Status

**Not Ready**

| Gate | Status |
|------|--------|
| Chapter 1 Gold Standard Review | ⬜ In progress |
| External Peer Review | ⬜ Not started |
| Founding Publication Package | ⬜ Not assembled |
| Trust Dashboard (live) | 🟡 Hardcoded values |
| Methodology | ✅ Complete |
| Editorial Constitution | ✅ Complete |
| Corrections Policy | 🟡 Exists but not surfaced |

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

**Progress:** 25% (1 of 4 sprints complete)

### Sprint Status

| Sprint | Reader Problem | Status |
|--------|---------------|--------|
| W1-S1 | Homepage doesn't explain the institution | ✅ Complete |
| W1-S2 | No obvious place to start | 🟢 Active |
| W1-S3 | Trust is not visible immediately | 🔒 Locked |
| W1-S4 | Homepage feels like disconnected sections | 🔒 Locked |

---

## Work Streams

| Stream | Focus | Current | Target |
|--------|-------|---------|--------|
| A — Arrival | Homepage, Identity, Navigation, Trust, Start Here | 2.8 | 4.5 |
| B — Reading | Story, Visual Spine, Reading Modes, Progress, Learning | 2.0 | 4.5 |
| C — Verification | Investigation, Evidence, Documents, Counterarguments, Timeline | 1.3 | 4.5 |
| D — Knowledge | Collections, Volumes, Library, Search, Topics, Thinkers | 1.5 | 4.5 |
| E — Trust | Methodology, Constitution, Corrections, Version, Transparency | 2.0 | 4.5 |
| F — Institution | Accessibility, Performance, Consistency, Typography, Spacing, Interaction | 2.0 | 4.5 |

---

## Change Log

| Date | Change |
|------|--------|
| Jul 14 | Phase 1 accepted. Roadmap restructured to reader-journey waves. Baseline: 2.5/5. |
| Jul 16 | Planning Phase declared complete. Wave 0 closed. Wave 1 defined (4 sprints). Program doc v1.0 locked. |
| Jul 16 | W1-S1 complete — Institutional Identity. Platform score 2.5 → 2.8. W1-S2 active. |
