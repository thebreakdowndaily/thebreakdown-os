# The Breakdown OS — Concurrency & Idempotency Analysis (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Concurrency Audit  
**Governing Rule:** Race Condition Immunity & Idempotent Execution

---

## 1. Executive Summary

This forensic audit evaluates the platform's behavior under concurrent execution, retried requests, and cross-vertical race conditions across the intelligence, editorial, correction, and publication pipelines.

---

## 2. Cross-Vertical Race Condition Matrix

| Concurrency Scenario | Protection Level | Technical Mechanism in Code | Findings & Behavioral Analysis |
| :--- | :--- | :--- | :--- |
| **1. Reader submits twice (double click / network retry)** | **PROTECTED** | Distributed Rate Limiting (`features/rate-limiting/limiter.ts`) & deduplication | Successive submissions within milliseconds from the same IP are either throttled or recorded as distinct UUID rows without state corruption. |
| **2. Two editors resolve the same correction simultaneously** | **PARTIALLY PROTECTED** | Timestamp-based last-write-wins; Unique constraint on verification event | If both resolve, the status remains `resolved`. However, without optimistic concurrency control (OCC) version checking on `reader_corrections`, the second editor's explanation overwrites the first. |
| **3. Correction resolves while story changes** | **PROTECTED** | Story version snapshotting (`audit.story_versions`) | `public.corrections` captures `story_version_id` and the specific passage diff at resolution time. Even if the live story is revised later, historical errata remains accurate. |
| **4. Story republishes while correction resolves** | **PROTECTED** | Fail-closed publication gate & PostgreSQL transaction isolation | Pre-publication gate evaluates immutable story payload. Published errata table is independent of story publish state. |
| **5. Intelligence promotes the same signal twice** | **PROTECTED** | `NewsroomResearchBridge` deduplication check | `promoteSignalToInvestigationCase()` verifies whether an active workspace case already exists with the same source signal ID before inserting. |
| **6. Worker retries an intake event** | **PROTECTED** | Deterministic SHA-256 deduplication in `NewsroomIntelligenceCore` | Incoming observation hashes prevent duplicate signals from entering `newsroom.signals`. |
| **7. Publication retry occurs after partial failure** | **PROTECTED** | Idempotent publication gate & atomic version triggers | Re-running `validateStoryForPublication()` produces deterministic results; `trg_stories_archive` ensures snapshots are created once per version. |

---

## 3. Concurrency Recommendations for VS8

1. **Add OCC Version Check to Reader Correction Triage:**
   - Introduce an `optimistic_version` counter or require `expectedStatus` when mutating `public.reader_corrections`, preventing two editors from resolving the same submission concurrently without noticing the conflict.
2. **Idempotency Key on Intake API:**
   - Allow client to optionally supply an `Idempotency-Key` header on `POST /api/corrections/submit` to guarantee single-record creation on mobile network retries.
