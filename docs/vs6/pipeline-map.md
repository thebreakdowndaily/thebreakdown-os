# VS6 — Newsroom Pipeline Health & Failure Domain Map

## Purpose

This document provides a comprehensive forensic map of the end-to-end newsroom pipeline across The Breakdown OS. It defines every stage from external signal ingestion to reader outcome observation, detailing inputs, outputs, ownership, storage, latency, failure modes, retry policies, and observability mechanisms.

---

## 1. End-to-End Newsroom Pipeline Flow

```text
       EXTERNAL SOURCES (PIB, Regulatory, Feeds)
                          ↓
      [1. Ingestion] ─── Source adapters, deduplication
                          ↓
      [2. Signal Processing] ─── Normalization, clustering, scoring
                          ↓
      [3. Intelligence] ─── Priority ranking, gap detection, alerting
                          ↓
      [4. Triage Desk] ─── Human review, watchlists, assignments
                          ↓
      [5. Research Bureau] ─── Case formation, evidence linking, gaps
                          ↓
      [6. Editorial Construction] ─── Narrative spine, chapter draft
                          ↓
      [7. Review & Verification] ─── Fact-check, Gold Standard audit
                          ↓
      [8. Publication Gate] ─── Atomic certification, snapshotting
                          ↓
      [9. Public Reader Experience] ─── Static/ISR rendering, evidence drawer
                          ↓
      [10. Outcomes & Analytics] ─── Telemetry, retention, impact metrics
```

---

## 2. Pipeline Stages Detailed Specification

### Stage 1: Ingestion
- **Input:** Upstream raw releases, feeds, primary regulatory notifications (e.g. PIB RSS/JSON endpoints).
- **Output:** Canonical `NewsroomObservation` objects (source tier `t1`/`t2`, cryptographic content hash, publication timestamp, extracted entities).
- **Owner:** Ingestion Workers (`services/intelligence/newsroom/adapters/pib.ts`, `lib/jobs/`).
- **Storage:** In-memory queue / transitively persisted into `newsroom.signals`.
- **Latency:** Scheduled polling batch every 5–15 minutes; execution latency < 2,500ms per batch.
- **Failure States:** Upstream HTTP 5xx, network timeout, rate limits, schema changes (`PibFeedError`).
- **Retry Behavior:** Exponential backoff with jitter (max 3 retries); circuit-breaker trips after 3 consecutive failures.
- **Observability:** Structured JSON logs (`newsroom_ingestion_job_started`, `newsroom_ingestion_job_completed`), items seen/new/duplicate/rejected metrics.

### Stage 2: Signal Processing & Clustering
- **Input:** Canonical `NewsroomObservation` stream.
- **Output:** Deduplicated `StoryCluster` objects and initial `NewsroomSignal` candidates.
- **Owner:** `NewsroomIntelligenceCore` Clustering Subsystem.
- **Storage:** Supabase PostgreSQL table `newsroom.signals` (fail-closed in production, memory fallback in test).
- **Latency:** Deterministic sub-second computation (< 50ms for 100 observations).
- **Failure States:** Natural key collision, invalid payload format, entity recognition failure.
- **Retry Behavior:** Idempotent re-clustering on demand; natural key hashing prevents duplicates.
- **Observability:** Event bus notifications, duplicate counter, observation cluster association tracking.

### Stage 3: Intelligence & Prioritization
- **Input:** Active `NewsroomSignal` clusters.
- **Output:** Multi-dimensional scoring (`relevance`, `importance`, `novelty`, `evidenceStrength`), `IntelligenceAlert` objects (P0/P1), and `CoverageGap` records.
- **Owner:** `NewsroomIntelligenceCore` Prioritization & Scoring Engine.
- **Storage:** `newsroom.signals` columns (`scores`, `lifecycle_state`, `priority`).
- **Latency:** Synchronous with signal processing (< 100ms).
- **Failure States:** Scoring calculation failure, entity vector missing, division by zero.
- **Retry Behavior:** Deterministic pure-function re-calculation over cluster attributes.
- **Observability:** `AlertsPanel` in Mission Control, Scorecard recall metrics (`coverageRecall`, `intelligenceRecall`).

