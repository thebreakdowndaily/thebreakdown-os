# The Breakdown — Project Summary

## Architecture
- Next.js 15.5 App Router, Tailwind CSS, TypeScript
- Design system primitives in `components/ui/`: Container, SectionHeader, Badge, Card, Button, Heading, Stack, Grid, Divider, Skeleton
- Design tokens: `#0A0A0A` bg, `#151515` surface, `#D4A843` gold accent, `#22C55E` green, `#F5F5F5` text, `#A1A1AA` secondary, `#2A2A2A` border
- Single view-model assembly per page (no nested data fetching)
- Block-based story page: `StoryBlock<T>` → registry → `<BlockRenderer>`

## Completed Sprints

### Sprint 4 — Design System
- 10 primitives built, 21 files updated, all 4 homepage sections refactored

### Sprint 5 — Data & Intelligence Section
- DataInsights, StatsGrid, StatCard, TrendingList, EvidenceLeaderboard, RecentUpdates

### Sprint 6 — Interactive Timeline
- TimelineSection (client), Timeline, TimelineEvent, TimelineFilters

### Sprint 7.0 — Story Page Foundation
- StoryHero, StoryMeta, ReadingProgress, TableOfContents, SourcesList
- 3 mock stories (mgnrega-reform, digital-payments-boom, pm-fasal-bima-claims)

### Sprint 7.1 — Intelligence Blocks
- `components/story/blocks/types.ts` — typed block interfaces
- 8 blocks: ExecutiveSummaryBlock, EvidencePanelBlock, KeyNumbersBlock, ComparisonBlock, TimelineBlock, FAQBlock, SourcesBlock, RelatedIntelligenceBlock
- `registry.tsx` — `getBlockComponent()` + `BlockRenderer()`
- Removed 14 old component imports from story page
- Story page JS: 21.4 kB → 14.5 kB → **3.65 kB**

### Sprint 7.2 — Evidence Engine
- `components/story/evidence/EvidenceEngine.tsx` — orchestrator (score, counts, verification summary, claim cards)
- `components/story/evidence/VerificationSummary.tsx` — stacked horizontal bar showing true/false/misleading/unverifiable breakdown with per-type counts
- `components/story/evidence/EnhancedClaimCard.tsx` — expandable claim card with citation badge `[N]`, verification badge, source metadata, confidence bar
- `components/story/evidence/ClaimSourceTooltip.tsx` — hover tooltip with source tier color, type, name, URL
- Updated `EvidencePanelData` to include `sources[]` for claim-to-source linking
- Updated `EvidencePanelBlock` to delegate to `EvidenceEngine`
- Updated `storyToBlocks()` to pass assembled sources to evidence block

### Sprint 7.3 — Interactive Storytelling
- `components/story/blocks/InteractiveTimelineBlock.tsx` — zoom controls (All/10yr/5yr), horizontal year-marker track, clickable event nodes with inline expansion, hidden count indicator
- `components/story/blocks/ChartBlock.tsx` — pure SVG line/bar charts with gradient area fill, hover tooltips (value + label), drag-to-zoom range selection on line charts, reset zoom button, responsive viewBox
- `EnhancedClaimCard` enhanced with: CSS grid `0fr→1fr` expand animation, opacity transition, `useId` ARIA attributes (`aria-expanded`/`aria-controls`/`role="region"`), keyboard support, smooth confidence bar animation
- Updated registry to use `InteractiveTimelineBlock` and `ChartBlock`
- Updated `storyToBlocks()` to map `ChartDef[]` into chart blocks

### Sprint 8 — Topic Intelligence Pages
- Extended `TopicJSON` with optional `timeline`, `faq`, `statistics` fields
- Enhanced mock topic data (agriculture & employment) with timelines, FAQs, statistics
- 5 components: TopicOverview, TopicStories, TopicEntities, TopicData, TopicFAQ
- Topic page JS: 1.61 kB → **909 B**

### Sprint 9 — Entity Intelligence Pages
- EntityPageViewModel + 9 components (EntityHero, QuickFacts, EntityTimeline, etc.)
- 3 entity mocks (MGNREGA, MoRD, RBI), 46/46 tests pass

