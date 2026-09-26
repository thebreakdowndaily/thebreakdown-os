# VS5 — Newsroom Intelligence & Editorial Decision Support: Reconnaissance Report

Version: 1.0  
Status: Authoritative Forensic Survey  
Governing Doctrine: `AGENTS.md` (Platform Beta v1.0, CTO Directive v2.0)  
Baseline: Certified Platform Baseline (Migrations 001–016, 719/719 Vitest, 26/26 TSX, 1,342/1,342 Security)

---

## 1. System Map & Ingestion Pipeline

```
Upstream Sources (PIB, RSS Feeds, Regulatory Announcements)
       │
       ▼
Source Adapters (`services/intelligence/newsroom/pib-adapter.ts`, `research/adapters/`)
       │
       ▼
Observation Ingestion & Normalization (`NewsroomObservation`)
       │
       ▼
Story Clustering & Entity Graph (`StoryCluster`, `StoryObservation`)
       │
       ├── Velocity & Priority Engine (`services/intelligence/newsroom/priority-engine.ts`)
       ├── Contradiction & Claim Engine (`newsroom/contradiction-engine.ts`)
       └── Coverage Gap Engine (`newsroom/coverage-gap-engine.ts`)
       │
       ▼
Newsroom Signals (`NewsroomSignal`, `newsroom.signals`)
       │
       ├── Alert Engine & Fatigue Suppression (`newsroom/alert-engine.ts`)
       │      │
       │      ▼
       │   Newsroom Dashboard (`/newsroom`, `NewsroomDashboardClient.tsx`)
       │   Beat Routing & Escalations
       │
       ▼
Research Bridge (`services/intelligence/research/newsroom-bridge.ts`)
       │
       ├── Trigger Gate (P0 / P1 / Velocity >= 60 / Statutory & Legal Keywords)
       │
       ▼
RIE Universe & Investigation Workspace (`public.workspace_cases`, `ResearchProject`)
       │
       ▼
Editorial Brief & Chapter Construction
```

---

## 2. In-Depth Subsystem Forensics

### 2.1 Database Schema (`newsroom` Schema in Migration 012)
Migration `012_create_intelligence_schema.sql` establishes 17 tables in the `newsroom` schema:
1. `newsroom.sources`: Source registry, credibility tiers (T1 primary, T2 institutional, T3 secondary).
2. `newsroom.source_endpoints`: Polling URLs, protocols, interval frequencies.
3. `newsroom.source_health_log`: HTTP status, response latency, consecutive failure counts.
4. `newsroom.source_reputation`: Rolling accuracy, retraction counts, reliability scores.
5. `newsroom.observations`: Atomic raw items ingested from sources with deduplication hashes.
6. `newsroom.claims`: Extracted factual assertions from observations.
7. `newsroom.claim_evidence`: Citations linking claims to observations and primary documents.
8. `newsroom.verification_events`: Log of verification status changes.
9. `newsroom.story_clusters`: Aggregated clusters of related observations.
10. `newsroom.story_observations`: Association table between clusters and observations.
11. `newsroom.story_claims`: Association table between clusters and claims.
12. `newsroom.story_velocity`: Metric series tracking observation rate of change.
13. `newsroom.signals`: High-signal editorial events synthesized from clusters.
14. `newsroom.alerts`: High-priority notifications routed to beats and editors.
15. `newsroom.editorial_feedback`: Editor input (confirmations, dismissals, priority adjustments).
16. `newsroom.coverage_gaps`: Uncovered public policy/governance domains.
17. `newsroom.pipeline_metrics`: Performance, health counters, and snapshot storage.

### 2.2 Newsroom Intelligence Core (`services/intelligence/newsroom/`)
- **State Management**:
  - `NewsroomPersistedState` (`services/intelligence/newsroom/persistence/state.ts`): Unified versioned state snapshot containing observations, claims, clusters, signals, gaps, alerts, audit ledger, beats, recipients, fatigue telemetry, and engine mode.
  - Three interchangeable repository providers:
    - `MemoryStateRepository`: Ephemeral, unit testing.
    - `FileStateRepository`: Local file persistence (`data/newsroom/state.json`).
    - `SupabaseStateRepository`: Optimistic concurrency persistence to `newsroom.pipeline_metrics` (row `9e5c464c-b17b-402a-96e0-2646c2410a00`).