### Stage 4: Newsroom Triage
- **Input:** Prioritized signals in `monitoring` or `alert` state; authenticated editor interactions.
- **Output:** Triage state transitions: `REVIEW`, `WATCH`, `DISMISS`, `PRIORITIZE`, `ASSIGN`, `PROMOTE_TO_RESEARCH`.
- **Owner:** Newsroom Desk / Duty Editors (`app/newsroom/page.tsx`, `WorkflowService`).
- **Storage:** `newsroom.signals` (optimistic concurrency control via `version` column).
- **Latency:** Human review cycle (minutes to hours); API execution < 250ms.
- **Failure States:** Optimistic concurrency conflict (OCC version mismatch), unauthorized user role (`IntelDenied`).
- **Retry Behavior:** UI reloads latest state upon OCC conflict and prompts editor to confirm delta.
- **Observability:** `newsroom_triage_action_applied` telemetry event, `NewsroomAuditService` log records.

### Stage 5: Research Bureau & Investigation
- **Input:** Promoted signals from triage desk (`PROMOTE_TO_RESEARCH`).
- **Output:** Investigated cases in `public.workspace_cases`, registered evidence in `public.workspace_evidence`, identified gaps in `public.research_gaps`.
- **Owner:** Research Bureau / Senior Researchers.
- **Storage:** PostgreSQL tables `workspace_cases`, `research_gaps` (migrations 004, 005, 010).
- **Latency:** Asynchronous editorial investigation (hours to weeks).
- **Failure States:** Missing source provenance, orphaned evidence records, incomplete primary citations.
- **Retry Behavior:** Research gap status tracking (`OPEN` → `IN_PROGRESS` → `RESOLVED`).
- **Observability:** `ResearchWatchPanel`, `EvidenceHealthPanel`, Workspace case metrics.

### Stage 6: Editorial Construction
- **Input:** Validated research cases, evidence graph links, primary sources.
- **Output:** Story narrative, chapter packages (`StoryPackage`), structured knowledge objects.
- **Owner:** Editorial Bureau (Lead Authors, Bureau Chiefs).
- **Storage:** PostgreSQL `public.stories`, `public.fixes`, JSON knowledge packages.
- **Latency:** Days of narrative drafting and structured object assembly.
- **Failure States:** Markdown rendering failure, missing claim-evidence linkage, broken cross-references.
- **Retry Behavior:** Version-controlled draft iterations (`StoryVersion`).
- **Observability:** `StoryPanel`, `EditorialDashboardProjection`, CMS draft states.

### Stage 7: Review, Fact-Check & Verification
- **Input:** Complete `StoryPackage` draft.
- **Output:** Verification status (`VERIFIED`, `DISPUTED`, `UNVERIFIED`), Gold Standard Audit Report (`GoldStandardAuditService`).
- **Owner:** Verification Bureau / Fact-Check Desk.
- **Storage:** Verification records, audit certification snapshots.
- **Latency:** Hours to days depending on claim density.
- **Failure States:** Evidence debt, uncorroborated primary claims, bias audit failure, missing counterarguments.
- **Retry Behavior:** Failed packages rejected back to Editorial Construction with remediation requirements.
- **Observability:** `VerificationPanel`, Gold Standard 7-Phase audit reports, Verification backlog count.

