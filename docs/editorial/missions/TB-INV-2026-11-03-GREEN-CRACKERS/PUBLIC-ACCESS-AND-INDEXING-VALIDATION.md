# Public Access and Indexing Validation: Comprehensive 404 & Crawl Diagnosis

**Mission ID:** `TB-INV-2026-11-03-GREEN-CRACKERS`  
**Story Slug:** `delhi-green-cracker-enforcement-diwali-2026`  
**Target URL:** `https://thebreakdown.in/story/delhi-green-cracker-enforcement-diwali-2026`  
**Audit Date:** 2026-11-03  
**Diagnosis Status:** `DEFINITIVELY DIAGNOSED & PROVEN`

---

## 1. Executive Summary

When an unauthenticated visitor requests `https://thebreakdown.in/story/delhi-green-cracker-enforcement-diwali-2026`, the production edge server returns an HTTP 404 Not Found response. 

A previous execution report loosely attributed this result to "fail-closed publication security" without providing diagnostic proof. This investigation performed a full diagnostic trace across git deployment branches, database storage, application resolution logic, Next.js page handlers, XML sitemaps, RSS feeds, and search indexing directives.

The finding: The 404 response is produced by multiple, independent, layered security and architectural boundaries operating simultaneously. It is not an artifact of a broken route or missing code, but the intended, verifiable behavior of an unmerged, unpublished investigation.

---

## 2. Multi-Layer Diagnostic Trace

