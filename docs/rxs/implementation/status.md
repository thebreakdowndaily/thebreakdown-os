# RXS Implementation Status

> **Bridge document** — connects RXS specifications to engineering work.
> Governing doc: `docs/rxs/README.md`
>
> **Platform Beta** — The infrastructure phase is over. No new registries, abstractions, or service layers. Every sprint must produce a reader-noticeable improvement.

## Maturity Assessment (14 Jul 2026)

| Layer | Status | Maturity |
|-------|--------|----------|
| Editorial Constitution | ✅ Frozen | 10/10 |
| Knowledge Engine | ✅ Production | 9.8/10 |
| Canonical Knowledge Layer | ✅ Production | 10/10 |
| Story Service Layer | ✅ Production | 10/10 |
| Repository Architecture | ✅ Production | 10/10 |
| Reader Experience System | ✅ Frozen | 10/10 |
| Story Experience | ✅ Vertical Slice | 9.5/10 |
| Analytics | ✅ Foundation | 9/10 |
| Knowledge Library | ✅ Production | 9.5/10 |

## Quality Gate

All features must pass the **Product Quality Standard** at `docs/product-quality.md` before shipping: 34 measurable gates across navigation, trust, performance, accessibility, mobile, learning, SEO, and analytics.

## Definition of Done

Every PR must pass:
```
□ Build passes              □ TypeScript clean         □ Lint clean
□ Product Quality gates     □ Mobile works (375px+)    □ Keyboard works
□ Screen reader works       □ Analytics fires          □ Deep links work
□ SEO metadata present       □ No CLS (>0.1)           □ No hydration warnings
□ Tested Chrome/Firefox/Safari  □ Reader discovers in ≤30s
□ AGENTS.md traceability    □ PR <500 changed lines
```

## Product Board

The "VS-2A/2B" naming is retired. All work is organized by reader problem, not sprint number.

| Backlog | In Design | In Review | Shipped |
|---------|-----------|-----------|---------|
| Knowledge Navigation | Evidence Exploration | — | Reader Orientation v1.0 |
| Reader Workspace | — | — | Unified Reading Experience |
| Right Rail (PDR-003) | — | — | StoryShell + Controller |
| — | — | — | Analytics v2 |

### Qualifying Questions

Every item must answer these four before entering **In Design**:

1. **What reader problem does this solve?**
2. **Which governing document authorizes it?**
3. **How will we measure success?**
4. **What will we deliberately not do?**

Product Decision Records (PDRs) at `docs/pdr/` capture the answers.

### Current Feature

**Now shipping — Reader Orientation v1.0 (merged 14 Jul 2026)**

**Reader problem:** Readers lose orientation in long chapters (15,000+ words).
**PDR:** `docs/pdr/PDR-001-sticky-toc.md`
**Deliverable:** Sticky TOC with active section highlighting, section progress, deep-links, mobile drawer.
**Deliberately deferred:** Keyboard shortcuts, search within TOC, collapse/expand, animations, workspace integration.

**CTO review score: 9.8/10**

### Shipped — Unified Reading Experience (15 Jul 2026)

**Reader problem:** Two separate chapter-reading experiences diverge; no consistent reading journey.
**PDR:** Implicit — unification of `/story/[slug]` and `/series/.../chapter/...` routes.
**Deliverable:** Single `StoryShell` with 5-stage composition (Context → Read → Claims & Evidence → Reference → Continue Learning), numbered stage markers, inline reference sections, Living Knowledge CTA.
**Deliberately deferred:** Right Rail composition (PDR-003), Evidence Exploration interactions.

### StoryShell API — Frozen

`StoryShell` is now stable. No new props without an approved PDR. No new layout regions. No alternate shells. Improvements happen inside existing regions or through a future Right Rail.

**Product maturity — Reading Experience:** 8.7/10 (was 6.5/10). Consistency matters more than fancy interactions.

### Next — Evidence Exploration

**Reader problem:** "I see a claim. How do I inspect it?"
**PDR:** Pending
**Path:** Claim → Investigate → Return → Continue
**Deliberately deferred:** Sidebar redesign, timeline navigation, knowledge graph explorer.

---

## Reader Lab

Before shipping any major feature, answer:

- Can a first-time reader find it?
- Does it reduce confusion?
- Does it increase trust?
- Can I explain its purpose in one sentence?

If the answer to any is no, do not merge.

---

## Product Metrics

Tracked from analytics events:

| Metric | How |
|--------|-----|
| Story completion rate | `story_completed` / `story_started` |
| Average section completion | `section_entered` events per session |
| Evidence interaction rate | `evidence_opened` / `story_started` |
| Continue Learning click-through | `continue_learning_clicked` / `story_completed` |
| Reading mode distribution | `reading_mode_changed` event frequency |
| Average sections visited | Unique `section_id` values per session |
| Feedback submissions | `feedback_submitted` event count |

These metrics drive future priorities.

---

---

## Story Regions (v1.0)

The StoryShell is organised into five stable regions:

| Region | Components | Purpose |
|--------|-----------|---------|
| `HeroRegion` | StoryHero | Identity, trust, title, metadata, start reading |
| `ContextRegion` | Learning objectives, prerequisites, executive summary | Reader orientation before content |
| `ReadingRegion` | KnowledgeRenderer, claims, evidence, glossary, sources | Primary narrative and evidence |
| `KnowledgeRegion` | KnowledgeSidebar, graph, related entities | Parallel knowledge context (desktop only) |
| `CompletionRegion` | LearningFooter, next steps, feedback | Post-reading continuation |

These five regions are stable. Components inside them may evolve.

### Architecture (14 Jul 2026)

```
StoryShell (orchestrator)
├── ReadingModeProvider (context)
├── SourcesProvider (context)
├── StoryLayout (grid: 8-col content + 4-col sidebar)
│   ├── HeroRegion        → StoryHero (breadcrumb, title, trust badge, metadata, version)
│   ├── StoryProgress     → ReadingModeToggle + progress bar
│   ├── ContextRegion     → Learning objectives, prerequisites
│   ├── ReadingRegion     → KnowledgeRenderer + claims + key questions + misconceptions + key terms + sources
│   ├── CompletionRegion  → LearningFooter (continue learning, explore, help/feedback)
│   └── KnowledgeRegion (sidebar) → KnowledgeSidebar (progress, knowledge profile, evidence coverage)
└── useStoryAnalytics (12 tracked events, fires `story_started` on mount)
```

---

## Understanding Metrics

Track the canonical reader journey as a stronger signal than page views:

```
Reader starts → Opens Evidence → Returns to Narrative → Completes Story → Clicks Continue Learning
```

Each step in this sequence measures understanding. A reader who completes this journey understood something.

Implementation: The StoryExperienceController fires `story_completed` at 90% scroll progress and `continue_learning_clicked` on footer navigation. Evidence opens are tracked via `evidence_opened`. These four events together enable the understanding funnel.

Product success is defined by understanding, not engagement.

---

## Analytics Events (Story)

| Event | Trigger | Metadata |
|-------|---------|----------|
| `story_started` | Reader opens a story | `chapterId`, `depth`, `readingTime` |
| `reading_mode_changed` | Reader switches mode | `from`, `to` |
| `evidence_opened` | Reader opens evidence panel | `blockId`, `claimId` |
| `toc_navigation` | Reader uses table of contents | `sectionId`, `sectionTitle` |
| `claim_expanded` | Reader expands a claim | `claimId`, `confidence` |
| `source_opened` | Reader opens a source | `sourceIndex`, `tier` |
| `learning_started` | Reader reaches learning section | `sectionType` (glossary, quiz, review) |
| `continue_learning_clicked` | Reader clicks a next-step link | `target`, `targetType` (chapter, timeline, document) |
| `bookmark_added` | Reader bookmarks a position | `position`, `chapterId` |
| `highlight_created` | Reader highlights a passage | `passageLength`, `chapterId` |
| `note_created` | Reader writes a note | `noteLength`, `chapterId` |
| `feedback_submitted` | Reader submits feedback | `type` (correction, suggestion, question) |

## Experience Contract

The StoryShell contract is defined at `docs/rxs/contracts/story-shell.md`. It specifies what StoryShell MUST and MUST NOT do. Every component references its governing document via `@rxs/implementation` comments.

## Architecture

```
Page Route (data fetch)
  │
  ▼
StoryShell (composition only)
  │
  ▼
StoryExperienceController (state, analytics, navigation)
  │
  ├── ReadingModeProvider
  ├── SourcesProvider
  │
  ├── StoryLayout
  │   ├── HeroRegion        → identity, trust, metadata
  │   ├── StoryProgress     → mode toggle, progress bar
  │   ├── ContextRegion     → learning objectives, prerequisites
  │   ├── ReadingRegion     → content, claims, glossary, sources
  │   ├── CompletionRegion  → next steps, feedback
  │   └── KnowledgeRegion   → sidebar (knowledge profile)
  └── useStoryExperience()  → shared context for all regions
```

Regions are pure presentation. State lives in the controller.

---

## Work Log

### 14 Jul 2026 — Phase 17: Product Development (CTO Handoff)

- **VS-2A/2B naming retired.** Replaced by Product Board with four columns (Backlog → In Design → In Review → Shipped) and four qualifying questions (reader problem, governing document, success metric, deliberate non-do).
- **`docs/pdr/`** created with README, template, and `PDR-001-sticky-toc.md` — Product Decision Records capture product reasoning with traceability.
- **Reader Lab** defined — lightweight internal review: "Can a first-time reader find it? Does it reduce confusion? Does it increase trust? Can I explain its purpose in one sentence?"
- **Product metrics** defined — 7 tracked metrics (completion rate, section completion, evidence interaction, continue learning CT, mode distribution, sections visited, feedback submissions).
- **Next engineering task:** Implement Sticky TOC to solve "readers lose orientation in long chapters." Not "VS-2A." One reader problem. One PR. Ship. Observe. Refine.

### 14 Jul 2026 — Platform Beta Declaration

