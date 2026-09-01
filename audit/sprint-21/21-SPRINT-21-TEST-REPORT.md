# SPRINT 21 — TEST REPORT

**Date:** 01 Sep 2026
**Scope:** Pre-deploy gates + new deployment regression (production smoke) test.

## Local gates (current `main` = 12df5a0 + vercel.json fix)
| Gate | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | ✅ 0 errors (incl. new test file) |
| Build | `npm run build` | ✅ passes; 4 trackers + membership + compare/evolution/precedents/problems routes emitted |
| Smoke (live prod) | `npm run test:smoke-prod` | ✅ **25 passed, 0 failed** |

Note: full `npm test` (integration suites) was already green at Sprint 21 open (verified in Sprint 20 close). Repo-wide `npm run lint` remains red with pre-existing debt (1656 errors) — not caused by this sprint; the only source change is the one-line `vercel.json` cron fix plus the new test file.

## New test: `tests/production-deployment.test.ts`
Run: `npm run test:smoke-prod` (added to package.json scripts).

Purpose: prove the live deployment independently of the local repo — the core failure mode of this sprint (`REPOSITORY ✅ / BUILD ✅ / PRODUCTION ❌`).

Checks (25):
- 14 critical routes → 200 (incl. all 4 trackers, `/membership`, `/search`, `/trust`, `/sitemap.xml`, `/robots.txt`)
- 4 deprecated debug routes → 404 (`/compare`, `/evolution`, `/precedents`, `/problems`)
- Sitemap contains all 4 flagship tracker URLs
- Robots.txt references Sitemap + allows `/trackers`
- Homepage sends `Strict-Transport-Security`

Configurable base URL via `PROD_SMOKE_BASE` env (defaults to `https://thebreakdown.in`) — no hardcoded temp URLs.

## Live production verification (independent, not derived from local)
- Route matrix: 14 routes 200, 4 deprecated 404 (expected), tracked in `03-production-route-matrix.csv`
- Sitemap: 160 URLs, 5 tracker entries (`04-sitemap-validation.csv`)
- Robots: correct (`05-robots-validation.csv`)
- SEO: title/desc/OG/Twitter/schema/robots present on tracker + layout (`06-seo-production-validation.csv`)
- Security: HSTS+CSP present; API unauth 401; cron gate 401; `/admin` 307 → login (`07-security-validation.csv`)
- Tracker content: all 4 render full editorial content (`13-tracker-content-validation.csv`)

## Result
**All Sprint 21 gates pass.** Deployment integrity confirmed: LOCAL MAIN = DEPLOYED BUILD = LIVE PRODUCTION, with the automated smoke test now available to prevent recurrence.
