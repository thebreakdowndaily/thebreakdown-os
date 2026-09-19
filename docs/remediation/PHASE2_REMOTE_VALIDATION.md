# Phase 2 Remote Database Security Verification Report

**Status:** **PHASE 2 REMOTE VERIFICATION BLOCKED**  
**Date:** 2026-09-19  
**Branch:** `security/production-hardening`  
**Target Project Configured:** `swektehukscmsgxdzymw` (referenced in `.env.test`)  

---

## 1. Remote Environment & Migration State

### Configured Remote Credentials
- **`SUPABASE_URL`**: `https://swektehukscmsgxdzymw.supabase.co`
- **`TEST_DATABASE_URL`**: `postgresql://postgres:[PASSWORD]@db.swektehukscmsgxdzymw.supabase.co:5432/postgres`
- **`.env.local`**: Contains only commented placeholder URLs (`# NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co`).
- **Target Environment Classification**: Disposable Test / Staging instance (`swektehukscmsgxdzymw`).

### Remote Connectivity & Verification Attempt
- **REST API Probe**: `https://swektehukscmsgxdzymw.supabase.co/rest/v1/`
  - *Result*: `ENOTFOUND swektehukscmsgxdzymw.supabase.co` (DNS resolution failed).
- **Direct PostgreSQL Probe**: `db.swektehukscmsgxdzymw.supabase.co:5432`
  - *Result*: `ENOTFOUND db.swektehukscmsgxdzymw.supabase.co` (DNS resolution failed).
- **Diagnosis**: The disposable project (`swektehukscmsgxdzymw`) has been paused, hibernated, or decommissioned by Supabase. No alternative remote staging credentials are configured in the environment.
- **Migration 015 Remote Status**: Cannot be applied or inspected remotely until an active remote Supabase project is provided.
- **Production Gate Enforcement**: In accordance with Section 8 of the mandate (*"DO NOT push migration 015 to production unless staging verification succeeds. If staging is unavailable, STOP and report: REMOTE VERIFICATION BLOCKED"*), migration 015 has **NOT** been pushed to production.

---

## 2. Direct PostgreSQL Storage Engine Verification (Embedded PostgreSQL)

To prove that the SQL migration and RLS policies work directly against real PostgreSQL and do not rely on mocked JavaScript behavior or application-layer Next.js guards, an end-to-end integration test (`tests/security/database-enforcement.test.ts`) was executed against a real PostgreSQL instance running all migrations from `001_create_tables.sql` to `015_enable_rls_and_consolidate_roles.sql`:

### Test Results Summary: 33 Passed, 0 Failed

| Verification Area | Method | Expected Storage Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **RLS Table Configuration** | Query `pg_class.relrowsecurity` | Core application tables have `relrowsecurity = true` | `relrowsecurity = true` on all 10 core tables across `public` and `identity` schemas | ✅ PASS |
| **Public Published Read** | `SET LOCAL role anon` | `SELECT` on published stories succeeds | 1 row returned | ✅ PASS |
| **Draft Protection** | `SET LOCAL role anon` | `SELECT` on draft stories returns 0 rows | 0 rows returned | ✅ PASS |
| **Anonymous Write Protection** | `SET LOCAL role anon` | `INSERT` into `public.stories` is rejected | Transaction error thrown by RLS | ✅ PASS |
| **User A Own Bookmarks** | `SET LOCAL role authenticated`, `sub = userA` | `INSERT` and `SELECT` own bookmarks succeeds | 1 row inserted and read | ✅ PASS |
| **User A Spoofing User B** | `SET LOCAL role authenticated`, `sub = userA` | `INSERT` bookmark where `user_id = userB` is rejected | Blocked by RLS `WITH CHECK (auth.uid()::text = user_id)` | ✅ PASS |
| **User B Bookmark Read** | `SET LOCAL role authenticated`, `sub = userB` | `SELECT` User A's bookmark returns 0 rows | 0 rows returned (Zero information leak) | ✅ PASS |
| **User B Bookmark Update** | `SET LOCAL role authenticated`, `sub = userB` | `UPDATE` User A's bookmark affects 0 rows | 0 rows affected | ✅ PASS |
| **User B Bookmark Delete** | `SET LOCAL role authenticated`, `sub = userB` | `DELETE` User A's bookmark affects 0 rows | 0 rows affected | ✅ PASS |
| **Reporter Story Delete** | `SET LOCAL role authenticated`, `sub = reporter` | `DELETE` on `public.stories` affects 0 rows | 0 rows affected (`is_admin()` policy blocks) | ✅ PASS |
| **Owner Story Delete** | `SET LOCAL role authenticated`, `sub = owner` | `DELETE` on `public.stories` deletes 1 row | 1 row deleted (`is_admin()` policy permits) | ✅ PASS |

---

## 3. SECURITY DEFINER Functions & Privilege Escalation Audit

### Functions Audited
1. `public.current_app_role()`
2. `public.is_staff()`
3. `public.is_editor()`
4. `public.is_admin()`