### Layer 1: Git Branch & Production Deployment Isolation
- **Production Deployment Target:** Vercel automatically deploys commits merged into the `main` branch.
- **Investigation Branch:** All research, draft code, and SVG assets exist solely on working branch `research/green-cracker-enforcement-2026-11-03` under Pull Request [#153](https://github.com/thebreakdowndaily/thebreakdown-os/pull/153).
- **Finding:** The latest commit on `main` (`885c9ad4`) contains no reference to `delhi-green-cracker-enforcement-diwali-2026`. Therefore, on the live production environment, the slug does not exist in any static bundle, build artifact, or deployed code.

### Layer 2: Database Layer Isolation
- **Database Table:** `public.stories` in the production Supabase PostgreSQL cluster.
- **Repository Policy:** Non-negotiable mission rules forbid direct database writes or inserting draft records directly into production tables without canonical publication authorization.
- **Finding:** No record with slug `delhi-green-cracker-enforcement-diwali-2026` exists in `public.stories`. Querying `services.stories.getStoryBySlug('delhi-green-cracker-enforcement-diwali-2026')` against the production database returns `undefined`.

### Layer 3: Application Resolver & Feature-Flag Routing
- **Resolver Implementation:** [`lib/story/resolver.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/story/resolver.ts)
- **Execution Path:**
  1. `resolveStory(slug)` calls `selectReadPath(slug)`.
  2. `isCanonicalReadPathEnabled(slug)` in [`lib/feature-flags.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/feature-flags.ts) queries `CANONICAL_ELIGIBILITY_REGISTRY`. The slug is not registered as `'ELIGIBLE'`, so it selects `'legacy'`.
  3. `resolveLegacyStory(slug)` queries `services.stories.getStoryBySlug(slug)`. The DB returns `undefined`.
  4. In local development/preview runtimes where PR #153 code is present, it falls back to `REMEDIATED_STORIES_MAP[slug]`, locating [`DELHI_GREEN_CRACKER_STORY`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/drafts/delhi-green-crackers.ts).
  5. It returns a resolution object of `{ type: 'legacy_story', canonicalStory: draft }`.

### Layer 4: Next.js Page Security & Fail-Closed Guard
- **Page Route:** [`app/story/[slug]/page.tsx`](file:///c:/newsjack-content/thebreakdown-os/app/story/[slug]/page.tsx)
- **Security Logic (Lines 52–55):**
  ```typescript
  // Fail-closed publication safety check: unauthenticated visitors cannot view unpublished stories
  if (!isCanonicalStoryPublic(canonicalStory)) {
    notFound();
  }
  ```
- **Policy Predicate:** [`lib/story/publication.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/story/publication.ts#L54-L68):
  ```typescript
  export function isPubliclyPublished(ctx: PublicationContext, now: Date = new Date()): boolean {
    if (ctx.isTestArtifact === true) return false;
    const ps = ctx.publicationStatus;
    if (ps !== 'published') return false;
    if (!isValidDate(ctx.publishedAt)) return false;
    if (!isPast(ctx.publishedAt, now)) return false;
    return true;
  }
  ```
- **Evaluation:**
  - `story.publicationStatus` is `'scheduled'`.
  - Because `ps !== 'published'`, `isPubliclyPublished` returns `false`.
  - `isCanonicalStoryPublic` returns `false`.
  - `page.tsx` executes `notFound()`, triggering the Next.js standard 404 response.

### Layer 5: Metadata & Head Tags Security
- **Metadata Generator:** [`app/story/[slug]/page.tsx`](file:///c:/newsjack-content/thebreakdown-os/app/story/[slug]/page.tsx#L31-L38):
  ```typescript
  export async function generateMetadata({ params }): Promise<Metadata> {
    const { slug } = await params;
    const resolution = await resolveStory(slug);
    if (resolution.type === 'not_found' || !isCanonicalStoryPublic(resolution.canonicalStory)) {
      return { title: 'Story Not Found — The Breakdown' };
    }
    return buildStoryMetadata(slug);
  }
  ```
- **Finding:** Because `isCanonicalStoryPublic` is `false`, the metadata generator returns a generic `{ title: 'Story Not Found — The Breakdown' }`. No OpenGraph cards, Twitter cards, author credits, canonical link tags, or JSON-LD structured data (`Article` / `NewsArticle`) are emitted.

---

## 3. Discovery, Feed, and Indexing Audit

| Surface | File Route | Public Visibility Mechanism | Green-Cracker Inclusion State |
|:---|:---|:---|:---:|
| **Standard XML Sitemap** | [`app/sitemap.ts`](file:///c:/newsjack-content/thebreakdown-os/app/sitemap.ts#L10-L40) | Queries `services.stories.getPublicStories()`, which filters `.eq('status', 'published').eq('is_test_artifact', false).lte('published_at', now)` | **EXCLUDED** |
| **Google News Sitemap** | [`app/news-sitemap.xml/route.ts`](file:///c:/newsjack-content/thebreakdown-os/app/news-sitemap.xml/route.ts#L34-L43) | Queries `services.stories.getPublicStories()` and filters to stories published in past 48 hours | **EXCLUDED** |
| **JSON Feed API** | [`app/api/feed/route.ts`](file:///c:/newsjack-content/thebreakdown-os/app/api/feed/route.ts#L33) | Queries `services.stories.getPublicStories()` | **EXCLUDED** |
| **Stories Index Page** | `app/stories/page.tsx` | Queries `services.stories.getPublicStories()` | **EXCLUDED** |
| **Robots Directives** | [`app/robots.ts`](file:///c:/newsjack-content/thebreakdown-os/app/robots.ts#L66-L69) | Sitemaps declared are `/sitemap.xml` and `/news-sitemap.xml` | **UNREACHABLE** |
| **Search Engine Directives** | `app/story/[slug]/page.tsx` | 404 HTTP status code instructs search engines not to index the URL | **NOINDEX / 404** |

---

## 4. Verification Summary

1. **Why the URL returns 404 on production:** The code is not merged to `main`, no database row exists, and even if executed in preview, the story's `'review'` / `'scheduled'` status triggers the fail-closed `notFound()` handler.
2. **Why there is zero indexing risk:** Sitemaps, feeds, directory pages, and JSON-LD structured data are completely insulated from unpublished content via the centralized `isPubliclyPublished` and `getPublicStories` predicates.
3. **Conclusion:** Public access and indexing safety are fully verified and robust against leakage.
