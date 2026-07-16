# Platform Baseline

> Complete inventory of all public surfaces, routes, components, and data sources.
> Phase 1 — Institutional Assessment.

---

## Public Routes

| Route | Page Component | Layout | Status |
|-------|---------------|--------|--------|
| `/` | `app/page.tsx` | `HomepageLayout` | Active |
| `/stories` | `app/stories/page.tsx` — Story listing | `Container` | Active |
| `/story/[slug]` | `app/story/[slug]/page.tsx` — Dual path (StoryShell or legacy) | — | Active |
| `/series` | `app/series/page.tsx` — Knowledge Library index | — | Active |
| `/series/[collectionSlug]` | `app/series/[collectionSlug]/page.tsx` — Collection landing | — | Active |
| `/series/[collectionSlug]/volume/[volumeSlug]` | Volume page | — | Active |
| `/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]` | Chapter page → `ChapterPageShell` → `StoryShell` | — | Active |
| `/investigations` | `app/investigations/page.tsx` — Investigation listing | `Container` | Active |
| `/investigation/[slug]` | `app/investigation/[slug]/page.tsx` — Investigation detail | — | Active |
| `/search` | `app/search/page.tsx` — Keyword search | `SearchLayout` | Active |
| `/trust` | `app/trust/page.tsx` — Static trust dashboard | `Container` | Active |
| `/methodology` | `app/methodology/page.tsx` — Static methodology text | `Container` | Active |
| `/editorial-constitution` | `app/editorial-constitution/page.tsx` — Constitution summary | `Container` | Active |
| `/founding-edition` | `app/founding-edition/page.tsx` — Founding edition hub | `Container` | Active |
| `/dashboard` | `app/dashboard/page.tsx` — Internal editorial dashboard | — | Active |

---

## Data Layer

| Source | Format | Used By |
|--------|--------|---------|
| `utils/data-layer/store.ts` | In-memory story/investigation data | Legacy story pages, investigation listing |
| `utils/data-layer/knowledge-library-data.ts` | In-memory library (collections, volumes, chapters, blocks) | Knowledge Library pages, StoryShell chapters |
| `lib/knowledge/knowledge-core.ts` | Claims registry, enrichment | Chapter page StoryShell |
| `lib/knowledge/knowledge-graph.ts` | Entity graph, concept relationships | Chapter page StoryShell |
| `services/` (via `RepositoryFactory`) | Service layer wrapping data sources | Library pages |
| `features/` | View-model builders (homepage, search, story) | Homepage, Search, legacy Stories |

---

## Component Inventory

### Layout Components

| Component | Path | Status |
|-----------|------|--------|
| `HomepageLayout` | `layouts/HomepageLayout` | Active |
| `StoryLayout` | `components/rxs/StoryLayout` | Active |
| `SearchLayout` | `layouts/SearchLayout` | Active |
| `Container` | `components/layout/Container` | Active |

### RXS Architecture (Chapter Story Path)

| Component | Path | Documents |
|-----------|------|-----------|
| `StoryShell` | `components/rxs/StoryShell` | `docs/rxs/contracts/story-shell.md` |
| `StoryExperienceController` | `components/rxs/StoryExperienceController` | `docs/rxs/contracts/story-shell.md` |
| `StoryLayout` | `components/rxs/StoryLayout` | `docs/rxs/screens/story.md` |
| `StoryProgress` | `components/rxs/StoryProgress` | `docs/rxs/screens/story.md` |
| `StoryStage` | `components/rxs/StoryStage` | `docs/rxs/screens/story.md` |
| `ReaderOrientation` | `components/rxs/ReaderOrientation` | `docs/rxs/story-experience.md` |
| `HeroRegion` | `components/rxs/regions/HeroRegion` | `docs/rxs/screens/story.md` |
| `ContextRegion` | `components/rxs/regions/ContextRegion` | `docs/rxs/screens/story.md` |
| `ReadingRegion` | `components/rxs/regions/ReadingRegion` | `docs/rxs/screens/story.md` |
| `KnowledgeRegion` | `components/rxs/regions/KnowledgeRegion` | `docs/rxs/screens/story.md` |
| `CompletionRegion` | `components/rxs/regions/CompletionRegion` | `docs/rxs/screens/story.md` |
| `KnowledgeSidebar` | `components/rxs/KnowledgeSidebar` | `docs/rxs/screens/story.md` |
| `StoryHero` | `components/rxs/StoryHero` | `docs/rxs/screens/story.md` |
| `ClaimRegistrySection` | `components/knowledge-library/claims/ClaimRegistrySection` | `docs/rxs/component-philosophy.md` |
| `KnowledgeRenderer` | `components/knowledge-library/core/KnowledgeRenderer` | `docs/rxs/component-philosophy.md` |
| `InvestigationPanel` | `components/knowledge-library/investigation/InvestigationPanel` | `docs/rxs/component-philosophy.md` |
| `VisualNavigation` | `components/knowledge-library/visual/VisualNavigation` | `docs/vxs/visual-spine.md` |
| `VisualGallery` | `components/knowledge-library/visual/VisualGallery` | `docs/vxs/visual-taxonomy.md` |
| `GraphSidebar` | `components/knowledge-library/graph/GraphSidebar` | `docs/rxs/information-architecture.md` |
| `ReadingModeProvider` | `components/knowledge-library/reader/ReadingModeContext` | `docs/rxs/component-philosophy.md` |
| `ReadingModeToggle` | `components/knowledge-library/reader/ReadingModeToggle` | `docs/rxs/story-experience.md` |

