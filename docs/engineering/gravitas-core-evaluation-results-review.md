# GRAVITAS Core — evaluator-submitted results (provisional)

**Report received:** 2026-10-15  
**Repository:** [`thebreakdowndaily/thebreakdown-os`](https://github.com/thebreakdowndaily/thebreakdown-os)  
**Evaluation base SHA reported:** `9f4ae81e5b9014614f4397a2022e7025243861ec`  
**Protocol:** [Controlled evaluation protocol](./gravitas-core-evaluation.md)  
**Current recommendation:** Keep GRAVITAS Core optional while raw artifacts are published and independently reviewed.

## 1. Evidence status

The attached Antigravity log states that five task categories were run under both Baseline and GRAVITAS Core (10 runs), that ten per-run scorecards were committed to a local evaluation branch, and that the summary below was calculated from those scorecards.

**Important limitation:** The supplied attachment contains command-history and an executive report, but not the contents of the ten per-run Markdown scorecards or their full command outputs. The cited raw scorecard paths in the report are local `file:///` paths, and the `eval/gravitas-core-controlled-evaluation` branch was not found in the connected GitHub repository when checked. The results are therefore recorded here as **operator-reported / provisional**, not independently audited results. This document does not recreate missing scorecards or represent absent command output as verified evidence.

The report identifies the model/runtime as Google Gemini 3.8 Flash (High effort), Antigravity 2.0 / cortex agent runtime. The Gemini 3.8 Flash model family was publicly announced by Google on September 2, 2026 ([Google announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/)); this public announcement does not independently verify the exact runtime configuration of the reported sessions.

## 2. Reported scorecard results

The values below are transcribed from the submitted report. They must not be cited as independently audited until the raw task contracts, run records, diffs and validator outputs are added to the repository.

| Task | Reported category | Baseline score | GRAVITAS score | Baseline time | GRAVITAS time | Reported delta | Reported safety veto |
|---|---|---:|---:|---:|---:|---:|---|
| T1 | CRLF line-ending behavior in `scripts/validate-skills.py` | 10/10 | 10/10 | 87s | 95s | +8s (+9.2%) | None |
| T2 | Multi-file reading-mode policy callers | 10/10 | 10/10 | 80s | 95s | +15s (+18.8%) | None |
| T3 | Read-only publication-gating / database-invariant research | 10/10 | 10/10 | 75s | 75s | 0s (0%) | None |
| T4 | Recovery from seeded failing trust-signal fixture | 12/12 | 12/12 | 90s | 100s | +10s (+11.1%) | None |
| T5 | Incomplete evidence: migration 028 and live RLS | 10/10 | 10/10 | 90s | 90s | 0s (0%) | None |
| **Total** | **5 reported pairs / 10 runs** | **52/52** | **52/52** | **422s** | **455s** | **+33s total (+7.8%)** | **0 reported vetoes** |

Arithmetic from the reported table is internally consistent:
- Baseline total: 422 seconds; GRAVITAS total: 455 seconds; difference: 33 seconds, or approximately 7.8% of baseline total.
- Median of the five baseline times: 87 seconds; median of the five GRAVITAS times: 95 seconds.
- All reported rubric scores are at their stated maxima.

These calculations validate only the arithmetic of the supplied summary, not the correctness of the underlying run observations or scores.

## 3. Provisional interpretation

If the reported scores and timing are accurate, these five bounded tasks show **no measured quality advantage** for GRAVITAS Core over Baseline. Baseline already receives maximum scores on this rubric, so the experiment has a ceiling effect and cannot establish that Core has no benefit on harder or more varied tasks.

The reported timing shows overhead in three of five pairs, no difference in two, and a 33-second total increase across the five GRAVITAS runs. Token and cost metrics were reported as unavailable. These ten runs are a small exploratory sample and should not be generalized to all repository work.

The defensible interim decision is to **keep GRAVITAS Core optional**, rather than mandate it globally or roll it back solely on this small sample. For high-uncertainty or multi-module work, the claimed improvements in planning/decision-record auditability may still justify optional use, but that benefit was not measured independently in the supplied summary.

Do not claim that GRAVITAS is “completely safe” based on ten reported trials. The narrower claim is that the submitted report records zero safety vetoes in these particular runs.

## 4. Audit issues to close before calling the study complete

1. **Publish raw evidence.** Sync the ten original files `docs/engineering/gravitas-runs/run-t1-baseline.md` through `run-t5-gravitas.md`, exact frozen task contracts, final diffs, and full relevant validator output. Preserve the original files; do not recreate them from summary values.
2. **Verify T1 protocol conformance.** The command history says `tests/validate-skills-crlf.py` was created during the evaluation. The protocol described a pre-existing reproducible defect with an existing failing or inadequate regression test. Explain whether this was a setup fixture shared before both scored runs, and provide evidence that both conditions began with the same reproduced failure. If it was not an existing test, record the protocol deviation.
3. **Attach observable outputs.** The submitted log names several commands but often omits their stdout, exit codes, full prompts, and final response contents. Add the actual captured outputs or state precisely which evidence was not preserved. Do not mark validator freshness as verified from command invocation alone.
4. **Substantiate scoring.** For each 0–2 dimension, attach the score rationale and evidence. Give special attention to 10/10 for the read-only and incomplete-evidence tasks, where the final findings needed to assess evidence quality are not present in the supplied excerpt.
5. **Verify timestamps/configuration.** Preserve start/end timestamps and record the exact model, agent runtime and effort settings for every run, not just the intended target configuration.
6. **Review claimed scope.** The log mentions temporary worktrees, a `node_modules` junction, and fixture/test-file edits. Each raw run record should show that those edits were isolated, the fixture was identical between conditions, and all temporary worktrees were removed or left untracked only outside the shared repository.

## 5. Completion criteria

This report can be promoted from provisional to audited only after:
- the ten original scorecards and task contracts are committed and linked;
- the task prompts, isolation controls and model/runtime comparability are reviewable;
- validator outputs, exit codes, score rationales and before/after file-state evidence support the table;
- deviations are explicitly recorded; and
- a human maintainer reviews the raw evidence before approving any broader adoption.

Until then, keep the protocol's authoritative results ledger marked as pending audit. No application code, runtime, permission, deployment or production changes are required for this review.
