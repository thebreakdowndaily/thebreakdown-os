# RELEASE-3.0 — Deployment Guide

## Target
Vercel (existing platform infrastructure). Cloudflare edge continues to front the domain.

## What ships

| Surface | Runtime | Notes |
|---------|---------|-------|
| `/up403` | Static | Server component, reads canonical data at build |
| `/up403/[slug]` (403) | SSG | Pre-rendered at build; revalidates per Vercel defaults |
| `/up403/timeline/[id]` (403) | SSG | Pre-rendered at build |
| `/up403/stories` | Static | Server component |
| `/up403/map`, `/compare`, `/search`, `/explore`, `/query`, `/collections` | Static + client fetch | Client fetches `/api/up403/v1/...` |
| `/up403/evidence/[id]`, `/up403/constituencies/[id]`, `/api/up403/v1/*` | Dynamic | Research workspace + Research API (unchanged) |
| `/sitemap.xml`, `/robots.txt` | Generated | From `app/sitemap.ts`, `app/robots.ts` |

## Runtime dependencies

- Reader pages read the canonical dataset at build time via `lib/up403/loader.ts` (imported JSON + service layer). No database or Supabase dependency for the reader experience.
- Interactive components call the Research API routes in the same deployment — no external services.
- Analytics events are captured in-memory via `PluginAnalyticsService`; no analytics provider endpoint required at launch.

## Release checklist

1. `npx eslint` — clean on all changed files.
2. `npx tsc --noEmit` — no new errors (7 pre-existing in `components/story/` are out of scope and pre-date this release).
3. `npx next build` — passes; verify `/up403/[slug]` (403) and `/up403/timeline/[id]` (403) SSG entries appear.
4. Deploy to Vercel (preview first), verify:
   - `/up403`, a profile (`/up403/up-ac-001`), map, compare, search, stories, timeline render.
   - `/sitemap.xml` lists the `/up403` tree; `/robots.txt` allows it.
   - Static segments resolve (not shadowed by `[slug]`).
5. Post-deploy Lighthouse run (desktop + mobile) on `/up403` and one profile — confirm LCP < 2.5s, CLS < 0.1, INP < 200ms, score ≥ 95.
6. Freeze as **The Breakdown Intelligence Platform v1.0** once certification + post-deploy lab results are recorded.

## Rollback

Static surfaces are trivially reversible: the previous `/up403` dashboard renders are preserved in git history, and the Research workspace (unchanged routes) is unaffected by a revert.
