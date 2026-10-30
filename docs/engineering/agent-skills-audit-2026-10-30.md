---
title: Agent Skills Audit — Unregistered Engineering Skills
status: findings
owner: engineering
last_updated: 2026-10-30
---

# Agent Skills Audit — 2026-10-30

## Status and scope

**Audit and reconciliation complete.** Sections 1–6 record the audit as found, before any change. Section 8 records what was subsequently implemented.

This audit answers one question: *where do `issue-to-completion`, `adversarial-verification`, `publication-safety`, and `release-readiness` actually live, and what must be reconciled before they are registered on `main`?*

Scope inspected: every local and remote branch reachable in this clone (240+ refs), the `.agents/` tree on each, `scripts/validate-skills.py`, `.github/workflows/ci.yml`, and the repository code paths that the skills reference.

Not performed: no test suite was run, no branch was merged, no worktree was created, and the uncommitted changes on the current branch (`app/story/[slug]/page.tsx`, `stories/earth-prize-2026-plas-stick-indian-teens/`, `tests/story/story-hero-ssr.test.tsx`) were left untouched.

**Baseline caveat:** the local `main` ref is 29 commits behind `origin/main`. All counts below are taken against `origin/main` = `885c9ad4`, not the stale local branch.

## Executive finding

The four skills **do exist**, and a **fifth** (`evidence-first-completion`) exists with them. None have ever been merged.

They exist in **two independent, divergent copies** — a detailed version and a concise rewrite — and the later copy was never derived from the earlier one. Neither copy is currently accurate enough to register as-is: both carry references that do not resolve on `origin/main`, and the detailed copy names a database function that has never existed in any SQL file.

Three of the branches whose names suggest they hold this work (`candidate/publication-safety-reconciled`, `candidate/release-readiness-integrated`, `chore/agents-skills-quality`) contain **none** of the five skills. Anyone searching by branch name will be misled.

## 1. Current registry state

`origin/main` has **17 skills**, all registered in `.agents/skills.md`:

| Group | Count | Status in registry |
|---|---:|---|
| `gravitas` | 1 | pilot |
| `instagram-*` (editorial) | 10 | draft |
| `ponytail*` (lean engineering) | 6 | active |
| **Total** | **17** | |

`.agents/skills/README.md` documents the same three groups and does not mention the five unregistered skills. `AGENTS.md` on `origin/main` has sections 1–7 and no section referencing these skills.

## 2. Where the five skills actually live

| Skill | Detailed copy | Concise copy |
|---|---|---|
| `issue-to-completion` | `1c8b6d86` (107 lines) | `78b15bf9` (23 lines) |
| `adversarial-verification` | `1c8b6d86` (87) | `78b15bf9` (21) |
| `publication-safety` | `1c8b6d86` (101) | `78b15bf9` (21) |
| `release-readiness` | `1c8b6d86` (116) | `78b15bf9` (21) |
| `evidence-first-completion` | `1c8b6d86` (100) | `78b15bf9` (29) |

**Detailed copy (`1c8b6d86`, 2026-10-20)** — `feat(agents): establish autonomous engineering system and evidence-first completion checkpoint`
Reachable on: `chore/agent-system-checkpoint`, `chore/agent-system-adversarial-verification` (tip `9a40e84e`), both local and `origin`. Ships 1,482 lines total: the five skills, three specialist agent definitions (`codebase-researcher`, `security-reviewer`, `verification-specialist`), `.agents/agents.md` and `.agents/rules/thebreakdown.md` updates, five registry rows, `AGENTS.md` section 8 (the "autonomous engineering collaborator contract"), `docs/agent-operating-system/` (ACTIVE_STATE, DECISIONS, TASK_LEDGER, README), and two test files.

**Concise copy (`78b15bf9`, 2026-10-21)** — `fix(security): close server-action actor boundary and restore required skills`
Reachable on: `reconcile/acg2-btb-001` plus six `origin/feat/acg2-btb-001-*` and `origin/feat/btb-001-*` branches. Ships the five skills plus `docs/agent-operating-system/` and thirteen lines of `AGENTS.md`. It does **not** carry the specialist agent definitions or section 8.

