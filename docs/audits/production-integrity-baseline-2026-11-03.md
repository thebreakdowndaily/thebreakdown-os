# Forensic Baseline & Publication Integrity Audit — 2026-11-03

**Mission ID:** TB-PR-2026-11-03  
**Target:** `https://thebreakdown.in`  
**Repository:** `thebreakdowndaily/thebreakdown-os`  
**Operating Date:** 3 November 2026  
**Execution Agent:** Antigravity / OpenCode  
**Baseline Commit:** `885c9ad49e32dcb83a25139ff6224aa9d4bf9b1c` (origin/main)  
**Dedicated Working Branch:** `fix/production-publication-integrity-2026-11-03`  
**Deployment Authorization:** NOT GRANTED  
**Production Database Mutation:** PROHIBITED  
**Editorial Publication Authorization:** PROHIBITED  

---

## 1. Executive Summary & Baseline Findings

A forensic audit of The Breakdown's production publication system, edge discovery surfaces, and repository implementation was executed. The investigation revealed four major architectural and operational defects:

1. **Investigation Landing Page Chapter False Publication & 404 Links (P1):**
   - The landing page at `/investigation/namami-gange` advertises 15 chapters and renders direct links (`/story/ng-ch-01-the-promise` ... `/story/ng-ch-15-recommendations`).
   - Every single chapter route returns **HTTP 404**.
   - In the repository and data layer, all 15 Namami Gange chapter stories are quarantined drafts with no authorized public publication state.
   - The investigation page template (`app/investigation/[slug]/page.tsx`) blindly maps the static chapter inventory to public story links without consulting the canonical publication policy predicate (`isCanonicalStoryPublic` / `isPubliclyPublished`).
   - In addition, production serves an edge-cached ISR prerender with `Age: 477508` (~5.5 days old), compounding stale representation.

2. **Serving Revision vs Main Branch Divergence (P1):**
   - Live production (`https://thebreakdown.in/api/health`) responds with `commitSha: "33bdea728814022519dae99851c1487d8e8efe4a"`.
   - `origin/main` is at `885c9ad49e32dcb83a25139ff6224aa9d4bf9b1c` (26 commits ahead of `33bdea72`).
   - GitHub Actions run 40849348701 failed on the step `3. Verify Production Edge Health & Canary Gate` due to:
     `MISMATCHED_REVISION (expected 885c9ad49e32dcb83a25139ff6224aa9d4bf9b1c, but edge reported 33bdea728814022519dae99851c1487d8e8efe4a)`.
   - Vercel production deployment was either not promoted or blocked, leaving the live site on an earlier revision.

3. **Central Publication Predicate Lacks Release-Hold Awareness (P0):**
   - The canonical publication predicate in `lib/story/publication.ts` (`isPubliclyPublished`, `isCanonicalStoryPublic`) evaluated only `publicationStatus`, `publishedAt`, and `isTestArtifact`.
   - It did not accept a story `slug` or enforce `EDITORIAL_RELEASE_HOLDS`.
   - Consequently, consumer routes checking `isCanonicalStoryPublic(story)` could treat held stories as public if their database row carried `status: 'published'`.
   - Ad-hoc hold checks existed only in `utils/data-layer/store.ts`, violating the single-source-of-truth invariant.

4. **Release Hold Alias Bypass Vulnerability (P0):**
   - In `utils/data-layer/store.ts`, `LEGACY_PUBLIC_SLUGS` contains `semiconductor-pli`.
   - The active release hold in `lib/editorial/release-holds.ts` is keyed by canonical slug `india-semiconductor-mission-fab-reality`.
   - Without canonical alias resolution, legacy references could bypass the editorial hold.

---

## 2. Repository Reconnaissance & Environment State

