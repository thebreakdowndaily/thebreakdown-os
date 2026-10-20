---
name: adversarial-verification
description: >-
  Rigorous failure-mode scrutiny and negative-testing methodology for The Breakdown OS.
  Use when verifying changes, assessing regressions, testing security boundaries, or
  evaluating system resilience under concurrency, corrupt input, stale state, and partial failures.
---

# Adversarial Verification Workflow

Adversarial verification scrutinizes an implementation from the perspective of an engineer actively trying to break it. A green "happy-path" unit test is necessary but insufficient; systems fail at boundary conditions, during race conditions, with malicious or corrupt inputs, and under degraded dependencies.

## Core Verification Pillars

```
+-------------------------------------------------------------------------+
|                      ADVERSARIAL VERIFICATION VECTORS                    |
+-------------------------------------------------------------------------+
| 1. Malformed & Boundary Inputs   --> Null, empty, huge, UTF-8, type skew |
| 2. Stale State & Out-of-Order    --> Race windows, idempotency, retries |
| 3. Permission & RLS Boundaries   --> Role downgrades, tenant isolation   |
| 4. Failure Injection             --> DB disconnects, timeouts, 500s      |
| 5. Side-Effect Assertions        --> Audit logs, DB rows, outbox entries |
+-------------------------------------------------------------------------+
```

---

## 1. Adversarial Test Checklist

Before certifying any implementation as complete, challenge it against these failure vectors:

### A. Malformed & Boundary Inputs
- Empty string, whitespace-only, `null`, `undefined`, NaN, circular structures.
- Exorbitant payloads (e.g. `pageSize: 999999` in API routes).
- Non-existent IDs, invalid UUIDs, malformed slug formats.
- SQL injection / XSS strings in search parameters, slug params, and headers.

### B. Stale State, Concurrency & Idempotency
- **Concurrent requests:** Two simultaneous publish or update calls for the same entity or story slug. Ensure database-level locking (`FOR UPDATE` or OCC version checking) prevents phantom writes.
- **Out-of-order delivery:** Events arriving after a newer state is already recorded.
- **Duplicate execution:** Re-running an idempotent worker or webhook must produce identical state without duplicate database records or multiple notifications.

### C. Permission & Authorization Boundaries
- Client spoofing: attempts to pass elevated roles in `user_metadata` instead of authoritative `app_metadata` or database `user_roles`.
- Anonymous callers: verifying that drafts, quarantined test artifacts, and internal telemetry fail-closed (`404` or `401/403`).
- Tenant isolation: verifying Principal A cannot read, update, or revoke Principal B's resources.

### D. Fault Injection & Resilience
- Downstream database connection failure: verify whether the endpoint fails-closed (for auth/security tiers) or degrades gracefully (for read-heavy cached content).
- Timeout simulation: verify that async background workers enforce retry ceilings and do not loop infinitely.

### E. Side-Effect Assertions
- Verify not just return status (`200 OK`), but real persistent state:
  - Is an entry written to `audit.story_versions` or the relevant audit log?
  - Are sensitive secrets (`SUPABASE_SERVICE_ROLE_KEY`, passwords) omitted from logs and client JSON?

---

## 2. Evidence Tier Classification

Never conflate different degrees of verification. Document evidence under these specific tiers:

| Tier | Category | Meaning & Scope | Example in The Breakdown OS |
|---|---|---|---|
| **Tier 1** | Static Reasoning | Type signatures, linter checks, manual code walkthrough. | `npm run check:type`, `npm run check:lint` |
| **Tier 2** | Pure Unit Tests | In-memory mocks, isolated functional logic. | `vitest run tests/story/claim-block-rendering.test.ts` |
| **Tier 3** | Integration Tests | Multi-module flows with local fixtures and providers. | `npm run test` (canonical test harness) |
| **Tier 4** | Database Enforcement | Real isolated PostgreSQL instance with applied migrations & RLS. | `npm run test:migration`, `tests/security/database-enforcement.test.ts` |
| **Tier 5** | Live Environment Evidence | Verification against staging/production endpoints. | `tests/production-deployment.test.ts` |

---

## 3. Delegation to Independent Reviewer

Where supported by the active Antigravity surface:
1. Delegate adversarial scrutiny to an isolated subagent or clean-context `security-reviewer` (`.agents/agents/security-reviewer/agent.md`).
2. The independent reviewer must examine the diff without inheriting the implementer's optimistic assumptions.
3. Treat findings from the reviewer as actionable work items, not advisory commentary.

---

## 4. Non-Fabrication Invariant

- **Strict Truthfulness:** Never claim a test was executed if it was only hypothesized.
- If a test was not run due to missing local dependencies (e.g. offline Supabase or Docker), explicitly report it as **SKIPPED** or **NOT RUN**, never as **PASS**.
- Distinguish automated verification results from independent human editorial approval.