### Block Registry (Knowledge Library Chapters)

| Block | Path |
|-------|------|
| `ParagraphBlock` | `components/knowledge-library/blocks/ParagraphBlock` |
| `HeadingBlock` | `components/knowledge-library/blocks/HeadingBlock` |
| `ClaimBlock` | `components/knowledge-library/blocks/ClaimBlock` |
| `EvidenceSummaryBlock` | `components/knowledge-library/blocks/EvidenceSummaryBlock` |
| `ImageBlock` | `components/knowledge-library/blocks/ImageBlock` |
| `MapBlock` | `components/knowledge-library/blocks/MapBlock` |
| `ChartBlock` | `components/knowledge-library/blocks/ChartBlock` |
| `DiagramBlock` | `components/knowledge-library/blocks/DiagramBlock` |
| `TimelineBlock` | `components/knowledge-library/blocks/TimelineBlock` |
| `DocumentBlock` | `components/knowledge-library/blocks/DocumentBlock` |
| `ThinkerBlock` | `components/knowledge-library/blocks/ThinkerBlock` |
| `LearningBlock` | `components/knowledge-library/blocks/LearningBlock` |
| `CalloutBlock` | `components/knowledge-library/blocks/CalloutBlock` |
| `QuoteBlock` | `components/knowledge-library/blocks/QuoteBlock` |
| `ListBlock` | `components/knowledge-library/blocks/ListBlock` |
| `ComparisonBlock` | `components/knowledge-library/blocks/ComparisonBlock` |
| `CounterfactualBlock` | `components/knowledge-library/blocks/CounterfactualBlock` |
| `DecisionMatrixBlock` | `components/knowledge-library/blocks/DecisionMatrixBlock` |
| `HistoriographyBlock` | `components/knowledge-library/blocks/HistoriographyBlock` |
| `RelationshipCardBlock` | `components/knowledge-library/blocks/RelationshipCardBlock` |
| `LicensingPlaceholder` | `components/knowledge-library/blocks/LicensingPlaceholder` |

### Block Registry (Legacy Stories)

| Block | Path |
|-------|------|
| `HeroBlock` | `components/story/blocks/HeroBlock` |
| `TextBlockClient` | `components/story/blocks/TextBlockClient` |
| `ImageBlock` | `components/story/blocks/ImageBlock` |
| `ChartBlock` | `components/story/blocks/ChartBlock` |
| `TimelineBlock` | `components/story/blocks/TimelineBlock` |
| `FAQBlock` | `components/story/blocks/FAQBlock` |
| `CalloutBlock` | `components/story/blocks/CalloutBlock` |
| `EvidenceInlineBlock` | `components/story/blocks/EvidenceInlineBlock` |
| `EvidencePanelBlock` | `components/story/blocks/EvidencePanelBlock` |
| `ConfidenceMeterBlock` | `components/story/blocks/ConfidenceMeterBlock` |
| `ExecutiveSummaryBlock` | `components/story/blocks/ExecutiveSummaryBlock` |
| `KeyNumbersBlock` | `components/story/blocks/KeyNumbersBlock` |
| `SourcesBlock` | `components/story/blocks/SourcesBlock` |
| `ComparisonBlock` | `components/story/blocks/ComparisonBlock` |
| `DatasetReferenceBlock` | `components/story/blocks/DatasetReferenceBlock` |
| `InteractiveTimelineBlock` | `components/story/blocks/InteractiveTimelineBlock` |
| `StorySnapshotBlock` | `components/story/blocks/StorySnapshotBlock` |
| `ChapterHeadingBlock` | `components/story/blocks/ChapterHeadingBlock` |
| `RelatedIntelligenceBlock` | `components/story/blocks/RelatedIntelligenceBlock` |
| `AuthorBoxBlock` | `components/story/blocks/AuthorBoxBlock` |

### Knowledge Library Components

