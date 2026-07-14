---
title: Knowledge Library — Architecture
status: draft
owner: engineering
last_updated: 2026-07-12
---

# Knowledge Library — Architecture

## Overview

The Knowledge Library is a **data-driven content layer** that sits on top of the existing The Breakdown OS architecture. It extends the existing service/repository pattern, knowledge graph, and entity system to support structured, multi-volume, evidence-based collections.

## Principles

1. **Content is data.** Every chapter, claim, source, and thinker is a typed object — not Markdown files or CMS blobs.
2. **The library is a projection.** The Knowledge Library service reads from existing entities (countries, people, treaties) and adds collection-specific structure on top.
3. **Rendering is generic.** A chapter component renders any chapter from any collection — the rendering engine is collection-agnostic.
4. **Interactivity is progressive.** The same page works at Explorer, Scholar, and Researcher depth by progressively enhancing the rendered DOM.

## Route Structure

```
/series                                → KnowledgeLibraryIndexPage
/series/[collectionSlug]               → CollectionLandingPage
/series/[collectionSlug]/volume/[v]    → VolumePage
/series/[collectionSlug]/volume/[v]/chapter/[c]   → ChapterPage
/series/[collectionSlug]/documents     → DocumentLibrary
/series/[collectionSlug]/maps          → MapLibrary
/series/[collectionSlug]/thinkers      → ThinkersDirectory
/series/[collectionSlug]/timelines     → TimelineView
/series/[collectionSlug]/datasets      → DatasetExplorer
/series/[collectionSlug]/debates       → DebatesHub
/series/[collectionSlug]/reading-paths → ReadingPaths
/series/[collectionSlug]/methodology → ResearchMethodologyPage
/series/[collectionSlug]/how-to-read → HowToReadThisPage
/series/[collectionSlug]/documents/[documentId] → PrimaryDocumentReader
/series/[collectionSlug]/decision-simulator/[scenarioId] → DecisionSimulatorPage
/series/[collectionSlug]/historiography/[eventSlug] → HistoriographyPage
```

Reading depth is controlled via a URL query parameter: `?depth=explorer|scholar|researcher`.

## Component Tree

```
<KnowledgeLibraryShell>          ← layout, breadcrumbs, nav, reading-depth toggle
  <CollectionHeader />           ← hero image, title, summary, metadata
  <VolumeNavigation />           ← side nav / bottom sheet for volume + chapter nav
  <ChapterContent />             ← renders at current reading depth
    <SectionRenderer />          ← renders each section of the chapter
      <ClaimRenderer />          ← renders a claim with evidence annotations
      <EvidenceCard />           ← inline evidence popover/card
      <ThinkerBlock />           ← thinker perspective embed
      <TimelineEmbed />          ← inline timeline
      <MapEmbed />               ← inline interactive map
      <ResourceCard />           ← book/article/video card
    <KeyQuestions />             ← answered at top of chapter
    <Misconceptions />           ← common misconceptions section
    <TimelineContext />          ← what was happening simultaneously
    <MultiplePerspectives />     ← government, opposition, international, academic
    <KeyTerms />                 ← glossary of terms used
  <DifficultyBadge />            ← ★★★★☆ + prerequisites
  <ConfidenceScore />            ← 98% with source breakdown
  <DecisionMatrix />             ← options table per major policy
  <DecisionSimulator />          ← interactive "what would you do?"
  <CounterfactualBlock />        ← "what if" section (analytical only)
  <ComparativeTimeline />        ← multi-region timeline embed
  <PrimaryDocumentEmbed />       ← annotated document viewer
  <HistoriographyBlock />        ← competing interpretations
  <LearningSection />            ← summary, quiz, flashcards, reading path
  <SourcesPanel />               ← full citation list
</KnowledgeLibraryShell>
```

## Data Flow

```
Seed Data / Supabase
  ↓
KnowledgeLibraryService (async, repository pattern)
  ├── getLibrary(slug): KnowledgeLibrary
  ├── getCollection(slug): KnowledgeCollection
  ├── getVolume(collectionSlug, volumeSlug): Volume
  ├── getChapter(collectionSlug, volumeSlug, chapterSlug): Chapter
  ├── getDocuments(collectionSlug): PrimarySource[]
  ├── getThinkers(collectionSlug): Thinker[]
  ├── getTimeline(collectionSlug, query): TimelineEvent[]
  └── getReadingPaths(collectionSlug): ReadingPath[]
  ↓
Depth Filter (explorer/scholar/researcher)
  ↓
View Model (projected from canonical types)
  ↓
React Component (reads view model, no business logic)
```

## Integration Points

| Existing System | Integration |
|----------------|-------------|
| Entity Service | Chapters link to entities (countries, people, orgs) via `relatedEntityIds` |
| Knowledge Graph | Collection entities are projected into the graph lens |
| Timeline Service | Timeline events can be drawn from existing timeline data or overridden per chapter |
| Map Service | Maps are stored as data (GeoJSON + metadata) |
| Media Service | Media items (images, documents, maps) are stored in the media system |
| Dataset Service | External datasets linked from the Knowledge Library |
| Story Service | Chapters can cross-reference published stories |
| Primary Document Service | Original treaties, UN records, speeches rendered with annotations |
| Decision Simulator Engine | Interactive "what would you do?" branching scenarios |
| Research Workspace | Bookmarking, highlighting, annotation, citation export |

## Performance Strategy

- **ISR** for collection index and volume pages (`revalidate=3600`)
- **SSR + caching** for chapter pages (vary by reading depth)
- **Streaming** for Researcher depth content (primary docs loaded on demand)
- **Dynamic imports** for heavy components (maps, timelines, datasets)

## Accessibility

- Keyboard-navigable chapter structure
- Reading depth toggle is a `<fieldset>` of radio buttons with `<legend>`
- Explorer mode uses plain HTML (no JS required)
- Scholar and Researcher progressively enhance
- Maps have text alternatives and tabular data views

---

*Architecture decisions should be recorded in ADRs as they are made.*
