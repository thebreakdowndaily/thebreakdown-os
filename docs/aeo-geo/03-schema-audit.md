# Schema / Structured Data Audit — AEO/GEO Baseline

## 1. Schema Inventory

### Emitted Schemas by Page

| Page | Schema Types Emitted | Assessment |
|------|---------------------|------------|
| Root layout (all pages) | `WebSite`, `Organization` | ⚠️ Partial — Organization has no `sameAs`, no contact |
| `/story/[slug]` | `NewsArticle`, `BreadcrumbList`, `FAQPage` (conditional), `WebPage` | ⚠️ Partial — author bug, breadcrumb bug |
| `/entity/[slug]` | `Thing`/`Organization`/`Person`, `BreadcrumbList` | ⚠️ Partial — no `sameAs`, no `alternateName` |
| `chapter/[chapterSlug]` | `NewsArticle`, `BreadcrumbList` | ⚠️ Partial |
| `/investigation/[slug]` | Unknown — needs inspection |
| `/fix/[slug]` | Unknown — needs inspection |
| `/trackers/*` | Unknown — needs inspection |
| `/topic/[slug]` | Unknown — only JSON-LD tag found in page |
| `/methodology`, `/trust`, etc. | ❌ None |
| `/data`, `/datasets` | ❌ No `Dataset` schema |

---

## 2. Critical Schema Bugs

### Bug 1 — Author always typed as Organization (P0)

**Location:** `lib/seo/jsonld.ts:47`

**Current code:**
```typescript
author: { '@type': 'Organization', name: authorName },
```

**Problem:**
- `authorName` receives `story.author` which is a plain string (e.g., `"Nitin Pai"`)
- But the schema always emits `@type: Organization`
- Google's structured data guidelines require `Person` for individual authors
- The NewsArticle schema's `author` field accepts both `Person` and `Organization`, but using `Organization` for a named individual is incorrect
- This suppresses author entity recognition and authorship signals

**Required fix:**
```typescript
author: isOrgAuthor(authorName)
  ? { '@type': 'Organization', name: authorName }
  : { '@type': 'Person', name: authorName, url: resolveAuthorUrl(authorName) }
```

### Bug 2 — Breadcrumb uses slug fragments (P0)

**Location:** `lib/seo/jsonld-story.ts:5`

**Current code:**
```typescript
const breadcrumbs = story.slug.split('-').slice(0, 2).join(' ').toUpperCase();
```

**Problem:**
- `breadcrumbs` (mis-named — it's actually a label string) is constructed from the first two words of the slug
- The `BreadcrumbList` then places this label at `/stories` — a URL that does not exist in robots or sitemap
- Result: breadcrumb schema is factually wrong for every story

**Required fix:**
```typescript
createBreadcrumbSchema([
  { name: 'Home', url: 'https://thebreakdown.in/' },
  { name: story.category || 'Stories', url: `https://thebreakdown.in/stories` }, // or actual section
  { name: story.headline.slice(0, 60), url: `https://thebreakdown.in/story/${story.slug}` },
])
```
Or — if a canonical section URL does not exist, remove the middle breadcrumb:
```typescript
createBreadcrumbSchema([
  { name: 'Home', url: 'https://thebreakdown.in/' },
  { name: story.headline.slice(0, 60), url: `https://thebreakdown.in/story/${story.slug}` },
])
```

### Bug 3 — WebPage schema emitted alongside NewsArticle (P1)

**Location:** `lib/seo/jsonld-story.ts:46–58`

**Problem:**
- A `WebPage` schema is emitted in addition to `NewsArticle` for every story
- The `WebPage` duplicates headline and description, but adds `about` and `citation` fields
- `citation` uses `CreativeWork` — correct schema type ✅
- However, emitting both `WebPage` and `NewsArticle` for the same page creates redundancy
- The `citation` data from sources (claim → source relationship) should ideally be on `NewsArticle.citation`, not on a separate `WebPage` node

**Recommendation:** Merge `citation` and `about` into the `NewsArticle` schema. Remove the standalone `WebPage` schema (the page itself already serves as the `mainEntityOfPage`).

---

## 3. Organization Schema Gap

**Location:** `app/layout.tsx:89–96`

**Current:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "The Breakdown",
  "url": "https://thebreakdown.in",
  "logo": "https://thebreakdown.in/logo.svg",
  "description": "Independent, data-driven journalism on Indian policy, politics, and society."
}
```

**Missing:**
- `sameAs`: Links to Twitter/X, LinkedIn, verified social profiles
- `foundingDate`
- `knowsAbout`: Topic areas
- `contactPoint` (if public contact exists)
- `publishingPrinciples`: URL to editorial standards page
- `ethicsPolicy`: URL to methodology/ethics page
- `correctionsPolicy`: URL to corrections page
- `noBylinesPolicy` / `hasPart` (if applicable)
- `logo` should be `ImageObject` with `width`/`height`

---

## 4. NewsArticle Schema Gaps

**What is present:**
- `@type: NewsArticle` ✅
- `headline` ✅
- `description` ✅
- `datePublished` ✅
- `dateModified` ✅
- `image (ImageObject)` ✅ (when heroImage exists)
- `publisher` ✅
- `mainEntityOfPage` ✅
- `articleSection` ✅
- `keywords` ✅
- `inLanguage: en-IN` ✅
- `isAccessibleForFree: true` ✅
- `wordCount` ✅ (estimated from blocks)

**What is missing:**
- `author` → `Person` type with `url` ❌
- `about` → entities mentioned ❌
- `mentions` → named entities in the story ❌
- `citation` → sources (currently only on a separate WebPage node) ❌
- `isPartOf` → series/collection membership ❌
- `articleBody` → text extraction (for AI retrieval) ❌
- Corrections metadata ❌

---

## 5. Schema Types Available but Not Implemented

| Schema Type | Use Case | Priority |
|-------------|----------|----------|
| `Dataset` | Data pages, tracker pages | P1 |
| `Person` | Author profiles | P0 |
| `CollectionPage` | `/series`, `/topics`, `/entities` index pages | P2 |
| `ItemList` | Story lists, entity lists | P2 |
| `Event` | Timeline events | P3 |
| `SpecialAnnouncement` | Breaking news (COVID-era schema, use with care) | P3 |
| `ClaimReview` | Fact-check stories | P2 |
| `ProfilePage` | Author pages | P1 |

---

## 6. JSON-LD Security Assessment

**XSS mitigation:** `JSON.stringify(ld).replace(/</g, '\\u003c')` ✅
This prevents script injection through `<script>` tags embedded in content strings.

**URL validation:** Source URLs from `story.sources` are passed directly into `citation` schema without validation. If a source URL contains `javascript:` or `data:` protocol, it could be emitted in structured data.

**Action required (P1):** Add URL scheme validation before emitting source URLs in JSON-LD.

---

## 7. Validation Tooling

No schema validation script exists. `package.json` has:
```json
"check:audit": "node -e \"console.log('Placeholder: audit script')\""
```
This is a placeholder only.

**Action required (P1):** Implement `npm run validate:schema` that:
1. Extracts JSON-LD from built HTML (story pages)
2. Validates JSON syntax
3. Checks required fields (headline, datePublished, author, publisher)
4. Validates URL schemes
5. Flags duplicate schema types on same page
