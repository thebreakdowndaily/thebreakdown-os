Current Ticket:
TASK-24 — Retention Layer (The Breakdown Brief · Returning-Reader Pathways · Topic Follow/Save · Retention Analytics · Privacy)

Status:
In Progress (implementation + tests complete; deploy/PR pending)

Objective:
Build the retention layer on the existing platform without duplicating existing architecture: an honest newsletter product (The Breakdown Brief), returning-reader pathways (deterministic update banner + follow/save), retention analytics from the canonical taxonomy, and a privacy/consent posture — all discoverable by a first-time reader within five minutes.

Blocked By:
- Production provider + analytics verification (NOT VERIFIED — PRODUCTION ACCESS REQUIRED; no BEEHIIV creds, GA4 dispatch is host-gated)
- Clean numeric build/bundle gate (branch carries pre-existing non-TASK-24 tsc errors; must run off origin/main or after rebase)
- TASK-08/09 PR creation (gh token expired)

Depends On:
- Frozen MVP Specification v1.1
- Editorial Constitution v1.1 (honesty, trust)
- TASK-07 analytics taxonomy contract (CORE_EVENTS / ALLOWED_PARAMS)
- TASK-09 §11 (newsletter_subscribed must not fire until provider confirms)
- TASK-08 experiment register conventions
- Existing auth / reader-memory / StoryShell architecture

Acceptance Criteria (all met unless explicitly deferred in §Deferred):
✓ Newsletter provider reports honest 4-state results (submitted/confirmed/unavailable/error); never fabricates success
✓ newsletter_subscribed fires ONLY on provider-confirmed double opt-in
✓ Three consoles (SubscribeForm, NewsletterBand, StoryNewsletterCTA) honest across all states
✓ The Breakdown Brief value prop on /newsletter + /subscribe
✓ Conversion funnel defined with canonical events (04-retention-events.csv, funnel stages in 03)
✓ Topic follow / save are device-local, no account required (17), state in tb_*_v1 keys
✓ /reader dashboard extended (not duplicated) with real device-local data; account gate removed
✓ Deterministic "what changed" banner (publishedAt/updatedAt vs last visit) — no speculative recommendation logic
✓ Privacy: no PII in analytics payloads; hashed rate-limit keys; device-local isolation (07)
✓ Max 3 defined, reversible, reader-observable experiments EXP-R01..R03
✓ 70 new tests wired into npm test; full 20-stage chain green
✓ All 13 audit/task-24 deliverables written (01..11, task.md, walkthrough.md)

Definition of Done:
All acceptance criteria satisfied.
No scope expansion.
Excluded items (ads/paywall/membership/push/social/personalization/duplicate dashboard) verified absent.

Deferred (recorded, not blocked on): live Beehiiv enablement, GA4 property schema for retention events, experiment measurement, /reader Settings account wiring, production build numeric pass, TASK-08/09 PR.

Governance:
Level A/B compatible evolution. No schema change, no frozen API change, no navigation change (ACA form not required). See architectures/baseline governance in AGENTS.md. Traceability comments present in all new/modified components.