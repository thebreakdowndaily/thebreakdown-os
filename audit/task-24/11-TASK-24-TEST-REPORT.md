# TASK-24 — 11 · Test Report

**Date:** 2026-08-30
**Command:** `npm test` (full 20-stage chain) and `npx tsx tests/retention/retention.test.ts` (standalone).
**Result:** ✅ All green. New retention suite: **70 assertions, 0 failures**.

---

## 1. New suite — `tests/retention/retention.test.ts`

| Group | What it guards | Assertions | Status |
|-------|----------------|-----------|--------|
| 1a. Provider honesty (no-secrets env) | `isProviderConfigured()` false; `getNewsletterProvider()` → StubProvider; Stub → `unavailable`; Beehiiv without `PUB_ID` → `unavailable`; **never** `submitted`/`confirmed` | 6 | ✅ |
| 1b. Beehiiv success paths (mocked `fetch`) | 2xx → `submitted` (NOT `confirmed`); 422 → `error`; network throw → `error` | 4 | ✅ |
| 1c. API route honesty | 400 missing email; 400 malformed; 503/`unavailable` with no provider; never claims a subscription; normalised duplicate still honest (400/429/503) | 8 | ✅ |
| 2. Reader-state store (in-memory + controlled clock) | follow/unfollow/isFollowing; most-recent-first ordering; save/unsave/isSaved; visits; `tb_*_v1` namespaced keys | 13 | ✅ |
| 2b. Reader-state resilience | null store no-ops; corrupt JSON fallback; writes never throw | 7 | ✅ |
| 3. Retention taxonomy contract | 9 events present in `CORE_EVENTS`; each has an allow-list; spec params present; no PII / secrets / free-text params | 58 | ✅ |
| 4. No-account device-local guarantee | serialized reader state contains timestamps but no email/identity | 2 | ✅ |
| **Total** | | **70** | ✅ |

## 2. Full chain regression

`npm test` runs 20 suites sequentially: homepage, story-page, entity-page, search, seo, auth, story/presentation-model, story/representative-matrix, golden-story, content-scale/refresh-pipeline, content-scale/programmatic-seo, monetization (×5), graph/evidence-graph, explorer, content-scale/distribution, and now **retention**.

All stages exited 0. The suite imports/exercises TASK-24-affected surfaces where feasibly (auth suite imports the rewritten `ReaderDashboard`; homepage/story suites load the component graph that includes the rewritten bands/CTA via page imports).

## 3. A pre-existing blocker fixed to unblock the chain

The 1st stage (`homepage.test.ts`) previously failed the whole chain with `MODULE_NOT_FOUND: uuid`, because the untracked `services/repositories/memory/citation.ts` imported the undeclared `uuid` package. Fix shipped is minimal and dependency-free: `import { v4 as uuidv4 } from 'uuid'` → global `crypto.randomUUID()` (Node ≥15 / modern browsers; works client- and server-side; no new dependency). This unblocks the entire verification gate and touches only the identifier generation line.

## 4. Honest non-claims

- Analytics-taxonomy suite (`tests/analytics-taxonomy.test.ts`, 33 assertions) was green during TASK-08/09 deploy verification on the clean worktree; it is **not** part of the `npm test` chain and was not re-run this session.
- No browser/E2E test was run on this branch (pre-existing build constraints, see IMPLEMENTATION-REPORT §8). Runtime a11y (axe-core) and keyboard passes are scheduled in `walkthrough.md`.
- No production analytics or delivery-provider behaviour was verified — **NOT VERIFIED — PRODUCTION ACCESS REQUIRED**.

## 5. Lint gate (TASK-24 scope)

- `npx eslint <14 TASK-24 files>` → **0 errors** (the test file is outside the configured lint set — 1 info-level "file ignored" from `eslint.config`).
- Fixes that were required to reach clean: typed API-response reads (route handler + all four form/CTA surfaces), `SyntheticEvent` instead of the React-19-deprecated `FormEvent`, `void`-wrapped promise-returning `onSubmit` handlers, removal of an unused `started` state, `Object.entries` rebuilds instead of dynamic `delete`, `String()` in template literals, and the reader-state refactor described in IMPLEMENTATION-REPORT §8.
- All 70 retention assertions were re-run **after** the lint fixes: still green.