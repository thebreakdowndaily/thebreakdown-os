# THE BREAKDOWN — VERCEL DEPLOYMENT STORAGE OBSERVABILITY
## Loop 4 Observability & Verification Audit

**Date:** 28 September 2026  
**Auditor / Engineer:** Principal Platform & DevOps Forensic Engineer  
**Canonical Repository:** `thebreakdown-os`  
**Vercel Team:** `bholebababhakti108-makers-projects` (`team_tbFilNFb4UMox6A5vKhdBngZ`)  
**Production Target:** `https://thebreakdown.in` (`dpl_AAtzpPo15QUTz8aEeDcf3YF5kBQf`)  
**Classification Status:**  
**`Root cause identified → remediation executed → production verified → final storage reconciliation pending.`**

---

## 1. Executive Observability Summary

Following the execution of Loop 3 remediation, Loop 4 was conducted as a pure post-remediation observability and verification pass to:
1. Verify the exact state of Vercel projects, webhooks, and retained deployments.
2. Investigate the API availability of raw Vercel storage meter telemetry on the Hobby plan.
3. Investigate and resolve the status of `project-0hvar`.
4. Validate the ignore-build filter behavior across Windows and Vercel CI environments.
5. Provide strict proof that the system will not regress into duplicate deployments on subsequent Git pushes.

---

## 2. Forensic Findings by Observability Step

### Step 1: Vercel Storage Quota Telemetry on Hobby Plan
- We queried the Vercel API usage endpoints:
  - `GET /v1/usage?teamId=team_tbFilNFb4UMox6A5vKhdBngZ&from=...&to=...`
- **Result:** Vercel returned HTTP 400 with the exact error message:
  ```json
  {
    "error": {
      "code": "bad_request",
      "message": "This API endpoint is only available to Teams on the Pro or Enterprise plan."
    }
  }
  ```
- **Engineering Conclusion:** On Vercel Hobby accounts, raw byte-level deployment storage metrics are intentionally restricted from the REST API. The authoritative byte-level quota meter is visible solely in the **Vercel Web Dashboard under Settings > Usage**.
- The physical drivers of storage (retained deployments: 10 → 1, project count: 3 → 1, tracked repository size: 187 MB → 50 MB, local upload bundle: 233 MB → 47 MB) are confirmed and verified.

### Step 2: Deployment Count Reconciliation
- We queried `GET /v6/deployments?teamId=team_tbFilNFb4UMox6A5vKhdBngZ&limit=100`.
- **Result:** Exactly **1 deployment** exists across the entire team:
  - `uid`: `dpl_AAtzpPo15QUTz8aEeDcf3YF5kBQf`
  - `name`: `thebreakdown-os`
  - `state`: `READY`
  - `readySubstate`: `PROMOTED`
  - `target`: `production`
  - `url`: `thebreakdown-esehjoezf-bholebababhakti108-makers-projects.vercel.app`
  - `aliases`: `thebreakdown.in`, `thebreakdown-os.vercel.app`
- All 9 stale, errored, and canceled deployments have been eradicated from the team queue.

### Step 3: Audit & Removal of `project-0hvar`
- Inspection of `project-0hvar` (`prj_woZyW87JtX3ANqD8244hnvAPXfjk`) revealed:
  - Created 92 days ago during initial onboarding.
  - `link`: `null` (No repository connected).
  - `latestDeployments`: `[]` (0 deployments).
  - `targets`: `{}` (No production domain).
  - `alias`: `[]` (No routes).
- Because it was an abandoned, dormant stub with zero utility, it was deleted via `DELETE /v9/projects/prj_woZyW87JtX3ANqD8244hnvAPXfjk`.
- **Result:** Team project count dropped from 2 to **exactly 1 (`thebreakdown-os`)**.

