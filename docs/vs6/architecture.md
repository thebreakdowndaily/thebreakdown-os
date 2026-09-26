# VS6 — Architecture Decision & Design Specification

## Status
**APPROVED FOR PLATFORM BETA (VS6)**

---

## 1. Architectural Vision & Authority Boundary

### 1.1 The Operational Non-Interference Invariant
VS6 introduces an operational authority layer that monitors, diagnoses, and protects the platform without ever asserting, verifying, or redefining editorial truth.

```text
                NEWSROOM SIGNALS
                       ↓
                  INTELLIGENCE
                       ↓
                   RESEARCH
                       ↓
                 EDITORIAL FLOW
                       ↓
                    PUBLISH
                       ↓
                    READER
                       ↓
               DEMAND / OUTCOMES
                       ↓
               ┌───────────────┐
               │    VS6 OPS    │
               │               │
               │ Mission Ctrl  │
               │ Control Plane │
               │ Health        │
               │ Incidents     │
               │ Operations    │
               └───────────────┘
```

### 1.2 Separation of Authorities
- **VS6 Operational Authority Owns:**
  - System and infrastructure health (`HEALTHY`, `WARNING`, `CRITICAL`).
  - Pipeline throughput, stage latency, and queue depths.
  - Job runner status, concurrency limits, and retry counters.
  - Operational incidents, recovery states (`NORMAL`, `DEGRADED`, `FAILED`), and diagnostic traces.
  - Operational alerting (P0–P3 operational severity).
  - Runtime configuration snapshots and release readiness evaluation.
- **VS6 Operational Authority Must NOT Own:**
  - Claim verification, evidence weighting, or fact-check status (owned exclusively by Verification Bureau).
  - Editorial pitch selection or narrative structuring (owned by Editorial Bureau).
  - Publication approvals (owned by Publication Authority Registry).
  - Historical interpretation or scholarly consensus.

> **Principle:** Operational visibility explains the runtime condition of the platform; it cannot alter or substitute the truth of the journalism.

---

## 2. Distinction: Mission Control vs Control Plane

The repository maintains an explicit architectural distinction between operator-facing intelligence overview and system governance:

### 2.1 Mission Control (Operator-Facing Overview)
- **Primary Surface:** `app/intel/page.tsx` (`/intel`) and associated panels in `components/intel/mission-control/`.
- **Target Audience:** Bureau chiefs, duty editors, and executive journalists.
- **Responsibility:** Provides a bird's-eye projection of active intelligence, editorial watchlists, verification backlogs, evidence health, and story pipelines.
- **Data Flow:** Pure read-only projection consuming `computeExecutiveBriefing()`. Owns zero business logic and zero mutation endpoints.

### 2.2 Control Plane (System / Governance Layer)
- **Primary Surface:** `lib/control-plane/` and `app/operations/page.tsx` (`/operations`).
- **Target Audience:** Platform engineers, site reliability operators, and systems architects.
- **Responsibility:** Evaluates system health, runtime configuration drift, job scheduler capacity, dependency probe states, and SLO error budgets.
- **Data Flow:** Uses the **Provider Isolation Pattern** (`TelemetryProvider`, `JobsProvider`, `HealthProvider`, `ConfigurationProvider`). Aggregates snapshots deterministically with strict error containment.

---

## 3. System & Pipeline Health Architecture

### 3.1 Multi-Dimensional Health Aggregation
Platform health is never represented by a single uninformative boolean. It evaluates three decoupled dimensions:
1. **Telemetry Subsystem:** Event ingestion rate, API error rate, and average latency.
2. **Job Queue Subsystem:** Active jobs, queue backlog, and failure frequency.
3. **Dependency Probes:** Database connectivity, search indexing latency, analytics sinks, and cache responsiveness.

### 3.2 Subsystem Severity Resolution Matrix

| Telemetry Status | Job Queue Status | Probe Status | Overall System Severity | Recovery State |
| :--- | :--- | :--- | :--- | :--- |
| Normal | 0 Failures | UP | `HEALTHY` | `NORMAL` |
| Degraded / Warning | 1–3 Failures | UP | `WARNING` | `DEGRADED` |
| Critical / Outage | > 3 Failures | DOWN | `CRITICAL` | `FAILED` |

