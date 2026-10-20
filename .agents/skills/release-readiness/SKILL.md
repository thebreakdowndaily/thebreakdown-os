---
name: release-readiness
description: >-
  Reconciles repository source state, git commit SHA, test gates, security
  inventory, and release controls for The Breakdown OS. Use before promoting changes,
  cutting release candidates, certifying milestones, or evaluating production readiness.
---

# Release Readiness Workflow

This procedure reconciles code state, automated gate results, security compliance, and deployment prerequisites into an evidence-backed release assessment.

## Foundational Principle

```text
A green CI run != Staging health != Production safety != Editorial approval.
```

Each dimension represents an independent quality boundary that must be reconciled explicitly with real evidence.

---

## 1. Five-Status Evidence Taxonomy

Every check and gate must be classified strictly using one of these five statuses:

| Status | Exact Definition | Permitted Action |
|---|---|---|
| **PASS** | Command executed with exit code 0; assertions verified against real data. | Gate satisfied. |
| **FAIL** | Command exited non-zero or an assertion was violated. | Releases blocked until remediated. |
| **BLOCKED** | Cannot proceed due to an external dependency, missing permission, or prior failure. | Record exact blocker ID. |
| **SKIPPED** | Intentionally bypassed for documented, valid reasons (e.g. offline research benchmark). | Record justification; never treat as PASS. |
| **NOT RUN** | Check was not executed in the current session. | Cannot be claimed as verified. |

---

## 2. Release Gate Verification Matrix

Execute and record the canonical verification gates:

```bash
# Gate 1: Type Safety
npm run check:type

# Gate 2: Code Quality
npm run check:lint

# Gate 3: Security & Authorization Regression
npm run test:security

# Gate 4: Database Migrations & RLS Safety (isolated PostgreSQL)
npm run test:migration

# Gate 5: Canonical Domain Test Harness
npm run test

# Gate 6: Forensic Root-Cause Suites
npm run test:forensic

# Gate 7: Accessibility & Contrast
npm run test:a11y

# Gate 8: Production Next.js Build
npm run build
```

---

## 3. Reconciliation Procedure

### Step 1: Reconcile Repository Baseline
Capture the exact Git identity:
```bash
git rev-parse HEAD
git branch --show-current
git status --short
```
Verify that there are no uncommitted tracked changes or accidental temporary files in build targets.

### Step 2: Audit CI & Workflow Alignment
Compare local state with GitHub Actions workflows in `.github/workflows/ci.yml` and `.github/workflows/production-deploy.yml`:
- Are the local Node and dependency versions aligned (Node >= 22)?
- Does `python scripts/validate-skills.py` pass cleanly?

### Step 3: Check Production Safeguards
- Confirm that no production credentials (`SUPABASE_SERVICE_ROLE_KEY`, DB passwords) are committed to Git.
- Confirm migration history (`supabase/migrations/`) remains strictly sequential and immutable.
- Confirm that high-impact actions (e.g. Migration 033 application, PR #93 merge) have explicit user sign-off.

### Step 4: Synthesize Release Certification Ledger
Produce the structured Release Readiness Assessment:

```markdown
### Release Certification Assessment

- **Commit SHA:** [40-char SHA]
- **Branch:** [branch-name]
- **Timestamp:** [ISO 8601]

| Gate | Command | Status | Evidence / Notes |
|---|---|---|---|
| Gate 1: Types | `npm run check:type` | PASS | 0 errors |
| Gate 2: Lint | `npm run check:lint` | PASS | 0 errors |
| Gate 3: Security | `npm run test:security` | PASS | 32/32 migrations, auth/RLS verified |
| Gate 4: Migrations | `npm run test:migration` | PASS | 33/33 DB tests passed |
| Gate 5: Domain Tests | `npm run test` | PASS | All sub-suites passed |
| Gate 6: Forensic | `npm run test:forensic` | PASS | Resolution verified |
| Gate 7: A11y | `npm run test:a11y` | PASS | Contrast & labels verified |
| Gate 8: Build | `npm run build` | PASS | Static pages pre-rendered |

- **Release Recommendation:** [GO / NO-GO / BLOCKED]
- **Outstanding Items:** [List any non-blocking warnings or external dependencies]
```

### Step 5: Update Continuity Memory
Record the assessment in [ACTIVE_STATE.md](../../../docs/agent-operating-system/ACTIVE_STATE.md) and [TASK_LEDGER.md](../../../docs/agent-operating-system/TASK_LEDGER.md).
