# Release Candidate (RC) Verification Report Template

## Overview
- **Version:** v[X.Y.Z]-rc[N]
- **Git Tag:** `[tag-vX.Y.Z-rcN]`
- **Commit Hash:** `[hash]`
- **Deployment Timestamp:** [YYYY-MM-DD HH:MM UTC]
- **Target Env:** [Staging/Production]
- **Rollback Target Version:** `[vX.Y.Z-previous]`

## Verification Status
- **Typecheck:** [PASS / FAIL]
- **Production Build:** [PASS / FAIL]
- **Automated Tests:** [PASS / FAIL] - [Count]/[Total] passing

## Test Runner Results
```
[Paste npm run test:all console output here]
```

## Critical Fixes Applied
*List any bugs or regressions resolved during validation:*
- E.g. Fixed [file.ts] where async functions were resolving incorrectly.

## Pre-Release Metrics Summary
- **Hydration Errors:** [Zero / Count]
- **Lighthouse Performance Score (Local):** [Score]
- **Lighthouse Accessibility Score (Local):** [Score]

## Release Sign-Off Signatures
| Role | Approver | Signature / Status | Date |
| :--- | :--- | :--- | :--- |
| **Engineering Lead** | [Name] | [Approved / Pending] | [Date] |
| **Quality Assurance** | [Name] | [Approved / Pending] | [Date] |
| **Product / Site Owner**| [Name] | [Approved / Pending] | [Date] |
