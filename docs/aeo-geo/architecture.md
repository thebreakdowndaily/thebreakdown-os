# AEO + GEO Architecture — The Breakdown OS

**Document type:** Implementation plan  
**Governs:** `AGENTS.md` Level 2 (Operating Doctrine) + Level 5 (Implementation)  
**Status:** Approved for implementation  
**Last updated:** 2026-09-28

---

## Design Principle

> Make genuinely useful journalism easier for machines to understand without making it less useful for humans.

No tricks. No fabricated authority. No hidden text. No artificial entity associations.

The goal is:
```
Crawlable → Indexable → Understandable → Verifiable → Extractable → Citable → Attributable → Measurable
```

---

## Architecture Overview

```
                  ┌─────────────────────────┐
                  │    THE BREAKDOWN        │
                  │    KNOWLEDGE LAYER      │
                  │  (types/canonical.ts)   │
                  └──────────┬──────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ↓                  ↓                  ↓
    Editorial Layer     Evidence Layer      Entity Layer
    (Story, Claim)    (Evidence, Source)  (EntityBase,
                                          Relationships)
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ↓
                    ┌────────────────┐
                    │  AEO Layer     │  ← NEW: answerSummary,
                    │  (Story type   │    keyFacts, sourceType
                    │   extension)   │    author identity
                    └────────────────┘
                             │
                    ┌────────────────┐
                    │  JSON-LD Layer │  ← IMPROVED: author fix,
                    │  (lib/seo/)    │    breadcrumb fix,
                    │                │    mentions, citations
                    └────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ↓                  ↓                  ↓
      Sitemap           robots.txt          llms.txt
  (+ news sitemap)    (unchanged)       (new experiment)
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ↓
                    ┌────────────────┐
                    │  GEO           │  ← NEW: observation
                    │  Measurement   │    storage, query set,
                    │                │    manual spot-check UI
                    └────────────────┘
```

---

## Phase Plan

### Phase 0 — Branch Setup (15 min)

```bash
git checkout -b feat/aeo-geo-engine
```

Checkpoint: Branch exists, no code changed.

---

### Phase 1 — P0 Bug Fixes (Schema)

**Objective:** Fix the two actively wrong schema emissions.

#### Fix 1.1 — Author schema bug

**File:** `lib/seo/jsonld.ts`

```typescript
// BEFORE (wrong — always Organization):
author: { '@type': 'Organization', name: authorName },

// AFTER (correct — Person when individual, Organization when newsroom):
author: isOrgAuthor(authorName)
  ? { '@type': 'Organization', name: 'The Breakdown' }
  : { '@type': 'Person', name: authorName }
```

A helper `isOrgAuthor(name)` returns true when `name` is `'The Breakdown'`, `'The Breakdown Editorial'`, `''`, or undefined.

#### Fix 1.2 — Breadcrumb schema bug

**File:** `lib/seo/jsonld-story.ts`

Remove the slug-fragment breadcrumb label construction. Use the story's `category` field as the section name. If no useful section URL exists, use a 2-item breadcrumb (Home → Article).

#### Fix 1.3 — WebPage schema cleanup

Merge the `about` and `citation` data from the standalone `WebPage` schema into the `NewsArticle` schema. Remove the redundant `WebPage` emission.

---

### Phase 2 — P0 Sitemap

**Objective:** Add News Sitemap.

**File:** `app/news-sitemap.ts` (new route)

The news sitemap should:
- Only include stories published in the last 48 hours
- Use the `<news:news>` namespace
- Include `publication`, `publication_date`, `title`
- Be referenced in `robots.ts`

**Implementation note:** Next.js does not natively support multiple sitemap routes with non-standard XML namespaces. The news sitemap should be implemented as an API route that returns XML directly.

```typescript
// app/news-sitemap.xml/route.ts
export async function GET() {
  // fetch stories from last 48h
  // return XML with news namespace
}
```

---

### Phase 3 — P0 Static Page Canonicals

**Objective:** Add `generateMetadata` with explicit canonical to all static trust/editorial pages.

**Affected pages:**
- `app/methodology/page.tsx`
- `app/trust/page.tsx`
- `app/editorial-constitution/page.tsx`
- `app/about/page.tsx`

Each needs minimum:
```typescript
export const metadata: Metadata = {
  title: 'Methodology — The Breakdown',
  description: '...',
  alternates: { canonical: 'https://thebreakdown.in/methodology' },
};
```

---

### Phase 4 — P1 Organization Schema Enhancement

**Objective:** Enrich the Organization entity in `app/layout.tsx`.

Add to the organization JSON-LD:
- `publishingPrinciples` → `https://thebreakdown.in/editorial-constitution`
- `ethicsPolicy` → `https://thebreakdown.in/methodology`
- `correctionsPolicy` → `https://thebreakdown.in/trust` (or `/corrections` if created)
- `logo` as `ImageObject` with width/height
- `sameAs` — only if verified official social profiles exist

---

### Phase 5 — P1 Story Type Extension (AEO Layer)

**Objective:** Add AEO fields to `Story` type. Purely additive — all fields optional.

**File:** `types/canonical.ts`

