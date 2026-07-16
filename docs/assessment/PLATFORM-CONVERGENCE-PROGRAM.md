# THE BREAKDOWN
# Platform Convergence Program
Version: 1.0
Status: Locked

---

# Purpose

This document governs every implementation sprint until Platform v1.0 reaches institutional quality.

No implementation outside this document.

No new architecture.

No speculative features.

No redesign.

The objective is convergence.

---

# Current State

Platform Score

2.5 / 5

Target

4.5 / 5

Publication Status

Not Ready

Primary Finding

Architecture is substantially complete.

Reader experience is partially implemented.

Primary Objective

Close the implementation gap.

---

# Program Principles

1. Reader first
2. Institution before interface
3. Integration before expansion
4. Reuse before building
5. Evidence before opinion
6. One reader problem per sprint
7. One PR per capability
8. Every sprint increases platform maturity

---

# Reader Journey

Everything maps to this journey.

Arrival

↓

Orientation

↓

Trust

↓

Reading

↓

Investigation

↓

Learning

↓

Exploration

↓

Return

No implementation may exist outside this journey.

---

# Work Streams

## Stream A — Arrival

Homepage, Identity, Navigation, Trust signals, Start Here

Target Score: 4.5

---

## Stream B — Reading

Story, Visual Spine, Reading Modes, Progress, Learning

Target Score: 4.5

---

## Stream C — Verification

Investigation, Evidence, Documents, Counterarguments, Timeline

Target Score: 4.5

---

## Stream D — Knowledge

Collections, Volumes, Library, Search, Topics, Thinkers

Target Score: 4.5

---

## Stream E — Trust

Methodology, Constitution, Corrections, Version, Transparency

Target Score: 4.5

---

## Stream F — Institution

Accessibility, Performance, Consistency, Typography, Spacing, Interaction

Target Score: 4.5

---

# Sprint Template

Every sprint contains:

- Reader Problem
- Current State
- Expected State
- Documentation
- Acceptance Criteria
- Quality Gates
- Definition of Done
- Metrics
- Rollback
- Lessons Learned

Nothing else.

---

# Prioritization Matrix

| Priority | Definition |
|----------|------------|
| P0 | Publication blocker |
| P1 | Reader confusion |
| P2 | Trust improvement |
| P3 | Learning improvement |
| P4 | Polish |

Every backlog item receives one priority only.

---

# Release Gates

Wave 1 complete → Acceptance Review → Wave 2 → Acceptance Review → Wave 3

No wave overlaps.

---

# Definition of Wave Complete

A wave is complete only when:

- All P0 gaps are closed
- All P1 gaps are closed
- Product Quality gates pass
- Accessibility passes
- Mobile passes
- Build passes
- Reader walkthrough passes
- Platform score increases
- Executive Dashboard updated
- Wave Review signed off

---

# Wave Reviews

At the end of every wave, a review document is created at:

```
docs/assessment/reviews/wave-<n>-review.md
```

Every review contains:

- Planned work
- Delivered work
- Remaining gaps
- Platform score before
- Platform score after
- Reader observations
- Lessons learned
- Go / No-Go recommendation

Wave reviews become the project's institutional memory. No new wave begins until the previous wave's review is signed off.

---

# Execution Workflow

```
Platform Convergence Program
        ↓
Current Wave
        ↓
Gap Matrix
        ↓
One Reader Problem
        ↓
One Sprint
        ↓
One PR
        ↓
Verification
        ↓
Wave Review
        ↓
Next Wave
```

Nothing bypasses this workflow.

---

# Metrics

- Platform Score
- Reader Journey Completion
- Story Completion
- Investigation Usage
- Learning Completion
- Search Success
- Trust Visibility
- Accessibility
- Performance
- Publication Readiness

Every sprint must improve at least one metric.

---

# Governance

Every task must answer:

- What reader problem?
- Which governing document?
- How measured?
- Why now?
- Why not later?

If unanswered, task rejected.

---

# Publication Blocker Principle

Any issue that breaks institutional trust for a first-time reader immediately supersedes the planned roadmap until resolved.

Examples:
- Broken search
- Broken graph
- Infinite loading
- Placeholder in flagship content
- Broken methodology links
- Missing evidence
- Dead navigation

These are not UX bugs. They are institutional failures.

---

# Exit Criteria

The program ends when:

- Platform Score ≥ 4.5
- Critical gaps = 0
- Publication blockers = 0
- Reader Journey complete
- Platform frozen

Publishing Season One begins.

---

# Every Sprint Must Be Independently Demonstrable

If you finish a sprint, you must be able to show someone the website and say:

"This is what changed."

If the change requires explaining internal architecture, registries, or refactoring, then it isn't a completed sprint from the reader's perspective.
