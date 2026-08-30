# Newsletter — Validation Status

Ticket context: **CNT-NL** — newsletter as a first-party activation channel.

## Status

**NOT VERIFIED — PRODUCTION ACCESS REQUIRED**

No delivery provider, subscriber list, or opt-in flow credential exists in this environment. Nothing here reports a single delivered, subscribed, or opted-in reader.

## What exists in code (unchanged this sprint)

- Public newsletter landing route (`/newsletter`) and footer/newsletter links (static SSG landing, no capture logic).
- Analytics taxonomy reserves `newsletter_subscribed` (see `lib/analytics/channels.ts` / `capture.ts` taxonomy).
- `session` keys handled: landing capture (`tbd_landing_captured`).

## Policy decisions (recorded, not coded)

1. **`newsletter_subscribed` MUST NOT fire** until a delivery provider confirms a double opt-in subscription. Code-supporting-an-event is not a subscription (mirrors TASK-08 rule: nothing is "live" because the code exists).
2. The newsletter landing page stays as an intent surface; it is **not** promoted as functioning, and no metric should claim acquisition.
3. `newsletter_subscribed` will be wired only after a provider contract (Mailchimp/Buttondown/Resend-class) is selected: provider API key in secrets (never in repo), double opt-in enabled, and a live E2E confirming the event fires exactly once per confirmed subscriber.

## Open items for the Editorial Program

| Item | Owner | Requires |
|------|-------|----------|
| Provider selection + contract | Founding team | Product decision (delivery cost, attribution, DPI compliance) |
| Opt-in API + event wiring | 10% engineering | Provider account + secret |
| Double-opt-in confirmation E2E | Verification Bureau | Staging provider account |
| `/newsletter` copy stating what the reader gets | Editorial Bureau | Newsletter charter |

## Metrics guardrails (for when this activates)

- North-star: confirmed subscribers grew weekly AND mcn-delta (new-vs-unsubscribed) sustained.
- No vanity "signups" — only double-opt-in confirmed subscriptions count.
- `newsletter_subscribed` analytics event counted once per subscriber per flow.