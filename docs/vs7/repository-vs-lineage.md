# The Breakdown OS — Repository vs Historical VS Lineage Reconciliation

**Audit Target:** VS7 Architecture Reconnaissance & Lineage Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Historical Lineage Baseline  
**Governing Rule:** Principle A (Repository reality over historical narrative)

---

## 1. Executive Summary

This document establishes the authoritative reconciliation between historical architecture claims (found in earlier session summaries, roadmaps, and PRDs) and the actual source code, database tables, routes, services, types, and automated tests present in the current repository.

Every capability listed below has been verified by direct code inspection.

---

## 2. Comprehensive Lineage Reconciliation Matrix

| Vertical Slice / Phase | Historical Claimed Architecture | Actual Repository Evidence | Concrete Status | Production Reality & Behavioral Verification |
| :--- | :--- | :--- | :--- | :--- |
| **P0 (Publication Safety)** | Atomic RPC `publish_story_atomic()`, trigger `trg_enforce_publication_authority`. | `lib/story/publication.ts` (`isPubliclyPublished()`), `lib/story/resolver.ts`, `015_enable_rls_and_consolidate_roles.sql` RLS. | **EXISTING (Alternative Canonical Implementation)** | Production enforces fail-closed 404 on unapproved stories. Tested by `tests/publication-safety-p1.test.ts` (14/14 PASS) and live smoke (25/25 PASS). |
| **VS1 (Editorial Lifecycle)** | Tables `public.stories`, `public.topics`, `public.entities`. Trigger `trg_stories_version_bump`. Dedicated suite `tests/newsroom/vs1-editorial-lifecycle.test.ts`. | Migrations 001, 002. `features/editorial/knowledge-service.ts`, `lib/editorial/chapter-factory.ts`. Trigger `trg_stories_archive`. | **EXISTING** | Fully implemented in memory and Supabase. Tested by `tests/editorial-decision-intelligence.test.ts` (16/16) and `tests/chapter-rendering.test.ts` (11/11). |
| **VS1.5 (Concurrency & Security Hardening)** | Migrations 015 & 016. Distributed rate limiting in PostgreSQL. Role matrices with immutable search_path. OCC version checking. | `supabase/migrations/015_enable_rls_and_consolidate_roles.sql`, `016_api_keys_and_rate_limiting.sql`. `services/intelligence/newsroom/workflow-service.ts`. | **EXISTING** | 16 migrations verified in isolated PostgreSQL cluster. Tested by `tests/security/database-enforcement.test.ts` (33/33 PASS) and `npm run test:security` (1,342 assertions). |
| **VS2 (Evidence & Claims)** | Claimed migration 019 `editorial.claim_verifications`, `editorial.claim_verification_evidence`. Deterministic claim IDs. | Migration 002 (`002_canonical_schema.sql`): `editorial.sources`, `editorial.claims`, `editorial.story_claims`, `editorial.evidence_items`. `lib/knowledge/source-validator.ts`. | **EXISTING (Canonical Schema 002)** | Migration 019 never existed in git history; canonical claims and evidence live in migration 002. Tested by `tests/source-integrity-validator.test.ts` and `tests/story/chart-contract.test.ts`. |
| **VS3 (Research & Investigation)** | Claimed migration 020 `public.workspace_case_stories`, `public.workspace_artifact_promotions`. Research Intelligence Engine. | Migration 010 (`010_investigation_workspace.sql`): `public.workspace_cases`, `workspace_evidence`, `workspace_notes`, `workspace_timeline_events`. `services/intelligence/research/`. | **EXISTING (Migration 010)** | Migration 020 never existed; investigative workspaces live in migration 010. Tested by `tests/research/invariant.test.ts` (20/20 PASS) and `tests/research-workspace.test.ts` (4/4 PASS). |
| **VS4 (Story Experience & Snapshots)** | Claimed migration 021 `audit.published_story_snapshots`. Canonical 308 redirects. SvgChartBlock. StoryShell. | Migration 002 (`audit.story_versions` via `trg_stories_archive`). `components/story/StoryShell.tsx`, `lib/story/resolver.ts`, `app/series/[collectionSlug]/...`. | **EXISTING (Audit Story Versions)** | Migration 021 never existed; snapshots live in `audit.story_versions(snapshot JSONB)`. Tested by `tests/story/canonical-adapter.test.ts` (9/9 PASS) and dead routes suite. |
| **VS5 (Newsroom Intelligence Decision Support)** | Dual-pipeline signal intake, PIB adapter, deduplication, cluster scoring, triage bridge to workspace cases. | `services/intelligence/newsroom/`, `services/intelligence/newsroom/persistence/`, `services/intelligence/research/newsroom-bridge.ts`. | **EXISTING** | Fully implemented and hardened. Tested by `tests/vs5-intelligence-decision-support.test.ts` (11/11 PASS) and `tests/newsroom-pib-adapter.test.ts` (7/7 PASS). |
| **VS6 (Newsroom Operations & Control Plane)** | Mission Control, Control Plane, 10-stage pipeline health, system anomaly alerting (P0–P3), release readiness freshness. | `lib/control-plane/`, `lib/operations/pipeline-health.ts`, `lib/observability/intelligence-engine.ts`, `app/operations/page.tsx`, `app/intel/page.tsx`. | **EXISTING / FROZEN** | Certified post-implementation baseline with zero migrations (HEAD at 016). Tested by `tests/vs6-operations-control-plane.test.ts` (16/16 PASS). |
| **VS7 (Candidate: Quality, Transparency & Release)** | Automated Gold Standard Review, Reader Corrections Submission/Triage, Public Errata Transparency, Chapter 1 Assembly. | Migration 013 (`public.corrections`, `public.reader_corrections`), `lib/editorial/gold-standard-review.ts`, `lib/editorial/chapter-1-data.ts`. | **PARTIAL (Schema & Types Exist; Public Workflows Absent)** | The data models and types exist; public submission API, reader submission UI, and automated Gold Standard Review pipeline are unbuilt. |

---

## 3. Concrete Architectural Findings

1. **Migration Lineage Boundary:**
   The migration sequence terminates definitively at `016_api_keys_and_rate_limiting.sql`. All claims of migrations 017–021 in historical logs were theoretical proposals that were never committed to git.
2. **Schema 013 Readiness:**
   Migration 013 (`013_create_corrections_schema.sql`) already provisioned `public.corrections` (append-only public errata) and `public.reader_corrections` (private reader submission queue with RLS). It is completely unutilized by front-end routes.
3. **Editorial Engine Readiness:**
   `lib/editorial/gold-standard-review.ts` already contains the 7-phase audit engine and scoring interface required by Article XI of the Editorial Constitution, but lacks automated execution across story packages.
