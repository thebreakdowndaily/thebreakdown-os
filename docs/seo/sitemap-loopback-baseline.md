# The Breakdown OS — Sitemap Loopback Baseline

**Date:** 2026-09-29  
**Branch:** `feat/aeo-geo-engine`  
**Current Commit:** `9088511f78ab4af7bf102086a8763ac3e9b6b7ab`  
**Production Target:** `https://thebreakdown.in`  
**Production Deployment:** `dpl_BdsXRWprZM6VxQjzpauTz4egs2UF` (Serving live)  
**TypeScript Status:** 0 errors (`npx tsc --noEmit` PASS)  
**Build Status:** Clean build (`next build` PASS)  
**Verification Suites:** `verify:aeo-geo` 6/6 PASS  

---

## Baseline Telemetry

| Resource | HTTP Status | Content-Type | Size (Bytes) | Vercel ID / ETag | SHA256 Hash |
|:---|:---:|:---|:---:|:---|:---|
| **`/sitemap.xml`** | 200 OK | `application/xml` | 22,046 | `cdg1::jjp2l-1790677777080-41cb88319624` | `77017af36a1c61ca48394986e32657e1b921d827ddd72d69707238e3d0f1dace` |
| **`/news-sitemap.xml`** | 200 OK | `application/xml; charset=utf-8` | 178 | `cdg1::iad1::gz6lv-1790677777872-58755fe17a22` | `e9c859ad5ce11e5d6bedb9117ee0bba5c61e1f2a4d8b0466a92a5ac10313c270` |
| **`/robots.txt`** | 200 OK | `text/plain` | 912 | `cdg1::td6hp-1790677778614-25a60cce45ff` | `06f067152dd016466ce6fd5e7612feddce724719a8d22d5e833d170baf2409e5` |

---

## Known Baseline Issues & Initial Observations

1. **News Sitemap Empty Window**:
   - `/news-sitemap.xml` returns valid XML root `<urlset>` with `xmlns:news` declaration, but zero `<url>` items (178 bytes).
   - Root cause: The 48-hour recency filter `cutoff = new Date(Date.now() - 48h)` matches 0 seeded stories whose `publishedAt` dates precede the window.
2. **Unstable `lastmod` Timestamps**:
   - `app/sitemap.ts` uses `new Date()` for `home`, `series`, `topics`, `entities`, `investigations`, `data`, and `trackers`.
   - On every build, these static pages receive a fluctuating timestamp, violating crawl-budget hygiene and stability standards.
3. **Legacy Story Route vs Canonical Chapter Route**:
   - `app/sitemap.ts` emits all public stories as `${siteUrl}/story/${s.slug}`.
   - For stories that represent canonical Knowledge Library chapters (e.g. `indias-inheritance`), the canonical URL is `/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance`, creating a potential canonical mismatch / duplicate representation if both are emitted or if `/story/` redirects.
4. **Newsroom & Publication Integrity**:
   - Must audit every URL in the live sitemap against the canonical data layer (`getPublicStories`, publication gate, entity index) to ensure zero drafts, zero quarantined content, and zero non-canonical URLs.
