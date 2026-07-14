# Reader Experience v2.0 — Implementation Plan

**Date:** 14 July 2026  
**Status:** Active  
**Constraint:** 10% engineering effort (editorial priority)

---

## Implementation Tiers

| Tier | Effort | When | Description |
|------|--------|------|-------------|
| P0 | Hours | Now | Leverages existing components, no new types |
| P1 | Days | This week | New components, existing patterns |
| P2 | Weeks | Deferred | New infrastructure, new block types |
| P3 | Months | Post-v1.0 | New features, external dependencies |

---

## P0 — Implement Now

### 1. Chapter Hero / Landing Section

**Files to create/modify:**
- `components/knowledge-library/chapter/HeroSection.tsx` (new)
- `components/knowledge-library/chapter/ChapterPage.tsx` (modify)

**Implementation:**
```tsx
<HeroSection
  title="India's Inheritance"
  subtitle="Partition and the Strategic Foundations of Independent India"
  badge="Gold Standard"
  trustScore={96}
  readingTime={{ explorer: 30, scholar: 75, researcher: 200 }}
  learningObjectives={[...]}
  sixQuestions={[
    "What happened?",
    "Why did it happen?",
    "Why did India choose this path?",
    "What alternatives existed?",
    "What were the consequences?",
    "Why does it matter today?"
  ]}
/>
```

Renders before the chapter content. Shows: title, badge, trust score, reading time, six questions checklist, a "Start Reading" button that scrolls to content.

### 2. Per-Chapter Trust Panel

**Files:**
- `components/knowledge-library/chapter/TrustPanel.tsx` (new)
- `ChapterPage.tsx` (modify — insert below hero)

**Shows:** sources count, primary sources, claims, evidence entries, confidence rating, version, corrections, freshness.

**Data source:** Already exists in the `ChapterPage` props (chapter metadata, sources, claims).

### 3. In-Chapter Table of Contents

**Files:**
- `components/knowledge-library/chapter/ChapterToc.tsx` (new — adapted from `components/story/TableOfContents.tsx`)
- `ChapterPage.tsx` (modify — insert sticky sidebar)

**Behavior:** IntersectionObserver-based active section tracking. Lists all `heading` blocks from `chapter.content`. Sticky on desktop, hamburger on mobile.

### 4. Knowledge Object Search

**Files:**
- `services/search/canonical-repository.ts` (modify — add knowledge library indexing)
- `app/api/search/route.ts` (modify — add knowledge entity results)

**Implementation:** Index chapters, claims, evidence, sources, thinkers as searchable entities alongside existing stories/topics.

---

## P1 — This Week

### 5. Entity/Concept Hover Cards

**Files:**
- `components/knowledge-library/citations/EntityHover.tsx` (new)
- `utils/data-layer/entity-index.ts` (already exists — entity lookup)

**Behavior:** When the reader hovers an entity mention (person, place, concept), show a tooltip with brief description, role, and link to full entity page.

### 6. Mobile Chapter UI

**Files:**
- `components/knowledge-library/chapter/MobileChapterBar.tsx` (new)
- `ChapterPage.tsx` (modify)

**Behavior:** Sticky bottom bar on mobile with: section name, ToC toggle, reading depth toggle, scroll-to-top.

### 7. GraphSidebar Enhancement

**Files:**
- `components/knowledge-library/graph/GraphSidebar.tsx` (modify)

**Add tabs:** Timeline (key events from chapter timeline block), People (thinkers from chapter), Places (geographic entities from maps).

---

## P2 — Deferred (Post-Chapter 1)

### 8. Question Mode
- New block interaction: "Why?" button on paragraphs
- Expands to show evidence, documents, disagreements, maps
- Requires new UI component + event handling

### 9. Reading Workspace (Backend)
- Highlights (text selection → save)
- Notes (inline annotation)
- Bookmarks
- Reading progress tracking
- Requires auth + database schema

### 10. Quiz Scoring / Flashcards
- Track correct/incorrect answers
- Flip animation for flashcards
- "X of Y completed" progress

---

## P3 — Post-v1.0

### 11. Collections
- Reader-curated reading lists
- Save claims, chapters, timelines

### 12. Export
- PDF export
- Citation export (BibTeX, MLA, Chicago)
- Share links

### 13. Spaced Repetition
- Flashcard scheduling based on recall
- Learning progress over time

---

## Current Implementation Progress

| Feature | Status | Assigned |
|---------|--------|----------|
| Chapter Hero/Landing | P0 — Implemented | ✅ |
| Per-Chapter Trust Panel | P0 — Implemented | ✅ |
| Chapter Table of Contents | P0 — To build | ⬜ |
| Knowledge Object Search | P0 — To build | ⬜ |
| Entity Hover Cards | P1 — To build | ⬜ |
| Mobile Chapter UI | P1 — To build | ⬜ |
| GraphSidebar enhancement | P1 — To build | ⬜ |
| Question Mode | P2 — Deferred | ⬜ |
| Reading Workspace | P2 — Deferred | ⬜ |
| Quiz Scoring | P2 — Deferred | ⬜ |
| Collections | P3 — Deferred | ⬜ |
| Export | P3 — Deferred | ⬜ |
