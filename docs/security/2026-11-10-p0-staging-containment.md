# P0 staging security containment — 2026-11-10

**Issue:** [#90 — Audit RLS, custom-schema exposure, and SECURITY DEFINER RPC grants](https://github.com/thebreakdowndaily/thebreakdown-os/issues/90)
**Parent:** [#156 — Story Autopilot](https://github.com/thebreakdowndaily/thebreakdown-os/issues/156)
**Branch:** `security/p0-staging-containment-20261110`
**Status:** Prepared, locally verified, **not applied to any live database**. Staging application is blocked on database credentials (see [Blockers](#blockers)).

## 1. What was verified live (read-only)

Read-only checks were run on 2026-11-10 against the staging/fact-check project
`lvfovvidtowadmnggzzf` using its public REST endpoint and project keys. No SQL,
schema, data, or project setting was changed.

| Object (staging) | Anonymous REST read | Rows exposed |
| --- | --- | --- |
| `audit.published_story_snapshots` | **200 OK** | 10 |
| `editorial.claims` | **200 OK** | 339 (16 `unverified`) |
| `editorial.sources` | **200 OK** | 112 |
| `editorial.evidence_items` | **200 OK** | 118 |
| `editorial.claim_verifications` | **200 OK** | 259 |
| `editorial.claim_citations` | **200 OK** | 90 |
| `editorial.claim_verification_evidence` | **200 OK** | 56 |
| `editorial.story_claims` | **200 OK** (table present) | not counted |
| `audit.activity_log` | 401 | closed |
| `audit.story_versions` | 401 | closed |

Additional confirmed defect: `service_role` receives
`permission denied for schema audit` (42501) on
`audit.published_story_snapshots`, while `anon` can read it. The trusted server
path is therefore broken while the untrusted path is open. The migration
restores `service_role` schema USAGE.

The destructive delete RPC, the claim-verification RPC and the legacy
publication RPC were not invoked. Their grants and bodies were previously
confirmed by the catalog audit recorded in Issue #90.

## 2. Change set

| File | Purpose |
| --- | --- |
| `supabase/migrations/037_p0_staging_security_containment.sql` | Reviewed containment migration. 037 is the next version after the staging ledger's recorded 034–036; it does not reuse or reproduce them. |
| `tests/security/p0-containment-migration.test.ts` | Direct PostgreSQL harness. Simulates the recorded drift, applies the migration twice, and asserts the full ACL/RLS matrix. |
| `scripts/security/verify-p0-containment.ts` | Live read-only verifier for staging and (later) production. |
| `scripts/verify-migrations.ts` | Tolerates the known out-of-band versions 034–036 with a loud warning; every other gap still fails. |
| `package.json` | Adds the harness to `test:migration`; adds `verify:p0-containment`. |

### What the migration changes

1. **`public.delete_story_cascading(uuid)`** — revoked from `PUBLIC`, `anon`,
   `authenticated`, and `service_role`. No application caller exists in this
   repository; the function deletes story, evidence, and audit history with no
   authorization check.
2. **`editorial.record_claim_verification_atomic(uuid,uuid,uuid,text,text,uuid[])`**
   — revoked from `PUBLIC`, `anon`, `authenticated`, `publisher_worker`;
   `EXECUTE` granted only to `service_role`. The function trusts a caller-supplied
   verifier identity, so a server route must authenticate and authorize the
   verifier before calling it.
3. **Internal editorial and audit tables** — privileges revoked from `PUBLIC`,
   `anon`, `authenticated`; RLS enabled; an explicit `RESTRICTIVE` deny policy
   (`p0_deny_client_access`) added so a future stray `GRANT` cannot silently
   reopen the data. Schema `USAGE` on `editorial` and `audit` is revoked from
   clients and explicitly granted to `service_role`.
4. **Legacy publication RPCs** —
   `public.publish_story_atomic(uuid,uuid,integer)` is retired for every
   application role. `public.fn_publish_story_with_audit(uuid)` and
   `public.fn_claim_due_schedule_entry()` are reasserted as
   `publisher_worker`-only. The canonical publication path
   (`fn_publish_story_fenced` / application publication contract) is untouched.

### Post-migration permission matrix

| Object | anon | authenticated | service_role | publisher_worker |
| --- | --- | --- | --- | --- |
| `delete_story_cascading` | deny | deny | deny | deny |
| `record_claim_verification_atomic` | deny | deny | allow | deny |
| `publish_story_atomic` | deny | deny | deny | deny |
| `fn_publish_story_with_audit` | deny | deny | deny | allow |
| `fn_claim_due_schedule_entry` | deny | deny | deny | allow |
| `editorial.*` internal tables | deny | deny | allow | deny |
| `audit.*` internal tables | deny | deny | allow | deny |

No data is modified and no object is dropped. Every change is existence-guarded
and idempotent, so the file is safe on both schema histories.

## 3. Local verification (executed)

| Check | Result |
| --- | --- |
| `npx tsx scripts/verify-migrations.ts` | 35/35 files pass; warns that out-of-band 035–036 are declared but not owned by `main` |
| `npx tsx tests/security/p0-containment-migration.test.ts` | **88 passed, 0 failed** |
| `npx tsx tests/security/database-enforcement.test.ts` (full 001→037 chain) | **33 passed, 0 failed** |

The containment harness proves the matrix at the storage layer, including:
`anon` cannot execute the delete RPC; `anon`/`authenticated` cannot forge claim
verification; RLS denies client reads even with a pre-existing
`USING (true)` policy; `service_role` still reads the tables; and
`current_app_role()` keeps its unrelated anon grant.

## 4. Apply runbook (staging only)

Prerequisites:

- A current staging database password (the password in
  `.env.preview.local` and the hardcoded fallbacks in tracked tests are stale).
- A reviewed PR with this branch, CI green.

1. Confirm the target is staging:
   `SELECT current_database(), inet_server_addr();` and verify the project ref is
   `lvfovvidtowadmnggzzf`.
2. Apply the migration through the normal reviewed mechanism (Supabase CLI
   `db push`, or `psql -f supabase/migrations/037_p0_staging_security_containment.sql`).
3. Run the matrix verifier:
   `npm run verify:p0-containment -- --env staging`
4. Re-run the read-only REST probes from §1. Expect `401`/`403` for every
   anonymous read of `audit.*` and `editorial.*`, and `200` for
   `public.stories`.
5. Smoke-test the trusted server paths (service role): claim verification
   server action, publication preflight, scheduled-publish dispatch. Confirm no
   `permission denied` errors.
6. Record the verifier output in the PR.

**Do not apply 037 to production until steps 1–6 pass and the production object
inventory in §5 is reviewed.** Production does not currently contain several of
the staging-only objects; the migration will no-op for them.

## 5. Production expectations (not applied)

Current recorded state of production `mskyhaunnlwtwvsqcmav`:

- `editorial` and `audit` are not exposed through PostgREST.
- `anon`/`authenticated` have no schema USAGE or table privileges on the eight
  RLS-disabled tables, but RLS/policy drift still exists.
- `delete_story_cascading`, `record_claim_verification_atomic`, and
  `publish_story_atomic` are absent.
- `fn_claim_due_schedule_entry` and `fn_publish_story_with_audit` exist with
  publisher-worker-only grants.

On production, 037 therefore hardens the existing `editorial`/`audit` tables,
reasserts publisher RPC grants, and no-ops the absent objects. Verify with:

`npm run verify:p0-containment -- --env production --allow-production`

Skipped objects are reported as `SKIP`, not failures, so the output is an
honest per-environment inventory.

## 6. Rollback

The migration changes privileges and policies only.

- Re-grant table/schema privileges to `anon`/`authenticated` only through a new
  reviewed migration.
- Drop the deny policies:
  `DROP POLICY IF EXISTS p0_deny_client_access ON <schema>.<table>;`
- Restore function grants only after re-confirming the intended callers.

There is no data to restore.

## 7. Blockers

1. **Live staging apply is blocked.** Both `STAGING_DATABASE_URL` and the
   hardcoded staging password fail authentication; production `DATABASE_URL`
   also fails. The migration is prepared but cannot be applied or verified live
   from this environment.
2. **Hardcoded database credentials remain in tracked source.** Staging
   credentials appear in `tests/evidence-vault/publication-guard-unification.test.ts`,
   `tests/evidence-vault/legacy-boundary-demarcation.test.ts`,
   `tests/evidence-vault/evidence-vault.test.ts`, and
   `services/intelligence/evidence-vault.service.ts`; a production-named
   credential appears in `scripts/audit/inspect-ledger-rows.ts`. They must be
   removed and the database passwords rotated. This overlaps draft PR #125
   ("remove implicit PostgreSQL credential fallback") and should be coordinated,
   not duplicated.
3. **Migration ledger 034–036 is unresolved.** Staging records 034
   (`034_database_publication_authorization`), 035, and 036 out-of-band. `main`
   does not contain their SQL. This is Mission 0B (infrastructure/database
   reconciliation), not 0A. The verifier reports 037's presence; the gate
   tolerates the known gap with a warning.
4. **`fn_publish_story_fenced` is not in `supabase/migrations`.** The canonical
   publication function is remote-only. Until it is reconciled into migration
   history, "canonical publication workflow" cannot be proven from the
   repository alone.
5. **`publish_story_atomic` actor attribution is caller-controlled.** Revoking
   access contains the risk but does not fix the function body. Retire or harden
   it in a follow-up after confirming no remaining caller.

## 8. Explicit safety statements

- No live database was mutated by this work.
- No migration was applied to staging or production.
- No story was published, unpublished, deleted, or quarantined.
- No secret was printed, committed, or rotated by this work.
- Production deployment was not triggered.
