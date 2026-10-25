# ACG-3B — Exact-SHA Verification & PR-103 Merge Readiness Acceptance Report

**Mission ID:** ACG-3B  
**Series Pilot:** BTB-001 — Before the Battle: Plassey, 1757  
**Repository:** `thebreakdowndaily/thebreakdown-os`  
**Target Pull Request:** [PR #103](https://github.com/thebreakdowndaily/thebreakdown-os/pull/103) (`feat/acg2-btb-001-canonical-publication`)  
**Verified Candidate Commit SHA:** `2260e2ed8de69345a74cc46c1554109226cb6680`  
**Base Commit SHA:** `59e69c7c0521948b7cccf6898c7d66e106e51044`  
**Mergeability:** `MERGEABLE`  
**Reconciled & Superseded PRs:**
- PR #123 (`fix/story-quarantine-legacy-fallback-2026-10-22`): **CLOSED AS SUPERSEDED**
- PR #126 (`fix/publication-boundary-apis-2026-10-22`): **CLOSED AS SUPERSEDED**  
**Evaluation Date:** 2026-10-22  
**Operating Standard:** Engineering Agent Contract (`AGENTS.md`) & Evidence-First Completion Gate

---

## Executive Summary & Merge Readiness Decision

| Governance & Integration Gate | Verified State | Notes & Enforcing Mechanisms |
|---|---|---|
| **`main` Branch Protection** | **ACTIVE & ENFORCED** | Verified via GitHub API. Enforces PR requirement, 1 approving review, stale dismissal, strict status checks, no force pushes, no branch deletions. |
| **Exact-SHA Remote CI Checks** | **PASS (5/5 Required)** | All 5 required check contexts passed on candidate `2260e2ed8de69345a74cc46c1554109226cb6680`. |
| **Skipped Check Truthfulness** | **VERIFIED (3/3 Truthfully Skipped)** | Staging deploy, production deploy, and scheduled OSV cron jobs are truthfully classified as `skipping`, not passed. |
| **Search Pagination Remediation** | **PASS (8/8 Tests)** | Batched pagination discovers all stories beyond 1,000 rows without truncation; `MAX_SEARCH_WINDOW` capped at 10,000. |
| **Independent Human Code Review** | **BLOCKED (Gated)** | Review packet posted to PR #103 ([Comment](https://github.com/thebreakdowndaily/thebreakdown-os/pull/103#issuecomment-6346718293)). `reviewDecision` is `REVIEW_REQUIRED`. |
| **Reviewer Assignment Protocol** | **DOCUMENTED** | PR author is `thebreakdowndaily`; GitHub API forbids self-request. Independent maintainer must approve via Web UI. |
| **Targeted BTB-001 Architecture Fitness** | **PASS** | 19 claims matched 1:1; 8/8 fitness checks pass across 1,918 source files; 0 cycles. |
| **Whole-Platform Architecture Unification** | **PROVISIONAL** | Dual memory/database models remain active in parts of platform pending database cutovers. |
| **Plassey Pilot Publication** | **BLOCKED (Gated)** | Story strictly maintained in `publicationStatus: 'draft'`. |
| **Production Mutations & Series Expansion** | **BLOCKED (Gated)** | Zero production DB migrations applied. Panipat/Talikota/Buxar deferred. |

**Final Merge Readiness Decision:** **BLOCKED ON INDEPENDENT HUMAN CODE REVIEW APPROVAL**.  
All automated engineering, testing, security, build, and branch protection prerequisites are **100% complete and verified**. PR #103 is **READY FOR AUTHORIZED MERGE** immediately upon an eligible independent human maintainer recording an approving review on GitHub.

---

## 1. Verified Remote CI Status Checks (Exact Candidate SHA `2260e2ed8`)

All required status checks were executed on GitHub Actions against candidate commit `2260e2ed8de69345a74cc46c1554109226cb6680`:

| Context / Job Name | Result | Duration | Source Workflow | Evidence URL |
|---|---|---|---|---|
| **Continuous Integration & Release Gates** | **PASS** | 12m40s | `CI Pipeline` (`ci.yml`) | [Job 119963818912](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39818683643/job/119963818912) |
| **1. Validate & Test (CI)** | **PASS** | 4m53s | `POP-1.0 Production Infrastructure` (`production-deploy.yml`) | [Job 119963818839](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39818683571/job/119963818839) |
| **Gitleaks — scan changed commits** | **PASS** | 11s | `Security Scans` (`security-scans.yml`) | [Job 119963821635](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39818684203/job/119963821635) |
| **OSV — block newly introduced vulnerabilities** | **PASS** | 30s | `Security Scans` (`security-scans.yml`) | [Job 119963822475](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39818684203/job/119963822475) |
| **verify** | **PASS** | 1m8s | `Audit Framework Verification` (`audit-framework.yml`) | [Job 119963819167](https://github.com/thebreakdowndaily/thebreakdown-os/actions/runs/39818683627/job/119963819167) |
| **Vercel Preview Deployment** | **PASS** | Completed | Vercel GitHub Integration | [Preview URL](https://vercel.com/bholebababhakti108-makers-projects/thebreakdown-os/58aK6JVWhYidDr5WD6N5WB8Pwm5n) |
| **2. Verify Staging Deployment Health** | **SKIPPED** | — | `production-deploy.yml` | Evaluated only upon deployment triggers |
| **3. Verify Production Edge Health & Canary Gate** | **SKIPPED** | — | `production-deploy.yml` | Evaluated only upon deployment triggers |
| **OSV — scheduled dependency inventory** | **SKIPPED** | — | `security-scans.yml` | Evaluated only on scheduled cron runs |

---

## 2. Search Pagination Edge Case Remediation

In accordance with the ACG-3B directive, `app/api/v2/search/route.ts` was audited and remediated:

1. **Batched Story Resolution (`STORY_BATCH_SIZE = 1000`):**
   - The previous hardcoded `.range(0, 999)` lookup would silently truncate the published story set if the catalog exceeded 1,000 published stories.
   - Replaced with safe batched pagination in a loop (`range(storyBatchStart, storyBatchStart + STORY_BATCH_SIZE - 1)`) to discover 100% of published stories under caller RLS scope regardless of catalog scale.
2. **Direct Database Pagination for Single-Type Queries:**
   - When filtering by `type === 'story'`, pagination is applied directly in PostgreSQL via `.range(start, start + pageSize - 1)` constrained to valid `ref_slug` values, avoiding in-memory array slicing.
   - When filtering by non-story types (`type !== '' && type !== 'story'`), queries paginate directly in the database without unneeded story resolution.
3. **Deep Window Bounding (`MAX_SEARCH_WINDOW = 10000`):**
   - Mixed cross-type queries are safely bounded to 10,000 rows (e.g. up to page 500 at 20 items/page), preventing memory exhaustion while allowing deep pagination past index 1,000.
   - If the scan window ceiling is reached, explicit response headers `X-Search-Capped: true` and `X-Search-Scan-Ceiling: 10000` are emitted.
4. **Automated Regression Coverage:**
   - Added 2 new tests to `tests/publication-boundary-api.test.ts`:
     - Test 1: Simulates 1,050 published stories in two batches (0..999 and 1000..1999); queries page 52 for `type=story`; asserts correct retrieval of deep story `story-1025` and verifies exact batch queries.
     - Test 2: Simulates mixed search pagination for page 51 (items 1001-1020); asserts 20 items returned without truncation.
   - All 8 tests in `tests/publication-boundary-api.test.ts` pass cleanly.

---

## 3. Verified Active Branch Protection Policy on `main`

The `main` branch protection rules are active and verified via `GET /repos/thebreakdowndaily/thebreakdown-os/branches/main/protection`:

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

### Invariants Enforced:
1. **Pull Request Required:** Direct commits to `main` are blocked.
2. **Review Decision Enforced:** PR #103 `reviewDecision` is `REVIEW_REQUIRED`.
3. **Stale Dismissal:** Any new commit pushed to the PR automatically dismisses existing approvals.
4. **Strict Check Contexts:** All 5 required checks must report success on the exact candidate commit SHA before merge is permitted.
5. **No Force Pushes / No Deletions:** Remote branch history is immutable.

---

## 4. Independent Human Review & Reviewer Assignment Protocol

1. **Review Packet Posted:** An inspection protocol packet referencing candidate SHA `2260e2ed8` was posted to PR #103 ([Comment 6346718293](https://github.com/thebreakdowndaily/thebreakdown-os/pull/103#issuecomment-6346718293)).
2. **Reviewer Assignment Blocker:**
   - Repository collaborator check (`gh api repos/thebreakdowndaily/thebreakdown-os/collaborators`) returns `thebreakdowndaily` as the sole administrator.
   - PR #103 was authored by `thebreakdowndaily`.
   - The GitHub REST API forbids PR authors from requesting reviews from themselves or submitting an approving review on their own PR.
3. **Instructions for Repository Maintainer:**
   - To satisfy the branch protection gate, an independent collaborator must be added to the repository (`Settings -> Collaborators`), OR
   - The repository owner must submit the formal approving review via the GitHub Web UI:
     1. Open [PR #103](https://github.com/thebreakdowndaily/thebreakdown-os/pull/103).
     2. Click **Files changed**.
     3. Click **Review changes**.
     4. Select **Approve** and click **Submit review**.
4. **No Automated Self-Approval:** In accordance with `AGENTS.md` and user directives, no automated review was fabricated or submitted via API.

---

## 5. Inviolable Governance Boundaries & Next Steps

1. **Do Not Merge Automatically:** PR #103 remains strictly open awaiting independent human approval.
2. **Do Not Publish Plassey:** Plassey story remains strictly in draft status (`publicationStatus: 'draft'`).
3. **Do Not Alter Production Data:** Zero live database mutations or migration executions were performed.
4. **Single Next Action:** Await independent human maintainer code review and approval on PR #103 via GitHub Web UI. Once approved, report ready for authorized merge.
