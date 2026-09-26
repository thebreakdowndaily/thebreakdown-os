# The Breakdown OS — Platform Capability Map (VS7 Reconnaissance)

**Phase:** VS7 Architecture Reconnaissance & Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Architecture Mapping  
**Governing Documents:** AGENTS.md, Editorial Constitution v1.1, CTO Directive v2.0

---

## 1. Domain Overview & Taxonomy

The Breakdown OS platform architecture is structured across seven cohesive operational and technical domains:

1. **Editorial Domain** — Authoring, reviewing, lifecycle state machine, scheduling, publishing gates.
2. **Evidence & Verification Domain** — Primary source verification, claim-evidence-source graph, citation resolution.
3. **Research Domain** — Investigative workspaces, case files, hypothesis testing, source dossier ingestion.
4. **Intelligence Domain** — Dual-pipeline ingestion, signal clustering, novelty scoring, newsroom triage.
5. **Operations Domain** — Mission Control, Control Plane authorization, 10-stage pipeline health, anomaly alerting.
6. **Reader Product Domain** — Long-form narrative rendering (StoryShell), Reader Modes, responsive charts, reading analytics.
7. **Infrastructure & Security Domain** — Multi-role PostgreSQL RLS, distributed rate limiting, Next.js 15 SSG/SSR, edge caching.

---

## 2. Platform Capability Inventory by Domain

### Domain 1: Editorial Domain
- **Existing & Operational:**
  - Story lifecycle state machine (`draft` -> `review` -> `approved` -> `published` -> `archived`).
  - Chapter rendering engine (`lib/editorial/chapter-factory.ts`, `features/editorial/knowledge-service.ts`).
  - Pre-publication safety gate (`lib/story/publication.ts`, `lib/editorial/publication-gate.ts`) enforcing fail-closed 404s on unapproved drafts.
  - Snapshot archival trigger (`trg_stories_archive` in `002_canonical_schema.sql` populating `audit.story_versions`).
- **Tested Invariants:**
  - Fail-closed draft protection verified in `tests/publication-safety-p1.test.ts` (14/14) and live smoke (25/25).
  - Editorial decision intelligence and lifecycle transitions tested in `tests/editorial-decision-intelligence.test.ts` (16/16).
- **Partial / Incomplete:**
  - Automated Gold Standard Review (`lib/editorial/gold-standard-review.ts`): Type definitions and evaluation logic exist, but lack automated pre-publication pipeline execution against story payloads.
- **Missing / Gap:**
  - Automated Chapter 1 Gold Standard audit runner connecting `publication-gate.ts` to `gold-standard-review.ts`.

---

### Domain 2: Evidence & Verification Domain
- **Existing & Operational:**
  - Canonical schema 002 tables: `editorial.sources`, `editorial.claims`, `editorial.story_claims`, `editorial.evidence_items`.
  - Claim Registry and Source Registry primitives.
  - Source integrity validator (`lib/knowledge/source-validator.ts`).
  - Interactive Claim Card and Evidence Drawer UI (`components/story/ClaimCard.tsx`, `components/story/EvidencePanel.tsx`).
- **Tested Invariants:**
  - Source integrity, URL validation, and claim linkage tested in `tests/source-integrity-validator.test.ts` and `tests/story/chart-contract.test.ts`.
- **Partial / Incomplete:**
  - Claim density and evidence coverage metrics are calculated in code but not exposed as an automated quality gate.
- **Missing / Gap:**
  - Direct UI link between reader-facing claim cards and reader correction submission.

---

### Domain 3: Research Domain
- **Existing & Operational:**
  - Investigative workspace schema (`010_investigation_workspace.sql`): `public.workspace_cases`, `workspace_evidence`, `workspace_notes`, `workspace_timeline_events`.
  - Research Intelligence Engine (`services/intelligence/research/`).
  - Case file management, hypothesis formulation, timeline builder.
- **Tested Invariants:**
  - Workspace state transitions and invariant constraints tested in `tests/research/invariant.test.ts` (20/20) and `tests/research-workspace.test.ts` (4/4).
- **Partial / Incomplete:**
  - Dossier export to editorial draft is manual via service method.
- **Missing / Gap:**
  - None within core research boundaries; stable and hardened.

---

