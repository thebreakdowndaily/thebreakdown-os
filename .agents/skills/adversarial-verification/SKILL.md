---
name: adversarial-verification
description: >
  Adversarial verification for security boundaries, authorization, data integrity, negative tests,
  concurrency, publication safety, and failure modes.
---

# Adversarial Verification

Use after changes involving security, permissions, persistence, publication, shared data, or release logic.

1. **Name the asset and attacker.** Identify protected data or operations, trust boundaries, remote entry points, and caller-controlled inputs.
2. **Start from reachable entry points.** In Next.js `'use server'` modules, treat each exported async function as potentially remotely callable. Also inspect route handlers, jobs, RPCs, APIs, and wrappers.
3. **Follow identity.** Roles must come from a server-controlled session, verified token, or authoritative record. Never trust caller-supplied actor/role claims.
4. **Try hostile input.** Check missing IDs, invalid enums, forged actors, extra fields, unauthorized roles, stale state, replay, duplicates, and dependency/storage failure.
5. **Verify ordering.** Authorization must precede protected mutations; validation must precede writes; publication must fail closed.
6. **Attack the regression test.** Ensure the test would fail under the old behavior. Watch for early returns, swallowed errors, no-op mocks, broad catches, or assertions that only examine source spelling.
7. **Inspect race and failure paths.** Check concurrent updates, partial writes, transaction boundaries, idempotency, timeouts, and error propagation.
8. **Report only grounded findings.** Explain the reachable case, consequence, smallest fix, and test that proves closure. Distinguish confirmed defects from plausible risks.

Do not declare a boundary secure based solely on typecheck or a source-pattern test. Combine structural checks with runtime tests where supported. Never test by altering live data or production systems.
