# Remediation Execution Log

## Phase 1: Critical Authentication & Authorization Hardening
- **Branch**: `security/production-hardening`
- **Status**: Completed & Verified
- **Objective**: Eliminate client-controlled `user_metadata.role` authorization authority, implement server-verified identity via `getUser()`, establish centralized Principal + Permission + Policy architecture, and protect all privileged server entry points.

### Tasks
- [x] Create remediation branch `security/production-hardening`
- [x] Implement `features/auth/principal.ts` (Authoritative Principal model)
- [x] Implement `features/auth/permissions.ts` (Centralized permission definitions)
- [x] Implement `features/auth/policy.ts` (Pure authorization decision engine)
- [x] Implement `features/auth/require-auth.ts` & `features/auth/require-role.ts` (Server gate guards)
- [x] Refactor `features/auth/auth-server.ts` to use `getUser()` and authoritative `app_metadata.role`
- [x] Refactor `features/auth/auth-client.ts` to prevent client-side privilege presumption
- [x] Update `middleware.ts` to enforce server-verified authentication and fail-closed authorization
- [x] Eliminate hardcoded administrative backdoor key in `utils/api-auth.ts` & clean `app/api/docs/route.ts`
- [x] Build security regression test suite (`tests/security/auth-regression.test.ts`)
- [x] Run full test validation (`tests/intel-auth.test.ts`: 1154 passed, `tests/auth.test.ts`: 26 passed, `tests/security/auth-regression.test.ts`: 27 passed, `check:type`: 0 errors)

## Phase 2: Database Security, Row-Level Security & Authorization Enforcement
- **Branch**: `security/production-hardening`
- **Status**: Completed & Verified
- **Objective**: Make PostgreSQL itself enforce application security boundaries through Row-Level Security (RLS), consolidate legacy database roles to canonical `IntelRole`, establish `public.user_roles` as the primary server-side role authority, eliminate unsafe silent service-role shortcuts, and enforce strict tenant/user boundary isolation.

### Tasks
- [x] Create database security audit map (`docs/remediation/PHASE2_DATABASE_SECURITY_MAP.md`) covering all tables across `public`, `identity`, `editorial`, `newsroom`, `research`, `workspace`, and `gov` schemas
- [x] Create Migration `015_enable_rls_and_consolidate_roles.sql`:
  - [x] Create authoritative `public.user_roles` table with `user_id UUID PRIMARY KEY`, role hierarchy, status, and organization ID
  - [x] Consolidate legacy role constraints on `public.users` non-destructively and backfill `user_roles`
  - [x] Implement secure `SECURITY DEFINER` helper functions (`current_app_role()`, `is_staff()`, `is_editor()`, `is_admin()`) with fixed search paths
  - [x] Enable RLS on all base tables (`stories`, `topics`, `entities`, `timelines`, `fixes`, `media_items`, `datasets`, `users`, `bookmarks`, `user_roles`, and join tables)
  - [x] Author explicit granular policies: public published reads, staff draft reads, strict User A vs User B bookmark isolation (`auth.uid()::text = user_id`), profile self-management, and admin-only role manipulation
- [x] Update database TypeScript definitions (`supabase/schema.ts`) with `user_roles`
- [x] Harden Supabase client factory (`supabase/client.ts`):
  - [x] Eliminate silent server-side `getServiceClient()` fallback in `getSupabaseClient()`
  - [x] Add explicit `getAnonClient()` and `createUserScopedClient()`
  - [x] Prevent `createServiceClient()` and `getServiceClient()` from running in client/browser environments
- [x] Integrate database role lookup into authentication layer (`features/auth/principal.ts` and `features/auth/auth-server.ts`) with database-first priority and fail-closed status enforcement
- [x] Author comprehensive database security test suite (`tests/security/rls.test.ts`) covering client isolation, role resolution, status gating, migration SQL structure, and policy engine simulation (75 assertions)
- [x] Run full validation suite:
  - `npm run check:type`: 0 errors
  - `npx tsx tests/security/rls.test.ts`: 75/75 passed
  - `npx tsx tests/security/auth-regression.test.ts`: 27/27 passed
  - `npx tsx tests/intel-auth.test.ts`: 1154/1154 passed
  - `npx tsx tests/auth.test.ts`: 26/26 passed
  - `npm run test`: 26/26 test suites passed
  - `npm run build`: Production build cleanly completed (1,119 routes)