### Sprint 10 — Unified Search
- UnifiedSearchDialog with debounced API fetch, grouped results, keyboard nav
- 7 dialog components, 34/34 tests pass

### Sprint 11 — Knowledge Graph
- ForceGraph (SVG force-directed, 0 deps), GraphMini, TrendingGraphMini
- Full-page `/graph` explorer with search, legend, highlight
- Replaced list-based connections on entity/topic pages with interactive mini graphs

### Sprint 12 — Editorial CMS (Phase 4)
- Unified `utils/cms-store.ts` — singleton data store for stories, topics, entities, timelines, fixes, media, users, revisions, activity
- CMS layout with tabbed navigation: Dashboard, Stories, Topics, Entities, Timelines, The Fix, Media
- **Dashboard** — stat cards (drafts/review/published/topics/entities/timelines/fixes/media counts), recent activity feed, content status bar with workflow visualization
- **Story Editor** — 12 block types with drag-and-drop reorder, preview mode, auto-save, version history with restore
- **Topic Manager** — CRUD with inline FAQ editor, auto-slug generation
- **Entity Manager** — CRUD with type selection (9 entity types), alias management
- **Timeline Editor** — CRUD with dynamic event list (date, title, description per event)
- **The Fix Editor** — structured field form: problem, root causes, existing solutions, global examples, recommended actions, citizen actions, government actions, metrics
- **Media Library** — grid view with type/size/dimensions metadata, add/edit form, tag management
- **Editorial Workflow** — status transitions (draft→review→published) with `canTransition()` guard
- **Version History** — per-story revision snapshots, list with restore button
- **User Roles** — 5 roles (admin, editor, writer, researcher, designer) with seed users
- **Persistence** — in-memory store ready to swap to API backend
- All pages: 46/46 build, 0 errors. CMS JS: ~18 kB total for all manager pages

### Sprint 13 — The Breakdown OS (Phase 5)

**Architecture transformation** — domain-driven design replacing flat utilities:

```
thebreakdown-os/
├── types/canonical.ts         ← Single source of truth (Story, Topic, Entity, Fix, Timeline, Media, User, Graph, Search, Events, ViewModels, API, Analytics)
├── services/                  ← Domain services with Memory* implementations
│   ├── registry.ts            ← Service locator (initServices/getServices singleton)
│   ├── init.ts                ← initDefaultServices() wiring all Memory* services
│   ├── stories/service.ts     ← StoryService + MemoryStoryService
│   ├── topics/service.ts      ← TopicService + MemoryTopicService
│   ├── entities/service.ts    ← EntityService + getEntitiesByType + findByAlias
│   ├── timelines/service.ts   ← TimelineService + MemoryTimelineService
│   ├── fixes/service.ts       ← FixService + MemoryFixService
│   ├── media/service.ts       ← MediaService + getMediaByTags
│   ├── search/service.ts      ← SearchService — scored full-text index, rebuild()
│   └── analytics/service.ts   ← track(), getDashboardStats()
├── features/                  ← Business features (not UI components)
│   ├── home/view-model.ts     ← buildHomepage(services) → PageSection[]
│   ├── story/view-model.ts    ← buildStoryPage(services, slug)
│   ├── topic/view-model.ts
│   ├── entity/view-model.ts
│   ├── search/view-model.ts
│   ├── cms/view-model.ts
│   ├── ai/editorial.ts        ← EditorialAI (6 methods: headline suggestions, entity discovery, source gap detection, FAQ generation, unsupported claim flags, timeline suggestions)
│   ├── ai/reader.ts           ← ReaderAI (5 methods: simplify, extract verified claims, summarize, compare policies, timeline summary)
│   └── workspace/view-model.ts ← buildWorkspace(services, slug)
├── lib/
│   ├── events/event-bus.ts    ← Typed pub/sub — 20 event types, 500-event history, wildcard support
│   ├── graph/graphService.ts  ← GraphService — build(), getConnections() (BFS), getPath(), getTrending()
│   ├── bootstrap.ts           ← bootstrapServices() — idempotent init from existing store
│   └── init-wrapper.tsx       ← useServices() hook + ServicesProvider for client components
└── app/api/v1/                ← 14 versioned REST endpoints
    ├── stories/               ← GET/POST list, GET/PUT/DELETE by slug
    ├── topics/
    ├── entities/
    ├── timelines/
    ├── fixes/
    ├── media/
    ├── search/                ← ?q=&type= grouped results
    └── analytics/             ← Dashboard stats
```

