# GRAVITAS Core — evaluation results audit and raw evidence reconciliation

**Audit date:** 2026-10-15  
**Repository:** [`thebreakdowndaily/thebreakdown-os`](https://github.com/thebreakdowndaily/thebreakdown-os)  
**Evaluation base SHA:** `9f4ae81e5b9014614f4397a2022e7025243861ec`  
**PR #48 base SHA (`main`):** `2735f0ce1486df70783a54d6349942730ce05f42`  
**Current PR head commit SHA:** `dc2cb6bcd54c8775f8267bfa0515f453df274a31`  
**Protocol:** [Controlled evaluation protocol](./gravitas-core-evaluation.md)  
**Evidence directory:** [`docs/engineering/gravitas-runs/`](./gravitas-runs/)  
**Current recommendation:** Keep GRAVITAS Core optional while maintainer review is completed.

---

## 1. Exact repository truth & PR status

This document provides the independent audit and empirical re-testing findings for the GRAVITAS Core vs Baseline controlled evaluation.

### Repository status
- **Pull Request:** [PR #48](https://github.com/thebreakdowndaily/thebreakdown-os/pull/48) (`docs(gravitas): publish raw evaluation scorecards and reconcile results audit`).
- **PR Status:** Draft (unmerged).
- **Target Branch:** `main` (base SHA `2735f0ce1486df70783a54d6349942730ce05f42`).
- **Head Branch:** `docs/gravitas-raw-results-evidence` (commit `dc2cb6bcd54c8775f8267bfa0515f453df274a31`).
- **CI State:** All GitHub Actions workflows (`Validate & Test`, `Continuous Integration & Release Gates`, `Audit Framework Verification`, `Security Scans`, `Vercel Preview Deploy`) pass cleanly on the published head.
- **Important Epistemic Distinction:** Passing CI proves repository compatibility, dependency hygiene, and documentation link integrity. It does **not** prove that the underlying experimental tasks, operator scorecards, or reported treatment effects are scientifically valid.

All ten original Markdown scorecard records and five frozen task contracts have been published under [`docs/engineering/gravitas-runs/`](./gravitas-runs/) for historical transparency. Each scorecard now carries an explicit audit qualification banner distinguishing operator-reported claims from independently verified facts.

---

## 2. Independent empirical re-testing of Task T1

The T1 task contract claimed that `scripts/validate-skills.py` contained a frontmatter parsing defect causing skill files with CRLF (`\r\n`) line endings to fail with `missing YAML frontmatter start`.

### Empirical verification against unmodified base commit (`9f4ae81e`)
To independently verify this claim, a clean temporary worktree was created at the exact base commit `9f4ae81e5b9014614f4397a2022e7025243861ec`. The base validator was tested without any modifications:

1. **Unmodified Base Test (Existing Skills):**
   - Command: `python scripts/validate-skills.py`
   - Exit code: `0`
   - Output: `Checked 11 skill file(s). PASS: frontmatter and directory-name checks.`
2. **Synthetic CRLF Skill Injection:**
   - A valid synthetic skill `.agents/skills/synthetic-crlf-test/SKILL.md` was authored with byte-verified CRLF (`\r\n`) line endings (8 occurrences of `b'\r\n'`, 0 occurrences of solitary `b'\n'`).
   - The synthetic skill satisfied all structural criteria (valid frontmatter delimiters, matching directory name, description, and body > 250 characters).
3. **Execution of Unmodified Base Validator on CRLF File:**
   - Command: `python scripts/validate-skills.py`
   - Exit code: `0`
   - Output:
     ```
     Checked 12 skill file(s).
     PASS: frontmatter and directory-name checks.
     ```

### Technical root-cause analysis
In Python 3, `pathlib.Path.read_text(encoding="utf-8")` opens files in text mode using Python's universal newline translation (`newline=None`). Under this default:
- All line-ending conventions (`\r\n`, `\r`, `\n`) are automatically converted to `\n` upon reading into memory.
- When `Path.read_text()` reads a CRLF file, the returned string contains only `\n` newlines.
- Consequently, `text.startswith("---\n")` evaluates to `True` for CRLF files, and `text.find("\n---\n", 4)` succeeds.
- The claim that CRLF line endings produced `missing YAML frontmatter start` was factually erroneous.
- The modification added by both agents during T1 (`.replace("\r\n", "\n")`) was an entirely redundant no-op.

### Missing test fixture provenance
`tests/validate-skills-crlf.py` did not pre-exist in the repository before the evaluation. Authoring it was instructed in the task prompt during the scored run. Neither condition's scorecard captured the source code of `tests/validate-skills-crlf.py` in its diff block, and no copy survives in git history.

### T1 Decision Rule Conclusion
Because the unmodified base validator passes the CRLF case with exit code `0`, **Task T1 is classified as INVALID / UNSUBSTANTIATED.** Its operator-reported 10/10 score cannot be retained as evidence of a successful regression fix and is excluded from all validated evaluation aggregates.

---

## 3. Audit of paired-run comparability (Tasks T2–T5)

### T4 fixture provenance (Downgraded status)
- In Task T4 (failing-validator recovery), both scorecards report that `npx tsx tests/fixtures/trust-signal-diagnostic.test.ts` failed initially with `canSayUpdated(baseStory)` asserting `false !== true`, and that adding an update entry to `versionHistory` resolved the failure.
- However, the test fixture `tests/fixtures/trust-signal-diagnostic.test.ts` was created as a disposable file and was never committed to version control.
- No cryptographic hash or preserved fixture source survives in git history.
- Narrative descriptions alone cannot establish that Baseline and GRAVITAS received byte-identical initial fixtures.
- **Evidentiary status:** T4 is **DOWNGRADED** to operator-reported / unconfirmed fixture identity.

### T5 task contract discrepancy
- The frozen task contract for T5 stated: *"Accurately identifies repository-present migrations (up to 027) and notes that migration 028 does not exist in the repository."*
- In reality, migrations `028_legacy_cohort_demarcation.sql` through `032_hero_image_accessibility.sql` were already committed at base commit `9f4ae81e`.
- Both agents properly inspected the filesystem, discovered `028` locally, and accurately concluded that its execution status on the remote production database remained unverifiable due to lack of live credentials.
- **Evidentiary status:** The task contract's factual assumption was incorrect, but both agents exhibited appropriate evidence discipline and honest uncertainty.

### Status of Tasks T2 & T3
- **T2 (Multi-file callers):** Bounded to `lib/story/reading-mode-policy.ts` and `tests/story/presentation-model.test.ts`. Parity on strict typecheck (`npm run check:type`) and test pass count. GRAVITAS ran first (95s), Baseline second (80s).
- **T3 (Read-only research):** Pure read-only research verified (`git status --porcelain` empty). Traced gate functions and DB triggers with exact line references. Both conditions took 75s.

---

## 4. Reconciled results ledger & mechanical arithmetic

The table below summarizes the audited validity status for each paired task:

| Task | Category | Baseline score | GRAVITAS score | Baseline time | GRAVITAS time | Latency delta | Audit validity status |
|---|---|:---:|:---:|:---:|:---:|:---:|---|
| T1 | CRLF line-ending regression | [Invalid] | [Invalid] | 87s | 95s | +8s (+9.2%) | **INVALID / UNSUBSTANTIATED:** Defect non-existent on base commit; excluded from validated totals |
| T2 | Multi-file policy callers | 10/10 | 10/10 | 80s | 95s | +15s (+18.8%) | **PROVISIONAL / REPORTED PARITY:** Scope bounded; strict typecheck verified; GRAVITAS ran first |
| T3 | Read-only publication gating | 10/10 | 10/10 | 75s | 75s | 0s (0.0%) | **PROVISIONAL / REPORTED PARITY:** Pure read-only verified (`git status` empty); lines cited |
| T4 | Seeded validator recovery | 12/12 | 12/12 | 90s | 100s | +10s (+11.1%) | **DOWNGRADED:** Fixture disposable and uncommitted; byte-identical setup unconfirmed |
| T5 | Incomplete evidence & RLS | 10/10 | 10/10 | 90s | 90s | 0s (0.0%) | **PROVISIONAL / CONTRACT DISCREPANCY:** Contract migration assumption incorrect; production gap honest |

### Recalculated arithmetic (T2–T5 provisional sample, T1 excluded)

Excluding the invalid T1 task yields the following descriptive figures for the remaining 4 pairs (8 runs):

- **Baseline total score:** $10 + 10 + 12 + 10 = \mathbf{42 / 42\text{ points}}$ ($100\%$).
- **GRAVITAS total score:** $10 + 10 + 12 + 10 = \mathbf{42 / 42\text{ points}}$ ($100\%$).
- **Baseline total duration:** $80 + 75 + 90 + 90 = \mathbf{335\text{ seconds}}$.
- **GRAVITAS total duration:** $95 + 75 + 100 + 90 = \mathbf{360\text{ seconds}}$.
- **Total latency delta:** $\mathbf{+25\text{ seconds}}$ ($+7.46\%$ overhead for GRAVITAS Core relative to Baseline).
- **Baseline median duration:** $\text{sorted}(75, 80, 90, 90) = (80 + 90) / 2 = \mathbf{85.0\text{ seconds}}$.
- **GRAVITAS median duration:** $\text{sorted}(75, 90, 95, 100) = (90 + 95) / 2 = \mathbf{92.5\text{ seconds}}$.
- **Median latency delta:** $\mathbf{+7.5\text{ seconds}}$ ($+8.82\%$ overhead for GRAVITAS Core relative to Baseline).
- **Critical safety vetoes:** Baseline: 0 ; GRAVITAS: 0.
- **Scope violations:** Baseline: 0 ; GRAVITAS: 0.
- **Token and cost telemetry:** Platform local runtime does not expose token counters or billed costs; metrics are confirmed unavailable.

> [!IMPORTANT]
> **Descriptive Arithmetic Notice:** These figures represent mechanical arithmetic of operator-reported scorecards. They do **not** constitute an independently validated treatment effect, because T4 fixture identity is unproven, the remaining valid sample size is small ($N=3$ pairs), and Baseline achieves ceiling scores under standard instructions.

---

## 5. Evidentiary conclusions & recommendations

1. **No Valid Quantitative Treatment Effect:** The surviving evidence from this study cannot support a statistically or scientifically valid quantitative conclusion regarding GRAVITAS Core's effectiveness across engineering tasks.
2. **Ceiling Effect on Frontier Models:** For disciplined frontier models such as Google Gemini 3.8 Flash (High effort), standard repository instructions ([`AGENTS.md`](../../AGENTS.md)) provide sufficient guardrails to achieve ceiling scores on straightforward bounded tasks. Under these conditions, GRAVITAS Core adds process latency (+7.46% total, +8.82% median on T2–T5) without measurable defect reduction.
3. **Follow-Up Study Required:** If the engineering team desires to establish statistically sound comparative claims, a follow-up evaluation must be conducted using:
   - Pre-existing, immutable test fixtures committed to version control with SHA-256 hashes;
   - Verified real-world defects reproduced prior to contract freezing;
   - Multi-model evaluation across model tiers;
   - Automated token and cost telemetry logging.
4. **Institutional Recommendation:** **Keep GRAVITAS Core optional.** Core provides valuable structured auditability (traceable decision records and planning policy declarations) for engineers tackling ambiguous, multi-subsystem, or high-uncertainty tasks. However, it should remain an optional capability and must not be mandated globally across the repository.
