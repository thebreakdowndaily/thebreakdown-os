# Antigravity Rule — The Breakdown Workspace

*Tool-specific adapter. The current engineering contract is the repository-root `AGENTS.md`; keep this file as a short pointer rather than a competing doctrine.*

- Discover the actual checkout dynamically from the opened workspace and Git (for example, `git rev-parse --show-toplevel`). Never assume a machine-specific absolute path.
- Preserve user changes. Do not discard uncommitted edits or run destructive cleanup commands.
- Use current `AGENTS.md` for engineering policy and relevant project/docs files for task context.
- Use Git status, branch, and recent commits to determine live repository state. A static project note is not a substitute.
- Consult `docs/agent-operating-system/ACTIVE_STATE.md` and `TASK_LEDGER.md` for active mission state, prior decisions, and verified ledgers.
- Use a separate branch or worktree when it materially improves isolation and the active task permits it; do not create unnecessary clones/worktrees for read-only work.
- Before broad changes, inspect the actual tree, callers, tests, and CI gates. Prefer small, reversible changes with evidence.
- **Mandatory before completion:** read and follow `.agents/skills/evidence-first-completion/SKILL.md` for every non-trivial task. Adversarially verify that tests exercise the real behavior and cannot return early as false-green passes; verify the exact delivered SHA and classify skipped, blocked, and unrun checks truthfully. If the skill is unavailable, apply the same gate inline and report the missing file.
- Ponytail skills (`.agents/skills/ponytail*`) provide subordinate lean-engineering heuristics. The Editorial Constitution (`docs/editorial/editorial-constitution.md`), security controls, RLS, and release gates strictly supersede any simplification rule.

When tool-specific guidance conflicts with `AGENTS.md`, follow the current engineering contract and raise material policy conflicts for reconciliation. Editorial questions remain governed by the Editorial Constitution and applicable editorial standards.
