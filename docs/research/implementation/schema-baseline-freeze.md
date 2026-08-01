# Schema Baseline Freeze — Step 3B Validated Baseline

**Date:** 20 Jul 2026
**Status:** FROZEN — All subsequent changes require explicit migration
**Supabase Project:** swektehukscmsgxdzymw

---

## Purpose

This document records the validated schema baseline as of Step 3B completion. Migrations 001–006, the 77/77 test suite, and the 31/31 validation script collectively define the canonical data model for the research ingestion pipeline.

Any schema change after this baseline requires:
1. A new numbered migration (007+)
2. Updated test coverage
3. Updated validation script checks
4. This document updated with the new baseline tag

---

## Frozen Artifacts

| Artifact | Version/Hash | Date |
|----------|-------------|------|
| Migration 001 | `001_create_tables.sql` | Pre-20 Jul |
| Migration 002 | `002_canonical_schema.sql` | Pre-20 Jul |
| Migration 003 | `003_image_intelligence_schema.sql` | Pre-20 Jul |
| Migration 004 | `004_canonical_research_schema.sql` (modified) | 20 Jul 2026 |
| Migration 005 | `005_research_gap_schema.sql` (modified) | 20 Jul 2026 |
| Migration 006 | `006_financial_record_identity_and_geography.sql` | 20 Jul 2026 |
| Migration 007 | `007_close_financial_canonical_id_nulls.sql` | 20 Jul 2026 |
| Migration 008 | `008_relax_constituency_canonical_id_check.sql` | 20 Jul 2026 |
| Test suite | 77/77 pass (20 invariants + 57 DB integration) | 20 Jul 2026 |
| Validation script | 31/31 pass (STEP3B_COMPLETE_PILOT batch) | 20 Jul 2026 |
| Build | 225 pages, `tsc --noEmit` pre-existing only | 20 Jul 2026 |
| Production batch | 12 constituencies, 22 claims, 31 sources, 14 financial records ingested | 20 Jul 2026 |

---

## Research Schema — Core Tables

### Entity Tables

| Table | PK | Identity | Notes |
|-------|----|----------|-------|
| `research_projects` | `id UUID` | `name` (not unique) | Project-level grouping |
| `research_constituencies` | `id UUID` | `canonical_id VARCHAR(100)` | AC/LS/PC identifiers |
| `research_persons` | `id UUID` | `canonical_id VARCHAR(100)` | Political figures |
| `research_political_parties` | `id UUID` | `canonical_id VARCHAR(100)` | `official_name` column |
| `research_evidence_items` | `id UUID` | `id` | Each item linked to one source |
| `research_sources` | `id UUID` | `id` | Source documents |
| `research_claims` | `id UUID` | `canonical_id VARCHAR(100)` | Assertions with provenance |
| `research_gaps` | `id UUID` | `canonical_id VARCHAR(100)` | Documented research gaps |
| `research_search_protocols` | `id UUID` | `canonical_id VARCHAR(100)` | Search methodology records |

### Junction Tables

| Table | FK1 | FK2 | Notes |
|-------|-----|-----|-------|
| `research_claim_evidence_relationships` | claim_id → claims | evidence_id → evidence | RLS enabled (migration 005) |
| `research_claim_subject_relationships` | claim_id → claims | constituency_id OR project_id | `exactly_one_target` CHECK |
| `research_financial_records` | project_id → projects | reporting_source_id → sources | `canonical_id UNIQUE` (nullable) |

### Financial Records — Extended Columns (Migration 006)

| Column | Type | Purpose |
|--------|------|---------|
| `canonical_id` | `VARCHAR(100) UNIQUE` | Stable identifier (nullable for legacy) |
| `target_geography` | `TEXT` | Free-text geographic scope |
| `target_constituency_id` | `UUID FK` | Constituency-level attribution |

---

## Key Enum Types

### `publication_status_type`
`DRAFT | UNDER_REVIEW | REVISION_REQUESTED | APPROVED | PUBLISHED | ARCHIVED`

### `value_availability_status_type`
`REPORTED | OFFICIAL | ESTIMATED | UNVERIFIED | UNAVAILABLE | NOT_FOUND`
(MIGRATION DEBT: `REPORTED` conflates source-characterization with value-availability — DEBT-A2-REPORTED-MIX)

### `claim_confidence_type`
`C1 | C2 | C3 | C4 | C5`

### `claim_scope_type`
`PRIMARY_SUBJECT | RELATED_ENTITY | GEOGRAPHIC_SCOPE`

### `financial_stage_type`
`BUDGET_PROVISION | ADMINISTRATIVE_SANCTION | FINANCIAL_SANCTION | REPORTED_EXPENDITURE | REVENUE_REALISED`

### `financial_amount_operator_type`
`EXACT | GREATER_THAN | LESS_THAN | APPROXIMATE`

---

## RLS Policy Summary

All policies use `auth.jwt() -> 'app_metadata' ->> 'research_role'` — no forbidden patterns.

7 permissive policies on `research_claims` covering:
- `researcher_insert_claims` (INSERT, DRAFT + UNREVIEWED)
- `researcher_update_claims` (UPDATE, DRAFT + UNREVIEWED)
- `reviewer_update_claims` (UPDATE, DRAFT/UNDER_REVIEW/REVISION_REQUESTED)
- `editor_update_claims` (UPDATE, any status)
- `admin_update_claims` (UPDATE, any status)
- `internal_read_claims` (SELECT, all non-ANON roles)
- `public_read_published_claims` (SELECT, PUBLISHED only)

RLS enabled on: `research_claims`, `research_claim_evidence_relationships`, `research_claim_subject_relationships`

---

## GRANT Statements (Migrations 004/005)

All research tables have GRANTs for:
- `anon`: SELECT only
- `authenticated`: SELECT, INSERT, UPDATE
- `service_role`: Full access (SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER)

---

## Validated Evidence Patterns (From 4-Constituency Pilot)

| Pattern | Example | Constituency |
|---------|---------|-------------|
| Electoral chronology | conviction → disqualification → by-election | Rampur (AC-37) |
| Financial lifecycle | budget → sanction → Phase 1 → state contribution | Ayodhya (Airport) |
| Contradiction pair | PWD claims vs CAG findings | Karhal (Mainpuri) |
| Boundary distinction | town ≠ AC ≠ district ≠ block | Kairana (AC-8) |
| NOT_FOUND search | systematic gap documentation | Kairana (AC-8) |

---

## Known Debt

| ID | Description | Impact | Required Before | Status |
|----|-------------|--------|----------------|--------|
| DEBT-A2-REPORTED-MIX | `REPORTED` conflates source-characterization with value-availability | Ambiguous analytics | 403 scale-up | OPEN |
| DEBT-FIN-CANONICAL-ID-NULLS | Legacy financial records lack canonical_id | No dedup for legacy | 403 scale-up | CLOSED (Migration 007) |

---

## Gate

This baseline is frozen as of Step 3B completion. Any subsequent schema modification is a new migration requiring:
- Updated `EXPECTED_MIGRATIONS` in `tests/research/db-integration.test.ts`
- Updated `PRE_001_DENY_TYPES` if new enum types are introduced
- Updated `validate-vertical-slice.js` if new tables/columns are checked
- Updated `enforcement-status.md` with new test results
