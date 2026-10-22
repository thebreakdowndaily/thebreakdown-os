# Durable Engineering Decisions

This record documents durable architectural and engineering decisions for The Breakdown OS. These decisions remain active across sessions and cannot be overridden without explicit ADR review.

---

## Decision Log

### DEC-001: Editorial Authority Precedence
- **Date:** 2026-07-30 (Re-affirmed 2026-10-20)
- **Status:** ACCEPTED / IMMUTABLE
- **Context:** Lean engineering and code simplification heuristics (such as Ponytail) must never compromise journalistic standards or release safety.
- **Decision:** The [Editorial Constitution](../../docs/editorial/editorial-constitution.md) and applicable editorial standards strictly supersede all code-simplification heuristics. No optimization justifies bypassing fact-checking, source provenance verification, draft containment, or audit logging.
- **Authority:** `docs/editorial/editorial-constitution.md`

### DEC-002: Migration History Immutability & Safety Defenses
- **Date:** 2026-09-26 (Re-affirmed 2026-10-20)
- **Status:** ACCEPTED / IMMUTABLE
- **Context:** Database schema drift and retroactive migration modifications cause staging/production divergence.
- **Decision:** Migrations `001` through `032` in `supabase/migrations/` are frozen and immutable. All schema changes must be introduced via new sequentially numbered migration files. All migrations must be tested against isolated PostgreSQL via `npm run test:migration` before deployment.
- **Evidence:** `tests/security/database-enforcement.test.ts`, `scripts/verify-migrations.ts`

### DEC-003: Authoritative Server-Controlled Access Control (Fail-Closed)
- **Date:** 2026-09-26 (Re-affirmed 2026-10-20)
- **Status:** ACCEPTED / IMMUTABLE
- **Context:** Client tokens may include user-editable fields in `user_metadata`.
- **Decision:** Permissions and roles (`owner`, `admin`, `editor`, `reporter`, `reader`, `guest`) must always be derived from server-controlled `app_metadata` or authoritative database tables (`public.user_roles`). Any attempt to escalate privileges via `user_metadata` fails closed to `guest`. Suspended accounts (`banned_until`) immediately lose all administrative rights.
- **Evidence:** `tests/security/auth-regression.test.ts`, `tests/security/rls.test.ts`

### DEC-004: Dual Data-Provider Architecture & Read-Path Parity
- **Date:** 2026-10-15 (Re-affirmed 2026-10-20)
- **Status:** ACCEPTED
- **Context:** CI and test suites run in environments without live Supabase database instances.
- **Decision:** The platform maintains an in-memory data provider (`services/repositories/memory/`) that provides contract parity with `services/repositories/supabase/`. Local unit tests and CI run with `DATA_PROVIDER=memory`. Canonical story resolution (`lib/story/resolver.ts`) ensures backward compatibility during migration.
- **Evidence:** `tests/story/resolver-parity.test.ts`, `tests/story/knowledge-library-blocks.test.ts`

### DEC-005: Autonomous Collaborator Operating Contract
- **Date:** 2026-10-20
- **Status:** ACCEPTED
- **Context:** Engineering tasks required excessive step-by-step direction from the product owner.
- **Decision:** The agent operates as an autonomous engineering collaborator following the ten-step `issue-to-completion` workflow. It autonomously investigates scope, executes minimal fixes, performs test-and-repair loops, runs adversarial checks, updates durable working memory (`docs/agent-operating-system/`), and reports outcomes without prompting for each intermediate step.
- **Authority:** `AGENTS.md` (Section 8)

### DEC-006: High-Impact Operation Fencing
- **Date:** 2026-10-20
- **Status:** ACCEPTED
- **Context:** Preventing catastrophic accidental data loss or unauthorized production mutation.
- **Decision:** The following operations strictly require explicit owner authorization:
  1. Live production or staging database mutations.
  2. Executing migrations or DDL on live databases (including Migration 033).
  3. Merging pull requests (including PR #93).
  4. Triggering production deployments or modifying live publication content.
- **Authority:** `AGENTS.md` (Safe Change Rules & Section 8)
