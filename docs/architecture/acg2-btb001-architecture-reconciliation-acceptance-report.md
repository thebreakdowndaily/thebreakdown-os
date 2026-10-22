# ACG-2 — BTB-001 Architecture Reconciliation & Platform Acceptance Report (Consolidated Close-Out)

**Mission ID:** ACG-2  
**Series Pilot:** BTB-001 — Before the Battle: Plassey, 1757  
**Repository:** `thebreakdowndaily/thebreakdown-os`  
**Consolidated Candidate Branch:** `reconcile/acg2-btb-001`  
**Verified Candidate Commit SHA:** `b32a827d79e051a18cb4eab18b3984f027c81ef4`  
**Reconciled Branches & PRs:**
- PR #103 (`feat/acg2-btb-001-canonical-publication`, commit `1db06ef7`)
- PR #123 (`fix/story-quarantine-legacy-fallback-2026-10-22`, commit `b535e8f3`)
- PR #126 (`fix/publication-boundary-apis-2026-10-22`, commit `b7c3fe31`)
- Branch `fix/btb-001-publication-boundary-acceptance` (commit `eb01d406`)
**Evaluation Date:** 2026-10-22  
**Operating Standard:** Engineering Agent Contract (`AGENTS.md`) & Evidence-First Completion Gate

---

## Executive Summary & Acceptance Classification

The ACG-2 mission independently audited, reconciled, and verified the **BTB-001 ("Before the Battle: Plassey, 1757")** historical investigation pilot against the architecture of **The Breakdown OS**, reconciling PR #103, PR #123, and PR #126 into a single consolidated, verified candidate branch (`reconcile/acg2-btb-001` at commit `b32a827d`).

Following adversarial review, the platform claims remain strictly partitioned between **Targeted Architecture Fitness & Publication Boundary Isolation** (which is verified by passing automated invariant suites) and **Whole-Platform Architecture Unification** (which remains provisional and not yet independently certified across every legacy domain):

| Assessment Area | Status | Evidence & Limitation Summary |
|---|---|---|
| **BTB-001 Pilot Artifact Baseline (Gate 1)** | **PASS** | All 5 BTB-001 artifacts verified on disk; branch and commit verified; pre-existing user work preserved. |
| **BTB-001 Canonical Architecture Ownership (Gate 2)** | **PASS** | Pilot strictly uses canonical types (`Story`, `Claim`, `Source`, `Entity`, `StoryBlock`). Single pipeline from `plassey-story.ts` through `store.ts`, `adapters.ts`, `StoryService`, and view models. |
| **Fail-Closed Publication & Draft Containment (Gate 3)** | **PASS** | 100% containment verified across public routes, RSS, sitemaps, search APIs (`/api/search`, `/api/v1/search`, `/api/v2/search`), explorer (`/api/v2/explorer`), and evidence graph (`/api/graph/evidence`). Public story count remains strictly 41. |
| **Evidence & Historiographical Rigor (Gate 4)** | **PASS** | Reconciled claim count: all 19 claims matching evidence ledger 1:1. 3 historiographical disputes documented with balanced citations. |
| **Targeted Architecture Fitness (Gate 5)** | **PASS** | 8/8 invariants passing in `tests/architecture-fitness.test.ts`. 0 circular dependencies across all 17 root directories (1,918 source files). Service-to-presentation isolation enforced. |
| **Production Build & Test Chain Integrity (Gate 6)** | **PASS** | Static typechecks (`check:type`), linter (`check:lint`), standard test chain (32 unit/integration suites in `test`), security chain (1,444 assertions in `test:security`), and Next.js 15.5.27 production build (`build` — 1,140 routes) all passed. |
| **Whole-Platform Architecture Unification** | **PROVISIONAL / NOT YET CERTIFIED** | Scanning 1,918 files for cycles and enforcing layer boundaries does not prove that every legacy domain has a single authoritative schema or that all public consumers use identical pipelines. Platform still maintains dual memory/database paths. |
| **Plassey Pilot Publication** | **BLOCKED (Gated)** | Story remains strictly `publicationStatus: 'draft'`. Live publication requires human editorial board authorization. |
| **Historical Series Expansion (Panipat, Talikota, Buxar)** | **DEFERRED / BLOCKED (Gated)** | Development of new historical investigations is held until whole-platform architecture unification and remote CI reproducibility are fully established. |

