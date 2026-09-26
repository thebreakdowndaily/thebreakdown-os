# The Breakdown OS — Architectural Drift Analysis (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Drift Analysis  
**Governing Documents:** AGENTS.md, Platform Beta Doctrine

---

## 1. Executive Summary

This forensic audit compares the specifications and certified invariants of **VS5**, **VS6**, and **VS7** against the concrete codebase to detect architectural drift, state-model incompatibilities, naming discrepancies, or bypass mechanisms.

---

## 2. Cross-Vertical Architectural Drift Matrix

| Dimension | VS5 (Intelligence) | VS6 (Operations) | VS7 (Quality & Corrections) | Discovered Drift / Inconsistency | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **State Models** | `signals`: `raw` -> `clustered` -> `prioritized` -> `triaged` | `incidents`: `open` -> `acknowledged` -> `resolved` | `reader_corrections`: `received` -> `triaged` -> `in_review` -> `resolved` -> `rejected` | **Slight Divergence:** VS5 uses `triaged` as a terminal phase before research promotion; VS7 uses `triaged` as an intermediate phase before `in_review`. | Low (Contextually appropriate) |
| **Error Semantics** | Returns typed error objects (`PibFeedError`) without throwing | Returns HTTP 500 / 403 with structured JSON error details | Returns JSON `{ success: false, message: ... }` with explicit HTTP status codes | **Consistent:** None throw raw uncaught exceptions into unhandled route handlers. | None |
| **Audit Semantics** | Ingestion run IDs and observation SHA hashes | Structured operational alerts and security audit logs | Append-only published errata in `public.corrections` | **Consistent:** All three enforce non-destructive audit records. | None |
| **Authorization** | Restricted to `researcher` / `staff` via JWT | Restricted to `staff` / `admin` via Control Plane guards | Public anonymous submission; staff-only triage | **Consistent:** Respects the multi-role security matrix. | None |
| **Observability Integration** | Scorecard & ingestion throughput sampled in pipeline health | Pipeline health aggregator monitors stages 1–10 | Correction queue is NOT sampled in pipeline health | **REAL DRIFT:** VS6 pipeline health has not yet integrated the VS7 corrections queue depth. | **Medium (P1 Gap)** |
| **Story UI Integration** | Clustered signals surfaced on `/intel` | Incident alerts surfaced on `/operations` | Corrections surfaced on `/transparency/corrections`, but not yet on `/story/[slug]` | **REAL DRIFT:** Story pages lack in-context banner rendering. | **Medium (P1 Gap)** |
| **Naming Conventions** | CamelCase services, kebab-case schemas, PascalCase components | CamelCase services, kebab-case schemas, PascalCase components | CamelCase services, kebab-case schemas, PascalCase components | **Consistent:** Standard across all verticals. | None |
| **Persistence Boundary**| PostgreSQL Supabase schemas `newsroom` (Mig 011, 012) | Ephemeral memory + Supabase queries | PostgreSQL Supabase schema `public` (Mig 013) | **Consistent:** Zero schema mutations introduced by VS6 or VS7. | None |

---

## 3. Drift Analysis Verdict

The platform architecture exhibits remarkably low drift. The only substantive architectural drift discovered is **incomplete observational integration** between the newer VS7 correction subsystem and the VS6 operational pipeline health aggregator.
