---
name: evidence-first-completion
description: >
  Mandatory completion gate for non-trivial engineering tasks. Proves that the delivered
  behavior and the exact commit were verified, and classifies every check as passed, failed,
  skipped, blocked, or not run. Use before declaring any non-trivial task complete.
---

# Evidence-First Completion

A completion gate, not optional advice. The implementing agent owns delivery; this gate exists to **falsify** the completion claim before it is reported.

Use before planning a non-trivial change, before declaring it complete, and whenever a claim of "tests passed" or "verified" is about to be made.

---

## 1. Establish the exact baseline

Before editing, capture repository root, active branch, `git status --short`, and `HEAD`. Determine whether the target is local, remote, a PR, or a deployment. Preserve pre-existing edits. Never assume two branches or worktrees contain the same files — verify.

## 2. State falsifiable acceptance criteria

Write the goal, in-scope paths, non-goals, affected invariants, and recovery boundary. For each criterion define:

- the behavior that must be true;
- the test or observable evidence that would prove it;
- at least one negative case that must fail closed;
- whether it can be validated offline or needs external authorization.

An architectural assumption is not a fact until confirmed against runtime code, configuration, call graph, schema, or deployment manifest.

## 3. Implement the smallest complete change

Trace callers and data flow first. Do not weaken guards, lower thresholds, loosen assertions, or skip difficult tests to reach green. If an existing assertion is wrong, prove the intended contract from authoritative code or specification and document the reasoning and the regression evidence.

## 4. Attack the test

For every safety-critical or non-trivial change, ask whether the test could pass while the behavior is absent or broken.

- A test that returns early because credentials, fixtures, or a service are missing is **not** a passing behavior test. Report a real skip through the framework's skip mechanism, or fail a required prerequisite. Do not hide skips in warnings, catch blocks, bare `return`, or permissive mocks.
- Test the canonical artifact. Execute the actual migration file against disposable PostgreSQL rather than a re-created copy of its logic.
- Cover the negative paths: missing or invalid credentials, malformed input, collision, authorization failure, absent consumer, retry ceiling, transaction rollback.
- For atomicity claims, compare meaningful before/after state. A single missing table does not prove the database was unchanged.
- Confirm the changed test actually ran. Record suite and test counts, and any skips.

## 5. Verify in layers

Targeted regression first, then type, lint, security, migration, domain suites, build, and browser or e2e gates as applicable. Scale the set to risk; for publication, authorization, secrets, migrations, or release work, test the failure cases rather than only the happy path.

If a command cannot run, record the exact blocker and mark it `BLOCKED` or `NOT RUN`. Do not substitute a weaker command and call it equivalent. Keep local results distinct from CI results.

For the verification hierarchy and evidence-by-claim expectations, see `.agents/skills/gravitas/references/verification.md`; this skill does not restate it.

## 6. Bind evidence to the delivered revision

Before reporting completion:

- inspect the full diff and staged files for unrelated changes, artifacts, secrets, and weakened assertions;
- capture the exact commit SHA and confirm it contains the claimed changes;
- if pushed or PR-bound, inspect status and checks for that exact SHA — never reuse an earlier commit's results;
- distinguish direct evidence from agent-reported, inferred, and unavailable evidence;
- separate passed, failed, skipped, pending, blocked, and not-run checks.

A green preview deploy, selected workflow, typecheck, or unit suite proves none of: unrelated health checks, a clean dependency inventory, independent review, deployment success, or production safety.

## 7. Independent review is not self-review

An implementing agent, a sub-agent under the same execution, or a self-authored report is **not** an independent human reviewer. Label internal and adversarial review accurately. Never mark work release-ready while required independent review, owner authorization, staging validation, rollback validation, or operational rehearsal remains open.

## 8. Classify every criterion

| Status | Meaning |
|---|---|
| `CLOSED` | Direct evidence demonstrates the criterion on the exact delivered revision. |
| `PARTIALLY VERIFIED` | Some evidence exists, but an essential assertion or environment-specific proof is missing. |
| `OPEN` | Failed or unverified. |
| `BLOCKED` | Cannot proceed safely without access or explicit authorization. |

Report **complete** only when all mandatory criteria are `CLOSED`. Otherwise report partial completion and the smallest next action.

---

## Required final report

| Acceptance criterion | Files changed | Evidence (command or source) | Result and counts | Status | Residual risk |
|---|---|---|---|---|---|

Then state explicitly:

- the exact verified commit SHA;
- every command run and its outcome, including skips and unrun gates;
- whether any live environment was touched;
- which approvals remain outstanding;
- the next action.

Do not write "all tests passed" without enumerating the commands. Do not claim an approval that did not occur.

## Boundaries

Engineering completion is not editorial approval. `CLOSED` criteria prove code behavior; they say nothing about source verification, fact-checking, editorial review, or publication eligibility. Nothing in this skill authorizes merging, deploying, publishing, sending external requests, or mutating production or staging databases.
