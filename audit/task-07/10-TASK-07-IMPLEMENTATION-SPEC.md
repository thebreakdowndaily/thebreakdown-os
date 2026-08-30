# TASK-07 — Implementation Specification

**Status:** Implemented (v1.0)
**Governing documents:** AGENTS.md (Platform Beta, 90/10 rule, Experience Rule), Editorial Constitution (Article XIII Transparency), TASK-07 brief.
**Scope limit:** analytics measurement + search baseline + conversion funnel foundation. No new generic infrastructure was added — the implementation extends the existing reader-analytics surface and adds a thin, typed capture layer.

## 1. Requirements

- First-party analytics that separates **search acquisition from discovery**.
- Search measurement baseline for the 7 pilot stories (GSC access pending).
- Audience-conversion funnel (newsletter) with a real, defensible `newsletter_subscribed`.
- A North Star metric: **Reader Understanding Rate**.
- Data integrity (no PII, no fabricated baselines, no preview pollution).

## 2. Architecture

```
app/layout.tsx (production-only gtag + trackers)
      │  gated by process.env.NODE_ENV + NEXT_PUBLIC_GA_MEASUREMENT_ID
      ▼
GATracker (page_view, hostname-guarded)  LandingTracker   InteractionTracker
      │                                 (UTM landing      (delegated data-analytics
      │                                  once/session)     captures all deep links)
      ▼
lib/analytics/capture.ts  — typed CoreEventName + ALLOWED_PARAMS + captureEvent()
lib/analytics/environment.ts — isProductionHost / isProductionAnalytics
lib/analytics/channels.ts — classifyReferrer / classifyDiscoveryChannel
```

**Instrumented surfaces:**
- `StoryShell` → `story_opened` / `story_completed` (90% scroll, once per view)
- `InlineEvidencePanel` → `evidence_expanded`; source links via `data-analytics`
- `RelatedStories`, `SourcesList`, `PrimarySources` → delegated capture attributes
- `ExploreConnections` → explicit `related_story_clicked` (source/target/position)
- `/search` → `SearchAnalytics` (`search_performed`, query context for clicks)
- `/topic/[slug]`, `/entity/[slug]` → `ContentPageTracker`
- `/newsletter` → `NewsletterTracker`; `/subscribe` → `SubscribeForm`
  (prevents email-in-URL leak; provider gap surfaced honestly)

## 3. Environment separation

- **Build-time:** gtag script + GA init only when `NODE_ENV === 'production'`.
- **Runtime:** every `captureEvent` and the page-view tracker additionally verify
  `isProductionHost()` (`thebreakdown.in`, `www.thebreakdown.in`).
- Net effect: no measurement from `vercel.app` previews, localhost, or any other host.

## 4. Taxonomy (abridged)

| Event | Fired | Param allow-list |
|-------|-------|------------------|
| landing | once/session, UTM + referrer | utm_*, distribution_channel, referrer_type, landing_page |
| story_opened / story_completed | 1 / view | content_id, content_type [, scroll_depth_pct] |
| topic_opened / entity_opened | 1 / view | topic_id / entity_id |
| evidence_expanded | on open | content_id, claim_id, evidence_path |
| source_opened / document_opened | delegated click | content_id/title/…, domain |
| search_performed / search_result_clicked | /search | search_query (sanitized), results_count, result_* |
| related_story_clicked | continuation | source_id, target_id, position |
| topic_link_clicked / entity_link_clicked | delegated | source_id, id |
| newsletter_viewed / started / subscribed | funnel | page |

Full contract in `02-event-taxonomy.csv` and `lib/analytics/capture.ts`.

## 5. Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — passes (253 routes; newsletter/search/subscribe pages compile).
- `npx tsx tests/analytics-taxonomy.test.ts` — 33/33 pass (naming, reserved names,
  param contract, PII scan, host gating, referrer classification, sanitization).
- New lint errors in new modules: **0** (repo-wide pre-existing failures unchanged).

## 6. Definition of Done

- [x] Every core event is lowercase_snake_case, param allow-listed, GA4-safe.
- [x] Production-only dispatch (build gate + hostname gate).
- [x] Search vs discovery attribution implemented and tested.
- [x] Funnel implemented without fabricating any conversion.
- [x] GSC + GA4 access gaps documented as `NOT VERIFIED — PRODUCTION ACCESS REQUIRED`.
- [x] Reader experience improvement: subscribe form privacy fix (no email in URL).