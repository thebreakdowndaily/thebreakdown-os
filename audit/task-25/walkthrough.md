# Walkthrough — TASK-25 Dynamic Trust & Freshness Badges

## Summary

Implemented dynamic trust computation, dynamic trust bar layout on the homepage, live trust dashboard values, and accurate freshness badges on Fixes and Datasets.

## Changes Made

### 1. Dynamic Trust Metrics Engine
- **File:** [trust-metrics.ts](file:///C:/newsjack-content/thebreakdown-os/lib/knowledge/trust-metrics.ts)
- **Modifications:**
  - Extended the `TrustMetrics` interface to include `averageTrustScore`, `evidenceDebt`, and `lastVerifiedDate`.
  - Computed `averageTrustScore` as the mathematical average of the `evidenceScore` of all canonical stories in the Story service.
  - Computed `evidenceDebt` as the total number of claims with status `'debated'` or `'contested'` (canonical statuses actually in the claim registry).
  - Calculated `lastVerifiedDate` from the latest actual verification timestamp across Chapters, Claims, and Evidence.
  - Structured failure-safe fallbacks: returning explicit unavailable values (`undefined` or `'NOT VERIFIED'`) instead of fabricating mock defaults or throwing when calculation fails.

### 2. Homepage TrustBar
- **File:** [TrustBar.tsx](file:///C:/newsjack-content/thebreakdown-os/components/home/trust/TrustBar.tsx)
- **Modifications:**
  - Upgraded component properties to support optional values.
  - Replaced hardcoded numbers with live, dynamically calculated metrics.
  - Implemented safe fallbacks (`"Not available"` / `"Not verified"`) in the UI when metrics are missing or not verified.
  - Renamed the link text to `"Trust Dashboard ↗"` to conform with canonical taxonomy rules.

- **File:** [HomepageLayout.tsx](file:///C:/newsjack-content/thebreakdown-os/components/home/HomepageLayout.tsx)
- **Modifications:**
  - Imported and rendered `<TrustBar />` directly below the `<HeroSection />`.

### 3. Trust Dashboard
- **File:** [page.tsx](file:///C:/newsjack-content/thebreakdown-os/app/trust/page.tsx)
- **Modifications:**
  - Replaced hardcoded values for `"Average Trust Score"`, `"Evidence debt items"`, and `"Last platform-wide verification"` with live computed metrics.
  - Integrated safe UI fallback states: printing `"Not available"` or `"Not verified"` when values are absent.

### 4. Freshness Badges
- **File:** [FixHeroStrip.tsx](file:///C:/newsjack-content/thebreakdown-os/components/fix/FixHeroStrip.tsx)
- **Modifications:**
  - Rendered `Verified {date}` when a genuine `lastVerified` timestamp is present in the `Fix` model.
  - Reverted to `Updated {date}` utilizing the `updatedAt` field when no verification timestamp exists, preventing false verification reporting.

- **File:** [DatasetHero.tsx](file:///C:/newsjack-content/thebreakdown-os/features/dataset/components/DatasetHero.tsx)
- **Modifications:**
  - Added the freshness metadata field to the dataset detail page showing `Updated {date}` (or `Verified {date}` if a verification timestamp is added in the future).

## Verification

### Automated Tests
- Created [trust-metrics.test.ts](file:///C:/newsjack-content/thebreakdown-os/tests/trust-metrics.test.ts) to verify the dynamic computations of the engine.
- Ran tests:
  ```bash
  npx tsx tests/trust-metrics.test.ts
  ```
  Result: **7/7 tests passed successfully.**
- Ran the full platform test suite:
  ```bash
  npm test
  ```
  Result: **All tests passed cleanly.**
- Verified clean build and compilation:
  ```bash
  npx tsc --noEmit
  ```
  Result: **0 errors.**
