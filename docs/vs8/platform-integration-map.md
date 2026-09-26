# The Breakdown OS — Platform Integration Map (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Domain Integration Map  
**Governing Documents:** AGENTS.md, Editorial Constitution v1.1, CTO Directive v2.0

---

## 1. Certified Platform Domain Matrix

The 12 primary domains of The Breakdown OS across the certified baselines (P0 through VS7):

| Domain | Existing Implementation | Persistence | Authority | Consumers | Tests |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A. Newsroom Intelligence (VS5)** | `services/intelligence/newsroom/`, `NewsroomIntelligenceCore`, `NewsroomPIBAdapter` | `newsroom.signals`, `newsroom.clusters`, `newsroom.demands` (Mig 011, 012) | Advisory / Prioritization only; zero authority over editorial truth | Newsroom triage desk, Research bridge, `/intel` dashboard | `tests/vs5-intelligence-decision-support.test.ts` (11), `tests/newsroom-pib-adapter.test.ts` (7) |
| **B. Research (VS3)** | `services/intelligence/research/`, `newsroom-bridge.ts` | `public.workspace_cases`, `workspace_evidence`, `workspace_notes` (Mig 010) | Primary investigative authority; forms hypotheses and gathers primary evidence | Editorial desk, Chapter writers, Investigation views | `tests/research/invariant.test.ts` (20), `tests/research-workspace.test.ts` (4) |
| **C. Editorial (VS1/VS7)** | `features/editorial/`, `services/editorial/`, `chapter-factory.ts` | `public.stories`, `public.topics`, `editorial.claims` (Mig 001, 002) | Sole arbiter of editorial narrative and canonical text structure | Story rendering engine, Series views, CMS | `tests/editorial-decision-intelligence.test.ts` (16), `tests/chapter-rendering.test.ts` (11) |
| **D. Verification (VS2/VS7)** | `lib/knowledge/source-validator.ts`, `lib/editorial/gold-standard-review.ts` | `editorial.sources`, `editorial.claims`, `editorial.evidence_items` (Mig 002) | Evaluates evidence provenance, claim confidence, and bias audits | Publication gate, Claim cards, Evidence panels | `tests/source-integrity-validator.test.ts`, `tests/story/chart-contract.test.ts` |
| **E. Publication (P0/VS7)** | `lib/story/publication.ts`, `lib/editorial/publication-gate.ts`, `lib/story/resolver.ts` | `audit.story_versions` (Mig 002 via trigger `trg_stories_archive`) | Gate authority; fail-closed enforcement (404 on unapproved drafts) | Next.js App Router, SSR/SSG, Reader views | `tests/publication-safety-p1.test.ts` (14), `tests/publication-policy.test.ts`, Live smoke (25) |
| **F. Reader Corrections (VS7)** | `services/editorial/corrections-service.ts`, `app/api/corrections/submit/route.ts` | `public.reader_corrections`, `public.corrections` (Mig 013) | Reader input queue; staff-only triage; append-only published errata | `/transparency/corrections`, Story pages, Editorial CMS | `tests/vs7-editorial-quality-and-corrections.test.ts` (10) |
| **G. Operations (VS6)** | `lib/control-plane/`, `app/operations/page.tsx` | Ephemeral runtime state + Supabase client fallback | Operational execution, worker triggering, incident triage | Systems operators, Newsroom staff, Release managers | `tests/vs6-operations-control-plane.test.ts` (16) |
| **H. Observability (VS6)** | `lib/operations/pipeline-health.ts`, `lib/observability/intelligence-engine.ts` | Process-local rolling buffer + memory telemetry | Anomaly alerting (P0–P3), 10-stage pipeline health monitoring | Mission Control, Health endpoints | `tests/pipeline-health.test.ts`, `tests/telemetry.test.ts` |
| **I. Governance (Level 1–5)** | `Editorial Constitution v1.1`, `AGENTS.md`, `Product Quality Standard` | Git repository markdown | Supreme governing authority; institutional doctrine | All engineering and editorial bureaus | Automated audit plugins in `audit/` |
| **J. Public Reader Product (VS4/VS7)** | `components/story/StoryShell.tsx`, `components/rxs/`, `app/series/` | Static edge cache / Next.js SSG prerender | Reader presentation layer; renders canonical models only | Public readers, UPSC aspirants, Scholars | `tests/story/canonical-adapter.test.ts` (9), Canonical TSX (26 suites) |
| **K. Database / Persistence** | PostgreSQL, Supabase migrations 001–016 | 16 migrations in `supabase/migrations/` | Definitive system-of-record storage engine | All backend services, RLS engine | `tests/security/database-enforcement.test.ts` (33), `npm run test:migration` (16) |
| **L. Authorization / Security** | `features/security/`, `features/rate-limiting/`, PostgreSQL RLS | `public.api_rate_limits` (Mig 016), JWT claims | Multi-tier RBAC (`anon`, `authenticated`, `staff`, `admin`) | Middleware, API routes, Database queries | `npm run test:security` (1,342 assertions) |

---

## 2. Cross-Vertical Architectural Analysis

1. **Separation of Concerns:**
   - **Intelligence (VS5)** does not write to **Editorial (VS1)** or **Verification (VS2)**.
   - **Operations (VS6)** observes pipeline health and issues alerts, but does not mutate editorial content.
   - **Reader Corrections (VS7)** accepts untrusted external input into an isolated queue, requiring human staff review before any errata notice is committed.
2. **Persistence Integrity:**
   - All 12 domains share the certified 16-migration PostgreSQL database without schema divergence or conflicting shadow tables.
