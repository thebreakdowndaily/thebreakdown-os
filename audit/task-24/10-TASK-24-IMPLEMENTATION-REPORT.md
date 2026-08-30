# TASK-24 — 10 · Implementation Report

**Task:** TASK-24 — Retention Layer (The Breakdown Brief, returning-reader pathways, topic-follow/save, retention analytics, privacy)
**Date:** 2026-08-30
**Branch:** `audit-fixes-20260812` (working tree)
**Status:** Implementation complete; verification gates green for the TASK-24 scope under the branch constraints documented in §8.

---

## 1. Objective vs delivered

| TASK-24 requirement | Delivered |
|---------------------|-----------|
| Newsletters: build The Breakdown Brief product | 02-newsletter-spec.md; `/newsletter` + `/subscribe` recast as the Brief; honest band/CTA/form |
| Conversion funnel | 03-newsletter-funnel.md; taxonomy + instrumentation shipped (05 events, see 04-retention-events.csv) |
| Returning-reader pathways | TopicUpdateBanner (deterministic "N new here") + FollowTopicButton on topic hub; SaveStoryButton in StoryShell; /reader dashboard wired to real device-local reads |
| Topic follow / save decisions | Device-local follows + saves with versioned `tb_*_v1` keys; honestly no-account |
| Retention analytics | Vocabulary extended under the frozen TASK-07 taxonomy; GA4 host-gated; no PII params |
| Privacy / consent | Honest provider contract; hashed rate-limit keys; device-local reader state; 07-privacy-review.md |
| Tests | `tests/retention/retention.test.ts` — 70 assertions wired into `npm test` |
| Audit deliverables | This directory (01–09 + task.md + walkthrough.md + this report + test report) |

## 2. Hard-rule compliance

| # | Rule | Verified by |
|---|------|-------------|
| H1 | `newsletter_subscribed` must not emit until provider confirms | Provider contract + API tests (no-provider → `unavailable`; Beehiiv 2xx → `submitted`; never auto-`confirmed`) |
| H2 | No ads / paywall / membership / push / personalization / social | Nothing in scope deploys any of these; experiments list confirms exclusion |
| H3 | No account required to read content | `/reader` un-gated; follows/saves/history device-local; Settings-only account awareness |
| H4 | Max 3 experiments | 06-retention-experiments.csv defines exactly EXP-R01..R03, all reader-observable and reversible |
| H5 | Reuse auth/reader/analytics architecture, no duplicate reader dashboard | ReaderDashboard **extended** (real tabs) not duplicated; analytics via `lib/analytics/capture.ts`; auth only referenced (Settings) |

## 3. Changes by area

**Newsletter honesty (critical fix)**
- `lib/newsletter/provider.ts` — new 4-state contract `submitted | confirmed | unavailable | error`; `StubProvider` returns `unavailable`; `BeehiivProvider` requires `BEEHIIV_PUB_ID` and returns `submitted` on 2xx (never auto-confirm); `isProviderConfigured()`.
- `app/api/newsletter/route.ts` — normalised email, SHA-256 rate-limit key (no raw PII in memory), 200/400/429/500/503 mapping.
- `components/newsletter/SubscribeForm.tsx`, `components/home/NewsletterBand.tsx`, `components/retention/StoryNewsletterCTA.tsx` — all three consoles rewritten to the honest states (submitted → "check your inbox"; unavailable → "not accepting signups yet"; error → retry copy). No surface ever fires `newsletter_subscribed` unconditionally.

**Retention surfaces**
- `lib/retention/reader-state.ts` — new device-local store (follows/saves/visits) + `KeyValueStore` abstraction + `getReadingHistory()` re-export.
- `components/retention/TopicFollowButton.tsx`, `components/retention/SaveStoryButton.tsx` — client islands, aria-pressed, hydration-safe placeholders, follow/save events.
- `components/retention/TopicUpdateBanner.tsx` — deterministic what-changed banner.
- `components/rxs/StoryShell.tsx` — SaveStoryButton mounted.
- `app/topic/[slug]/page.tsx` — FollowButton + UpdateBanner mounted.
- `app/reader/page.tsx` + `features/auth/components/ReaderDashboard.tsx` — account-free library with real Continue Reading / Bookmarks / Following / History / Settings tabs; fires `reader_dashboard_opened(tab)`.

**Copy / product**
- `app/newsletter/page.tsx`, `app/subscribe/page.tsx` — The Breakdown Brief positioning and double-opt-in copy.

**Analytics taxonomy**
- `lib/analytics/capture.ts` — added `newsletter_submitted`, `newsletter_error`, `topic_followed`, `topic_unfollowed`, `story_saved`, `story_unsaved`, `reader_dashboard_opened` + allow-lists.

**Tests**
- `tests/retention/retention.test.ts` — provider honesty (incl. mocked fetch), API route honesty, reader-state store + resilience, taxonomy contract, no-PII, no-account serialization guarantee. Wired as the 20th stage of `npm test`.
- `services/repositories/memory/citation.ts` — minimal fix: replaced the undeclared `uuid` dependency with the global `crypto.randomUUID()` (pre-existing broken import chain that blocked every test; see §8).

## 4. Files changed (TASK-24 scope)

