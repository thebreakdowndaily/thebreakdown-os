---
name: publication-safety
description: >-
  Enforces The Breakdown OS publication invariants, editorial boundaries,
  and release safeguards. Use when touching publication pipelines, story resolvers,
  scheduled workers, draft containment, outbox delivery, database triggers, or migrations.
---

# Publication Safety Workflow

The Breakdown OS publishes high-integrity journalistic content. Accidental leakage of draft chapters, corrupted claim graphs, untracked modifications, or concurrent publication collisions damage reader trust and violate editorial standards.

This skill operationalizes the core publication invariants established in the [Editorial Constitution](../../../docs/editorial/editorial-constitution.md) and database architecture.

---

## 1. Core Publication Invariants

Every code change affecting content ingestion, story resolution, scheduled workers, or database migrations must preserve these invariants:

### Invariant 1: Fail-Closed Authorization & Principal Isolation
- Roles must be derived authoritatively from server-controlled sources (`app_metadata` or `public.user_roles`).
- Mutable client-provided values in `user_metadata` must never be trusted for elevated permissions (reporter, editor, admin, owner).
- Anonymous callers and public routes must never see draft stories, unreleased chapters, or internal telemetry.
- Suspended users must immediately fail-closed to `guest` status.

### Invariant 2: Story, Schedule Identity & Version Validation
- Story and chapter identity must resolve deterministically via canonical slugs and schemas.
- Claim IDs must be generated using `deterministicClaimId()` in `lib/story/claim-identity.ts` to guarantee cross-system reproducibility.
- Future-dated content (`publishedAt > now()`) must be treated as embargoed drafts and hidden from all public readers until release time.

### Invariant 3: Database-Authoritative Leases & Concurrency Protection
- Story publishing must use database-authoritative fencing (`fn_publish_story_fenced` or atomic version checks in PostgreSQL).
- Two simultaneous worker executions or publisher requests must not result in dual publication, duplicate audit records, or partial state updates.

### Invariant 4: Atomic Publication & Mandatory Audit Integrity
- When a story transitions from `draft` to `published`, state change and version capture in `audit.story_versions` must occur in the same atomic database transaction.
- Quarantined test artifacts (e.g. `vs1-lifecycle-*`, `adversarial-dml-*`) must be strictly excluded from production reads and sitemaps.

### Invariant 5: Durable Outbox Delivery & Retry Ceilings
- Outbound notifications (social feeds, newsletters, search index pings) must use a durable outbox table with idempotent execution.
- Backoff algorithms must have hard retry ceilings to prevent cascading failure loops.

### Invariant 6: Complete Secret Redaction
- No API keys, service role tokens (`SUPABASE_SERVICE_ROLE_KEY`), database passwords, or personal credentials may appear in public client bundles, server logs, or error responses.

### Invariant 7: Migration Preconditions & Non-Destructive History
- Applied migrations (migrations `001` through `032` in `supabase/migrations/`) are immutable. Never edit, reorder, or delete applied migrations.
- DDL changes must be backward-compatible with existing running services.
- Never run unverified destructive DDL (`DROP TABLE`, `TRUNCATE`) or mutate production without explicit owner sign-off.

---

## 2. Real Repository References & Touchpoints

When modifying publication paths, inspect and test against these canonical repository components:

- **Publication Logic & Embargo:**
  - `lib/story/publication.ts` — `isPubliclyPublished()`, `isCanonicalStoryPublic()`
  - `lib/story/resolver.ts` — canonical chapter resolution and fallback guards
- **Repository Implementation:**
  - `services/repositories/supabase/story.ts` — Supabase story data layer
  - `services/repositories/memory/story.ts` — In-memory story data layer parity
- **Routes & Metadata Gates:**
  - `app/story/[slug]/page.tsx` — draft redirection and 404 containment
  - `app/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]/page.tsx` — fail-closed metadata
  - `app/search/page.tsx` — draft filtering in search results
- **Database Migrations & Triggers:**
  - `supabase/migrations/015_enable_rls_and_consolidate_roles.sql` — RLS baseline
  - `supabase/migrations/027_story_publication_invariants.sql` — publication invariants
  - `supabase/migrations/030_publisher_worker_rpc.sql` — publisher worker RPC
- **Automated Verification Suites:**
  - `tests/publication-safety-p1.test.ts` — P1 publication regression suite
  - `scripts/audit/verify-publication-safety.ts` — live/staging publication auditor
  - `tests/security/database-enforcement.test.ts` — RLS and security definer tests

---

## 3. Publication Verification Protocol

Before declaring publication-related work complete:

1. **Static & Unit Check:**
   Verify resolution and embargo logic:
   ```bash
   npx tsx tests/publication-safety-p1.test.ts
   ```
2. **Database & RLS Check:**
   Verify PostgreSQL constraints and RLS enforcement:
   ```bash
   npm run test:migration
   ```
3. **Security Regressions:**
   ```bash
   npm run test:security
   ```
4. **Draft Containment Audit:**
   Confirm draft chapters (e.g. `ng-ch-*`) and quarantined artifacts are invisible to anonymous principals.

> [!CAUTION]
> Never weaken a security check, relax an RLS policy, or bypass an audit trigger simply to make a test pass. If an invariant test fails, fix the implementation to satisfy the invariant.
