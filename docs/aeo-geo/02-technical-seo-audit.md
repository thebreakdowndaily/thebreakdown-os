# Technical SEO Audit — AEO/GEO Baseline

## 1. Canonical URL Architecture

### Assessment: ⚠️ PARTIAL

**What is correct:**
- `metadataBase: new URL('https://thebreakdown.in')` set in root layout ✅
- `alternates.canonical` set per story, entity, topic, chapter ✅
- HTTP → HTTPS redirect via `next.config.js` ✅
- Legacy route redirects defined (e.g., `/global/:slug` → `/story/:slug`) ✅

**Issues found:**

| Issue | Severity | Location |
|-------|----------|----------|
| Story canonical uses `story.slug` from view model — if slug differs from URL param, canonical will be wrong | Medium | `lib/story/metadata.ts:42` |
| Chapter metadata sets canonical to `/story/${slug}` — correct for canonical dedup, but the canonical points away from the chapter URL itself | Review | `lib/story/metadata.ts:17` |
| Static pages (`/methodology`, `/trust`, `/editorial-constitution`, `/about`) have no `generateMetadata` — they inherit the root layout's `https://thebreakdown.in` canonical, which means all static trust pages report the homepage as canonical | High | Multiple pages |
| Entity canonical: `https://thebreakdown.in/entity/${vm.slug}` ✅ | — | — |

**Action required (P0):** Add `generateMetadata` with explicit `alternates.canonical` to all public static pages.

---

## 2. robots.txt

### Assessment: ✅ PASS (with one note)

`app/robots.ts` correctly:
- Allows all important public routes ✅
- Disallows internal tools ✅
- Disallows deprecated routes (`/problems`, `/evolution`, etc.) ✅
- References `sitemap: 'https://thebreakdown.in/sitemap.xml'` ✅

**Note:** The sitemap reference points only to the standard sitemap. A news sitemap URL, if created, should also be referenced here.

**No AI-crawler-specific blocks observed.** This is correct — no evidence to justify blocking legitimate AI crawlers, and selectively blocking them would be counterproductive to GEO goals.

---

## 3. Sitemap Coverage

### Assessment: ⚠️ PARTIAL — News Sitemap Missing

### Standard Sitemap (`/sitemap.xml`) — ✅ EXISTS

`app/sitemap.ts` covers:
- Homepage + core static pages ✅
- `/series/`, `/series/[slug]`, `/series/[slug]/volume/[slug]` ✅
- `/series/[slug]/volume/[slug]/chapter/[slug]` (published/verified only) ✅
- `/story/[slug]` ✅
- `/entity/[slug]` ✅
- `/topic/[slug]` ✅
- `/fix/[slug]` ✅
- `/problems/[slug]` and sub-pages ✅ (but `/problems` is `Disallow` in robots — inconsistency)
- Tracker pages ✅

**Issues:**

| Issue | Severity |
|-------|----------|
| `/problems/[slug]` pages appear in sitemap but `/problems` is `Disallow`ed in robots.txt | High — remove from sitemap or allow in robots |
| `lastModified: new Date()` on all static pages — this signals every crawl that every static page changed today, wasting crawl budget | Medium |
| No `changeFrequency` / `priority` tuning for chapter pages vs. tracker pages — all set to same arbitrary values | Low |
| Chapters are only included if `status === 'published' \|\| status === 'verified'` — correct ✅ |

### News Sitemap — ❌ MISSING

Google News Sitemap (per [Google documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)) requirements:
- Separate sitemap with `<news:news>` namespace
- Must include only articles published in the **last 2 days** (for news freshness)
- Must include `<news:publication>`, `<news:publication_date>`, `<news:title>`
- Must be registered in Google Search Console

**Action required (P0):** Create `/app/news-sitemap.ts` as a dedicated route.

---

## 4. Metadata Completeness by Route

| Route | title | description | canonical | OG image | publishedTime | modifiedTime | authors | robots |
|-------|-------|-------------|-----------|----------|---------------|--------------|---------|--------|
| `/story/[slug]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (no OG authors) | Root |
| `/entity/[slug]` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | — | Root |
| `/topic/[slug]` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | — | Root |
| `/series/[slug]` | ✅ | ? | ? | ? | — | — | — | Root |
| `chapter/[slug]` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | — | Root |
| `/founding-edition/[slug]` | ✅ | ? | ? | ? | ? | ? | — | Root |
| `/methodology` | Root default | Root default | **Homepage** | None | — | — | — | Root |
| `/trust` | Root default | Root default | **Homepage** | None | — | — | — | Root |
| `/editorial-constitution` | Root default | Root default | **Homepage** | None | — | — | — | Root |
| `/about` | ? | ? | ? | ? | — | — | — | Root |

**Critical finding:** All static trust/editorial pages use the root canonical (`https://thebreakdown.in`). This means Google may treat these pages as canonical duplicates of the homepage.

---

## 5. RSS / Feed

- RSS feed at `/api/feed` ✅
- Linked in `layout.tsx` via `<link rel="alternate" ...>` ✅
- Linked in root metadata via `alternates.types` ✅
- No Atom feed. Acceptable.

---

## 6. HTTP Headers

`next.config.js` sets for all routes:
- `Content-Security-Policy` ✅
- `X-Content-Type-Options: nosniff` ✅
- `X-Frame-Options: DENY` ✅
- `Referrer-Policy: strict-origin-when-cross-origin` ✅
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` ✅

**Note:** `images.unoptimized: true` is set — this disables Next.js image optimization. This means images are not automatically compressed/converted to WebP/AVIF, which affects LCP scores. Review this setting.

---

## 7. Redirects

Configured in `next.config.js`:
- HTTP → HTTPS (301) ✅
- Legacy section slugs → `/story/:slug` (301) ✅
- `/rss.xml` → `/api/feed` (301) ✅
- `/chapters` → `/series` (301) ✅
- `/library` → `/series` (301) ✅
- `/explainers` → `/stories` ✅ (but `/stories` route not found in app dir — check for 404)
- `/tracking` → `/trackers` (301) ✅

**Action required:** Verify `/stories` route exists. If not, redirect chain creates a 404.

---

## 8. Indexability Classification

Verified against robots.ts rules:

| Classification | Routes |
|---------------|--------|
| INDEX | `/`, `/story/*`, `/entity/*`, `/topic/*`, `/series/*`, `/fix/*`, `/founding-edition/*`, `/methodology`, `/trust`, `/editorial-constitution`, `/data`, `/datasets`, `/trackers/*`, `/investigation/*`, `/compare`, `/about`, `/countries`, `/organizations` |
| NOINDEX (disallowed) | `/admin`, `/cms`, `/editorial`, `/dashboard`, `/newsroom`, `/editor`, `/api/*`, `/settings`, `/login`, `/reader`, `/search`, `/graph`, `/explorer`, `/performance`, `/operations`, `/problems/*`, `/evolution/*`, `/precedents/*`, `/tracking/*`, `/up403/*`, `/timelines/*`, `/subscribe/*`, `/workspace/*` |
| REDIRECT | `/global/*`, `/economy/*`, `/rss.xml`, `/feed`, `/chapters`, `/library`, `/explainers`, `/the-fix`, `/data-stories`, `/policy-tracker`, `/tracking` |

**Inconsistency:** `/problems/[slug]` appears in sitemap but the parent `/problems` is disallowed. Google may crawl these via sitemap despite robots `Disallow: /problems`.
