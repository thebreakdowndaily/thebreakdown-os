# VS5 — Newsroom Intelligence & Editorial Decision Support: Operational Walkthrough

Version: 1.0  
Status: Authoritative Newsroom Guide  
Governing Doctrine: `AGENTS.md` (Platform Beta v1.0, CTO Directive v2.0), Editorial Constitution v1.1

---

## 1. End-to-End Decision Support Lifecycle

This walkthrough guides editors, researchers, and engineers through the complete decision-support lifecycle implemented in VS5.

```text
1. RAW OBSERVATION INGESTION
   ├── PIB Press Release / Regulatory Notification
   ├── Natural key deduplication (id, canonicalUrl, contentHash, externalId)
   └── Source tier assignment (t1 primary, t2 institutional, etc.)
            │
            ▼
2. STORY CLUSTERING & CORRELATION
   ├── Aggregation into StoryCluster
   ├── Entity resolution (e.g. "Supreme Court", "RBI")
   └── Observation velocity calculation
            │
            ▼
3. SIGNAL SYNTHESIS & HEURISTIC SCORING
   ├── Component scores: novelty, velocity, importance, confidence
   ├── Priority classification (P0, P1, P2, P3)
   └── Alert engine with fatigue suppression (max 3/hr per user, 5/day per beat)
            │
            ▼
4. HUMAN EDITORIAL TRIAGE (/intel & /newsroom)
   ├── Review signal details and provenance
   ├── Actions: REVIEW, WATCH, DISMISS, PRIORITIZE, ASSIGN
   └── PROMOTE_TO_RESEARCH (consequential human escalation)
            │
            ▼
5. RESEARCH BRIDGE & RIE PROJECT CREATION
   ├── Trigger gate evaluation (P0/P1 urgency, velocity >= 60, legal/statutory keywords)
   ├── Topic containment resolution (appends to existing or creates new ResearchProject)
   ├── Idempotent timeline event generation
   └── Approved-source discovery run
            │
            ▼
6. INVESTIGATION WORKSPACE & EDITORIAL STORY
   ├── Claims extraction & evidence linking
   ├── Counterargument formulation & peer review
   └── Human editorial sign-off for publication snapshot
```

---

## 2. Walkthrough: From Ingestion to Research Promotion

### Step 1: Raw Observation Ingested
When an official government release is pulled (e.g. from PIB via `pullPibObservations`):
- The payload is normalized into a `NewsroomObservation`.
- If the observation's `canonicalUrl` or `contentHash` has already been ingested, the engine discards it idempotently.
- Raw text and source metadata (`publicationTimestamp`, `sourceTier`, `isPrimarySource`) are preserved unaltered.

### Step 2: Story Clustering & Signal Generation
- `NewsroomIntelligenceCore` attaches related observations to a `StoryCluster`.
- `SignalEngine.evaluateSignal` runs:
  - Velocity calculated across the rolling observation window.
  - Multi-factor scores computed (relevance, novelty, velocity, evidence strength).
  - Priority assigned (e.g. P1 for breaking primary announcements).
  - Generates canonical `NewsroomSignal` with deterministic ID `sig-${cluster.id}`.

### Step 3: Editor Triages Signal
In the newsroom workspace:
1. **Watch**: Editor places signal on the monitoring queue (`action: 'WATCH'`), transitioning lifecycle state to `monitoring`.
2. **Assign**: Managing editor assigns signal to a beat reporter (`action: 'ASSIGN'`, `assignedTo: 'reporter-finance-01'`).
3. **Prioritize**: Editor adjusts priority from P2 to P1 (`action: 'PRIORITIZE'`, `escalatedPriority: 'P1'`).
4. **Audit**: Every action automatically records an entry in the immutable `NewsroomAuditService` ledger with `actorId`, `timestamp`, `mutationId`, and previous/new state.

### Step 4: Promote to Research Investigation
When the editor determines a signal warrants deep investigative treatment:
1. Editor triggers `action: 'PROMOTE_TO_RESEARCH'`.
2. Core invokes `services/intelligence/research/newsroom-bridge.ts`.
3. The bridge normalizes the signal into `NewsroomEventInput`, carrying the explicit editor trigger hint.
4. `applyNewsEventToResearch` checks for existing topic projects:
   - If an active project exists on this topic ($\ge 0.5$ token/entity overlap), the event is appended to the project's timeline idempotently.
   - Otherwise, a new `ResearchProject` is created in `public.workspace_cases`.
5. The RIE discovery pipeline executes with registry-approved sources, discovering evidence and generating a structured Story Brief.

---

## 3. Walkthrough: Public Demand Intelligence Handoff

On the `/intel/demand` dashboard:
1. Editors inspect high-volume, bilingual search patterns across 8 public policy domains.
2. The engine highlights critical coverage gaps (topics with high search volume but zero or partial Breakdown coverage).
3. Editors review pre-formatted `suggestedResearchBrief` and `suggestedResearchQuestions`.
4. **Advisory Rule**: Demand data guides topic prioritization, but never bypasses the Evidence Spine, Fact-Checking, or Editorial Review workflows.

---

## 4. Production Persistence & Fail-Closed Guarantee

In production environments:
- `createNewsroomStateRepository()` detects `NODE_ENV=production` or `DATA_PROVIDER=supabase`.
- State snapshots are atomically stored in PostgreSQL `newsroom.pipeline_metrics` with optimistic concurrency control (`metric_value` versioning).
- Any attempt to use local memory or file storage in production is rejected with an explicit policy violation error.
- If Supabase credentials or database connections are unavailable, operations **fail closed**, protecting the platform from silent state corruption.