**AI Layer** — Editorial and Reader intelligence built on structured data:
- `EditorialAI` — suggestHeadlines(), suggestMissingEntities(), detectSourceGaps(), suggestFAQs(), flagUnsupportedClaims(), suggestTimelineEvents()
- `ReaderAI` — simplify() (3 audiences), extractVerifiedClaims(), summarize(), comparePolicies(), timelineSummary()
- Zero LLM dependencies — all deterministic, graph-powered suggestion engines

**Knowledge Graph v2** — `GraphService` class:
- `build()` — iterates all stories/topics/entities/timelines/fixes → typed nodes + edges
- `getConnections()` — BFS traversal with max depth and relation filter
- `getPath()` — BFS shortest-path between any two nodes
- `getTrending()` — highest-confidence connections

**Event System** — `EventBus` singleton:
- 20 typed event types (story:created/published/updated/deleted, topic:*, entity:*, timeline:*, fix:*, media:*, search:indexed, graph:updated)
- `subscribe(type | '*', handler)` returns unsubscribe
- `publish(event)` dispatches to type-specific + wildcard handlers
- 500-event rotating history

**Research Workspace** (`/workspace`) — power-user screen:
- Search bar to load any story by slug
- Split-pane: story panel (40%) + knowledge graph (60%)
- 6 AI intelligence cards: headlines, entity suggestions, source gaps, FAQs, simplified summary, timeline narrative
- Claims with confidence badges, sources with tier badges, ForceGraph visualization
- 12.6 kB JS

### Sprint 14 — Deployment & Audit (Phase 6)
- **Static deployment** — `scripts/deploy-static.ps1` extracts pre-rendered HTML from `.next/server/app/`, creates directory-based clean URLs (`path/index.html`), copies `_next/static/` and `public/`, generates minimal `_redirects` + `_routes.json`.
- **Live at thebreakdown.in** — 54 static pages serving 200, deployed via `wrangler pages deploy`. Cloudflare free plan 3 MiB Worker limit forces static-only approach.
- **`generateStaticParams` added** to `fix/[slug]/`, `dataset/[slug]/`, `datasets/[slug]/` for full static generation.
- **Topic mock data**: 2→6 (economy, technology, policy, agriculture, employment, digital-payments)
- **Organization mock data**: 2→5 (ministry-of-rural-development, rbi, npci, ministry-of-agriculture, cag)
- **Auth lazy Proxy fix** in `features/auth/auth-client.ts` unblocks static generation.
- **`next.config.js`** `images.unoptimized: true` set.
- **GitHub Actions** `.github/workflows/deploy.yml` created (needs repo secrets).
- **Placeholder images** — 15 images downloaded via placehold.co for `authors/` (1), `entities/` (8), `topics/` (6) with dark-theme styling.
- **`_not-found` route** — deploy script creates both `404.html` and `_not-found/index.html`.
- **Broken link audit** — fixed 15+ hardcoded links in 7 components (Footer, Header, Navigation, MobileMenu, SubscribeButton, EntityLayout, DataInsights, TopicExplorer) pointing to non-existent pages.
- **Build**: 86/86 pages, 0 errors. 19/19 routes verified 200 on live site.

## Build Status
- 129 routes, 0 errors (15 story SSG + 12 topic SSG + 12 entity SSG + 2 country SSG + 5 organization SSG + 6 fix SSG + 5 dataset SSG + 30 API v1 + 12 API legacy + 14 CMS + 16 static + ...)

## View-Model Refactoring (Sprint 15)
**4 of 4 main content pages refactored** to consume canonical services + view models:

| Page | Before | After | Key Change |
|------|--------|-------|------------|
| `/` (homepage) | `mockHomepageData` + old store | `bootstrapServices()` + `buildHomepage(services)` | Removed `utils/website-builder` dep |
| `/story/[slug]` | 12 inline mock stories + SectionRenderer + 16 legacy components | `bootstrapServices()` + `buildStoryPage()` + `BlockRenderer` | Removed 1.2 kB mock data; uses block system |
| `/topic/[slug]` | 12 inline mock topics + `buildTopic()` | `bootstrapServices()` + `buildTopicPage()` | Removed 12 kB inline mock data |
| `/entity/[slug]` | 3 inline mock entities + `buildEntity()` | `bootstrapServices()` + `buildEntityPage()` | Removed inline mock data |

**Data layer fixes during refactoring:**
- `lib/mappers/to-api-types.ts` — canonical→API type mappers (`storyToAPIStory`, `fixToAPIFix`, `topicToAPITopic`)
- `lib/bootstrap.ts` — fixed `apiStoryToCanonical` to properly map `relatedStoryIds`, `author`, `relatedEntityIds`, `relatedTopicIds`; fixed evidence block claim mapping to `StoryClaim` format
- **Ripple bug fixes**: `relatedStoryIds` was `undefined` (missing mapping from old `relatedStories`); `supportingEvidence` was `undefined` on claims (evidence block expected `StoryClaim` format but got raw `APIClaim` data); `author` was an object instead of string
- 0 regressions: 129/129 pages build successfully

**Remaining (not refactored, but functional):**
- `/fix/[slug]` — uses `buildFix()` + old store (no view model in `features/fix/`)
- `/organization/[slug]` — inline mock data + Sprint 9 components
- `/country/[slug]` — inline mock data + Sprint 9 components
- `/search` — dynamic, uses `semanticSearch` engine

## Next Steps
1. ✅ Homepage, Story, Topic, Entity pages refactored to view models
2. ✅ Fix page refactored — uses `bootstrapServices()` + `services.fixes.getFixBySlug()` + `toFixJSON()` mapper (bypasses canonical Fix reduced model via `_raw` field in `apiFixToCanonical`)
3. ⬜ Organization/Country pages — consolidate with entity page or refactor Sprint 9 components
4. ⬜ Search page — migrate from `semanticSearch` to `services.search.search()`
5. Connect CMS store to real API backend + database
6. Production data layer: sync CMS ↔ public data store
7. Replace placeholder images with real editorial photography
8. Set GitHub repo secrets for CI/CD auto-deploy

## Recent Additions
- **Sprint 16 — Investigative Stories & SEO**: Researched and built 2 high-impact investigative stories — 81.5 Crore Aadhaar Data Breach (story27) and BJP Mission 360 (story28) — with full timeline, evidence-scored claims, charts, FAQ, and 5 sources each. Added 4 cybersecurity entities (ICMR, CERT-In, UIDAI, Resecurity) and `cybersecurity` topic. Wired orphaned stories 22-26 into store and topics. Fixed `relatedTopicIds` mapping bug in `apiStoryToCanonical`. SEO enhancements: `heroImage` on both stories for OG/Twitter/schema images, `relatedTopicIds` for cross-linking, comprehensive sitemap (117 URLs). Added `InvestigationsSection` homepage component to surface high-evidence stories (>= 90%) that would otherwise be buried by newer-dated content. 207/207 pages, 0 errors.

## Key Files
- `types/canonical.ts` — canonical data models (the single source of truth)
- `services/registry.ts` — service locator pattern
- `services/init.ts` — default service initialization
- `services/*/service.ts` — 8 domain services with Memory implementations
- `features/*/view-model.ts` — 6 view model builders
- `features/ai/editorial.ts` — Editorial AI (6 suggestion engines)
- `features/ai/reader.ts` — Reader AI (5 reading modes)
- `features/workspace/view-model.ts` — workspace assembler
- `lib/events/event-bus.ts` — typed pub/sub event system
- `lib/graph/graphService.ts` — knowledge graph v2 service
- `lib/bootstrap.ts` — idempotent service bootstrap
- `app/workspace/page.tsx` — research workspace
- `app/api/v1/` — 14 versioned API route handlers
