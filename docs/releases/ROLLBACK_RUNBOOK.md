# Rollback Runbook

Use this runbook if a deployment fails or critical regressions are detected post-release.

## 1. Rollback Mandate Criteria
A rollback must be initiated immediately without waiting for diagnostic debugging if any of the following triggers occur:
- **Sustained Error Rates:** System 5xx/server error rates exceed `1%` of total requests over any 5-minute window.
- **Authentication Failure:** Readers or editors are completely blocked from logging in, checking out sessions, or accessing verified dashboard directories.
- **Data Integrity / Security Leaks:** Unintended data access (e.g. users seeing other users' data, PII exposure, draft editorial states visible to public users) or active database corruption.
- **Core Web Vitals Regressions:** Live monitoring indicates LCP exceeds 4.0s or CLS exceeds 0.25 on primary landing paths due to server-side delivery bottlenecks.

## 2. Identify Root Cause Severity
If none of the mandate thresholds are breached, evaluate if the problem can be patched with a fast hotfix:
- **Immediate Rollback Required:** Core functionality loss, DB deadlock, custom 404 page rendering crash.
- **Hotfix Allowed:** CSS layout shifts on edge viewports, minor analytics/tracking pipeline issues, spelling errors.

## 3. Execution Steps
1. **Hosting Provider Rollback:**
   - Log into Vercel/Cloudflare and instantly switch the active alias pointer back to the previous stable build deployment (e.g., the build matching `v1.0.0-previous`).
   - Confirm status changes to active.
2. **Git Branch Cleanup:**
   - Revert the release branch pointer or create a revert commit:
     ```bash
     git revert -m 1 [Release Merge Commit SHA]
     ```
3. **Database & CDN Edges Cleanup:**
   - If database migrations were run, execute the corresponding rollback schemas.
   - Purge CDN edges globally to remove cached versions of the faulty build payload.
