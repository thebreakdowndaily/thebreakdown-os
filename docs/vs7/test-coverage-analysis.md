# The Breakdown OS — Test Coverage & Invariant Audit (VS7)

**Phase:** VS7 Architecture Reconnaissance & Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Invariant Audit  
**Governing Rule:** Definition of Done & Test-Driven Verification

---

## 1. Verified Baseline Test Coverage

The platform's testing foundation is verified across five distinct test runners:

| Test Harness | Target Scope | Current Baseline Result | Passing Rate |
| :--- | :--- | :--- | :--- |
| **Vitest** | Unit, domain, service, and integration tests | 65 test files / 746 tests | **100% (746/746)** |
| **Canonical TSX** | End-to-end component & story rendering | 26 test suites | **100% (26/26)** |
| **Security Suite** | RLS enforcement, auth gates, route protection | 1,342 assertions | **100% (1,342/1,342)** |
| **Migration & DB** | Schema validation, triggers, constraints, RLS | 16 migrations / 33 DB tests | **100% (33/33)** |
| **Production Smoke**| Live deployment verification on `thebreakdown.in` | 25 live checks | **100% (25/25)** |

---

## 2. Invariant Audit for Candidate VS7 Scope

When VS7 is eventually implemented, the following test invariants must be established to ensure continuous regression protection:

### 2.1. Invariant Group A: Reader Corrections Pipeline
1. **INV-CORR-01 (Public Submission):** Valid reader submission with passage excerpt and suggestion succeeds and returns an acknowledgment ID with status `received`.
2. **INV-CORR-02 (Input Validation Gate):** Submissions with empty excerpt, empty suggestion, or malformed email/URL are rejected with 400 Bad Request.
3. **INV-CORR-03 (Rate Limiting Protection):** Repeated submissions exceeding the configured threshold (e.g. >5 in 10 minutes) receive HTTP 429 Too Many Requests.
4. **INV-CORR-04 (RLS Submitter Privacy):** Direct SQL `SELECT * FROM public.reader_corrections` executed by the `anon` or unauthenticated role returns 0 rows (denied by RLS).
5. **INV-CORR-05 (Staff Triage Mutation):** Only authenticated staff with `research_role` in `('editor', 'reviewer', 'administrator')` can mutate status to `in_review`, `resolved`, or `rejected`.
6. **INV-CORR-06 (Append-Only Errata):** Records in `public.corrections` cannot be deleted by any role, preserving historical audit integrity.

### 2.2. Invariant Group B: Automated Gold Standard Review
1. **INV-GSR-01 (Phase Scoring Computation):** The 7-phase audit engine accurately aggregates phase scores according to Article XI weights.
2. **INV-GSR-02 (Density Threshold Rejection):** Story packages with fewer than 50 claims, 120 evidence items, or 100 sources fail the Knowledge Density Audit (Phase 6).
3. **INV-GSR-03 (Publication Gate Integration):** `evaluatePublicationSafety` rejects stories whose Gold Standard overall score is below 80% or where Defensibility Audit (Phase 7) fails.
4. **INV-GSR-04 (Deterministic Verification):** Running the Gold Standard Review twice on the same immutable story payload produces identical scores and recommendation results.

### 2.3. Invariant Group C: Founding Publication (Chapter 1) Integrity
1. **INV-CHAP-01 (Claim-Evidence Traceability):** 100% of claims rendered in Chapter 1 resolve to verified primary/academic sources.
2. **INV-CHAP-02 (Reader Mode Parity):** All 5 reader modes (Standard, Compact, Deep Context, Audio, Dyslexic) render complete content without runtime errors or DOM hydration mismatches.
3. **INV-CHAP-03 (Chart Contract Compliance):** All embedded charts strictly adhere to the SvgChartBlock visual data contract.

---

## 3. Dedicated VS7 Test Suite Plan

To validate VS7 upon future implementation without disturbing existing suites, a dedicated test file will be created:
- `tests/vs7-editorial-quality-and-corrections.test.ts`
- Target assertions: Minimum 15 dedicated unit & integration tests covering INV-CORR-01 through INV-GSR-04.
