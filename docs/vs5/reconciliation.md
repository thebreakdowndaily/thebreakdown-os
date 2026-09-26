# VS5 — Newsroom Intelligence & Editorial Decision Support: Reconciliation Matrix

Version: 1.0  
Status: Authoritative Engineering Reconciliation  
Governing Doctrine: `AGENTS.md` (Platform Beta v1.0, CTO Directive v2.0)  
Baseline: Certified Platform Baseline (Migrations 001–016, 719/719 Vitest, 26/26 TSX, 1,342/1,342 Security)

---

## 1. Executive Summary

This reconciliation matrix establishes the canonical mapping of all intelligence, newsroom, research, demand, and editorial decision-support subsystems in **The Breakdown OS**.

In strict accordance with the **Platform Beta Infrastructure Ban** and **Release Governance Directive**:
- **NO parallel systems** are permitted (no `signals_v2`, `intel_v2`, `demand_v2`, or `opportunities_v2`).
- **NO fabrication of historical migrations** (Migrations 001–016 form the immutable database foundation).
- **NO conflation of intelligence with truth**: Newsroom signals and priority scores measure velocity, novelty, and public interest; factual verification belongs exclusively to the canonical Claim/Evidence graph and editorial review.
- **NO bypass of the investigation/research lifecycle**: Signals escalate into RIE projects and investigation cases via existing, verified bridge architecture.

---

## 2. Component Reconciliation Matrix

| Subsystem | Existing Path | Authoritative Data Store | VS5 Action | Rationale / Architectural Boundary |
| :--- | :--- | :--- | :--- | :--- |
| **Newsroom Ingestion & Invariant Engine** | `services/intelligence/newsroom/` | Memory / File (`data/newsroom/state.json`) / Supabase (`newsroom.pipeline_metrics` snapshot) | **KEEP & EXTEND** | Existing core handles observation ingestion, clustering, velocity calculation, and alert suppression. Robust test coverage (PIB adapter, recovery, coverage). Extend to direct `newsroom.signals` relational synchronization if multi-worker queryability is required. |
| **Newsroom Database Schema** | `supabase/migrations/012_create_intelligence_schema.sql` | PostgreSQL `newsroom` schema (17 tables: `sources`, `observations`, `signals`, `alerts`, etc.) | **KEEP** | Complete, production-grade schema is already deployed in Migration 012. Do NOT duplicate or rewrite. |
| **PIB Feed Adapter** | `services/intelligence/newsroom/pib-adapter.ts` | Source Endpoint: PIB Press Releases | **KEEP** | Formatted ingestion for official government releases, entity matching, and priority assignment. 100% verified across 4 test suites. |
| **Newsroom-to-Research Bridge** | `services/intelligence/research/newsroom-bridge.ts` | RIE Research Project Store (`ResearchProject`, `ResearchRun`) | **KEEP & EXTEND** | Authoritative bridge connecting news signals to in-depth research. Evaluates P0/P1 urgency, velocity, and statutory/legal triggers before project creation. |
| **Public Demand & Search Intelligence** | `app/intel/demand/`, `fixtures/demand-fixture.ts`, `types/demand-intelligence.ts` | Read-only Demand Fixture / Search Intelligence Engine | **KEEP & EXTEND** | Public search volume, bilingual (EN/HI) query patterns, and coverage gap scoring. Strictly advisory — does not dictate editorial truth. |
| **Research Intelligence Engine (RIE)** | `services/intelligence/research/core.ts`, `services/intelligence/research/pipeline.ts` | `public.workspace_cases`, `services/intelligence/research/persistence/` | **KEEP** | Deep structured research universe, claim extraction, primary source validation, and contradiction detection. |
| **Verification & Fact-Checking Cases** | `app/intel/verification/`, `lib/intel/verification/` | `public.workspace_cases` (Migration 010) | **KEEP** | Handles editorial verification cases, evidence corroboration, and conflict adjudication. |
| **Editorial Decision & Calendar** | `app/intel/editorial/`, `supabase/migrations/014_editorial_calendar.sql` | `public.editorial_calendar_events` | **KEEP** | Coordinates scheduled deep-dives, beat planning, and publication staging. |
| **Newsroom Dashboard UI** | `app/newsroom/page.tsx`, `components/newsroom/` | Newsroom Core State / Pipeline Metrics | **KEEP & ENHANCE** | Reader-visible / newsroom-visible mission control displaying active signals, alerts, queue, and source health. |
| **Scorecard & Ingestion Health** | `app/newsroom/scorecard/page.tsx`, `services/intelligence/newsroom/scorecard-service.ts` | Newsroom State / Pipeline Metrics | **KEEP** | Quantitative telemetry on ingestion coverage, precision, false alert rate, and beat fatigue. |
| **Intel Navigation & Authorization Gate** | `features/auth/intel-server.ts`, `tests/intel-auth.test.ts` | Supabase Auth + Application Role Matrix | **KEEP** | 1,155 automated security assertions enforce role-based access across all `/intel/*` routes. Fails closed. |

---

## 3. Disallowed Parallel Patterns

1. **NO `signals_v2` / `signals_v3`**:
   The `newsroom.signals` table and `NewsroomSignal` interface are canonical. All signal enhancements must extend these structures.
2. **NO Synthetic Schema Branching**:
   Any new database structures must follow Migration `017_*.sql` sequentially after `016_api_keys_and_rate_limiting.sql`.
3. **NO Autonomous Publishing**:
   Intelligence signals never publish stories. They generate research briefs and editorial alerts. Publication requires human editorial review through the canonical publication pipeline.
4. **NO Advisory-to-Truth Leakage**:
   Demand gap scores and velocity spikes represent interest and novelty, never empirical validity. Factual status remains governed by Article III & IV of the Editorial Constitution.
