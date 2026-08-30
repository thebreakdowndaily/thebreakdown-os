# TASK-07 — Analytics & Search Measurement Foundation: Implementation Report

**Date:** 29 Aug 2026
**Status:** Implemented — **Production measurement NOT yet active** (waits on GA4/GSC access)

## Big picture

TASK-07 delivers the measurement foundation the institution needs to answer
"can a reader notice this?" with evidence instead of intuition — the exact
requirement of the 90/10 rule and the Experience Rule. The foundation is
written, tested, and clean; the live numbers are blocked only on production
access, and nothing was fabricated to paper over that.

## What was built

1. **Production-only GA4 capture layer** (`lib/analytics/capture.ts`) — a typed,
   allow-listed event vocabulary of 16 canonical events. Nothing fires except from
   `thebreakdown.in` in production builds. Preview/dev pollution is impossible.
2. **Search vs discovery attribution** (`lib/analytics/channels.ts`) — referrer and
   UTM classification, tested. Search acquisition is never averaged into social.
3. **Reader funnel events** wired from refs to clicks:
   - `story_opened` / `story_completed` (90% scroll, once per view)
   - `evidence_expanded`, `source_opened`
   - `related_story_clicked`, `topic_link_clicked`, `entity_link_clicked`
   - `search_performed` / `search_result_clicked` (query attribution kept in
     sessionStorage, never in the URL)
4. **Newsletter conversion funnel** with a privacy fix: the `/subscribe` form was a
   GET form that leaked the reader's email into the URL. `SubscribeForm` now
   `preventDefault()`s and tracks `newsletter_viewed` → `newsletter_started`.
   `newsletter_subscribed` is defined but **never fired** until a real provider
   confirms delivery — a subscription is not an email in an input.
5. **North Star metric** — Reader Understanding Rate (06-north-star-metric.md).
6. **Regression suite** — 33 assertions guarding the taxonomy, gating, and privacy
   contract (`tests/analytics-taxonomy.test.ts`).

## The 9 questions this task asked — answered

| # | Question | Answer |
|---|----------|--------|
| 1 | Can we measure production readers today? | NO — code is ready, live GA4 dispatch requires confirmed property access. `NOT VERIFIED`. |
| 2 | Is search acquisition separated from discovery? | YES — implemented + tested (channels.ts). |
| 3 | Do we have a search baseline for the 7 pilot stories? | NO real baseline yet — GSC access required (03-search-console-baseline.csv). |
| 4 | Is the newsletter funnel measurable and honest? | YES for view/start; subscription is blocked on a provider, never faked. |
| 5 | Is there a North Star metric? | YES — Reader Understanding Rate (06). |
| 6 | Is outbound attribution canonical (UTMs)? | YES — 07-utm-standard.md; landing event reads UTM only, never full query. |
| 7 | Are dashboards/QAs defined? | YES — 08-analytics-qa.csv (18 checks) and 09-data-dictionary.md. |
| 8 | Is production data protected from dev/preview pollution? | YES — double gate: build env + hostname. |
| 9 | Does this violate Platform Beta (no speculative infra)? | NO — every event answers a reader-funnel question; no new registries/services/renderers. |

## Experience Rule — what the reader can notice

- **Subscribe privacy:** an email can no longer appear in their browser URL bar.
- **Measurement honourability:** the UI now accounts for the "provider not connected"
  gap instead of implying a subscription happened.

## Verification

`npx tsc --noEmit` clean · `npm run build` passes (253 pages) · taxonomy suite 33/33 ·
0 new lint errors in new modules.

## Blocker register (what production launch needs)

1. **GA4 access** — confirm measurement ID ↔ property ↔ data stream; enable demo +
   advanced params.
2. **GSC access** — verify domain, submit sitemap, register the 7 pilot queries.
3. **Newsletter provider** — connect delivery; only then emit `newsletter_subscribed`.
4. **Sentry DSN** in production env vars.

Until items 1–3 clear, all baselines in this audit remain `NOT VERIFIED — PRODUCTION ACCESS REQUIRED`.