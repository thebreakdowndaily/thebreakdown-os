# The Breakdown OS — Architecture Options Analysis (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Options Analysis  
**Governing Documents:** AGENTS.md, Platform Beta Doctrine

---

## 1. Executive Summary

This document evaluates architectural options for resolving the four demonstrated cross-vertical gaps identified in `docs/vs8/gap-analysis.md`. In compliance with contract instructions, factual tradeoffs are provided across three standardized options (A: Extend existing system, B: Isolated new subsystem, C: Defer) without arbitrary ranking.

---

## 2. Options Analysis by Gap

### 2.1. GAP-VS8-01: In-Context Story Errata Banner Binding

#### Option A: Extend Existing System (Mount in `StoryPage` / `StoryShell`)
- **Code Impact:** Minimal (<50 LOC). Mount `CorrectionNoticeBanner` inside `app/story/[slug]/page.tsx` and pass `listPublishedCorrections(slug)`.
- **Database Impact:** None. Reads existing `public.corrections`.
- **Security Impact:** None. Reading published corrections is public by RLS design.
- **Failure Domain:** Isolated to story page rendering. Wrapped in React component boundaries.
- **Testing Impact:** Add 1-2 integration tests asserting banner presence when corrections exist.
- **Operational Impact:** None.
- **Editorial Impact:** Immediate fulfillment of Editorial Constitution Article XIII in-context transparency mandate.
- **Migration Requirement:** `0` migrations.

#### Option B: Isolated New Subsystem (Independent Floating Notification Widget)
- **Code Impact:** High (~300 LOC). Standalone client-side polling widget querying `/api/corrections/active`.
- **Database Impact:** None.
- **Security Impact:** Increases client polling surface; potential CDN cache invalidation complexity.
- **Failure Domain:** Global client bundle.
- **Testing Impact:** Requires mocking timers and client polling.
- **Operational Impact:** Increases edge request volume.
- **Editorial Impact:** Creates visual clutter outside canonical reading modes.
- **Migration Requirement:** `0` migrations.

#### Option C: Defer (Keep Corrections at `/transparency/corrections` Only)
- **Code Impact:** Zero.
- **Database Impact:** None.
- **Security Impact:** None.
- **Failure Domain:** None.
- **Testing Impact:** None.
- **Operational Impact:** None.
- **Editorial Impact:** Continued non-compliance with Article XIII requiring in-context notices on updated stories.
- **Migration Requirement:** `0` migrations.

---

### 2.2. GAP-VS8-02: Operational Telemetry & Pipeline Health Integration

#### Option A: Extend Existing System (Integrate into `NewsroomPipelineHealthAggregator`)
- **Code Impact:** Low (~40 LOC). Add `getCorrectionsHealthMetrics()` into `lib/operations/pipeline-health.ts` for Stage 9 (READER).
- **Database Impact:** None. Lightweight count query on `public.reader_corrections`.
- **Security Impact:** None. Aggregates internal numbers without PII exposure.
- **Failure Domain:** Isolated to `/operations` and health endpoint. Fail-soft to 'UNKNOWN' if query fails.
- **Testing Impact:** Update `tests/vs6-operations-control-plane.test.ts` to assert real stage 9 queue depth.
- **Operational Impact:** Real-time visibility into reader correction backlog in Mission Control.
- **Editorial Impact:** Editors can identify triage backlogs immediately.
- **Migration Requirement:** `0` migrations.

#### Option B: Isolated New Subsystem (Dedicated Corrections Monitoring Service)
- **Code Impact:** High (~250 LOC). New service `services/operations/corrections-monitor.ts` with dedicated dashboard route `/operations/corrections`.
- **Database Impact:** Potential separate metrics table.
- **Security Impact:** Adds an extra administrative endpoint to protect.
- **Failure Domain:** Standalone monitoring service.
- **Testing Impact:** New dedicated test suite.
- **Operational Impact:** Fragments operations across multiple dashboards.
- **Editorial Impact:** High cognitive overhead for operators.
- **Migration Requirement:** May tempt creating a new migration.

#### Option C: Defer (Keep Static Stage 9 Metrics)
- **Code Impact:** Zero.
- **Database Impact:** None.
- **Security Impact:** None.
- **Failure Domain:** None.
- **Testing Impact:** None.
- **Operational Impact:** Operations remains blind to reader feedback velocity and backlog.
- **Editorial Impact:** Triage bottlenecks remain undiscovered.
- **Migration Requirement:** `0` migrations.

---

### 2.3. GAP-VS8-03: Reader Correction Feedback Loop to Newsroom Intelligence

#### Option A: Extend Existing System (Emit Event to `eventBus`)
- **Code Impact:** Low (~20 LOC). Emit `correction.submitted` to `eventBus` inside `submitReaderCorrection`.
- **Database Impact:** None.
- **Security Impact:** Must strip email and sanitize text before passing to intelligence clustering.
- **Failure Domain:** Asynchronous event handler; failures do not block reader submission response.
- **Testing Impact:** Add event bus spy test in VS7 suite.
- **Operational Impact:** Emits useful operational signals for newsroom velocity tracking.
- **Editorial Impact:** Intelligence desk gains immediate awareness of reader factual challenges.
- **Migration Requirement:** `0` migrations.

#### Option B: Isolated New Subsystem (Direct RPC from Webhook to Intelligence Pipeline)
- **Code Impact:** High (~200 LOC). Database trigger on `public.reader_corrections` invoking Supabase Edge Function to push directly into `newsroom.signals`.
- **Database Impact:** Requires database trigger.
- **Security Impact:** Tight coupling between public intake table and intelligence schema.
- **Failure Domain:** Database trigger failure can block reader submission.
- **Testing Impact:** Complex multi-schema integration test.
- **Operational Impact:** High risk of ingestion feedback loops.
- **Editorial Impact:** Potentially compromises intelligence authority boundary.
- **Migration Requirement:** Would require migration 017.

#### Option C: Defer
- **Code Impact:** Zero.
- **Database Impact:** None.
- **Security Impact:** None.
- **Failure Domain:** None.
- **Testing Impact:** None.
- **Operational Impact:** None.
- **Editorial Impact:** Reader submissions remain isolated in the correction queue.
- **Migration Requirement:** `0` migrations.

---

## 3. Factual Tradeoff Summary

| Gap | Option A Tradeoff | Option B Tradeoff | Option C Tradeoff |
| :--- | :--- | :--- | :--- |
| **GAP-VS8-01 (Banner)** | High impact, low code, 0 migrations | Excessive code, polling overhead | Violates Article XIII transparency |
| **GAP-VS8-02 (Health)** | Closes blind spot, fail-soft, 0 migrations | Parallel dashboard, fragmentation | Blind to reader correction queue |
| **GAP-VS8-03 (Feedback)**| Loose event coupling, 0 migrations | Trigger complexity, migration risk | Siloed correction queue |
| **GAP-VS8-04 (Handoff)** | Explicit foreign key, 0 migrations | Automated auto-verification risk | Manual staff overhead |
