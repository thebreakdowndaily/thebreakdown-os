# P1A — Publication Lifecycle Safety Foundation: Completion Report

## Summary

Implemented a centralized, fail-closed publication lifecycle. No story becomes publicly visible unless the publication architecture explicitly permits it.

## Core Principle

**Missing or ambiguous metadata = NOT public.** Every public surface (page, metadata, sitemap, RSS, search, related stories, homepage) now consults the centralized publication policy.

## What Was Built

### 1. Type System
- **`PublicationStatus` type** added to `utils/data-layer/types.ts`: `draft | review | scheduled | published | archived`
- **`publicationStatus` field** added to `APIStory` and canonical `Story` type
- `Story.status` (editorial) is now derived from `publicationStatus` in `apiStoryToCanonical`

### 2. Centralized Publication Policy (`lib/story/publication.ts`)
Single source of truth for visibility decisions:
- `isPubliclyPublished(ctx, now)` — core predicate (fail-closed)
- `canPubliclyViewStory(ctx, now)` — alias
- `shouldIndexStory(ctx, now)` — search gate
- `shouldIncludeInFeed(ctx, now)` — RSS gate
- `shouldIncludeInDiscovery(ctx, now)` — homepage/discovery gate
- `diagnosePublication(slug, ctx, now)` — diagnostic for debugging
- `storyPublicationContext(story)` — extracts context from canonical Story
- `isCanonicalStoryPublic(story, now)` — convenience wrapper

### 3. Legacy Visibility Manifest (`utils/data-layer/store.ts`)
- `LEGACY_PUBLIC_SLUGS` — explicit allowlist of 39 stories with past `publishedAt` dates
- `getPublicStories(params)` — returns only public stories (new policy + legacy allowlist)
- `getPublicStory(slug)` — returns one public story or null
- `getPublicStoryDiagnostics()` — full diagnostic for every story
- 4 future-dated stories (`ration-digitization`, `anganwadi-icds`, `supply-chain-shift`, `ethanol-backlash`) explicitly set to `publicationStatus: 'draft'`

### 4. apiStoryToCanonical Fix (`lib/bootstrap.ts`)
- Removed hard-coded `status: 'published'` — now derives canonical status from `publicationStatus`
- `publicationStatus` propagated to canonical `Story`

### 5. Service Layer
Added `getPublicStories()` and `getPublicStoryBySlug()` to:
- `services/interfaces/story.ts` (interface)
- `services/repositories/memory/story.ts` (MemoryStoryService)
- `services/repositories/supabase/story.ts` (SupabaseStoryRepository)
- `services/stories/canonical-repository.ts` (CanonicalStoryService)

### 6. `bootstrapServices()` Public Gate
- Added `options?: { publicOnly?: boolean }` parameter
- Public-facing routes pass `{ publicOnly: true }` → search index contains only public stories
- CMS/workspace/API routes use default (all stories)

## Public Surfaces Gated

| Surface | File | Gate Mechanism |
|---------|------|----------------|
| `/story/[slug]` page | `app/story/[slug]/page.tsx` | `getPublicStoryBySlug` → `notFound()` |
| `generateMetadata` | `app/story/[slug]/page.tsx` | Returns "Story Not Found" for non-public |
| `generateStaticParams` | `app/story/[slug]/page.tsx` | `getPublicStories()` |
| Sitemap | `app/sitemap.ts` | `getPublicStories()` |
| RSS | `app/rss/route.ts` | `getPublicStories()` |
| Search index | `lib/bootstrap.ts` | `bootstrapServices({ publicOnly: true })` |
| Homepage | `app/page.tsx` + `features/home/view-model.ts` | `getPublicStories()` / `{ publicOnly: true }` |
| Stories listing | `app/stories/page.tsx` | `getPublicStories()` |
| Topic detail | `services/topics/pipeline/stories.ts` | `canPubliclyViewStory` filter |
| Entity detail | `features/entity/view-model.ts` | `canPubliclyViewStory` filter |
| Timeline | `app/timeline/page.tsx` | `getPublicStories()` |
| Team page | `app/about/team/page.tsx` | `getPublicStories()` |
| Search page | `app/search/page.tsx` | `{ publicOnly: true }` |
| Graph explorer | `app/graph/page.tsx` | `{ publicOnly: true }` |
| Investigations | `app/investigations/page.tsx` | `{ publicOnly: true }` |
| Country/Org pages | `app/country/[slug]/page.tsx`, `app/organization/[slug]/page.tsx` | `{ publicOnly: true }` |
| Fix pages | `app/fix/[slug]/page.tsx` | `{ publicOnly: true }` |
| Investigation detail | `app/investigation/[slug]/page.tsx` | `{ publicOnly: true }` |