### Domain 4: Intelligence Domain
- **Existing & Operational:**
  - Newsroom intelligence schema (`011_newsroom_intelligence.sql`, `012_newsroom_pib_enrichment.sql`): `newsroom.signals`, `newsroom.clusters`, `newsroom.demands`.
  - Dual-pipeline ingestion engine (`NewsroomIntelligenceCore`, `NewsroomPIBAdapter`).
  - Signal deduplication, cluster scoring, velocity tracking.
  - Research/Newsroom bridge (`services/intelligence/research/newsroom-bridge.ts`) promoting signals to investigative cases.
- **Tested Invariants:**
  - Verified across `tests/vs5-intelligence-decision-support.test.ts` (11/11) and `tests/newsroom-pib-adapter.test.ts` (7/7).
- **Partial / Incomplete:**
  - Operational triage actions operate under process-local state when Supabase connection is offline.
- **Missing / Gap:**
  - None; frozen as of VS5 baseline.

---

### Domain 5: Operations Domain
- **Existing & Operational:**
  - Mission Control dashboard (`app/operations/page.tsx`, `app/intel/page.tsx`).
  - Control Plane authorization and audit logging (`lib/control-plane/`).
  - 10-stage pipeline health aggregator (`lib/operations/pipeline-health.ts`).
  - Anomaly detection and operational alert engine (`lib/observability/intelligence-engine.ts`).
  - Production readiness freshness checks.
- **Tested Invariants:**
  - Verified in `tests/vs6-operations-control-plane.test.ts` (16/16) and `tests/pipeline-health.test.ts` (10/10).
- **Partial / Incomplete:**
  - Incident handling state is ephemeral/process-local by architectural design (certified in VS6).
- **Missing / Gap:**
  - None; frozen as of VS6 baseline.

---

### Domain 6: Reader Product Domain
- **Existing & Operational:**
  - Flagship story narrative layout (`components/story/StoryShell.tsx`).
  - Reader Modes: Standard, Compact, Deep Context, Audio/Speech, Dyslexic/Accessible.
  - Interactive SVG Charts (`SvgChartBlock.tsx`) adhering to the strict visual data contract.
  - Sticky Table of Contents, reading progress indicator, citation jump-links.
  - Series navigation (`app/series/[collectionSlug]/[chapterSlug]/page.tsx`).
- **Tested Invariants:**
  - Canonical story adapter and visual rendering tested in `tests/story/canonical-adapter.test.ts` (9/9), `tests/chapter-rendering.test.ts` (11/11), and live smoke (25/25).
- **Partial / Incomplete:**
  - Volume I, Chapter 1 ("The Partition and Its Legacies") exists in partial draft form; not yet populated to full Gold Standard density (50+ claims, 120+ evidence, 100+ sources).
  - Correction notice display on stories: Schema exists (`public.corrections`), but story header/footer errata component is not wired.
- **Missing / Gap:**
  - Public reader correction submission form on story pages.
  - Public errata log page (`/transparency/corrections` or `/corrections`).

---

### Domain 7: Infrastructure & Security Domain
- **Existing & Operational:**
  - 16 PostgreSQL migrations (`001_initial_schema.sql` through `016_api_keys_and_rate_limiting.sql`).
  - Strict RLS policies across all tables with consolidated roles (`anon`, `authenticated`, `staff`).
  - Distributed token bucket rate limiting in PostgreSQL with sliding window fallbacks.
  - Next.js 15 App Router with hybrid SSG/SSR prerendering (1,129 routes cleanly generated).
- **Tested Invariants:**
  - Database enforcement suite (`tests/security/database-enforcement.test.ts` - 33/33).
  - Security suite (`npm run test:security` - 1,342 assertions).
  - Migration verification (`npm run test:migration` - 16/16).
- **Partial / Incomplete:**
  - None.
- **Missing / Gap:**
  - None. Migration head is firmly locked at 016.

---

## 3. Cross-Domain Readiness Summary

| Domain | Status | Operational Completeness | Test Coverage | VS7 Focus Area |
| :--- | :--- | :--- | :--- | :--- |
| 1. Editorial | Operational | 90% | High (27 tests) | Automated Gold Standard Quality Gate |
| 2. Evidence | Operational | 95% | High (18 tests) | Verification linking to errata |
| 3. Research | Hardened | 100% | High (24 tests) | None (Preserved) |
| 4. Intelligence | Frozen (VS5) | 100% | High (18 tests) | None (Preserved) |
| 5. Operations | Frozen (VS6) | 100% | High (26 tests) | None (Preserved) |
| 6. Reader Product | Active | 85% | High (45 tests) | Reader Corrections UI & Chapter 1 Assembly |
| 7. Infrastructure | Locked | 100% | Comprehensive (1,342 assertions) | Zero new migrations |
