# TASK-24 — 02 · The Breakdown Brief — Newsletter Product Specification

**Date:** 2026-08-30
**Status:** Spec frozen for this task's scope (Level A/B compatible evolution; no schema change).

---

## 1. Positioning

The Breakdown Brief is the email product of The Breakdown Knowledge Platform. Its job is **retention of understanding**, not reach.

> What changed, why it matters, and the evidence behind it.

One email a week. One story that matters. The documents behind it. The questions we are still asking. No noise. No takes. Just understanding.

This copy is consistent with the institution's motto — *Evidence before conclusions. Context before certainty.* — and the Founding Edition's public-trust posture. It is not a marketing voice; it is the institution's voice in email.

## 2. Audience

Primary reader of the platform: university students, public-policy aspirants, journalists, and curious citizens who return for context, not headlines. The Brief serves the same reader in their inbox.

## 3. Delivery model

| Property | Value |
|----------|-------|
| Cadence | Weekly (1 edition) |
| Length | One deep dive + documents + reading-path links |
| Channel | Email via a delivery provider (Beehiiv contract; provider-agnostic abstraction) |
| Opt-in | **Double opt-in required** — provider sends the confirmation email |
| Price | Free |
| Account required to read site | No |
| Account required to subscribe | No (email only) |

## 4. Edition anatomy (editorial spec, out of engineering scope)

Each edition contains:

1. **The story** — one consequential analysis, in the platform's four-layer structure (What Happened / What the Evidence Shows / Where Historians Disagree / Why It Matters).
2. **Documents** — links to the primary sources behind the story.
3. **Key data** — figures the reader can verify.
4. **Open questions** — what we are still investigating.
5. **Paths onward** — related stories on the platform (canonical `story` links; tracked as `related_story_clicked`/`story_opened`).

## 5. Subscribe surfaces (implemented)

| Surface | Location | Behaviour |
|---------|----------|-----------|
| NewsletterBand | Homepage | Value-prop band + honest form (see states below) |
| StoryNewsletterCTA | Story end (StoryShell) | Persistent 7-day-dismissible inline CTA |
| /newsletter | Landing page | Value-prop + Subscribe CTA → /subscribe |
| /subscribe | Dedicated form | `SubscribeForm` |
| NewsletterTracker | Pages | Fires `newsletter_viewed` / `newsletter_started` (TASK-07 events) |

## 6. Honest state machine (engineering spec)

The delivery contract has exactly four end states (see `lib/newsletter/provider.ts`):

```
Reader submits email
   ├── provider accepts AND sends confirmation  → status = submitted    (HTTP 200)
   ├── provider confirms (double opt-in done)    → status = confirmed    (HTTP 200) — the ONLY state that fires newsletter_subscribed
   ├── no provider configured                    → status = unavailable  (HTTP 503)
   └── provider/network error                    → status = error        (HTTP 500)
```

**Rules**

1. `newsletter_subscribed` is emitted **only** when the provider returns `confirmed`. It is never fabricated, inferred from a 2xx, or defaulted.
2. A 2xx from the delivery provider means "accepted for confirmation email" → `newsletter_submitted`, **not** `confirmed`.
3. No provider configured → `unavailable`; consoles must display an honest "not accepting signups yet" state (no fake "You're subscribed").
4. The API never stores the email; the rate-limit key is a SHA-256 digest of `ip+email`, so raw PII never lives in the process map.

## 7. Analytics

| Event | When |
|-------|------|
| `newsletter_viewed` | Newsletter surface enters the viewport / page loads |
| `newsletter_started` | Reader submits the subscribe form |
| `newsletter_submitted` | Provider accepted the address (confirmation pending) |
| `newsletter_subscribed` | Provider confirmed the subscription (double opt-in complete) |
| `newsletter_error` | `unavailable` or `error` state presented |

All events carry only the fixed params from the taxonomy allow-list (`page`). No email, no IP, no free text.

## 8. Privacy

- No email stored beyond the delivery provider's own double opt-in workflow.
- Client consoles never log the address.
- Analytics payloads contain no PII (guarded by test, see §8 of the retention test).
- Full review: `07-privacy-review.md`.

## 9. Out of scope for this spec

- Broadcast schedule automation (editorial concern; Knowledge Operations).
- Personalization / segmentation (explicitly excluded).
- Paid tiers (excluded in this phase).
- Provider account management UI.

## 10. Verification status

| Fact | Status |
|------|--------|
| Provider abstraction honest (tests 19–28 in retention suite) | ✅ Verified |
| API maps `submitted`/`confirmed` → 200, `unavailable` → 503, `error` → 500 | ✅ Verified |
| Live Beehiiv send | **NOT VERIFIED — PRODUCTION ACCESS REQUIRED** (no `BEEHIIV_API_KEY`) |