| Attribute | State / Value | Verification Source |
|---|---|---|
| Working Directory | `c:\newsjack-content\thebreakdown-os` | `git rev-parse --show-toplevel` |
| Dedicated Branch | `fix/production-publication-integrity-2026-11-03` | `git branch --show-current` |
| Branch Base | `885c9ad49e32dcb83a25139ff6224aa9d4bf9b1c` (`origin/main`) | `git rev-parse HEAD` |
| Working Tree | Clean | `git status --short` |
| Node.js Version | `v24.18.0` (compatible with `>=22.0.0`) | `node -v` |
| TypeScript Check | PASSED (0 errors) | `npm run check:type` |
| Test Suite | PASSED (all tests in `npm run test` pass) | `npm run test` |

---

## 3. Production Deployment & Live Infrastructure Evidence

Probed live endpoints at `https://thebreakdown.in` on 2026-11-03:

### 3.1 Health Endpoint (`/api/health`)
- **HTTP Status:** 200 OK
- **Response Headers:**
  - `Server: cloudflare`
  - `CF-RAY: a54716a289213e61-SIN`
  - `x-vercel-cache: MISS`
  - `x-vercel-id: sin1::iad1::5tk82-1793663918533-06397c405a82`
  - `Cache-Control: no-store, max-age=0`
- **Response Body:**
  ```json
  {
    "status": "healthy",
    "check": "readiness",
    "commitSha": "33bdea728814022519dae99851c1487d8e8efe4a",
    "timestamp": "2026-11-02T23:58:43.499Z"
  }
  ```
- **Finding:** Live edge is running commit `33bdea72` (pushed 2026-10-28), NOT main commit `885c9ad4`.

### 3.2 Investigation Landing Page (`/investigation/namami-gange`)
- **HTTP Status:** 200 OK
- **Response Headers:**
  - `x-vercel-cache: HIT`
  - `Age: 477508` (~5.5 days old edge cache copy)
  - `x-nextjs-prerender: 1`
  - `x-matched-path: /investigation/namami-gange`
- **Body Analysis:**
  - Renders 15 chapter links: `/story/ng-ch-01-the-promise` through `/story/ng-ch-15-recommendations`.
  - Prompts "Start with the Overview" linking to `/story/ng-ch-01-the-promise`.
- **Finding:** Direct navigation to `/story/ng-ch-01-the-promise` and `/story/ng-ch-06-why-stps-dont-work` returns HTTP 404.

### 3.3 Discovery Endpoints
- **`/sitemap.xml`:** 139 URLs. Contains canonical story `/story/namami-gange-under-fire`. Excludes all `ng-ch-*` chapters.
- **`/rss` / `/rss.xml`:** 44 stories syndicated. Excludes all `ng-ch-*` chapters.
- **`/news-sitemap.xml`:** Valid XML, empty `<urlset>` (0 stories published within rolling 48-hour Google News threshold).
- **`/robots.txt`:** Allows public story and investigation routes; disallows `/admin`, `/cms`, `/editorial/`, `/workspace`.

---

## 4. Publication Architecture & Dependency Map

The complete publication lifecycle was traced across the system:

```text
               +----------------------------------+
               | Story Authoring / Intake         |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               | Editorial & Fact-Check Review    |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               | Human Publication Authorization  |
               | (Must NOT be automated)          |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               | Canonical Publication Contract   |
               | evaluatePublicationContractAsync |
               | - 12 Gates + Vault Gate 13       |
               | - Editorial Hold Gate 14         |
               | - Hero Media Quality Gate 15     |
               | - Issue Publication Token        |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               | Durable Storage (DB / Store)     |
               | status: 'published'              |
               | valid past publishedAt           |
               +----------------------------------+
                                |
                                v
        +-----------------------------------------------+
        | Central Fail-Closed Visibility Predicate       |
        | lib/story/publication.ts                      |
        | isPubliclyPublished(ctx) / isCanonicalPublic   |
        | - Requires status === 'published'             |
        | - Requires valid past publishedAt             |
        | - Checks Release Holds & Aliases              |
        | - Rejects Test Artifacts                      |
        +-----------------------------------------------+
                                |
        +-----------+-----------+-----------+-----------+
        |           |           |           |           |
        v           v           v           v           v
    Homepage   Story Route   Archive   Investigations  Sitemap & RSS
```

### Audit of Independent Publication Predicates

