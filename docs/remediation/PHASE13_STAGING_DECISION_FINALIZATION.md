# THE BREAKDOWN OS — PHASE 13 REPORT
## Supabase Cost Model Reconciliation & Staging Decision Finalization

**Project:** The Breakdown OS  
**Repository:** `thebreakdowndaily/thebreakdown-os`  
**Production URL:** [https://thebreakdown.in](https://thebreakdown.in)  
**Production Commit Baseline:** `4d83560851552c7a5826261a0ffa13848feb0420` (PR #86)  
**Related PR:** [PR #87](https://github.com/thebreakdowndaily/thebreakdown-os/pull/87) (`mission/post-merge-verification-2026-10-16`)  
**Priority:** P0 Release Governance  
**Mode:** Read-only provider investigation & documentation update on isolated branch  
**Workspace:** `C:\newsjack-content\thebreakdown-os-master-repair`  

---

## 1. Executive Summary

Phase 13 reconciles the financial, operational, and architectural model for provisioning a genuine managed-Supabase staging environment to validate database migrations 033–037.

This audit eliminates policy ambiguities from earlier reports, grounds all economic projections in current official Supabase documentation, audits external worker traffic, and delivers an evidence-backed decision package for human authorization.

---

## 2. Mission 1 — Reconcile Official Supabase Policy

Data verified directly from official Supabase documentation:

### 2.1 Paused Free Projects Restore Window
- **Policy**: When a Free Plan project is paused (due to inactivity or user request), users have a **90-day restore window** to resume the project directly from within the Supabase Studio dashboard with a single button click.
- **After 90 Days**: The one-click dashboard restore expires, but the database backup file and storage objects remain downloadable from the dashboard for restoration to a new project or local environment.
- **Paid Plan Restoration**: Upgrading a paused project to a paid plan re-enables one-click restore options if the physical backup remains compatible.
- *Source*: [Supabase Docs — Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing), [Supabase Docs — Upgrading](https://supabase.com/docs/guides/platform/upgrading).

### 2.2 Pro Projects Cannot Be Paused Directly
- **Policy**: Projects belonging to a Pro Plan organization **cannot be paused directly** and are not subject to automatic pausing for inactivity.
- **Documentation Invariant**:
  > *`<Admonition type="note">Note: Only Free Projects can be paused at this time.</Admonition>`*  
  > *`Projects under a paid plan cannot be paused and are not subject to automatic pausing for inactivity. To pause a project currently under a paid plan, first transfer the project to an organization on the Free plan.`*
- **Reconciliation of Phase 12 Error**: In Phase 12, a scenario was modeled where the fact-check project was paused *inside* the Pro organization to reduce compute costs to $35/month. This is technically impossible within Supabase. To reduce compute charges under Pro, the project must either remain active ($10/mo compute) or be transferred out to a separate Free organization.
- *Source*: [Supabase Docs — Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing), [Supabase Docs — Deleting Your Project](https://supabase.com/docs/guides/platform/delete-project).

### 2.3 Project Transfer Prerequisites, Limitations & Downtime
- **Transfer Capability**: Supabase supports self-serve project transfers across organizations via Project Settings > General.
- **Prerequisites**:
  1. The user must be the **Owner** of the source organization.
  2. The user must be at least a **Member** of the target organization.
  3. No active GitHub integration connection on the project.
  4. No project-scoped roles pointing to the project.
  5. No log drains configured on the project.
- **Downtime**: Transferring a project across organizations typically incurs a **1–2 minute downtime window** when moving between plan tiers.
- **Limitations**:
  - Project transfers **cannot change regions**. A project in `ap-northeast-2` (Seoul) remains in `ap-northeast-2`.
  - When transferring to a Free organization, the platform enforces the 2 active free project limit.
- *Source*: [Supabase Docs — Project Transfers](https://supabase.com/docs/guides/platform/project-transfer).

### 2.4 Free Project Limits Across Organizations
- **Policy**: Each user account is entitled to **two active free projects across all organizations** where the user is an Owner or Administrator.
- **Scope**: Creating a new Free organization under the same account does **not** grant additional free project slots. Paused projects do not count toward this limit.
- *Source*: [Supabase Docs — About Billing on Supabase](https://supabase.com/docs/guides/platform/billing-on-supabase).

### 2.5 Current Subscription, Compute Credit & Micro Pricing
- **Pro Plan Base Fee**: $25.00 / month.
- **Included Monthly Compute Credits**: $10.00 / month (covers 1 default Micro compute instance).
- **Default Compute Instance**: Dedicated Micro VM at **~$10.00 / month** (billed hourly at ~$0.01344/hr).
- **Additional Active Projects**: +$10.00 / month each on default Micro compute.
- *Source*: [Supabase Docs — Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq), [Supabase Docs — Compute](https://supabase.com/docs/guides/platform/manage-your-usage/compute).

---

## 3. Mission 2 — Recalculate Legitimate Options

*Reference Date:* 2026-10-17  
*Reference Exchange Rate:* 1 USD ≈ ₹84.05 INR (Interbank / RBI reference rate band ~₹84.00–84.10).

### Option A: Keep All Three Projects in the Pro Organization
Upgrade organization `pwfzmsccchpaqwwimoih` to Pro and launch `thebreakdown-staging` alongside `thebreakdown-production` and `the-breakdown-fact-check`.

- **Project Inventory**:
  1. `mskyhaunnlwtwvsqcmav` (production, `ap-south-1`): Dedicated Micro VM ($10.00/mo)
  2. `thebreakdown-staging` (new staging, `ap-south-1`): Dedicated Micro VM ($10.00/mo)
  3. `lvfovvidtowadmnggzzf` (fact-check, `ap-northeast-2`): Dedicated Micro VM ($10.00/mo)
  4. `swektehukscmsgxdzymw` (legacy 403, `ap-northeast-2`): Paused ($0.00/mo compute)
- **Monthly Cost Calculation**:
  - Base Pro Subscription: **$25.00**
  - Gross Compute (3 active projects @ $10/mo): **$30.00**
  - Included Compute Credits: **-$10.00**
  - Net Compute Charges: **$20.00**
  - **Total Monthly Fixed/Recurring Charge**: **$45.00 / month**
- **Indicative INR**:
  - Net USD: $45.00 × 84.05 = **₹3,782.25 / month** (excluding GST).
  - With 18% GST (if billing address in India): $53.10 × 84.05 = **₹4,463.05 / month**.
- **Variable Usage Inclusions**: 250 GB Egress, 100 GB Storage, 8 GB Disk per project, 2M Edge Functions, 5M Realtime messages, automated daily backups with 7-day retention.
- **Verification Status**: **VERIFIED** against official pricing. Fully qualified pending payment card and human authorization.

---

### Option B: Upgrade Production & Staging to Pro; Transfer Fact-Checking to Free Organization
Upgrade organization `pwfzmsccchpaqwwimoih` to Pro, launch `thebreakdown-staging`, create a new Free organization `thebreakdown-fact-check-org`, and transfer `lvfovvidtowadmnggzzf` into it.

- **Organization 1 (Pro Plan — `pwfzmsccchpaqwwimoih`)**:
  - `mskyhaunnlwtwvsqcmav` (production): Dedicated Micro VM ($10.00/mo)
  - `thebreakdown-staging` (staging): Dedicated Micro VM ($10.00/mo)
  - Base Fee: $25.00
  - Gross Compute (2 projects): $20.00
  - Included Compute Credits: -$10.00
  - Net Compute Charges: $10.00
  - Subtotal Org 1: **$35.00 / month**
- **Organization 2 (Free Plan — `thebreakdown-fact-check-org`)**:
  - `lvfovvidtowadmnggzzf` (fact-check): Free Tier instance ($0.00/mo)
  - Quota Check: Because projects in Org 1 are paid, they do not consume the user's account-wide Free project quota. `lvfovvidtowadmnggzzf` consumes Slot 1 of 2 free slots.
  - Subtotal Org 2: **$0.00 / month**
- **Sub-Scenario Modeling for Fact-Check Project**:
  - *Sub-Scenario B1 (Active in Free Org)*: Project remains active. QA tests and polling workers continue operating. Subject to 7-day inactivity pausing if user queries cease. Cost: **$35.00 / month**.
  - *Sub-Scenario B2 (Paused in Free Org)*: Project is manually paused in the Free Org. Preserved with a 90-day restore window. QA tests and polling fail. Cost: **$35.00 / month**.
- **Total Monthly Recurring Charge**: **$35.00 / month**
- **Indicative INR**:
  - Net USD: $35.00 × 84.05 = **₹2,941.75 / month** (excluding GST).
  - With 18% GST: $41.30 × 84.05 = **₹3,471.25 / month**.
- **Operational Nuances**:
  - Requires 1–2 minutes downtime during transfer.
  - Requires managing two separate organizations under the same account.
- **Verification Status**: **VERIFIED** against official transfer and quota rules. Fully qualified pending human authorization.

---

### Option C: Remain on Free Plan; Pause Fact-Checking
Keep organization `pwfzmsccchpaqwwimoih` on the Free Plan. Pause `lvfovvidtowadmnggzzf` in the dashboard (freeing Slot 2) and launch `thebreakdown-staging` into the freed slot.

- **Project Inventory**:
  - `mskyhaunnlwtwvsqcmav` (production): Active (Slot 1 of 2)
  - `thebreakdown-staging` (staging): Active (Slot 2 of 2)
  - `lvfovvidtowadmnggzzf` (fact-check): Paused (0 slots, 90-day restore window)
  - `swektehukscmsgxdzymw` (legacy 403): Paused (0 slots)
- **Monthly Cost**: **$0.00 / month** (₹0.00).
- **Institutional & Operational Risks**:
  1. **Production Backup Void**: Free Plan does **NOT** provide downloadable backups, automated daily backups, or point-in-time recovery for production (`mskyhaunnlwtwvsqcmav`).
  2. **Production Auto-Pause Risk**: Free projects without sufficient user activity are automatically paused after 7 days.
  3. **Interrupted QA & CI Pipelines**: Automated tests in `.github/workflows/production-deploy.yml` and `tests/evidence-vault/` hardcoding `lvfovvidtowadmnggzzf` fail immediately until code is retargeted.
  4. **Render Worker Disruption**: External worker receives `540 Project Paused` instead of `400 Bad Request`.
- **Verification Status**: **VERIFIED** technically, but **OPERATIONALLY DISQUALIFIED** for institutional production standards due to lack of production backups.

---

## 4. Mission 3 — Preserve Operational Continuity

### 4.1 Telemetry Audit: External Render Polling Worker
Live ClickHouse edge logs on `lvfovvidtowadmnggzzf` revealed:
- **Origin IP**: `74.220.49.18` (AS: `Render`, Virginia, US).
- **Client**: Node.js `supabase-js/2.108.2`.
- **Frequency**: Every 60–120 seconds.
- **Request**: `GET /rest/v1/stories?select=id,title,publish_at&status=eq.scheduled&publish_at=lte...`
- **Response**: `400 Bad Request` (`error=42703`, column `publish_at` does not exist).

### 4.2 Architectural Origin & Downstream Dependency Analysis
1. **Historical Root**: `lvfovvidtowadmnggzzf` was created on June 20, 2026 as the original database for an early prototype deployed on Render.
2. **Current Production Architecture**:
   - Production was migrated to `mskyhaunnlwtwvsqcmav` (Mumbai) on October 1, 2026.
   - Production scheduled publishing was completely refactored in PR #92 to use Cloudflare Cron Worker `thebreakdown-scheduled-publish` calling Next.js API `/api/editorial/publish-due` with `CRON_SECRET`.
3. **Downstream Dependency Assessment**:
   - The Render polling worker is an **abandoned, orphaned background service** pointing to obsolete columns on the June 2026 database.
   - **Zero production workflows depend on this worker**.
   - If `lvfovvidtowadmnggzzf` is paused, the worker receives HTTP 540 (Project Paused). If transferred to Free Org 2, it continues receiving HTTP 400. Neither event impacts production publishing at `https://thebreakdown.in`.

---

## 5. Mission 4 — Comparative Evaluation & Final Recommendation

### 5.1 Comparative Evaluation Matrix

| Evaluation Dimension | Option A: All Projects in Pro | Option B: Prod/Staging in Pro + Fact-Check in Free Org | Option C: Remain on Free (Pause Fact-Check) |
|---|---|---|---|
| **Monthly Fixed Cost** | **$45.00 / month** | **$35.00 / month** | **$0.00 / month** |
| **Indicative INR (with GST)** | **~₹4,463 / month** | **~₹3,471 / month** | **₹0.00** |
| **Production Data Protection** | ✅ Automated daily backups, 7-day retention, no pausing | ✅ Automated daily backups, 7-day retention, no pausing | ❌ **No automated backups**, risk of 7-day inactivity pause |
| **Editorial & QA Continuity** | ✅ 100% uninterrupted; fact-check DB remains fully online | ⚠️ Minor: 1-2 min transfer downtime; fact-check subject to 7-day pause if idle | ❌ Broken: Fact-check paused; CI smoke suites fail until retargeted |
| **Transfer Risk & Downtime** | ✅ **Zero transfer risk** (0 downtime) | ⚠️ 1–2 minutes downtime during transfer; multi-org management | ✅ No transfer (but manual pause) |
| **Staging Quality** | ✅ Dedicated managed instance in `ap-south-1` (Mumbai) | ✅ Dedicated managed instance in `ap-south-1` (Mumbai) | ⚠️ Managed instance in `ap-south-1`, but subject to free limits |
| **Operational Simplicity** | ✅ Single organization, single invoice, standard IAM | ⚠️ Two organizations, two dashboards under one login | ⚠️ Requires CI retargeting and manual unpause within 90 days |

---

### 5.2 Final Recommendation

#### Preferred Route: **Option A ($45.00 / month — All Projects in Pro)**
- **Why It Is Best**: The Breakdown OS is an active production journalism and policy platform (`https://thebreakdown.in`). Running production on a Free tier database without automated daily backups is an unacceptable risk. Option A delivers:
  1. Enterprise-grade protection for production with automated backups.
  2. A dedicated staging database in Mumbai (`ap-south-1`) with identical configuration.
  3. Continuous operation of the fact-checking project without downtime, transfer complexity, or CI broken references.
  4. The cost difference over Option B is only **$10/month (~₹840/mo)**, which completely eliminates cross-organization administrative friction and transfer risk.

#### Lower-Cost Fallback: **Option B ($35.00 / month — Pro Prod/Staging + Free Fact-Check Org)**
- **Why It Is a Sound Fallback**: If minimizing monthly recurring expenses is paramount, Option B saves $10/month while fully maintaining Pro automated backups and dedicated staging for production. Fact-checking is preserved as an active free project in a secondary organization.

#### Emergency Zero-Cost Fallback: **Option C ($0.00 / month)**
- Available only if budget authorization is strictly $0. It requires pausing fact-checking and accepting that production runs without automated backups.

---

## 6. Human Approval Checklist

To execute the chosen path, the project owner/administrator must select one option below:

```
═══════════════════════════════════════════════════════════════════════════════
HUMAN APPROVAL REQUIRED: STAGING PROVISIONING DECISION
═══════════════════════════════════════════════════════════════════════════════

[ ] OPTION A (RECOMMENDED): ALL PROJECTS IN PRO ORGANIZATION
    - Action: Upgrade organization pwfzmsccchpaqwwimoih to Supabase Pro.
    - Financial Commitment: $45.00/month (~₹3,782/mo + GST, total ~₹4,463/mo).
    - Execution: Launch thebreakdown-staging in ap-south-1. Leave fact-checking online.
    - Next Engineering Step: Bootstrap baseline 032, validate migrations 033–037.

[ ] OPTION B (LOWER-COST FALLBACK): PRO PROD/STAGING + FACT-CHECK IN FREE ORG
    - Action: Upgrade pwfzmsccchpaqwwimoih to Pro ($25 base + $10 compute = $35/mo).
    - Financial Commitment: $35.00/month (~₹2,942/mo + GST, total ~₹3,471/mo).
    - Execution: Create Free Org 2, transfer lvfovvidtowadmnggzzf to Org 2, launch staging in Org 1.
    - Next Engineering Step: Bootstrap baseline 032, validate migrations 033–037.

[ ] OPTION C (EMERGENCY ZERO-COST): REMAIN ON FREE PLAN
    - Action: Pause lvfovvidtowadmnggzzf in Supabase dashboard. Keep Org on Free tier.
    - Financial Commitment: $0.00/month.
    - Execution: Launch thebreakdown-staging in ap-south-1 within freed slot; retarget CI references.
    - Institutional Risk: Production operates without automated daily backups.
═══════════════════════════════════════════════════════════════════════════════
```

---

## 7. Audit Invariants & Integrity Confirmation

- **Zero SQL Mutations**: No DDL or DML was executed against production (`mskyhaunnlwtwvsqcmav`) or fact-checking (`lvfovvidtowadmnggzzf`).
- **Zero Provider Lifecycle Mutations**: No projects were created, paused, unpaused, restored, or transferred.
- **Zero Plan Changes**: No billing subscriptions were upgraded or altered.
- **Production Edge Uncompromised**: `https://thebreakdown.in` verified healthy (200 OK) at commit `4d835608`.
- **Isolated Branch**: All documentation updates committed strictly to `mission/post-merge-verification-2026-10-16` (PR #87). Primary workspace `c:\newsjack-content\thebreakdown-os` remains completely untouched.
