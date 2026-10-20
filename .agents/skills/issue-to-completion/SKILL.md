---
name: issue-to-completion
description: >-
  Default autonomous engineering execution workflow for The Breakdown OS. Use when
  assigned a bug fix, feature, refactor, audit remediation, or code task. Drives from
  request through reconnaissance, root-cause analysis, implementation, test-and-repair loops,
  adversarial review, and ledger updates to true completion without needing step-by-step prompting.
---

# Issue to Completion Workflow

This is the primary execution skill for all engineering work in The Breakdown OS. It defines the autonomous ten-step lifecycle that takes an issue from normal-language problem statement to verified, production-ready completion.

## Operating Principles

- **Outcome Ownership:** A task is not complete simply because a file changed or a command was executed. It is complete when verified by tests, reviewed against invariants, and recorded in working memory.
- **Autonomous Persistence:** When a test fails or a defect is uncovered during implementation, diagnose root causes and repair regressions immediately. Do not stop to ask the user what to do next unless a material product ambiguity, missing secret, or external blocker prevents progress.
- **Lean Implementation:** Apply the smallest coherent change that solves the issue without speculative wrappers or unnecessary abstractions.

---

## The 10-Step Execution Protocol

### Step 1: Reconnaissance & State Resolution
1. Check repository state:
   ```bash
   git rev-parse --show-toplevel
   git rev-parse HEAD
   git branch --show-current
   git status --short
   ```
2. Read the active mission and continuity context:
   - [ACTIVE_STATE.md](../../../docs/agent-operating-system/ACTIVE_STATE.md)
   - [TASK_LEDGER.md](../../../docs/agent-operating-system/TASK_LEDGER.md)
   - [DECISIONS.md](../../../docs/agent-operating-system/DECISIONS.md)
3. Ensure uncommitted user work is preserved and never overwritten.

### Step 2: Scope, Requirements & Invariant Identification
1. Identify the core requirement and acceptance criteria.
2. Determine affected architectural boundaries:
   - Next.js server vs client components (`app/`, `components/`)
   - Data access and provider contracts (`services/repositories/`, `lib/story/`)
   - Database schemas, RLS policies, migrations (`supabase/migrations/`)
   - Editorial & publication gates (`docs/editorial/editorial-constitution.md`)
3. Identify relevant verification suites in `package.json` and `tests/`.

### Step 3: Root-Cause Investigation & Call Graph Tracing
1. Search and inspect all references to the affected symbols or endpoints.
2. Trace callers, data flows, and configuration consumers.
3. If investigating a bug or regression, construct a minimal reproduction before altering source code.

### Step 4: Ledger Task Registration
1. In `docs/agent-operating-system/TASK_LEDGER.md`, record the active task:
   - Unique Finding/Task ID (e.g., `TASK-YYYYMMDD-01`)
   - Priority (`P0`, `P1`, `P2`)
   - Scope and affected modules
   - Reproduction steps and expected outcome
   - Initial status (`IN_PROGRESS`)

### Step 5: Minimal Coherent Implementation
1. Follow existing codebase conventions and design system patterns.
2. Preserve existing safeguards: RLS, auth gates, Zod schemas, error boundaries.
3. Avoid modifying unrelated files or applying cosmetic refactors.

### Step 6: Focused Verification
1. Run focused unit or integration tests for the touched subsystem:
   ```bash
   npx vitest run path/to/focused.test.ts
   # or
   npx tsx path/to/focused.test.ts
   ```
2. Verify static safety:
   ```bash
   npm run check:type
   npm run check:lint
   ```

### Step 7: Test-and-Repair Loop & Edge Case Reproduction
1. If any test fails, do NOT stop or report defeat.
2. Examine the error stack trace and root cause.
3. Apply targeted corrections and re-run the focused test suite.
4. Test adverse edge cases: empty payloads, invalid IDs, concurrency, network/database failure paths.
5. Iterate until all focused tests pass cleanly.

### Step 8: Adversarial Review & Side-Effect Audit
1. Invoke the `adversarial-verification` skill (`.agents/skills/adversarial-verification/SKILL.md`).
2. Review the full staged/unstaged diff:
   ```bash
   git diff
   ```
3. Verify no credentials, debug logs, or unrelated file modifications were introduced.

### Step 9: Working Memory & Ledger Update
1. Update `docs/agent-operating-system/TASK_LEDGER.md`:
   - Mark task status as `VERIFIED`.
   - Record exact test command and passing assertion count.
2. Update `docs/agent-operating-system/ACTIVE_STATE.md`:
   - Record current commit SHA or working diff summary.
   - Update verified status and identify the next highest-priority action.

### Step 10: Final Outcome Reporting
1. Report the verified outcome concisely to the user.
2. Include:
   - Root cause diagnosed and resolved.
   - Files modified.
   - Test suites executed and pass counts.
   - Any remaining non-blocking external gates or next recommended actions.
