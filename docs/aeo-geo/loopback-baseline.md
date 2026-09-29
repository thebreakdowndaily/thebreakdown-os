# AEO / GEO Loopback Engineering — Initial Baseline Audit

**Audit Date:** 2026-09-29  
**Branch:** `feat/aeo-geo-engine`  
**Current HEAD Commit:** `cdef4ab` — *feat(aeo-geo): Phase 6-12 — entity & chapter JSON-LD enrichment, author registry, schema validator, GEO measurement*  
**Previous Commit:** `f48fca4` — *feat(aeo-geo): Phase 0-5 — forensic audit, schema fixes, news sitemap, llms.txt*  

---

## 1. Environment & Architecture State

- **Framework:** Next.js 15.5.18 · React 19.2.7 · TypeScript 5.5.0 · Tailwind CSS 3.4.0
- **Database:** Supabase PostgreSQL with RLS & migrations up to `017_geo_measurement_schema.sql`
- **Architecture Standard:** AGENTS.md v1.0, Editorial Constitution v1.1, `docs/aeo-geo/architecture.md`
- **Execution Mandate:** Closed-loop forensic verification across Implementation, Rendering, Discovery, Retrieval, Representation, and Measurement.

---

## 2. Quantitative Baseline Metrics

| Dimension | Metric | Baseline Value | Status |
|---|---|---|---|
| **TypeScript** | `npx tsc --noEmit` | 0 errors | ✅ PASS |
| **Lint** | `npm run lint` | 0 errors, 444 warnings (pre-existing repo debt) | ✅ PASS |
| **Schema & Contracts** | `npm run validate:schema` | 1,088 / 1,088 assertions | ✅ PASS |
| **Public Stories** | Repository data layer count | 41 stories | Verified |
| **Store Entities** | Store registry count | 41 entities | Verified |
| **Entity Index** | Seed index lookup count | 11 core entities | Verified |
| **GEO Benchmark** | `data/geo-query-set.json` queries | 10 queries | Verified |
| **Database Migrations** | File count in `supabase/migrations/` | 17 migrations (latest: 017) | Verified on disk |
| **News Sitemap** | `/news-sitemap.xml` route | Implemented (48h window) | Verified |
| **Standard Sitemap** | `/sitemap.xml` route | Implemented (stable dates) | Verified |
| **AI Manifest** | `/llms.txt` route | Implemented | Verified |
| **Robots Rules** | `app/robots.ts` | Allows public, disallows internal tools | Verified |

---

## 3. Forensic Layer Mapping

The system is partitioned into six forensic layers for the loopback evaluation:
1. **Implementation Correctness:** Code, types, pure function schema builders (`lib/seo/jsonld.ts`, `lib/seo/jsonld-story.ts`, `lib/seo/author-registry.ts`).
2. **Rendered Production Correctness:** Next.js Server Component page output, head tags, canonicals, JSON-LD script blocks in HTML.
3. **Crawler & Discovery Correctness:** `/robots.txt`, `/sitemap.xml`, `/news-sitemap.xml`, `/llms.txt`, header responses, caching.
4. **AI Retrieval & Representation Correctness:** Benchmark query set coverage, factual precision, source attribution, absence of hallucinations.
5. **Measurement & Regression Correctness:** `lib/seo/geo-measurement.ts`, observation schema, stress-tested scoring rubric, regression gates.
6. **Integrity & Security:** Safe URLs, zero script injection, fail-closed access controls.
