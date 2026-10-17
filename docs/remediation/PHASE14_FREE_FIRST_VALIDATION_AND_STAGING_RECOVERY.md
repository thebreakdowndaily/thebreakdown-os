# PHASE 14 — FREE-FIRST VALIDATION & STAGING RECOVERY REPORT

**Date:** 2026-10-17  
**Repository:** `thebreakdowndaily/thebreakdown-os`  
**Target Environment:** Production (`https://thebreakdown.in`) & Local Embedded Validation  
**Production Commit Baseline:** `4d83560851552c7a5826261a0ffa13848feb0420`  
**PR #84 Head Commit:** `3abb876c` (`fix/security-hardening-after-topic-migrations-2026-10-16`)  
**PR #87 Head Commit:** `049e4b3e` (`mission/post-merge-verification-2026-10-16`)  
**Mode:** Free-First Verification; Zero Cost; Read-Only Managed Providers  
**Status:** COMPLETE (Zero Disruption, Zero Mutations to Production or Fact-Check)

---

## 1. Executive Summary & Objective

The objective of Phase 14 is to prove that The Breakdown OS functions end-to-end without incurring recurring infrastructure costs, staying strictly within the Supabase Free plan tier.

### Non-Negotiable Constraints Observed
- **Plan Status**: Supabase organization `pwfzmsccchpaqwwimoih` remains strictly on the **Free tier** (`plan: "free"`, `tier: "tier_free"`). Zero subscription upgrades or billing events occurred.
- **Provider Immutability**: No managed project was paused, transferred, deleted, or restored.
- **Database Safety**: Migrations 033–037 were **NOT** applied to production (`mskyhaunnlwtwvsqcmav`) or the fact-check database (`lvfovvidtowadmnggzzf`).
- **Production Baseline**: `https://thebreakdown.in` remains 100% healthy, serving commit `4d835608` with zero regressions.

---

## 2. Task 1: Inactive Legacy Project Audit (`swektehukscmsgxdzymw`)

An inspection of the Supabase project inventory was conducted using the Supabase Management API:

```json
{
  "id": "swektehukscmsgxdzymw",
  "ref": "swektehukscmsgxdzymw",
  "name": "thebreakdown/ 403",
  "region": "ap-northeast-2",
  "status": "INACTIVE",
  "database": {
    "host": "db.swektehukscmsgxdzymw.supabase.co",
    "version": "17.6.1.147",
    "postgres_engine": "17"
  },
  "created_at": "2026-07-19T15:26:24.606688Z"
}
```

### Detailed Findings
1. **Restoration Feasibility**:
   - The project was created on **2026-07-19** and paused shortly thereafter. As of **2026-10-17**, it sits exactly at the 90-day restore limit.
   - However, restoration cannot be triggered on the Free plan because the organization already has **2 active projects** (`mskyhaunnlwtwvsqcmav` and `lvfovvidtowadmnggzzf`). Supabase strictly blocks unpausing when active project limits are reached.
2. **Schema & Data State**:
   - Direct connection attempts to `db.swektehukscmsgxdzymw.supabase.co` timed out as expected (compute VM is terminated).
   - Its name (`"thebreakdown/ 403"`) indicates it was an early July 2026 security/HTTP test project.
3. **Region Incompatibility**:
   - It is located in **`ap-northeast-2` (Seoul, South Korea)**.
   - Production is hosted in **`ap-south-1` (Mumbai, India)**.
   - In Supabase, AWS regions are **permanently immutable**. The project cannot be moved to `ap-south-1`.
4. **Safety & Suitability Determination**:
   - **Verdict**: `swektehukscmsgxdzymw` **cannot and should not be repurposed for staging**. It is in the wrong geographical region, cannot be restored without first pausing fact-checking, and offers zero advantage over creating a fresh project in `ap-south-1`.

---

## 3. Task 2: Zero-Cost Local Validation

Local validation was conducted using an isolated, ephemeral PostgreSQL cluster via `embedded-postgres`.

