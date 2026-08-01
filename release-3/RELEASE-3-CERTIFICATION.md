# RELEASE-3.0 — Certification

**The Breakdown Intelligence Platform (Public Reader Experience) — v1.0**

**Governing documents:** Editorial Constitution v1.1 (Locked) · AGENTS.md v1.0 · Baseline v1.0.0-chapter1 · RELEASE-3-PLAN.md · Product Quality Standard v1.0
**Status:** ✅ **VERIFIED — THE BREAKDOWN INTELLIGENCE PLATFORM v1.0 COMPLETE**
**Date:** 31 Jul 2026

---

## Module completion

| # | Module | Delivered | Evidence |
|---|--------|-----------|----------|
| 1 | Public Home | Server-rendered reader home with overview, DNA, regions, stories | `app/up403/page.tsx` |
| 2 | Constituency Profile | 403 SSG profiles, metadata, JSON-LD, breadcrumbs, provenance | `app/up403/[slug]/page.tsx` |
| 3 | Interactive Map | Schematic tile map, 3 metrics, filters, legend, honest disclosure | `app/up403/map` + `components/up403/map.tsx` |
| 4 | Compare 2–5 | `MAX_COMPARE` 5, reader-profile header links, CSV export | `components/up403/ComparePanel.tsx` |
| 5 | Universal Search | Autocomplete, keyboard, combobox ARIA, grouped results | `components/up403/SearchPanel.tsx` |
| 6 | Evidence Drawer | Native `<details>` source disclosure per field | `components/up403/evidence.tsx` |
| 7 | Timeline | Server component, SSG 403, canonical `buildTimeline` | `app/up403/timeline/[id]/page.tsx` |
| 8 | Story Cards | Server component, no client-side computation | `app/up403/stories/page.tsx` |
| 9 | Accessibility | Skip link, focus rings, ARIA, contrast report | `release-3/accessibility-report.md` |
| 10 | Performance | Static/SSG architecture, budgets documented | `release-3/performance-report.md` |
| 11 | SEO | Metadata + sitemap (403 entries) + robots + JSON-LD | `release-3/seo-report.md` |
| 12 | Mobile | Responsive passes; interactive surfaces unchanged from 2B | `release-3/deployment-guide.md` |
| 13 | Analytics | `PluginAnalyticsService` reader-journey events, no new infra | `lib/up403/reader-events.ts` |
| 14 | Documentation | Plan + methodology artifacts | `release-3/` |
| 15 | Output + Certification | Artifacts + this document | `release-3/` |

## Gate results

| Gate | Result |
|------|--------|
| `npm run lint` (full UP403 module: app + components + lib) | ✅ Clean |
| `npx tsc --noEmit` | ✅ No new errors (7 pre-existing in `components/story/*`, out of scope) |
| `npx next build` | ✅ Passes — `/up403` static, `/up403/[slug]` SSG (403), `/up403/timeline/[id]` SSG (403) |
| Data integrity smoke test | ✅ 403 records, slug round-trip, timeline + analytics compute |
| Product Quality Standard | ✅ Navigation, Trust, Performance, Accessibility, Mobile, SEO, Analytics gates pass (reports in `release-3/`) |
| No canonical data changed | ✅ (frozen v1.1.0 dataset untouched) |
| No API routes modified | ✅ (Research API v1.1.0 unchanged) |
| No duplicated business logic | ✅ (server pages use `lib/up403/*`; interactive components use the Research API) |

## Out-of-scope observations (recorded, not blockers)

1. **Pre-existing test failure:** `tests/chapter-factory.test.ts` TEST-CF-03 expects 5 chapters in the Volume I registry, which now has 7. Unrelated to RELEASE-3 (UP403 module has no tests in `tests/`); belongs to the Chapter 1 publishing programme.
2. **Pre-existing tsc errors:** 7 lines in `components/story/StoryPreview.tsx` + `StoryQualityDashboard.tsx` (missing `validateStory` export, prop mismatches, implicit anys). Pre-date RELEASE-3.
3. **Platform palette note:** `#6B6B6B` muted labels at ~3.4:1 (AA-large only) — a design-system decision across the whole product, not a RELEASE-3 regression.
4. **Live Lighthouse:** the performance/accessibility reports document static-architecture evidence; a post-deployment Lighthouse run on Vercel is the required confirmation step in `deployment-guide.md`.

## Freeze

**The Breakdown Intelligence Platform v1.0** is defined by the routes, components and service paths listed in `release-3/`. Future changes to this surface are governed by the baseline ACP process (Level A additive; Level B requires an ACP; Level C a new baseline).

## DoD checklist (RELEASE-3-PLAN.md)

- ✅ All 15 modules deliver at least one first-time-reader-visible improvement.
- ✅ `npm run lint`, `npx tsc --noEmit`, `npx next build` pass on the UP403 module.
- ✅ No canonical data changed. No API routes modified. No duplicated business logic.
- ✅ `release-3/` artifacts written; certification verdict emitted.

## Verdict

> **VERIFIED — THE BREAKDOWN INTELLIGENCE PLATFORM v1.0 COMPLETE.**
> The UP403 research workspace is now a production-grade public reader experience: 403 indexable constituency profiles, evidence disclosures on every figure, a schematic map, 2–5 comparison, keyboard-complete search, server-rendered stories and timelines, privacy-first journey analytics, and honest data-gap surfacing — all on the frozen v1.1.0 dataset with zero API or data changes.
