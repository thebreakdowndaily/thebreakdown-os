# The Breakdown OS — Data Persistence & Migration Analysis (VS7)

**Phase:** VS7 Architecture Reconnaissance & Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Persistence Analysis  
**Governing Rule:** Migration Head Immutability (HEAD remains 016)

---

## 1. Executive Summary

A core question of VS7 architecture reconnaissance is:
> *Does VS7 require creating a new database migration (`017_*.sql`)?*

**Definitive Answer:** **NO.**
The database migration chain definitively terminates at:
`supabase/migrations/016_api_keys_and_rate_limiting.sql`.

Forensic investigation reveals that all persistence requirements for candidate VS7 capabilities (reader corrections, errata notices, and audit snapshots) **already exist** in migrations 002 and 013. Creating migration 017 would violate the Platform Beta "No Speculative Infrastructure" rule and introduce unnecessary migration friction into a certified baseline.

---

## 2. Inventory of Existing Candidate Schemas

### 2.1. Migration 013: Corrections & Errata Engine
Defined in `supabase/migrations/013_create_corrections_schema.sql`:

1. **`public.corrections` (Public Append-Only Errata Projection)**
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `story_id UUID NOT NULL REFERENCES public.stories(id)`
   - `story_version_id UUID REFERENCES audit.story_versions(id)`
   - `claim_id UUID REFERENCES newsroom.claims(id)`
   - `verification_event_id UUID UNIQUE` (idempotent 1:1 mapping to verification events)
   - `category TEXT CHECK (category IN ('factual', 'source', 'interpretive', 'clarification', 'context_update', 'retraction'))`
   - `previous_wording TEXT`
   - `corrected_wording TEXT`
   - `explanation TEXT`
   - `superseded_by_id UUID REFERENCES public.corrections(id)`
   - `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`
   - **RLS Configuration:**
     - `SELECT`: Open to `anon` (`public_read_corrections`).
     - `INSERT` / `UPDATE`: Restricted to `research_role` in `('researcher', 'reviewer', 'editor', 'administrator', 'automated_ingestion_agent')`.
     - `DELETE`: Explicitly disallowed (no policy; immutable ledger).

2. **`public.reader_corrections` (Private Reader Submission Queue)**
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `story_id UUID REFERENCES public.stories(id)`
   - `story_slug TEXT NOT NULL`
   - `claim_id UUID REFERENCES newsroom.claims(id)`
   - `category TEXT DEFAULT 'factual'`
   - `passage_excerpt TEXT NOT NULL`
   - `suggested_correction TEXT NOT NULL`
   - `submitter_email TEXT` (Private, never exposed)
   - `supporting_evidence_url TEXT`
   - `status TEXT DEFAULT 'received' CHECK (status IN ('received', 'triaged', 'in_review', 'resolved', 'rejected'))`
   - `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`
   - **RLS Configuration:**
     - `INSERT`: Open to public (`anon` / `authenticated`) with CHECK:
       `status = 'received' AND passage_excerpt <> '' AND suggested_correction <> ''`.
     - `SELECT` / `UPDATE`: Restricted strictly to staff/editorial roles.
     - `DELETE`: Explicitly disallowed (preserves submission integrity).

---

### 2.2. Migration 002: Canonical Claim & Evidence Schema
Defined in `supabase/migrations/002_canonical_schema.sql`:
- `editorial.claims`: Canonical claim registry (`id`, `statement`, `status`, `confidence`).
- `editorial.sources`: Canonical source registry (`id`, `title`, `author`, `publisher`, `doi`, `is_peer_reviewed`).
- `editorial.evidence_items`: Primary evidence links.
- `audit.story_versions`: Historical snapshots created automatically by `trg_stories_archive` upon version increment.

---

### 2.3. Migration 016: Distributed Rate Limiting & API Keys
Defined in `supabase/migrations/016_api_keys_and_rate_limiting.sql`:
- `public.api_rate_limits`: Token-bucket distributed rate limiting with sliding window fallback.
- Can be directly utilized to rate-limit the public reader correction submission endpoint (`/api/corrections/submit`).

---

## 3. Persistence Decision Matrix for VS7

| Capability | Requires Schema Change? | Existing Schema Location | Migration Needed? |
| :--- | :--- | :--- | :--- |
| **Reader Correction Submission** | NO | `public.reader_corrections` (Mig 013) | **NO** |
| **Editorial Correction Triage** | NO | `public.reader_corrections` (Mig 013) | **NO** |
| **Published Errata Transparency** | NO | `public.corrections` (Mig 013) | **NO** |
| **Gold Standard Review Scoring** | NO | Code evaluation (`lib/editorial/gold-standard-review.ts`) + story metadata JSONB | **NO** |
| **Founding Chapter 1 Assembly** | NO | `editorial.claims`, `editorial.sources`, `public.stories` (Mig 002) | **NO** |

---

## 4. Architectural Verdict

**Number of new migrations required for VS7:** `0`  
**Migration HEAD:** `016_api_keys_and_rate_limiting.sql` (UNCHANGED)  
**Schema Safety:** 100% compliant with existing RLS and migration verification tests.
