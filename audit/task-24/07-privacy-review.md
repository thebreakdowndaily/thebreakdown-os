# TASK-24 — 07 · Privacy & Consent Review

**Date:** 2026-08-30
**Scope:** Every TASK-24 retention surface that touches a person's data.
**Standard:** Editorial Constitution (transparency), DPDP-aligned posture for Indian users, GA4/analytics no-PII rule (TASK-07), and the platform's "evidence before conclusions" culture — privacy included.

---

## 1. Data touchpoints inventory

| Touchpoint | Data captured | Where it goes | Persistent? |
|------------|---------------|---------------|-------------|
| Newsletter API `/api/newsletter` | Email (trimmed, lowercased) | Delivery provider double opt-in only | In-memory rate-limit digest only; raw email never stored |
| Newsletter rate limiter | SHA-256(`ip:email`) | Process memory `Map` | Cleared after TTL / bounded (≤1000 entries) |
| Newsletter analytics | `page` label only | GA4 (production host gate) | No PII in payload |
| Reader-state follows/saves | Topic slug/name, story slug/headline, timestamps | `localStorage` (stays in browser) | Device-resident only |
| Reading history | Story slug/headline/`readAt` (pre-existing) | `localStorage` | Device-resident only |
| Topic visits | Topic slug + last-visit epoch | `localStorage` | Device-resident only |

## 2. What is NOT captured

- No email/IP in analytics payloads (asserted by test).
- No free-text fields anywhere in retention events.
- No user account **required** for any retention feature. Follows/saves/history are anonymous device-local state.
- No cross-device sync, no fingerprinting, no third-party reader-tracking beyond the existing GA4 host-gated dispatch.
- No ad-targeting forms; no push; no personalization feeds.

## 3. Consent posture

| Concern | Posture |
|---------|---------|
| Newsletter opt-in | **Double opt-in by construction** — a subscription only becomes real when the provider sends and the reader confirms. No unilateral "subscribe on page load". |
| Consent transparency | Every console states it plainly: "Double opt-in required. One confirmation email … Free. Unsubscribe anytime." |
| Unsubscribe | Delivery provider's own unsubscribe link in every edition (provider contract); we never suppress it. |
| Analytics consent | Follows the platform's existing TASK-07 posture: GA4 dispatch only on the production host; event payloads PII-free. No new consent banner introduced in this task (pre-existing site policy governs). |

## 4. Design-level mitigations

1. **No fake success (trust-as-privacy):** a reader who believes they subscribed when they did not has, in effect, had consent extracted without the mechanical fact. The honest `submitted`/`unavailable` contract removes this. Verified by automated tests.
2. **Hashed rate-limit keys:** raw `ip` + `email` never persist; only a digest. The map is bounded and TTL-cleaned.
3. **Minimal payloads:** every new event is allow-listed in `lib/analytics/capture.ts`; unknown params are dropped at dispatch, and a PII-scan guard runs in the retention test suite.
4. **Device-local isolation:** follow/save/visit data cannot be viewed by the institution — it is the reader's own browser data. This is stated to the reader on the empty states and Settings tab ("It stays on this device.").

## 5. Security review of new code

| Item | Review |
|------|--------|
| Email validation | Regex + trim/lowercase on server; invalid → 400 before any provider call |
| Rate limiting | 1/min per ip+email digest; 429 with retry copy |
| No secrets in client | Provider key read server-side from `process.env`; never bundled to client |
| CSP | No CSP change required — provider call is server-side (route handler fetch), not subject to browser `connect-src` |
| Error handling | Provider/network failures return honest `error` (500); no stack/credential leakage in responses (fixed messages) |
| Storage safety | `localStorage` reads tolerate corrupt/quota-full storage; never throw |

## 6. Findings

| ID | Finding | Severity | Resolution |
|----|---------|----------|------------|
| P1 | Pre-fix `StubProvider` reported `success:true` unconditionally — a consent-integrity bug | **Critical** | Rewritten honest contract; `unavailable` when unconfigured (shipped) |
| P2 | `BeehiivProvider` silently fell back to the stub when `BEEHIIV_PUB_ID` was missing | Critical | Now requires the ID, else `unavailable`; verified by test |
| P3 | `/reader` previously gated behind an account — arguably *over*-collecting friction, and inconsistent with no-account-to-read | Low | Removed gate; account now optional, Settings-only |
| P4 | Rate-limit history map had no bound in the older design | Medium | Bounded to 1000 entries + TTL cleanup (existing route) |

## 7. Residual risks (accepted, documented)

- **Production provider dependency:** with no `BEEHIIV_API_KEY` deployed, signups are honestly closed. Enabling Beehiiv is a delivery-run decision, not a code change.
- **GA4 collection** continues to be governed by the platform's pre-existing analytics disclosure; no new first-party reader identifier was introduced by this task.

## 8. Sign-off

Privacy review passed with the fixes above. Live provider behaviours remain **NOT VERIFIED — PRODUCTION ACCESS REQUIRED**.