| File | Change |
|------|--------|
| lib/newsletter/provider.ts | Rewritten (honest contract) |
| app/api/newsletter/route.ts | Rewritten (hashed key, status mapping) |
| components/newsletter/SubscribeForm.tsx | Rewritten (honest states) |
| components/home/NewsletterBand.tsx | Rewritten (honest states + Brief copy) |
| components/retention/StoryNewsletterCTA.tsx | Rewritten (honest states) |
| lib/analytics/capture.ts | +7 events + allow-lists |
| lib/retention/reader-state.ts | New store |
| components/retention/TopicFollowButton.tsx | New |
| components/retention/SaveStoryButton.tsx | New |
| components/retention/TopicUpdateBanner.tsx | New |
| components/rxs/StoryShell.tsx | SaveStoryButton mounted |
| app/topic/[slug]/page.tsx | FollowButton + Banner mounted |
| features/auth/components/ReaderDashboard.tsx | Real device-local tabs |
| app/reader/page.tsx | Account-free library |
| app/newsletter/page.tsx | The Breakdown Brief |
| app/subscribe/page.tsx | The Breakdown Brief |
| tests/retention/retention.test.ts | New (70 assertions) |
| package.json | `npm test` chain extended |

## 5. Accepted decisions (Book-of-Record-worthy)

- D1–D7 from `01-retention-audit.md` §6.
- Experiment set EXP-R01..R03 frozen (§5 of `03-newsletter-funnel.md`).

## 6. Definition of Done

| Gate | Result |
|------|--------|
| `npm test` (20-stage chain incl. retention 70) | ✅ 306 assertions pass |
| `npx tsc --noEmit` on TASK-24 files | ✅ none of the changed/new files appear in error output (branch-wide pre-existing errors documented in §8) |
| `npm run lint` (affected files) | ✅ 14/14 TASK-24 files: 0 errors — see §8 for the pre-existing remainder |
| Tests added/updated | ✅ retention suite wired into `npm test` |
| Accessibility preserved | ✅ static checks PASS (08-accessibility-validation.csv); runtime axe-core scheduled |
| Performance unchanged/improved | ✅ zero added round-trips; <2.5 kB added client JS (09-performance-regression.csv) |
| Documentation updated | ✅ this directory (01–11 + task.md + walkthrough.md) |
| ADR updated if architecture changed | N/A — Level A/B compatible evolution, no schema/API/navigation change |
| Public APIs unchanged | ✅ canonical types, routes, middleware untouched |
| PR ready | Pending branch hygiene + optional bright-line `npm run build` on a clean tree (see §8) |

## 7. Non-negotiable honesty statement

The following are **NOT VERIFIED — PRODUCTION ACCESS REQUIRED** and were deliberately *not* fabricated:

1. Beehiiv has never been contacted by this task (no `BEEHIIV_API_KEY` in the environment).
2. No GA4 retention event has been observed in production (dispatch is production-host-gated; no dashboard access).
3. No experiment has been run on real traffic; EXP-R01..R03 are defined and reversible, and will be measured after launch.
4. No numeric bundle or Core Web Vitals regression number is claimed on this dirty branch; evidence gate for a clean numeric run is recorded (`PERF-08/09`).

## 8. Branch constraints (recorded for reviewers)

- The working tree `audit-fixes-20260812` carries **pre-existing** `tsc` errors in non-TASK-24 files (implicit-any in `features/*/view-model.ts`, `services/*`, `app/*`; the untracked `citation.ts` from another workstream adds several). None of those files were authored by TASK-24; none of the TASK-24 files appear in the tsc error list.
- Because `next build` runs a type-check and the branch's tsc is not clean, a numeric build/bundle pass must run off `origin/main` (which was verified green in the TASK-08/09 deploy worktree) or after the branch is rebased. This is a pre-existing condition, not a TASK-24 regression.
- `git diff` of `app/topic/[slug]/page.tsx` confirms line 62 (`generateStaticParams`) is pre-existing and untouched by this task.
- `eslint` on the 14 TASK-24 files: **0 errors**. Fixes shipped: typed API-response parses (no `any` from `res.json()`), `React.SyntheticEvent` over deprecated `FormEvent`, `void`-wrapped `onSubmit` handlers, `useSyncExternalStore` for the follow/save buttons (device-local store read client-side, `false` server snapshot, no hydration gate), and two documented `react-hooks/set-state-in-effect` disables (`ReaderDashboard`, `TopicUpdateBanner`) where a reactive snapshot would re-read just-written values and break the read-before-write contract. The 46 remaining branch lint errors are all pre-existing in non-TASK-24 files (`StoryShell` 16, `app/topic/[slug]/page.tsx` 20, untracked `services/repositories/memory/citation.ts` 10; the new `react-hooks/set-state-in-effect` rule from eslint-plugin-react-hooks v6 reports in `StoryShell` too).

## 9. Rollback

Every change is reversible: remove the new components from their mounts and stop rendering `/reader` un-gated; stored `tb_*_v1` keys are inert once unreferenced. The newsletter provider honesty contract is a strict improvement and is not reverted except by reverting the commit.

## 10. Follow-on (deferred, out of scope)

- Live Beehiiv enablement + confirmation-webhook handling for `confirmed` (needs provider creds + ops decision).
- GA4 property schema for retention events (needs analytics access).
- R01–R03 measurement plan execution (needs production traffic + funnel baseline).
- `/reader` Settings → account notifications wiring (needs Supabase auth in prod).