- **Core Processing Engines**:
  - `SignalEngine`: Synthesizes raw clusters into actionable signals with composite scoring (novelty, velocity, importance, confidence).
  - `AlertEngine`: Dispatches alerts for P0/P1 signals while strictly enforcing user and beat alert fatigue caps (maximum 3/hr and 15/day per user; 5/day per beat).
  - `CoverageGapEngine`: Detects under-reported beats and regulatory blind spots.
  - `CalibrationService`: Calibrates scoring models against historical false-positive/false-negative feedback.

### 2.3 Newsroom-to-Research Bridge (`services/intelligence/research/newsroom-bridge.ts`)
- **Trigger Evaluation**:
  - Automatically evaluates incoming `NewsroomSignal` against gate criteria:
    - P0 priority $\rightarrow$ `BREAKING_DEVELOPMENT`
    - P1 priority with independent primary source $\rightarrow$ `BREAKING_DEVELOPMENT`
    - P1 priority $\rightarrow$ `HIGH_IMPORTANCE`
    - High velocity ($\ge 60$) $\rightarrow$ `HIGH_SIGNAL_VELOCITY`
    - Domain pattern matching (Supreme Court rulings, RBI circulars, SEBI regulations, Gazette notifications).
- **Handoff Mechanism**:
  - Maps `NewsroomSignal` $\rightarrow$ `NewsroomEventInput`.
  - Appends to an existing active `ResearchProject` (if entity/topic overlap matches) or instantiates a new RIE project.
  - Initiates discovery run using approved registry adapters.
  - Emits `ResearchUpdateAlert` with evidence deltas and suggested story briefs.

### 2.4 Demand & Search Intelligence (`app/intel/demand/`)
- **Domain Model** (`types/demand-intelligence.ts`):
  - Captures public query demand across 8 categories (foreign policy, defence, economy, governance, judiciary, history, elections, society).
  - Bilingual tracking (English and Hindi, with transliteration).
  - Computes `gapScore` (0–100) reflecting high-search topics where The Breakdown has partial or zero coverage.
  - Provides pre-structured research briefs and research questions directly consumable by RIE.
- **Architectural Guardrail**:
  - Purely advisory: Demand metrics guide story opportunity identification, but never dictate editorial truth, consensus, or evidence verification.

### 2.5 Security & Route Authorization
- Protected by `guardIntelModule` (`features/auth/intel-server.ts`).
- Verified by `tests/intel-auth.test.ts` (1,155 passed assertions).
- Enforces strict role isolation: staff, editors, reporters, and administrators. Unauthorized or anonymous requests fail closed with `IntelDenied`.

---

## 3. Verified Test Coverage

The intelligence and newsroom subsystems are backed by extensive automated regression suites:
- `tests/newsroom-intelligence.test.ts` (29 tests): End-to-end signal synthesis, clustering, alerting, fatigue suppression.
- `tests/newsroom-pib-adapter.test.ts` (7 tests): Official PIB RSS/XML ingestion, payload extraction, error handling.
- `tests/newsroom-pib-coverage.test.ts` (5 tests): Measurement protocol, entity mapping, P2 corpus suppression.
- `tests/newsroom-pib-recovery.test.ts` (6 tests): Feed failure recovery, circuit breaker resilience.
- `tests/newsroom-concurrency-idempotency.test.ts` (4 tests): Concurrent ingestion and deduplication idempotency.
- `tests/newsroom-scorecard.test.ts` (10 tests): Pipeline telemetry, accuracy ratios, latency benchmarks.
- `tests/research/newsroom-bridge.test.ts` (27 tests): Gate triggers, project creation, evidence delta generation.
- `tests/intel-auth.test.ts` (1,155 assertions): RBAC and fail-closed security invariants across all `/intel/*` endpoints.

Total Active Invariants Covering Intelligence: **1,243+ verified assertions**.
