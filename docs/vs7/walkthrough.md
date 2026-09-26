# The Breakdown OS — VS7 Walkthrough & User Guide

**Phase:** VS7 — Editorial Quality, Reader Corrections & Founding Publication  
**Date:** 2026-09-26  
**Status:** Feature Walkthrough  
**Audience:** Editorial Staff, Readers, Engineers

---

## 1. Overview of VS7 Reader & Editorial Journey

VS7 delivers continuous factual accountability to The Breakdown by operationalizing:
1. **Reader Error Reporting:** Readers can flag factual inaccuracies or citation errors directly on story pages.
2. **Staff Triage:** Editorial staff can review submissions, reject spam, and resolve verified errors.
3. **Public Errata Ledger:** When a correction is approved, it is committed to an immutable public projection (`/transparency/corrections`) and displayed on the affected story.
4. **Gold Standard Review Gate:** Pre-publication checks strictly enforce evidence density and audit completion.

---

## 2. Reader Journey: Reporting an Error

1. A reader encounters a story (e.g. `/story/the-partition-and-its-legacies`).
2. In the `ActionBar` at the top of the narrative, the reader clicks **"Report Error"**.
3. The `CorrectionSubmissionDrawer` slides out smoothly:
   - The reader selects the category (`Factual`, `Source Misattribution`, `Clarification`, `Historiographical`, or `Context Update`).
   - The reader provides the passage excerpt and explains the suggested correction.
   - Optionally, the reader includes a citation URL and confidential email.
4. Upon clicking **"Submit Correction Report"**:
   - The frontend dispatches `POST /api/corrections/submit`.
   - The endpoint checks rate limits (max 5 requests per 10 minutes per IP) and validates inputs.
   - The submission is inserted into `public.reader_corrections` with status `received`.
   - The reader receives an immediate acknowledgment with a tracking UUID. Submitter email is kept private and never exposed.

---

## 3. Editorial Staff Journey: Triaging & Publishing Errata

1. Editorial staff query incoming submissions via `listReaderCorrections({ status: 'received' })`.
2. The verification bureau investigates the claim against primary sources.
3. The editor calls `triageReaderCorrection()`:
   - **If invalid/unsubstantiated:** The status is moved to `rejected` with an internal triage note.
   - **If verified accurate:** The status is moved to `resolved`, accompanied by a `publishedCorrection` payload detailing `previousWording`, `correctedWording`, and `explanation`.
4. This action atomically creates an append-only record in `public.corrections`.

---

## 4. Public Accountability Journey: The Errata Ledger

1. Readers can visit `/transparency/corrections` directly from the global site footer ("Corrections & Errata").
2. The page renders:
   - Institutional Corrections Policy summary (Article XIII of the Editorial Constitution).
   - Chronological ledger of all published corrections with category badges, previous wording (strikethrough), corrected wording, and direct links to the affected stories.
3. If an individual story has published corrections, `CorrectionNoticeBanner` renders prominently at the top of the narrative, informing readers of what was corrected and when.

---

## 5. Editorial Publishing Gate: Gate 11 Quality Check

Before a story transition to `published`:
- `validateStoryForPublication()` runs all 11 gate checks.
- Gate 11 (`gold_standard_review`) checks:
  - If a formal `goldStandardAudit` record exists: all 7 phases must be marked `passed` with zero blocking issues.
  - If no formal audit record is provided: foundational evidence density is verified (sources >= 1, claims >= 1).
- If any check fails, publication is blocked fail-closed with clear remediation reasons.
