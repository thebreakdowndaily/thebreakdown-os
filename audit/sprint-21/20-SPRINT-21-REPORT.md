# SPRINT 21 — Production Deployment Recovery, Live Route Verification & Release Integrity

**Sprint date:** 01 Sep 2026
**Target completion:** 07 Sep 2026
**Status:** REPORT / DEPLOYMENT COMPLETE

---

## Executive Summary

Sprint 20 discovered the most important production defect: **`origin/main` was ahead of what `thebreakdown.in` was serving** — all four flagship trackers, `/membership`, and knowledge routes returned 404 while local `main` built them.

**Sprint 21 root cause found and fixed.** The production deployment failures were caused by `vercel.json` defining an **hourly cron** (`30 * * * *`) which **Vercel Hobby accounts do not permit** (max 1 cron/day). Every production deployment attempt errored with `deploy_failed`, so the live alias never advanced past the 13 Aug 2026 build. This is the Release-Integrity blocker that this sprint existed to find.

## What was deployed

- **Hosting:** Vercel (project `thebreakdown-os`), domain `thebreakdown.in` behind Cloudflare CDN.
- **Deployment:** `dpl_42CbGLFn3jrSRPhQHKK5N549uFki` — `https://thebreakdown-4ktlgpbfe-bholebababhakti108-makers-projects.vercel.app`, target=production, **status READY**, created 2026-09-01 17:23:53 UTC.
- **Deployed source:** commit `12df5a0` (clean `main`, HEAD==origin) + the committed `vercel.json` cron fix (`0 6 * * *`). Deployment access was AVAILABLE (authenticated Vercel CLI + linked project).
- **Release block resolved:** changed `vercel.json` cron `30 * * * *` → `0 6 * * *` (Hobby daily limit).

## Release integrity result

```
LOCAL MAIN ✅ (12df5a0, tsc 0, build passes, trackers+membership emitted)
      = DEPLOYED BUILD ✅ (dpl_42CbGLFn READY)
      = LIVE PRODUCTION ✅ (thebreakdown.in serves all intended routes)
```

Independently verified at the **live HTTP layer** (not local/audit):
- `/`, `/trackers`, `/trackers/mgnrega`, `/trackers/upi`, `/trackers/semiconductor`, `/trackers/pmfby`, `/membership`, `/search`, `/trust`, `/topics`, `/series`, `/data`, `/sitemap.xml`, `/robots.txt` → **all 200**
- Deprecated debug routes `/compare`, `/evolution`, `/precedents`, `/problems` → **404 by design** (`middleware.ts:42` `DEPRECATED_DEBUG_ROUTES`), faithfully served from `main`
- Sitemap → **160 URLs** (up from 112), includes all 5 tracker entries (was 0 in Sprint 20)
- Robots → correct allow/disallow + `Sitemap:` reference + Cloudflare Content-Signals (search=yes, ai-train=no)
- Automated smoke: **`npm run test:smoke-prod` = 25/25 PASS** against live production

## Key findings beyond deploy

1. **GA4 is NOT firing in production.** No `G-`/`GTM-` tag in served HTML; `NEXT_PUBLIC_GA_MEASUREMENT_ID` absent from Vercel env. `app/layout.tsx:89-92` injects only when set. **BLOCKED** — needs a valid production GA4 property + env + redeploy. Local test stream `G-79ZCJWS0WS` must NOT be used for production (environment-separation doctrine).
2. **GSC / Beehiiv / Stripe / CRON secret** — all BLOCKED (no credentials/access in this environment). Documented, not fabricated.
3. **Security:** HSTS + CSP strong; `/api/*` unauth → 401; `/api/v2/newsroom/observations/pull` → 401 (cron gate); `/admin` → 307 login. **Hardening gap:** `x-content-type-options` (nosniff), `x-frame-options`, `referrer-policy` absent.
4. **Content defect surfaced:** `/story/mgnrega-reform` 308s to `/series/economic-policy-2026/volume/structural-reforms/chapter/mgnrega-reform` which **404s** (chapter data not resolveable). Valid chapter route (`/series/foundations-1947-1962/.../indias-inheritance`) works (200), so routing is sound — the MGNREGA chapter mapping is the defect. Owner: Editorial + Engineering.
5. **Cron route not operational:** `/api/v2/newsroom/observations/pull` requires `CRON_SECRET` (absent) + middleware `x-api-key` gate; the PIB pull never runs. Not a release blocker (cron is a background ingestion feature) but documented.

## Tracker content (verified, not just 200)

| Tracker | Metrics | Charts | Evidence Chain | Doc records |
|---|---|---|---|---|
| MGNREGA | 6 | 1 | ✓ | 5 |
| UPI | ✓ | 2 | ✓ | 3 |
| Semiconductor | ✓ | 1 | ✓ | 5 |
| PMFBY | 6 | 2 | ✓ | 4 |

All four flagship trackers render real editorial content: key metric ledgers, time-series charts (inline SVG), Recent Material Changes, Chronology, Evidence Provenance Chain (with sources + counterpoints), and Primary Official Documents with source links + inspect buttons. Redesigned frontend (Playfair/Inter dark theme) confirmed live.

## Governing constraints honored
- **Revenue stays ₹0** until actual bank clearance — no `INV-2026-01/02` settlement evidence, so no revenue claim changed.
- No new major features; no growth roadmap; no fabricated analytics. The only source change is the `vercel.json` cron limit fix (release-integrity requirement) + the automated smoke test (prevention mechanism).

## Ownership & status summary
| Area | Status |
|---|---|
| Deployment | ✅ DONE (READY) |
| Critical routes | ✅ PRODUCTION VERIFIED |
| Sitemap | ✅ PRODUCTION VERIFIED |
| Robots | ✅ PRODUCTION VERIFIED |
| SEO/canonical | ✅ PRODUCTION VERIFIED |
| Tracker content | ✅ PRODUCTION VERIFIED |
| Security | ⚠️ CONDITIONAL (hardening gaps open) |
| GA4/GSC/Beehiiv/Stripe/CRON | ⛔ BLOCKED (access required) |
| Revenue | ₹0 VERIFIED (invoices OUTSTANDING) |
| Performance/A11y/Frontend | ⚠️ CONDITIONAL (no browser RUM in env) |

## Final verdict
**Production is READY for the primary mission (release integrity)** — current `main` is deployed and independently proven via live routes + automated smoke (25/25 PASS). It is **CONDITIONAL** overall: GA4/GSC/Beehiiv/Stripe measurement and the 3 hardening/content defects remain open, each with owner + deadline in `18-ownership-deadlines.csv` / `OPEN-BLOCKERS.md`.
