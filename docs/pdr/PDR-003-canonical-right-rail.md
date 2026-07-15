# PDR-003: Canonical Right Rail

**Status:** Deferred — Future Architectural Freeze
**Date:** 2026-07-15
**Author:** Editor-in-Chief
**Supersedes:** N/A

## Scope

`StoryShell` currently owns the right sidebar as a single opaque slot (`sidebar` prop in `StoryLayout`). As more sidebar content accumulates (knowledge profile, graph, evidence, workspace, related chapters, continue learning), the sidebar needs its own composition layer.

## Problem

Currently `StoryShell` passes `KnowledgeRegion` + optionally `GraphSidebar` as children to the sidebar slot. This means:

- Every new sidebar capability requires a new prop on `StoryShell`
- The sidebar has no canonical ordering or layout logic
- The sidebar cannot independently manage its own scroll state or collapse behavior

## Proposed Solution

Introduce a `RightRail` component owned by `StoryLayout` (or `StoryShell`) that composes sidebar sections internally:

```
StoryShell
│
├── Main (TOC + Reading)
│
└── RightRail
    ├── KnowledgeProfile
    ├── GraphSidebar
    ├── EvidenceExploration
    ├── ReaderWorkspace
    ├── RelatedChapters
    └── ContinueLearning
```

Each section is a canonical region that can be toggled, reordered, or collapsed by the reader. `StoryShell` passes data to `RightRail`, and `RightRail` delegates to each section.

## Rejected Alternatives

- Growing optional props on `StoryShell` indefinitely — leads to surface bloat and makes testing harder
- Multiple sidebar slots — couples shell to layout details it shouldn't own

## When to Implement

At the next architectural freeze, when sidebar composition is the bottleneck. Not before reader testing validates the need.

## Governance

StoryShell is now frozen. No new props without an approved PDR. No new layout regions. No alternate shells.
