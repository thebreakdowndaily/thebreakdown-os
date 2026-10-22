---
name: release-readiness
description: >
  Reconciles exact Git SHA, required CI/security/audit gates, skipped deployment checks,
  human approvals, rollback readiness, and release prerequisites.
---

# Release Readiness

Use when preparing a candidate, reporting acceptance, opening a release PR, or evaluating merge safety.

1. **Pin the candidate.** Record branch and full HEAD SHA. Confirm PR head equals the intended branch/head and no later commit exists.
2. **Require exact-SHA evidence.** Check dependencies, typecheck, lint, tests, security, migration/data safety, build, browser/e2e, and project-specific audit workflows. Earlier commit results do not certify later code.
3. **Classify each result.** Use PASS, FAIL, SKIPPED, BLOCKED, or NOT RUN. Skipped deployment/health steps are not passes. Stale workflow summaries remain unresolved until reconciled.
4. **Read real failures.** Retrieve logs, identify root cause, distinguish code errors from infrastructure issues, fix, and verify the new head.
5. **Inspect scope.** Check diff for noise, unrelated changes, compatibility breaks, security regressions, secrets, and missing tests/docs.
6. **Check release prerequisites.** Confirm migrations, backups, rollback, health checks, canary/monitoring, and required human/editorial/owner approvals. Green CI does not grant approval.
7. **Make a clear decision.** Keep PRs draft while required gates are pending or failing. Never merge/deploy without required review and authorization.
8. **Record the outcome.** Update acceptance report and task ledger with exact SHA, workflow links, results, and next action.

Release-ready means required gates pass on the same candidate and all separate approval/deployment gates are satisfied. Mergeability alone is insufficient.
