---
name: publication-safety
description: >
  Enforces The Breakdown OS publication machinery invariants: fail-closed visibility,
  server-authoritative authorization, atomic and auditable transitions, draft and embargo
  containment, and non-destructive migrations. Use when touching story resolution, public
  routes, feeds, sitemap, search, scheduled workers, publication RPCs, or database schema.
---

# Publication Safety

This skill governs the **publication machinery**. It does not decide whether a story *should* be published — that authority belongs to the Editorial Constitution and the editorial review workflow. Passing every check here means the code cannot leak, duplicate, or silently succeed at an unauthorized write. It never authorizes a release.

Use after changes to drafts, scheduling, editorial actions, public routes, APIs, feeds, sitemap, search indexes, graph projections, caches, migrations, or publication database operations.

---

## 1. Invariants

### 1. Default to private
Missing, unknown, or ambiguous status means **not public**. Draft, review, scheduled, archived, invalid, and test content must never reach a reader. `lib/story/publication.ts` is the single source of this predicate; do not re-implement visibility checks in pages, APIs, feeds, or metadata.

### 2. Verify every egress
Check story pages, series/chapter routes, search, sitemap, RSS, related content, graph/entity projections, static generation, and any cache layer. One missing consumer is a leak.

### 3. Prefer server-authoritative identity
Roles must come from a server-controlled session, verified token, or authoritative record (`app_metadata` / `public.user_roles`). Never trust client-supplied actor, role, publication timestamp, evidence score, or gate result. In Next.js, treat every exported async function in a `'use server'` module as remotely callable.

### 4. Re-run gates at the write boundary
UI state and an earlier validation pass are not authorization. Evidence, editorial review, transition rules, and embargoes must be enforced at the canonical service or RPC boundary, not only at the caller.

### 5. Keep publication atomic
Story state change and its audit record must land in the same transaction. Concurrent worker runs or publisher requests must not produce dual publication, duplicate audit rows, or partial state.

The current baseline RPC is `fn_publish_story_with_audit(UUID)` in `supabase/migrations/030_publisher_worker_rpc.sql`. **Verify whether an atomic fence or lease is actually present before assuming it** — the baseline implementation updates the story and then inserts the gate log without a surrounding transaction. Do not cite a fencing guarantee you have not confirmed in the migration or database.

### 6. Make transitions auditable and retries bounded
Record actor, time, decision, and reason through existing audit contracts. Outbound notifications go through a durable outbox with idempotent execution and a hard retry ceiling. A retry must not bypass a gate.

### 7. Migrations are immutable and non-destructive
Applied migrations under `supabase/migrations/` are never edited, reordered, or deleted. DDL changes stay backward-compatible with running services. Never run unverified destructive DDL (`DROP TABLE`, `TRUNCATE`) or mutate production or staging data without explicit owner authorization.

### 8. Keep secrets out of the boundary
No service-role keys, database passwords, or credentials in client bundles, logs, or error responses.

---

## 2. Repository map

Verify these still exist before relying on them; this list is a starting point, not a guarantee.

| Concern | Location |
|---|---|
| Visibility predicate, embargo, indexing | `lib/story/publication.ts` (`isPubliclyPublished`, `isCanonicalStoryPublic`) |
| Canonical chapter resolution | `lib/story/resolver.ts` |
| Deterministic claim identity | `lib/story/claim-identity.ts` (`deterministicClaimId`) |
| Data layer parity | `services/repositories/supabase/story.ts`, `services/repositories/memory/story.ts` |
| Story and chapter routes | `app/story/[slug]/page.tsx`, `app/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]/page.tsx` |
| Search egress | `app/search/page.tsx` |
| RLS baseline | `supabase/migrations/015_enable_rls_and_consolidate_roles.sql` |
| Publication invariants | `supabase/migrations/027_story_publication_invariants.sql` |
| Publisher worker RPC | `supabase/migrations/030_publisher_worker_rpc.sql` |
| Publication regression suite | `tests/publication-safety-p1.test.ts` |
| RLS / database enforcement | `tests/security/database-enforcement.test.ts` |

---

## 3. Verification

Run the checks the change actually touches. Confirm each command still exists in `package.json` before citing it.

```bash
npx tsx tests/publication-safety-p1.test.ts   # visibility and embargo regressions
npm run test:migration                        # migration chain, RLS, database enforcement
npm run test:security                         # auth, RLS, API surface, privilege boundaries
```

`tests/publication-safety-p1.test.ts` is **not** part of the chained `npm run test`. Invoking it explicitly is the only way it runs.

Cover the negative paths, not just the happy path: unauthorized publish, missing evidence, failed validation, duplicate calls, concurrent calls, database failure, and exclusion from every public egress.

---

## 4. Boundary with the editorial layer

- Whether a claim is verified is decided by the editorial workflow (`.ai/agents/source-verifier.md`, `.ai/workflows/fact-check.md`, `.ai/workflows/review.md`), not by this skill.
- Whether a story may be released is decided by human authorization in `.ai/workflows/publish.md` Stage 7, not by this skill.
- `instagram-quality-auditor` returning "READY FOR HUMAN APPROVAL" is also not publish authorization.

No test result in this skill converts into editorial approval or permission to publish.

## 5. Non-negotiables

Never weaken a visibility check, relax an RLS policy, bypass an audit trigger, or edit an applied migration to make a test pass. If an invariant test fails, fix the implementation.
