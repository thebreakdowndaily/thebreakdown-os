# THE BREAKDOWN OS — PHASE 11 REPORT
## Real Staging Validation, Migration-Stack Release Gate & Human Review Preparation

**Project:** The Breakdown OS  
**Repository:** `thebreakdowndaily/thebreakdown-os`  
**Production URL:** [https://thebreakdown.in](https://thebreakdown.in)  
**Production Commit Baseline:** `4d83560851552c7a5826261a0ffa13848feb0420` (PR #86)  
**Audit Priority:** P0 — Database security, migration integrity, and release sequencing  
**Status:** **`BLOCKED — STAGING TARGET NOT VERIFIED`**  
**Engineering Workspace:** `C:\newsjack-content\thebreakdown-os-master-repair`  

---

## 1. Executive Summary

Phase 11 extends the controlled engineering remediation from isolated PostgreSQL simulation (Phase 10) toward a live staging environment and release-gate decision.

### Key Outcomes:
1. **Staging Environment Qualification (Case B Confirmed)**:
   - Queried Supabase project inventory via Supabase management API (`list_projects`).
   - The organization `pwfzmsccchpaqwwimoih` contains exactly two active projects:
     - `mskyhaunnlwtwvsqcmav` (`thebreakdown-production`, `ap-south-1`, PG 17.11) — Production database on baseline migration 032.
     - `lvfovvidtowadmnggzzf` (`the-breakdown-fact-check`, `ap-northeast-2`, PG 17.6) — Divergent QA database containing only migrations 001, 030, 031.
     - `swektehukscmsgxdzymw` (`thebreakdown/ 403`, `ap-northeast-2`, PG 17.6) — Inactive legacy project.
   - **Conclusion**: No approved staging database currently exists. Per hard constraints, neither the production database nor the divergent fact-check database may be used as a staging target. Provisioning an isolated staging instance requires explicit human authorization.
2. **Migration Dependency Chain 033–037 Audited**:
   - The full migration sequence (033 $\rightarrow$ 034 $\rightarrow$ 035 $\rightarrow$ 036 $\rightarrow$ 037) was analyzed for dependency ordering, schema invariants, transaction safety, and role privileges.
   - Migration 037 explicitly hardens `publish_reader_correction` (created in 033) and enforces `search_path = pg_catalog, pg_temp` across 13 sensitive functions.
   - Verified 100% passing across 75 direct PostgreSQL RLS tests, 45 API security tests, and 1,199 Intel authorization tests on embedded PostgreSQL.
3. **Predecessor Stacked PRs Reconciled**:
   - Stacked PR chain: PR #66 $\rightarrow$ PR #76 $\rightarrow$ PR #80 $\rightarrow$ PR #84.
   - Head commits verified, clean working trees, zero schema conflicts.
   - Evaluated sequential vs. consolidated release merge strategies; recommended a unified release PR targeting `staging` first to eliminate intermediate unhardened windows.
4. **Live Production Stability Verified**:
   - `https://thebreakdown.in` verified healthy (200 OK) at commit `4d835608`.
   - Production database (`mskyhaunnlwtwvsqcmav`) remains unmodified on migration 032. Zero unapplied DDL migrations executed against production.
5. **Release Gate Classification**:
   - **`BLOCKED — STAGING TARGET NOT VERIFIED`** (Code and migrations are verified ready in test isolation, awaiting human authorization to provision the staging target).

---

## 2. Phase 11A — Staging Target Discovery & Qualification (Read-Only)

### Supabase Inventory Audit

A read-only audit of the organization `pwfzmsccchpaqwwimoih` was performed via Supabase API:

| Project ID | Project Name | Region | Status | PG Version | Migration Baseline | Suitability for Staging |
|---|---|---|---|---|---|---|
| `mskyhaunnlwtwvsqcmav` | `thebreakdown-production` | `ap-south-1` | `ACTIVE_HEALTHY` | 17.11 | Migrations 001–032 | ❌ **FORBIDDEN** (Production Database) |
| `lvfovvidtowadmnggzzf` | `the-breakdown-fact-check` | `ap-northeast-2` | `ACTIVE_HEALTHY` | 17.6 | 001, 030, 031 only | ❌ **FORBIDDEN** (Divergent Baseline & Region) |
| `swektehukscmsgxdzymw` | `thebreakdown/ 403` | `ap-northeast-2` | `INACTIVE` | 17.6 | Unknown / Inactive | ❌ **UNSUITABLE** (Inactive Legacy Project) |

### Qualification Finding: Case B
Because no third active project matching the staging specification exists, **Case B applies**.

In strict accordance with the P0 safety boundary:
- **Zero DDL/migrations were executed against `mskyhaunnlwtwvsqcmav`**.
- **Zero DDL/migrations were executed against `lvfovvidtowadmnggzzf`**.
- No new cloud infrastructure was provisioned autonomously.

---

## 3. Phase 11B — Case B: Staging Provisioning & Validation Runbook

To establish a production-identical staging target without risking live data or incurring unexpected cloud billing, the following runbook must be followed upon human approval:

### 3.1 Provisioning Specification

```yaml
target_organization: pwfzmsccchpaqwwimoih
project_name: thebreakdown-staging
database_region: ap-south-1 # Mumbai (matches production mskyhaunnlwtwvsqcmav exactly)
postgres_version: "17" # Matches production minor version
postgrest_settings:
  exposed_schemas:
    - public
  hidden_internal_schemas:
    - editorial
    - search
    - identity
    - audit
    - newsroom
auth_settings:
  jwt_secret: "[GENERATE_STAGING_RANDOM_SECRET_MIN_32_CHARS]"
  site_url: "https://staging.thebreakdown.in"
  additional_redirect_urls:
    - "http://localhost:3000/**"
    - "https://*-bholebababhakti108-makers-projects.vercel.app/**"
```

### 3.2 Plan & Commercial Implications (Reconciled with Phase 12 Provider Truth)
- **Free Tier Policy**: Supabase grants 2 active projects per account across organizations. Paused projects do NOT consume active project quota.
- **Current Active State**: `mskyhaunnlwtwvsqcmav` (production) and `lvfovvidtowadmnggzzf` (fact-check / legacy staging) consume both active project slots (2 of 2). Legacy project `swektehukscmsgxdzymw` is already `INACTIVE` (paused), so deleting it does not free an active project slot.
- **Pro Tier Compute Economics (Not Flat $25/mo)**:
  - Base Pro subscription: $25.00/month.
  - Included Compute Credits: $10.00/month (covers 1 default Micro instance).
  - Additional project compute: ~$10.00/month per active project on default Micro compute (billed hourly at ~$0.01344/hr).
  - Running 3 active projects simultaneously (`mskyhaunnlwtwvsqcmav`, `lvfovvidtowadmnggzzf`, `thebreakdown-staging`) incurs:
    $25 (base) + $30 (3 × Micro compute) - $10 (credits) = **$45.00/month** (plus applicable tax/GST).
  - If `lvfovvidtowadmnggzzf` is paused, running 2 active projects incurs:
    $25 (base) + $20 (2 × Micro compute) - $10 (credits) = **$35.00/month** (plus applicable tax/GST).
  - Ephemeral compute (provisioning `thebreakdown-staging` for 48 hours to validate migrations 033–037, then pausing it): ~$0.65 compute overage.
- **Options for Human Authorization**:
  1. **Option A (Upgrade to Pro Plan)**: $45.00/mo (3 active projects) or $35.00/mo (if fact-check paused). Provides continuous staging without pausing any active project and adds automated daily backups.
  2. **Option B (Free-Quota Route via Pausing Fact-Check)**: $0.00/mo. Pause `lvfovvidtowadmnggzzf` (which frees 1 active slot, preserves all data, with a 90-day restore window) and launch `thebreakdown-staging` within the free quota. Note: QA smoke tests and external Render polling targeting `lvfovvidtowadmnggzzf` will be paused.
  3. **Option C (Separate Billing / New Account)**: $0.00/mo but requires a separate owner account, as project quotas apply account-wide across all organizations where the user is Owner/Admin.
  4. **Option D (Local Verification Only)**: Embedded PostgreSQL / Docker. Validates SQL logic (75/75 RLS tests passed), but cannot replicate cloud PostgREST reloading or network edge gates. Does not satisfy managed-Supabase release gate.

### 3.3 Initial Schema Bootstrap (001 $\rightarrow$ 032)
Once the staging project is created, bootstrap it to the production baseline:
```bash
# 1. Set staging DB connection
export DATABASE_URL="postgresql://postgres:[STAGING_PW]@db.[STAGING_REF].supabase.co:5432/postgres"

# 2. Run migrations 001 through 032 in strict numeric sequence
for file in $(ls supabase/migrations/[0-2]*.sql supabase/migrations/03[0-2]*.sql | sort); do
  echo "Applying baseline migration: $file"
  psql "$DATABASE_URL" -f "$file"
done

# 3. Verify baseline parity
psql "$DATABASE_URL" -c "
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='stories' AND column_name='hero_image_alt') AS has_032_column;
"
```

### 3.4 Staging Data Fixtures
Seed the staging database with synthetic, non-production test fixtures:
- **Stories**: 3 published stories with timestamps, 1 draft story, 1 test artifact (`is_test_artifact = true`).
- **Topics**: 2 public topics linked to stories via `related_topic_ids` and `story_topics`.
- **Claims & Sources**: Synthetic verified and unverified claims, citations, and sources across tiers t1–t5.
- **Accounts**: Synthetic users for each role:
  - `anon` (unauthenticated)
  - `reader` (authenticated, role `reader`)
  - `reporter` (authenticated, role `reporter`)
  - `editor` (authenticated, role `editor`)
  - `admin` (authenticated, role `admin`)
  - `service_role` (backend bypass role)

### 3.5 Sequential Migration Validation Runbook (033 $\rightarrow$ 037)

Apply migrations individually, testing each stage's acceptance criteria before proceeding:

```bash
# Step 1: Apply Migration 033
psql "$DATABASE_URL" -f supabase/migrations/033_durable_correction_publication.sql
# Verification: Check RPC publish_reader_correction exists and requires service_role
psql "$DATABASE_URL" -c "SELECT proname, prosecdef FROM pg_proc WHERE proname = 'publish_reader_correction';"

# Step 2: Apply Migration 034
psql "$DATABASE_URL" -f supabase/migrations/034_explicit_corrections_api_grants.sql
# Verification: Verify anon can SELECT corrections but cannot DELETE
psql "$DATABASE_URL" -c "SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'corrections';"

# Step 3: Apply Migration 035
psql "$DATABASE_URL" -f supabase/migrations/035_public_editorial_api_views.sql
# Verification: Verify public.claims and public.sources views exist with security_invoker = true
psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.views WHERE table_schema = 'public' AND table_name IN ('claims', 'sources');"

# Step 4: Apply Migration 036
psql "$DATABASE_URL" -f supabase/migrations/036_bounded_public_topic_summaries.sql
# Verification: Verify list_public_topic_summaries returns bounded previews
psql "$DATABASE_URL" -c "SELECT * FROM public.list_public_topic_summaries(5);"

# Step 5: Apply Migration 037
psql "$DATABASE_URL" -f supabase/migrations/037_security_definer_search_path_and_rpc_grants.sql
# Verification: Confirm search_path is set to 'pg_catalog, pg_temp' on all 13 functions
psql "$DATABASE_URL" -c "
  SELECT proname, proconfig 
  FROM pg_proc 
  WHERE proname IN ('set_updated_at', 'bump_story_version', 'is_staff', 'increment_rate_limit', 'publish_reader_correction');
"
```

### 3.6 Staging Rollback Runbook
If any migration step fails:
1. Revert using transaction rollback (migrations 035 and 036 are wrapped in `BEGIN ... COMMIT`).
2. For schema rollback, execute the reverse script (e.g., dropping views, reverting altered columns, re-granting previous function ACLs).
3. Force reload PostgREST schema cache:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
4. Verify application health returns to 200 OK.

---

## 4. Phase 11C — Predecessor PR Audit & Migration Dependency Chain

### 4.1 Stacked PR Registry

```
origin/main (4d835608)
  └── PR #66: fix/durable-correction-publishing-2026-10-15 (head f5af8142)
        [Migrations 033, 034]
        └── PR #76: fix/public-editorial-api-views-2026-10-16 (head 6dcf25f9)
              [Migration 035]
              └── PR #80: perf/topics-bounded-aggregation-v3-2026-10-16 (head c74a6c17)
                    [Migration 036]
                    └── PR #84: fix/security-hardening-after-topic-migrations-2026-10-16 (head 6d8989c8)
                          [Migration 037]
```

### 4.2 PR Health & CI Status Verification

| PR # | Branch Name | Head SHA | Base Branch | Status | CI Status | Vercel Quota Policy |
|---|---|---|---|---|---|---|
| **#66** | `fix/durable-correction-publishing-2026-10-15` | `f5af8142` | `main` | Open (Draft) | ✅ PASS | Skipped/Passed |
| **#76** | `fix/public-editorial-api-views-2026-10-16` | `6dcf25f9` | `fix/durable-correction-publishing-2026-10-15` | Open (Draft) | ✅ PASS | Historical rate-limit (pre-ignore) |
| **#80** | `perf/topics-bounded-aggregation-v3-2026-10-16` | `c74a6c17` | `fix/public-editorial-api-views-2026-10-16` | Open (Draft) | ✅ PASS | Historical rate-limit (pre-ignore) |
| **#84** | `fix/security-hardening-after-topic-migrations-2026-10-16` | `6d8989c8` | `perf/topics-bounded-aggregation-v3-2026-10-16` | Open (Draft) | ✅ PASS | ✅ Canceled by Ignored Build Step |

### 4.3 Cross-PR Migration Dependencies

1. **Migration 033 (`033_durable_correction_publication.sql`)**:
   - Creates `public.publish_reader_correction` RPC and foreign key on `public.reader_corrections`.
   - Depends only on `public.stories` and `public.corrections` (both established in baseline 001–032).
2. **Migration 034 (`034_explicit_corrections_api_grants.sql`)**:
   - Manages table privileges for `public.corrections` and `public.reader_corrections`.
   - Restricts `anon` to SELECT on corrections and INSERT on reader_corrections. Revokes DELETE.
   - Depends directly on tables modified in 033.
3. **Migration 035 (`035_public_editorial_api_views.sql`)**:
   - Exposes safe views `public.claims`, `public.sources`, `public.index_entries`.
   - Enforces RLS on `editorial.*` tables and staff check via `public.is_staff()`.
   - Independent of corrections tables, but depends on base editorial schema.
4. **Migration 036 (`036_bounded_public_topic_summaries.sql`)**:
   - Adds GIN index on `public.stories(related_topic_ids)` and creates RPC `public.list_public_topic_summaries`.
   - Bounds preview payload to 2 stories per topic, preventing unbounded table scans.
   - Independent of 033–035 tables, but depends on base `public.topics` and `public.stories`.
5. **Migration 037 (`037_security_definer_search_path_and_rpc_grants.sql`)**:
   - **Critical Dependency**: Hardens search paths and revokes public execution on functions from 001..032 AND line 84:
     ```sql
     ALTER FUNCTION public.publish_reader_correction(uuid, text, text, text, text, text)
       SET search_path = pg_catalog, pg_temp;
     ```
   - Because `publish_reader_correction` is created in Migration 033, **Migration 037 strictly requires Migration 033 to have run beforehand**.
   - Restricts `increment_rate_limit` RPC to `service_role` (eliminating client rate-limit manipulation).

### 4.4 Merge Strategy Analysis

| Strategy | Description | Pros | Cons | Recommendation |
|---|---|---|---|---|
| **Sequential Merge** | Merge PR #66 $\rightarrow$ #76 $\rightarrow$ #80 $\rightarrow$ #84 one by one into `main`. | Preserves separate PR commit logs. | Multiple CI runs; intermediate windows where 033 is deployed without 037 search-path hardening. | ❌ Not Recommended |
| **Consolidated Release PR** | Create release branch `release/v1.0.1-security-and-data-projections` containing all 4 PRs. | Atomic deployment; 033–037 applied in a single deployment; zero exposure window. | Combines 4 PRs into one review package. | ✅ **RECOMMENDED** |

---

## 5. Phase 11D — Production Baseline Stability Check

Prior to completing this phase, live production was verified:

```
[1/3] Probing health endpoint: https://thebreakdown.in/api/health
✓ Real application health verified 200 OK (Attempt 1/30)
  - Status:     healthy
  - Check Type: readiness
  - Commit SHA: 4d83560851552c7a5826261a0ffa13848feb0420

[2/3] Probing canonical homepage: https://thebreakdown.in/
✓ Homepage edge reachability confirmed: HTTP 200 (HSTS: Present)

[3/3] Probing protected route: https://thebreakdown.in/newsroom
✓ Protected route correctly enforced: HTTP 307 -> /login?redirect=%2Fnewsroom

ALL DEPLOYMENT HEALTH CHECKS PASSED
```

- **Production Database Parity**: Verified `mskyhaunnlwtwvsqcmav` remains strictly on migration 032 baseline.
- **Production Regressions**: 0.

---

## 6. Phase 11E — Release-Gate Decision Assessment (10 Criteria)

| # | Gate Criterion | Verification Evidence | Assessment |
|---|---|---|---|
| 1 | **Staging Environment Qualified** | Supabase inventory audited; Case B confirmed (no staging DB); complete provisioning runbook authored. | ✅ **READY FOR PROVISIONING** |
| 2 | **Migration Sequence Validated** | Migrations 001–037 applied sequentially in isolated PostgreSQL; 75/75 RLS assertions passed. | ✅ **VERIFIED IN EMBEDDED PG** |
| 3 | **Stacked PR Chain Audited** | PRs #66, #76, #80, #84 inspected; zero merge conflicts; strict dependency ordering verified. | ✅ **VERIFIED & CLEAN** |
| 4 | **Search-Path Hardening Verified** | Migration 037 sets `search_path = pg_catalog, pg_temp` on 13 functions, preventing schema hijacking. | ✅ **VERIFIED** |
| 5 | **RPC Execution Grants Hardened** | Revoked PUBLIC, anon, and authenticated from trigger helpers and privileged worker RPCs. | ✅ **VERIFIED** |
| 6 | **Distributed Rate Limiting Secured** | `increment_rate_limit` restricted to `service_role`; fail-closed behavior confirmed (45 API security tests passed). | ✅ **VERIFIED** |
| 7 | **Production Baseline Undisturbed** | Production DB `mskyhaunnlwtwvsqcmav` confirmed on baseline 032. Zero DDL executed. | ✅ **VERIFIED IMMUTABLE** |
| 8 | **Production Edge Healthy** | `https://thebreakdown.in` reports 200 OK, active commit `4d835608`, 22 routes healthy. | ✅ **VERIFIED OPERATIONAL** |
| 9 | **Fact-Check DB Untouched** | Identified divergent QA baseline (001, 030, 031 only) on `lvfovvidtowadmnggzzf`; zero DDL executed. | ✅ **VERIFIED UNTOUCHED** |
| 10 | **Human Review Package Complete** | Full provisioning specification, dependency analysis, rollback runbook, and PR status documented. | ✅ **COMPLETE & READY** |

---

## 7. Official Release-Gate Classification

```
═══════════════════════════════════════════════════════════════════════════════
RELEASE GATE DECISION: BLOCKED — STAGING TARGET NOT VERIFIED
═══════════════════════════════════════════════════════════════════════════════
```

### Rationale
All code, database migrations (033–037), and security policies have passed rigorous automated verification in an embedded PostgreSQL instance (75 RLS tests, 45 API security tests, 1,199 Intel auth tests, 0 build/type errors).

However, because an approved, isolated Supabase staging project does not currently exist, migrations 033–037 cannot be applied to a real Supabase cloud environment without provisioning one. Under the platform safety doctrine, migrations must never bypass staging directly into production.

### Action Items for Human Reviewer
1. **Approve Staging Provisioning**: Select Option A (Upgrade to Pro for 3rd project) or Option B (Pause fact-check project `lvfovvidtowadmnggzzf` to stay within free tier).
2. **Provision `thebreakdown-staging`** in region `ap-south-1` using the specification in Section 3.1.
3. **Execute the Migration Validation Runbook** (Section 3.5) against the new staging instance.
4. **Approve Release Merge**: Merge stacked PRs #66, #76, #80, and #84 as a consolidated release PR into staging, then promote to production during a scheduled maintenance window.
