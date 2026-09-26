# VS5 — Newsroom Intelligence & Editorial Decision Support: Architecture Decision Record

Version: 1.0  
Status: Authoritative Architecture Specification  
Governing Doctrine: `AGENTS.md` (Platform Beta v1.0, CTO Directive v2.0), Editorial Constitution v1.1  
Baseline: Certified Platform Baseline (Migrations 001–016)

---

## 1. Context & Architectural Challenge

Vertical Slice 5 (VS5) addresses **Newsroom Intelligence & Editorial Decision Support**. The objective is to provide editors and researchers with real-time signal detection, public policy trend monitoring, reader demand analysis, and seamless handoff into deep research investigations without compromising editorial standards.

Previous platform audits established a critical governance finding:
- **Migration Lineage**: The remote and local repository migration HEAD is strictly `supabase/migrations/016_api_keys_and_rate_limiting.sql`.
- **Existing Assets**: A full 17-table `newsroom` schema already exists in `012_create_intelligence_schema.sql`, complete with `newsroom.signals`, `newsroom.alerts`, `newsroom.story_clusters`, and `newsroom.observations`.
- **Operating Doctrine Constraint**: The Platform Beta forbids generic or speculative infrastructure (no `signals_v2`, no duplicate registries, no duplicate state machines).

---

## 2. Core Architectural Decisions

### Decision 1: Database Migration Strategy
- **Decision**: No new schema duplication. Migration 012 (`newsroom` schema) is the authoritative relational structure for newsroom operations.
- **Migration Sequence**: If any minor DDL adjustments (e.g. index additions or view creations) are required, they will be registered sequentially as `supabase/migrations/017_*.sql`.
- **Forbidden**: Fabricating missing historical migrations (017–021 from previous external reports) or introducing parallel tables like `signals_v2`.

### Decision 2: Ingestion & Signal Authority Pipeline
- **Decision**: Preserve `services/intelligence/newsroom/` as the single source of business logic for signal ingestion, clustering, velocity analysis, and alert routing.
- **Data Flow**:
  1. `PibAdapter` and RSS adapters fetch upstream official feeds.
  2. Raw items become `NewsroomObservation` records.
  3. `NewsroomIntelligenceCore` groups observations into `StoryCluster` instances based on entity and domain matching.
  4. `PriorityEngine` and `VelocityEngine` compute multi-factor scores (novelty, velocity, importance, confidence).
  5. High-relevance clusters generate `NewsroomSignal` instances.
  6. `AlertEngine` evaluates P0/P1 alerts and enforces user/beat fatigue limits.

### Decision 3: Research Handoff & Editorial Escalation
- **Decision**: The handoff between incoming newsroom signals and deep investigative research operates via `services/intelligence/research/newsroom-bridge.ts`.
- **Handoff Contract**:
  - `NewsroomSignal` $\rightarrow$ `newsroomSignalToEvent()` $\rightarrow$ `createNewsroomResearchBridge()`.
  - Signals meeting P0, P1, velocity $\ge 60$, or statutory/judicial triggers generate or update `ResearchProject` instances in the RIE workspace (`public.workspace_cases`).
  - Demand opportunities from `/intel/demand` export structured `suggestedResearchBrief` and `suggestedResearchQuestions` into RIE projects.

### Decision 4: Constitutional Separation of Intelligence from Truth
- **Decision**: Maintain strict separation between operational intelligence and factual verification:
  - **Intelligence Scores** (novelty, velocity, demand gap) measure newsroom priority and public curiosity. They have **zero** bearing on factual truth.
  - **Verification Authority** rests solely with the Claim/Evidence graph (Articles III & IV of the Editorial Constitution) and human editorial judgment.
  - **Public Reader Protection**: Public story pages remain snapshot-only, reading exclusively from immutable published snapshots (`public.stories`). Intelligence data is completely inaccessible to anonymous readers.

---

## 3. Reader Experience & Five-Minute Rule (Platform Beta Compliance)

Per the **Platform Beta Experience Rule**:
> *"Every sprint must produce at least one improvement that a first-time reader can notice within five minutes."*

For VS5, the editorial decision support system directly enhances reader experience by:
1. **Accelerated Explainer Delivery**: Bridging breaking regulatory signals (e.g. RBI rate circulars, court verdicts) directly into structured research briefs, shortening the latency between public events and publication of evidence-backed Explainers.
2. **Reader Demand Alignment**: Feeding high-volume, bilingual search queries from `/intel/demand` directly into editorial gap coverage, ensuring the newsroom answers the exact questions citizens are searching for.
3. **Public Transparency & Accountability**: Displaying verified source provenance and primary document links directly derived from the intelligence pipeline's T1 primary sources.

---

## 4. Verification and Invariant Plan

All changes in VS5 must satisfy the standard platform test gates:
- `npm run typecheck`: 0 errors
- `npm run check:lint`: 0 errors
- `npm run test:vitest`: 100% pass (maintaining all 719 baseline tests)
- `npm run test`: 100% pass (26/26 sub-suites)
- `npm run test:security`: 100% pass (1,342 assertions)
- `npm run test:migration`: 100% pass across all sequential migrations
- `npm run build`: Static pre-rendering passes with 0 errors
