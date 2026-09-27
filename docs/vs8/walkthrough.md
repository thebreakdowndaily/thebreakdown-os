# The Breakdown OS — VS8 Operational Walkthrough

**Phase:** VS8 — Certified Platform Integration & Closed-Loop Operations  
**Date:** 2026-09-27  
**Audience:** Editorial Staff, Fact-Checkers, Newsroom Operators, and Platform Engineers  

---

## 1. Overview of Closed-Loop Corrections & Integration

Vertical Slice 8 completes the end-to-end feedback loop between public readers, newsroom intelligence, verification workflows, and operational observability.

```text
       Reader Submits Correction (POST /api/corrections/submit)
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   Private Intake Storage             Event Bus Emission
  (public.reader_corrections)       (correction:submitted)
            │                                     │
            ▼                                     ▼
   Staff Triage & Review                Newsroom Intelligence
  (triageReaderCorrection)              (Closed-Loop Signal)
            │
            ├─────────────────────────────────────┐
            ▼                                     ▼
   Claim Verification Handoff            Publish Errata Notice
  (handoffCorrectionToVerification)       (public.corrections)
            │                                     │
            ▼                                     ▼
   Canonical Verification                Story Errata Banner
   (MATCHED/AMBIGUOUS)                   (/story/[slug] Notice)
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
                   Mission Control Observability
                  (Pipeline Stages 7 & 9 Live)
```

---

## 2. Walkthrough Scenarios

### Scenario A: Reader Browsing a Corrected Story
1. The reader navigates to `/story/mgnrega-reform`.
2. The server-rendered page queries `listPublishedCorrections('mgnrega-reform')`.
3. If an errata notice exists, the `<CorrectionNoticeBanner />` is rendered prominently above the story narrative.
4. The banner displays:
   - Clear editorial categorization (e.g., Factual, Clarification).
   - Date and explanation of why the change was made.
   - Exact previous wording (with strike-through styling) alongside the corrected text.
5. If no published corrections exist, the banner component renders nothing (`null`), maintaining a clean reading experience.

### Scenario B: Reader Submits a Correction & Intelligence Ingestion
1. A reader encounters an outdated statutory date and submits a report via the on-page drawer or `POST /api/corrections/submit`.
2. The intake gate validates input schema and applies distributed rate-limiting (max 5 submissions per 10 minutes per IP).
3. The submission is persisted to `public.reader_corrections` with status `'received'`.
4. An event `correction:submitted` is emitted on the internal `eventBus`.
5. The newsroom intelligence engine observes the event without any submitter PII, allowing editorial desks to detect breaking factual trends.

### Scenario C: Staff Triage & Claim Verification Handoff
1. An authorized editor reviews the pending correction in the triage console.
2. The editor triggers `handoffCorrectionToVerification()`:
   - If the cited text matches an existing canonical claim in `editorial.claims`, the system marks the handoff as `MATCHED` and queues it for formal verification.
   - If the text is ambiguous, the system flags `AMBIGUOUS`, leaving the state unresolved until an editor reviews the specific claim.
   - **Crucially:** The reader submission does not mutate `claim.status` directly.
3. Provenance is attached: `sourceOfTrigger = 'reader_correction'`, `correctionId`, timestamps, and editor credentials.
4. If approved for publication, an errata notice is recorded in `public.corrections` with a link to the verification handoff ID.

### Scenario D: Mission Control Live Monitoring
1. Operators visit `/operations` or query `NewsroomPipelineHealthAggregator.evaluatePipelineHealth()`.
2. Stage 7 (VERIFICATION) reflects the combined volume of editorial review items and reader correction queue depth.
3. Stage 9 (READER) reflects real-time reader correction queue depth, published errata throughput, and the timestamp of the latest reader feedback.
4. If an upstream failure occurs, the stage reports `'UNKNOWN'` safely without crashing Mission Control.
