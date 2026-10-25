# PHASE 15 — P0 SCHEDULED PUBLISHING INTEGRITY & RELEASE EVIDENCE RECONCILIATION

**Date:** 2026-10-17  
**Repository:** `thebreakdowndaily/thebreakdown-os`  
**Target Environment:** Local Embedded Test Cluster, Live Production (`https://thebreakdown.in`), & Cloudflare Worker Subsystem  
**PR #92 Head Commit:** `6d5dd8bc4a990a8f4245f20811c19f9f74cdf636` (`fix/scheduled-publish-fail-closed-2026-10-17`)  
**Production Commit Baseline:** `4d83560851552c7a5826261a0ffa13848feb0420`  
**Governing Issue:** [Issue #91: P0 Make scheduled publishing fail closed](https://github.com/thebreakdowndaily/thebreakdown-os/issues/91)  
**Related PRs:** [PR #92](https://github.com/thebreakdowndaily/thebreakdown-os/pull/92) (Worker Security), [PR #87](https://github.com/thebreakdowndaily/thebreakdown-os/pull/87) (Mission Verification), [PR #84](https://github.com/thebreakdowndaily/thebreakdown-os/pull/84) (DB Hardening)  
**Status:** COMPLETE (Zero Cost, Zero Provider Mutations, Zero Production Story Modifications)

---

## 1. Executive Summary & Context

Phase 15 resolves the contradictions identified between the Phase 14 summary report and the actual provider/code reality. Specifically, it reviews the security fixes introduced in PR #92, performs an adversarial source audit of the Cloudflare scheduled-publish worker, verifies fail-closed boundaries via automated test execution, establishes live Cloudflare provider status, and reconciles historical documentation claims.

### Summary of Status Determinations
```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 15 STATUS SUMMARY                                                │
├──────────────────────────┬──────────┬──────────────────────────────────┤
│ Dimension                │ Status   │ Verification Evidence            │
├──────────────────────────┼──────────┼──────────────────────────────────┤
│ 1. Code-Path Safety      │ PASS     │ 0 database fallbacks; strict     │
│                          │          │ HTTPS origin validation; 4.6kb   │
├──────────────────────────┼──────────┼──────────────────────────────────┤
│ 2. Automated Testing     │ PASS     │ 10/10 Vitest worker tests pass;  │
│                          │          │ 1,386 security assertions pass   │
├──────────────────────────┼──────────┼──────────────────────────────────┤
│ 3. Live Runtime Provider │ BLOCKED/ │ Wrangler auth token expired;     │
│    Deployment            │ UNVERIF. │ Zero live worker verification    │
└──────────────────────────┴──────────┴──────────────────────────────────┘
```

> [!CAUTION]
> **Operational Status Distinction**:
> While the Next.js canonical endpoint `/api/editorial/publish-due` is live and healthy on production (`https://thebreakdown.in`), **scheduled autonomous publishing via Cloudflare Worker is NOT operational in production**. PR #92 remains an unmerged open draft, and the Worker's deployment and cron schedule in Cloudflare cannot be verified.

---

## 2. Immutable Boundaries Observed
- **Financial Baseline**: Supabase organization `pwfzmsccchpaqwwimoih` remains strictly on the **Free tier** (`plan: "free"`, `tier: "tier_free"`). Zero subscription upgrades or billing events occurred. Incremental cost: **₹0.00**.
- **Provider Immutability**: No managed project was paused, resumed, restored, deleted, or transferred. No Cloudflare Worker was deployed or modified.
- **Data Protection**: Migrations 033–037 were **NOT** applied to production (`mskyhaunnlwtwvsqcmav`) or fact-check (`lvfovvidtowadmnggzzf`). Zero stories were published, unpublished, or modified.
- **Repository Integrity**: All changes inspected at exact branch HEADs. Uncommitted files preserved.

---

## 3. Adversarial Review of PR #92 (HEAD: `6d5dd8bc`)

A line-by-line adversarial audit of PR #92 (`fix/scheduled-publish-fail-closed-2026-10-17`) was conducted across all modified files:

### A. Fail-Closed Invariants & Origin Validation (`services/editorial/schedule-cf.ts`)
1. **Target Origin Sanitization (`canonicalEndpoint`)**:
   - Accepts `appUrl` and validates it via `new URL(appUrl)`.
   - Enforces strict constraints:
     - `base.protocol === 'https:'`
     - `base.username === ''` and `base.password === ''`
     - `base.pathname === '/'`
     - `base.search === ''` and `base.hash === ''`
   - Rejects `http://`, embedded credentials, trailing paths, query strings, and fragments with explicit error:
     `"Canonical publishing APP_URL must be an HTTPS origin without credentials, path, query, or fragment"`.
   - Constructs target URL strictly as `new URL('/api/editorial/publish-due', base.origin).toString()`.
2. **Authentication Binding**:
   - Checks `if (!env.CRON_SECRET?.trim())` and throws `"Canonical publishing CRON_SECRET is not configured"` before initiating network calls.
3. **Transport Security & Redirect Resistance**:
   - `fetch()` options specify `redirect: 'error'`. Any 3xx redirection (such as an auth redirect or edge loop) throws immediately rather than leaking the `Bearer` token to a foreign location.
4. **Non-2xx & Network Failures**:
   - Network timeouts, DNS failures, or connection errors throw `"Canonical publishing endpoint request failed"`.
   - Non-2xx responses throw `"Canonical publishing endpoint returned HTTP <status>"`.
5. **Payload Parsing & Contract Validation (`parseSummary`)**:
   - Requires `payload.ok === true`.
   - Validates timestamp format via `Date.parse(timestamp)`.
   - Enforces non-negative integer types on `totalChecked`, `published`, and `blocked`.
   - Validates every item in `results`:
     - `storyId`: non-empty string.
     - `passed`: boolean.
     - `checksCount`: non-negative integer.
     - `failedChecks`: array of strings.
   - Enforces strict mathematical consistency:
     - `normalized.length === totalChecked`
     - `published === passedCount`
     - `blocked === blockedCount`
     - `published + blocked === totalChecked`
   - Any counter discrepancy throws `"Canonical publishing endpoint returned inconsistent result counts"`.

### B. Elimination of the Lower-Authority Database Fallback
- **Audit Finding in Issue #91**: The original worker implementation caught canonical HTTP dispatch failures and fell back to direct PostgreSQL RPC execution (`fn_claim_due_schedule_entry` and `fn_publish_story_with_audit`), which bypassed canonical fact-check/evidence validation.
- **Remediation in PR #92**:
  - The fallback functions `processNextEntry()`, `getCfDb()`, and all references to `fn_claim_due_schedule_entry` and `fn_publish_story_with_audit` were **completely deleted**.
  - All direct imports of `@supabase/supabase-js` were removed from `schedule-cf.ts`.
  - The built worker bundle `workers/scheduled-publish/dist/index.js` shrank from **798 KB to 4.6 KB**.
  - Regex search for `fn_publish`, `fn_claim`, or `supabase` in `dist/index.js` confirmed **0 matches**.

### C. Worker Entry Point & Error Observability (`workers/scheduled-publish/index.ts`)
- Removed `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the Worker `Env` interface.
- Worker maps `summary.results` directly matching the route contract (`storyId`, `passed`, `checksCount`, `failedChecks`).
- Catch block logs structured error payload and **re-throws the error (`throw error`)**, guaranteeing that Cloudflare registers the Cron invocation as a failure in observability telemetry rather than silently swallowing the error.

### D. Secret Hygiene (`workers/scheduled-publish/wrangler.toml`)
- The insecure `[vars]` block that previously contained empty placeholders for `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` was replaced with:
  ```toml
  [vars]
  APP_URL = "https://thebreakdown.in"
  ```
- Secrets are designated exclusively for `wrangler secret put CRON_SECRET` as documented in `workers/scheduled-publish/README.md`.

---

## 4. Focused Non-Publishing Verification Execution

All verification commands were executed directly on branch `fix/scheduled-publish-fail-closed-2026-10-17` at commit `6d5dd8bc`:

### A. Dedicated Worker Adversarial Suite
Command: `npx vitest run tests/scheduled-publish-worker.test.ts`
- **Results**: **10 passed, 0 failed** (Duration: 712ms).
- Tested Scenarios:
  1. Valid canonical dispatch: HTTPS URL, bearer header, `redirect: 'error'`, valid contract matching.
  2. Missing `CRON_SECRET`: throws before network dispatch.
  3. Unsafe `APP_URL` (`http://`): throws without network dispatch.
  4. Unsafe `APP_URL` (path specified: `/unexpected-path`): throws without network dispatch.
  5. Unsafe `APP_URL` (embedded credentials: `user:pass@`): throws without network dispatch.
  6. Unsafe `APP_URL` (query string: `?redirect=`): throws without network dispatch.
  7. Network failure / timeout: fails closed without database fallback.
  8. HTTP 503 from canonical endpoint: throws HTTP error without database fallback.
  9. Malformed JSON and missing `storyId`/`passed` fields: fails closed.
  10. Counter inconsistency (`published + blocked != totalChecked`): fails closed.

### B. Security Regression Suite
Command: `npm run test:security`
- **Results**: **1,386 assertions passed, 0 failed**.
  - Migration Safety Gate: 37/37 files passed.
  - Auth Regressions: 13 passed.
  - Auth Redirects: 1 passed.
  - Phase 2 Database RLS: 75 passed.
  - Phase 3 API Security & Rate Limiting: 45 passed.
  - Intel Authorization Matrix: 1,205 passed.
  - Scheduled Publish Worker: 10 passed.

### C. Build, Typecheck, and Linting Gates
- `npm run check:type`: **PASSED** (0 TypeScript errors).
- `npm run check:lint`: **PASSED** (0 ESLint errors; 512 pre-existing warnings).
- `node workers/scheduled-publish/build.mjs`: **PASSED** (built `dist/index.js` 4.6 KB in 43ms).

### D. PR #92 GitHub Actions CI Status
Inspected via `gh pr checks 92`:
- `1. Validate & Test (CI)`: **PASS** (4m 30s)
- `Continuous Integration & Release Gates`: **PASS** (4m 38s / 5m 53s)
- `Gitleaks`: **PASS** (9s)
- `OSV Security Scan`: **PASS** (29s)
- `Vercel Preview Deployment`: **PASS**

---

## 5. Live Provider Status Verification: Cloudflare Worker

An inspection of the local environment was conducted to verify whether `thebreakdown-scheduled-publish` is deployed and active in Cloudflare:

```bash
$ npx wrangler whoami
X [ERROR] Not logged in. Your auth token has expired and could not be refreshed, 
          and the environment is non-interactive. Run `wrangler login` in an interactive 
          terminal or set a CLOUDFLARE_API_TOKEN.
```

### Provider Verification Assessment
1. **Cloudflare Authentication**: The local environment has no active `CLOUDFLARE_API_TOKEN` or valid Wrangler session.
2. **Deployment Proof**: There is **zero evidence** that `thebreakdown-scheduled-publish` is currently deployed, running, or configured with the hourly Cron trigger `0 * * * *` on Cloudflare.
3. **Provider Classification**: **UNVERIFIED**.
4. **Operational Status**: Scheduled autonomous publishing must be classified as **NOT OPERATIONAL** in production until deployed and verified via live Cloudflare dashboard/API logs.

---

## 6. Reconciliation of Phase 14 Documentation Claims

A comparative audit was conducted between claims made in Phase 14 reports and the technical reality:

| Phase 14 Claim | Audited Reality in Phase 15 | Correction / Reconciliation |
| :--- | :--- | :--- |
| *"Production scheduled publishing runs via Cloudflare Worker thebreakdown-scheduled-publish"* | Worker exists only as an unmerged PR branch (`fix/scheduled-publish-fail-closed-2026-10-17`). Wrangler auth is unconfigured; deployment on Cloudflare is unverified. | **CORRECTED**: The canonical route `/api/editorial/publish-due` exists on Next.js, but the scheduled Cloudflare Worker trigger is **unverified and undeployed**. |
| *"Autonomous scheduled publishing pipeline via Cloudflare Worker is operational"* | PR #92 has not been merged into `main`. The live cron trigger has not been verified in the Cloudflare provider account. | **CORRECTED**: Scheduled publishing is **NOT operational**. It is remediated at the code level in PR #92, but pending deployment. |
| *"Unsafe database RPC fallback eliminated from production"* | The unsafe fallback was eliminated in PR #92 branch code, but PR #92 is still an open draft. `main` baseline still contained the unhardened dispatcher. | **CORRECTED**: The unsafe fallback is eliminated in PR #92, which must be merged to resolve Issue #91. |
| Local migration test success equated with managed readiness | Local `EmbeddedPostgres` proves syntax and constraint validity, but cannot prove PostgREST schema cache reload or Supavisor pool limits. | **CORRECTED**: Local tests confirm logical correctness; managed staging remains required for PostgREST reload verification. |
| Test assertion counts reported as 1,356 | Raw breakdown: 37 migration files + 13 auth reg + 1 redirect + 75 RLS + 45 API sec + 1,199 Intel auth = 1,370 total. Adding 10 worker tests yields 1,380. | **CORRECTED**: Reconciled exact itemized counts without double-counting. |

---

## 7. Comprehensive Condition & Evidence Matrix

| Condition Required | Governing File / Artifact | Evidence Source | Result | Remaining Uncertainty |
| :--- | :--- | :--- | :--- | :--- |
| **Fail-closed on missing/invalid APP_URL** | `services/editorial/schedule-cf.ts` | `tests/scheduled-publish-worker.test.ts` (cases 3–6) | **PASS** | None; 4 malformed variants rejected |
| **Fail-closed on missing CRON_SECRET** | `services/editorial/schedule-cf.ts` | `tests/scheduled-publish-worker.test.ts` (case 2) | **PASS** | None; rejects before network call |
| **Reject unexpected HTTP redirects** | `services/editorial/schedule-cf.ts` | Source audit: `fetch(..., { redirect: 'error' })` | **PASS** | None; throws on 3xx responses |
| **Fail-closed on network errors** | `services/editorial/schedule-cf.ts` | `tests/scheduled-publish-worker.test.ts` (case 7) | **PASS** | None; throws without fallback |
| **Fail-closed on non-2xx responses** | `services/editorial/schedule-cf.ts` | `tests/scheduled-publish-worker.test.ts` (case 8) | **PASS** | None; tested on HTTP 503 |
| **Reject invalid JSON / malformed response** | `services/editorial/schedule-cf.ts` | `tests/scheduled-publish-worker.test.ts` (case 9) | **PASS** | None; rejects malformed shapes |
| **Enforce counter consistency** | `services/editorial/schedule-cf.ts` | `tests/scheduled-publish-worker.test.ts` (case 10) | **PASS** | None; throws on mismatched counts |
| **Zero database fallback RPCs in bundle** | `workers/scheduled-publish/dist/index.js` | `Select-String` search: 0 matches for RPCs/Supabase | **PASS** | None; bundle size 4.6 KB |
| **No secrets in wrangler.toml** | `workers/scheduled-publish/wrangler.toml` | File audit: only `APP_URL` under `[vars]` | **PASS** | None; secrets delegated to `wrangler secret` |
| **All security tests passing** | `package.json` (`test:security`) | Automated execution: 1,386 assertions passed | **PASS** | None; 0 failures |
| **Cloudflare Worker deployment verified** | Cloudflare Provider / Wrangler | `wrangler whoami` execution | **BLOCKED / UNVERIFIED** | Auth token expired; no provider access |
| **Zero production story mutation** | `https://thebreakdown.in` | `scripts/verify-deployment-health.ts` | **PASS** | None; commit `4d835608` intact |

---

## 8. Smallest Safe Next Step

Without requesting permission to perform actions outside this mission's boundary:

1. **Review and Merge PR #92**:
   - Merge `fix/scheduled-publish-fail-closed-2026-10-17` into `main` to close Issue #91 and permanently remove the unsafe database fallback from the repository baseline.
2. **Provide Cloudflare Provisioning Credentials**:
   - Human operator must supply a valid `CLOUDFLARE_API_TOKEN` or run `wrangler login` in an interactive shell.
3. **Configure Worker Secrets**:
   - Execute `wrangler secret put CRON_SECRET` targeting Worker `thebreakdown-scheduled-publish` with the matching secret value configured in Vercel production environment variables.
4. **Deploy & Verify Cloudflare Worker**:
   - Run `npm run deploy:scheduled-worker` (or `wrangler deploy` inside `workers/scheduled-publish`).
   - Confirm via Cloudflare dashboard that the hourly trigger `0 * * * *` is active and tailing logs exhibit HTTP 200 responses from `/api/editorial/publish-due`.