## Internal Surfaces (NOT gated — correct)
CMS, workspace, editorial dashboard, API `/api/stories`, `/api/v1/stories` — all retain full access.

## Test Results

**66/66 publication policy tests pass** (`tests/publication-policy.test.ts`):
- Core predicate: missing status, draft, review, archived, scheduled, published+past, published+future, published+missing, published+invalid
- Derived predicates: canPubliclyViewStory, shouldIndexStory, shouldIncludeInFeed, shouldIncludeInDiscovery
- Canonical Story helpers: storyPublicationContext, isCanonicalStoryPublic
- Diagnostics: diagnosePublication for all states
- Store integration: getPublicStories, getPublicStory, getPublicStoryDiagnostics
- Boundary tests: exactly-at-NOW, 1ms-after-NOW, empty context, scheduled+valid

## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ Clean (0 new errors; 1 pre-existing `s.url` in bootstrap.ts) |
| `npm test` | ✅ 26/26 auth tests pass |
| `npm run build` | ✅ Builds successfully (253 pages) |
| Publication tests | ✅ 66/66 pass |

## Files Changed

| File | Change |
|------|--------|
| `utils/data-layer/types.ts` | Added `PublicationStatus` type + `publicationStatus` to `APIStory` |
| `types/canonical.ts` | Added `PublicationStatus` type + `publicationStatus` to `Story` |
| `lib/story/publication.ts` | **NEW** — centralized publication policy |
| `utils/data-layer/store.ts` | Added `LEGACY_PUBLIC_SLUGS`, `getPublicStories`, `getPublicStory`, `getPublicStoryDiagnostics` |
| `lib/bootstrap.ts` | Fixed `apiStoryToCanonical` + `bootstrapServices({ publicOnly })` |
| `services/interfaces/story.ts` | Added `getPublicStories`, `getPublicStoryBySlug` |
| `services/repositories/memory/story.ts` | Implemented public methods |
| `services/repositories/supabase/story.ts` | Implemented public methods |
| `services/stories/canonical-repository.ts` | Implemented public methods |
| `services/topics/pipeline/stories.ts` | Added `canPubliclyViewStory` filter |
| `features/story/view-model.ts` | Uses `getPublicStoryBySlug` |
| `features/home/view-model.ts` | Uses `getPublicStories` |
| `features/entity/view-model.ts` | Added `canPubliclyViewStory` filter |
| `app/story/[slug]/page.tsx` | All calls use `{ publicOnly: true }` + `getPublicStories` |
| `app/sitemap.ts` | Uses `getPublicStories` |
| `app/rss/route.ts` | Uses `getPublicStories` |
| `app/stories/page.tsx` | Uses `getPublicStories` |
| `app/timeline/page.tsx` | Uses `getPublicStories` + `{ publicOnly: true }` |
| `app/about/team/page.tsx` | Uses `getPublicStories` |
| `app/page.tsx` | Uses `{ publicOnly: true }` |
| `app/search/page.tsx` | Uses `{ publicOnly: true }` |
| `app/graph/page.tsx` | Uses `{ publicOnly: true }` |
| `app/topic/[slug]/page.tsx` | Uses `{ publicOnly: true }` |
| `app/entity/[slug]/page.tsx` | Uses `{ publicOnly: true }` |
| `app/fix/[slug]/page.tsx` | Uses `{ publicOnly: true }` |
| `app/investigation/[slug]/page.tsx` | Uses `{ publicOnly: true }` |
| `app/investigations/page.tsx` | Uses `{ publicOnly: true }` |
| `app/country/[slug]/page.tsx` | Uses `{ publicOnly: true }` |
| `app/organization/[slug]/page.tsx` | Uses `{ publicOnly: true }` |
| `app/api/search/route.ts` | Uses `{ publicOnly: true }` |
| `tests/publication-policy.test.ts` | **NEW** — 66 behavioral tests |
