# Phase 51.5 — Independent Review Gate and Evidence Handoff

**Decision:** HOLD — STRICT NO-GO  
**PR:** [#93](https://github.com/thebreakdowndaily/thebreakdown-os/pull/93)  
**Review target when this document was prepared:** `49452714b031e03b4dfbf13bb4926485fb8a9cfb`  
**Branch:** `candidate/scheduled-publish-clean-history-2026-10-18`  
**Prepared:** 2026-10-20  
**Scope:** Source/CI evidence review only. No staging or production database access was used; Migration 033 was not applied; no publishing worker was deployed; no story was published.

> This report is a gate record, not an independent approval. Only a non-author maintainer or peer who reviews the exact final SHA can complete the human-decision gate.

## 1. Release safety contract

Until every gate below is complete and independently approved:

- Keep PR #93 **open and draft**.
- Do not merge or enable auto-merge.
- Do not deploy the scheduled publishing worker.
- Do not apply Migration 033 to staging or production.
- Do not run a rehearsal that can publish content.
- Do not publish, unpublish, or mutate stories as part of this verification.
- Do not execute the rollback runbook on a real database.

## 2. Exact repository state at review start

The GitHub PR metadata reported:

- Head SHA: `49452714b031e03b4dfbf13bb4926485fb8a9cfb`.
- Base branch: `main`.
- PR state: open, draft, not merged.
- Candidate branch differs from current `main`: 26 commits ahead and 3 behind in the compare response. The current main-side comparison SHA reported by the API was `59e69c7c0521948b7cccf6898c7d66e106e51044`; merge base was `4d83560851552c7a5826261a0ffa13848feb0420`.

Because the candidate is behind and diverged from main, do not rebase, force-push, merge, or update the branch automatically as part of this review. A maintainer must decide the safe integration strategy after resolving the blockers.

## 3. CI and security evidence

The following is a snapshot from GitHub for target SHA `49452714b031e03b4dfbf13bb4926485fb8a9cfb`. These results must not be carried forward to any new head SHA without checking its own runs.

| Evidence | Observed result | Interpretation |
|---|---|---|
| Security Scans workflow [run 39307412554](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39307412554) | Completed successfully | Gitleaks and the OSV newly-introduced-vulnerability scan passed. |
| Gitleaks | Success | Supports a clean scan under this workflow configuration; does not prove every secret is impossible. |
| OSV — newly introduced dependencies | Success | Differential scan passed for this change set; this is not a claim that the full existing dependency baseline is vulnerability-free. |
| OSV — scheduled/current dependency inventory | Skipped | Not evidence of a clean full dependency inventory. Record why it was skipped or run it in a non-mutating authorized context. |
| Audit Framework Verification [run 39307412115](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39307412115) | Completed successfully | Audit framework verification workflow reported success. |
| CI run [39307398444](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39307398444) | Completed successfully | A CI run for the same target SHA reported success. |
| CI run [39307411940](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39307411940) | API reported in progress with no final conclusion; last reported update was 2026-10-19 19:01:10 UTC | Treat as unresolved/stale until reconciled with the GitHub Actions UI/API and a final conclusion is visible. |
| POP-1.0 Production Infrastructure Pipeline [run 39307411968](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39307411968) | Run metadata reported completed/success, while an associated check/job snapshot still reported in-progress | Conflicting metadata; independently reconcile the run, check-run and job state before calling this gate green. |

The CI job-step snapshot showed typecheck, strict lint, security regression, migration safety, master architecture/operations tests, release-control safety, and accessibility token/contrast steps passing on the relevant job view. The Next.js production build and browser DOM accessibility steps had no final result in that snapshot. **Do not describe the entire latest CI set as green until these discrepancies and pending steps are reconciled.**

The commit description for Phase 51.4 claims 274/274 security tests and clean TypeScript compilation. This report has not independently re-executed those commands. Attach complete output or immutable CI artifacts when available.

### Required CI closure

- [ ] Refresh checks against the **current PR head SHA** after this documentation commit.
- [ ] Resolve run/check/job status discrepancies and any stale in-progress job.
- [ ] Confirm production build and browser accessibility tests have final conclusions.
- [ ] Either run the scheduled/current OSV inventory or record its explicit approved skip rationale and compensating control.
- [ ] Capture run URLs, final job conclusions, timestamps, and artifact links here or in the PR discussion.
- [ ] No check may be marked PASS based only on an older SHA or the commit message.

## 4. Phase 51.4 handoff evidence

The file named `phase51.4-remediation-handoff.md` was not found at the repository root, under `docs/remediation`, or by searching accessible repository files on the candidate branch when this gate was prepared. The repository contains the Phase 51 migration rollback plan, but that is not a complete Phase 51.4 evidence package.

Required evidence package:

- [ ] Exact source SHA and parent SHA.
- [ ] Test commands copied from the current `package.json`, with full pass/fail/skip summaries and logs or CI artifact links.
- [ ] Typecheck and lint results bound to the exact SHA.
- [ ] Migration/SQL test output from an isolated PostgreSQL instance.
- [ ] Security sanitizer regression evidence for the relevant log/error sinks.
- [ ] Event-consumer/no-subscriber and retry-ceiling evidence, including zero-consumer behavior.
- [ ] Before/after schema and ACL inventory for the isolated migration/rollback test.
- [ ] Each assertion categorized as PASS, FAIL, SKIPPED, or NOT RUN.
- [ ] Any limitation or environment-specific test failure stated plainly.

Do not fabricate local output, imply a test ran when only a commit summary was inspected, or treat CI from the predecessor SHA as verification of a newer documentation commit.

## 5. Source review — original trigger definitions

### Confirmed from tracked Migration 002

[Migration 002 — canonical schema](https://github.com/thebreakdowndaily/thebreakdown-os/blob/main/supabase/migrations/002_canonical_schema.sql) defines `set_updated_at()` to assign `NEW.updated_at = now()`, then dynamically creates timestamp triggers named `trg_<table>_updated_at` on public tables containing `updated_at`, excluding `dataset_%` tables.

This baseline explains the original triggers:

- `trg_stories_updated_at` → `set_updated_at()`
- `trg_editorial_schedule_updated_at` → `set_updated_at()`

Migration 033 replaces those same trigger names with triggers calling `set_updated_at_clock()`, which uses `clock_timestamp()` unless the update statement already changed `updated_at`.

The rollback correctly names the two triggers and recreates them against `set_updated_at()`. Its test also asserts the expected trigger names/functions and checks the story timestamp behavior. That supports the trigger restoration logic in the isolated test; it does **not**, by itself, establish the complete real database's prior schema.

## 6. Source review — baseline function grants and roles

### Confirmed from tracked Migrations 030 and 031

[Migration 030](https://github.com/thebreakdowndaily/thebreakdown-os/blob/main/supabase/migrations/030_publisher_worker_rpc.sql):

- Creates `publisher_worker` if it does not exist.
- Defines `fn_claim_due_schedule_entry()` and `fn_publish_story_with_audit(UUID)`.
- Revokes EXECUTE from `PUBLIC` for those functions.
- Grants EXECUTE to `publisher_worker`.

[Migration 031](https://github.com/thebreakdowndaily/thebreakdown-os/blob/main/supabase/migrations/031_publisher_worker_authenticator_grant.sql) grants the `publisher_worker` role to `authenticator`.

Migration 033 revokes privileges from PUBLIC, anon, authenticated, publisher_worker, and authenticator for the legacy function paths if those functions exist. The rollback re-grants EXECUTE to `publisher_worker` if the legacy functions exist. This aligns with the direct grants expressed in Migration 030 **only if** the actual target database still matches that tracked baseline.

### ACL/role verification still required

- [ ] From an isolated database initialized using the exact tracked migration chain, capture `pg_get_functiondef`, `pg_proc.proacl`/effective privileges, function owners, role attributes, and role memberships before Migration 033.
- [ ] Capture the same inventory after Migration 033 and after the rollback.
- [ ] Compare results, including PUBLIC, anon, authenticated, service_role, publisher_worker, authenticator, ownership, and membership/SET ROLE behavior. Do not assume that restoring one GRANT reconstructs the entire ACL state.
- [ ] Compare relevant default privileges and role membership options where supported by the actual PostgreSQL version.
- [ ] Keep the before/after inventories and diff as reviewer artifacts, with secrets and connection strings removed.

The embedded database test bootstrap creates several roles with explicit `NOINHERIT`, including `publisher_worker` and `authenticator`; this is not enough to prove that role attributes and membership on a real target match production's baseline. Record and reconcile role attributes rather than inferring them.

## 7. Migration 033 and rollback risks

[Migration 033](https://github.com/thebreakdowndaily/thebreakdown-os/blob/49452714b031e03b4dfbf13bb4926485fb8a9cfb/supabase/migrations/033_atomic_scheduled_publish_fence.sql) is explicitly labeled UNAPPLIED/candidate design in its SQL header. This gate did not apply it.

### R1 — Destructive outbox rollback using CASCADE

The rollback plan uses:

`DROP TABLE IF EXISTS public.publication_outbox CASCADE;`

A CASCADE drop can remove dependent database objects, such as dependent foreign-key constraints or views. It also discards all remaining rows in the outbox table. The runbook says to inspect queue status and wait for processing entries, but does not prove that pending/failed records were archived, replayed, reconciled, or that no external dependents exist.

- [ ] Replace CASCADE with a fail-closed dependency check/ordinary drop where possible, or provide a separately authorized, explicit dependency and data-loss plan.
- [ ] Before any authorized rollback, inventory all outbox rows and dependent objects; preserve/reconcile every pending, processing, and failed effect before any destructive step.
- [ ] Prove the table did not pre-exist Migration 033, or prepare a tested schema/data-aware rollback for that pre-existing-table case. The migration uses `CREATE TABLE IF NOT EXISTS` and contains conditional column additions; blindly dropping the table is not a universally safe inverse when pre-existing state is possible.

### R2 — Conditional loss of a pre-existing six-argument publication function

Migration 033 contains:

`DROP FUNCTION IF EXISTS public.fn_publish_story_fenced(UUID, UUID, TIMESTAMPTZ, INT, TIMESTAMPTZ, TEXT);`

The tracked files inspected for the original trigger/grant chain do not establish a prior definition of this overload. If the actual target database has such a function due to earlier untracked/manual changes, however, Migration 033 removes it and the current rollback script does not restore its body or grants.

- [ ] On the disposable baseline database, prove the six-argument overload is absent before the migration.
- [ ] Capture the complete `pg_get_functiondef` and ACL/owner state if the overload exists on any relevant target; the migration must not be called reversibly safe until restoration is designed and tested or the allowed precondition explicitly forbids its presence.
- [ ] Treat unexplained schema drift as a stop condition, not as permission to drop and recreate objects from guesswork.

### R3 — Baseline grants are inferred but not asserted by rollback tests

The rollback test checks that the legacy functions and new functions exist/do not exist in particular places and checks restored triggers. It does not assert a full before/after ACL snapshot or prove that the role memberships and effective privileges match the baseline.

- [ ] Add before/after ACL, owner and membership assertions in a disposable PostgreSQL test using the actual 030/031 grants.
- [ ] Prove unauthorized roles remain unable to execute the sensitive publication functions after rollback while authorized baseline access is exactly restored.
- [ ] Document all intentionally non-restored privileges and obtain independent approval for any change from baseline.

### R4 — Transaction/test isolation

The rollback verification starts a transaction, applies the rollback DDL, asserts the resulting schema, and then runs `ROLLBACK` to restore Migration 033 for later tests. The cleanup path closes the client and stops the isolated PostgreSQL cluster in a `finally` block; still, an explicit finally-protected rollback makes the safety intent more auditable.

- [ ] Ensure rollback is attempted in a `finally` path whenever the transaction has begun, before closing the connection.
- [ ] Demonstrate an intentionally failing assertion/SQL step does not leave altered state for subsequent tests.
- [ ] Keep this test restricted to its disposable PostgreSQL instance. Never aim it at staging/production.

### R5 — Pre-migration state has not been captured from a real database

This review used repository files and GitHub workflow metadata only. It did not inspect a live Supabase catalog or obtain a production/staging schema dump. Therefore, it cannot claim that actual live trigger definitions, function overloads, table existence, role memberships, owners, grants, dependent objects, or queue contents match the tracked migration chain.

- [ ] Obtain an authorized, read-only schema/ACL/dependency snapshot only when the proper database owner approves access. This request does not authorize credentials or a live connection.
- [ ] Compare the snapshot to the tracked migration chain in an isolated environment and have the reviewer sign off on differences.
- [ ] Do not apply Migration 033 or run the rollback on any live environment as part of this gate.

## 8. Independent human decision

The current PR review list contains COMMENTED entries authored by `thebreakdowndaily` and referencing earlier candidate state. Those comments are useful historical context but **do not constitute an independent review or approval** for this SHA.

No qualified non-author human reviewer identity was established from the review records inspected while preparing this gate. Do not guess a username or manufacture an approval.

- [ ] Repository maintainer requests a human reviewer who did not author this candidate/remediation and has authority to review the repository.
- [ ] The reviewer checks the exact final head SHA and links their evidence.
- [ ] The reviewer independently examines all changed publication/scheduling code plus Migration 033, the rollback, event/outbox recovery, lease enforcement, sanitizer paths, and fail-closed authorization.
- [ ] Reviewer records GitHub APPROVE or REQUEST_CHANGES, explicitly stating that they are independent of the author.
- [ ] Resolve every P1/P2 finding and all inline threads; if a thread is resolved without a code change, record the evidence and rationale.
- [ ] A separate authorized owner decides whether and when non-publishing staging validation/rehearsal is allowed. This gate itself authorizes neither.

### Reviewer decision record — must be completed by the human reviewer

- Reviewer GitHub login and role: **PENDING**
- Reviewer confirms they did not author the candidate/remediation: **PENDING**
- Exact reviewed SHA: **PENDING — must equal current PR head**
- CI evidence reviewed: **PENDING**
- Migration/rollback schema and ACL diffs reviewed: **PENDING**
- Remaining findings / exceptions: **PENDING**
- Decision: **PENDING — APPROVE or REQUEST_CHANGES**
- Decision timestamp: **PENDING**

## 9. Acceptance criteria for closing Phase 51.5

Phase 51.5 may be closed only when all are true:

1. The complete handoff package is committed and linked on the current head.
2. CI and security results are final, consistent, and tied to the exact current head SHA; skipped jobs are explicitly justified.
3. Migration/rollback is validated against the tracked baseline in a disposable PostgreSQL environment.
4. Before/after trigger, function definition, ACL, owner, role membership, table/dependency, and outbox state inventories are reviewed and attached.
5. The outbox/CASCADE and conditional old-overload risks are resolved or explicitly blocked by verified preconditions.
6. A qualified independent human records a review decision on the current head.
7. PR #93 remains draft and no live mutation/publication has occurred without separate explicit authorization.

**Status remains: `BLOCKED — INDEPENDENT HUMAN DECISION AND COMPLETE BASELINE/CI EVIDENCE NOT PROVEN`.**