### Stage 8: Publication Gate
- **Input:** Fully audited `StoryPackage` approved by Verification Bureau.
- **Output:** Published Story with immutable publication timestamp, canonical slug, and public snapshot.
- **Owner:** Publication Authority Registry / Editor-in-Chief.
- **Storage:** `public.stories` (`status = 'published'`), static assets.
- **Latency:** Atomic transaction (< 500ms).
- **Failure States:** Gate criteria violation (missing evidence, draft status tampering, unauthorized actor).
- **Retry Behavior:** Fail-closed; transaction aborts; story remains in draft state.
- **Observability:** `story_published` telemetry event, platform security audit log, build provenance.

### Stage 9: Public Reader Experience
- **Input:** Public HTTP request to published route (e.g. `/story/[slug]`, `/trackers/[slug]`).
- **Output:** High-performance, accessible, WCAG-AA compliant Next.js reader UI with evidence drawers, claim cards, and primary source previews.
- **Owner:** Next.js Platform Frontend & Edge CDN.
- **Storage:** Pre-rendered static HTML / ISR edge cache.
- **Latency:** Time-To-First-Byte (TTFB) < 200ms globally.
- **Failure States:** 404 for unapproved drafts, edge cache staleness, client-side hydration mismatch.
- **Retry Behavior:** Stale-while-revalidate at CDN edge.
- **Observability:** Core Web Vitals (LCP, FID, CLS), client telemetry, Sentry error capturing.

### Stage 10: Outcomes & Platform Analytics
- **Input:** Anonymous reader interactions, citation exports, bookmarking, longitudinal policy metrics.
- **Output:** Reader retention metrics, longitudinal outcome tracking projections, trust index updates.
- **Owner:** Knowledge Operations Bureau & Platform Operations.
- **Storage:** Client-local storage (privacy-first), aggregated database analytics.
- **Latency:** Hourly / daily analytical batch rollup; real-time client event logging.
- **Failure States:** Telemetry provider outage (fails open for public reader via `StubProvider`).
- **Retry Behavior:** Async local queue retry; zero blocking of reader experience.
- **Observability:** `PlatformOperationsDashboard`, `OutcomeTrackingService`, `NewsroomScorecardPage`.

---

## 3. Failure Domain Classification

| Failure Domain | Primary Subsystem | Detection Mechanism | Severity | User / Reader Impact | Recovery Action |
| -------------- | ----------------- | ------------------- | -------- | -------------------- | --------------- |
| Upstream Ingestion Failure | External Feeds (PIB) | `PibFeedError`, HealthProbe | P2 (Recoverable) | None (newsroom pipeline delayed) | Exponential backoff, circuit-breaker, source failover |
| Signal Processing Failure | Clustering Engine | Deduplication / Key Collisions | P2 (Recoverable) | New signals temporarily delayed | Reprocess observations with natural key dedup |
| Triage OCC Conflict | Triage Desk | Version mismatch exception | P3 (Low) | Editor sees conflict modal | Reload latest signal state and reapply action |
| Research Bridge Failure | Newsroom-Research Bridge | Case creation error | P2 (Recoverable) | Promotion to case stalled | Idempotent bridge retry with existing signal ID |
| Database Connectivity Loss | PostgreSQL / Supabase | Health probe failure, pool timeout | P0 (Critical) | Operations degraded; cached reader remains UP | Fail-closed for writes; serve cached reader content |
| Queue / Worker Stall | Job Scheduler / Runner | Job timeout, runner error log | P1 (Major) | Background processing halted | Restart runner, requeue failed jobs |
| Verification Rejection | Verification Desk | Gold Standard Audit failure | P3 (Editorial) | Story publication held | Remediate claims, citations, or counterarguments |
| Publication Gate Abortion | Publication Authority | Gate validation exception | P0 (Integrity) | Story blocked from release | Fix gate violation; never bypass gate |
| Public Rendering Error | Next.js Server Components | 500 error boundary, Sentry | P1 (Major) | Public reader sees error page | Instant rollback to previous static build |
| Telemetry Provider Outage | External Analytics / Sinks | Provider error catch | P3 (Low) | None (telemetry suppressed) | Graceful fallback to `StubProvider` |
