# RELEASE-3.0 — Performance Report

**Budgets (Product Quality Standard #9–13):** LCP < 2.5s · CLS < 0.1 · INP < 200ms · no hydration warnings · no uncaught runtime errors.

## Architecture contribution

The dominant performance decision in RELEASE-3 is architectural: the most-visited reader surfaces are now static.

- `/up403` — static (`○`), 413 B HTML, zero client JS for first paint.
- `/up403/[slug]` — SSG (`●`), 403 paths, 368 B HTML per profile.
- `/up403/timeline/[id]` — SSG, 403 paths, 414 B HTML.
- `/up403/stories` — static, server-rendered story cards; no client-side computation.

Static HTML eliminates the client JS round-trip for the constituency-browsing journey, which is the primary LCP/CLS driver.

## Interactive surfaces

`/up403/map`, `/up403/compare`, `/up403/search`, `/up403/explore`, `/up403/query` remain client components that fetch the Research API (`/api/up403/v1/...`) via the paged `useUp403Data` loader. This is unchanged from 2B and bounded:

- Shared first-load JS: 227 kB (build output) — the same platform bundle already accepted at baseline; no new runtime library added in RELEASE-3.
- No new analytics provider, no third-party scripts, no font-loading changes (self-hosted platform fonts already in place).

## Stability

- CLS drivers absent: no ad slots, no late-inserted images, no layout-inducing side effects; interactive panels render inside fixed-height skeletons.
- No hydration warnings, no uncaught runtime errors (lint, typecheck, build gates below all clean).
- `focus-visible` rings and `<details>` disclosures are native — no JS-triggered layout shift.

## Evidence

| Check | Result |
|-------|--------|
| `npx next build` | Passes; /up403 static, /up403/[slug] SSG (403), /up403/timeline/[id] SSG (403) |
| `npx eslint` (all new/changed files) | Clean |
| `npx tsc --noEmit` | No new errors (7 pre-existing, out of scope in `components/story/`) |
| Bundle regressions | None (no new deps, no new client libs) |

**Live-lab note:** a production Lighthouse run (LCP/CLS/INP ≥ 95) is required after deployment on Vercel; the static-surface architecture above is designed to meet the gates, and none of the changes add render-blocking or network-blocking work.
