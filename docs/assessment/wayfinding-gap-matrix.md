# Wayfinding Gap Matrix

An inventory of orientation, navigation, and wayfinding across all reader-facing surfaces. Used to plan Wave 2.

## Scoring

- **✅ Present** — works correctly
- **⚠️ Partial** — exists but has known issues
- **❌ Missing** — does not exist
- **n/a** — not applicable to this surface

## Surface Audit

### 1. Homepage (`/`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Identity signal | ✅ | InstitutionHero: "Evidence-first Knowledge Platform" badge, emerald gradient |
| Entry point ("Start Here") | ✅ | PrimaryPath: "The Canonical Learning Path", emerald CTA |
| Scroll segmentation | ✅ | "Continue Your Learning" / "Further Reading" transition labels |
| Breadcrumbs | n/a | Homepage — correct to omit |
| Trust metrics (viewport 1) | ✅ | TrustBar: chapters, claims, sources, last verified |
| "How We Work" → /methodology | ✅ | InstitutionHero CTA |
| "Begin with Volume I" | ✅ | InstitutionHero CTA |
| Outbound to Knowledge Graph | ❌ | KnowledgeGraphPreview is decorative — no link to `/graph` |
| Newsletter form functional | ❌ | Placeholder only |
| Header nav | ✅ | Navigation component |
| Footer nav | ✅ | Present |
| Search | ✅ | SearchDialog in header |

### 2. Collection Landing (`/series/[collectionSlug]`)

| Capability | Status | Notes |
|-----------|--------|-------|
| "Back to Library" | ✅ | Top-left link → `/series` |
| Breadcrumbs | ❌ | Absent; could show Home > Library > Collection |
| Volume X of Y indicator | ❌ | No "Volume 1 of N in Collection" |
| Collection trust score | ✅ | Shown in header |
| Methodology / Constitution links | ✅ | In header |
| Continue Learning guidance | ❌ | No "Next: Volume 2" or suggested order |
| Volume-level progress | ❌ | No chapter completion tracking |

### 3. Volume Page (`/series/[collectionSlug]/volume/[volumeSlug]`)

| Capability | Status | Notes |
|-----------|--------|-------|
| "Back to {slug}" | ⚠️ | Shows raw `collectionSlug` (e.g., "Back to foundations-1947-1962"), not human-readable title |
| Breadcrumbs | ❌ | Absent; could show Home > Library > Collection > Volume |
| Chapter list | ✅ | Present with status badges, freshness, chapter-level stats |
| Chapter X of Y in Volume | ❌ | Not indicated |
| Volume-level progress | ❌ | No overall completion bar |
| Continue Learning | ❌ | No "Next Chapter" after last chapter |
| Freshness indicator | ✅ | "Current"/"Recent"/"Stale" badge |

### 4. Chapter Page (`/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]`)

| Capability | Status | Notes |
|-----------|--------|-------|
| TOC / "On This Page" | ✅ | ReaderOrientation — live scroll tracking, progress label |
| "Back to Volume" | ✅ | In StoryHero (top) and LearningFooter (bottom) |
| Reading progress bar | ✅ | In ReaderOrientation (scroll-based) |
| Reading mode toggle | ✅ | StoryProgress component |
| Knowledge Profile | ✅ | KnowledgeSidebar — claims, evidence, thinkers, sources, glossary |
| Evidence coverage % | ✅ | KnowledgeSidebar progress bar |
| Continue Learning | ⚠️ | KnowledgeSidebar shows "Chapter 2 coming soon" (placeholder) |
| Living Knowledge banner | ❌ | LivingKnowledgeBanner exists but is not imported |
| Trust Panel | ❌ | TrustPanel exists but is not imported |
| Unused components | ⚠️ | StoryProgressBar, StoryContent, HeroSection, TrustPanel, LivingKnowledgeBanner all unused |

### 5. Entity Detail (`/entity/[slug]`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ✅ | Home > Intelligence Terminal > Entity Name |
| Breadcrumb label mismatch | ⚠️ | "Intelligence Terminal" links to `/entities`, but list page /entities has no breadcrumbs |
| Relationship map | ✅ | RelatedEntities / RelationshipGrid / KnowledgeGraph (EntityTerminal) |
| Related Stories | ✅ | In EntityTerminal |
| Collection/Volume context | ❌ | No "Appears in Chapter X of Volume Y" |
| Continue Learning guidance | ❌ | No "Next Entity" or "Related Topic" path |
| SEO metadata | ✅ | generateMetadata |

### 6. Topic Detail (`/topic/[slug]`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ✅ | From `vm.breadcrumbs` — Home > Topics > Topic Name |
| Knowledge Graph preview | ✅ | TopicGraphSection in sidebar |
| "Expand Graph" button | ❌ | Broken — no `onClick` handler |
| Related stories | ✅ | Story cards |
| Related entities | ✅ | Entity cards or CountryGrid/OrganizationGrid |
| Next/Related Topics | ❌ | No onward navigation |
| SEO metadata | ✅ | generateMetadata |