```typescript
// Add to Story interface (all optional — no migration required for existing stories)
answerSummary?: string;          // 40–100 word direct answer to "what happened"
executiveAnswer?: string;        // Longer version if needed for complex topics
whoIsAffected?: string;          // Already exists ✅
whatIsUnknown?: string;          // New: what remains uncertain
reportingType?: 'original_reporting' | 'exclusive' | 'field_reporting' | 
                'data_analysis' | 'document_analysis' | 'interview' | 
                'investigation' | 'aggregated';
```

**File:** `types/canonical.ts` — `Source` interface

```typescript
// Add to Source interface
sourceType?: 
  | 'government' | 'court' | 'official' | 'academic' | 'company' 
  | 'dataset' | 'interview' | 'document' | 'news' | 'rti' 
  | 'parliament' | 'field_report' | 'other';
publishedAt?: string;
```

**Migration:** Existing stories without these fields work correctly — fields are optional. New editorial tools should surface these fields for new stories.

---

### Phase 6 — P1 Enhanced NewsArticle JSON-LD

**Objective:** Emit richer, more useful structured data for story pages.

**File:** `lib/seo/jsonld.ts` — extend `createArticleSchema`:

Add:
- `author` fix (Phase 1)
- `about: Entity[]` — typed entity references from `relatedEntityIds`
- `mentions: Entity[]` — named entities from story
- `citation: Source[]` — moved from WebPage, with URL validation
- `correction: CorrectionComment[]` — when corrections exist
- `isBasedOn` — for stories derived from original reporting

---

### Phase 7 — P1 Sitemap Issues

**Objective:** Fix the inconsistency between robots.ts and sitemap.ts.

- Remove `/problems/[slug]` entries from sitemap (they are disallowed in robots)
- Fix `lastModified: new Date()` on static pages (use a real date constant)
- Add news sitemap reference to `robots.ts`

---

### Phase 8 — P2 Entity Schema Enhancement

**Objective:** Add `sameAs`, `alternateName`, `subjectOf` to entity JSON-LD.

**File:** `app/entity/[slug]/page.tsx` — `createJsonLd()`

When entity has `aliases[]`, emit as `alternateName`.
When entity has `relatedStoryIds`, emit first 5 as `subjectOf`.
When entity has a Wikidata ID (to be added to `EntityBase`), emit as `sameAs`.

---

### Phase 9 — P2 Author Entity

**Objective:** Create a minimal author registry and emit `Person` schema.

**New file:** `data/authors.ts` (static registry, no DB required)

```typescript
interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio?: string;
  url: string;           // https://thebreakdown.in/author/[slug]
  sameAs?: string[];     // Official external profiles only
}
```

When `story.author` matches a known author slug/name, emit full `Person` schema.

---

### Phase 10 — P3 llms.txt

**Objective:** Implement `/llms.txt` as a documented experiment.

**File:** `app/llms.txt/route.ts`

Generate dynamically from:
- Published series list
- Editorial constitution URL
- Methodology URL
- Corrections URL (when created)

Document: Why implemented, evidence base, limitations, what it cannot guarantee.

---

### Phase 11 — P2 Schema Validation Script

**Objective:** Replace the placeholder `npm run check:audit` with a real validator.

**File:** `scripts/validate-schema.ts`

Validates built HTML pages (or JSON-LD extracted from dev server):
1. JSON syntax validity
2. Required fields: `headline`, `datePublished`, `author`, `publisher`
3. URL scheme safety (no `javascript:`, `data:`)
4. No duplicate schema types on same page
5. Author type correctness (`Person` vs `Organization`)

---

### Phase 12 — P2 GEO Measurement Foundation

**Objective:** Create the observation storage and query set.

1. Supabase migration: `ai_visibility_observations` table
2. Seed query set JSON file: `data/geo-query-set.json`
3. Internal observation recording page (`/newsroom/geo-observations`) — auth-gated

---

## Constraints

| Rule | Source |
|------|--------|
| No new generic infrastructure | AGENTS.md Platform Beta Rules |
| No new registries | AGENTS.md Platform Beta Rules |
| Every sprint must produce reader-visible improvement | AGENTS.md Experience Rule |
| Extend existing architecture only | AGENTS.md Architecture Rules |
| No `any` types | AGENTS.md TypeScript Rules |
| Components ≤ 250 lines | AGENTS.md Component Rules |
| No fabricated schema data | This project's Principle 2 |

---

## Dependency Map

```
Phase 1 (Schema fixes) → Phase 6 (Enhanced JSON-LD) → Phase 8 (Entity schema)
Phase 2 (News sitemap) → Phase 7 (Sitemap cleanup)
Phase 3 (Static canonicals) → Independent
Phase 4 (Org schema) → Independent
Phase 5 (Story type extension) → Phase 6 → Phase 12
Phase 9 (Author entity) → Phase 6
Phase 10 (llms.txt) → After Phase 3
Phase 11 (Schema validation) → After Phase 6
Phase 12 (GEO measurement) → After Phase 5
```

## P0 Work (Start First)

1. Fix author schema bug (`lib/seo/jsonld.ts`)
2. Fix breadcrumb bug (`lib/seo/jsonld-story.ts`)
3. Add news sitemap (`app/news-sitemap.xml/route.ts`)
4. Add static page canonicals (`app/methodology/`, `app/trust/`, etc.)
