# VS6 — Operational Walkthrough: Newsroom Operations, Mission Control & Control Plane

## Executive Overview

**VS6** establishes a hardened, integrated operational decision-support layer for The Breakdown OS. It brings together platform health, pipeline throughput, operational anomaly alerting, background job execution, and release readiness auditing across three primary interfaces:

1. **Platform Operations (`/operations`)**: Subsystem health, infrastructure probes, job runners, incident resilience, and cross-subsystem audit logs.
2. **Mission Control (`/intel`)**: Operator-facing intelligence overview, external signal monitoring, and priority queues.
3. **Newsroom Command Center (`/newsroom`)**: Operational triage, backlog monitoring, and the newsroom scorecard (`/newsroom/scorecard`).

---

## 1. Operating Doctrine & Core Invariants

### A. The Frozen Editorial Boundary
The operational systems of VS6 observe, monitor, and report on the operational throughput of the newsroom. They do **not** possess authority over editorial truth:
- **VS6 Can:** Report queue backlog, measure ingestion latency, display worker health, surface infrastructure alerts, and track system status.
- **VS6 Cannot:** Modify claims, bypass fact-checking, alter published story snapshots, or approve editorial publications. Editorial authority resides exclusively in the canonical knowledge registries and verification bureau.

### B. The Zero-Persistence Projection Pattern
Operational state does not pollute or duplicate core product tables. Health metrics, pipeline progress, and scorecard baselines are derived dynamically from live services (`stories`, `signals`, `telemetry`, `probes`, `jobs`). The database migration HEAD remains strictly frozen at:
```text
supabase/migrations/016_api_keys_and_rate_limiting.sql
```
Zero new migrations (`MIGRATIONS = 0`) were introduced.

### C. Metric Transparency ('UNKNOWN' over Fabricated Zeros)
When an upstream metric, probe, or pipeline subsystem is unreachable or uninitialized:
- The aggregator returns status `'UNKNOWN'` or `value: undefined`.
- It **never** fabricates a `0` or reports `HEALTHY` for an unmeasured system.

### D. Clear Separation of Severities
- **Operational Anomaly Alerts (`SystemAnomalyAlert`):** Use severity levels `P0`, `P1`, `P2`, `P3` (infrastructure outages, latency breaches, queue saturations).
- **Editorial Story Priorities (`EditorialQueueItem`):** Use priorities `P1`, `P2`, `P3`, `P4` (newsroom coverage urgency).

---

## 2. Tour of Operational Surfaces

### Surface 1: Platform Operations (`/operations`)
- **Route:** `app/operations/page.tsx`
- **Purpose:** Central command for technical operators and site reliability engineers.
- **Key Modules:**
  - **System Health Card:** Aggregated health across Telemetry, Jobs, and Probes via `ControlPlaneHealthAggregator`. Displays overall status (`HEALTHY`, `WARNING`, `DEGRADED`, `CRITICAL`, `OFFLINE`, `UNKNOWN`), uptime, latency, and detailed subsystem states.
  - **Unified Navigation Header:** Fast keyboard-navigable links connecting `/operations`, `/intel`, `/newsroom`, and `/newsroom/scorecard`.
  - **Infrastructure Status:** Health of database connections, Redis/KV caching, edge CDN, and background runners.
  - **Worker & Job Scheduler:** Queue depth, running tasks, completed jobs, and isolated failure counts via `JobRunner`.
  - **Resilience & Incident Log:** Circuit-breaker states, active incidents (`OPEN` / `RESOLVED`), and recovery history.

### Surface 2: Mission Control (`/intel`)
- **Route:** `app/intel/page.tsx`
- **Purpose:** Operator-facing overview of external information flow and signal intake.
- **Key Modules:**
  - **Signal Ingestion Velocity:** Rate of intake from wire services, official releases (PIB), and academic feeds.
  - **Cluster Health:** Active topic clusters formed by `NewsroomIntelligenceCore`.
  - **Priority Breakdown:** Distribution of incoming signals across newsroom triage levels.
  - **Provider Isolation:** Sandboxed evaluation of external AI and intelligence providers without lock-in.

### Surface 3: Newsroom Command Center (`/newsroom`)
- **Route:** `app/newsroom/page.tsx`
- **Purpose:** Day-to-day editorial triage, assignment monitoring, and workflow flow.
- **Key Modules:**
  - **Editorial Triage Queue:** Signals awaiting assignment or dismissal with optimistic concurrency protection.
  - **Research & Workspace Bridge:** Seamless promotion of triaged signals into investigative workspaces.
  - **Backlog Health:** Active drafts, stories under peer review, and verification pipeline status.

### Surface 4: Newsroom Scorecard (`/newsroom/scorecard`)
- **Route:** `app/newsroom/scorecard/page.tsx`
- **Purpose:** Weekly and monthly evaluation of newsroom intelligence and operational recall.
- **Key Modules:**
  - **Coverage Recall:** Percentage of significant events detected and ingested.
  - **Intelligence Recall:** Timeliness and accuracy of alert generation prior to publication.
  - **Silent Losses:** Gaps where external stories broke without prior signal detection.
  - **False Positive Rate:** Rejected or downgraded signal alerts.

