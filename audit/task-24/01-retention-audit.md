# TASK-24 — 01 · Retention Audit

**Date:** 2026-08-30
**Scope:** Audit of pre-existing retention surfaces before the TASK-24 retention layer shipped any new behaviour.
**Status:** Completed — findings recorded, decisions in Section 6.

---

## 1. Purpose

TASK-24 builds a "retention layer" on an existing platform. Before adding anything, we must know exactly what already exists so we **extend, never duplicate** (§19). This audit catalogues every surface that touches a returning reader, decides what is reused as-is, what is extended, and what is deliberately not built.

The audit covers six domains, mirroring TASK-24's scope:

1. Returning-reader pathways (update / what-changed).
2. Newsletter product (The Breakdown Brief).
3. Conversion funnel + analytics.
4. Reader state handling (follows / saves / history).
5. Privacy & consent.
6. Hard constraints verification (no fake subscription success).

---

## 2. Method

Static analysis of the repository at `audit-fixes-20260812`:

- Read the newsletter provider (`lib/newsletter/provider.ts`), API route (`app/api/newsletter/route.ts`), and every console surface that calls it (`SubscribeForm`, `NewsletterBand`, `StoryNewsletterCTA`, `NewsletterTracker`, `/newsletter`, `/subscribe`).
- Read the reader-memory primitives (`components/narrative/StoryMemoryWriter.tsx`, `NarrativeMemory` `reader_returned` emission).
- Read the analytics taxonomy (`lib/analytics/capture.ts`) for existing funnel events.
- Read the auth stack (`features/auth/*`), `/reader` page, and `/dashboard` newsroom dashboard.
- Read the story model for freshness signals (`publishedAt`, `updatedAt`, `versionHistory`, `freshness`) and the topic page's `storyGroups`.
- Grepped the session ledger / `.env.local` for delivery-provider credentials.

No live analytics were queried and no production provider was contacted: the audit is **source-of-truth from code**, not from dashboards. Provider status is recorded as **NOT VERIFIED — PRODUCTION ACCESS REQUIRED** wherever a production-side fact would otherwise be required.

---

## 3. Existing retention surfaces — inventory

| # | Surface | Location | What it does today | Retention value |
|---|---------|----------|--------------------|-----------------|
| R1 | Story read record | `StoryMemoryWriter` → `tb_last_story`, `tb_reading_history` (max 20) | Writes slug + headline + `readAt` to device localStorage on story mount | High — the only existing "past reads" memory |
| R2 | Recently Read rail | `RecentlyRead` in `StoryShell` | Lists recent stories at story end | High — natural return path |
| R3 | Recall event | `NarrativeMemory` emits `reader_returned` with `stories_read`, `days_since_last` | Signals platform-level return | Medium — taxonomy accepted (TASK-07) |
| R4 | Freshness model | `Story.publishedAt` / `updatedAt` / `versionHistory` / `freshness` | Deterministic "what changed" inputs exist on every story | High |
| R5 | Topic hub groups | `storyGroups` (latest / important / recommended / highestEvidence / historical) | Server-computed story groupings rendered on `/topic/[slug]` | High — replaces speculation with deterministic sections |
| R6 | Newsletter console | `SubscribeForm`, `NewsletterBand`, `StoryNewsletterCTA`, `NewsletterTracker`, `/newsletter`, `/subscribe` | Email capture with **fabricated success** (see §4) | Negative — actively harmful to trust |
| R7 | Analytics taxonomy | `CORE_EVENTS` + `ALLOWED_PARAMS` in `lib/analytics/capture.ts` | Single typed event vocabulary, GA4-dispatch only on production host | High |
| R8 | Auth stack | `SessionProvider`, `AuthGuard`, `LoginForm`/`RegisterForm`, `ProfileDropdown` | Optional signed-in identity (Supabase) | Reference only — see §5.3 |
| R9 | /reader dashboard | `features/auth/components/ReaderDashboard` (placeholder tabs) | Placeholder tabs: continue-reading / bookmarks / following / history / settings | High — reuse target |
| R10 | /dashboard | Newsroom operations dashboard | CMS-facing queues | Out of scope — different audience |

---

## 4. Findings that changed the plan

### F1 — Fake newsletter success (critical, must-fix)

