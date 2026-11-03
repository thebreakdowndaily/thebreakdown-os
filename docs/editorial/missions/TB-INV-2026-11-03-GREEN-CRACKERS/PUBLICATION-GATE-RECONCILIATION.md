# Publication Gate Reconciliation & Arithmetic Audit

**Mission ID:** `TB-INV-2026-11-03-GREEN-CRACKERS`  
**Story Slug:** `delhi-green-cracker-enforcement-diwali-2026`  
**Content Fingerprint:** `sha256:c9fab15e683a4a585f17127f90d860964d2f798bb4ef284d1e0451444138b06f`  
**Evaluator Implementation:** [`lib/editorial/publication-gate.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/publication-gate.ts) & [`lib/editorial/canonical-publication.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/canonical-publication.ts)  
**Audit Date:** 2026-11-03  
**Auditor:** Senior Publication Engineer  

---

## 1. Executive Summary & Evaluation Clarification

Under Level 1 Editorial Constitution v1.1 Article XI and AGENTS.md, publication gate scores must never be reported loosely or without specifying the exact evaluation context.

There are **two distinct gate evaluation contexts**:
1. **Evaluation A: Standalone Review-Draft Evaluation**  
   Evaluates the raw saved draft in [`lib/editorial/drafts/delhi-green-crackers.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/drafts/delhi-green-crackers.ts). Because the story is in review stage and has not been assigned a public release timestamp (`publishedAt: ''`), Gate 8 fails alongside the two mandatory human governance holds.  
   **Result:** **15 Passed, 3 Blocked (Total: 18 checks)**.
2. **Evaluation B: Authorised Publication-Candidate Evaluation**  
   Evaluates the candidate during the canonical publication pipeline ([`evaluatePublicationContract`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/canonical-publication.ts)), where the workflow dynamically supplies the effective publication timestamp (`publishedAtCandidate`) to be stamped upon release. In this context, Gate 8 passes, and only the two genuine human release holds block publication.  
   **Result:** **16 Passed, 2 Blocked (Total: 18 checks)**.

---

## 2. Gate-by-Gate Ledger Comparison

| Gate | Check Name | Evaluation A: Standalone Review Draft | Evaluation B: Publication Candidate | Reason for Result |
|:---:|:---|:---:|:---:|:---|
| **01** | `status_eligible` | **PASSED** | **PASSED** | Story status `'review'` is eligible for gate evaluation |
| **02** | `has_title` | **PASSED** | **PASSED** | Title present: *"Delhi's Green-Cracker Test Is Now an Enforcement Test"* |
| **03** | `has_summary` | **PASSED** | **PASSED** | Summary present and verified |
| **04** | `has_content` | **PASSED** | **PASSED** | Story contains 28 content blocks |
| **05** | `has_sources` | **PASSED** | **PASSED** | Story cites 12 verified sources |
| **06** | `has_claims` | **PASSED** | **PASSED** | Story defines 20 material claims |
| **07** | `claims_verified` | **PASSED** | **PASSED** | All 20 claims verified with supporting evidence |
| **08** | `has_published_at` | **BLOCKED** | **PASSED** | **A:** `publishedAt: ''` on review draft.<br>**B:** Dynamic publication timestamp supplied by canonical workflow. |
| **09** | `not_archived` | **PASSED** | **PASSED** | Publication status is `'scheduled'` (not archived/superseded) |
| **10** | `not_blocked` | **PASSED** | **PASSED** | Story is not administratively blocked |
| **11** | `gold_standard_review` | **BLOCKED** | **BLOCKED** | **Mandatory Human Hold:** Missing 7-phase Gold Standard Review sign-off |
| **12** | `sources_not_retracted` | **PASSED** | **PASSED** | Zero cited sources are retracted |
| **13** | `editorial_release_hold` | **BLOCKED** | **BLOCKED** | **Mandatory Editorial Hold:** Release hold active in `lib/editorial/release-holds.ts` |
| **14** | `hero_media_quality` | **PASSED** | **PASSED** | Hero image verified and locked in Verified Story Image Manifest |
| **15** | `narrative_depth` | **PASSED** | **PASSED** | Narrative word count of 2,780 words exceeds 1,800-word explainer minimum |
| **16** | `reading_time_consistency` | **PASSED** | **PASSED** | Declared 13 min consistent with calculated 13 min at 220 wpm (0% diff) |
| **17** | `supporting_media_approval` | **PASSED** | **PASSED** | Supporting vector graphic verified and approved in manifest |
| **18** | `visual_intelligence_pipeline` | **PASSED** | **PASSED** | Story includes 2 supporting visual blocks (key-numbers, comparison) |

---

## 3. Arithmetic Summary

### Summary A: Standalone Review Draft
- **Total Checks:** 18
- **Passed Checks:** 15 (83.3%)
- **Blocked Checks:** 3 (16.7%)
  1. `has_published_at` (Gate 08) — Standalone draft has no publication timestamp.
  2. `gold_standard_review` (Gate 11) — Awaiting 7-phase human review.
  3. `editorial_release_hold` (Gate 13) — Awaiting Editor-in-Chief hold release.
- **Overall Result:** `passed: false` (Fails Closed).

### Summary B: Authorised Publication Candidate
- **Total Checks:** 18
- **Passed Checks:** 16 (88.9%)
- **Blocked Checks:** 2 (11.1%)
  1. `gold_standard_review` (Gate 11) — Awaiting 7-phase human review.
  2. `editorial_release_hold` (Gate 13) — Awaiting Editor-in-Chief hold release.
- **Overall Result:** `passed: false` (Fails Closed with HTTP 422).

---

## 4. Operational Invariant Verified

The platform correctly distinguishes between a passive draft sitting on disk and an authorized publication transaction. 

Neither evaluation permits release. Under both paths, publication is **100% blocked** until real authorized humans complete the required sign-offs.
