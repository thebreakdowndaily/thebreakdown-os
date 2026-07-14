# Story Shell — Experience Contract

> **Governing doc:** `docs/rxs/screens/story.md`
> **Version:** v1.0
> **Last updated:** 14 Jul 2026

This document defines the contract between StoryShell and its consumers. It describes what StoryShell guarantees, not how it is implemented.

---

## Contract

StoryShell MUST:

| # | Requirement | Rationale |
|---|-------------|-----------|
| 1 | Render all five regions (Hero, Context, Reading, Knowledge, Completion) in the correct order | The RXS screen specification defines this structure. Violating it breaks the reading experience contract. |
| 2 | Preserve reading context across mode switches (explorer → researcher → student) | Mode is state. Switching modes must not reset scroll position, active section, or expanded claims. |
| 3 | Be analytics-aware and fire the canonical event taxonomy | Every significant reader action must be measurable. Events must use the consistent shape defined in `@/components/rxs/hooks/useStoryAnalytics`. |
| 4 | Support all reading depths defined in `ReadingDepth` | Each depth renders different sections. Explorer hides evidence. Researcher shows claims. Student shows learning objectives. StoryShell must honor all three. |
| 5 | Never own business logic | Business logic belongs in services. StoryShell composes regions and provides shared state. It does not compute knowledge. |
| 6 | Never fetch data directly | Data fetching belongs in the page layer. StoryShell receives data as props. |
| 7 | Be reusable by stories, chapters, and investigations | Any knowledge object with narrative content should be renderable through StoryShell. The prop interface must be generic enough to support all three. |
| 8 | Provide scroll progress, active section tracking, and TOC navigation state to all regions via StoryExperienceController | Regions are pure presentation. Navigation state is owned by the controller. |
| 9 | Never render content without a governing document reference | Every component, hook, and region must include an `@rxs/implementation` comment tracing to its governing spec. |

---

## StoryShell MUST NOT

| # | Prohibition | Why |
|---|-------------|-----|
| 1 | Import data-layer utilities directly | Data fetching is the page's responsibility. StoryShell is a UI composition boundary. |
| 2 | Own mutable state beyond composition | State belongs in StoryExperienceController. StoryShell is the outermost composition layer. |
| 3 | Render decorative flourishes (animations, parallax, transitions) | Those belong in the experience layer, not the shell contract. |
| 4 | Create parallel type definitions | All types come from `@/types/canonical`. |
| 5 | Duplicate rendering logic already in Knowledge Engine | Claims, evidence, and sources render through existing Knowledge Engine components. |

---

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

---

## Analytics Taxonomy (v2)

Every event payload includes:

| Field | Source |
|-------|--------|
| `story_slug` | Prop passed from page |
| `reading_mode` | Current value from controller |
| `section_id` | From IntersectionObserver (when applicable) |
| `timestamp` | `new Date().toISOString()` |
| `version` | `rxs-v1.0` |

### Canonical Events

`story_started` · `story_completed` · `section_entered` · `reading_mode_changed` · `claim_expanded` · `evidence_opened` · `source_opened` · `document_opened` · `timeline_opened` · `thinker_opened` · `continue_learning_clicked` · `feedback_submitted`

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 14 Jul 2026 | Initial contract | Architecture Review |
