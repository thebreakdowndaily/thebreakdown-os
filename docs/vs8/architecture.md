# The Breakdown OS — VS8 Target Architecture Specification

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Architecture Specification  
**Governing Documents:** AGENTS.md, Editorial Constitution v1.1, CTO Directive v2.0

---

## 1. Scope & Core Objective

**Target Vertical Slice:**  
`VS8 — Certified Platform Integration & Closed-Loop Operations`

**Objective:**  
Connect the reader corrections subsystem (VS7) into live in-context story narrative surfaces and the operational control plane (VS6), while enabling optional asynchronous signal feedback into newsroom intelligence (VS5), with **ZERO** new database migrations and **ZERO** weakening of certified editorial or operational boundaries.

---

## 2. Target Architectural Boundary Definition

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       VS8 TARGET ARCHITECTURAL BOUNDARY                 │
│                                                                         │
│  [ VS7 Reader Product Surface ]          [ VS6 Operational Plane ]      │
│  ┌─────────────────────────────┐        ┌────────────────────────────┐  │
│  │ StoryPage (/story/[slug])   │        │ Newsroom Pipeline Health   │  │
│  │  - CorrectionNoticeBanner   │        │  - Stage 7: Verification   │  │
│  │  - In-Context Wording Diff  │        │  - Stage 9: Reader Queue   │  │
│  └──────────────┬──────────────┘        └─────────────▲──────────────┘  │
│                 │                                     │                 │
│                 ▼                                     │ (Reads Queue)   │
│  ┌─────────────────────────────┐                      │                 │
│  │ services/editorial/         │                      │                 │
│  │ corrections-service.ts      │──────────────────────┘                 │
│  │  - listPublishedCorrections │                                        │
│  │  - getCorrectionsHealth     │──────────┐                             │
│  └──────────────┬──────────────┘          │                             │
│                 │                         │ (Emits non-blocking event)  │
│                 │                         ▼                             │
│                 │               ┌───────────────────┐                   │
│                 │               │ lib/events/       │                   │
│                 │               │ eventBus          │                   │
│                 │               └─────────┬─────────┘                   │
│                 │                         │                             │
│                 ▼                         ▼                             │
│  [ System of Record (Mig 013) ] [ VS5 Newsroom Intelligence Desk ]      │
│  ┌─────────────────────────────┐        ┌────────────────────────────┐  │
│  │ public.reader_corrections   │        │ NewsroomIntelligenceCore   │  │
│  │ public.corrections          │        │  - Observes reader leads   │  │
│  └─────────────────────────────┘        └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Explicit Boundary Specification

### 3.1. What VS8 Owns
1. **In-Context Story Errata Surface:** Integration in `app/story/[slug]/page.tsx` and `components/rxs/StoryShell.tsx` rendering `CorrectionNoticeBanner` when published errata exist for the requested story.
2. **Corrections Telemetry Provider:** Health measurement logic in `services/editorial/corrections-service.ts` exposing `getCorrectionsHealthMetrics()`.
3. **Pipeline Health Aggregator Extension:** Real sampling in `lib/operations/pipeline-health.ts` for Stage 7 (Verification backlog) and Stage 9 (Reader correction queue depth and resolution latency).
4. **Asynchronous Newsroom Feedback Event:** Safe emission of `correction.submitted` on `eventBus` (stripped of submitter PII).
5. **Dedicated Integration Suite:** `tests/vs8-cross-vertical-integration.test.ts`.

---

### 3.2. What VS8 Reads
- `public.corrections` and `public.reader_corrections` (for errata banner and queue depth).
- `public.stories` and canonical models.
- Operational thresholds from `lib/observability/intelligence-engine.ts`.

---

### 3.3. What VS8 Writes
- Telemetry metrics to `NewsroomPipelineHealthAggregator`.
- In-memory event notifications to `eventBus`.
- Zero new database tables or schema mutations.

---

### 3.4. What VS8 Observes
- Correction intake velocity, triage backlog, and resolution latency.
- Story read resolution paths (`canonical` vs `legacy`).

---

### 3.5. What VS8 Depends On
- **VS5:** `eventBus` for loose event dispatch.
- **VS6:** `NewsroomPipelineHealthAggregator` for operational visibility.
- **VS7:** `services/editorial/corrections-service.ts` and `components/story/CorrectionNoticeBanner.tsx`.

---

### 3.6. What VS8 Must NEVER Control
- **NEVER** acquire editorial authority from intelligence or operational metrics.
- **NEVER** bypass fail-closed publication gates (`validateStoryForPublication`).
- **NEVER** expose submitter emails (`submitter_email`) through public banners, page props, or operational telemetry.
- **NEVER** create database migration `017_*.sql`.
- **NEVER** permit reader corrections to directly alter story body content without staff editorial review.
