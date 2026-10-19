# THE BREAKDOWN OS — PHASE 12 REPORT
## Supabase Staging Economics, Dependency Audit & Provisioning Decision

**Project:** The Breakdown OS  
**Repository:** `thebreakdowndaily/thebreakdown-os`  
**Production URL:** [https://thebreakdown.in](https://thebreakdown.in)  
**Production Commit Baseline:** `4d83560851552c7a5826261a0ffa13848feb0420` (PR #86)  
**Related PR:** [PR #87](https://github.com/thebreakdowndaily/thebreakdown-os/pull/87) (`mission/post-merge-verification-2026-10-16`)  
**Priority:** P0 — Safe database release readiness  
**Mode:** Read-only provider investigation & local documentation update  
**Workspace:** `C:\newsjack-content\thebreakdown-os-master-repair`  

---

## 1. Executive Summary

Phase 12 resolves the operational and financial decision blocker identified in Phase 11: establishing an isolated, genuine Supabase staging environment to validate database migrations 033–037 without risking production stability (`https://thebreakdown.in`) or incurring unauthorized cloud expenses.

### Key Verified Facts
1. **Current Provider Plan**: Supabase organization `pwfzmsccchpaqwwimoih` is on the **Free Plan** (`plan: "free"`, `tier: "tier_free"`).
2. **Current Project Utilization**:
   - `mskyhaunnlwtwvsqcmav` (`thebreakdown-production`, `ap-south-1`, PG 17.11): Active production database on migration baseline 032. Consumes **Slot 1 of 2**.
   - `lvfovvidtowadmnggzzf` (`the-breakdown-fact-check`, `ap-northeast-2`, PG 17.6): Active database on divergent baseline (migrations 001, 030, 031 only). Consumes **Slot 2 of 2**.
   - `swektehukscmsgxdzymw` (`thebreakdown/ 403`, `ap-northeast-2`, PG 17.6): `INACTIVE` (paused). Does **not** consume active project quota.
3. **Free Quota Exhaustion**: Both active project slots are occupied. Deleting the inactive legacy project (`swektehukscmsgxdzymw`) frees zero active slots because paused projects do not count toward quota.
4. **Fact-Check Operational Audit**:
   - The repository historically referenced `lvfovvidtowadmnggzzf` as `STAGING_SUPABASE_URL` and `KNOWN_STAGING_SUPABASE_REF`.
   - Active telemetry demonstrates an external background service on **Render** (IP `74.220.49.18`) continuously querying `https://lvfovvidtowadmnggzzf.supabase.co/rest/v1/stories` every 1–2 minutes (currently failing with HTTP 400 due to column discrepancies).
   - Pausing `lvfovvidtowadmnggzzf` has **zero impact on production**, but **moderate impact on staging CI/QA smoke suites**.
5. **Accurate Economics**:
   - A Pro upgrade is **not** a flat $25/month. Each project runs on dedicated compute ($10/mo Micro). With 1 included project covered by $10 credits, running 3 active projects in the Pro organization costs **$45.00/month** (approx. ₹3,780/mo + GST). Running 2 active projects costs **$35.00/month** (approx. ₹2,940/mo + GST), which requires transferring the fact-check project to a separate Free organization (since projects in a Pro organization cannot be paused directly).
   - The free route (pausing `lvfovvidtowadmnggzzf` within the Free tier) costs **$0.00/month** and preserves all data with a 90-day restore guarantee.

---

## 2. Verified Current Provider and GitHub State

### 2.1 Supabase Organization & Project Inventory

Data retrieved directly via Supabase Management API:

| Object Type | Identifier | Name / Slug | Region | Status | Plan / Engine | Active Slot Consumed |
|---|---|---|---|---|---|---|
| **Organization** | `pwfzmsccchpaqwwimoih` | `hello@thebreakdown.in's Org` | — | `Active` | `free` (`tier_free`) | 2 of 2 used |
| **Project 1** | `mskyhaunnlwtwvsqcmav` | `thebreakdown-production` | `ap-south-1` (Mumbai) | `ACTIVE_HEALTHY` | PG 17.11.0.002 | **YES (Slot 1)** |
| **Project 2** | `lvfovvidtowadmnggzzf` | `the-breakdown-fact-check` | `ap-northeast-2` (Seoul) | `ACTIVE_HEALTHY` | PG 17.6.1.127 | **YES (Slot 2)** |
| **Project 3** | `swektehukscmsgxdzymw` | `thebreakdown/ 403` | `ap-northeast-2` (Seoul) | `INACTIVE` | PG 17.6.1.147 | **NO (Paused)** |

*Note on Unverified Figures*: The Supabase Management API does not expose exact hourly compute credit balances, invoices, or add-on itemizations for this organization; these are marked **UNVERIFIED VIA API** and derived directly from official Supabase pricing documentation below.

### 2.2 GitHub PR & Migration Stack Status

All PRs remain in draft status with verified CI:

| PR # | Branch Name | Head Commit SHA | Base Branch | Status | CI Status | Included Migrations |
|---|---|---|---|---|---|---|
| **#66** | `fix/durable-correction-publishing-2026-10-15` | `f5af8142` | `main` | Open (Draft) | ✅ PASS | 033, 034 |
| **#76** | `fix/public-editorial-api-views-2026-10-16` | `6dcf25f9` | `fix/durable-correction-publishing-2026-10-15` | Open (Draft) | ✅ PASS | 035 |
| **#80** | `perf/topics-bounded-aggregation-v3-2026-10-16` | `c74a6c17` | `fix/public-editorial-api-views-2026-10-16` | Open (Draft) | ✅ PASS | 036 |
| **#84** | `fix/security-hardening-after-topic-migrations-2026-10-16` | `6d8989c8` | `perf/topics-bounded-aggregation-v3-2026-10-16` | Open (Draft) | ✅ PASS | 037 |
| **#87** | `mission/post-merge-verification-2026-10-16` | `2e744261` | `main` | Open (Draft) | ✅ PASS | Documentation |

---

## 3. Fact-Check Project (`lvfovvidtowadmnggzzf`) Dependency & Impact Audit

### 3.1 Codebase References
A comprehensive search across the repository identified 24 files with hardcoded or default references to `lvfovvidtowadmnggzzf`:

1. **Deployment & CI Workflows**:
   - `.github/workflows/production-deploy.yml`: Line 46 and Line 90 set `STAGING_SUPABASE_URL` defaulting to `https://lvfovvidtowadmnggzzf.supabase.co`.
   - `scripts/verify-staging-corrections-smoke.ts`: Defines `KNOWN_STAGING_SUPABASE_REF = 'lvfovvidtowadmnggzzf'`.
2. **Application Health Engine**:
   - `lib/health/checker.ts`: Hardcodes `const KNOWN_STAGING_SUPABASE_REF = 'lvfovvidtowadmnggzzf'`.
3. **Integration Test Suites**:
   - `tests/evidence-vault/legacy-boundary-demarcation.test.ts` & `tests/evidence-vault/publication-guard-unification.test.ts`:
     Directly assert:
     `if (!u.host.includes('lvfovvidtowadmnggzzf')) throw new Error('FATAL: Test must run ONLY against staging (lvfovvidtowadmnggzzf)')`.
4. **Historical Migration Scripts**:
   - `scripts/seed-supabase.js`, `scripts/seed-supabase.ts`, `scripts/supabase-migrate.js`, `scripts/migrate-to-canonical.ts` default to `projectRef = 'lvfovvidtowadmnggzzf'`.

### 3.2 Live Provider Telemetry (ClickHouse Unified Logs)
Read-only queries against `lvfovvidtowadmnggzzf` logs revealed active incoming traffic:
- **Event Volume**: 141 edge log events, 100 PostgREST log events in the last 24 hours.
- **Requester Identity**:
  - Origin IP: `74.220.49.18` (Autonomous System: `Render`).
  - Client: `node` runtime with `supabase-js/2.108.2`.
  - Frequency: Approximately every 60–120 seconds.
  - Target: `GET /rest/v1/stories?select=id,title,publish_at&status=eq.scheduled&publish_at=lte.[TIMESTAMP]`.
  - HTTP Status: `400 Bad Request` (`error=42703` — undefined column `publish_at`).
- **Significance**: An external cron job on Render is actively polling `lvfovvidtowadmnggzzf`. Because the column schema is already divergent, these requests currently fail.

### 3.3 Impact Classification of Pausing `lvfovvidtowadmnggzzf`

| Domain | Impact Level | Detailed Assessment |
|---|---|---|
| **Production Traffic (`https://thebreakdown.in`)** | **ZERO IMPACT** | Production relies 100% on `mskyhaunnlwtwvsqcmav` in `ap-south-1`. No production routes or secrets point to `lvfovvidtowadmnggzzf`. |
| **Staging CI / QA Verification** | **MODERATE IMPACT** | The `deploy-staging` workflow in GitHub Actions and direct evidence-vault integration tests will fail unless updated to point to the new staging project. |
| **External Background Polling (Render)** | **LOWER IMPACT** | The external polling worker is already receiving 400 errors due to schema divergence; pausing the project changes the response to 540 (Project Paused). |
| **Overall Classification** | **MODERATE IMPACT** | **QA or verification capability would be interrupted** until environment variables and tests are retargeted. |

### 3.4 Recovery & Restoration Procedure
If `lvfovvidtowadmnggzzf` is paused:
1. Supabase preserves all data, schemas, and configurations.
2. The project can be unpaused within **90 days** directly from the Supabase Dashboard: **Project Settings > General > Project Availability > Resume Project**.
3. Restoration takes approximately 2–3 minutes and restores complete database state without data loss.

---

## 4. Free-Quota Eligibility & Limitations

According to official Supabase documentation:
1. **Quota Definition**: Each account is entitled to **two active free projects**.
2. **Account-Wide Enforcement**: The limit applies across **all organizations** where the user is an Owner or Administrator. Creating a new organization under the same account does **not** grant additional free project slots.
3. **Paused Project Exemption**: Paused projects do **not** count toward the active project limit.
4. **Current Status**:
   - `mskyhaunnlwtwvsqcmav` (Active, Slot 1/2)
   - `lvfovvidtowadmnggzzf` (Active, Slot 2/2)
   - `swektehukscmsgxdzymw` (Inactive/Paused, 0 slots)
5. **Conclusion**: To create `thebreakdown-staging` under the Free quota, `lvfovvidtowadmnggzzf` **must be paused**. Deleting `swektehukscmsgxdzymw` does not free an active slot.

---

## 5. Legitimate Provisioning Options Comparison

| Dimension | Option A: Upgrade Existing Org to Pro | Option B: Free-Quota Route (Pause Fact-Check) | Option C: Separate Account / Dedicated Billing | Option D: Local Verification Only |
|---|---|---|---|---|
| **Monthly Cost (USD)** | **$45.00/mo** (3 active projects)<br>or **$35.00/mo** (if fact-check paused) | **$0.00/mo** | **$0.00/mo** (if separate free account) or **$25.00/mo** (separate Pro) | **$0.00/mo** |
| **Indicative Cost (INR)** | ~₹3,780/mo (or ~₹2,940/mo) + GST | ₹0.00 | ₹0.00 | ₹0.00 |
| **Staging Quality** | **Managed Supabase Cloud** in `ap-south-1` (Identical to production) | **Managed Supabase Cloud** in `ap-south-1` (Identical to production) | **Managed Supabase Cloud** (Different org/account boundary) | **Local/Disposable Only** (Embedded PG / Docker) |
| **Operational Impact** | **ZERO IMPACT** on all existing projects | **MODERATE IMPACT** on QA/CI referencing `lvfovvidtowadmnggzzf` | **MODERATE IMPACT** (Requires managing multiple logins/credentials) | **ZERO RELEASE PROOF** for managed cloud features |
| **Backup & Retention** | Daily automated backups (7-day retention), no auto-pausing | Standard free tier (subject to 7-day inactivity pause if unused) | Depends on plan | Ephemeral |
| **Reversibility** | Can be downgraded to Free anytime (excess projects must be paused) | 1-click unpause for `lvfovvidtowadmnggzzf` within 90 days | N/A | Fully ephemeral |
| **Release Gate Suitability** | ✅ **FULLY QUALIFIED** | ✅ **FULLY QUALIFIED** (Requires updating CI ref) | ⚠️ Governance & credential friction | ❌ **UNQUALIFIED** (Fails managed staging requirement) |

---

## 6. Financial Breakdown: Option A (Supabase Pro)

Official Supabase billing mechanics for organization `pwfzmsccchpaqwwimoih`:

```
┌────────────────────────────────────────────────────────────────────────┐
│ SUPABASE PRO PLAN MONTHLY INVOICE BREAKDOWN (3 Active Projects)         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Base Subscription (Pro Plan):                              $25.00  │
│    - Includes: 250 GB Egress, 100 GB Storage, 8 GB Disk/proj           │
│    - Includes: Daily automated backups, No project pausing            │
│    - Includes: $10.00 Monthly Compute Credits                          │
│                                                                        │
│ 2. Project Compute Instances (Micro Compute @ ~$10.00/month each):     │
│    - Project 1: thebreakdown-production (mskyhaunnlwtwvsqcmav)  $10.00  │
│    - Project 2: the-breakdown-fact-check (lvfovvidtowadmnggzzf) $10.00  │
│    - Project 3: thebreakdown-staging (New Staging Target)      $10.00  │
│    ------------------------------------------------------------------  │
│    Subtotal Compute Charges:                                   $30.00  │
│    Less Included Compute Credits:                             -$10.00  │
│    Net Compute Charges:                                        $20.00  │
├────────────────────────────────────────────────────────────────────────┤
│ TOTAL ESTIMATED MONTHLY RECURRING COST:                       $45.00  │
│ Indicative INR (1 USD ≈ ₹84.00):                           ~₹3,780.00 │
│ (Note: Subject to local taxes / 18% GST if applicable: ~₹4,460.00)     │
└────────────────────────────────────────────────────────────────────────┘
```

*Cost Reduction Variation (Option B)*: If `lvfovvidtowadmnggzzf` is transferred to a separate Free organization, Net Compute in the Pro organization is $10.00, reducing the Pro monthly total to **$35.00/month** (~₹2,940/mo + GST). *Note: Projects within a Pro organization cannot be paused directly; to stop compute charges, the project must be transferred to a Free organization.*

---

## 7. Local Validation Completed and Its Technical Limits

### Completed Local Verification
1. **Embedded PostgreSQL Test Suite** (`tests/security/database-enforcement.test.ts`):
   - Applied all 37 migrations in sequence (001–037) with zero errors.
   - 75/75 database-level RLS and privilege assertions passed.
   - 45/45 API security and distributed rate limiting assertions passed.
   - 1,199/1,199 Intel authorization rules passed.
2. **Build and Lint Gates**:
   - `npm run check:type` (0 errors), `npm run check:lint` (0 errors), `npm run check:build` (Clean Next.js output).

### Strict Limits of Local Validation
- **No Remote Network Parity**: Does not validate PostgREST API schema reloading over HTTPS (`NOTIFY pgrst, 'reload schema'`).
- **No Supavisor / Pooler Parity**: Does not exercise transaction mode vs session mode connection pooling.
- **No Edge Gate Parity**: Does not provide a public URL accessible by Vercel preview environments or GitHub Actions CI runners.
- **Release Mandate**: Local testing proves SQL correctness, but does **not** fulfill the requirement for real managed-Supabase staging validation.

---

## 8. Recommended Option & Strategic Rationale

### Recommendation: **Option A (Upgrade to Pro Plan) or Option B (Free Route with CI Retargeting)**

1. **Primary Recommendation (Engineering Best Practice) — Option A**:
   - **Cost**: $45.00/month (or $35.00/month with fact-check paused).
   - **Why**: The Breakdown OS is an active production journalism and policy platform. A production database (`mskyhaunnlwtwvsqcmav`) should not run on a Free plan subject to inactivity pausing and lacking automated daily backups. Upgrading the organization to Pro provides continuous operation, automated backups for production, and a permanent, identical staging instance in `ap-south-1`.
2. **Alternative Zero-Cost Recommendation — Option B**:
   - **Cost**: $0.00/month.
   - **Why**: If budget constraints require remaining on the Free Plan, pause `lvfovvidtowadmnggzzf` via the Supabase dashboard (freeing Slot 2), update `.github/workflows/production-deploy.yml` and `lib/health/checker.ts` to reference the new staging project `thebreakdown-staging`, and execute migrations 033–037. `lvfovvidtowadmnggzzf` data remains safely preserved and can be restored within 90 days.

---

## 9. Required Action: HUMAN APPROVAL REQUIRED

To proceed, the project owner/administrator must choose and authorize one of the two options below:

```
═══════════════════════════════════════════════════════════════════════════════
HUMAN APPROVAL REQUIRED: SELECT STAGING PROVISIONING PATH
═══════════════════════════════════════════════════════════════════════════════

[ ] CHOICE 1: AUTHORIZE PRO UPGRADE — ALL PROJECTS IN PRO (OPTION A)
    - Action: Upgrade organization pwfzmsccchpaqwwimoih to Supabase Pro ($25/mo).
    - Financial Commitment: $45.00/mo ($25 base + $20 net compute for 3 projects) (~₹3,782/mo + GST).
    - Result: Provision thebreakdown-staging in ap-south-1. Keeps lvfovvidtowadmnggzzf running. Automated daily backups for production.

[ ] CHOICE 2: AUTHORIZE PRO UPGRADE WITH FACT-CHECK TRANSFER (OPTION B)
    - Action: Upgrade pwfzmsccchpaqwwimoih to Pro ($25/mo), create Free Org 2, transfer lvfovvidtowadmnggzzf to Org 2.
    - Financial Commitment: $35.00/mo ($25 base + $10 net compute for 2 projects) (~₹2,942/mo + GST).
    - Result: Provision thebreakdown-staging in ap-south-1. Keeps fact-checking running at $0 in Org 2. 1-2 min transfer downtime.

[ ] CHOICE 3: AUTHORIZE FREE-QUOTA PROVISIONING (OPTION C)
    - Action: Keep pwfzmsccchpaqwwimoih on Free tier. Pause lvfovvidtowadmnggzzf in Supabase Dashboard.
    - Financial Commitment: $0.00/mo.
    - Result: Provision thebreakdown-staging in ap-south-1 within free quota; retarget CI workflows. Production has no automated backups.
═══════════════════════════════════════════════════════════════════════════════
```

---

## 10. Audit Invariants & Safety Confirmation

During Phase 12, the following invariants were strictly maintained:
1. **Zero SQL Mutations**: No DDL or DML was executed against `mskyhaunnlwtwvsqcmav` (production) or `lvfovvidtowadmnggzzf` (fact-check).
2. **Zero Project Lifecycle Mutations**: No projects were created, paused, unpaused, restored, or deleted.
3. **Zero Billing Mutations**: Organization subscription was not altered.
4. **Zero Production Deployments**: Production at `https://thebreakdown.in` remains 100% healthy at commit `4d835608`.
5. **Zero Secret Disclosure**: No database credentials, JWT secrets, or service role keys were printed or exposed.
6. **Isolated Documentation Updates**: Documentation updates were confined strictly to branch `mission/post-merge-verification-2026-10-16` (PR #87). Primary workspace `c:\newsjack-content\thebreakdown-os` remains untouched.
