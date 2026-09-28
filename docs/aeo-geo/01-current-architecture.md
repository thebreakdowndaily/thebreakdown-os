# Current Architecture — AEO/GEO Audit

## Stack Confirmed

| Component | Version | Confirmed |
|-----------|---------|-----------|
| Next.js | ^15.5.18 | ✅ |
| React | ^19.2.7 | ✅ |
| TypeScript | ^5.5.0 | ✅ |
| Tailwind CSS | ^3.4.0 | ✅ |
| Supabase (SSR) | ^0.12.0 | ✅ |
| Sentry | ^10.63.0 | ✅ |
| App Router | Yes | ✅ |
| Server Components | Yes (default) | ✅ |
| ISR (revalidate) | Yes (`revalidate = 60` on story) | ✅ |

---

## Route Map

### Public / Indexable Routes

| Route | Description | JSON-LD | Metadata |
|-------|-------------|---------|----------|
| `/` | Homepage | WebSite + Organization | ✅ (layout) |
| `/story/[slug]` | Story page | NewsArticle + Breadcrumb + FAQPage | ✅ |
| `/entity/[slug]` | Entity terminal | Thing/Organization/Person + Breadcrumb | ✅ |
| `/topic/[slug]` | Topic page | — | ✅ partial |
| `/series/[collectionSlug]` | Collection | — | ✅ partial |
| `/series/[collectionSlug]/volume/[volumeSlug]` | Volume | — | ✅ partial |
| `/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]` | Chapter | NewsArticle + Breadcrumb | ✅ |
| `/fix/[slug]` | Fix page | — | ✅ partial |
| `/founding-edition` | Launch page | — | ✅ |
| `/methodology` | Methodology | — | None found |
| `/trust` | Trust centre | — | None found |
| `/editorial-constitution` | Editorial doc | — | None found |
| `/data` | Data index | — | None found |
| `/datasets` | Datasets | — | None found |
| `/investigation/[slug]` | Investigation | — | ✅ |
| `/trackers/*` | Trackers (MGNREGA, UPI, PMFBY, Semiconductor) | SpecialAnnouncement / CollectionPage | ✅ partial |
| `/about` | About page | — | Unknown |
| `/countries` | Countries | — | None found |
| `/organizations` | Organizations | — | None found |

### Disallowed / Internal Routes

| Route | Status |
|-------|--------|
| `/admin`, `/cms`, `/editorial`, `/dashboard` | Correctly disallowed |
| `/workspace`, `/newsroom`, `/editor` | Correctly disallowed |
| `/api/*` | Correctly disallowed |
| `/search` | Disallowed (intentional — internal tool) |
| `/graph`, `/explorer` | Disallowed |
| `/problems`, `/evolution`, `/precedents`, `/tracking` | Disallowed (deprecated) |

---

## Content Model

### Primary Content Types

**`Story`** (`types/canonical.ts:122`)
- Fields: id, title, slug, headline, summary, heroImage, author (string), category (string), storyType, status, publicationStatus, publishedAt, updatedAt, createdAt, tags[], blocks[], sources[], claims[], timeline[], faq[], charts[], relatedStoryIds[], relatedEntityIds[], relatedTopicIds[]
- AEO fields: ❌ `answerSummary` MISSING, ❌ `executiveAnswer` MISSING, ❌ `keyFacts` (structured) MISSING
- Corrections: ⚠️ `versionHistory` exists as `{ date, description }[]` but no formal `Correction` type

**`TBSStory`** (`types/canonical.ts:185`) — newer Knowledge System chapter format
- Has: `keyFacts[]`, `evidence[]`, `faq[]`, `timeline[]`, `stakeholders`, `perspectives`, `tradeoffs`, `futureOutlook`, `takeaways`, `relatedKnowledge[]`
- AEO-ready fields EXIST in this type — gap is `Story` (legacy) doesn't have them

**`Entity`** / **`EntityBase`** (`types/canonical.ts:269 / 306`)
- Has: id, type, name, slug, description, aliases[], relationships[], statistics[], timeline[], faq[], claims[]
- Missing for AEO: ❌ `canonicalUrl` (only `slug`), ❌ `sameAs[]`, ❌ `wikiDataId`

