# Open Blockers & Launch Classifications — The Breakdown

Last Updated: 01 Sep 2026 (Sprint 21)

---

## 1. Blocker Registry & Ownership Matrix

| Blocker | Owner | Severity | Date Identified | Next Action | Deadline | Escalation |
| :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| **~~CRITICAL: production not running current `main`~~** | Engineering | ~~CRITICAL (P0)~~ | 2026-09-01 | **RESOLVED 2026-09-01** — deployed `dpl_42CbGLFn` (12df5a0 + cron fix) READY; trackers+membership+search+trust all live 200 | ✅ CLOSED | — |
| **~~No production deploy credentials~~** | DevOps | ~~CRITICAL (P0)~~ | 2026-09-01 | **RESOLVED** — Vercel CLI authenticated + project linked; used to deploy main | ✅ CLOSED | — |
| **release blocker: vercel.json hourly cron** | Engineering | **CRITICAL (P0)** | 2026-09-01 | **FIXED** — `30 * * * *` → `0 6 * * *` (Hobby = 1 cron/day); this caused repeated `deploy_failed` | ✅ CLOSED | — |
| **Google Analytics 4 NOT in production** | Analytics / Growth | **HIGH (P1)** | 2026-09-01 | No GA tag served (verified HTML); needs valid production GA4 property + `NEXT_PUBLIC_GA_MEASUREMENT_ID` env + redeploy. Do NOT use local stream `G-79ZCJWS0WS`. | 2026-09-30 | Engineering Lead |
| **No Google Search Console access** | Analytics / Growth | Medium | 2026-08-30 | Claim domain profile ownership and map sitemap.xml | 2026-09-30 | Business Lead |
| **No newsletter provider credentials (Beehiiv)** | Growth / Sales | Medium | 2026-08-30 | Provide production `BEEHIIV_API_KEY` and `BEEHIIV_PUB_ID` (Stub fallback active) | 2026-09-30 | Business Lead |
| **No ad network credentials (AdSense)** | Engineering | Low | 2026-08-30 | Provide `NEXT_PUBLIC_ADSENSE_CLIENT` (Membership placeholder fallback active) | 2026-09-30 | Business Lead |
| **No consumer payment credentials (Stripe)** | Engineering | Medium | 2026-08-30 | Provide `STRIPE_SECRET_KEY` + production webhook secret; no live charge tested (bank transfer is only real settlement path) | 2026-09-30 | Business Lead |
| **No Supabase production database credentials** | Engineering | High | 2026-08-30 | Provide target `DATABASE_URL` / service role for persistence; entitlements modeled locally only | 2026-09-30 | Engineering Lead |
| **First Revenue Gate: ₹0 verified cash** | Finance / Operations | **HIGH (P0)** | 2026-09-01 | Drive INV-2026-01 (CPR) + INV-2026-02 (NIAP) to cleared bank settlement | 2026-09-30 | Business Lead |
| **security hardening: x-content-type-options, x-frame-options, referrer-policy absent** | Engineering | **P1** | 2026-09-01 | Add `nosniff` + `referrer-policy` headers (x-frame-options partially mitigated by CSP frame-ancestors none) | 2026-09-07 | Engineering Lead |
| **story redirect defect `/story/mgnrega-reform` → 404 chapter** | Editorial + Engineering | **P1** | 2026-09-01 | 308 to `/series/economic-policy-2026/volume/structural-reforms/chapter/mgnrega-reform` which 404s; valid chapter route works (200) — data mapping defect | 2026-09-07 | Editorial |
| **cron route `/api/v2/newsroom/observations/pull` not operational** | DevOps | P2 | 2026-09-01 | needs `CRON_SECRET` env + middleware exemption active; PIB pull never runs (not a release blocker) | 2026-09-30 | DevOps Lead |

---

## 2. Launch Integrity & Fallback Validation
- All client-side fallback mechanisms have been validated:
  - If GA4 is missing, event tracking degradations are handled without console exceptions.
  - If Beehiiv is missing, the API defaults cleanly to the console log `StubProvider`.
  - If AdSense is missing, ad components render elegant placeholders mapping to membership panels.
  - If Stripe is missing, checkout routes simulate redirects and save mock token configurations to localStorage.

---

## 3. Sprint 20 Discovery — Deployment Gap (evidence)

Verified 2026-09-01 via live HTTP probes to `https://thebreakdown.in`:
- `/trackers`, `/trackers/mgnrega`, `/trackers/upi`, `/trackers/pmfby`, `/trackers/semiconductor` → **404**
- `/compare`, `/evolution`, `/precedents`, `/problems`, `/membership` → **404**
- `/trust`, `/methodology`, `/entity/*`, `/topic/*`, `/series`, `/topics`, `/entities`, `/data`, `/fix`, `/tracking` → **200** (core baseline deployed)
- `/sitemap.xml` → 112 URLs, **0 tracker entries** (current main sitemap includes 5 tracker URLs)
- Homepage nav lacks "Trackers" link

Local `main` (`bb96d58`) builds all of the above (verified: `tsc` 0 errors, full test suite green, `next build` emits tracker + membership routes). Conclusion: **production deployment lags current `main`.** Prior sprint reports that described trackers as "PRODUCTION VERIFIED / live smoke test passed" were not validated against the live tracker routes and are hereby **reclassified as NOT DEPLOYED**. Tracker-related production claims awaiting redeploy.

---

## 4. Sprint 21 Resolution — Deployment Repaired (evidence, 2026-09-01)

- **Root cause:** `vercel.json` hourly cron (`30 * * * *`) exceeded Vercel Hobby limit (1 cron/day) → every production deploy returned `deploy_failed`. Fixed to `0 6 * * *`.
- **Deployed:** `dpl_42CbGLFn3jrSRPhQHKK5N549uFki` (source `12df5a0` + cron fix), target production, READY 2026-09-01 17:23:53 UTC.
- **Route results (live):** `/`, `/trackers`, all 4 trackers, `/membership`, `/search`, `/trust`, `/topics`, `/series`, `/data`, `/sitemap.xml`, `/robots.txt` → **200**. `/compare`, `/evolution`, `/precedents`, `/problems` → **404 by design** (DEPRECATED_DEBUG_ROUTES, middleware.ts:42).
- **Sitemap:** 160 URLs incl. 5 tracker entries (was 112 / 0 trackers).
- **Smoke:** `npm run test:smoke-prod` = **25/25 PASS** (new `tests/production-deployment.test.ts`).
- **Tracker content:** all four render full editorial content (metrics, charts, evidence chain, documents) — verified `13-tracker-content-validation.csv`.
- **GA4:** verified NOT firing (no tag); **revenue stays ₹0** (no settlement evidence).

**Production state post-Sprint 21: READY (release integrity) / CONDITIONAL (measurement + hardening open).**
