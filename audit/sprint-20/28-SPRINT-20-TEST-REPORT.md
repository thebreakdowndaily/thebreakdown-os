# THE BREAKDOWN — SPRINT 20 TEST REPORT

Date: 01 Sep 2026
Commit under test: `bb96d58`
Environment: local (Windows, Node) — production access unavailable for external integrations
Gates: AGENTS.md v1.0 (typecheck, tests, build, lint)

---

## 1. Gate Summary

| Gate | Command | Result | Notes |
|---|---|---|---|
| Type check | `npm run check:type` (`tsc --noEmit`) | **PASS** — 0 errors | Clean |
| Test suite | `npm test` (tsx chain) | **PASS** — all suites 0 failed | See §2 |
| Build | `npm run build` (`next build`) | **PASS** — all tracker + membership routes emitted | See §3 |
| Lint | `npm run lint` | FAIL (pre-existing repo-wide debt) | See §4 — no new debt introduced this sprint |

## 2. Test Suite Detail

| Suite | Result |
|---|---|
| Homepage Tests | 11 passed, 0 failed |
| Story Page Tests | 7 passed, 0 failed |
| Entity Tests | 6 passed, 0 failed |
| Search Tests | 4 passed, 0 failed |
| SEO Tests | 6 passed, 0 failed |
| Auth Tests | 26/26 passed, 0 failed |
| Presentation Model & Predicate Tests | 6 passed, 0 failed |
| Representative Story Matrix Tests | 5 passed, 0 failed |
| Story Matrix Results | 53 passed, 0 failed |
| Content Refresh Pipeline Tests | 11 passed, 0 failed |
| Programmatic SEO Tests | 9 passed, 0 failed |
| Monetization Tests | 5 passed, 0 failed |
| Advertising Tests | 3 passed, 0 failed |
| Membership Telemetry Tests | 3 passed, 0 failed |
| Premium Data Tests | PASSED |
| Institutional B2B Tests | 6 passed, 0 failed |
| Explorer Tests | 13 passed, 0 failed |
| Distribution Tests | 6 passed, 0 failed |
| Retention Tests | 70 passed, 0 failed |
| Tracker Framework | ALL PASSED |
| Evidence Trail & Provenance | ALL PASSED |
| UPI Tracker | ALL PASSED |
| Time-Series Chart | ALL PASSED |
| Primary Document Preview | ALL PASSED |
| PMFBY Tracker | ALL PASSED |

All test categories required by §39 (payment, webhook, auth, entitlement, tenant-isolation, analytics, newsletter, tracker, evidence, citation, SEO, accessibility) are represented in the gated chain or covered by the above modules. Note: payment/webhook/entitlement/tenant-isolation have **code-level tests only** — they cannot be exercised against production until Stripe + Supabase are provisioned.

## 3. Build Output Verification

Confirmed `next build` emits:
- `/trackers` (3.71 kB), `/trackers/mgnrega`, `/trackers/upi`, `/trackers/pmfby`, `/trackers/semiconductor` (all static)
- `/membership`, `/membership/licenses`, `/membership/success`

ImageIntelligence Wikimedia fetch warnings during build are pre-existing runtime fetch noise (no API key/sandbox response), unrelated to this sprint's scope, and do not fail the build.

## 4. Lint

`npm run lint` reports **1656 errors / 30 warnings repo-wide** — pre-existing debt in non-sprint source files (documented in prior audits, e.g., StoryShell, topic/[slug] page, citation service). **Sprint 20 made zero source-code changes** (all deliverables are audit CSV/MD artifacts), therefore **no new lint debt was introduced**. New artifacts (CSV/MD) are not linted by eslint.

## 5. Live Production Probes (2026-09-01)

| Route | Status | Meaning |
|---|---|---|
| `/`, `/trust`, `/methodology`, `/entity/ministry-of-rural-development`, `/topic/economy`, `/series`, `/topics`, `/entities`, `/data`, `/fix`, `/tracking` | 200 | Core surfaces live |
| `/trackers`, `/trackers/mgnrega`, `/trackers/upi`, `/trackers/pmfby`, `/trackers/semiconductor`, `/compare`, `/evolution`, `/precedents`, `/problems`, `/membership` | **404** | **NOT DEPLOYED — production not running current `main`** |
| `https://thebreakdown.in/sitemap.xml` | 200 — 112 URLs, **0 tracker entries** | Stale sitemap reflects old build |
| Security headers (homepage) | CSP present; HSTS max-age=63072000; server: cloudflare | Security baseline live |

## 6. Verdict

Code gates PASS (typecheck, tests, build). Lint FAIL is pre-existing debt, not introduced by this sprint. The **production deployment** does not match `main`; the single highest-leverage corrective action is to redeploy `main` and re-run production verification. External provider integrations remain unverified (access required).