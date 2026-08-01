# RELEASE-3.0 — Reader Pages

## Home — `app/up403/page.tsx`

Reworked from research dashboard to public home. Async server component consuming `lib/up403/loader.ts` + `lib/up403/analytics.ts` directly (canonical service path, no HTTP round-trip).

Sections:
- Hero + search form → `GET /up403/search?q=` (native form, works without JS).
- Overview stat cards (403 seats via `getTotalConstituencies()`, districts, divisions, regions, PC links, elections).
- Assembly control bars (party seat shares) with party colour coding.
- Political DNA distribution (CONTESTED / POST_2014_REALIGNMENT / SP_FORTRESS / INCUMBENT_STRONGHOLD / SWING).
- Region cards → `/up403/explore?region=` — honest schematic (no boundary geometry).
- Platform explore cards (Map, Compare, Search, Stories, Research tools).
- Top story candidates via `runStoryDiscovery(getCachedData())`.
- Trust / "how to read this data" section with provenance and research-cutoff framing.

## Constituency profile — `app/up403/[slug]/page.tsx` (NEW)

Server component, 403 paths via `generateStaticParams`. Slug = lowercased canonical ID (`up-ac-001`).

- `generateMetadata` → title, description, canonical, OG, Twitter per constituency.
- JSON-LD `Place` + `BreadcrumbList` structured data.
- Visible breadcrumbs: Uttar Pradesh / Constituency / section.
- Cards: Current MLA, Current MP, Political DNA panel (sub-type, reasoning, competitiveness, volatility, trajectory/confidence), election history 2012/2017/2022 (winner, party, vote share, margin, runner-up; 2022 highlighted), geography/administration grid, development & services rows, economy grid with availability status, governance section with honest gap phrasing.
- Every statistic carries `EvidenceBadge`; full record provenance in a `DatasetProvenance` block.
- Cross-links: timeline, evidence, research view, map.

## Stories — `app/up403/stories/page.tsx`

Converted from client to server component. `runStoryDiscovery` now executes server-side — the platform no longer computes analytics-derived conclusions in the browser. Native `<details>` per story, headline linking to `/up403/{slug}`, evidence list, party pills. `DATA_GAPS` section retained.

## Timeline — `app/up403/timeline/[id]/page.tsx`

Converted from client to server component (SSG, 403 paths). Reads `buildTimeline(rec)` from `lib/up403/timeline.ts` (same canonical derivation as the API route). Breadcrumbs now route through the reader profile. `generateMetadata` + canonical per constituency. Research view retained via secondary link.

## Interactive — `app/up403/map`, `app/up403/compare`, `app/up403/search`

Statically segmented pages that continue to fetch from the Research API (`/api/up403/v1/...`) through `useUp403Data`. Upgrades described in `interactive-map.md` and `component-library.md`.
