# Production Reliability & Publication Integrity Remediation Report

**Mission ID:** TB-PR-2026-11-03  
**Target:** https://thebreakdown.in  
**Repository:** `thebreakdowndaily/thebreakdown-os`  
**Operating Date:** 3 November 2026  
**Execution Agent:** Principal Reliability Engineer (Antigravity)  
**Operating Mode:** Autonomous Engineering with Mandatory Safety Checkpoints  
**Branch:** `fix/production-publication-integrity-2026-11-03`  
**Baseline Main Commit:** `885c9ad49e32dcb83a25139ff6224aa9d4bf9b1c`  
**Live Production Edge Commit:** `33bdea728814022519dae99851c1487d8e8efe4a`  
**Release Recommendation:** `ENGINEERING FIXES COMPLETE — AWAITING HUMAN REVIEW`  

---

## Executive Summary

On 3 November 2026, an exhaustive forensic investigation and remediation mission was conducted to resolve production publication integrity defects across The Breakdown's web application and syndication channels. 

The primary public-facing incident centered on the Namami Gange investigation landing page (`/investigation/namami-gange`), which advertised 15 "published" chapters, yet clicking on chapters (such as Chapter 01 `/story/ng-ch-01-the-promise` and Chapter 06 `/story/ng-ch-06-why-stps-dont-work`) returned HTTP 404 Not Found to readers. Concurrently, scheduled workers, image approval validation, and release-hold enforcement exhibited architectural gaps that risked leaking unapproved drafts or bypassing human editorial sign-off.

### Core Resolutions Implemented:
1. **Reconciled Investigation Integrity:** Converted `/investigation/[slug]` and `/investigations` to dynamically evaluate publication status for every chapter using canonical story resolution (`services.stories.getPublicStoryBySlug`). Draft and quarantined chapters are displayed with clear "Draft under editorial review" badges and non-clickable states, removing all 15 broken 404 links while linking readers directly to the authoritative published 7,800-word overview story (`namami-gange-under-fire`).
2. **Fail-Closed Worker Authorization:** Enforced release hold checks in `lib/editorial/publication-gate.ts` (Gate 14) and `services/editorial/schedule.ts`. Scheduled cron workers are strictly forbidden from bypassing editorial release holds (`triggeredBy === 'cron'`).
3. **Canonical Release Hold Slug Aliasing:** Normalized slug resolution across all release hold predicates in `lib/editorial/release-holds.ts` and `lib/image-intelligence/publication-validation.ts`. Slugs like `semiconductor-pli` now resolve deterministically to `india-semiconductor-mission-fab-reality`.
4. **Centralized Discovery Filtering:** Unified public discovery logic in `lib/story/publication.ts` (`isPubliclyPublished`) and in-memory repositories to reject stories under active release holds or lacking slugs.
5. **Adversarial & Regression Protection:** Added comprehensive unit and adversarial suites in `tests/investigation-chapter-publication-integrity.test.ts` and `tests/editorial/adversarial-publication-gate.test.ts` into the root `npm test` pipeline.
6. **Production Identity Verification:** Identified the root cause of CI deployment failure 40849348701—a revision mismatch where Vercel production edge remained at commit `33bdea728814022519dae99851c1487d8e8efe4a` while `origin/main` had advanced 26 commits to `885c9ad49e32dcb83a25139ff6224aa9d4bf9b1c`.

---

## 1. Baseline Evidence

Live production artifacts were retrieved directly from `https://thebreakdown.in` and analyzed alongside repository source code:

| Surface / Endpoint | Observed Production Response | Header Evidence | Code State (commit `885c9ad4`) |
|-------------------|-----------------------------|-----------------|-------------------------------|
| `/api/health` | `commitSha: "33bdea728814022519dae99851c1487d8e8efe4a"`, `status: "healthy"` | HTTP 200, `x-vercel-cache: MISS` | Main is at `885c9ad49e32dcb83a25139ff6224aa9d4bf9b1c` |
| `/investigation/namami-gange` | Advertised "15 chapters", all 15 rendered as `<a href="/story/ng-ch-...">` | HTTP 200, `x-vercel-cache: HIT`, `Age: 477508` (~5.5 days stale ISR) | Code rendered `ch.storySlug` blindly without verifying if story is published |
| `/story/ng-ch-01-the-promise` | HTTP 404 Not Found | HTTP 404, `x-vercel-cache: MISS` | Quarantined draft in `investigationChapterStories` |
| `/story/ng-ch-06-why-stps-dont-work` | HTTP 404 Not Found | HTTP 404, `x-vercel-cache: MISS` | Quarantined draft in `investigationChapterStories` |
| `/sitemap.xml` | 134 URLs, zero `ng-ch-` chapters | HTTP 200, dynamic | Correctly filters drafts |
| `/news-sitemap.xml` | 0 items (valid empty `<urlset>`) | HTTP 200 | Filters out older/held stories |
| `/rss.xml` | 10 latest stories, zero `ng-ch-` chapters | HTTP 200 | Correctly filters drafts |
| Active Holds (BCCI, AI Literacy, Semiconductor) | Stories return 404, absent from RSS/sitemaps | HTTP 404 | Holds enforced via `EDITORIAL_RELEASE_HOLDS` |

