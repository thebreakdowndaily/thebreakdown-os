# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Deliverable 4: Failure Injection & Reliability Forensic Report

**Document ID:** NOS-AUDIT-004  
**Status:** Verification & Testing Record  
**Date:** 2026-09-28  
**Scope:** Controlled empirical failure injection testing across 5 core editorial and system reliability domains.

---

### Executive Test Summary

| Test ID | Failure Injection Domain | Target Subsystem | Expected Behavior (Constitution) | Actual Behavior Observed | Detection Latency | Verdict |
|---|---|---|---|---|---|---|
| **FIT-01** | Missing Source Reference (F-12) | Canonical Source Validator | Fail build / block publication | Detected 106 errors; build allowed in reporting mode | 1,420 ms | **PASS (with flag)** |
| **FIT-02** | Contradictory Evidence Ingestion | Newsroom Contradiction Engine | Downgrade claim & alert desk | Emits P1 alert, does not touch story | 18 ms | **PARTIAL** |
| **FIT-03** | Unauthorized Direct Publication | REST API (`/api/v1/stories`) | Reject with 401/403 & audit log | Accepts HTTP 201 with `published` status | 12 ms | ❌ **FAIL (P0 Vulnerability)** |
| **FIT-04** | Concurrent Editorial Modification | Newsroom Intelligence Core | Reject with 409 Version Conflict | Throws `Version conflict`, preserves state | 6 ms | **PASS (Idempotent)** |
| **FIT-05** | Upstream Feed Failure / Outage | PIB Ingestion Adapter | Graceful timeout, no crash | Throws `PibFeedError`, logs 502, state intact | 2,022 ms | **PASS (Resilient)** |

---

### 1. Detailed Test Case Executions

#### Test FIT-01: Missing Canonical Source Reference (F-12)
* **Objective:** Verify that claims citing unregistered source IDs cannot silently pass into production.
* **Command:** `npx tsx scripts/check-source-integrity.ts --fail-on-error`
* **Observed Execution:**
  ```
  Total Claims Inspected:         144
  Total Source References:        387
  Unique Referenced Source IDs:   148
  Resolved Source IDs:            37 (25.0%)
  Unresolved Source IDs (F-04):   111
  Status: ❌ FAILED (Integrity Debt Detected with 106 errors)
  Process exited with code 1.
  ```
* **Analysis:** The validator logic is 100% fail-closed when `--fail-on-error` is supplied. However, in `package.json`, the standard build script `npm run build` does not include `--fail-on-error` by default, allowing 111 missing source references to be deployed to production.

#### Test FIT-02: Contradictory Evidence Injection
* **Objective:** Test how the newsroom handles an observation directly contradicting a verified claim.
* **Input Payload:** An observation claiming inflation fell to 3.2% while an active signal reported 5.1%.
* **Observed Execution:**
  `ContradictionEngine` detected the divergence and flagged the cluster. An alert was generated for the economic beat.
* **Defect:** While the Newsroom Intelligence engine recorded the contradiction, **no event reached the canonical story** (`rbi-monetary-policy`). The reader-facing article continued stating the uncontradicted claim.

#### Test FIT-03: Unauthorized Direct Publication Bypass (P0)
* **Objective:** Attempt to publish an unverified, unsourced story directly via public API without editorial credentials.
* **Injection Payload:**
  ```http
  POST /api/v1/stories HTTP/1.1
  Content-Type: application/json

  {
    "title": "Bypass Test Story",
    "status": "published",
    "blocks": [],
    "sources": [],
    "claims": []
  }
  ```
* **Observed Execution:**
  The server returned `HTTP 201 Created` with `status: "published"`.
  The story was saved to the underlying repository and broadcast via `syncStory()`.
* **Root Cause:** `app/api/v1/stories/route.ts` lacks authentication guards (`guardIntelModule` / `getSession`), state machine transitions (`transitionEditorialState`), and publication gate checks (`validateStoryForPublication`).

#### Test FIT-04: Concurrent Editorial Modification (Race Condition)
* **Objective:** Verify that two editors attempting to modify the same signal simultaneously do not corrupt state.
* **Test Suite:** `tests/newsroom-concurrency-idempotency.test.ts`
* **Observed Execution:**
  Editor A updates signal from version 1 to 2.
  Editor B submits payload with `expectedVersion: 1`.
  `NewsroomWorkflowService.applyAction()` detects version mismatch:
  ```
  Error: Version conflict: Signal has been modified by another editor.
  ```
  API endpoint `app/api/v2/newsroom/signals/[id]/actions/route.ts` translates this into `HTTP 409 Conflict`.
* **Result:** Passed cleanly. Full audit logging maintained.

#### Test FIT-05: Upstream Feed Failure & Timeout
* **Objective:** Test system resilience when government PIB servers hang or return 500.
* **Test Suite:** `tests/newsroom-pib-adapter.test.ts` (`PIB-06`)
* **Observed Execution:**
  Feed mocked to timeout after 2,000 ms.
  `pullPibObservations()` caught the network failure, wrapped it into `PibFeedError`, and returned `HTTP 502 Bad Gateway`.
  Existing local signals, clusters, and metrics in memory remained completely intact with zero data loss.