### A. Migration Safety Gate (37/37 Files Passed)
Command: `npm run test:migration`
- Replayed migrations `001_create_tables.sql` through `037_security_definer_search_path_and_rpc_grants.sql` sequentially against an isolated PostgreSQL instance.
- **Result**: **37/37 migrations applied cleanly with zero DDL or constraint syntax errors.**

### B. Direct Database Enforcement & RLS Tests (`tests/security/database-enforcement.test.ts`)
- **Total Tests**: **73 Passed, 0 Failed**.
- **Key Assertions Verified**:
  1. *Bounded Topic Aggregation*: `list_public_topic_summaries` counts only published non-test stories and excludes drafts and quarantined test artifacts.
  2. *API Grant Boundaries*: Anonymous/authenticated roles can read published metadata and public corrections, but cannot insert claims/sources directly or bypass creation RPCs.
  3. *SECURITY DEFINER Hardening*:
     - `increment_rate_limit` execution revoked from `anon` and `authenticated`; restricted strictly to `service_role`.
     - Function search paths pinned to immutable catalog paths (`pg_catalog, pg_temp`), neutralizing search_path hijacking.
     - Role helper functions (`current_app_role()`, `is_staff()`, `is_admin()`) fail closed to `"guest"` and ignore JWT `user_metadata` tampering.
  4. *RLS Isolation*:
     - Anonymous users cannot read draft stories or write to `public.stories`.
     - User A bookmarks are strictly isolated from User B (zero read/update/delete leakage).
     - Role deletion hierarchy: Reporters cannot delete stories; Owners/Managing Editors can delete stories.

### C. Comprehensive Security Suite (`npm run test:security`)
- **Summary**:
  - Migration Safety: 37/37 files passed.
  - Phase 2 Database RLS: 75/75 passed.
  - Phase 3 API Security & Rate Limiting: 45/45 passed.
  - Intel Authorization Suite: 1,199/1,199 passed.
  - **Total**: **1,356 passed, 0 failed**.

### D. Unit & Domain Test Suites
- `tests/reader-corrections-persistence.test.ts`: **13/13 passed** (covers durable table persistence, cold-start revalidation, failure modes, and privacy stripping).
- `tests/public-topic-summary.test.ts`: **5/5 passed** (reconciles reverse story-to-topic links, featured story deduplication, and exclusion of drafts).
- `tests/vs7-editorial-quality-and-corrections.test.ts`: **10/10 passed** (errata projections never leak submitter email or private notes).
- `tests/public-v1-story-api.test.ts` & `tests/public-v2-story-api.test.ts`: **6/6 passed** (enforces public visibility boundary on v1/v2 story read endpoints).

### E. Invariants Local Testing CANNOT Prove About Managed Supabase
While local testing proves structural, syntactic, and algorithmic correctness, it cannot prove:
1. **Managed PostgREST Schema Cache Dynamics**:
   - In managed Supabase, applying DDL requires PostgREST to process `NOTIFY pgrst, 'reload schema'`. Local tests connect directly via PostgreSQL protocol and do not exercise the PostgREST proxy.
2. **Supavisor Connection Pooling**:
   - Managed Supabase routes traffic through Supavisor (port 6543/5432). Connection queuing, transaction mode pool timeouts, and prepared statement caching can only be observed on managed instances.
3. **Managed Supabase Auth (GoTrue)**:
   - Real GoTrue service generates signed asymmetric/symmetric JWTs and manages session cookies. Local tests stub `auth.uid()` and `request.jwt.claims`.
4. **Managed Storage (S3 API) & Realtime CDC**:
   - S3-compatible file storage and PostgreSQL WAL logical replication for Realtime cannot be simulated via embedded-postgres.
5. **Cross-Region Network Performance & Latency**:
   - Real-world edge-to-database latency between Vercel Edge/Cloudflare Workers and AWS `ap-south-1`.

---

## 4. Task 3: Application End-to-End Functionality Audit