---

## 1. Branch, PR & Merge Order Reconciliation

### 1.1 PR Relationships & Redundancy
1. **PR #126 (`fix/publication-boundary-apis-2026-10-22`):** Introduced draft filtering across search APIs (`/api/search`, `/api/v1/search`, `/api/v2/search`), evidence graph (`/api/graph/evidence`), explorer (`/api/v2/explorer`), static params (`getAllStoryAndChapterSlugs`), and added `tests/publication-boundary-api.test.ts` and `tests/public-chapter-visibility.test.ts`.
2. **PR #123 (`fix/story-quarantine-legacy-fallback-2026-10-22`):** Introduced memory store test-artifact quarantine and added `tests/publication-quarantine-regression.test.ts`.
3. **Branch `fix/btb-001-publication-boundary-acceptance`:** Merged PR #126 and PR #123, added canonical publication predicates in `lib/story/publication.ts`, and added the 110-test suite `tests/publication-boundary-regression.test.ts`.
4. **PR #103 (`feat/acg2-btb-001-canonical-publication`):** Baseline PR containing the core ACG-1/ACG-2 platform unification work (19-claim Plassey story, `architecture-fitness.test.ts`, `before-the-battle-plassey.test.ts`, server-action private helpers, canonical block synthesis, and `publication-safety-p1.test.ts`).

### 1.2 Consolidated Candidate Branch (`reconcile/acg2-btb-001`)
A consolidated candidate branch was created from PR #103 HEAD (`1db06ef7`) and merged with `origin/fix/btb-001-publication-boundary-acceptance` (`eb01d406`). Two defects were diagnosed and resolved:
- **Duplicate Type Declaration:** Resolved duplicate `isLegacy` declaration on `APIClaim` in `utils/data-layer/types.ts` (Commit `dd380bee`).
- **Resolver Architectural Conflict:** Remediated contradictory chapter resolution contracts between PR #126 and `tests/publication-safety-p1.test.ts` (Commit `b32a827d`).

### 1.3 Recommended Merge Order
**PR #123 and PR #126 are completely superseded by this consolidated branch.**
Merging order:
1. Close PR #123 and PR #126 as superseded.
2. Fast-forward update PR #103 branch (`feat/acg2-btb-001-canonical-publication`) to commit `b32a827d`.
3. Run remote CI and require independent human code review before merging PR #103 into `main`.

---

## 2. Root Cause Analysis: Chapter Resolution & Publication Safety

### 2.1 The Defect
PR #126 added `isPublicChapterStatus(ch.status)` directly into `tryLoadChapter` in `lib/story/resolver.ts`. While intended to block public access to non-public chapters, it introduced two major platform bugs:
1. **Broken Publication Safety Contract:** `tests/publication-safety-p1.test.ts` line 39 verifies that `resolveCanonicalStory('kashmir-the-first-test')` resolves the chapter, sets `canonicalStory.publicationStatus = 'draft'`, and confirms `isCanonicalStoryPublic() === false`. When `tryLoadChapter` suppressed drafts, `resolveCanonicalStory` returned `not_found`, failing the test.
2. **False-Positive P1 Operational Alarms:** `resolveCanonicalStory` treats a missing chapter as an unexpected invariant violation, logging `[ALARM][P1] CANONICAL_RESOLUTION_FAILURE`. Because `tryLoadChapter` suppressed drafts, requesting any draft chapter in canonical mode fired a false P1 alarm.
3. **Editor Preview Denial:** In `app/story/[slug]/page.tsx`, authenticated staff preview drafts via server-side session checks. Suppressing drafts in `tryLoadChapter` prevented authorized editorial previews.

### 2.2 The Remediation
- In `lib/story/resolver.ts`:
  - `tryLoadChapter` finds the chapter without suppression, guarding `services?.investigations?.getInvestigations` and falling back safely.
  - `resolveCanonicalStory` supports an optional `options?: { publicOnly?: boolean }` parameter.
  - If `options?.publicOnly && !isPublicChapterStatus(chapter.status)`, it returns `{ type: 'not_found' }` without logging an alarm.
  - When called without `publicOnly`, it constructs the canonical story with `publicationStatus = 'draft'`, allowing downstream callers (`StoryPage`) to fail closed for unauthenticated visitors and allow authenticated staff previews.
  - Added defensive handling for `chapterContent = chapter.content || []`.