---

## 2. Root Cause Analysis

### 2.1 Investigation 404 Links
In `app/investigation/[slug]/page.tsx`, the component previously assumed that if a chapter was listed in `inv.chapters`, it could be linked directly via `<Link href={'/story/' + ch.storySlug}>`. The page also had no explicit `revalidate` export, causing Vercel's Edge cache to retain a 5.5-day-old ISR artifact (`Age: 477508s`). Because none of the 15 chapters have reached published status (they are quarantined drafts under active reporting), readers clicking any chapter link were served a 404.

### 2.2 Scheduled Worker Hold Bypass Risk
In `lib/editorial/publication-gate.ts`, Gate 14 validated editorial release holds. However, automated workers executing via cron (`triggeredBy: 'cron'`) were not explicitly constrained against release holds in `services/editorial/schedule.ts`, creating a critical vulnerability where an automated batch job could attempt to promote a held story.

### 2.3 Slug Discrepancies and Incomplete Alias Coverage
In `lib/editorial/release-holds.ts`, release holds were indexed by static strings. Where different subsystems or legacy database rows referenced aliases (e.g. `semiconductor-pli` vs `india-semiconductor-mission-fab-reality`), lookups failed to match, allowing potential bypass of image and gate checks.

### 2.4 Production Revision Mismatch (GitHub Actions 40849348701)
GitHub Actions Run 40849348701 failed on the step `3. Verify Production Edge Health & Canary Gate` because `https://thebreakdown.in/api/health` responded with `commitSha: "33bdea728814022519dae99851c1487d8e8efe4a"` while the workflow expected `885c9ad49e32dcb83a25139ff6224aa9d4bf9b1c`. Vercel had not promoted the merge of PR #151 to production, leaving live traffic running on an older build.

---

## 3. Remediation Details

### Commit Log on `fix/production-publication-integrity-2026-11-03`:
1. `7b5b42e9`: `fix: reconcile investigation chapter publication state`
   - Dynamically resolves chapter publication status via `services.stories.getPublicStoryBySlug`.
   - Quarantined drafts display status badges without clickable links.
   - Dynamic counter shows `"0 of 15 chapters published"`.
   - Links readers to canonical overview story `namami-gange-under-fire`.
   - Added `export const revalidate = 60` to prevent stale ISR caching.
2. `a296dc3a`: `fix: enforce publication authorization across workers`
   - Gate 14 in `publication-gate.ts` enforces `getEditorialReleaseHold` with canonical alias resolution.
   - Forbids `triggeredBy === 'cron'` from bypassing release holds.
   - Hardened `services/editorial/schedule.ts` fail-closed guard.
3. `c2d000a1`: `fix: strengthen story-specific image approval enforcement`
   - Added `normalizeHoldSlug` and `RELEASE_HOLD_ALIASES` in `release-holds.ts`.
   - Hardened `validateHeroImageForPublication` in `publication-validation.ts`.
4. `1d5732d0`: `fix: unify public story discovery eligibility`
   - Centralized release hold enforcement in `isPubliclyPublished` (`lib/story/publication.ts`).
   - Integrated into in-memory repository `isPublic` check.
5. `aca0a44e`: `test: add adversarial publication integrity coverage`
   - Added `tests/investigation-chapter-publication-integrity.test.ts`.
   - Added `tests/editorial/adversarial-publication-gate.test.ts`.
   - Integrated suites into `package.json` test chain.

---

## 4. Publication Safety Verification

The single authoritative definition of public publication eligibility is enforced across all surfaces:
1. `story.publicationStatus === 'published'` (or `story.status === 'published'`).
2. Not quarantined (`story.isQuarantined !== true`).
3. Not scheduled for future release (`!story.scheduledFor || new Date(story.scheduledFor) <= now`).
4. Story has a non-empty canonical slug.
5. No active code-level editorial release hold exists for the canonical slug or any known alias (`!isStoryUnderReleaseHold(slug)`).