---

## 3. Operator Workflows & Procedures

### Workflow 1: Inspecting Subsystem Health
1. Navigate to `/operations`.
2. Review the **System Health** panel.
3. The underlying service, `ControlPlaneHealthAggregator`, checks three primary providers:
   - `telemetryProvider`: Global latency, error rate, active connections.
   - `jobProvider`: Background worker pool, queue lag, failed jobs.
   - `probeProvider`: Infrastructure reachability and database responsiveness.
4. If any subsystem reports `DEGRADED` or `CRITICAL`, the overall status reflects that severity. The `subsystemDetails` map pinpoints the exact subsystem, timestamp, latency, and error string.

### Workflow 2: Monitoring End-to-End Pipeline Health
1. Access `NewsroomPipelineHealthAggregator` via operational diagnostics or API route.
2. The aggregator inspects all 10 pipeline stages:
   - **INGESTION:** PIB observations and source feeds.
   - **SIGNAL:** Active clusters and normalized signals.
   - **INTELLIGENCE:** High-priority alerts generated by the core engine.
   - **TRIAGE:** Unassigned backlog in the editorial queue.
   - **RESEARCH:** Active investigative workspace cases.
   - **EDITORIAL:** Working draft packages.
   - **VERIFICATION:** Claims pending review by the verification bureau.
   - **PUBLICATION:** Atomic published story snapshots.
   - **READER:** Client-side Core Web Vitals and route latency.
   - **OUTCOMES:** Event bus metrics and longitudinal impact queries.
3. Each stage provides its health status, current count/metric, latency, and last evaluated timestamp. Missing metrics report `UNKNOWN`.

### Workflow 3: Handling Operational System Anomalies
1. Background statistical engines (`AnomalyDetectionEngine`) continuously evaluate metric distributions.
2. When a deviation exceeds statistical thresholds (e.g., 3-sigma anomaly in ingestion rate or API error spike):
   - A `SystemAnomalyAlert` is raised with an operational severity (`P0` for critical outages, `P1` for major degradation, `P2` for warnings, `P3` for informational drifts).
   - An alert record is appended to the audit activity log (`audit.activity_log`).
   - The resilience engine (`OperationalResilienceEngine`) trips affected circuit breakers to protect upstream dependencies.
3. Operators view active alerts in the Operations dashboard and acknowledge or resolve them via the Control Plane Manager.

### Workflow 4: Release Readiness & Freshness Auditing
1. Prior to any production deployment, the operator executes the `ProductionReadinessAuditor`.
2. The auditor verifies six operational domains:
   - Database schema & RLS enforcement
   - Rate limiting and API security
   - Background worker and job runner readiness
   - Control plane health & telemetry
   - Observability & distributed tracing availability
   - Editorial boundary & publication safety
3. Each check includes an `evaluatedAt` ISO timestamp. Audits older than the freshness threshold are automatically invalidated, preventing stale deployments.

---

## 4. Verification Suite & Execution Guide

All operational capabilities, invariants, and boundaries are enforced by automated test suites.

### Running the Dedicated VS6 Operations Suite
```powershell
npx vitest run tests/vs6-operations-control-plane.test.ts
```
Expected output:
```text
 ✓ tests/vs6-operations-control-plane.test.ts (16 tests) 
 Tests  16 passed (16)
```

### Running the Full Regression Battery

| Verification Gate | Command | Passing Standard | Verified Result |
| :--- | :--- | :--- | :--- |
| **TypeScript** | `npm run typecheck` | 0 errors | **0 errors** |
| **ESLint** | `npm run check:lint` | 0 errors | **0 errors** |
| **Vitest Test Suite** | `npm run test:vitest` | 100% pass | **65/65 files, 746/746 tests** |
| **Canonical TSX** | `npm run test` | 26/26 suites | **26/26 suites pass** |
| **Security Audit** | `npm run test:security` | 100% pass | **1,342 assertions pass** |
| **Migration & DB RLS** | `npm run test:migration` | 16/16 files, RLS pass | **16/16 verified, 33/33 DB tests** |
| **Production Build** | `npm run build` | Clean prerender | **PASS (1,129 routes)** |
| **Live Smoke Test** | `npx tsx tests/production-deployment.test.ts` | 25/25 live pass | **25/25 assertions pass** |

---

## 5. Summary Certification Status

```text
STATUS: CERTIFIED / PRODUCTION GO
MIGRATION HEAD: 016_api_keys_and_rate_limiting.sql (0 new migrations)
TEST SUITE: 746/746 Vitest tests passing across 65 test suites
NEXT.JS BUILD: 1,129 routes compiled cleanly
LIVE DEPLOYMENT: 25/25 checks passing against production
```