### 3.3 Partial Subsystem Failure Isolation
Under the Provider Isolation pattern in `ControlPlaneManager`, if any single provider (e.g. Telemetry or Jobs) throws an unhandled exception or times out:
- The failure is isolated immediately within a `try/catch` guard.
- A safe fallback projection is injected into the snapshot.
- An alert is automatically appended to the active alerts array.
- The snapshot successfully completes with severity `WARNING` or `DEGRADED` rather than crashing the operational surface.

---

## 4. Operational Alerting vs Editorial Priority

To prevent operational-editorial confusion, the platform strictly separates alerting taxonomies:

| Level | Operational Severity (VS6) | Editorial Priority (VS1–VS5) |
| :--- | :--- | :--- |
| **P0** | **System / Publication Integrity Failure:** Database partition, publication gate violation, unhandled security breach. Immediate operator intervention required. | **Critical Flash / Real-Time Crisis:** Breaking event of national or international significance requiring immediate newsroom mobilization. |
| **P1** | **Major Operational Degradation:** Ingestion pipeline halted, job worker queue backed up, rate limiter failing open. | **Major Investigation / Flagship Story:** High-impact investigation topic with substantial evidence footprint. |
| **P2** | **Recoverable Degradation:** Upstream source feed timeout (PIB retry), telemetry sample rate drift, non-critical probe latency. | **Developing Developing Story:** Secondary newsroom signal under monitoring. |
| **P3** | **Informational / Advisory:** Routine worker completion, configuration drift audit report, cache revalidation notice. | **Background / Context:** Long-term archival or reference updates. |

---

## 5. Incident & Resilience Model

### 5.1 Incident Lifecycle
Operational incidents are managed by `OperationalResilienceEngine` adhering to an explicit state machine:
```text
  [OPEN]
    │ (Operator acknowledged)
    ▼
  [ACKNOWLEDGED]
    │ (Mitigation applied)
    ▼
  [MITIGATING]
    │ (Resolution confirmed)
    ▼
  [RESOLVED]
    │ (Post-incident review)
    ▼
  [CLOSED]
```

### 5.2 Immutable State Transitions
Every incident state transition requires:
- `actorId`: Authenticated operator initiating the transition.
- `timestamp`: UTC ISO timestamp.
- `previousStatus`: Enforced prerequisite state.
- `newStatus`: Target valid state.
- `reason`: Mandatory audit explanation.

---

## 6. Security, RLS & Concurrency Control

### 6.1 Public vs Internal Isolation
- All operational dashboards (`/operations`, `/intel`, `/newsroom`, `/newsroom/scorecard`) are strictly internal and gated by `guardIntelModule()` or `is_staff()` checks.
- Public health probes (`/api/live`, `/api/health`) are strictly sanitized to expose only coarse status (`UP` / `DOWN`) without revealing internal stack traces, database credentials, operator IDs, or queue payloads.

### 6.2 Optimistic Concurrency Control (OCC)
For any mutable operational action (such as newsroom triage in `WorkflowService` or incident status transitions in `OperationalResilienceEngine`):
- Updates must evaluate the entity version tag:
  ```sql
  UPDATE newsroom.signals
  SET triage_status = :new_status, version = version + 1
  WHERE id = :signal_id AND version = :expected_version;
  ```
- If 0 rows are affected, the operation fails with `OCCVersionConflictError`. The client UI re-fetches the latest state and prompts the operator to reconcile before retrying.

---

## 7. Database Policy & Proof of Zero Migrations

### 7.1 Forensic Analysis of Operational Persistence
- **Newsroom Pipeline State:** Already persisted in `newsroom.signals` (Supabase migration `012_create_intelligence_schema.sql`).
- **Research Cases & Gaps:** Already persisted in `public.workspace_cases` (migration `010`) and `public.research_gaps` (migration `005`).
- **Audit Logs:** Already recorded in `audit.activity_log` and `NewsroomAuditService`.
- **System Health & Probes:** Pure dynamic projections computed at request time from live service metrics.
- **Incident & Resilience States:** Managed in-memory by `OperationalResilienceEngine` and correlated through cross-subsystem audit logs.

### 7.2 Zero Migration Verdict
Adding a database migration for operational metrics would violate the Platform Beta Doctrine ("No new generic infrastructure", "Zero parallel stores") and introduce redundant persistence for ephemeral metrics.

Therefore, **VS6 requires zero database schema migrations**. Migration HEAD remains strictly at:
```text
016_api_keys_and_rate_limiting.sql
```
