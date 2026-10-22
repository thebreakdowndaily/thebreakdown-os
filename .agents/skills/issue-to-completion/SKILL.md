---
name: issue-to-completion
description: >
  End-to-end engineering workflow for fixing issues from repository reconnaissance through
  implementation, tests, adversarial review, durable status updates, and exact-SHA verification.
---

# Issue to Completion

Use this workflow for every non-trivial code change. A plan is not completion.

1. **Establish the baseline.** Read `AGENTS.md`, relevant `ACTIVE_STATE.md`, `TASK_LEDGER.md`, and `DECISIONS.md`. Confirm repository, branch, HEAD, working-tree state, current callers, and governing tests. Preserve unrelated work.
2. **Define a bounded outcome.** State the behavior that must be true, the failure modes to prevent, files in scope, and acceptance evidence. Separate internal fixes from external approvals.
3. **Trace before editing.** Inspect target code, callers, data contracts, auth boundaries, side effects, and existing tests. Search every reference when changing a shared contract.
4. **Implement the smallest complete fix.** Prefer clear ownership and fail-closed behavior. Do not suppress errors, weaken permissions, or modify production data to make tests pass.
5. **Add a regression test.** It must fail if the old defect returns. Cover relevant negative cases, denied permissions, invalid input, and unavailable dependencies.
6. **Verify in layers.** Run targeted tests first, then typecheck, lint, security/migration tests, broader suites, build, and browser/e2e gates as applicable. Repair real failures and repeat.
7. **Adversarially review.** Check alternate entry points, forged input, failure paths, duplicate operations, races, stale data, and false-green tests.
8. **Inspect the final diff.** Remove generated noise and unrelated changes. Confirm docs match implementation.
9. **Record exact evidence.** Record the SHA actually tested and classify each gate as passed, failed, skipped, blocked, or unrun. Never transfer results from an earlier SHA to a later change.
10. **Update continuity.** Update the appropriate task ledger and active-state record without overwriting unrelated active work. Report remaining approvals and unknowns.

A task is not complete while a required test is failing, a critical gate is unrun, or delivered code differs from the verified SHA. Do not merge, deploy, publish, or mutate live databases without explicit authorization.
