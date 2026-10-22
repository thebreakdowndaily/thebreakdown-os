# ACG-3 — Governance Hardening & PR-103 Merge Readiness Acceptance Report

**Mission ID:** ACG-3  
**Series Pilot:** BTB-001 — Before the Battle: Plassey, 1757  
**Repository:** `thebreakdowndaily/thebreakdown-os`  
**Target Pull Request:** [PR #103](https://github.com/thebreakdowndaily/thebreakdown-os/pull/103) (`feat/acg2-btb-001-canonical-publication`)  
**Verified Candidate Commit SHA:** `eb5b49e7cef81941e37983967e84313f65ee162d`  
**Reconciled & Superseded PRs:**
- PR #123 (`fix/story-quarantine-legacy-fallback-2026-10-22`): **CLOSED AS SUPERSEDED**
- PR #126 (`fix/publication-boundary-apis-2026-10-22`): **CLOSED AS SUPERSEDED**  
**Evaluation Date:** 2026-10-22  
**Operating Standard:** Engineering Agent Contract (`AGENTS.md`) & Evidence-First Completion Gate

---

## Executive Summary & Merge Readiness Decision

| Governance & Integration Gate | Verified State | Notes & Enforcing Mechanisms |
|---|---|---|
| **`main` Branch Protection** | **ACTIVE & ENFORCED** | Configured via GitHub API. Enforces PR requirement, 1 approving review, stale dismissal, strict status checks, no force pushes, no branch deletions. |
| **PR #123 & PR #126 Reconciliation** | **CLOSED (SUPERSEDED)** | All changes (quarantine, search, graph, explorer, static param filters) fully integrated into PR #103. Confirmed closed on GitHub. |
| **Candidate Code Integrity** | **PASS (100%)** | All 32 local unit suites pass; 1,444 security assertions pass; Next.js 15.5.27 compiles 1,140 pages. |
| **Remote CI Workflow Runs** | **PASS (5/5 Runs)** | CI Pipeline (#39811816906), Infrastructure (#39811816928), Security (#39811817609), Audit (#39811817194), CI Push (#39811808789). |
| **Independent Human Code Review** | **AWAITING REVIEW** | Inspection protocol posted to PR #103. `reviewDecision` is `REVIEW_REQUIRED`. |
| **Targeted BTB-001 Architecture Fitness** | **PASS** | 19 claims matched 1:1; 8/8 fitness checks pass across 1,918 source files; 0 cycles. |
| **Whole-Platform Architecture Unification** | **PROVISIONAL** | Dual memory/database models remain active in parts of platform pending database cutovers. |
| **Plassey Pilot Publication** | **BLOCKED (Gated)** | Story strictly maintained in `publicationStatus: 'draft'`. |
| **Production Mutations & Series Expansion** | **BLOCKED (Gated)** | Zero production DB migrations applied. Panipat/Talikota/Buxar deferred. |

**Current Merge Readiness Status:** **AWAITING AUTHORIZED HUMAN REVIEW APPROVAL**.  
Once an eligible independent human maintainer inspects the 7 checklist areas and approves PR #103 via the GitHub UI, the PR will be **READY FOR AUTHORIZED MERGE**.

---

## 1. Verified Active `main` Branch Protection Configuration

The `main` branch protection policy was applied via the GitHub REST API (`PUT /repos/thebreakdowndaily/thebreakdown-os/branches/main/protection`) and independently verified:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Continuous Integration & Release Gates",
      "1. Validate & Test (CI)",
      "Gitleaks — scan changed commits and periodically audit history",
      "OSV — block newly introduced dependency vulnerabilities / osv-scan",
      "verify"
    ]
  },
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false
  },
  "enforce_admins": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

### Protection Policy Invariants:
1. **Pull Request Required:** Direct commits or pushes to `main` are rejected. All changes must enter through a pull request.
2. **Independent Review Required:** Minimum of 1 approving review required before merge.
3. **Stale Review Dismissal:** Any subsequent commit pushed to a PR branch automatically dismisses prior approvals, forcing re-review of the delta.
4. **Strict Check Alignment:** Only active CI/test/security/audit checks that actually execute on pull requests are required. Skipped deployment-health jobs (`deploy-staging`, `deploy-production`, scheduled inventory) are explicitly excluded from the required check list.
5. **No Force Pushes / No Deletions:** Git history on `main` is protected against destructive operations (`allow_force_pushes: false`, `allow_deletions: false`).
6. **Maintainer Accessibility:** `enforce_admins: false` prevents accidental lock-out of the repository administrator for configuration maintenance.

