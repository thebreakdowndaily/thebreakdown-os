# GRAVITAS Core pilot — The Breakdown OS

**Status:** Evaluation-only proposal on branch `feat/gravitas-core-pilot`  
**Upstream:** [`udaysharmadev/Gravitas`](https://github.com/udaysharmadev/Gravitas)  
**Pinned source commit:** [`5fb2fcb8011e1d20db61ce385ae6a7e47deb2be5`](https://github.com/udaysharmadev/Gravitas/commit/5fb2fcb8011e1d20db61ce385ae6a7e47deb2be5)  
**License:** MIT; see the accompanying upstream license text and attribution record.

## Goal

Evaluate whether GRAVITAS Core improves the consistency of Gemini / Antigravity coding workflows for The Breakdown OS without changing product architecture, runtime dependencies, deployment configuration, or production behavior.

## Scope of this pilot

- Vendor the portable Agent Skill and its Markdown references, resource guides, and agent-role prompts under `.agents/skills/gravitas/`.
- Keep upstream source pinned so the snapshot is traceable and updates are intentional.
- Adapt statements that would otherwise overstate Core-mode enforcement. In Core mode, policy is expressed as instructions; it does not mechanically intercept tools or gate completion.
- Retain the upstream MIT license and note local adaptations.
- Do not install the optional GRAVITAS Native plugin, add hooks, change host permissions, install a CLI/runtime, run install scripts, or execute upstream verification scripts.
- Do not modify application code, database, migrations, CI configuration, environment variables, hosting, or production.

## Why Core-only first

Core has the lowest integration surface and can be reviewed as project-local guidance. Native is a separate Antigravity plugin with hook-based checks. It is intentionally out of scope until Core demonstrates useful improvement and Native receives a separate security and compatibility review.

## Validation checkpoints

### Checkpoint 1 — Structural integration

- [ ] The skill's frontmatter `name` matches its directory name (`gravitas`).
- [ ] Required `name` and `description` fields are present.
- [ ] Existing project-local skills and registries remain intact.
- [ ] Upstream pin, license, and adaptations are documented.
- [ ] No optional Native plugin, runtime, permissions, or hooks are introduced.

### Checkpoint 2 — CI and compatibility

- [ ] Existing skill validator passes.
- [ ] Existing unit, lint, typecheck, security, migration, and build workflows remain green.
- [ ] Reviewer confirms no production code or architecture change.

### Checkpoint 3 — Controlled task comparison (required before broad adoption)

Run representative, comparable tasks both with the repository's baseline agent instructions and with Gravitas Core enabled. Use the same model/effort where feasible and record version, task, duration, token/cost if available, verification outputs, and changed files.

Representative tasks:
1. A localized defect with an existing regression test.
2. A multi-file change with shared-module callers.
3. A research/read-only task where the agent must not mutate files.
4. A task with an initially failing validator, testing recovery and whether the agent avoids exact retries.
5. A task where the evidence is incomplete, testing whether the final report clearly says what remains unverified.

Measure: acceptance-criterion coverage, test/verification pass rate, unintended file changes, unsupported completion claims, recovery success, elapsed time, and token/cost overhead where observable. Keep raw notes and do not infer causal improvement from one run.

## Acceptance criteria

A pilot can be recommended for wider use only if:
- baseline and Gravitas runs are documented rather than estimated;
- the same acceptance rubric is used for both;
- there is no increase in unsupported completion claims or out-of-scope edits;
- project validators are run after the final relevant mutation;
- measured quality gains are weighed against extra time/cost and instruction overhead;
- results and limitations are reviewed by a human.

No performance advantage is claimed in this change. Passing repository tests validates compatibility of the added files, not model-level effectiveness.

## Safety and operational boundary

Core is not a sandbox. Host permissions, repository review, CI, secret handling, and human approval remain authoritative. Do not commit runtime state (including any `.gravitas/` state directory) or credentials. Never claim tests/builds passed unless the corresponding CI or local output is available.

## Rollback

Remove the `gravitas` skill directory, its registry row, the additions to the skills README, and this document. No app/runtime state should need rollback because this pilot does not install or execute a runtime.
