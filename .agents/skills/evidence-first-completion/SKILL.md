---
name: evidence-first-completion
description: >
  Mandatory evidence-based completion and adversarial verification for non-trivial engineering tasks.
  Use before implementation planning, before declaring a task complete, reviewing claims that tests passed,
  handling security or publication changes, or verifying an exact branch/commit/PR state.
---

# Evidence-First Completion & Adversarial Verification

**Status:** Mandatory completion gate for every non-trivial engineering task.
**Authority:** Subordinate only to explicit repository security, editorial, privacy, and release constraints. This skill adds verification discipline; it never authorizes deployment or production mutation.

## Purpose

Prevent false completion caused by self-confirming tests, duplicated test logic, skipped prerequisites, stale CI results, or reports that claim more than the evidence proves. The implementation agent owns delivery; the verification process must try to falsify the completion claim.

## Required lifecycle

### 1. Establish the exact baseline

Before editing, capture and inspect:
- repository root, active branch, `git status --short`, recent commits and `HEAD`;
- whether the requested target is local, remote, a PR, or a deployment;
- existing task ledger / active-state notes and relevant code, test, configuration, and workflow files.

Preserve pre-existing edits. Never assume two worktrees or branches contain the same files. If the expected operating-system assets or task ledger are missing, record that as a real discrepancy and locate the authoritative checkout before proceeding.

### 2. Turn the request into falsifiable acceptance criteria

Write the goal, in-scope paths, explicit non-goals, affected invariants, and recovery boundary before implementation. For each criterion, define:
- the behavior that must be true;
- the test or observable evidence that would prove it;
- at least one negative/adversarial case that should fail closed;
- whether it can be validated offline or requires external approval.

Do not turn an architectural assumption into a fact without checking runtime code, configuration, route/call graph, schema, and deployment manifests as applicable.

### 3. Implement the smallest complete change

Trace callers and data flow. Prefer focused, reversible changes. Do not weaken guards, lower thresholds, loosen assertions, skip difficult tests, or change expected outputs merely to make a suite green. If a pre-existing assertion is wrong, prove the intended contract from authoritative code/specification and document the reasoning plus regression evidence.

### 4. Adversarially test the test

For each safety-critical or non-trivial change, inspect whether its test could pass while the behavior is absent or broken. In particular:

- A test that returns early because credentials, files, fixtures, or a service are missing is **not a passing behavior test**. Report a genuine skip explicitly using the framework's skip mechanism, or fail a required prerequisite. Do not hide skips in warnings, catch blocks, `return`, or permissive mocks.
- Test the actual canonical artifact when feasible (for example, execute the actual rollback SQL file in disposable PostgreSQL). Do not test only a separately re-created copy of the implementation.
- Exercise negative paths: missing/invalid credentials, malformed/unapproved targets, collision cases, authorization failures, absent subscribers/consumers, retry ceilings, and transaction rollback where relevant.
- For failure atomicity, compare meaningful before/after state. A single missing table does not prove the whole database was unchanged.
- For data-preservation claims, compare identities, counts, payloads, timestamps, statuses, errors, permissions, and dependencies as relevant. Distinguish intentional transitions from exact preservation.
- Use unique isolated test records; cleanup must be verified. Never run live-mutating test modes unless the user has explicitly authorized that exact environment and operation.
- Ensure the changed test actually ran. Record suite/test counts and skipped tests when available.

### 5. Run checks proportional to risk

Run focused tests first, then relevant type, lint, security, migration and integration checks. For publication, database, authorization, secrets, migrations, release, or infrastructure work, test the relevant failure cases—not merely happy paths.

If a command cannot run, record the exact blocker and mark the check `BLOCKED` or `NOT RUN`; do not silently substitute a weaker command and label it equivalent. Separate local results from CI results.

### 6. Verify the delivered revision

Before stating the work is complete:
- inspect the full diff and staged files;
- check for unrelated files, accidental artifacts, unsafe configuration, secrets, or weakened assertions;
- capture the exact commit SHA and verify that it contains the claimed changes;
- if pushed/PR-bound, inspect status and checks for that exact SHA. Never reuse results from an older commit as current evidence;
- distinguish passed, failed, skipped, pending, blocked, and not-run checks;
- report which evidence is direct, agent-reported, inferred, or unavailable.

A successful Vercel preview, green selected workflow, typecheck, or unit suite does not prove unrelated health checks, a clean full dependency inventory, independent review, deployment success, or production safety.

### 7. Independent-review honesty and release gating

An implementation agent, another sub-agent under the same execution, or a self-authored report is not an independent human reviewer. Label internal/adversarial review accurately.

Never mark a task release-ready while required independent review, owner authorization, staging validation, rollback validation, or operational rehearsal remains open. No migration application/rollback, production mutation, worker activation, deployment, publication, merge, or force-push is authorized merely by this skill.

### 8. Completion decision

Classify each acceptance criterion:
- `CLOSED`: direct evidence demonstrates the criterion on the exact delivered revision.
- `PARTIALLY VERIFIED`: some evidence exists, but an essential assertion or environment-specific proof is missing.
- `OPEN`: criterion failed or remains unverified.
- `BLOCKED`: verification cannot safely proceed without access or explicit authorization.

The overall task may be reported **complete** only when all mandatory criteria are `CLOSED`. Otherwise report **partial completion** and identify the smallest next action. Never convert uncertainty into confidence.

## Required final report

Provide a compact table with:
- acceptance criterion / invariant;
- files changed;
- exact command or evidence source;
- result, counts, and skips;
- exact verified commit SHA;
- status (`CLOSED`, `PARTIALLY VERIFIED`, `OPEN`, `BLOCKED`);
- residual risk or next action.

State explicitly whether any live environment was touched. Do not say “all tests passed” without enumerating the relevant commands and their outcomes. Do not claim a human approval that did not occur.
