# The Breakdown OS — Code & Concept Duplication Audit (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Duplication Audit  
**Governing Rule:** Eliminate Shadow Systems & Duplicate Abstractions

---

## 1. Executive Summary

This audit scoured the codebase for duplicate implementations, shadowed services, parallel algorithms, and divergent data representations across the 11 audited domains.

---

## 2. Detailed Duplication Findings

### 1. Publication Verification Predicates
- **Canonical Implementation:** `lib/story/publication.ts` (`isPubliclyPublished`, `isCanonicalStoryPublic`).
- **Duplicate / Alternative:** `lib/editorial/publication-gate.ts` (`validateStoryForPublication`).
- **Why Both Exist:** `publication.ts` is the fast runtime predicate used by web routing to fail-close 404s on draft pages. `publication-gate.ts` is the comprehensive 11-gate pre-publication checklist used by the CMS before writing the published state.
- **Risk:** Low. They serve different lifecycle phases (read-time gating vs write-time publishing).
- **Recommended Action:** Preserve both; ensure `publication-gate.ts` uses `isPubliclyPublished` rules for consistency.

---

### 2. Rate Limiting Stores
- **Canonical Implementation:** `features/rate-limiting/limiter.ts` (`DistributedRateLimiter`).
- **Duplicate:** Local in-memory sliding-window tracker in `services/editorial/corrections-service.ts`.
- **Why Both Exist:** `corrections-service.ts` included a lightweight memory fallback for isolated testing when Upstash/Supabase environments are unset.
- **Risk:** Low in test, but creates duplicate rate-limiting state if both run simultaneously in production.
- **Recommended Action:** Ensure `services/editorial/corrections-service.ts` delegates directly to `features/rate-limiting/limiter.ts` in all production paths.

---

### 3. Story Presentation & View Models
- **Canonical Implementation:** `lib/story/presentation-model.ts` (`buildStoryPresentationModel`).
- **Duplicate:** `lib/story/resolver.ts` returning raw canonical story objects alongside candidate timeline events.
- **Why Both Exist:** `resolver.ts` is the data layer abstraction; `presentation-model.ts` is the view-model projection applying reading mode policies.
- **Risk:** None. Clean separation between data resolution and presentation.
- **Recommended Action:** Preserve existing architecture.

---

### 4. Health & Anomaly Alerting
- **Canonical Implementation:** `lib/operations/pipeline-health.ts` (10-stage aggregator) & `lib/observability/intelligence-engine.ts`.
- **Duplicate:** Legacy health check in `lib/control-plane/health.ts`.
- **Why Both Exist:** `control-plane/health.ts` was an earlier operational prototype before VS6 unified the 10-stage aggregator in `lib/operations/pipeline-health.ts`.
- **Risk:** Confusion for developers maintaining operational endpoints.
- **Recommended Action:** Deprecate `control-plane/health.ts` in favor of `lib/operations/pipeline-health.ts`.

---

### 5. Signal Intake Adapters
- **Canonical Implementation:** `services/intelligence/newsroom/adapters/pib.ts` (`NewsroomPIBAdapter`).
- **Duplicate:** None. Single authoritative adapter for government releases.
- **Risk:** None.
- **Recommended Action:** No action required.

---

### 6. Errata & Corrections Stores
- **Canonical Implementation:** `public.corrections` and `public.reader_corrections` in PostgreSQL (Migration 013).
- **Duplicate:** In-memory fallback map `memoryReaderCorrections` in `services/editorial/corrections-service.ts`.
- **Why Both Exist:** Allows unit tests to run in milliseconds in isolated Node.js environments without database dependencies.
- **Risk:** Low, provided production execution always targets Supabase.
- **Recommended Action:** Preserve memory fallback for Vitest; ensure Supabase client is invoked when environment variables are present.

---

## 3. Duplication Audit Verdict

No toxic duplicate authorities or parallel databases exist. All discovered dualities represent either intentional lifecycle stage separation (read-time vs write-time) or test-isolation memory fallbacks.