### A. Live Production Public Surfaces & Route Verification (`https://thebreakdown.in`)
Command: `npm run test:smoke-prod`
- **Result**: **25/25 checks passed with HTTP 200 / valid redirects.**
- Routes verified:
  - Homepage (`/`): 200 OK (HSTS present).
  - Trackers Index (`/trackers`): 200 OK.
  - Flagship Trackers (`/trackers/mgnrega`, `/trackers/upi`, `/trackers/semiconductor`, `/trackers/pmfby`): 200 OK.
  - Public Surfaces (`/membership`, `/search`, `/trust`, `/topics`, `/series`, `/data`, `/compare`): 200 OK.
  - Discovery & SEO (`/sitemap.xml`, `/robots.txt`): 200 OK.
  - Legacy Route Redirects (`/evolution`, `/precedents`, `/problems`): 308 Permanent Redirect.

### B. Live Route Protection & Edge Security Probes
```
Route                               Status    Behavior
────────────────────────────────────────────────────────────────────────
/                                   200 OK    Public landing page served
/topics                             200 OK    Public topics directory served
/transparency/corrections           200 OK    Public errata ledger served
/newsroom                           307       Redirect -> /login?redirect=%2Fnewsroom
/intel                              307       Redirect -> /login?redirect=%2Fintel
/api/health                         200 OK    Readiness confirmed (Commit: 4d835608)
/api/editorial/publish-due          401       Unauthenticated call rejected
/api/v1/stories                     200 OK    Public story collection served
/api/v2/stories                     401       Unauthorized call rejected
/sitemap.xml                        200 OK    XML sitemap generated
/robots.txt                         200 OK    Robots policy served
```