`StubProvider` unconditionally returned `{ success: true }`. `BeehiivProvider` silently resolved to the stub whenever `BEEHIIV_PUB_ID` was absent. Every console then read `data.success === true` and fired the **fabricated** `newsletter_subscribed` event — a reader who was told they were subscribed was never subscribed. This violates TASK-09 §11 policy and the Editorial Constitution's honesty standard.

**Fix shipped:** honest contract `{ status: 'submitted' | 'confirmed' | 'unavailable' | 'error', message }`; `StubProvider` returns `unavailable`; Beehiiv 2xx returns `submitted` (double opt-in pending) and never auto-confirms; `newsletter_subscribed` fires only on `confirmed`. All three consoles reworked. Verified by tests (see `11-TASK-24-TEST-REPORT.md`).

### F2 — No follow / save / "what changed" primitives existed

No `topic_followed`, `story_saved`-family events in the taxonomy; no device-local follows or saves; no per-topic visit memory. Everything that returning-reader journeys rely on had to be created **as device-local state with a unit-testable store** (`lib/retention/reader-state.ts`) rather than as a new account system.

### F3 — /reader was gated behind an account

`/reader` required sign-in via `AuthGuard`. TASK-24 §17 forbids requiring an account to read. All reader-state features are device-local, so the gate was removed and the dashboard was wired to real state (§19 reuse).

### F4 — Newsletter copy sold a channel, not a product

`/newsletter` and `/subscribe` described a generic newsletter with no value proposition. Replaced with The Breakdown Brief positioning ("what changed, why it matters, and the evidence behind it") consistent with the Annual Review and trust goals.

### F5 — No retention experiments existed

No experiment framework state for retention (the platform's experiment register lives with TASK-08 `06-experiment-register.csv`). TASK-24 caps at 3 experiments (EXP-R01..R03). This task's own markdown and CSV record them (see `06-retention-experiments.csv`).

---

## 5. What was deliberately NOT built (and why)

| Candidate | Decision | Reason |
|-----------|----------|--------|
| Account-gated follows/saves | Rejected | §17 — no account required to read; device-local is simpler and more private |
| Recommendation engine | Rejected | §X — no speculative personalization; the update banner is deterministic metadata math |
| Ads / paywall / membership / push routes | Rejected | Explicit TASK-24 exclusion list |
| Second reader dashboard | Rejected | §19 — extended the existing one |
| New auth provider | Rejected | Reuses `SessionProvider`/`useAuth` |
| `funnel_started` analytic | Deferred | Taxonomy was extended under TASK-07's frozen contract; funnel metrics are built from existing events (`newsletter_*`, `story_opened`, `story_completed`, `reader_returned`) |

---

## 6. Decisions recorded

| ID | Decision |
|----|----------|
| D1 | Newsletter provider becomes an honest 4-state contract; **no code path may emit `newsletter_subscribed` without a provider-confirmed `confirmed`** |
| D2 | Reader-state (follow / save / visit) is **device-local** localStorage under `tb_*_v1` keys, tolerant of missing/corrupt storage |
| D3 | `/reader` is opened to everyone; Settings stays the only account-aware tab |
| D4 | The update surface is **deterministic** (`publishedAt`/`updatedAt` vs last visit) — no speculative recommendation logic |
| D5 | Experiments capped at 3, all reader-observable, all reversible (see `06-retention-experiments.csv`) |
| D6 | Privacy: no PII in analytics payloads; rate-limit key is a salted SHA-256 digest; no email storage/logging client-side |
| D7 | Retention gates: `npm test` (306 assertions incl. 70 new retention checks), `tsc` clean on TASK-24 files, lint clean on affected components |

---

## 7. Provider / production verification status

| Fact | Status |
|------|--------|
| Beehiiv subscription API reachable from production | **NOT VERIFIED — PRODUCTION ACCESS REQUIRED** (no `BEEHIIV_API_KEY`) |
| GA4 retention events observed in production | **NOT VERIFIED — PRODUCTION ACCESS REQUIRED** (dispatch is production-host-gated; no dashboards queried) |
| `.env.local` secrets | Exposes only `NEXT_PUBLIC_GA_MEASUREMENT_ID`; Supabase vars present but commented → demo mode |

---

## 8. Outcome

The retention layer now rests on three honest primitives — a truthful newsletter contract, a device-local reader-state store, and a deterministic update banner — mounted onto existing surfaces (homepage band, story-end CTA, topic hub, story shell, /reader dashboard) without duplicating any existing architecture.