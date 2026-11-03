# Final Release-Candidate Audit: Delhi Green-Cracker Investigation

**Mission ID:** `TB-INV-2026-11-03-GREEN-CRACKERS`  
**Story Slug:** `delhi-green-cracker-enforcement-diwali-2026`  
**Working Branch:** `research/green-cracker-enforcement-2026-11-03`  
**Base Branch:** `main` (commit `885c9ad4`)  
**Pull Request:** [#153](https://github.com/thebreakdowndaily/thebreakdown-os/pull/153)  
**Audit Date:** 2026-11-03  
**Status:** `READY FOR HUMAN GOLD STANDARD REVIEW`

---

## 1. Executive Summary & Purpose

This audit establishes the definitive release-candidate state of the Delhi green-cracker investigation ("Delhi's Green-Cracker Test Is Now an Enforcement Test"). Following an extensive review of the codebase, data layer, publication gates, and editorial standards, all five issues identified in the prior execution report have been independently inspected, corrected, and verified against the repository's source of truth.

The story package is now technically and editorially ready to be handed off to genuine human reviewers under the seven-phase Gold Standard Review protocol established by Article XI of Level 1 Editorial Constitution v1.1. No simulated, artificial, or automated approvals have been recorded. Both governance holds (`gold_standard_review` and `editorial_release_hold`) remain actively asserted and fail-closed.

---

## 2. Repository & Working-Tree Baseline

| Parameter | Observed State | Source of Truth | Verification Status |
|:---|:---|:---|:---:|
| **Git Working Branch** | `research/green-cracker-enforcement-2026-11-03` | `git branch --show-current` | Verified |
| **Pull Request** | PR #153 (`research/green-cracker-enforcement-2026-11-03` → `main`) | `gh pr view 153` | Open |
| **Base Commit** | `885c9ad4` (Merge PR #151) | `git log -1 885c9ad4` | Verified |
| **Branch Head** | `ca792883` + working tree changes | `git log -1` | Verified |
| **Canonical Story File** | [`lib/editorial/drafts/delhi-green-crackers.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/drafts/delhi-green-crackers.ts) | Working tree | Clean / Verified |
| **Registry Mapping** | [`lib/editorial/drafts/remediated-stories.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/drafts/remediated-stories.ts) | Working tree | Registered |
| **Image Intelligence** | [`lib/image-intelligence/manifest.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/image-intelligence/manifest.ts) | Working tree | Registered & Locked |
| **Active Release Hold** | [`lib/editorial/release-holds.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/release-holds.ts) | Working tree | Active `HOLD` |
| **Typecheck** | `tsc --noEmit` (0 errors) | `npm run check:type` | Passed |
| **Lint Check** | `eslint app components ...` (0 errors) | `npm run check:lint` | Passed |
| **Regression Tests** | 16 tests in [`tests/editorial/green-cracker-publication-safety.test.ts`](file:///c:/newsjack-content/thebreakdown-os/tests/editorial/green-cracker-publication-safety.test.ts) | `npx vitest run ...` | Passed (16/16) |

---

## 3. Resolution of the Five Release-Candidate Issues

### Issue 1: Review-Stage Story Had Non-Null `published_at` Value
- **Defect:** The draft in [`delhi-green-crackers.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/drafts/delhi-green-crackers.ts) previously specified `publishedAt: '2026-11-03T20:00:00Z'` despite being in `status: 'review'` and `publicationStatus: 'scheduled'`.
- **Finding:** Setting a non-null publication timestamp on an unpublished review draft asserts a false historical fact (that the story was published at 20:00:00Z). In the database layer (`public.stories`), `published_at` is nullable and remains `NULL` until canonical publication.
- **Remediation:** 
  1. Updated [`delhi-green-crackers.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/drafts/delhi-green-crackers.ts): set `publishedAt: ''` and recorded `scheduledAt: '2026-11-03T20:00:00Z'` to preserve the target schedule without corrupting publication timestamp semantics.
  2. Updated [`lib/editorial/canonical-publication.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/canonical-publication.ts): `evaluatePublicationContractAsync` and `evaluatePublicationContract` now dynamically supply the candidate publication timestamp (`targetStory.publishedAt || existingStory?.publishedAt || now.toISOString()`) to the publication gates during publication evaluation, preventing review drafts from needing artificial pre-publication timestamps.

### Issue 2: Reading Time Divergence (10 min declared vs 2,780 narrative words)
- **Defect:** The draft declared `readingTime: 10`, but narrative prose extraction counted 2,780 words, which at the platform baseline of 220 words per minute computes to $\lceil 2780 / 220 \rceil = 13$ minutes.
- **Finding:** Gate 16 allowed up to 25% tolerance, permitting 10 minutes to narrowly pass ($3 / 13 = 23.07\%$), but introducing UI inconsistency and metadata divergence.
- **Remediation:**
  1. Explicitly updated `readingTime: 13` across the canonical draft, metadata documentation, and story artifacts.
  2. Verified exact alignment: declared 13 min vs calculated 13 min = 0 min discrepancy (0.0%).
  3. Added regression assertions in [`tests/editorial/green-cracker-publication-safety.test.ts`](file:///c:/newsjack-content/thebreakdown-os/tests/editorial/green-cracker-publication-safety.test.ts).

### Issue 3: Public 404 Attributed to Fail-Closed Security Without Complete Diagnosis
- **Defect:** Prior reporting claimed the public 404 response at `https://thebreakdown.in/story/delhi-green-cracker-enforcement-diwali-2026` proved fail-closed security enforcement without tracing deployment boundaries, database existence, or resolver logic.
- **Finding:** Complete multi-layer trace reveals the 404 is caused by five concurrent fail-closed boundaries:
  1. *Git branch isolation:* PR #153 is unmerged; production builds from `main`.
  2. *Database isolation:* No row exists in production Supabase `stories` table.
  3. *Application resolver isolation:* `selectReadPath` routes to legacy reader; falls back to draft registry where `status === 'review'`.
  4. *Page security check:* `isCanonicalStoryPublic` returns `false` (`publicationStatus !== 'published'`); invokes `notFound()`.
  5. *Discovery isolation:* Excluded from sitemaps, news sitemaps, RSS, and search indexing.

### Issue 4: Source 1 Court Order Classification (Official-Hosted vs Secondary Reproduction)
- **Defect:** Source 1 (`src-sc-order-2026`) was listed as an official Supreme Court publication, but the referenced URL is `https://indiankanoon.org/doc/113136598/` (an IndiaKanoon legal database reproduction). No official PDF from `main.sci.gov.in` has been archived into the local Evidence Vault.
- **Finding:** Misclassifying a secondary legal database reproduction as a certified official government portal archive violates Constitution Article III (Source Traceability).
- **Remediation:**
  1. Reclassified Source 1 title to: `Supreme Court of India, Order in Arjun Gopal v. Union of India (2026 INSC 1181) [IndiaKanoon Legal Database Reproduction]`.
  2. Updated publisher to: `IndiaKanoon (reproducing Supreme Court of India)`.
  3. Updated claim data fields to explicitly cite the IndiaKanoon reproduction.
  4. Preserved the procedural requirement for post-release server-side ingestion of the official certified PDF once available.

### Issue 5: AI-Assisted Verification Represented as Independent Human Auditing
- **Defect:** Prior documentation blurred automated script execution, static checks, and gate evaluations with independent editorial sign-off.
- **Finding:** Constitution Article XI strictly requires genuine human professionals to review and approve each of the seven review phases. Automated routines cannot grant editorial approvals.
- **Remediation:**
  1. Clarified across all mission documents that automated checks are internal diagnostics only.
  2. Left Gate 11 (`gold_standard_review`) and Gate 13 (`editorial_release_hold`) active and unpassed.
  3. Structured the human handoff packet with clear assignments for authorized human roles.

---

## 4. Publication Gate Evaluation

When [`validateStoryForPublication`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/publication-gate.ts) is evaluated against [`DELHI_GREEN_CRACKER_STORY`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/drafts/delhi-green-crackers.ts):

| Gate Check | Evaluation Name | Result | Operational Reason |
|:---:|:---|:---:|:---|
| **01** | `status_eligible` | **PASSED** | Story status `'review'` is eligible for publication gate |
| **02** | `has_title` | **PASSED** | Story title is present and non-empty |
| **03** | `has_summary` | **PASSED** | Story summary is present and non-empty |
| **04** | `has_content` | **PASSED** | Story contains 28 structured content blocks |
| **05** | `has_sources` | **PASSED** | Story cites 12 verified sources |
| **06** | `has_claims` | **PASSED** | Story defines 20 material claims |
| **07** | `claims_verified` | **PASSED** | All 20 claims verified with primary/secondary citations |
| **08** | `has_published_at` | **BLOCKED** | Standalone review draft has `publishedAt: ''` (dynamically supplied upon canonical publication) |
| **09** | `not_archived` | **PASSED** | Publication status is `'scheduled'` (not archived/superseded) |
| **10** | `not_blocked` | **PASSED** | No administrative blockReason set |
| **11** | `gold_standard_review` | **BLOCKED** | **Mandatory Human Hold:** Missing 7-phase Gold Standard Review sign-off |
| **12** | `sources_not_retracted` | **PASSED** | Zero cited sources are retracted or disputed |
| **13** | `editorial_release_hold` | **BLOCKED** | **Mandatory Editorial Hold:** Release hold active in `lib/editorial/release-holds.ts` |
| **14** | `hero_media_quality` | **PASSED** | Registered in Verified Story Image Manifest with digest lock |
| **15** | `narrative_depth` | **PASSED** | 2,780 narrative words exceeds 1,800-word explainer minimum |
| **16** | `reading_time_consistency` | **PASSED** | 13 min declared equals 13 min calculated at 220 wpm (0% diff) |
| **17** | `supporting_media_approval` | **PASSED** | Supporting vector graphic verified and approved in manifest |
| **18** | `visual_intelligence_pipeline` | **PASSED** | Package includes key-numbers and comparison charts |

---

## 5. Recalculated Cryptographic Content Fingerprint

Following the corrections to reading time metadata and Source 1 classification:

$$\text{Canonical Content Fingerprint} = \mathbf{sha256:c9fab15e683a4a585f17127f90d860964d2f798bb4ef284d1e0451444138b06f}$$

This fingerprint binds the story's title, headline, slug, summary, author, category, hero image, alt text, answer summary, what is unknown, reporting type, tags, 28 blocks, 20 claims, 12 sources, 4 timeline events, 5 FAQs, and 1 chart into an immutable SHA-256 digest via [`computeStoryContentFingerprint`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/content-fingerprint.ts).

---

## 6. Audit Verdict

- **Automated Pre-Publication Gates:** 15 of 18 PASSED.
- **Intentional Fail-Closed Holds:** 3 checks BLOCKED (`has_published_at` on draft, `gold_standard_review`, `editorial_release_hold`).
- **Canonical Publication Evaluator:** Fails closed with HTTP 422 until human approval is recorded.
- **Final Classification:** `READY FOR HUMAN GOLD STANDARD REVIEW`.
