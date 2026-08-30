# UTM Campaign Standard (v1.0) — TASK-07

Every campaign link must carry exactly these five UTM parameters so `landing`
events can attribute acquisition without ambiguity.

## Canonical parameters

| Parameter | Allowed values (lowercase) | Required | Example |
|-----------|----------------------------|----------|---------|
| `utm_source` | `google`, `x`, `linkedin`, `whatsapp`, `telegram`, `youtube`, `newsletter`, `site`, `media` | Yes | `utm_source=x` |
| `utm_medium` | `organic_search`, `social`, `email`, `referral`, `paid_social` | Yes | `utm_medium=social` |
| `utm_campaign` | `pilot_v1`, `chapter01`, `ghostwriter`, `collection[1-9]` | Yes | `utm_campaign=pilot_v1` |
| `utm_content` | Short descriptor, slug_case, ≤40 chars | Recommended | `utm_content=galwan_timeline` |
| `utm_term` | Reserved for future paid search — omit for organic | No | — |

## Rules

1. **Always use URLs generated from the share buttons**, never hand-built links,
   so parameters are consistent.
2. **Never include query text or emails** in any UTM parameter (PII ban).
3. **Case must be lowercase** — the classifier is case-insensitive but the standard
   keeps GA4 reports clean.
4. `utm_medium=email` is reserved for the newsletter provider once connected; track
   it via `newsletter` source.

## Classification behaviour (lib/analytics/channels.ts)

When UTM is absent, the web layer derives the channel from `document.referrer`:

| Referrer | distribution_channel | referrer_type |
|----------|----------------------|---------------|
| google.com / google.co.in / bing.com / duckduckgo.com / yahoo.com / ecosia.org / brave.com | `other` | `organic_search` |
| x.com / linkedin.com / facebook.com / instagram.com / youtube.com / whatsapp.com / t.me / threads.net | `social` | `social` |
| any other external domain | `referral` | `referral` |
| none | `direct` | `direct` |

Search traffic is deliberately split from social + newsletter so intent-driven
acquisition is never averaged into discovery traffic.

## Example campaign URL

```
https://thebreakdown.in/story/india-china-border-tensions?utm_source=x&utm_medium=social&utm_campaign=pilot_v1&utm_content=galwan_timeline
```