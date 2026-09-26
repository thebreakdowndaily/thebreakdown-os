# The Breakdown OS — Architectural Gap Analysis (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Gap Analysis  
**Governing Documents:** AGENTS.md, Platform Beta Doctrine, Editorial Constitution v1.1

---

## 1. Executive Summary

Having completed forensic inspections across cross-vertical data flows, sources of truth, security boundaries, and concurrency scenarios, four genuine architectural gaps have been identified for the combined platform.

In alignment with the Platform Beta rules ("No new generic infrastructure; every commit must improve something a reader can notice within five minutes; 90% editorial / 10% engineering"), all four gaps focus on **cross-vertical integration, in-context reader trust, and operational closed-loop visibility**.

---

## 2. Demonstrated Gap Ledger

### GAP-VS8-01: In-Context Story Errata Banner Binding
- **Severity:** P1 (Essential for Reader Trust on Story Surfaces)
- **Current Behavior:** `components/story/CorrectionNoticeBanner.tsx` was created and unit-tested in VS7, and published errata are projected at `/transparency/corrections`. However, individual story pages (`/story/[slug]`) do not currently query `listPublishedCorrections(slug)` or render `CorrectionNoticeBanner` within the story narrative layout.
- **Evidence:** Inspection of `app/story/[slug]/page.tsx` reveals that `CorrectionNoticeBanner` is not imported or mounted.
- **User Impact:** Readers browsing a corrected story cannot see that the story has been updated or view the previous vs corrected text diff without manually checking the global transparency ledger.
- **Editorial Impact:** Violates the Editorial Constitution Article XIII mandate that corrections must appear prominently on the page itself.
- **Operational Impact:** None.
- **Security Impact:** None. Public corrections are already authorized for open reading.
- **Persistence Requirement:** None (`MIGRATIONS = 0`). Uses existing `public.corrections`.
- **Existing Subsystem:** `app/story/[slug]/page.tsx` and `components/rxs/StoryShell.tsx`.
- **Extension Sufficiency:** Directly extending `app/story/[slug]/page.tsx` to pass `publishedCorrections` to `CorrectionNoticeBanner` completely resolves the gap.

---

### GAP-VS8-02: Operational Telemetry & Pipeline Health Integration for Corrections
- **Severity:** P1 (Essential for Operational Visibility in Mission Control)
- **Current Behavior:** `NewsroomPipelineHealthAggregator` (`lib/operations/pipeline-health.ts`) evaluates 10 pipeline stages, but Stage 7 (VERIFICATION) and Stage 9 (READER) report static or incomplete values. It does not sample `public.reader_corrections` queue depth (pending `received` submissions), triage backlog, or published errata volume.
- **Evidence:** Lines 184–225 of `lib/operations/pipeline-health.ts` show Stage 9 (READER) returning hardcoded `queueDepth: 0` and `latencyMs: 180` without querying the corrections service.
- **User Impact:** Operators in `/operations` and Mission Control cannot detect if the reader correction queue is backlogged, failing, or overwhelmed by spam.
- **Editorial Impact:** Editors cannot monitor triage queue velocity from the operational overview.
- **Operational Impact:** High. Creates an operational blind spot for incoming reader feedback.
- **Security Impact:** None. Telemetry aggregates non-identifying counts.
- **Persistence Requirement:** None (`MIGRATIONS = 0`). Queries existing memory store or database counts.
- **Existing Subsystem:** `lib/operations/pipeline-health.ts` and `services/editorial/corrections-service.ts`.
- **Extension Sufficiency:** Adding a `getCorrectionsHealthMetrics()` query into `NewsroomPipelineHealthAggregator` completely resolves the blind spot.

---

### GAP-VS8-03: Reader Correction Feedback Signal to Newsroom Intelligence
- **Severity:** P2 (High Value for Closed-Loop Intelligence)
- **Current Behavior:** Reader correction submissions are isolated in `public.reader_corrections`. When a reader flags a breaking factual inaccuracy or regulatory update, the intelligence desk receives no automated notification or signal.
- **Evidence:** `submitReaderCorrection()` in `services/editorial/corrections-service.ts` writes to storage, but emits zero events to `eventBus` or `NewsroomIntelligenceCore`.
- **User Impact:** Slower newsroom reaction to reader-submitted factual leads.
- **Editorial Impact:** Editorial intelligence does not benefit from crowdsourced reader expertise.
- **Operational Impact:** Low.
- **Security Impact:** Must sanitize reader inputs before signal clustering to prevent prompt injection.
- **Persistence Requirement:** None (`MIGRATIONS = 0`). Reuses existing `newsroom.signals`.
- **Existing Subsystem:** `eventBus` and `NewsroomIntelligenceCore.ingestObservation()`.
- **Extension Sufficiency:** Emitting an optional `correction.submitted` event into `eventBus` for intelligence observation cleanly closes the loop.

---

### GAP-VS8-04: Automated Claim-Level Verification Handoff
- **Severity:** P2 (Quality & Traceability Enhancement)
- **Current Behavior:** Reader corrections can specify a `claimId`, but the staff triage resolution does not automatically link to `editorial.claims` or create a `verification_event`. Staff must manually cross-reference the claim registry.
- **Evidence:** `services/editorial/corrections-service.ts` allows optional `claimId`, but leaves `verification_event_id` null in `public.corrections`.
- **User Impact:** None directly; improves turnaround time.
- **Editorial Impact:** Strengthens claim-evidence traceability.
- **Operational Impact:** None.
- **Security Impact:** Preserves staff-only verification authority.
- **Persistence Requirement:** None (`MIGRATIONS = 0`). Schema 013 already provisioned `verification_event_id` and `claim_id`.
- **Existing Subsystem:** `services/editorial/corrections-service.ts` and `lib/knowledge/source-validator.ts`.
- **Extension Sufficiency:** Directly extending `triageReaderCorrection` to bind to `editorial.claims` resolves the gap.

---

## 3. Prioritized Gap Matrix

| Gap ID | Title | Severity | 5-Minute Reader Noticeable? | Requires Migration? | Implementation Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-VS8-01** | In-Context Story Errata Banner | **P1** | **YES** (Banner visible on corrected stories) | **NO** (0 migrations) | Low |
| **GAP-VS8-02** | Operational Telemetry for Corrections | **P1** | **YES** (Live health metrics in Mission Control) | **NO** (0 migrations) | Low |
| **GAP-VS8-03** | Correction Intelligence Feedback Loop | **P2** | Indirect (Faster reporting on breaking errors) | **NO** (0 migrations) | Medium |
| **GAP-VS8-04** | Claim-Level Verification Handoff | **P2** | Indirect (Stronger audit traceability) | **NO** (0 migrations) | Low |