| Component | Current Implementation | Flaw / Divergence |
|---|---|---|
| `lib/story/publication.ts` | Checks `publicationStatus`, `publishedAt`, `isTestArtifact`. | Missing `slug` and `getEditorialReleaseHold` enforcement. |
| `utils/data-layer/store.ts` | Checks `storyIsPublic` + `isLegacyPublic` + `getEditorialReleaseHold`. | Alias `semiconductor-pli` not resolved to canonical hold. |
| `app/investigation/[slug]/page.tsx` | Directly maps `inv.chapters` to `<Link href="/story/${ch.storySlug}">`. | Completely bypasses publication check; renders 15 links that 404. |
| `app/investigations/page.tsx` | Displays `inv.chapters.length`. | Displays total chapters rather than published chapter count. |
| `services/editorial/schedule.ts` | Runs `evaluatePublicationContractAsync` before publishing. | Correctly validates gates, but scheduler principal must never bypass human review holds. |

---

## 5. Namami Gange Investigation: 15-Chapter Status Matrix

All 15 chapter records were inspected across `utils/data-layer/investigation-data.ts`, `utils/data-layer/store.ts`, and `lib/story/resolver.ts`:

| Ch # | Chapter Slug | Publication Status | Editorial State | Public Eligibility | Route Result |
|---|---|---|---|---|---|
| 01 | `ng-ch-01-the-promise` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 02 | `ng-ch-02-follow-the-money` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 03 | `ng-ch-03-the-sewage-problem` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 04 | `ng-ch-04-the-audit-trail` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 05 | `ng-ch-05-procurement-and-accountability` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 06 | `ng-ch-06-why-stps-dont-work` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 07 | `ng-ch-07-water-quality` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 08 | `ng-ch-08-city-report-cards` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 09 | `ng-ch-09-contractors` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 10 | `ng-ch-10-timeline-of-delays` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 11 | `ng-ch-11-ecology` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 12 | `ng-ch-12-voices-from-the-river` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 13 | `ng-ch-13-government-response` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 14 | `ng-ch-14-what-worked` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |
| 15 | `ng-ch-15-recommendations` | `undefined` (Draft) | Quarantined Draft | Ineligible | HTTP 404 (not_found) |

### Investigation Hub True State:
- Published story for Namami Gange: **`namami-gange-under-fire`** (status: published, 7,800 words, verified CAG/CPCB evidence).
- Chapters 01 through 15: **Quarantined drafts in development/investigation**. None are eligible for standalone publication.
- Root Cause: `app/investigation/[slug]/page.tsx` treated `inv.chapters` as published stories instead of querying each chapter's canonical publication eligibility.

---

## 6. Image Approval & Editorial Release Holds

Three stories remain under active editorial release hold in `lib/editorial/release-holds.ts`:
1. `ai-literacy-india-students-verify-ai` (HOLD: short narrative, needs human editorial signoff & story-specific hero)
2. `india-semiconductor-mission-fab-reality` (HOLD: outdated project totals, unsupported economics claims)
3. `bcci-domestic-mandate-ranji-economics` (HOLD: incentive wording, unsupported 42% appearance claim)

### Vulnerabilities Identified:
- `RELEASE_HOLD_ALIASES` mapping was missing, leaving `semiconductor-pli` potentially unmapped to the hold for `india-semiconductor-mission-fab-reality`.
- `lib/story/publication.ts` did not check release holds centrally.
- Scheduled publication workers must be strictly blocked if any story is under active release hold.

---

## 7. Baseline Checkpoint 0 Sign-Off

The baseline has been established without modifying application code:
- [x] Repository state and branch divergence confirmed.
- [x] Production serving commit (`33bdea72`) identified and verified.
- [x] Vercel CI mismatch diagnosed from GitHub Actions run logs.
- [x] Namami Gange 15-chapter authoritative state established (all 15 quarantined drafts).
- [x] Root causes identified and documented.
- [x] Publication architecture mapped.

**Next Phase:** Phase B — Primary Remediation on branch `fix/production-publication-integrity-2026-11-03`.
