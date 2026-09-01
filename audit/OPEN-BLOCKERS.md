# Open Blockers & Launch Classifications — The Breakdown

Last Updated: 01 Sep 2026 (Sprint 19)

---

## 1. Blocker Registry & Ownership Matrix

| Blocker | Owner | Severity | Date Identified | Next Action | Deadline | Escalation |
| :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| **No Google Search Console access** | Analytics / Growth | Low | 2026-08-30 | Claim domain profile ownership in Search Console and map sitemap.xml | 2026-09-30 | Business Lead |
| **Google Analytics 4 local stream active** | Analytics / Growth | Medium | 2026-08-30 | Maintain verified local stream `G-79ZCJWS0WS`; verify edge production stream on deploy | 2026-09-30 | Engineering Lead |
| **No newsletter provider credentials (Beehiiv)** | Growth / Sales | Medium | 2026-08-30 | Provide production `BEEHIIV_API_KEY` and `BEEHIIV_PUB_ID` (Stub fallback active) | 2026-09-30 | Business Lead |
| **No ad network credentials (AdSense)** | Engineering | Low | 2026-08-30 | Provide `NEXT_PUBLIC_ADSENSE_CLIENT` (Membership placeholder fallback active) | 2026-09-30 | Business Lead |
| **No consumer payment credentials (Stripe)** | Engineering | Medium | 2026-08-30 | Provide `STRIPE_SECRET_KEY` (Mock checkout & B2B invoicing active) | 2026-09-30 | Business Lead |
| **No Supabase production database credentials** | Engineering | High | 2026-08-30 | Provide target connection string `DATABASE_URL` and service role key for persistence | 2026-09-30 | Engineering Lead |

---

## 2. Launch Integrity & Fallback Validation
- All client-side fallback mechanisms have been validated:
  - If GA4 is missing, event tracking degradations are handled without console exceptions.
  - If Beehiiv is missing, the API defaults cleanly to the console log `StubProvider`.
  - If AdSense is missing, ad components render elegant placeholders mapping to membership panels.
  - If Stripe is missing, checkout routes simulate redirects and save mock token configurations to localStorage.
