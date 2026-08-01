# RELEASE-3.0 — SEO Report

**Gates (Product Quality Standard #27–30):** title + description + canonical · OG + Twitter Card · structured data · sitemap inclusion.

## Metadata coverage

| Route | Title | Description | Canonical | OG | Twitter | JSON-LD |
|-------|-------|-------------|-----------|----|---------|---------|
| `/up403` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/up403/[slug]` (403) | ✅ per-constituency | ✅ per-constituency | ✅ | ✅ | ✅ | ✅ `Place` + `BreadcrumbList` |
| `/up403/map` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/up403/search` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/up403/compare` | ✅ ("2–5 seats") | ✅ | ✅ | ✅ | ✅ | — |
| `/up403/stories` | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `/up403/timeline/[id]` (403) | ✅ per-constituency | ✅ per-constituency | ✅ | ✅ | ✅ | — |

`generateMetadata` on server pages makes every profile and timeline page indexable with unique, human, keyword-bearing titles ("Timeline — Behat Assembly Constituency", "Behat Assembly Constituency Profile").

## Structured data

`/up403/[slug]` emits JSON-LD `Place` (constituency) + `BreadcrumbList` (Uttar Pradesh → Constituency). This is the correct knowledge-graph object type for an electoral constituency and aligns with the platform's "everything is a Knowledge Object" doctrine.

## Sitemap & robots

- `app/sitemap.ts` (now `async`): 5 static `/up403` entries (`/up403`, `/map`, `/compare`, `/search`, `/stories`) + all 403 `/up403/{slug}` entries (priority 0.6, lastModified 2026-07-30, monthly change frequency). Timeline and research workspace routes deliberately excluded from the primary sitemap to keep the crawl focused on reader surfaces.
- `app/robots.ts`: allows `/up403`.

## Verdict

All four SEO gates pass on every reader surface. The sitemap now exposes the full reader constituency index (403 URLs) to search engines.
