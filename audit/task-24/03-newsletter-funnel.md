# TASK-24 — 03 · The Breakdown Brief — Conversion Funnel Specification

**Date:** 2026-08-30
**Status:** Frozen for this task.

---

## 1. Canonical reader journey

The funnel below is the **retention funnel** of TASK-24: it measures the journey from a reader on the site to a confirmed Brief subscriber. It deliberately parallels the platform's Understanding Metrics journey (Reader opens Evidence → Returns to Narrative → Completes Story → Continues Learning) but tracks **subscription conversion** specifically.

```
              E-1                     E-2                    E-3                    E-4                     E-5
 Reader on a  →  Newsletter surface  →  Starts subscribe    →  Provider accepted   →  Confirms double      →  Retained
 surface        viewed                form submit             (confirmation sent)     opt-in (real done)      (still subscribed N weeks)
  (site)        (newsletter_viewed)  (newsletter_started)   (newsletter_submitted) (newsletter_subscribed)  [longitudinal, requires
                                                                                                             production provider data]
```

## 2. Funnel stages and definitions

| Stage | Name | Event | Definition | Denominator |
|-------|------|-------|------------|-------------|
| 1 | Surface view | `newsletter_viewed` | A newsletter console (Band / Story CTA / newsletter / subscribe page) was presented to a reader | Page-level traffic to surfaces |
| 2 | Start | `newsletter_started` | The reader submitted the subscribe form | Surface views |
| 3 | Submitted | `newsletter_submitted` | Provider accepted the address and dispatched the confirmation email | Starts |
| 4 | Confirmed | `newsletter_subscribed` | Provider confirms double opt-in completion | Submitted |
| 5 | Retained | — (product-level, logged-in-provider data) | Subscriber remains after N editions | Confirmed |

## 3. KPIs (defined, not yet observable without production access)

| Metric | Formula | Target (placeholder, to be set after baseline) |
|--------|---------|------------------------------------------------|
| Surface → Start (CVR1) | `newsletter_started` / `newsletter_viewed` | Baseline 3-month → set target |
| Start → Submitted (CVR2) | `newsletter_submitted` / `newsletter_started` | ~100% of honest table is the floor; errors reduce this |
| Submitted → Confirmed (CVR3) | `newsletter_subscribed` / `newsletter_submitted` | Open-area benchmark; set after baseline |
| Overall conversion | Confirmed / Surface views | Same |
| Error rate | `newsletter_error` / `newsletter_started` | Must stay < 5% once configured |

**Honesty constraint:** when no provider is configured, stages 3–4 cannot occur by design; `newsletter_error` (unavailable) is the expected terminal state and must be *read* as "surface is closed for signups", not as churn.

## 4. Analytics instrumentation (already shipped)

- `lib/analytics/capture.ts` gains the complete retention vocabulary from the taxonomy (see `04-retention-events.csv`).
- Each console fires `newsletter_started` with `page` ∈ {`homepage`, `story_end_cta`} and `newsletter_submitted`/`newsletter_error`/`newsletter_subscribed` with the same `page`.
- `newsletter_viewed` is fired by `NewsletterTracker` on the surface pages.
- GA4 dispatch remains production-host-gated (`isProductionAnalytics`). Local/test observations are no-ops.

## 5. Funnel experiments (EXP-R01..R03 — see `06-retention-experiments.csv`)

| Experiment | Where in funnel | What is varied | Success metric |
|-----------|-----------------|----------------|----------------|
| EXP-R01 | Stage 1 (CTA value prop) | Copy framing of the Band/CTA value proposition | CVR1 (Start/View) |
| EXP-R02 | Stage 1 (placement) | Console placement (band vs story-end vs inline) | CVR1 |
| EXP-R03 | Stage 4 (confirmation) | Related-content link beneath successful confirmation state | CVR3 + continued reading (`related_story_clicked`) |

## 6. Reporting eligibility

Funnel reporting requires:

1. Production host dispatch gating enabled (deploy on `thebreakdown.in`).
2. `BEEHIIV_API_KEY` / `BEEHIIV_PUB_ID` configured (or an equivalent provider that returns `confirmed`).
3. GA4 property with the retention event schema.

Until (1)–(3) hold, the funnel is correct-by-construction but **unmeasured**. All three are marked **NOT VERIFIED — PRODUCTION ACCESS REQUIRED** in the test/implementation reports.

## 7. Failure states

| State | HTTP | Reader-facing copy | Analytics |
|-------|------|--------------------|-----------|
| `unavailable` | 503 | "The Breakdown Brief isn't accepting signups yet." | `newsletter_error` |
| `error` | 500 | "We could not complete your signup right now." | `newsletter_error` |
| Rate limited | 429 | "Too many requests. Please try again shortly." | `newsletter_error` |
| Invalid email | 400 | "That email address does not look valid." | (none — no event dispatched)