**`Source`** (`types/canonical.ts:601`)
- Has: id?, title, url, accessedAt, tier (ConfidenceTier), archiveHash?, publisher?
- Missing: ❌ `sourceType` enum (government/court/academic etc.), ❌ `publishedAt`

**`Claim`** (`types/canonical.ts:677`)
- Has: id, claim, data, source, sourceUrl, tier, confidence, status, verifiedAt, counterArguments
- Missing: ❌ `type` field (fact/quote/analysis/attributed_claim/uncertain), ❌ `entityIds[]`

**`Evidence`** (`types/canonical.ts:623`)
- Has: id, claimId, hierarchyTier (8-tier), summary, excerpt, sourceId, sourceUrl, archiveHash, confidenceScore, verifiedAt
- ✅ STRONG — this is well-modelled

**`TimelineEvent`** (`types/canonical.ts:694`)
- Has: id?, date, title, description, storyId?, evidenceId?, sourceUrl?, confidence?
- ✅ Good — missing `sourceIds[]` (plural)

**`FAQItem`** (`types/canonical.ts:705`)
- Has: question, answer
- Missing: ❌ `sourceIds[]`, ❌ `entityIds[]`, ❌ `storyId`

---

## SEO/AEO Infrastructure

### Metadata

- **Root layout**: WebSite + Organization JSON-LD hardcoded ✅
- **Story pages**: `buildStoryMetadata()` produces title, description, canonical, OG, Twitter ✅
- **Chapter pages**: Metadata via `generateMetadata` ✅
- **Entity pages**: Metadata via `generateMetadata` ✅
- **Topic pages**: Has `generateMetadata` ✅
- **Static pages** (methodology, trust, etc.): No `generateMetadata` found ❌

### JSON-LD

- **Library**: `lib/seo/jsonld.ts` + `lib/seo/jsonld-story.ts` (72 lines total — minimal)
- **Story**: NewsArticle + Breadcrumb + optional FAQPage ✅ (but author bug)
- **Entity**: Thing/Organization/Person + Breadcrumb ✅ (but no sameAs)
- **Root**: WebSite + Organization ✅
- **Chapter**: NewsArticle + Breadcrumb ✅
- **Topics/Series**: ❌ No JSON-LD
- **Datasets**: ❌ No Dataset schema
- **Authors**: ❌ No Person schema (author is always org)

### Author Bug (P0)

`lib/seo/jsonld.ts:47`:
```typescript
author: { '@type': 'Organization', name: authorName },
```
`authorName` defaults to `'The Breakdown'`. Even when a named author is passed, it is typed as `Organization`, not `Person`. This means every story in structured data has the publisher as the author — a known signal that reduces author entity recognition.

### Breadcrumb Bug (P0)

`lib/seo/jsonld-story.ts:5`:
```typescript
const breadcrumbs = story.slug.split('-').slice(0, 2).join(' ').toUpperCase();
```
This generates a breadcrumb label from the first two hyphen-separated words of the slug (e.g., `story.slug = "rbi-repo-rate"` → `"RBI REPO"`). It then links this to `/stories` which does not exist in the sitemap or robots allow list. The BreadcrumbList schema produced is factually incorrect.

---

## Knowledge Graph

`types/canonical.ts:733` — `Graph`, `GraphNode`, `GraphEdge` are defined.
`lib/graph/` directory exists.
Graph is used internally but **not emitted as structured data**.

---

## Feature Flags

Current flags (`lib/feature-flags.ts`):
- `CANONICAL_READ_PATH`: OFF | ON | CANARY — gates the canonical chapter reader
- `CANONICAL_ELIGIBILITY_REGISTRY`: Per-story eligibility map

New AEO/GEO feature flags can be added to this system without creating a parallel one.

---

## Corrections Service

`services/editorial/corrections-service.ts` — `listPublishedCorrections(slug)` exists and is called from the story page. Corrections are fetched and passed to `StoryShell`. They are **not emitted in JSON-LD** or in machine-readable metadata.

---

## Data Layer

- `utils/data-layer/store.ts` — `getPublicStories()`, `getEntities()`, `getTopics()`, `getFixes()`
- `utils/data-layer/knowledge-library-data.ts` — Chapter/volume/collection data
- Stories appear to be seed-data driven (not live DB queries at build time for static generation)
