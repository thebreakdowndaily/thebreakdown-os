# The Breakdown OS — VS7 Target Architecture Specification

**Phase:** VS7 Architecture Reconnaissance & Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Target Architecture  
**Governing Documents:** AGENTS.md, Editorial Constitution v1.1, CTO Directive v2.0

---

## 1. Scope & Objective

**VS7 Name:** Editorial Quality, Reader Corrections & Founding Publication Readiness  
**Objective:** Deliver the final reader-facing trust mechanisms (Reader Error Reporting, Public Errata Transparency, Automated Gold Standard Review Quality Gate) and complete Volume I, Chapter 1 to full Article XI density standards without introducing any new database migrations or speculative generic infrastructure.

---

## 2. Architectural Boundary Definition

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VS7 ARCHITECTURAL BOUNDARY                      │
│                                                                        │
│  [ Reader Product Surface ]          [ API & Triage Boundary ]         │
│  ┌───────────────────────────┐      ┌───────────────────────────────┐  │
│  │ StoryShell                │      │ /api/corrections/submit       │  │
│  │ - Report Error Drawer     │─────>│ - Rate Limiter (Mig 016)      │  │
│  │ - Claim Correction Badges │      │ - Zod Validation              │  │
│  │ - Errata Footer Notice    │      │ - Supabase Client             │  │
│  └───────────────────────────┘      └───────────────┬───────────────┘  │
│                                                     │                  │
│  [ Transparency Surface ]                           ▼                  │
│  ┌───────────────────────────┐      ┌───────────────────────────────┐  │
│  │ /transparency/corrections │      │ public.reader_corrections     │  │
│  │ (Public Errata Ledger)    │<─────│ (Migration 013 - Existing)    │  │
│  └───────────────────────────┘      └───────────────┬───────────────┘  │
│                                                     │ Staff Triage     │
│  [ Editorial Quality Gate ]                         ▼                  │
│  ┌───────────────────────────┐      ┌───────────────────────────────┐  │
│  │ Gold Standard Evaluator   │      │ public.corrections            │  │
│  │ (7-Phase Audit Engine)    │      │ (Migration 013 - Existing)    │  │
│  │ -> publication-gate.ts    │      └───────────────────────────────┘  │
│  └───────────────────────────┘                                         │
│                                                                        │
│  [ Founding Publication ]                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Volume I, Chapter 1: The Partition and Its Legacies              │  │
│  │ - 50+ Claims | 120+ Evidence | 100+ Sources | 5 Reader Modes     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1. What VS7 Owns
1. **Reader Error Reporting UI:** Clean, accessible modal / slide-over drawer attached to `StoryShell` allowing readers to submit factual corrections against a story or specific claim.
2. **Public Correction Submission API:** `POST /api/corrections/submit` validating schema, enforcing rate limits, and inserting into `public.reader_corrections`.
3. **Public Errata Transparency Surface:** Route `/transparency/corrections` displaying published corrections from `public.corrections` with story cross-links and change explanations.
4. **Automated Gold Standard Quality Gate:** Integration between `lib/editorial/gold-standard-review.ts` and `lib/editorial/publication-gate.ts` enforcing Article XI density and defensibility rules before story status can transition to `published`.
5. **Volume I, Chapter 1 Knowledge Object Assembly:** Canonical claims, evidence, sources, and historiographical views for The Breakdown's founding flagship publication.
6. **Dedicated Test Suite:** `tests/vs7-editorial-quality-and-corrections.test.ts`.

---

### 2.2. What VS7 Reads
- `public.stories`, `editorial.claims`, `editorial.sources`, `editorial.evidence_items` (canonical models).
- `public.corrections` and `public.reader_corrections` (persisted errata).
- `public.api_rate_limits` (PostgreSQL rate limiting).

---

### 2.3. What VS7 Writes
- Append rows to `public.reader_corrections` with status `received`.
- Append rows to `public.corrections` upon editorial staff resolution.
- Story audit quality metadata (JSONB) in editorial workspace.

---

### 2.4. What VS7 Observes
- Pipeline health metrics from `lib/operations/pipeline-health.ts`.
- Operational alert streams from `lib/observability/intelligence-engine.ts`.

---

### 2.5. What VS7 Must NEVER Control or Mutate
- **NEVER** alter or mutate `newsroom.signals`, `newsroom.clusters`, or intelligence deduplication pipelines (frozen in VS5).
- **NEVER** modify Control Plane authorization, incident handling, or operational health calculation (frozen in VS6).
- **NEVER** create a new database migration (`017_*.sql`).
- **NEVER** bypass fail-closed publication safety gates.
- **NEVER** expose submitter email addresses (`submitter_email`) in any public endpoint or client bundle.

---

## 3. Data Flow & Sequence Diagram

```
Reader on Story Page
       │
       ▼ [Clicks "Report Error" on Claim]
Opens Correction Drawer (Passage excerpt auto-populated)
       │
       ▼ [Submits Form]
POST /api/corrections/submit
       │
       ├──> Rate Limiter Check (Token Bucket <= 5/10 min) ──> [If exceeded: 429 Too Many Requests]
       ├──> Zod Schema Validation ─────────────────────────> [If invalid: 400 Bad Request]
       ▼
INSERT INTO public.reader_corrections (status = 'received')
       │
       ▼
HTTP 201 Created (Acknowledgment ID returned)
       │
       ▼ [Asynchronous Staff Triage in CMS]
Editor reviews submission in Staff Panel
       │
       ├──> Rejected ────> UPDATE public.reader_corrections SET status = 'rejected'
       └──> Approved ────> UPDATE public.reader_corrections SET status = 'resolved'
                           INSERT INTO public.corrections (append-only errata notice)
                                  │
                                  ▼
                    Visible at /transparency/corrections
                    and in Story Header/Footer Notice
```

---

## 4. Architectural Guarantees

1. **Zero Schema Mutations:** HEAD remains `016_api_keys_and_rate_limiting.sql`.
2. **Zero Breaking Changes:** Public story URLs and canonical contracts remain 100% backward compatible.
3. **Security Invariant:** Submitter email addresses remain strictly unreadable by anonymous actors via PostgreSQL Row Level Security.