### 7. Knowledge Graph (`/graph`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ❌ | Orphan page — no breadcrumbs |
| Header nav link | ❌ | No link to `/graph` in Navigation |
| Footer nav link | ❌ | No link to `/graph` in footer |
| SEO metadata | ❌ | Client component — no generateMetadata |
| Graph interactivity | ⚠️ | Nodes render but cannot navigate to entity/story pages |
| RelationshipPanel shows slug | ⚠️ | Shows slug but no link |
| Error recovery link | ❌ | Error state has no link back to a known surface |
| Back link | ❌ | No "Back to Home" or "Browse Library" |

### 8. Entity List (`/entities`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ❌ | Absent; could show Home > Entities |
| "Back" link | ❌ | No return navigation |
| Guidance text | ✅ | "Policies, organizations, schemes, and key institutions tracked by The Breakdown" |
| Filter/Sort | ❌ | None |
| SEO metadata | ✅ | generateMetadata |
| Continue Learning | ❌ | No suggested first entity |

### 9. Topic List (`/topics`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ❌ | Absent; could show Home > Topics |
| "Back" link | ❌ | No return navigation |
| Guidance text | ✅ | "Explore data-driven coverage across key areas" |
| SEO metadata | ✅ | generateMetadata |

### 10. Story List (`/stories`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ❌ | Absent; could show Home > Stories |
| Guidance text | ✅ | "All data-driven investigations and analyses" |
| SEO metadata | ✅ | generateMetadata |
| Sort by | ✅ | Default sort: publishedAt desc |
| Continue Learning | ❌ | No suggested first story |

### 11. Story Detail (`/story/[slug]`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ❌ | Absent |
| "Back to Stories" | ❌ | No return link |
| Related content | ⚠️ | Depends on story implementation (frozen for new features per AGENTS.md) |

### 12. Search (`/search`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ❌ | Absent; could show Home > Search |
| Knowledge Spotlight | ✅ | Featured result when applicable |
| Knowledge Graph Suggestions | ✅ | In sidebar |
| Filter sidebar | ✅ | Type filter |
| Empty state guidance | ❌ | Empty state says "No results" but no browse suggestions or links to popular topics |
| SEO metadata | ✅ | generateMetadata |

### 13. Data Hub (`/data`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ❌ | Absent; could show Home > Data Hub |
| Featured datasets | ✅ | Present with cards |
| Charts & visualizations | ✅ | Present |
| Download links | ✅ | Present |
| Continue Learning | ❌ | No context linking to collections/volumes/stories |
| Collection/Volume context | ❌ | No connection to broader knowledge structure |

### 14. Fix List (`/fix`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ❌ | Absent; could show Home > The Fix |
| Identity badge | ✅ | "The Fix" emerald badge |
| Guidance text | ✅ | "Not just what's wrong. What would fix it." |
| Filter/Tag | ❌ | None |
| Continue Learning | ❌ | No suggested order |

### 15. Fix Detail (`/fix/[slug]`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ✅ | Via FixLayout: Home > The Fix > Headline |
| Related fixes | ❌ | No "Next Fix" or "Related Fix" |
| Continue Learning | ❌ | No onward path |

### 16. Investigations List (`/investigations`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ❌ | Absent; could show Home > Investigations |
| Guidance text | ✅ | "In-depth data-driven investigations" |
| Continue Learning | ❌ | No suggested first investigation |

### 17. Investigation Detail (`/investigation/[slug]`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Breadcrumbs | ❌ | Absent |
| "Back to Investigations" | ❌ | No return link |
| Chapter list | ✅ | Chapters shown in hero |
| Continue Learning | ❌ | No "Next Chapter" guidance |

### 18. Founding Edition (`/founding-edition`)

| Capability | Status | Notes |
|-----------|--------|-------|
| Included items grid | ✅ | All 6 founding documents listed with links |
| Roadmap | ✅ | v1.1, v1.2, v2.0 outlined |
| Breadcrumbs | ❌ | Absent; could show Home > Founding Edition |
| SEO metadata | ✅ | Present |

## Inventory of Existing Orientation Capabilities

### In use:
| Component | Location | Status |
|-----------|----------|--------|
| `ReaderOrientation` (TOC + scroll progress) | Chapter pages via StoryShell | Active |
| `StoryHero` (Back to Volume, status, version) | Chapter pages via StoryShell | Active |
| `StoryShell` (orchestrator) | Chapter pages | Active |
| `KnowledgeSidebar` (profile, progress, continue) | Chapter pages via StoryShell | Active |
| `LearningFooter` (review, feedback, back to volume) | Chapter pages via StoryShell | Active |
| `Breadcrumbs` (generic component) | Entity detail, topic detail, fix detail | Used on 3 surfaces |
| `CollectionLanding` (Back to Library) | Collection landing | Active |
| `VolumePage` (Back to {slug}) | Volume pages | Active |
| `Navigation` (DesktopMenu/MobileMenu) | All pages via layout | Active |
| `Footer` | All pages | Active |
| `SearchDialog` | Header | Active |
| `PrimaryPath` | Homepage | Active |
| `CollectionsPreview` → "Continue Your Learning" | Homepage | Active |
| `LatestStories` → "Further Reading" | Homepage | Active |
| `InstitutionHero` (identity + CTAs) | Homepage | Active |
| `TrustBar` (metrics) | Homepage | Active |
| `KnowledgeGraphPreview` (decorative) | Homepage | Active — no outbound link |

