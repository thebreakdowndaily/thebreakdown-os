---
name: release-readiness
description: >
  Reconciles an exact Git SHA against required CI, security, migration, accessibility and
  build gates, plus human approvals and rollback prerequisites. Use before promoting a
  candidate, cutting a release, opening a release PR, or reporting acceptance.
---

# Release Readiness

Reconcile five independent boundaries into one evidence-backed assessment:

```text
A green CI run != Staging health != Production safety != Editorial approval != Human review.
```

Use when preparing a release candidate, reporting acceptance, opening a release PR, or evaluating merge safety.

---

## 1. Five-status taxonomy

Classify every gate with exactly one of these. Never describe a non-PASS as a pass.

| Status | Definition | Effect |
|---|---|---|
| **PASS** | Command exited 0 and assertions ran against real data. | Gate satisfied. |
| **FAIL** | Non-zero exit or violated assertion. | Blocks release. |
| **BLOCKED** | Cannot proceed: missing access, external dependency, or prior failure. | Record the blocker. |
| **SKIPPED** | Intentionally bypassed for a documented reason. | Record why; never counts as PASS. |
| **NOT RUN** | Not executed in this session. | Cannot be claimed as verified. |

Stale results from an earlier commit are `NOT RUN` for the candidate under review, regardless of how green they were.

---

## 2. Gate matrix

Confirm each script exists in `package.json` before citing it. Adjust when a script is renamed.

```bash
npm run check:type      # types
npm run check:lint      # lint
npm run test:security   # auth, RLS, API surface, migration integrity
npm run test:migration  # migration chain and database enforcement
npm run test            # chained domain suites (see caveat below)
npm run test:forensic   # forensic root-cause suites
npm run test:a11y       # accessibility and contrast
npm run build           # production Next.js build
python scripts/validate-skills.py   # agent skill frontmatter and naming (CI gate)
```

**Chaining caveat:** the root `npm run test` script is a manually maintained list, not proof that every test in the repository ran. Treat it as one gate, not as full coverage. Note any relevant suite that is absent from it, such as `npx tsx tests/publication-safety-p1.test.ts`.

---

## 3. Reconciliation procedure

### Step 1 — Pin the candidate
```bash
git rev-parse HEAD
git branch --show-current
git status --short
```
Record the full 40-character SHA. If a PR is involved, confirm its head matches the SHA you are certifying. Confirm no later commit supersedes it.

### Step 2 — Align local and CI conditions
Compare against `.github/workflows/ci.yml`: Node version, lockfile install path (`npm ci`), and whether CI runs any gate this assessment omits. A local pass under different versions or a different dependency tree is not the same evidence.

### Step 3 — Check production safeguards
- No credentials or service-role keys committed.
- Migration history sequential and unmodified.
- Rollback path identified for any schema change.
- High-impact operations — applying migrations, merging, deploying, mutating production data — have explicit owner authorization, separate from any green check.

### Step 4 — Inspect scope
Review the full diff for unrelated changes, generated noise, secrets, compatibility breaks, and missing tests or docs. A correct change with unreviewed collateral is not release-ready.

### Step 5 — Record the assessment

```markdown
### Release Certification Assessment

- **Commit SHA:** [40-char SHA]
- **Branch:** [branch]
- **Timestamp:** [ISO 8601]

| Gate | Command | Status | Evidence |
|---|---|---|---|
| Types | `npm run check:type` | | |
| Lint | `npm run check:lint` | | |
| Security | `npm run test:security` | | |
| Migrations | `npm run test:migration` | | |
| Domain suites | `npm run test` | | |
| Forensic | `npm run test:forensic` | | |
| Accessibility | `npm run test:a11y` | | |
| Build | `npm run build` | | |
| Agent skills | `python scripts/validate-skills.py` | | |

- **Recommendation:** GO / NO-GO / BLOCKED
- **Open approvals:** [owner, editorial, independent review]
- **Residual risk:** [non-blocking warnings, unrun suites]
```

### Step 6 — Persist the outcome
Record the SHA, gate results, workflow links, failures and remediation, remaining approvals, and the single next action in the report the task already uses. Do not overwrite unrelated active work.

---

## 4. Boundaries

- Green CI grants no merge, deploy, migration, or publication authority.
- Independent review by a human is not satisfied by the implementing agent, another sub-agent in the same execution, or a self-authored report.
- Editorial readiness is not engineering readiness, and neither is release authorization.