### C. Render Polling Worker Investigation (`74.220.49.18`)
- **Tracing**: Continuous HTTP 400 requests to `lvfovvidtowadmnggzzf` (`the-breakdown-fact-check`) originate from an external Node worker hosted on Render (`74.220.49.18`).
- **Production Independence**: Production scheduled publishing was designed to run via Cloudflare Worker `thebreakdown-scheduled-publish`, which invokes canonical `/api/editorial/publish-due` on `https://thebreakdown.in`. However, as established in Phase 15, the worker implementation in `main` contained an unsafe database fallback (Issue #91, remediated in PR #92), and live deployment/scheduling on Cloudflare is **unverified**.
- **Verdict**: The Render worker is an **obsolete artifact from the June 2026 prototype**. It has **zero production dependencies**. In accordance with instructions, it has been left running without interference.

### D. Missing Configuration & Integration Audit
1. **Fact-Check Database Schema Drift**:
   - `lvfovvidtowadmnggzzf` is missing migrations 002–029 and 032–037. Its `stories` table lacks `publish_at`, causing the Render worker to fail with HTTP 400.
2. **Staging Environment Gap**:
   - Because all Free project quota is occupied, there is no live managed staging environment connected to CI.

---

## 5. Task 4: Managed Staging Constraint Resolution

### Quota Status
- **Supabase Free Limit**: 2 active free projects account-wide.
- **Current Allocation**:
  - Project 1: `mskyhaunnlwtwvsqcmav` (Production, `ap-south-1`) — **Active (Slot 1)**.
  - Project 2: `lvfovvidtowadmnggzzf` (Fact-Check, `ap-northeast-2`) — **Active (Slot 2)**.
- **Available Free Slots**: **0 (Zero)**.

### Is Managed Staging Genuinely Necessary Before Release?
- **For Code & Schema Validation**: **No**. Embedded PostgreSQL proves all 37 migrations execute without error, and RLS/security boundaries function as specified.
- **For Production Release Safety**: **Yes**. Applying DDL to a live production database (`mskyhaunnlwtwvsqcmav`) without validating PostgREST schema cache reload (`NOTIFY pgrst`) and Supabase extension interactions on a managed instance represents an unacceptable release risk.

### Fact-Check Dependency & Recovery Plan (Human Approval Required — NOT EXECUTED)

To provision a managed staging database within the Free tier without upgrading to Pro:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Engineering Lead
    participant Studio as Supabase Studio
    participant FC as lvfovvidtowadmnggzzf (Fact-Check)
    participant Staging as thebreakdown-staging (New, ap-south-1)
    participant Prod as mskyhaunnlwtwvsqcmav (Production)

    Note over Admin,FC: Step 1: Safeguard Fact-Check Data
    Admin->>FC: Run logical backup via CLI/dashboard (export schema & 175 stories)
    Note over Admin,FC: Step 2: Release Free Slot 2
    Admin->>Studio: Pause project lvfovvidtowadmnggzzf
    Studio->>FC: Compute VM suspended (Data preserved; 90-day restore window starts)
    Note over Admin,Staging: Step 3: Provision Ephemeral Staging
    Admin->>Studio: Create "thebreakdown-staging" in ap-south-1
    Admin->>Staging: Apply migrations 001..037
    Admin->>Staging: Run automated staging persistence smoke tests
    Note over Admin,Prod: Step 4: Production Release
    Admin->>Prod: Apply migrations 033..037 during maintenance window
    Note over Admin,FC: Step 5: Restore Fact-Check
    Admin->>Studio: Delete ephemeral "thebreakdown-staging"
    Admin->>Studio: Click "Resume Project" on lvfovvidtowadmnggzzf
    Studio->>FC: Compute VM restored with exact pre-pause state
```

#### Reversibility & Guarantees
- **Data Preservation**: Pausing `lvfovvidtowadmnggzzf` retains all disk volumes, tables, and settings.
- **Restore Window**: Supabase guarantees 90 days of 1-click restoration from Studio.
- **Downtime Impact**: Fact-check QA tools are unavailable during the ~30–60 minute test window. Production has **zero downtime**.

---

## 6. Summary: What Works, What Fails, and Smallest Next Action

### What Works ✅
1. **Production Deployment (`https://thebreakdown.in`)**:
   - 100% healthy at commit `4d83560851552c7a5826261a0ffa13848feb0420`.
   - 25/25 public and legacy routes passing.
   - Protected routes (`/newsroom`, `/intel`) correctly redirect unauthenticated traffic (HTTP 307).
   - Autonomous scheduled publishing canonical endpoint (`/api/editorial/publish-due`) is verified on Next.js; scheduled Cloudflare Worker trigger is pending PR #92 merge and live provider deployment (see Phase 15).
2. **Local Schema & Migration Pipeline**:
   - 37/37 migrations apply sequentially without errors on clean PostgreSQL.
   - 73/73 direct database enforcement tests passing.
   - 1,356/1,356 security, RLS, and authorization tests passing.
   - Unit and domain test suites for reader corrections (13/13), topic summaries (5/5), errata visibility (10/10), and public story APIs (6/6) passing.
3. **Repository Cleanliness**:
   - `npm run check:type` (TypeScript): 0 errors.
   - `npm run check:lint` (ESLint): 0 errors.

### What Fails / Blocks Managed Validation ❌
1. **Free Slot Exhaustion**:
   - 0 available Free project slots prevent spinning up a managed staging database without either pausing fact-checking or upgrading the plan.
2. **Fact-Check Project Drift**:
   - `lvfovvidtowadmnggzzf` is outdated and receiving failing poll requests from the orphaned Render worker (`74.220.49.18`).
3. **PostgREST Schema Reload Unverified on Managed Host**:
   - PostgREST reload cannot be tested on embedded-postgres.

### Smallest Remaining Set of Actions
To achieve complete, verified end-to-end functionality without upgrading Supabase:
1. **Approve Temporary Pausing of Fact-Check**:
   - Human approval to pause `lvfovvidtowadmnggzzf` (freeing Slot 2 for up to 90 days).
2. **Provision `thebreakdown-staging` in `ap-south-1`**:
   - Apply migrations 001–037.
   - Verify PostgREST API schema reload.
3. **Execute Production Release of Migrations 033–037**:
   - Apply migrations 033–037 to `mskyhaunnlwtwvsqcmav`.
   - Merge PRs #66, #76, #80, and #84.
4. **Tear Down Staging & Resume Fact-Check**:
   - Delete ephemeral staging project.
   - Click "Resume" on `lvfovvidtowadmnggzzf` in Supabase Studio.
