# Antigravity Rule — The Breakdown Workspace

*Tool-specific adapter. The current engineering contract is the repository-root `AGENTS.md`; keep this file as a short pointer rather than a competing doctrine.*

- Discover the actual checkout dynamically from the opened workspace and Git (for example, `git rev-parse --show-toplevel`). Never assume a machine-specific absolute path.
- Preserve user changes. Do not discard uncommitted edits or run destructive cleanup commands.
- Use current `AGENTS.md` for engineering policy and relevant project/docs files for task context.
- Use Git status, branch, and recent commits to determine live repository state. A static project note is not a substitute.
- Use a separate branch or worktree when it materially improves isolation and the active task permits it; do not create unnecessary clones/worktrees for read-only work.
- Before broad changes, inspect the actual tree, callers, tests, and CI gates. Prefer small, reversible changes with evidence.

When tool-specific guidance conflicts with `AGENTS.md`, follow the current engineering contract and raise material policy conflicts for reconciliation. Editorial questions remain governed by the Editorial Constitution and applicable editorial standards.