`1c8b6d86` is **not** an ancestor of `78b15bf9`. The concise copy is not an edit of the detailed copy; it is a separate, independently written set.

The registry (`1c8b6d86:.agents/skills.md`) marks all five `active`. No branch has ever merged them into `main`.

## 3. Misleading branches

| Branch | Skills present | Contains its namesake skill? |
|---|---|---|
| `candidate/publication-safety-reconciled` | 11 (gravitas + 10 instagram) | **No** — reachable, 105 commits behind `origin/main` |
| `candidate/release-readiness-integrated` | 17 (main's exact set) | **No** — 0 commits ahead of `origin/main` at time of audit |
| `chore/agents-skills-quality` | 17 (main's exact set) | **No** — quality pass over the existing 17 only; 9 ahead / 26 behind |
| `chore/autonomous-newsroom-hardening` | 17 | **No** — 12 ahead / 26 behind |

`candidate/*` names were chosen for the *publication-safety and release-readiness work streams*, not for the skills. `chore/agents-skills-quality` is a substantive but separate change (2,192 insertions across all 17 skills, plus `scripts/check-agents.ts` and its CI wiring) and should be reviewed on its own merits, not folded into this reconciliation.

## 4. Accuracy defects found in the skill text

These were verified against `origin/main`. Every one of them would misdirect an agent.

| # | Defect | Where | Evidence |
|---|---|---|---|
| 1 | **`fn_publish_story_fenced` does not exist** | detailed `publication-safety`; also `AGENTS.md`, `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-help`, `ponytail/UPSTREAM.md`, `P0_2_INDEPENDENT_ACCEPTANCE_REPORT.md` on `origin/main` | No occurrence in any `.sql`, `.ts`, or `.tsx` on `origin/main`. The real function is `fn_publish_story_with_audit(UUID)` in `supabase/migrations/030_publisher_worker_rpc.sql`. An atomic fence function of that name existed only in `033_atomic_scheduled_publish_fence.sql`, which is **not on `origin/main`**. |
| 2 | **`scripts/audit/verify-publication-safety.ts` does not exist** | detailed `publication-safety` | Path never existed in any branch's history. |
| 3 | **Migration range is stale** | detailed `publication-safety` ("migrations `001` through `032` are immutable") | `origin/main` has `001`–`033`; `033_gold_standard_review_integrity.sql` post-dates the claim. |
| 4 | **Broken relative links** | detailed `release-readiness` → `../../../docs/agent-operating-system/ACTIVE_STATE.md`; detailed `issue-to-completion` step 1 | `docs/agent-operating-system/` does not exist on `origin/main`; it exists only on the unmerged branches, so the links resolve only after that directory is also merged. |

Defect 1 is the most serious. It is pre-existing on `origin/main` and would be *propagated* by a verbatim copy of the detailed `publication-safety` skill.

Related, but outside a skills change: `fn_publish_story_with_audit` on `origin/main` updates `public.stories` and then inserts into `publication_gate_log` **without a transaction or lease**. The atomic-fence hardening lives on `candidate/publication-safety-reconciled` and `candidate/scheduled-publish-clean-history-2026-10-18` (`fc246b96`), not on `main`. A skill that asserts fencing is already enforced would be accurate only after that branch merges.

## 5. Overlap with the existing skills

The five skills are not additive in the way the registry implies. Measured against `origin/main`:

| New skill | Substantially covered by | Assessment |
|---|---|---|
| `evidence-first-completion` | `gravitas` invariants 3 and 6; `gravitas/references/verification.md` (evidence-by-claim table, "model self-critique is not verification", no partial PASS) | ~60% duplicate. The genuinely new content is the five-state taxonomy and the false-green/skip detection checklist. |
| `adversarial-verification` | `gravitas/resources/adversarial-critique.md` (7 attack vectors); `gravitas/references/verification.md` | ~70% duplicate. New content is Next.js `'use server'` export reachability and caller-supplied-actor attacks. |
| `issue-to-completion` | `gravitas` (6 invariants + decision records); `ponytail` (smallest complete change) | Lifecycle summary of both. Adds no new procedure. |
| `release-readiness` | `ponytail-review` (must/should/nice-to-have); `AGENTS.md` §5–6 (commands, definition of done) | Adds the release gate matrix and the PASS/FAIL/SKIPPED/BLOCKED/NOT RUN taxonomy. Repo-specific and useful. |
| `publication-safety` | `instagram-quality-auditor` (editorial risk), `AGENTS.md` §7 bullet 2 | Adds technical publication invariants (RLS, embargo, atomicity, outbox). Genuinely distinct from the editorial layer. |

Two conclusions follow:

1. `issue-to-completion` and `adversarial-verification` largely restate `gravitas`, which is still `pilot` and not approved for broad rollout. Registering both as `active` would create two competing sources of engineering procedure.
2. `publication-safety` and `release-readiness` are the two skills that carry information found nowhere else. They are the ones worth landing.

On the editorial side: the `instagram-*` skills operate on *content* (claims, sources, captions, visual integrity) and hand off to a human. `publication-safety` operates on *the publication machinery*. They do not conflict. One boundary needs stating explicitly: `instagram-quality-auditor` returns "READY FOR HUMAN APPROVAL", never approval to publish; `publication-safety` must not be read as granting that approval either.

## 6. Test and wiring gaps

The `chore/agent-system-adversarial-verification` branch adds three test files but **wires none of them into `package.json`, `npm run test`, or CI**:

- `tests/autonomous-system-smoke.test.ts` — asserts the five skills, three agent definitions, `AGENTS.md` §8, and the working-memory files exist.
- `tests/evidence-first-completion-failure-modes.test.ts` — 308 lines of negative tests for the completion gate.
- `tests/publication-safety-p1.test.ts` — modified on the branch.

So the skills' own regression coverage is currently unrun. Adding files without a script or workflow step means the audit would regress silently.

The smoke test also asserts `content.startsWith('---\n')` on `SKILL.md`. That passes in CI (Linux, LF) but will fail on a Windows checkout with `core.autocrlf=true`, which is how this clone is configured. Worth knowing before it is wired in.

**Validator result** — `scripts/validate-skills.py` (the check wired into `.github/workflows/ci.yml:26`) was run against three extracted trees:

| Tree | Skill files | Result |
|---|---:|---|
| `origin/main` | 17 | PASS |
| detailed (`1c8b6d86`) | 22 | PASS |
| concise (`78b15bf9`) | 22 | PASS |

Structural validity is therefore not the discriminator between the two copies. Content accuracy is.

## 7. Recommendation

Do not copy either branch wholesale. Reconcile as follows.

**Adopt from the detailed copy (`1c8b6d86`), with corrections:**

1. `publication-safety` — keep the invariant structure and repo references, then fix defects 1–3: name `fn_publish_story_with_audit(UUID)`, delete the nonexistent `verify-publication-safety.ts` reference or replace it with a real command, and correct the migration range. State plainly that atomic fencing is **not** on `main` yet, so the skill describes the target invariant rather than current behavior.
2. `release-readiness` — keep the eight-gate matrix and five-status taxonomy. Replace the `docs/agent-operating-system/` link with a path that exists on `main`, or land that directory with the skill.
3. `evidence-first-completion` — keep the five-state taxonomy, the "attack the test" checklist, and the skip/early-return rules. Trim the material already covered by `gravitas/references/verification.md` and cross-reference it instead of restating it.

**Do not register as `active`:**

4. `issue-to-completion` and `adversarial-verification` duplicate `gravitas` and should stay out of the registry until `gravitas` either graduates from pilot or is retired. If they are kept, they should be `draft` and explicitly subordinate to `gravitas`.

**Reconcile the convergence points:**

5. Land the `fn_publish_story_fenced` → `fn_publish_story_with_audit` correction across all six `origin/main` files, not just the new skill. Otherwise the new skill and `AGENTS.md` disagree.
6. Update the registry, `.agents/skills/README.md`, and `AGENTS.md` §7 in the same change as the skill files, so the three never diverge again.
7. Wire the smoke test and failure-mode test into `npm`/CI in the same change, or do not add them.

**Do not do:**

8. Do not merge `chore/agents-skills-quality` as part of this work. It is a separate 2,192-line quality pass over the existing 17 and needs its own review.
9. Do not use `candidate/publication-safety-reconciled` or `candidate/release-readiness-integrated` as sources for skills. They contain none.

## 8. Decisions taken and outcome

Decisions confirmed by the repository owner on 2026-10-30:

1. **Source copy** — corrected merge. Neither branch copy is used verbatim.
2. **Registry scope** — three skills only: `publication-safety`, `release-readiness`, `evidence-first-completion`.
3. **"Expert journalism" reference** — the `.ai/agents/*` editorial role definitions, not the `instagram-*` skills.

Implemented in this working tree:

| Change | File |
|---|---|
| New skill (corrected merge) | `.agents/skills/publication-safety/SKILL.md` |
| New skill (corrected merge) | `.agents/skills/release-readiness/SKILL.md` |
| New skill (corrected merge, trimmed against gravitas) | `.agents/skills/evidence-first-completion/SKILL.md` |
| Three registry rows | `.agents/skills.md` |
| Skill section, precedence and boundaries | `.agents/skills/README.md` |
| New §8 with editorial boundaries; `fn_publish_story_fenced` corrected | `AGENTS.md` |
| `fn_publish_story_fenced` → `fn_publish_story_with_audit` | `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-help`, `ponytail/UPSTREAM.md` |

Corrections applied to the detailed copy before adoption:

- Defect 1 fixed: the skill now names `fn_publish_story_with_audit` and instructs the agent to *verify* whether an atomic fence is present rather than asserting one exists.
- Defect 2 fixed: the nonexistent `scripts/audit/verify-publication-safety.ts` reference is removed.
- Defect 3 fixed: the hard-coded `001`–`032` migration range is replaced with a rule that does not go stale.
- Defect 4 fixed: the `docs/agent-operating-system/` links are removed; `release-readiness` records its assessment in the task's existing report instead.
- Duplication trimmed: `evidence-first-completion` cross-references `gravitas/references/verification.md` for the evidence hierarchy instead of restating it.

Deviation from recommendation 7: **no new test files were added.** The checkpoint branch's `tests/autonomous-system-smoke.test.ts` asserts that all five skills, three specialist agents, and `docs/agent-operating-system/` exist — none of which this change introduces, so it would fail. The existing CI gate, `scripts/validate-skills.py`, already validates every `SKILL.md` in the directory and now covers 20 files (17 + 3), which is the check that keeps the registry structurally consistent. Adding a second, string-matching test would duplicate it.

`P0_2_INDEPENDENT_ACCEPTANCE_REPORT.md` still contains `fn_publish_story_fenced`. It is a point-in-time acceptance record and was deliberately left unmodified; rewriting historical evidence is not a correction.

Verification of this change:

| Check | Result |
|---|---|
| `python scripts/validate-skills.py` | PASS — 20 skill files |
| All repository paths cited in the three skills | verified present on `origin/main` |
| All npm scripts cited in `release-readiness` | verified present in `package.json` |
| Cross-references from `AGENTS.md` and `.agents/skills/README.md` | resolve |
| Test suite, typecheck, lint, build | **NOT RUN** — this change touches Markdown only |

## 9. The gravitas overlap, resolved

The pilot's own evaluation resolves it, and the answer is not the one the registry implied.

Evidence, taken from the audited results review on `docs/gravitas-raw-results-evidence` (commit `eac7ae5f`):

| Finding | Detail |
|---|---|
| No measurable treatment effect | 42/42 baseline vs 42/42 GRAVITAS across the four surviving pairs. Both conditions hit the rubric ceiling. |
| GRAVITAS was slower | +25s total (+7.46%), +8.82% median latency. |
| One task invalidated | T1's premise was false — the base validator already handled CRLF. T1 excluded. |
| One task downgraded | T4's fixture was disposable and uncommitted; identical setup unproven. |
| Institutional recommendation | **"Keep GRAVITAS Core optional."** Explicitly: "must not be mandated globally across the repository." |

So the overlap is not resolved by picking a winner between two peers. It is resolved by acknowledging that they do different jobs:

- **`evidence-first-completion` is mandatory.** It is the completion gate: proof, exact-SHA binding, honest classification of skipped and unrun checks. That is cheap, bounded, and directly targets a real failure mode (false-green completion).
- **`gravitas` is optional.** It adds planning structure and decision records, which the review judged valuable only for "ambiguous, multi-subsystem, or high-uncertainty tasks" — and which the study could not show improved outcomes.

Precedence now recorded in `.agents/skills/README.md`: `evidence-first-completion` governs completion claims; `gravitas` governs optional planning depth. The registry keeps `gravitas` at `pilot` with an explicit "optional; not mandated" note. `gravitas-core-pilot.md` no longer claims the evidence is unpublished.

This also settles `issue-to-completion` and `adversarial-verification`: they are unregistered because they restate an *optional* skill, which is a weaker justification for duplicating it, not a stronger one.

Documents were **not** rewritten to reflect the branch's conclusions. `gravitas-core-evaluation-results-review.md` on `main` still reads "provisional, pending raw artifacts" with six open audit issues. That is an audit record; superseding it is the reviewer's call, and the evidence branch should be merged or reviewed on its own.

## 10. Remaining follow-up

- Merge or formally review `docs/gravitas-raw-results-evidence` (`eac7ae5f`) so the evidence behind the precedent above sits on `main` rather than on a branch.
- `issue-to-completion` and `adversarial-verification` remain unregistered on `chore/agent-system-checkpoint` and `reconcile/acg2-btb-001`. Their content is covered by an optional skill; archiving those copies is a separate decision.
- The atomic publication fence (`033_atomic_scheduled_publish_fence.sql`, commit `fc246b96`) is still only on `candidate/publication-safety-reconciled` and `candidate/scheduled-publish-clean-history-2026-10-18`. Main's publish RPC performs no transaction. That is a code change, not a skills change, and is not addressed here.
- `chore/agents-skills-quality` (2,192 insertions across the existing 17 skills, plus `scripts/check-agents.ts` and CI wiring) is unreviewed and unmerged.


## Evidence appendix

```bash
# Baseline
git rev-parse origin/main                          # 885c9ad4
git rev-list --count main..origin/main             # 29 (local main is stale)

# Registry state
git ls-tree -r --name-only origin/main -- .agents/skills | grep '/SKILL.md$' | wc -l   # 17

# The five skills, by ref
git ls-tree -r --name-only 1c8b6d86 -- .agents/skills    # 22 SKILL.md
git ls-tree -r --name-only 78b15bf9 -- .agents/skills    # 22 SKILL.md
git merge-base --is-ancestor 1c8b6d86 78b15bf9           # exit 1 (divergent copies)
git branch -a --contains 1c8b6d86
git branch -a --contains 78b15bf9

# Misleading branches
git ls-tree -r --name-only candidate/publication-safety-reconciled -- .agents/skills
git ls-tree -r --name-only candidate/release-readiness-integrated -- .agents/skills

# Defect 1: the function does not exist
git grep -n fn_publish_story_fenced origin/main -- '*.sql' '*.ts' '*.tsx'   # no matches
git grep -n 'CREATE OR REPLACE FUNCTION fn_' origin/main -- supabase/migrations/030_publisher_worker_rpc.sql
git log --all --oneline -S fn_publish_story_fenced -- '*.sql'

# Defect 2: the audit script does not exist
git log --all --oneline -- scripts/audit/verify-publication-safety.ts      # empty

# Defect 3: migration range
git ls-tree -r --name-only origin/main -- supabase/migrations | grep '\.sql$'

# Defect 4: broken link target
git cat-file -e origin/main:docs/agent-operating-system/ACTIVE_STATE.md    # exit 128

# Validator (CI gate: .github/workflows/ci.yml:26)
git archive --format=tar origin/main .agents/skills scripts/validate-skills.py
python scripts/validate-skills.py    # PASS, 17 / 22 / 22 files respectively

# No CI wiring for the branch's new tests
git diff --name-only 2b4eed0d chore/agent-system-adversarial-verification -- package.json .github   # empty
```
