# PDR-001 — Reader Orientation (Sticky Table of Contents)

## Problem

Readers lose their sense of place in a 15,000-word chapter. They cannot answer four basic questions:

- Where am I?
- What have I already read?
- What's next?
- Can I jump somewhere else?

If those four questions are not answerable within two seconds, the feature has failed.

## Decision

Implement a Reader Orientation panel — a sticky table of contents derived from the chapter's rendered content headings — that solves the orientation problem without adding scope creep.

The TOC is **not a separately maintained list**. It is a projection of the chapter's heading blocks (`type: 'heading'` in the Knowledge Library content array). This avoids synchronization problems as chapters evolve (ref: AGENTS.md — "If code asks 'where should this data live?', the answer is always: in the knowledge model, not in a page").

## Scope

### Included

- Sticky TOC panel (desktop left sidebar)
- Active section highlighting (via IntersectionObserver on `h2[id], h3[id], h4[id]` elements)
- Section-based progress counter ("3 of 12 sections")
- Deep-link support (`#section-id` on page load, pushState on click)
- Auto-scroll TOC to keep active item visible
- Analytics: `toc_navigation`, `section_entered` (already exists)

### Explicitly Excluded

- Keyboard shortcuts (separate PDR)
- Search inside TOC (separate PDR)
- Collapsible nested TOC (level-based indentation only)
- Timeline navigation
- Animations
- Reader notes
- Workspace integration

## Alternatives Considered

- Floating progress bar only (insufficient for section-level navigation)
- Collapsible outline at page top (requires scroll-to-top to use)
- Breadcrumb-only navigation (loses section granularity)
- No navigation, rely on scroll (fails for 15k-word chapters)

## Chosen Because

A sticky TOC combines section-level orientation with one-click navigation. It mirrors proven patterns (Apple Books, GitBook, MDN) that readers already understand. Deriving from content headings rather than hard-coded data eliminates synchronization drift.

## Governing Documents

- `AGENTS.md` — Platform Beta rule: one capability per sprint, no speculative infrastructure
- `docs/product-quality.md` — Navigation, Accessibility, Mobile, Performance, Analytics gates
- `docs/rxs/contracts/story-shell.md` — analytics taxonomy v2, scroll progress, active section tracking

## Success Metrics

Reader should be able to answer within 2 seconds:
1. Where am I?
2. What have I already read?
3. What's next?
4. Can I jump somewhere else?

Secondary metrics:
- TOC interaction rate (toc_navigation events per session)
- Story completion rate (baseline: TBD via story_completed event)

## Deliberately Out of Scope

- Keyboard shortcuts (separate PDR)
- Search within TOC (separate PDR)
- Drag-to-reorder sections (future)
- Section completion checkmarks (separate PDR)
- Animations
- Reader workspace integration

## Implementation

### Architecture

```
StoryShell
  └── StoryLayout (grid: 3|6|3 columns)
        ├── [TOC Column] ReaderOrientation
        │     ├── Desktop: Sticky nav panel
        │     │     ├── Progress bar (scrollProgress from context)
        │     │     └── TocNav (list of section buttons)
        │     └── Mobile: Floating ≡ button + slide-in drawer
        ├── [Content Column] Hero + Progress + Context + Reading + Completion
        └── [Sidebar Column] KnowledgeRegion
```

### TOC Extraction

`lib/toc.ts` — `extractTocItems(KnowledgeBlock[])` filters `type: 'heading'` blocks, slugifies text to generate ids, handles collisions. Used by `StoryShell` at render time to derive the TOC from canonical data.

### Heading IDs

`HeadingBlock.tsx` renders `id={slugifyHeading(text)}` on each heading element. These ids are used by:
- IntersectionObserver (section tracking)
- TOC navigation (scrollIntoView + pushState)
- Deep-link on page load (hash read from URL)

### IntersectionObserver

One observer instance in `StoryExperienceController` targeting `h2[id], h3[id], h4[id]`. Tracks active section and fires `section_entered` analytics.

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 14 Jul 2026 | Initial decision | CTO Handoff |
| 14 Jul 2026 | Refined scope — Reader Orientation, derived TOC, explicit DoD, four-question metric | Product Board |
