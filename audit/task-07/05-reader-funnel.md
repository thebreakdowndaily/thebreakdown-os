# The Breakdown — Reader Funnel v1.0 (TASK-07)

## The canonical reader journey

The Breakdown measures **understanding, not clicks**. Every stage below maps to a
canonical GA4 event in `lib/analytics/capture.ts`. The funnel is measured
per-session (gated to `thebreakdown.in` / `www.thebreakdown.in` in production only).

```
Acquisition ──► Opened ──► Engaged ──► Learned ──► Converted
   │               │            │           │            │
 landing       story_opened  evidence_   story_      related_story_
  (+UTM &      topic_opened  expanded    completed     clicked
  referrer)    entity_opened source_opened            newsletter_started
               search_       search_result_            ─► newsletter_subscribed*
               performed     clicked                    (blocked on provider)
```

## Stage definitions

| # | Stage | Signal | Minimum threshold | Business question |
|---|-------|--------|-------------------|-------------------|
| 1 | Acquisition | `landing` (distribution_channel) | Any production session | Where did the reader come from, and is search or social driving it? |
| 2 | Opened | `story_opened` / `topic_opened` / `entity_opened` / `search_performed` | A knowledge surface mounted | Does the reader reach canonical knowledge objects (not just the homepage)? |
| 3 | Engaged | `evidence_expanded` / `source_opened` / timeline & chart interactions | At least one learning-surface interaction | Does the reader interrogate the evidence layer (learning intent)? |
| 4 | Learned | `story_completed` (scroll depth ≥ 90%) | One completion marker per view | Did the reader make it through the evidence spine to the conclusion? |
| 5 | Converted | `related_story_clicked` / `newsletter_started` (→ `newsletter_subscribed`) | One continuation or signup funnel | Did the reader continue learning or subscribe? |

## Reading-path rules (governing metric semantics)

1. `search_result_clicked` requires a live query context: SearchAnalytics writes the
   sanitized query to `sessionStorage['tbd_last_search_query']` on the results page,
   and InteractionTracker reads it on click. This keeps query attribution without
   ever forwarding full query text.
2. `newsletter_subscribed` is **defined but intentionally never fired** until a
   delivery provider confirms double-opt-in. An email address that merely sits in an
   input is NOT a subscription.
3. `story_completed` fires **once per view** (guard ref) — it is a completion marker,
   not a scroll event.

## What this deliberately excludes

- Page views as a KPI.
- Time-on-page as a KPI (it punishes slow readers and rewards open tabs).
- Fake conversions, fabricated baselines, or development-build measurement.