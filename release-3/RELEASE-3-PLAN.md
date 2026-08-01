# RELEASE-3.0 — The Breakdown Intelligence Platform (Public Reader Experience)

**Governing documents:** Editorial Constitution v1.1 (Locked) · AGENTS.md v1.0 · Baseline v1.0.0-chapter1 · RELEASE-2B certification · UP403 Research API v1.1.0

**Status:** In Progress
**Depends On:** Frozen UP403 v1.1.0 dataset, Research API v1.1.0 (certified in release-2a), RELEASE-2B reader-adjacent UI.

## Objective

Transform the research-grade UP403 Constituency Intelligence workspace into a production-quality **public reader experience**, evidence-first preserved. A first-time reader must be able to browse Uttar Pradesh's 403 assembly constituencies, understand every figure's source in one click, and trust what they read.

## Hard Constraints (from RELEASE-3 brief)

1. Frontend is a presentation layer. No duplicated API logic, no client-side analytics computation.
2. All data flows from the canonical frozen dataset through the Research API service layer (`lib/up403/`). No raw table access, no new datasets.
3. Every statistic exposes Source / Authority / Dataset / Reference date / Verification date in one click (Module 6).
4. No opinion, no prediction, no editorializing. Evidence before conclusions.
5. Reader-facing improvement in every sprint; freeze as "The Breakdown Intelligence Platform v1.0" after certification.

## Data Access Doctrine

- **Reader pages** (server components) read the canonical dataset through `lib/up403/loader.ts` + `lib/up403/provenance.ts` + `lib/up403/analytics.ts` — the exact service layer the Research API routes use. This is not an API bypass: it is the same canonical code path, executed server-side, avoiding an HTTP round-trip while keeping a single source of truth.
- **Interactive components** (search, map, compare) fetch from the Research API (`/api/up403/v1/...`) exactly as in 2B.
- Server-safe formatters live in `lib/up403/format.ts` (pure). Client components re-export them via `components/up403/data.ts` so existing imports keep working. No formatting logic is duplicated.

## Route Strategy

| Route | Role | Rendered by | Notes |
|-------|------|-------------|-------|
| `/up403` | Public home | Server component | Reader-facing rework of research dashboard |
| `/up403/[slug]` | Reader constituency profile (slug = `up-ac-001`) | Server component, `generateStaticParams` | NEW. SEO, OG, breadcrumbs, JSON-LD |
| `/up403/map` | Interactive map | Client, data via Research API | NEW (Module 3) |
| `/up403/compare` | Compare 2–5 | Existing + upgrades | Static segment wins over `[slug]` |
| `/up403/search` | Universal search | Existing + upgrades | |
| `/up403/stories`, `/up403/timeline/[id]` | Story cards, timeline | Existing | |
| `/up403/explore`, `/up403/query`, `/up403/collections`, `/up403/evidence/[id]`, `/up403/constituencies/[id]` | Research workspace | Existing (unchanged) | Accessible via Research link |

Static segments take precedence over dynamic `[slug]` in Next.js, so `/up403/map`, `/up403/search`, etc. resolve to their static routes. The research profile at `/up403/constituencies/[id]` remains available for researchers.

## Module → Asset Map

| # | Module | Primary assets | Status |
|---|--------|----------------|--------|
| 1 | Public Home | `app/up403/page.tsx` (server rework) | Done |
| 2 | Constituency Profile | `app/up403/[slug]/page.tsx` (new) | Done |
| 3 | Interactive Map | `app/up403/map/page.tsx` + `components/up403/map.tsx` (SVG schematic) | Done |
| 4 | Compare 2–5 | `app/up403/compare` + `ComparePanel` upgrades | Done |
| 5 | Universal Search | `app/up403/search` + `SearchPanel` upgrades (autocomplete, keyboard) | Done |
| 6 | Evidence Drawer | `components/up403/evidence.tsx` (native `<details>` disclosure, server-safe) | Done |
| 7 | Timeline | `app/up403/timeline/[id]` + `lib/up403/timeline.ts` | Done (server rewrite) |
| 8 | Story Cards | `app/up403/stories` + `lib/up403/stories.ts` | Done (server rewrite) |
| 9 | Accessibility (WCAG AA) | Audit all new pages | Done |
| 10 | Performance | LCP < 2.5s, CLS < 0.1, INP < 200ms; Lighthouse ≥ 95 | Done (report) |
| 11 | SEO | `generateMetadata` on home/profile, sitemap `/up403` entries, robots | Done |
| 12 | Mobile | Responsive passes on all new pages | Done |
| 13 | Analytics | `PluginAnalyticsService.track()` on reader journeys (no new infra) | Done |
| 14 | Documentation | Plan, methodology note, this doc | Done |
| 15 | Output + Certification | `release-3/**` artifacts + `RELEASE-3-CERTIFICATION.md` | In Progress |

## Evidence Drawer Design (Module 6)

Native `<details>/<summary>` disclosure, server-component safe, keyboard and screen-reader accessible with zero JavaScript. Every statistic row renders a small source disclosure showing:

- Field authority (e.g. `Election Commission of India`)
- Dataset source (e.g. `UP403-DATA-01`)
- Quality (AUTHENTIC / DERIVED / METADATA / NOT_AVAILABLE)
- Dataset version + research cutoff + verification date

## Data-Gap Honesty

Where the frozen v1.1.0 dataset has no value (governance issues = 0, disaster risk = empty, reservation = GENERAL), reader pages surface the gap using the existing `DATA_GAPS` registry rather than implying data exists. `NOT_AVAILABLE` provenance is displayed as a positive transparency statement, not hidden.

## Definition of Done

- All 15 modules deliver at least one first-time-reader-visible improvement.
- Every reader page passes: `npm run lint` (new files clean), `npx tsc --noEmit`, `npx next build`.
- No canonical data changed. No API routes modified. No duplicated business logic.
- `release-3/` artifacts written and certification verdict emitted.