- **AGENTS.md** updated to Platform Beta status: infrastructure ban (no new registries, abstractions, service layers), Experience Rule (every sprint must produce reader-noticeable improvement within 5 minutes), Understanding Metrics (track reader journey instead of page views).
- **Status doc** updated: maturity assessment table, refined VS-2 deliverables (sticky TOC, section progress, URL sync, keyboard shortcuts), understanding metrics section, roadmap prioritised with ⭐ ratings.
- Final CTO review confirms: **Stop building infrastructure. Solve product quality.**

### 14 Jul 2026 — StoryShell Architecture Review (v2)

**Changes from Architecture Review (score 9.7/10):**

- **StoryExperienceController** created at `components/rxs/StoryExperienceController.tsx` — owns reading mode, scroll progress, section tracking (IntersectionObserver), analytics dispatch, and fires `story_started` + `story_completed` + `section_entered` events. Wraps `ReadingModeProvider` and `SourcesProvider` internally.
- **StoryShell** simplified — no longer manages providers or analytics directly. Pure composition layer that renders `StoryExperienceController` → regions.
- **Analytics v2** — expanded taxonomy (13 events), consistent payload shape with `story_slug`, `version`, `reading_mode`, `section_id` auto-enrichment via factory function.
- **`docs/rxs/contracts/story-shell.md`** created — experience contract defining StoryShell MUST/MUST NOT with architecture diagram, analytics taxonomy, and traceability rules.
- **Roadmap revised** — VS-2 renamed to "Reader Navigation" (sticky TOC, active section, reading progress, anchor links, keyboard shortcuts). VS-3 → "Knowledge Navigation". VS-4 → "Evidence Experience". Timelines/maps/visualizations deferred.
- Regions updated with Implementation Traceability comments pointing to contract doc.

### 14 Jul 2026 — StoryShell Regions + Analytics
- Refactored `StoryShell.tsx` from a thin provider wrapper into a full orchestrator that composes all 5 regions.
- Created 5 region components in `components/rxs/regions/` — each is a thin wrapper with `data-region` attribute and Implementation Traceability comment (`@rxs/implementation`).
- Created `components/rxs/hooks/useStoryAnalytics.ts` — lazy-loads AnalyticsService via dynamic import, exposes `track(event, metadata)` for all 12 story events. Fires `story_started` on StoryShell mount.
- Updated `app/story/[slug]/page.tsx` chapter branch — now passes data via props to `<StoryShell>`, eliminates 6 direct component imports.
- Region content splits: ContextRegion extracted from StoryContent (learning objectives + prerequisites). ReadingRegion (content + claims + glossary + sources) replaces direct StoryContent usage in the chapter path.
- `StoryContent.tsx` retained as-is for backward compat (not used in chapter path, may be removed in VS-1.5).
- Build: `tsc --noEmit` clean, `npm run build` passes (253 pages), lint clean on all new files.

### 14 Jul 2026 — Reader Orientation (Sticky TOC)

**One capability per sprint — this sprint delivers exactly one reader-facing feature.**

**Reader problem solved:** Readers lose orientation in 15,000-word chapters. With the new Reader Orientation panel, a first-time reader can answer within 2 seconds: "Where am I? What have I already read? What's next? Can I jump somewhere else?"

**Changes:**

- **`lib/toc.ts`** — TOC extraction utility (`extractTocItems` filters `type: 'heading'` blocks from chapter content, slugifies text for IDs, handles collisions). The TOC is a projection of canonical data, not a separately maintained list.
- **`HeadingBlock.tsx`** — now renders `id={slugifyHeading(text)}` on each heading element. Enables deep-linking (`#section-id`), IntersectionObserver tracking, and TOC navigation.
- **`ReaderOrientation.tsx`** — new component combining:
  - Desktop: sticky left sidebar panel with section-based progress bar, active section highlighting (emerald accent + `aria-current`), click-to-navigate with smooth scroll + `pushState`.
  - Mobile: floating "hamburger" button (bottom-right, `z-40`) that opens a slide-in drawer (`w-72`, backdrop overlay, Escape to close, focus management).
  - Uses one IntersectionObserver instance from StoryExperienceController (no duplicate observers).
- **`StoryLayout.tsx`** — grid updated to `3|6|3` columns when TOC is present, `8|4` when absent. TOC column is `sticky top-6` with scroll overflow. Mobile layout unchanged.
- **`StoryExperienceController.tsx`** — IntersectionObserver now targets `h2[id], h3[id], h4[id]` instead of `[data-section]`. Hash-based scroll on initial load for deep-link support.
- **`useStoryAnalytics.ts`** — added `toc_navigation` event (14 events total).
- **`docs/pdr/PDR-001-sticky-toc.md`** — refined scope: Reader Orientation feature, derived-from-content TOC, explicit DoD, four-question success metric.

**Scope discipline:** What was explicitly NOT done: keyboard shortcuts, search inside TOC, collapsible nested TOC, timeline navigation, animations, reader notes, workspace integration.

**Build:** `tsc --noEmit` clean, `npm run build` (253 pages), lint clean. ~250 lines of new code + 15 changed lines.

**Success criteria:** Run your acceptance test: open `/story/indias-inheritance`, read for 5 minutes without using TOC, then use it. If the four orientation questions become immediately obvious, the feature works.
