# Open Blockers & Launch Classifications — The Breakdown

Last Updated: 01 Sep 2026 (Sprint 20)

---

## 1. Blocker Registry & Ownership Matrix

| Blocker | Owner | Severity | Date Identified | Next Action | Deadline | Escalation |
| :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| **CRITICAL: production not running current `main`** | Engineering + Business Lead | **CRITICAL (P0)** | 2026-09-01 | Deploy current `main` (`bb96d58`) to production; verify `/trackers/*`, `/membership/*`, `/compare`, `/problems` return 200; confirm sitemap ≥117 URLs incl. tracker entries | 2026-09-07 | Business Lead |
| **No production deploy credentials from this environment** | Engineering / Business Lead | **CRITICAL (P0)** | 2026-09-01 | Provide Vercel/deploy access or run deploy from the environment with credentials | 2026-09-07 | Business Lead |
| **No Google Search Console access** | Analytics / Growth | Medium | 2026-08-30 | Claim domain profile ownership in Search Console and map sitemap.xml | 2026-09-30 | Business Lead |
| **Google Analytics 4 local stream only** | Analytics / Growth | Medium | 2026-08-30 | Provide production property access; verify edge production stream on deploy | 2026-09-30 | Engineering Lead |
| **No newsletter provider credentials (Beehiiv)** | Growth / Sales | Medium | 2026-08-30 | Provide production `BEEHIIV_API_KEY` and `BEEHIIV_PUB_ID` (Stub fallback active) | 2026-09-30 | Business Lead |
| **No ad network credentials (AdSense)** | Engineering | Low | 2026-08-30 | Provide `NEXT_PUBLIC_ADSENSE_CLIENT` (Membership placeholder fallback active) | 2026-09-30 | Business Lead |
| **No consumer payment credentials (Stripe)** | Engineering | Medium | 2026-08-30 | Provide `STRIPE_SECRET_KEY` + production webhook secret; no live charge tested | 2026-09-30 | Business Lead |
| **No Supabase production database credentials** | Engineering | High | 2026-08-30 | Provide target connection string `DATABASE_URL` and service role key for persistence | 2026-09-30 | Engineering Lead |
| **First Revenue Gate: ₹0 verified cash** | Finance / Operations | **HIGH (P0)** | 2026-09-01 | Drive INV-2026-01 (CPR) + INV-2026-02 (NIAP) to cleared bank settlement | 2026-09-30 | Business Lead |

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
