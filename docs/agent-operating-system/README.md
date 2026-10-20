# The Breakdown OS — Autonomous Agent Working Memory

This directory provides the persistent working memory for Antigravity and autonomous engineering agents operating on The Breakdown OS.

## Purpose

To stop requiring the product owner to re-explain architectural decisions, active missions, and unresolved blockers at the start of every session, this memory structure persists verified facts, architectural invariants, and exact next actions across conversations.

---

## Memory Files

| File | Purpose | Update Frequency |
|---|---|---|
| [`ACTIVE_STATE.md`](./ACTIVE_STATE.md) | Current mission, checked-out Git SHA, verified test gates, unresolved blockers, and the single immediate next action. | Start and end of every task or session. |
| [`DECISIONS.md`](./DECISIONS.md) | Durable architectural and engineering decisions with rationale, authority, and evidence links. | Whenever an architectural decision or design invariant is established. |
| [`TASK_LEDGER.md`](./TASK_LEDGER.md) | Structured inventory of findings, bug fixes, refactors, priorities, reproduction steps, verification status, and test evidence. | After every discrete work unit. |

---

## Operating Rules for Agents

1. **Verified Facts Only:** Never record speculative assumptions or unexecuted test passes.
2. **Commit SHA Binding:** Always bind release status, test evidence, and gate verification to a specific 40-character Git commit SHA and ISO 8601 timestamp.
3. **Pointers Over Copying:** Link directly to authoritative source files, tests, and documentation rather than duplicating large code blocks.
4. **Preserve Contradictions:** If two sources of truth conflict, document the contradiction in `TASK_LEDGER.md` rather than silently smoothing it over.
5. **Fresh Refresh at Startup:** At the start of every session, verify git status (`git status --short`, `git rev-parse HEAD`) rather than assuming the previous session's state remains unchanged.
