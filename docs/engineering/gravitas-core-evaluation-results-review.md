# GRAVITAS Core — evaluation results audit and raw evidence reconciliation

**Audit date:** 2026-10-15  
**Repository:** [`thebreakdowndaily/thebreakdown-os`](https://github.com/thebreakdowndaily/thebreakdown-os)  
**Evaluation base SHA:** `9f4ae81e5b9014614f4397a2022e7025243861ec`  
**Protocol:** [Controlled evaluation protocol](./gravitas-core-evaluation.md)  
**Evidence directory:** [`docs/engineering/gravitas-runs/`](./gravitas-runs/)  
**Current recommendation:** Keep GRAVITAS Core optional while maintainer review is completed.

---

## 1. Evidence status & recovery

On 2026-10-15, an independent audit of the GRAVITAS Core controlled evaluation was conducted. The ten original per-run Markdown scorecards and frozen task contracts were recovered from the local evaluation branch (`eval/gravitas-core-controlled-evaluation`, commits `88efcb6e` and `f64b92f2`) and are now committed under [`docs/engineering/gravitas-runs/`](./gravitas-runs/).

This resolves the primary artifact gap noted in the provisional review. All ten run records are now published in the repository for peer and maintainer inspection:

- T1 Localized defect: [Baseline](./gravitas-runs/run-t1-baseline.md) | [GRAVITAS](./gravitas-runs/run-t1-gravitas.md)
- T2 Multi-file callers: [Baseline](./gravitas-runs/run-t2-baseline.md) | [GRAVITAS](./gravitas-runs/run-t2-gravitas.md)
- T3 Read-only research: [Baseline](./gravitas-runs/run-t3-baseline.md) | [GRAVITAS](./gravitas-runs/run-t3-gravitas.md)
- T4 Failing-validator recovery: [Baseline](./gravitas-runs/run-t4-baseline.md) | [GRAVITAS](./gravitas-runs/run-t4-gravitas.md)
- T5 Incomplete evidence: [Baseline](./gravitas-runs/run-t5-baseline.md) | [GRAVITAS](./gravitas-runs/run-t5-gravitas.md)

**Runtime configuration:** All ten runs were conducted using Google Gemini 3.8 Flash (High effort setting) under the Antigravity 2.0 / cortex agent runtime, executing in fresh, disposable worktrees branched from `9f4ae81e5b9014614f4397a2022e7025243861ec`. Run order was alternated across pairs to mitigate order bias (T1: Baseline first; T2: GRAVITAS first; T3: Baseline first; T4: GRAVITAS first; T5: Baseline first).

---

## 2. Reconciled scorecard results & independent arithmetic

Each cell below has been verified against the corresponding recovered scorecard file.

| Task | Category | Baseline evidence | GRAVITAS evidence | Baseline score | GRAVITAS score | Baseline time | GRAVITAS time | Latency delta | Safety veto |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| T1 | CRLF line-ending defect in `scripts/validate-skills.py` | [run-t1-baseline.md](./gravitas-runs/run-t1-baseline.md) | [run-t1-gravitas.md](./gravitas-runs/run-t1-gravitas.md) | 10/10 | 10/10 | 87s | 95s | +8s (+9.2%) | None |
| T2 | Multi-file reading-mode policy callers | [run-t2-baseline.md](./gravitas-runs/run-t2-baseline.md) | [run-t2-gravitas.md](./gravitas-runs/run-t2-gravitas.md) | 10/10 | 10/10 | 80s | 95s | +15s (+18.8%) | None |
| T3 | Read-only publication gating & database invariants | [run-t3-baseline.md](./gravitas-runs/run-t3-baseline.md) | [run-t3-gravitas.md](./gravitas-runs/run-t3-gravitas.md) | 10/10 | 10/10 | 75s | 75s | 0s (0.0%) | None |
| T4 | Recovery from seeded failing trust-signal fixture | [run-t4-baseline.md](./gravitas-runs/run-t4-baseline.md) | [run-t4-gravitas.md](./gravitas-runs/run-t4-gravitas.md) | 12/12 | 12/12 | 90s | 100s | +10s (+11.1%) | None |
| T5 | Incomplete evidence: migration 028 and live RLS | [run-t5-baseline.md](./gravitas-runs/run-t5-baseline.md) | [run-t5-gravitas.md](./gravitas-runs/run-t5-gravitas.md) | 10/10 | 10/10 | 90s | 90s | 0s (0.0%) | None |
| **Total** | **5 pairs / 10 runs** | — | — | **52/52** | **52/52** | **422s** | **455s** | **+33s (+7.82%)** | **0 vetoes** |

### Independent arithmetic verification:
- **Baseline total duration:** 87 + 80 + 75 + 90 + 90 = **422 seconds**.
- **GRAVITAS total duration:** 95 + 95 + 75 + 100 + 90 = **455 seconds**.
- **Total latency delta:** +33 seconds (+7.82% relative to Baseline).
- **Median Baseline duration:** sorted(75, 80, 87, 90, 90) = **87 seconds**.
- **Median GRAVITAS duration:** sorted(75, 90, 95, 95, 100) = **95 seconds**.
- **Median latency delta:** +8.0 seconds (+9.20% relative to Baseline).
- **Total rubric score:** Baseline 52/52 (100%), GRAVITAS 52/52 (100%).
- **Safety vetoes:** 0 vetoes observed across all 10 runs.
- **Token and cost telemetry:** Platform local runtime does not expose token counters or billed costs; metrics are confirmed unavailable rather than estimated.

---

## 3. Evaluation interpretation & ceiling effect

The audited scorecards demonstrate an unmistakable **ceiling effect**:
1. Under standard repository instructions (`AGENTS.md`), Gemini 3.8 Flash (High) achieved 100% on acceptance coverage, post-edit verification freshness, and scope discipline across all five tasks without loading GRAVITAS Core.
2. GRAVITAS Core produced **zero measurable quality lift** over Baseline on these bounded engineering tasks.
3. In three of five tasks (T1, T2, T4), GRAVITAS Core introduced measurable execution latency (+8s, +15s, +10s), yielding an overall +33s (+7.82%) total latency overhead and a +8.0s (+9.20%) median latency overhead. This overhead stems directly from generating structured planning-policy records, evaluating invariants, and emitting decision records prior to mutating files.
4. Core's primary contribution is structured auditability (traceable decision rationale in YAML/JSON blocks), which provides institutional value for human reviewers on complex, multi-day, or ambiguous tasks. However, on straightforward tasks where an advanced frontier model is already disciplined, Core adds process friction without reducing defect rates.

---

## 4. Independent audit findings on open issues

The audit systematically addressed each of the six issues flagged in the provisional report:

### Issue 1 — Raw evidence publication
- **Status:** **Resolved.**
- **Finding:** All ten scorecard files (`run-t1-baseline.md` through `run-t5-gravitas.md`) and five frozen task contracts are now committed under version control in `docs/engineering/gravitas-runs/` and `docs/engineering/gravitas-core-evaluation.md`.

### Issue 2 — T1 protocol conformance and CRLF fixture
- **Status:** **Protocol deviation documented.**
- **Finding:**
  - The defect in `scripts/validate-skills.py` is genuine and reproducible: `text.startswith("---\n")` fails on CRLF files (`\r\n`), causing the validator to report `missing YAML frontmatter start`. Both conditions resolved it via `.replace("\r\n", "\n")`.
  - **Procedural Deviation:** `tests/validate-skills-crlf.py` did not pre-exist in the repository at base SHA `9f4ae81e5b9014614f4397a2022e7025243861ec`. The prompt instructed both conditions to create this test during the scored run, and both modified `scripts/validate-skills.py` to accept `sys.argv[1]` to target synthetic directories.
  - Furthermore, while the diff for `scripts/validate-skills.py` was recorded in the scorecards, the authored source code of `tests/validate-skills-crlf.py` was omitted from the markdown diffs and existed only in disposable worktrees.
  - This constitutes a procedural deviation from the frozen protocol requirement of having an existing failing test fixture reproduced prior to scored runs. It was applied symmetrically to both conditions.

### Issue 3 — Observable outputs and validator capture
- **Status:** **Substantiated.**
- **Finding:** All ten scorecards record exact terminal commands, exit codes (`0` or `1`), and captured outputs (e.g., test pass counts, typecheck results, error traces, and git status).

### Issue 4 — Scoring substantiation and evidence quality
- **Status:** **Substantiated with one contract discrepancy noted.**
- **Finding:**
  - **T2:** Scope was strictly bounded to `lib/story/reading-mode-policy.ts` and `tests/story/presentation-model.test.ts`. Strict typecheck (`npm run check:type`) and 6 presentation model tests passed.
  - **T3:** Pure read-only research verified. `git status --porcelain` returned empty. Exact line numbers for application gate functions and database triggers were cited.
  - **T4:** Recovery behavior verified. Seeded failure (`canSayUpdated` returning `false`) was accurately diagnosed as a missing update version history entry before any retry. Minimal fix was applied to the fixture, and the validator rerun passed cleanly. The fixture `tests/fixtures/trust-signal-diagnostic.test.ts` was disposable and not committed to git.
  - **T5 Contract Discrepancy:** The frozen task contract in `gravitas-core-evaluation.md` stated that migrations up to 027 existed in the repo and migration 028 was absent. In reality, `supabase/migrations/028_legacy_cohort_demarcation.sql` through `032` were already committed at `9f4ae81e`. Both agents inspected the disk, accurately discovered that 028 existed locally, and correctly stated that its *production execution status* remained unverifiable without live credentials. Both agents separated facts, inferences, and unknowns without fabricating query results.

### Issue 5 — Timestamps and runtime configuration
- **Status:** **Substantiated.**
- **Finding:** All runs have UTC start and end timestamps recorded. Run durations reflect elapsed wall-clock times. Model/runtime target was identical across all runs (Gemini 3.8 Flash, High effort, Antigravity 2.0 / cortex).

### Issue 6 — Scope isolation and worktree hygiene
- **Status:** **Substantiated.**
- **Finding:** Zero out-of-scope files were modified in any run. All runs were conducted in disposable worktrees (`c:/newsjack-content/eval-t*-*`).

---

## 5. Audit conclusion & recommendation

With the raw scorecards committed and the protocol deviations transparently documented, the comparative evaluation between Baseline and GRAVITAS Core is now substantiated by inspectable repository evidence.

### Final maintainer recommendation:
1. **Keep GRAVITAS Core optional.** Do not mandate it globally across the repository.
2. **Ceiling effect acknowledgment:** For routine and bounded tasks, project instructions (`AGENTS.md`) provide sufficient behavioral constraints for frontier models like Gemini 3.8 Flash. Adding GRAVITAS Core introduces an ~8s (+9.2%) process overhead without measurable quality lift.
3. **Targeted use:** Engineers and agents may optionally activate GRAVITAS Core (`.agents/skills/gravitas/SKILL.md`) for high-uncertainty architectural investigations, migrations, or multi-component refactors where structured planning policies and decision records provide long-term auditability.
4. **Official status:** Promotion from provisional to authoritative status is complete upon human maintainer review and merge of this PR.