- In `tests/public-chapter-visibility.test.ts`:
  - Provided `investigations` service mock.
  - Explicitly tests `resolveCanonicalStory('draft-chapter', { publicOnly: true })` returns `{ type: 'not_found' }`.
  - Explicitly tests `resolveCanonicalStory('draft-chapter')` returns `type: 'chapter'` with `isCanonicalStoryPublic() === false`.

---

## 3. Independent Security, Review & Branch Protection Audit

### 3.1 Human Code Review Audit
- **Audit Command:** `gh pr view 103 --json reviewDecision,reviews`
- **Result:** `reviews: []`, `reviewDecision: ""`
- **Finding:** PR #103 has received **ZERO independent human code reviews**. Automated CI passes alone do not constitute approval. In accordance with Section 8 of `AGENTS.md`, independent non-author human review is an inviolable gate prior to merge.

### 3.2 Branch Protection Audit
- **Audit Command:** `gh api repos/thebreakdowndaily/thebreakdown-os/branches/main/protection`
- **Result:** `HTTP 404: Branch not protected`; rulesets returned `[]`; `required_status_checks: off`.
- **Finding:** The `main` branch currently has **NO branch protection rules enabled**. Any authorized collaborator could technically push or merge without green status checks.
- **Remediation Recommendation:** Before merging PR #103, repository administrators must configure branch protection on `main` requiring:
  - Required pull request reviews before merging (minimum 1 eligible non-author review).
  - Required status checks: CI Pipeline, Security Scans, and Production Build.
  - Require branches to be up to date before merging.

---

## 4. Verification Evidence on Consolidated Candidate (`b32a827d`)

Every test suite was executed against the exact consolidated candidate commit:

| Verification Suite | Execution Command | Result | Notes |
|---|---|---|---|
| **TypeScript Typecheck** | `npm run check:type` | **PASS (0 errors)** | Full project `tsc --noEmit` clean. |
| **ESLint Gate** | `npm run check:lint` | **PASS (0 errors, 516 warnings)** | Exactly matches project baseline; 0 errors. |
| **P1 Publication Safety Suite** | `npm run test:publication-safety-p1` | **PASS (14/14 tests)** | F-01 redirect gate, F-02 search filter, F-03 metadata gate, Test 4 future embargo, Test 5 canonical regression. |
| **Editorial Persistence Suite** | `npm run test:editorial-actions-persistence` | **PASS (4/4 tests)** | Save, schedule, publish, and rollback actions verified. |
| **Standard Test Chain** | `npm run test` | **PASS (32/32 suites)** | All 30 unit suites + publication-safety-p1 + editorial-actions-persistence passing. |
| **Security Regression Suite** | `npm run test:security` | **PASS (1,444 assertions)** | 32 migrations, 30 auth, 9 redirect, 75 RLS, 49 API security, 1,249 Intel auth assertions. |
| **Database & Migration Safety** | `npm run test:migration` | **PASS (32 migrations applied, 33 DB tests)** | Verified against isolated PostgreSQL instance. |
| **Publication Boundary Regression** | `npx vitest run tests/publication-boundary-regression.test.ts` | **PASS (110/110 tests)** | Verified discovery, dynamic routes, pagination bounds, lifecycle durability. |
| **Publication Boundary API Suite** | `npx vitest run tests/publication-boundary-api.test.ts` | **PASS (6/6 tests)** | Search, graph, and explorer API boundaries verified. |
| **Public Chapter Visibility Suite** | `npx vitest run tests/public-chapter-visibility.test.ts` | **PASS (3/3 tests)** | Static params, publicOnly gate, and canonical draft status verified. |
| **Quarantine Regression Suite** | `npx vitest run tests/publication-quarantine-regression.test.ts` | **PASS (3/3 tests)** | Test artifacts excluded from memory and fallback reads. |
| **Architecture Fitness Invariants** | `npx vitest run tests/architecture-fitness.test.ts` | **PASS (8/8 tests)** | 1,918 source files scanned; 0 circular dependencies; layer boundaries verified. |
| **Before the Battle Pilot Suite** | `npx vitest run tests/before-the-battle-plassey.test.ts` | **PASS (12/12 tests)** | 19 claims matched 1:1; 5 draft entities; fail-closed draft isolation. |
| **Next.js Production Build** | `npm run build` | **PASS (1,140/1,140 pages)** | Compiled under Next.js 15.5.27; 0 SSG errors. |