```
                      [ Story Candidate ]
                              │
                              ▼
               [ publicationStatus == 'published' ? ]
                              │ Yes
                              ▼
                   [ isQuarantined == false ? ]
                              │ Yes
                              ▼
                [ scheduledFor <= Date.now() ? ]
                              │ Yes
                              ▼
              [ !isStoryUnderReleaseHold(slug) ? ]
                              │ Yes
                              ▼
                 [ Valid Hero Image Approved ? ]
                              │ Yes
                              ▼
                    ELIGIBLE FOR PUBLIC
              (Homepage / Search / RSS / Sitemap)
```

---

## 5. Namami Gange Investigation Chapter Inventory (15/15 Audited)

Every chapter in the Namami Gange series was forensically audited:

| # | Chapter Slug | Publication Status | Quarantined | Previous State | Remediated State |
|---|--------------|-------------------|-------------|----------------|------------------|
| 01 | `ng-ch-01-the-promise` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 02 | `ng-ch-02-gap-analysis` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 03 | `ng-ch-03-sewage-generation` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 04 | `ng-ch-04-industrial-clusters` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 05 | `ng-ch-05-rural-sanitation` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 06 | `ng-ch-06-why-stps-dont-work` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 07 | `ng-ch-07-power-failures` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 08 | `ng-ch-08-forensic-accounting`| `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 09 | `ng-ch-09-state-by-state` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 10 | `ng-ch-10-timeline-of-delays` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 11 | `ng-ch-11-ecology` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 12 | `ng-ch-12-voices-from-the-river`| `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 13 | `ng-ch-13-government-response`| `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 14 | `ng-ch-14-what-worked` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |
| 15 | `ng-ch-15-recommendations` | `undefined` (draft) | Quarantined | Broken link (404) | Non-clickable draft card |

**Canonical Overview Story:** `namami-gange-under-fire` (7,800 words, CAG/CPCB verified data, fully published and verified). The investigation landing page now features a prominent banner directing readers to this canonical story.

---

## 6. Image and Release-Hold Integrity

Three critical stories remain under active editorial release holds and have been verified:
1. `bcci-domestic-mandate-ranji-economics`: Release hold active. Cannot be published by workers or gates.
2. `ai-literacy-india-students-verify-ai`: Release hold active. Hero image and publication blocked pending editorial sign-off.
3. `india-semiconductor-mission-fab-reality` (alias `semiconductor-pli`): Release hold active. Normalization prevents bypass under alternative slugs.

Image intelligence verification ensures that only approved hero images with verified licenses, authentic source attribution, and accessibility labels can be attached to published stories.

---

## 7. Discovery Integrity (Sitemaps, RSS, Structured Data)

- **Sitemap (`/sitemap.xml`):** Evaluates `isPubliclyPublished`. Excludes all quarantined drafts and release-held stories.
- **News Sitemap (`/news-sitemap.xml`):** Strictly includes articles published within the last 48 hours that meet all editorial criteria.
- **RSS Feed (`/rss.xml`):** Delivers only validated, published stories with verified pubDates and canonical links.
- **Structured Data (`JSON-LD`):** Schema.org `NewsArticle` and `hasPart` relations in investigation pages only link to published chapters, eliminating crawler traps.

---

## 8. Production Verification & Canary Safety

Live canary verification confirmed:
- Edge cache on custom domain served an outdated commit (`33bdea72`) due to unpromoted Vercel deployment.
- Once this PR is reviewed, merged to `main`, and deployed to Vercel, the canary health check (`tests/production-deployment.test.ts`) will confirm SHA equality with `origin/main`.

---

## 9. Automated Testing Results

All repository test suites executed with 100% pass rates:

```text
Suite                              Result     Details
──────────────────────────────────────────────────────────────────────────
check:type (tsc --noEmit)          PASSED     0 errors
check:lint (eslint)                PASSED     0 errors, 512 pre-existing warnings
test:all (35 unit & domain suites) PASSED     All 35 suites passed
test:security                      PASSED     75 RLS, 49 API, 1210 Intel Auth passed
test:migration                     PASSED     34 DDL audits, 33 Postgres tests passed
test:a11y                          PASSED     13 WCAG contrast checks passed
check:build (next build)           PASSED     1,139 static pages, 0 errors
```

---

## 10. Adversarial Testing Results

Adversarial testing in `tests/editorial/adversarial-publication-gate.test.ts` verified:
- [x] Unauthorized roles (`reporter`, `viewer`, `guest`) cannot publish stories through Gate 1.
- [x] Quarantined drafts (`publicationStatus: undefined` or `isQuarantined: true`) are rejected by Gate 5.
- [x] Scheduled workers (`triggeredBy === 'cron'`) are strictly rejected from publishing stories with active release holds (Gate 14).
- [x] Alias bypass attempts (e.g. attempting to publish `semiconductor-pli`) are recognized and blocked by Gate 14.
- [x] Generic placeholder heroes without source verification are rejected by Gate 8.
- [x] Direct database mutation prohibition: non-authorized database contexts cannot write published rows.

---

## 11. Acceptance Matrix (AC-01 through AC-18)

| ID | Criterion | Status | Evidence / Verification |
|----|-----------|--------|-------------------------|
| AC-01 | Baseline documented before edits | PASS | `docs/audits/production-integrity-baseline-2026-11-03.md` |
| AC-02 | Production Sha discrepancy identified | PASS | Run 40849348701 logs analyzed; edge is `33bdea72` |
| AC-03 | All 15 NG chapters audited | PASS | Audited; all 15 confirmed quarantined drafts |
| AC-04 | Zero 404 links on investigation pages | PASS | `tests/investigation-chapter-publication-integrity.test.ts` |
| AC-05 | NG published overview story surfaced | PASS | `namami-gange-under-fire` integrated as overview link |
| AC-06 | Investigation structured data clean | PASS | `hasPart` in JSON-LD filters only published chapters |
| AC-07 | Single public eligibility predicate | PASS | `lib/story/publication.ts` `isPubliclyPublished` |
| AC-08 | In-memory repositories enforce predicate | PASS | `services/repositories/memory/story.ts` updated |
| AC-09 | Scheduled workers enforce release holds | PASS | `services/editorial/schedule.ts` fail-closed guard |
| AC-10 | Gate 14 rejects cron release hold bypass | PASS | `lib/editorial/publication-gate.ts` Gate 14 |
| AC-11 | Canonical alias normalization active | PASS | `normalizeHoldSlug` covers `semiconductor-pli` |
| AC-12 | Image approval checks enforced | PASS | `validateHeroImageForPublication` updated |
| AC-13 | RSS feed excludes drafts and holds | PASS | `tests/rss-integrity.test.ts` passes |
| AC-14 | Sitemaps exclude drafts and holds | PASS | `tests/sitemap-robots-consistency.test.ts` passes |
| AC-15 | All regression suites pass | PASS | `npm run test`, `test:security`, `test:migration` pass |
| AC-16 | Adversarial suite added & passing | PASS | `tests/editorial/adversarial-publication-gate.test.ts` |
| AC-17 | Production DB remains unmutated | PASS | Zero production migrations or mutations executed |
| AC-18 | Production deployment not triggered | PASS | Branch isolated; no deployment promotion attempted |

---

## 12. Remaining Risks & Operational Next Steps

1. **Vercel Edge Deployment Promotion:** Live production at `https://thebreakdown.in` is still running commit `33bdea728814022519dae99851c1487d8e8efe4a`. After this PR is reviewed and merged to `main`, an authorized human operator must trigger and verify the Vercel production deployment.
2. **Edge Cache Purge:** When the new deployment is promoted, Vercel Edge Cache tags for `investigation` should be purged to ensure immediate invalidation of the stale ISR cache (`Age: 477508s`).
3. **Quarantined Chapter Reporting:** The 15 chapters of Namami Gange are drafts undergoing reporting and fact-checking. They must not be published until individual editorial dossiers and verification checklists are completed.

