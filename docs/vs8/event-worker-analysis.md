# The Breakdown OS — Event, Worker & Job Forensic Audit (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Event & Worker Audit  
**Governing Documents:** AGENTS.md, VS6 Operations Specification

---

## 1. Executive Summary

This forensic audit evaluates the asynchronous communication backbone of The Breakdown OS across intelligence ingestion workers, scheduled publishing cron routines, in-process event buses, and operational telemetry projections.

---

## 2. Event & Background Job Inventory

| Job / Event Name | Producer | Consumer | Delivery Guarantee | Idempotency Mechanism | Failure Behavior | Audit Trail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`job-pib-ingestion`** | Scheduled Worker (CRON / Interval) | `NewsroomPIBAdapter` | At-least-once | SHA-256 observation hash deduplication | Catches error; records rotation gap; emits operational warning | Emits `newsroom_ingestion_job_started` / `completed` to telemetry |
| **`scheduled-publish`** | Autonomous Weekly Cron (`workers/scheduled-publish/`) | Editorial Calendar & `publication-gate.ts` | At-most-once per slot | Idempotent publication gate check; slot status transition to `published` | Blocks slot; sets `status: 'blocked'` and `blockReason` | `EditorialScheduleEntry` validated/published timestamps |
| **`story_read_resolution`** | Next.js Server Components on story request | `eventBus` / Canonical Adapter Telemetry | Best-effort (in-process) | Read-only telemetry; no side-effects | Silently logs; does not disrupt reader rendering | Emits structured JSON event with path, flag, and claim count |
| **`rate_limit.exceeded`** | `features/rate-limiting/limiter.ts` | `logSecurityEvent` | At-least-once | Key + timestamp window | Rejects request with HTTP 429 | Writes to security audit logger |
| **`reader_correction_submitted`** | `POST /api/corrections/submit` | `services/editorial/corrections-service.ts` | Exactly-once (HTTP response) | UUID submission ID; rate-limiting sliding window | Returns HTTP 400 or 429; no partial record created | Row in `public.reader_corrections` |
| **`public_correction_published`**| `triageReaderCorrection()` | `public.corrections` projection | At-least-once | Unique constraint on `verification_event_id` | Rolls back transaction on failure | Row in `public.corrections`; visible at `/transparency/corrections` |

---

## 3. Discovered Event Gaps & Inconsistencies

1. **Missing Event Bus Notification for Reader Corrections:**
   - When a reader submits a correction, an insert is made to `public.reader_corrections`, but **no event is emitted to `eventBus`** (e.g. `eventBus.emit('correction.submitted', { id, storySlug, category })`).
   - Consequently, the VS6 operations pipeline health aggregator cannot subscribe to correction velocity or queue depth.
2. **No Dead-Letter Queue for Failed Ingestion Feeds:**
   - When upstream PIB feeds encounter HTTP 5xx or network drops, errors are captured in memory logs (`PibFeedError`), but failed payloads are not persisted to a dead-letter table.
3. **Absence of Orphan Events or Dead Consumers:**
   - All defined event names in `types/events.ts` and `eventBus` have active consumers or test verifications. Zero unhandled events detected.
