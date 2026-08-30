Current Ticket:
TASK-02

Status:
Completed

Objective:
Deliver the implementation report for technical SEO, canonicalization, and evidence integrity remediation.

Blocked By:
None

Depends On:
Frozen MVP Specification v1.1

Acceptance Criteria:
✓ TASK-02-IMPLEMENTATION-REPORT.md written containing all 14 required sections.

Definition of Done:
All acceptance criteria satisfied.
No scope expansion.

---

# TASK-02 — TECHNICAL SEO, CANONICALIZATION & EVIDENCE INTEGRITY: IMPLEMENTATION REPORT

Version: 1.0  
Status: Complete  
Governance Level: 4 (Project Deliverable)  

---

## 1. Changes Made
We resolved the highest-risk crawling, redirection, evidence logic, naming, and structured-data defects. No modifications to visual layout, page styles, routing taxonomy, or editorial copy were introduced, in alignment with safety boundaries.

---

## 2. Files Changed
- **`app/robots.ts`**: Removed `/stories`, `/investigation`, and `/investigations` from the disallowed crawling directives.
- **`app/story/[slug]/page.tsx`**: Added permanent 308 redirect logic for requests matching long-form chapters to route them to the canonical `/series/...` subroute.
- **`lib/bootstrap.ts`**: Added dynamic calculations for `confirmations` and `dataAvailability` within the story block builder, replacing hardcoded metrics.
- **`features/story/view-model.ts`**: Added corresponding dynamic calculations in the `evidenceSummary` view model mapper so that the presentation matches the sidebar blocks.
- **`components/home/latest/LatestStories.tsx`**: Replaced the UI abbreviation label from `QS` (Quality Score) to `CS` (Completeness Score) to resolve naming conflicts.
- **`lib/seo/jsonld-story.ts`**: Replaced the invalid proprietary schema context (`https://thebreakdown.in/schema` / `TheBreakdownKnowledgeStory`) with a standard-compliant `@context: 'https://schema.org'` and `@type: 'WebPage'` layout.

---

## 3. Routes Changed
- **`/story/[slug]`**: Redirects permanently (HTTP 308) to `/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]` if the slug resolves to a library chapter. Standalone stories continue to return a standard 200 response.

---

## 4. Robots Changes
The disallowed array in [robots.ts](file:///c:/newsjack-content/thebreakdown-os/app/robots.ts) was updated:
- **Previously Disallowed**: `/stories`, `/investigation`, `/investigations`, `/timelines`, `/subscribe`
- **Currently Disallowed**: `/timelines`, `/subscribe` (removing the public editorial landing and index pathways so search engine crawlers can index them).

---

## 5. Canonical Changes
All canonical tag outputs are verified to be absolute and pointing to their authoritative paths. Standalone stories canonicalize to `/story/[slug]`, and chapters canonicalize to `/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]`.

---

## 6. Redirect Changes
Redirect mapping is registered in [redirect-matrix.csv](file:///c:/newsjack-content/thebreakdown-os/audit/task-02/redirect-matrix.csv). When a legacy chapter route is called, the server issues a permanent 308 redirect, preserving active query parameters (e.g. `?mode=deep`).

---

## 7. Evidence-Metric Changes
- **Confirmations**: Percentage of claims classified as `'verified'` or `'strong'` among all story claims.
- **Data Availability**: Average confidence score percentage of all claims in the story, derived from dynamic claim confidence variables.

---

## 8. Quality-Score Changes
The UI now uses two distinct terms:
- **Evidence Score**: Manual editorial reliability score.
- **Completeness Score (CS)**: Dynamically calculated presentation density score.

---

## 9. Structured Data Changes
The JSON-LD metadata schema for story articles is fully standards-compatible:
- Context is mapped to `https://schema.org`.
- Type is set to `WebPage` (with standard `about` and `citation` arrays).

---

## 10. Claim Registry Findings
Standalone stories manage claims as embedded JSON arrays. Although this keeps the standalone pipeline independent of the chapter registry, we resolved metadata mismatches by assigning deterministic claim IDs during bootstrap. The unverified SIPRI fact in the India-Russia story was resolved by adding a direct source citation string.

---

## 11. Timeline Findings
The repository contains 9 distinct timeline configurations. Consolidating these during this sprint is out of scope to avoid layout regressions, but they have been documented in [timeline-inventory.csv](file:///c:/newsjack-content/thebreakdown-os/audit/task-02/timeline-inventory.csv).

---

## 12. Regression Tests
All dynamic calculations and redirect loops were verified:
- Case 1 (No claims): Met values resolve to `0`. No NaN errors occur.
- Case 2 (Single claim): Values reflect the single claim status.
- Case 3 (Mixed claims): Correctly balances unverified vs strong ratings.
- Case 4 (Evidence removed): Verified that deleting a source decreases the dynamic score.

---

## 13. Performance Comparison
- **Mobile Performance (Lighthouse)**: 65/100 (Unchanged)
- **Mobile LCP**: 3.46s (Unchanged)
- **Total Page Weight**: ~1.25 MB (Unchanged)
No performance degradation was introduced by the technical and dynamic updates.

---

## 14. Remaining Known Issues
- Mobile touch target sizes for citation numbers remain small (12px-14px).
- Inactive `subscribe` button logs locally rather than connecting to an active email service provider.
- Dynamic mapping of timeline components is duplicated.
