# Step 3A — Foundation Enforcement Status

**Date:** 20 Jul 2026
**Status:** VERIFIED — All gates pass
**Supabase Project:** swektehukscmsgxdzymw

---

## Executive Summary

The Canonical Research Architecture foundation is fully enforced. PostgreSQL migrations 001–004 apply cleanly. RLS policies execute correctly against real Supabase infrastructure. All 77 tests pass (20 invariants + 57 DB integration).

---

## Test Results

### Foundation Invariants — 20/20 PASS

| Suite | Tests | Status |
|-------|:-----:|:------:|
| Zod Structural Edge | 3 | PASS |
| Bitemporal Core | 2 | PASS |
| Domain Identity Segregation | 3 | PASS |
| Financial Value Availability | 4 | PASS |
| Party Affiliation Exclusivity | 2 | PASS |
| Publication Lifecycle | 3 | PASS |
| Claim Relational Scope | 2 | PASS |
| Governance | 1 | PASS |

### Database Integration — 57/57 PASS

| Suite | Tests | Status |
|-------|:-----:|:------:|
| Migration Pipeline | 3 | PASS |
| Core FK/CHECK Constraints | 4 | PASS |
| Bitemporal / Exclusion | 4 | PASS |
| ClaimSubject Option B | 5 | PASS |
| Financial Semantics | 7 | PASS |
| Publication/Review Semantics | 6 | PASS |
| RLS Authorization Matrix | 8 | PASS |
| Privileged Path, Correction, Concurrency | 6 | PASS |
| Negative Authorization & Privilege Escalation | 10 | PASS |
| Static Policy Consistency | 4 | PASS |

---

## Build Verification

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | PASS (pre-existing errors in audit/, packages/, plugins/ only) |
| `npm run build` | PASS (225 pages) |
| `npm run test:research` | PASS (77/77) |

---

## RLS Enforcement Verified

### Vulnerability Remediated

PostgreSQL evaluates multi-policy WITH CHECK as `(CHECK_A OR CHECK_B)`. This meant a researcher's WITH CHECK could be bypassed if another policy's WITH CHECK granted broader access.

**Fix:** Every WITH CHECK expression now independently validates the user's role identity:

```sql
-- researcher_insert_claims
WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    AND publication_status = 'DRAFT'
)

-- researcher_update_claims
WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    AND publication_status = 'DRAFT'
    AND human_review_status = 'UNREVIEWED'
)
```

### Claim Path — Canonical

All 7 role-based policies use:
```sql
(SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
```

No policy uses the forbidden pattern:
```sql
current_setting('request.jwt.claims', true)::json->>'role'  -- FORBIDDEN
```

### Negative Authorization Tests

| Test | Expected | Result |
|------|----------|--------|
| Anonymous INSERT | Denied | PASS |
| No research_role INSERT | Denied | PASS |
| Unknown research_role INSERT | Denied | PASS |
| Researcher UPDATE human_review_status | Denied | PASS |
| Researcher PUBLISH | Denied | PASS |
| Reviewer PUBLISH | Denied | PASS |
| Editor INSERT | Denied | PASS |
| Researcher UPDATE affiliation_history | Denied | PASS |
| Self-promotion via updateUser | Denied | PASS |
| Agent INSERT PUBLISHED | Denied | PASS |

---

## Test Architecture Note

DB integration tests use direct SQL with `SET LOCAL role` + `SET LOCAL request.jwt.claims` to test RLS at the PostgreSQL level, bypassing PostgREST's schema cache limitation. This is the canonical enforcement path — PostgREST is a proxy, not the security boundary.

---

## Authorization Matrix (Verified)

| Operation | Anon | No Role | Researcher | Reviewer | Editor | Admin | Agent | Service |
|-----------|:----:|:-------:|:----------:|:--------:|:------:|:-----:|:-----:|:-------:|
| SELECT (PUBLISHED) | Y | Y | Y | Y | Y | Y | Y | Y |
| SELECT (DRAFT) | - | - | Y | Y | Y | Y | Y | Y |
| INSERT | - | - | Y | - | - | - | Y* | Y |
| UPDATE DRAFT | - | | Y** | Y*** | Y | Y | - | Y |
| UPDATE PUBLISHED | - | - | - | Y*** | Y | Y | - | Y |
| DELETE | - | - | - | - | - | - | - | Y |

\* Agent: DRAFT + UNREVIEWED only
\** Researcher: DRAFT only, DRAFT + UNREVIEWED after
\*** Reviewer: cannot set PUBLISHED (WITH CHECK blocks)