### Unused / Disconnected:
| Component | Location | Why unused |
|-----------|----------|------------|
| `Breadcrumbs` | `components/ui/Breadcrumbs.tsx` | Only used on 3 of ~18 surfaces |
| `HeroSection` | `components/knowledge-library/chapter/` | Not imported anywhere — StoryHero used instead |
| `TrustPanel` | `components/knowledge-library/chapter/` | Not imported anywhere — KnowledgeSidebar used instead |
| `LivingKnowledgeBanner` | `components/knowledge-library/chapter/` | Not imported anywhere |
| `StoryContent` | `components/rxs/StoryContent.tsx` | Not imported — StoryShell uses KnowledgeRenderer directly |
| `StoryProgressBar` | `components/rxs/StoryProgress.tsx` | Exported but never mounted on any page |
| `StoryProgress` | Same file | Used only for ReadingModeToggle (not progress tracking) |
| `EntitySpotlight` | `components/home/entities/` | On homepage but decorative — no outbound link |
| `KnowledgeGraphPreview` | `components/home/graph/` | On homepage but no CTA to /graph |
| `TopicGraphSection` "Expand Graph" | Topic sidebar | Button exists but has no onClick handler |

## Unused Component Details

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| `Breadcrumbs` | `components/ui/Breadcrumbs.tsx` | 47 | Generic breadcrumb nav |
| `HeroSection` | `components/knowledge-library/chapter/HeroSection.tsx` | 89 | Alternative chapter hero with Six Questions |
| `TrustPanel` | `components/knowledge-library/chapter/TrustPanel.tsx` | 68 | Knowledge profile with stats grid |
| `LivingKnowledgeBanner` | `components/knowledge-library/chapter/LivingKnowledgeBanner.tsx` | 32 | Versioning/corrections banner |
| `StoryContent` | `components/rxs/StoryContent.tsx` | 108 | Standalone content renderer |
| `StoryProgressBar` | `components/rxs/StoryProgress.tsx` | 23 | Progress bar component (exported but not mounted) |

## Broken Navigation

| Issue | Surface | Evidence |
|-------|---------|----------|
| KnowledgeGraphPreview no outbound link | Homepage | SVG-only, no `<Link>` or `<a>` to /graph |
| "Expand Graph" broken | Topic detail | Button present but no onClick handler |
| Graph nodes not navigable | /graph | Nodes are SVG elements without links |
| "Back to {slug}" shows raw slug | Volume page | VolumePage.tsx:24 — uses raw `collectionSlug` |
| Entity breadcrumbs: label vs destination mismatch | Entity detail | "Intelligence Terminal" label links to /entities but /entities has no breadcrumbs |
| KnowledgeSidebar progress bar always 0% | Chapter page | Progress bar hardcoded to `0%`, never receives reading position |
| Newsletter placeholder | Homepage | Form fields exist but no submission handler |

## Priority Gaps by Reader Impact

### P0 — Reader loses context entirely (must use Back button)
| Surface | Gap |
|---------|-----|
| `/graph` | No breadcrumbs, no nav links, no back link, no SEO, error state has no recovery |
| `/investigation/[slug]` | No breadcrumbs, no back link |
| `/story/[slug]` | No breadcrumbs, no back link |
| `/investigations` | No breadcrumbs |
| `/stories` | No breadcrumbs |
| `/entities` | No breadcrumbs |
| `/fix` | No breadcrumbs |

### P1 — Reader finds surface but lacks onward path
| Surface | Gap |
|---------|-----|
| Collection landing | No "Next Volume" or volume progress |
| Volume page | Raw slug in back link, no chapter progression tracking |
| Topic detail | "Expand Graph" broken |
| Search (empty) | No browse suggestions |
| Chapter page | KnowledgeSidebar "Chapter 2 coming soon" is placeholder |
| `/graph` | Graph not navigable — nodes don't link to entities/stories |
| `/data` | No context linking to collections/volumes |

### P2 — Polish / consistency
| Surface | Gap |
|---------|-----|
| Homepage | KnowledgeGraphPreview decorative, no link to /graph |
| Entity breadcrumbs | "Intelligence Terminal" label mismatch |
| Collections list (`/series`) | No breadcrumbs |
| Founding Edition | No breadcrumbs |
| All list pages | No guidance for what to read first |
