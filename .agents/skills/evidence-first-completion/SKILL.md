---
name: evidence-first-completion
description: >
  Mandatory completion gate for non-trivial tasks: proves delivered behavior and exact commit were
  verified, truthfully classifying passed, failed, skipped, blocked, and unrun checks.
---

# Evidence-First Completion

Mandatory before claiming a non-trivial engineering task complete.

## Completion checklist

1. **Inspect delivered state.** Read final diff and relevant callers. Check branch, full commit SHA, working-tree status where available, and whether the PR head matches the intended SHA.
2. **Prove behavior.** Choose a test that fails under the original defect. It must exercise the real entry point and relevant permissions/side effects, including negative cases. For high-risk behavior, a source-pattern test alone is insufficient.
3. **Run layered checks.** Targeted regression first; then typecheck, lint, security, migration/database safety, unit/domain/integration tests, production build, and browser/e2e gates as applicable.
4. **Review skipped work.** Identify early returns, skipped tests, missing test files, stale workflow summaries, failing steps hidden by cleanup, and external steps not executed. Never describe SKIPPED, BLOCKED, or NOT RUN as PASS.
5. **Bind evidence to SHA.** Cite workflow runs and exact commits. Do not carry evidence from a parent, earlier branch head, or stale PR merge ref to delivered code.
6. **Adversarially re-read.** Try to falsify the result with forged identity, invalid input, concurrent calls, dependency failure, partial writes, public leaks, stale caches, and false-green tests.
7. **Update durable records.** Record verified facts, SHA, commands/workflow links, failures/remediations, blockers, and next action. Preserve unrelated active state.
8. **State the decision precisely.** Implemented = code changed; Verified = named tests passed on stated SHA; Reviewed = independent/human review complete; Released = authorized deployment/publication completed and checked. Do not conflate these.

## Required final report

Include the change, tested SHA, material check links/commands, failures/limitations, skipped and unrun gates, remaining approvals, and next action. If a required check cannot run, say so directly.

## Stop conditions

Do not merge, deploy, publish, send external requests, or mutate production/staging databases unless their distinct authorization gates are satisfied. Green CI grants none of those permissions.
