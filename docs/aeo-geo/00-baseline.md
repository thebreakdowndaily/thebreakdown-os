# AEO + GEO Baseline Audit — The Breakdown OS

**Audit Date:** 2026-09-28  
**Branch:** main  
**Commit:** 550b9e2  
**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind · Supabase · Vercel  
**Auditor:** Antigravity / Senior AEO-GEO Review

---

## Executive Summary

The Breakdown OS has a sophisticated editorial architecture that is significantly more advanced than most newsrooms at this stage. The canonical type system (`types/canonical.ts`, 2 179 lines) already models Claims, Evidence, Sources, FAQs, Timelines, Corrections, Entities, Datasets, and the Knowledge Graph at the type level.

However, a structured gap exists between what the **data model supports** and what actually **reaches machines** (crawlers, answer engines, structured-data parsers).

The five highest-priority gaps identified:

1. **Author identity is a plain string** — the JSON-LD author emitted for every story is `{ "@type": "Organization", "name": "The Breakdown" }` even when `story.author` is a named journalist. No `Person` schema. No author URL. No `sameAs`.
2. **Breadcrumb schema is structurally broken** — `breadcrumbs` is constructed by splitting the slug and uppercasing the first two segments, not by actual section/category. The "breadcrumb" second item always resolves to `/stories`, which is `NOINDEX` or non-existent.
3. **`llms.txt` is absent** — no file exists at `/public/llms.txt` or as a route.
4. **News sitemap is absent** — `app/sitemap.ts` generates a standard XML sitemap. There is no `/news-sitemap.xml` conforming to Google News Sitemap requirements.
5. **`answerSummary` / AEO content layer does not exist** — the canonical `Story` type has no `answerSummary`, `executiveAnswer`, or machine-readable key-question block. These fields are present in `TBSStory` (the new chapter type) but not on the legacy `Story` type used by `/story/[slug]`.

The platform is **ready for a targeted, phased AEO/GEO overlay** — no architectural rewrites required. All changes are additive extensions of existing models.

---

## Audit Scope

| File | Ref |
|------|-----|
| `types/canonical.ts` | `docs/aeo-geo/01-current-architecture.md` |
| `app/robots.ts` | `docs/aeo-geo/02-technical-seo-audit.md` |
| `app/sitemap.ts` | `docs/aeo-geo/02-technical-seo-audit.md` |
| `lib/seo/jsonld.ts` | `docs/aeo-geo/03-schema-audit.md` |
| `lib/seo/jsonld-story.ts` | `docs/aeo-geo/03-schema-audit.md` |
| `app/layout.tsx` | `docs/aeo-geo/03-schema-audit.md` |
| `app/story/[slug]/page.tsx` | `docs/aeo-geo/04-content-extractability-audit.md` |
| `app/entity/[slug]/page.tsx` | `docs/aeo-geo/05-entity-audit.md` |
| `lib/story/metadata.ts` | `docs/aeo-geo/02-technical-seo-audit.md` |
| `lib/feature-flags.ts` | Architecture context |
| `next.config.js` | Performance + security baseline |
| `public/` | Static file baseline |

---

## Pass / Fail Summary

| Dimension | Status | Priority |
|-----------|--------|----------|
| Canonical URL architecture | ⚠️ PARTIAL | P0 |
| robots.txt policy | ✅ PASS | P0 |
| Sitemap coverage | ⚠️ PARTIAL (no News sitemap) | P0 |
| Story JSON-LD (NewsArticle) | ⚠️ PARTIAL (author broken, breadcrumbs broken) | P0 |
| Entity JSON-LD | ⚠️ PARTIAL (no sameAs, no aliases) | P0 |
| Organization schema | ⚠️ PARTIAL (no sameAs, no contact) | P1 |
| Author/Person schema | ❌ MISSING | P0 |
| Answer summary / AEO layer | ❌ MISSING | P1 |
| llms.txt | ❌ MISSING | P3 |
| News sitemap | ❌ MISSING | P0 |
| Structured source/claim citation | ⚠️ PARTIAL (in type system, not in JSON-LD) | P1 |
| Correction metadata (public) | ⚠️ PARTIAL (service exists, not in schema) | P1 |
| Content decay / freshness | ✅ TYPE-COMPLETE | P2 |
| GEO measurement system | ❌ MISSING | P2 |
| AI visibility observation storage | ❌ MISSING | P2 |
| Internal linking engine | ⚠️ PARTIAL (topic/entity links, max 6 each) | P1 |
| HTML semantics | Unknown — requires browser test | P1 |
| Performance baseline | Unknown — no Lighthouse data | P1 |
| Security (CSP) | ✅ PASS (CSP in next.config.js) | P0 |
| JSON-LD injection safety | ✅ PASS (`replace(/</g, '\\u003c')`) | P0 |

---

## Next Steps

See individual audit files (01–11) for detail.  
Implementation plan: `docs/aeo-geo/architecture.md`  
Phased delivery begins at P0 items after baseline is accepted.