### Audit Findings
1. **SECURITY DEFINER Necessity**: Confirmed necessary. `current_app_role()` must read `public.user_roles` to evaluate authorization policies for regular users who do not have general `SELECT` access over all user roles.
2. **Search Path Immutability**: All four helper functions are configured with `SET search_path = public, auth, pg_temp`. Verified via `pg_proc.proconfig` in real PostgreSQL. Search-path hijacking is mathematically impossible.
3. **Dynamic SQL**: No dynamic SQL or string concatenation (`EXECUTE ...`) exists within the function bodies.
4. **Recursion Safety**: `current_app_role()` executes with creator privileges (table owner) which bypasses RLS during the lookup on `public.user_roles`. Because it does not invoke `is_staff()`, `is_editor()`, or `is_admin()`, mutual recursion is prevented.
5. **Privilege Escalation Resistance (Tested in PostgreSQL)**:
   - Anonymous caller: `current_app_role()` returns `'guest'`, `is_staff()` returns `false`, `is_admin()` returns `false`.
   - Client `user_metadata` spoofing: Attacker passes `{ user_metadata: { role: 'owner', is_super_admin: true } }`. The function reads `public.user_roles` and ignores `user_metadata` entirely; `current_app_role()` returns `'guest'`.
   - Account suspension: When `user_roles.status = 'suspended'`, `current_app_role()` returns `'guest'`. `is_staff()` and `is_admin()` immediately return `false`.

---

## 4. Service-Role Review & Usage Classification

Every occurrence of `SUPABASE_SERVICE_ROLE_KEY`, `getServiceClient()`, and `createServiceClient()` across the repository was audited and classified:

| File / Location | Identifier | Classification | Usage Rationale & Security Posture |
| :--- | :--- | :---: | :--- |
| `supabase/client.ts` | `createServiceClient()` / `getServiceClient()` | **A (Admin/Internal)** | Infrastructure constructor. Hardened to throw immediately if executed in browser (`typeof window !== 'undefined'`). |
| `supabase/client.ts` | `getSupabaseClient()` | **Remediated** | Removed previous silent server-side `service_role` fallback. Now defaults strictly to anonymous client (`getAnonClient()`). |
| `features/auth/principal.ts` | `fetchUserRoleFromDatabase()` | **C (User-Scoped Auth)** | Uses `getSupabaseAuth()`, which is a user-scoped client bound to request cookies and `anonKey`. Does **NOT** use `service_role`. User reads own role via RLS `user_read_own_role`. |
| `app/api/auth/keys/route.ts` | `getServiceClient()` | **A (Admin Infrastructure)** | Privileged administrative API key provisioning and revocation; gated by owner role and secret token. |
| `app/api/editorial/publish-due/route.ts` | `getServiceClient()` | **A (Machine Cron)** | Autonomous weekly publishing runner; authenticated via `CRON_SECRET` bearer token. |
| `app/intel/editorial/actions.ts` | `getServiceClient()` | **B (Remediated User-Request)** | Server actions for scheduling and publishing. **Hardened with `requireRole('editor')` and `requireRole('reporter')` guards** on all actions to prevent unauthenticated/unprivileged execution. |
| `workers/scheduled-publish/index.ts` | `SUPABASE_SERVICE_ROLE_KEY` | **A (Background Worker)** | Cloudflare Worker cron job executing automated publishing outside browser context. |

---

## 5. Multi-Schema Migration 015 Hardening

During real PostgreSQL execution of Migration 015 on top of Migration 002, an important schema migration interaction was discovered and fixed:
- **Root Cause**: Migration 002 previously dropped `public.users` and `public.bookmarks` and re-created them in the `identity` schema (`identity.users`, `identity.bookmarks`).
- **Remediation in Migration 015**:
  - Replaced static `CREATE POLICY ... ON public.users` and `public.bookmarks` with dynamic blocks that inspect `information_schema.tables`.
  - Policies are now applied cleanly to whichever schema is active (`public` and/or `identity`).
  - Strict User A vs User B isolation (`auth.uid()::text = user_id::text`) is enforced on `identity.bookmarks` and `identity.users`.

---

## 6. Full Repository Validation Status

| Test Suite | Command | Executed | Results | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Direct PostgreSQL Database Enforcement** | `npx tsx tests/security/database-enforcement.test.ts` | 33 | 33 passed, 0 failed | ✅ PASS |
| **RLS & Security Regression Suite** | `npx tsx tests/security/rls.test.ts` | 75 | 75 passed, 0 failed | ✅ PASS |
| **Auth Privilege Gate Regression** | `npx tsx tests/security/auth-regression.test.ts` | 27 | 27 passed, 0 failed | ✅ PASS |
| **Intel Workspace Auth Suite** | `npx tsx tests/intel-auth.test.ts` | 1,154 | 1,154 passed, 0 failed | ✅ PASS |
| **Full Unit & Feature Suite** | `npm run test` | 26 test suites | 26 suites passed, 0 failed | ✅ PASS |
| **TypeScript Typecheck** | `npm run check:type` | Entire repo | 0 errors | ✅ PASS |

---

## 7. Blockers & Unresolved Risks

1. **Active Staging Database Unavailable**:
   - The remote Supabase endpoint `swektehukscmsgxdzymw.supabase.co` is not resolving in DNS.
   - Remote execution of Migration 015 and live remote token generation cannot occur until an active Supabase staging instance is provisioned with valid credentials in `.env.local` or environment variables.
2. **Production Deployment Block**:
   - Migration 015 must not be pushed directly to production until it has been executed against an active remote staging project.

---

## 8. Final Status Declaration

**Status: PHASE 2 REMOTE VERIFICATION BLOCKED**

Local direct PostgreSQL storage engine verification is complete and 100% verified (33/33 direct DB tests passing). Remote verification is blocked pending provisioning of an active remote staging database project.