### Step 4: Git Webhook Count & Duplicate Prevention
- Verified project linking on `thebreakdown-os`:
  - `repo`: `thebreakdown-os`
  - `repoId`: `1286893059`
  - `org`: `thebreakdowndaily`
  - `productionBranch`: `main`
- With ghost project `my` purged, **only 1 webhook listener exists**. The next Git push will trigger **strictly 1 build**, completely eliminating the concurrent duplicate build pathology.

### Step 5: Local Upload Payload Measurement
- Fresh dry-run execution: `npx vercel deploy --dry --format=json`.
- Files analyzed: 3,068 files.
- Total uncompressed upload size: **47.95 MB**.
- Reduction from baseline (233.28 MB): **-185.33 MB (-79.4%)**.

### Step 6 & 7: Ignore-Build Filter Validation & Cross-Platform Hardening
During testing of `scripts/vercel-ignore-build.js`, a subtle shell bug was uncovered:
- In `execSync`, the syntax `git diff HEAD^ HEAD` caused Windows `cmd.exe` to interpret `^` as an escape character, resulting in `git diff HEAD HEAD` (empty diff).
- **Remediation Executed:**
  - Upgraded diff command to use POSIX/Windows compatible `HEAD~1 HEAD`.
  - Added support for Vercel native build environment variables: `VERCEL_GIT_PREVIOUS_SHA` and `VERCEL_GIT_COMMIT_SHA`.
  - Added `deployment-storage-*` pattern to root non-production exclusions.
- **Verification Tests:**
  1. Documentation/Report commit (`6749f5a`):
     - Evaluated: `deployment-storage-execution-after.json`, `deployment-storage-execution-report.md`.
     - Decision: **CANCEL BUILD (Exit Code 0)** — Deployment storage conserved.
  2. Code/Script commit (`1eef2e2`):
     - Evaluated: `scripts/vercel-ignore-build.js`.
     - Decision: **PROCEED WITH BUILD (Exit Code 1)** — Deployment proceeds.
  3. Regression test suite (`scratch/test-ignore-filter.js`): **8/8 PASSED**.

### Step 8: Production Smoke Tests
- Automated suite `npm run test:smoke-prod`: **25/25 PASSED**.
- Live route verifications against `https://thebreakdown.in`:
  - `/` -> **200 OK**
  - `/up403/up-ac-001` -> **200 OK**
  - `/up403/timeline/UP-AC-001` -> **200 OK**
  - `/story/ews-quota-upsc-investigation` -> **200 OK**
  - `/trackers/mgnrega` -> **200 OK**
  - `/trackers/upi` -> **200 OK**
  - `/sitemap.xml` -> **200 OK**
  - `/robots.txt` -> **200 OK**
  - Zero downtime observed throughout the audit and cleanup.

---

## 3. Current State Matrix

| Vector | Status | Evidence |
| :--- | :--- | :--- |
| **Active Projects** | 1 (`thebreakdown-os`) | `vercel project ls` |
| **Retained Deployments** | 1 (`dpl_AAtzpPo15QUTz8aEeDcf3YF5kBQf`) | `GET /v6/deployments` |
| **Tracked Git Size** | 50.52 MB (3,882 files) | `npm run check:budget` |
| **Local Upload Size** | 47.95 MB (3,068 files) | `vercel deploy --dry` |
| **Webhook Triggers** | 1 (Single pipeline) | `GET /v9/projects/thebreakdown-os` |
| **Ignored Build Step** | Active & Tested | `vercel.json` -> `scripts/vercel-ignore-build.js` |
| **Production Health** | 100% Operational | 25/25 Automated Smoke Tests |
| **Storage Quota Status** | Reclaimed (Meter sync pending) | Dashboard Settings > Usage |

---

## 4. Next Step Recommendation

As recommended:
- **No further Vercel or infrastructure optimization should be performed.**
- The platform is clean, hardened, and bounded.
- The next step is simply observing the Vercel Dashboard usage meter on the next scheduled editorial/newsroom release to confirm the updated storage baseline.