---

## 5. Fail-Closed Public Data Exclusion Verification

| Surface | Mechanism | Verified Behavior |
|---|---|---|
| **Dynamic Reader** (`/story/[slug]`) | `isCanonicalStoryPublic()` | Unauthenticated requests return `notFound()` (HTTP 404). Authenticated staff can preview. |
| **Static SSG Build** (`generateStaticParams`) | `getAllStoryAndChapterSlugs()` | Plassey excluded from build export. 41 public stories built. |
| **XML Sitemaps** (`/sitemap.xml`) | `lib/seo/sitemap.ts` | Plassey URL strictly omitted. |
| **RSS / Feeds** (`/feed.xml`, `/rss`) | `isPubliclyPublished()` | Draft story excluded from syndication streams. |
| **Search APIs** (`/api/search`, `/api/v1/search`, `/api/v2/search`) | `isPubliclyPublished()` / RLS query | Query returns 0 hits for Plassey story. Public totals not inflated. |
| **Evidence Graph** (`/api/graph/evidence`) | Repository public reads | 0 draft nodes or draft edges emitted into topology. |
| **Explorer** (`/api/v2/explorer`) | `canPubliclyViewStory()` | Draft stories and test artifacts excluded. |
| **Public Story APIs** (`/api/v1/stories`) | SQL / adapter filter | Only `status = 'published'` returned. |

---

## 6. Explicit Acceptance Decisions

| Gate | Assessment Criterion | Outcome | Notes |
|---|---|---|---|
| **Gate 1** | Artifact Baseline Verification | **PASS** | All artifacts verified on disk; commit baseline tracked. |
| **Gate 2** | Canonical Architecture Ownership | **PASS** | BTB-001 uses canonical types and single pipeline. |
| **Gate 3** | Fail-Closed Publication & Draft Containment | **PASS** | Zero leaks across all public surfaces. |
| **Gate 4** | Evidence & Historiographical Rigor | **PASS** | 19 claims matched 1:1; balanced historiography. |
| **Gate 5** | Architectural Invariant Verification | **PASS** | 8/8 fitness checks passed across 1,918 source files. |
| **Gate 6** | Production Build & Release Gate Integrity | **PASS** | Full test chain (32 suites), 1,444 security checks, and Next.js SSG build green. |

### Operational Governance Gates

| Operational Gate | Status | Required Human Action |
|---|---|---|
| **Whole-Platform Unification** | **PROVISIONAL** | Requires whole-platform runtime data-flow audit and database provider cutover. |
| **Plassey Live Publication** | **BLOCKED** | Retained strictly in `publicationStatus: 'draft'`. Requires human editorial board authorization. |
| **Historical Series Expansion** | **BLOCKED / DEFERRED** | Defer Panipat, Talikota, and Buxar authoring until platform cutover is certified and owner directs expansion. |
| **PR #103 Merge** | **BLOCKED** | Requires independent human code review (currently 0 reviews) and branch protection setup. |
| **Staging / Prod DB Migrations** | **BLOCKED** | Migration 033 and PR #93 held for scheduled operational window. Zero live DB mutations performed. |

---

## 7. Exact Acceptance Status & Next Action

- **BTB-001 Pilot Compliance (Gates 1–6):** **PASS**
- **Targeted Architecture Fitness & Boundary Isolation:** **PASS**
- **Branch & PR Reconciliation:** **COMPLETE** (Branch `reconcile/acg2-btb-001` at `b32a827d` supersedes PR #123 and PR #126)
- **Whole-Platform Architecture Unification:** **PROVISIONAL / NOT YET INDEPENDENTLY CERTIFIED**
- **Plassey Publication:** **BLOCKED (Gated)**
- **Historical Series Expansion (Panipat, Talikota, Buxar):** **BLOCKED / DEFERRED**

**Single Next Action:** Present this consolidated reconciliation report to the product owner and editorial board. Update PR #103 with candidate commit `b32a827d`, close superseded draft PRs #123 and #126, enable branch protection on `main`, and conduct independent human code review. Standing by for instructions.
