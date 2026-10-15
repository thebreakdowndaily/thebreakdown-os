# GRAVITAS Core pilot — The Breakdown OS

**Status:** Merged on 2026-10-15. Structural integration and repository CI compatibility checks passed; controlled trials are **reported complete**, with raw evidence publication and independent audit still pending.  \
**Pilot PR:** [#24](https://github.com/thebreakdowndaily/thebreakdown-os/pull/24)  \
**Upstream:** [`udaysharmadev/Gravitas`](https://github.com/udaysharmadev/Gravitas)  \
**Pinned source commit:** [`5fb2fcb8011e1d20db61ce385ae6a7e47deb2be5`](https://github.com/udaysharmadev/Gravitas/commit/5fb2fcb8011e1d20db61ce385ae6a7e47deb2be5)  \
**License:** MIT; see the accompanying upstream license text and attribution record.

## Goal

Evaluate whether GRAVITAS Core improves the consistency of Gemini / Antigravity coding workflows for The Breakdown OS without changing product architecture, runtime dependencies, deployment configuration, or production behavior.

## Scope of this pilot

- Vendor the portable Agent Skill and its Markdown references, resource guides, and agent-role prompts under `.agents/skills/gravitas/`.
- Keep upstream source pinned so the snapshot is traceable and updates are intentional.
- Adapt statements that would otherwise overstate Core-mode enforcement. In Core mode, policy is expressed as instructions; it does not mechanically intercept tools or gate completion.
- Retain the upstream MIT license and note local adaptations.
- Do not install the optional GRAVITAS Native plugin, add hooks, change host permissions, install a CLI/runtime, run install scripts, or execute upstream verification scripts.
- Do not modify application code, dependencies, database, migrations, environment variables, hosting, or production. The only CI change is a step to run the existing, dependency-free agent-skill validator.

## Why Core-only first

Core has the lowest integration surface and can be reviewed as project-local guidance. Native is a separate Antigravity plugin with hook-based checks. It is intentionally out of scope until Core demonstrates useful improvement and Native receives a separate security and compatibility review.

## Evaluation result

A preliminary evaluator summary reports equal ceiling scores for Baseline and GRAVITAS Core, with elapsed-time overhead for GRAVITAS. The details and outstanding evidence gaps are recorded in [the evaluation results review](./gravitas-core-evaluation-results-review.md). This is not a verified effectiveness claim until the raw run artifacts and scoring evidence are committed and reviewed.

## Validation checkpoints

### Checkpoint 1 — Structural integration

- [x] The skill's frontmatter `name` matches its directory name (`gravitas`).
- [x] Required `name` and `description` fields are present.
- [x] Existing project-local skills and registries remain intact.
- [x] Upstream pin, license, and adaptations are documented.
- [x] No optional Native plugin, runtime, permissions, or hooks are introduced.

### Checkpoint 2 — CI and compatibility

- [x] CI runs `python3 scripts/validate-skills.py` and passes.
- [x] Repository CI recorded passing results for clean dependency installation, strict typecheck, lint, security regression, database/migration safety, unit/domain tests, accessibility, and production build.
- [x] The merged change is limited to the GRAVITAS skill/docs/registry and one existing CI validator step; no application code, package dependencies, database, or hosting configuration were changed.

Evidence checked on 2026-10-15:
- [PR #24 CI run](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/38693696220): all listed gates passed, including Validate Agent Skills.
- [PR #24 production infrastructure workflow](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/38693696098): CI validation job passed; staging and production health jobs were skipped. This is **not** evidence of a deployment or production-health check.
- [PR #24 audit workflow](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/38693696152): verification job passed.

### Checkpoint 3 — Controlled task comparison (required before broad adoption)

The protocol and scorecard live in [`gravitas-core-evaluation.md`](./gravitas-core-evaluation.md). The paired agent trials have **not** yet been recorded. Repository CI proves integration compatibility; it does not prove model-level effectiveness.

Run representative, comparable tasks both with the repository's baseline agent instructions and with GRAVITAS Core enabled. Use the same model/effort where feasible and record model/version, task, duration, token/cost if available, verification outputs, and changed files.

Representative tasks:
1. A localized defect with an existing regression test.
2. A multi-file change with shared-module callers.
3. A research/read-only task where the agent must not mutate files.
4. A task with an initially failing validator, testing recovery and whether the agent avoids exact retries.
5. A task where the evidence is incomplete, testing whether the final report clearly says what remains unverified.

Measure: acceptance-criterion coverage, test/verification pass rate, unintended file changes, unsupported completion claims, recovery success, elapsed time, and token/cost overhead where observable. Keep raw notes and do not infer causal improvement from one run.

## Acceptance criteria

A pilot can be recommended for wider use only if:
- baseline and GRAVITAS runs are documented rather than estimated;
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