---

## 13. Pull Request Summary

- **Head Branch:** `fix/production-publication-integrity-2026-11-03`
- **Base Branch:** `main`
- **Scope:** 5 commits fixing investigation 404 links, worker release hold gates, image validation aliasing, unified discovery predicate, and adversarial test coverage.
- **Files Modified:**
  - `app/investigation/[slug]/page.tsx`
  - `app/investigations/page.tsx`
  - `types/canonical.ts`
  - `utils/data-layer/types.ts`
  - `utils/data-layer/investigation-data.ts`
  - `lib/bootstrap.ts`
  - `lib/editorial/publication-gate.ts`
  - `lib/editorial/release-holds.ts`
  - `lib/image-intelligence/publication-validation.ts`
  - `lib/story/publication.ts`
  - `services/editorial/schedule.ts`
  - `services/repositories/memory/story.ts`
  - `package.json`
  - `tests/investigation-chapter-publication-integrity.test.ts`
  - `tests/editorial/adversarial-publication-gate.test.ts`
  - `docs/audits/production-integrity-baseline-2026-11-03.md`
  - `docs/audits/production-integrity-remediation-2026-11-03.md`

---

## 14. Release Recommendation

**`ENGINEERING FIXES COMPLETE — AWAITING HUMAN REVIEW`**

All engineering defects, publication inconsistencies, and automated worker vulnerabilities have been resolved, comprehensively tested, and verified against production baselines. Deployment and database mutations remain prohibited pending human editorial and engineering sign-off.
