# The Breakdown OS — Cross-Vertical Security Matrix (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Cross-Vertical Security Matrix  
**Governing Documents:** Security Protocol, AGENTS.md, Migration 015/016

---

## 1. Multi-Tier Role Taxonomy

The Breakdown OS enforces authorization via PostgreSQL Row Level Security (RLS), Next.js Middleware gates, and server-side RBAC guards:

1. **Anonymous (`anon`):** Unauthenticated public internet visitors.
2. **Reader (`authenticated`):** Logged-in public subscribers with standard reader accounts.
3. **Staff (`researcher` / `reviewer`):** Verified internal researchers, fact-checkers, and reporters.
4. **Editor (`editor`):** Editorial bureau leaders authorized to approve drafts and publish errata.
5. **Administrator (`administrator`):** Senior platform operators and system administrators.
6. **Worker / Ingestion Agent (`automated_ingestion_agent`):** Machine service accounts for background intake and scheduled jobs.

---

## 2. Cross-Vertical Authorization Matrix

| Actor | Intelligence (VS5) | Research (VS3) | Editorial (VS1) | Verification (VS2) | Corrections (VS7) | Publication (P0) | Operations (VS6) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Anonymous** | **DENY (403)**<br>`/intel` middleware gate | **DENY (403)**<br>`/research` protected | **READ ONLY**<br>Published stories only | **READ ONLY**<br>Claim cards & evidence on published stories | **SUBMIT ONLY**<br>Rate-limited intake; READ errata ledger; NO SELECT on submissions | **DENY**<br>Fail-closed 404 on unapproved drafts | **DENY (403)**<br>`/operations` gated |
| **Reader** | **DENY (403)**<br>`/intel` middleware gate | **DENY (403)**<br>`/research` protected | **READ ONLY**<br>Can save/bookmark; cannot edit stories | **READ ONLY**<br>Inspect evidence drawer | **SUBMIT ONLY**<br>Rate-limited intake; READ errata ledger; NO SELECT on submissions | **DENY**<br>Cannot publish content | **DENY (403)**<br>`/operations` gated |
| **Staff** | **READ + TRIAGE**<br>View clusters, assign priorities | **READ + WRITE**<br>Create workspace cases & hypotheses | **READ + DRAFT**<br>Create and edit drafts in `/cms` | **EVALUATE**<br>Perform evidence and bias audits | **TRIAGE**<br>View submissions queue; update status to `in_review` | **DENY**<br>Requires Editor role to publish | **READ ONLY**<br>View pipeline health |
| **Editor** | **FULL ACCESS**<br>Approve intelligence investigations | **FULL ACCESS**<br>Review investigative case dossiers | **FULL ACCESS**<br>Approve stories and structure series | **APPROVE**<br>Sign off on 7-phase Gold Standard audit | **FULL ACCESS**<br>Resolve submissions; publish errata to `public.corrections` | **AUTHORIZE**<br>Execute publication gate and trigger publish | **OPERATE**<br>Acknowledge alerts, view metrics |
| **Admin** | **SUPERUSER** | **SUPERUSER** | **SUPERUSER** | **SUPERUSER** | **SUPERUSER** | **SUPERUSER** | **FULL CONTROL**<br>Trigger manual job runs, manage incidents |
| **Worker** | **INGEST**<br>Insert signals and raw observations | **READ ONLY**<br>Reference dossiers | **DENY**<br>Cannot write story narrative | **VALIDATE**<br>Automated URL & source validation | **DENY**<br>Cannot triage corrections | **EXECUTE**<br>Autonomous scheduled publishing via validated gate | **TELEMETRY**<br>Emit health heartbeats & alerts |

---

## 3. Row Level Security (RLS) Parity Audit

1. **`public.reader_corrections`:**
   - `INSERT`: Open to `anon` and `authenticated` with strict constraint `CHECK (status = 'received' AND passage_excerpt <> '' AND suggested_correction <> '')`.
   - `SELECT`: Restricted to `staff`, `editor`, and `admin` via JWT `research_role`. Unauthenticated queries return 0 rows.
   - `UPDATE`: Restricted to `staff`, `editor`, and `admin`.
   - `DELETE`: Explicitly disallowed for all roles (immutable intake).
2. **`public.corrections`:**
   - `SELECT`: Open to `anon` and `authenticated` (`USING (true)`).
   - `INSERT` / `UPDATE`: Restricted to `staff`, `editor`, and `admin`.
   - `DELETE`: Explicitly disallowed for all roles (immutable public projection).
3. **`public.stories`:**
   - `SELECT`: Open for stories where `publicationStatus = 'published' AND publishedAt <= now()`. Drafts strictly denied to anonymous actors.
   - `UPDATE`: Restricted to `editor` and `admin`.

---

## 4. Security Audit Verdict

The cross-vertical security model is consistent, multi-layered, and backed by PostgreSQL Row Level Security. Submitter PII is completely shielded from public discovery, and all privileged operational and editorial mutations require verified JWT claims.
