# Analytics Data Dictionary (v1.0) — TASK-07

Canonical reference for every metric, event, and storage key the platform emits.
Source of truth for GA4 reports and any future dashboards.

## Events (GA4)

| Event | Category | Unit of measure | Cardinality per session |
|-------|----------|-----------------|-------------------------|
| landing | Acquisition | first-load session | 1 |
| story_opened | Learning | view | 1 per view |
| story_completed | Learning | completion | 1 |
| topic_opened | Discovery | view | 1 per view |
| entity_opened | Discovery | view | 1 per view |
| evidence_expanded | Learning engagement | interaction | n |
| source_opened | Learning engagement | interaction | n |
| document_opened | Learning engagement | interaction | n (reserved) |
| search_performed | Acquisition | search action | 1 per load |
| search_result_clicked | Acquisition | click | n |
| related_story_clicked | Continuation | click | n |
| topic_link_clicked | Continuation | click | n |
| entity_link_clicked | Continuation | click | n |
| newsletter_viewed | Conversion | impression | 1 per view |
| newsletter_started | Conversion | funnel interaction | 1 (guard ref) |
| newsletter_subscribed | Conversion | conversion | 0 (blocked on provider) |

## Params

| Param | Applied to events | Format | Limits |
|-------|-------------------|--------|--------|
| content_id | story_opened/completed, evidence_expanded, source_opened | slug | ≤200 chars |
| content_type | story_opened/completed | `story` / `chapter` | enum |
| scroll_depth_pct | story_completed | integer 90–100 | 0–100 |
| topic_id | topic_opened, topic_link_clicked | slug | ≤200 |
| entity_id | entity_opened, entity_link_clicked | slug | ≤200 |
| claim_id | evidence_expanded | canonical claim id | ≤200 |
| evidence_path | evidence_expanded | supported/mixed/not_supported/unverified | enum |
| source_title | source_opened | short title | ≤200 |
| source_domain | source_opened | cleaned host (www stripped) | — |
| search_query | search_performed, search_result_clicked | sanitized, truncated | ≤200 |
| results_count | search_performed | integer | — |
| search_type | search_performed | `site` | enum |
| result_type | search_result_clicked | story/topic/entity/fix/problem/dataset/collection/chapter | enum |
| result_id | search_result_clicked | slug | ≤200 |
| result_position | search_result_clicked | 1-based integer | — |
| source_id | related_story_clicked, topic_link_clicked, entity_link_clicked | slug or pathname | ≤200 |
| target_id | related_story_clicked | story slug | ≤200 |
| position | related_story_clicked | 1-based rank | — |
| page | newsletter_* | `newsletter` / `subscribe` | enum |
| utm_source | landing | lowercase source | ≤200 |
| utm_medium | landing | lowercase medium | ≤200 |
| utm_campaign | landing | campaign id | ≤200 |
| utm_content | landing | slug_case descriptor | ≤40 recommended |
| distribution_channel | landing | social/newsletter/referral/direct/other | enum |
| referrer_type | landing | organic_search/social/referral/direct | enum |
| landing_page | landing | pathname | — |

## Storage keys (client)

| Key | Storage | Written by | Read by | Purpose |
|-----|---------|-----------|---------|---------|
| `tbd_landing_captured` | sessionStorage | LandingTracker | LandingTracker | one landing event per session |
| `tbd_last_search_query` | sessionStorage | SearchAnalytics | InteractionTracker | result-click attribution context |
| `tbd_session_id` | localStorage | utils/analytics.ts | analytics engine v1.0 | internal session identity |
| `tbd_visit_count` | localStorage | utils/analytics.ts | analytics engine | internal return-visit count |
| `tbd_bookmarks` | localStorage | utils/analytics.ts | bookmarks | reader bookmarks |

## Derived metrics

| Metric | Definition | Source |
|--------|------------|--------|
| Reader Understanding Rate | sessions with story_completed ÷ sessions with story_opened | 06-north-star-metric.md |
| Search vs Discovery mix | distribution_channel breakdown of `landing` per period | 05-reader-funnel.md |
| Continuation rate | related_story_clicked ÷ story_opened | 05-reader-funnel.md |
| Evidence engagement | evidence_expanded ÷ story_opened | 05-reader-funnel.md |

## Boundary contract

- Everything in this dictionary reaches GA4 **only from production hosts**.
- The internal learning store (`/api/analytics`, `utils/analytics.ts` events) is a
  **separate aggregation system** and does not ingest TASK-07 core events.
- Never add a param that is not in `lib/analytics/capture.ts` `ALLOWED_PARAMS`.