---

## 2. PR Reconciliation & Supersession Status

1. **PR #123 (`fix/story-quarantine-legacy-fallback-2026-10-22`):**
   - **Verification:** All 6 modified files (`services/repositories/memory/story.ts`, `utils/data-layer/store.ts`, `utils/data-layer/types.ts`, `tests/publication-quarantine-regression.test.ts`, `package.json`, `vitest.config.js`) are completely present in candidate commit `eb5b49e7`.
   - **Action Taken:** Closed on GitHub with comment citing PR #103 as the replacement. Status: `CLOSED`.
2. **PR #126 (`fix/publication-boundary-apis-2026-10-22`):**
   - **Verification:** All 11 modified files (`/api/search`, `/api/v1/search`, `/api/v2/search`, `/api/v2/explorer`, `/api/graph/evidence`, `lib/story/resolver.ts`, `tests/public-chapter-visibility.test.ts`, `tests/publication-boundary-api.test.ts`, `utils/data-layer/store.ts`, `package.json`, `vitest.config.js`) are completely present and enhanced with proper `options?.publicOnly` support in candidate commit `eb5b49e7`.
   - **Action Taken:** Closed on GitHub with comment citing PR #103 as the replacement. Status: `CLOSED`.

---

## 3. Independent Human Review Protocol on PR #103

In compliance with `AGENTS.md` and the user directive, no automated review was fabricated. A comprehensive review packet was posted to PR #103 ([Comment Link](https://github.com/thebreakdowndaily/thebreakdown-os/pull/103#issuecomment-6345862292)).

The human reviewer is directed to inspect:
1. **Manual & Scheduled Publishing Canonical Contract:** Verification that `publishNowAction` routes through `evaluatePublicationContractAsync` (Evidence Gate 13) and persists via `RepositoryFactory.getStoryRepository().saveStory` with single-use publication token.
2. **Authentication & Server-Action Boundaries:** Verification that `*ActionCore` helpers are module-private and public actions enforce server-side session checks.
3. **Draft & Test-Artifact Exclusion:** Verification that Plassey remains strictly `draft` and test artifacts are quarantined from all public read/fallback paths.
4. **Search, Graph, Explorer, Feed & Sitemap Visibility:** Verification that public queries and graph endpoints do not leak draft nodes or inflate public totals.
5. **Partial-Failure Handling:** Verification that story write errors and calendar reconciliation failures are reported honestly with descriptive warnings.
6. **Architecture Fitness Invariants:** Verification of 0 circular dependencies across all 1,918 source files and layer isolation.
7. **Targeted vs Whole-Platform Unification Distinction:** Confirmation that targeted BTB-001 compliance is proven while whole-platform unification remains provisional.

---

## 4. Remote CI Reproducibility Evidence (Exact Candidate `eb5b49e7`)

Remote GitHub Actions runs for candidate commit `eb5b49e7`:

| Workflow | Run ID | Status | Duration | Verified Scope |
|---|---|---|---|---|
| **CI Pipeline** | [#39811816906](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39811816906) | **SUCCESS** | 13m37s | 19/19 steps (typecheck, lint, security, migrations, all 32 unit suites, forensics, a11y, build, browser DOM) |
| **POP-1.0 Infrastructure Pipeline** | [#39811816928](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39811816928) | **SUCCESS** | 3m41s | 14/14 steps (validation job, operational suites, build) |
| **Security Scans** | [#39811817609](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39811817609) | **SUCCESS** | 31s | Gitleaks commit scan & OSV dependency vulnerability gate |
| **Audit Framework Verification** | [#39811817194](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39811817194) | **SUCCESS** | 1m13s | 13/13 steps (audit CLI, loader tests, schema validation) |
| **CI Pipeline Push** | [#39811808789](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39811808789) | **SUCCESS** | 6m0s | Direct push verification of candidate commit |

---

## 5. Inviolable Governance Boundaries & Next Steps

1. **Do Not Merge Automatically:** Under active branch protection, PR #103 cannot be merged until 1 eligible human maintainer approves the pull request.
2. **Do Not Publish Plassey:** Plassey story remains strictly in draft status (`publicationStatus: 'draft'`).
3. **Do Not Alter Production Data:** Zero live database mutations or migration executions were performed.
4. **Next Immediate Step:** Authorized human maintainer reviews PR #103 using the review checklist and records approval on GitHub. Upon approval, PR #103 is **READY FOR AUTHORIZED MERGE**.
