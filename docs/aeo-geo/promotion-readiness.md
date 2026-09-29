# The Breakdown OS — AEO/GEO Promotion Readiness Audit

**Audit Date:** 2026-09-29  
**Source Branch:** `feat/aeo-geo-engine`  
**Target Branch:** `main`  
**Candidate SHA:** `9088511f78ab4af7bf102086a8763ac3e9b6b7ab`  
**Current Production SHA:** `550b9e263d283dcf308a9707c606dc279ec7d6d3`  
**Production Domain:** `https://thebreakdown.in`  

---

## 1. Commit Delta (main..feat/aeo-geo-engine)

| Commit SHA | Commit Message | Purpose |
|---|---|---|
| `f48fca4` | `feat(aeo-geo): Phase 0-5 — forensic audit, schema fixes, news sitemap, llms.txt` | Schema.org builders, News sitemap route, llms.txt route, canonical URL fixes |
| `cdef4ab` | `feat(aeo-geo): Phase 6-12 — entity & chapter JSON-LD enrichment, author registry, schema validator, GEO measurement` | Author registry, Entity schema enrichment, JSON-LD validator, GEO measurement spec & migration 017 |
| `9088511` | `feat(aeo-geo): closed-loop audit, adversarial repairs, graph resolution & master verification gate` | SSRF/169.254. security fixes, entity index registration, master gate runner |

---

## 2. Files Changed (38 files, +4531, -96)

- **Routes & Sitemaps:**
  - `app/news-sitemap.xml/route.ts` (NEW: Google News XML sitemap)
  - `app/llms.txt/route.ts` (NEW: Machine-readable AI manifest)
  - `app/robots.ts` (Declares Google News sitemap)
  - `app/sitemap.ts` (Canonical route alignment)
- **Metadata & Canonical Pages:**
  - `app/editorial-constitution/page.tsx` (Self-canonical fix)
  - `app/layout.tsx` (Organization schema trust/ethics principles)
  - `app/story/[slug]/page.tsx` (Canonical Person author and speakable metadata)
  - `app/entity/[slug]/page.tsx` (Thing/Organization entity JSON-LD)
  - `app/series/.../chapter/[chapterSlug]/page.tsx` (Article schema for canonical chapters)
- **Core SEO & Knowledge Libraries:**
  - `lib/seo/author-registry.ts` (Canonical person identities for editorial staff)
  - `lib/seo/geo-measurement.ts` (Benchmark measurement library & rubric)
  - `lib/seo/jsonld-story.ts` (Rich article schema emitter)
  - `lib/seo/jsonld.ts` (SSRF-hardened JSON-LD schema builder)
  - `types/canonical.ts` (AEO story and source extensions)
  - `utils/data-layer/entity-index.ts` (Institutional entities)
- **Database Migrations:**
  - `supabase/migrations/017_geo_measurement_schema.sql` (GEO visibility observations table & RLS)
- **Testing & Verification:**
  - `scripts/validate-schema.ts` (1,088 assertion forensic validator)
  - `scripts/audit-entity-graph.ts` (Graph integrity auditor)
  - `scripts/audit-rendered-pages.ts` (Rendered page checker)
  - `scripts/verify-aeo-geo-loopback.ts` (Master gate runner)
  - `tests/aeo-geo-adversarial.test.ts` (SSRF & security suite)
  - `tests/geo-measurement-stress.test.ts` (Adversarial GEO stress suite)
  - `data/geo-query-set.json` (10 benchmark query set)

---

## 3. Validation Status

| Gate | Command | Status | Result |
|---|---|---|---|
| TypeScript | `npx tsc --noEmit` | ✅ PASS | 0 errors |
| Lint | `npm run lint` | ✅ PASS | 0 errors, 444 pre-existing warnings |
| Schema Validator | `npm run validate:schema` | ✅ PASS | 1,088 / 1,088 assertions |
| Rendered Pages | `npx tsx scripts/audit-rendered-pages.ts` | ✅ PASS | 107 / 107 checks passed |
| Master Gate | `npm run verify:aeo-geo` | ✅ PASS | 6 / 6 test suites passed |
| Production Build | `npm run check:build` | ✅ PASS | SSG optimized build exit code 0 |
| Database Migration | `scripts/apply-migration-017.ts` | ✅ PASS | Deployed to Supabase PostgreSQL, verified 15 columns & 4 RLS policies |

---

## 4. Known Production Differences (Pre-Promotion vs Candidate)

| Surface | Live Production (`550b9e2`) | Candidate (`9088511`) | Expected Post-Promotion |
|---|---|---|---|
| `/news-sitemap.xml` | 404 Not Found | 200 OK (`<news:news>`) | 200 OK |
| `/llms.txt` | 404 Not Found | 200 OK (Markdown manifest) | 200 OK |
| Editorial Canonical | Points to root `https://thebreakdown.in` | Points to `/editorial-constitution` | Points to `/editorial-constitution` |
| Story Author Schema | `{"@type":"Organization","name":"The Breakdown Editorial"}` | `{"@type":"Person","name":"...","jobTitle":"..."}` | Person author emitted with registry details |
| Organization Schema | Missing trust/ethics URLs | Emits `publishingPrinciples`, `correctionsPolicy` | Trust URLs emitted |
| SSRF Security | Vulnerable to 169.254. link-local | Link-local metadata, localhost, private IPs blocked | Blocked |
| Supabase DB | Migration 017 Pending | Migration 017 Deployed | Verified Deployed |

---

## 5. Promotion Verdict

**READINESS VERDICT: APPROVED FOR PROMOTION TO MAIN**  
All candidate commits are strictly scoped to AEO/GEO architecture, fully verified across local, rendered, and database layers, with zero regressions.