| Component | Path |
|-----------|------|
| `KnowledgeLibraryIndex` | `components/knowledge-library/KnowledgeLibraryIndex` |
| `CollectionLanding` | `components/knowledge-library/CollectionLanding` |
| `VolumePage` | `components/knowledge-library/VolumePage` |
| `ChapterPageShell` | `components/knowledge-library/ChapterPage` |
| `TrustPanel` | `components/knowledge-library/chapter/TrustPanel` |
| `LivingKnowledgeBanner` | `components/knowledge-library/chapter/LivingKnowledgeBanner` |
| `HeroSection` | `components/knowledge-library/chapter/HeroSection` |
| `EvidenceCard` | `components/knowledge-library/evidence/EvidenceCard` |
| `EvidenceBadge` | `components/knowledge-library/evidence/EvidenceBadge` |
| `InlineCitation` | `components/knowledge-library/citations/InlineCitation` |
| `GlossaryHover` | `components/knowledge-library/glossary/GlossaryHover` |
| `SourceCard` | `components/knowledge-library/sources/SourceCard` |

### Homepage Components

| Component | Path |
|-----------|------|
| `TrustBar` | `components/home/trust/TrustBar` |
| `PrimaryPath` | `components/home/primary-path/PrimaryPath` |
| `CollectionsPreview` | `components/home/collections/CollectionsPreview` |
| `Hero` | `components/home/hero/Hero` |
| `KnowledgeToday` | `components/home/breaking/KnowledgeToday` |
| `LatestStories` | `components/home/latest/LatestStories` |
| `TrendingTopics` | `components/home/topics/TrendingTopics` |
| `EntitySpotlight` | `components/home/entities/EntitySpotlight` |
| `KnowledgeGraphPreview` | `components/home/graph/KnowledgeGraphPreview` |
| `DataDashboard` | `components/home/dashboard/DataDashboard` |
| `Newsletter` | `components/home/newsletter/Newsletter` |
| `FeaturedStories` | `components/home/featured/FeaturedStories` |
| `InvestigationsSection` | `components/home/investigations/InvestigationsSection` |
| `Timeline` | `components/home/timeline/Timeline` |
| `TopicExplorer` | `components/home/topics/TopicExplorer` |
| `TheFixSection` | `components/home/fix/TheFixSection` |

### Legacy Story Components

| Component | Path |
|-----------|------|
| `TierSelector` | `components/story/TierSelector` |
| `SourcesList` | `components/story/SourcesList` |
| `NextExploration` | `components/story/NextExploration` |
| `KnowledgeLayer` | `components/story/KnowledgeLayer` |
| `Timeline` | `components/story/Timeline` |
| `TableOfContents` | `components/story/TableOfContents` |
| `ReadingProgress` | `components/story/ReadingProgress` |
| `StoryMeta` | `components/story/StoryMeta` |
| `Evidence` | `components/story/Evidence` |
| `Debate` | `components/story/Debate` |
| `FAQ` | `components/story/FAQ` |
| `Charts` | `components/story/Charts` |
| `Maps` | `components/story/Maps` |
| `Hero` | `components/story/Hero` |
| `Visuals` | `components/story/Visuals` |
| `RelatedStories` | `components/story/RelatedStories` |
| `RelatedEntities` | `components/story/RelatedEntities` |
| `VersionHistory` | `components/story/VersionHistory` |
| `AuthorBox` | `components/story/AuthorBox` |
| `ActionBar` | `components/story/ActionBar` |
| `SaveButton` | `components/story/SaveButton` |
| `ListenButton` | `components/story/ListenButton` |
| `Newsletter` | `components/story/Newsletter` |
| `StorySnapshot` | `components/story/StorySnapshot` |
| `ConfidenceMeter` | `components/story/ConfidenceMeter` |
| `QuickFacts` | `components/story/QuickFacts` |
| `DataCards` | `components/story/DataCards` |
| `ExecutiveSummary` | `components/story/ExecutiveSummary` |
| `PrimarySources` | `components/story/PrimarySources` |
| `StoryImage` | `components/story/StoryImage` |
| `ClaimCard` | `components/story/evidence/ClaimCard` |
| `ConfidenceBadge` | `components/story/evidence/ConfidenceBadge` |
| `EvidenceEngine` | `components/story/evidence/EvidenceEngine` |
| `EvidencePanel` | `components/story/evidence/EvidencePanel` |
| `EvidenceScore` | `components/story/evidence/EvidenceScore` |
| `SourceGroup` | `components/story/evidence/SourceGroup` |
| `VerificationTimeline` | `components/story/evidence/VerificationTimeline` |

---

## Dependencies

| Library | Purpose |
|---------|---------|
| Next.js 15 | Framework |
| React 19 | UI |
| Tailwind CSS | Styling |
| Supabase | Backend (not used by public pages) |
| TypeScript | Type safety |

---

## Build Status

- `npx tsc --noEmit` — clean
- `npm run build` — passes (255 pages)
- No failing tests
