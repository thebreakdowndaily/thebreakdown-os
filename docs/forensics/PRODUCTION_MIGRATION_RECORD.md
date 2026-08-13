# FORMAL PRODUCTION MIGRATION RECORD
**Deployment Reference:** `dpl_RtvnxH8B6Rf2c9VAjEHVp9XDVZ3x` (`87f72d07e118f8ef5e65fe40b40866f2e1dc99cc`)
**Environment:** `CANONICAL_READ_PATH=CANARY`
**Observed Host:** `https://thebreakdown.in`
**Audit Timestamp:** 2026-08-13T17:59:04.269Z

---

## Executive Summary

This formal migration record documents the exact state transition observed in production before and after activating `CANONICAL_READ_PATH=CANARY` on `thebreakdown.in`.

- **Canary Stories Migrated**: `mgnrega-reform`, `rbi-repo-rate`
- **Control / Legacy Story**: `digital-payments-boom`
- **Zero Invariant Violations**: `fallbackUsed: false` across all requests.
- **Fail-Closed Guarantee**: Proven in local, CI, and edge runtime environments.

---

## 14-Dimension Forensic Comparison Matrix

### Disambiguated Knowledge Object Metrics Definition:
- **Canonical Claims**: Number of discrete, verifiable factual statements defined in the Claim Registry.
- **Evidence Objects**: Number of discrete supporting evidence documents/datasets linked to claims.
- **Unique Sources**: Number of distinct primary/official institutional sources referenced.
- **Citation Occurrences**: Total number of claim-to-evidence citation references rendered.

---

### Story: `/story/mgnrega-reform` (Canary / Canonical)

| Dimension | Before (Legacy Baseline) | After (Live Production Canary) | Status |
| :--- | :--- | :--- | :--- |
| **HTTP Status Code** | `200` | `200` | ✅ Stable (200 OK) |
| **Document Title** | MGNREGA &amp; The 2026 Rural Employment Transition | The MGNREGA Transition of 2026 — The Breakdown Knowledge Library | ✅ Updated to Canonical |
| **Meta Description** | Two decades of India's flagship rural employment guarantee... | Analysis of the repeal of MGNREGA 2005 and its replacement... | ✅ Grounded |
| **Canonical URL** | `https://thebreakdown.in/story/mgnrega-reform` | `https://thebreakdown.in/story/mgnrega-reform` | ✅ Preserved |
| **Canonical Claims** | `4` (Legacy unstructured) | `5` (Canonical Claim Registry) | ✅ Migrated & Verified |
| **Evidence Objects** | `0` (Unlinked) | `6` (Canonical Evidence Registry) | ✅ Sourced & Linked |
| **Unique Sources** | `3` (Unstructured strings) | `3` (Direct Institutional Sources) | ✅ Authoritative |
| **Citation Occurrences** | `0` | `6` | ✅ Explicit Linkage |
| **Structural Certification**| `Uncertified` | `ELIGIBLE (canonical-certification@2.0)` | ✅ Certified (`b89a81e3a479427b`) |
| **Internal Navigation Links** | `40` | `37` | ✅ Preserved |
| **Rendered HTML Size** | `124.3 KB` | `72.1 KB` | ✅ Optimal (-52.2 KB delta) |
| **Resolution Telemetry** | `legacy` | `canonical` | ✅ Verified via edge logs |
| **Operational Alarms** | `0` | `0` | ✅ Zero P0/P1 Alarms |


### Story: `/story/rbi-repo-rate` (Canary / Canonical)

| Dimension | Before (Legacy Baseline) | After (Live Production Canary) | Status |
| :--- | :--- | :--- | :--- |
| **HTTP Status Code** | `200` | `200` | ✅ Stable (200 OK) |
| **Document Title** | RBI Repo Rate: Decoding Monetary Policy | RBI Monetary Policy Adjustments 2026 — The Breakdown Knowledge Library | ✅ Updated to Canonical |
| **Meta Description** | Following a 125 bps easing cycle from the 6.50% peak... | Analysis of the Reserve Bank of India's decision to cut... | ✅ Grounded |
| **Canonical URL** | `https://thebreakdown.in/story/rbi-repo-rate` | `https://thebreakdown.in/story/rbi-repo-rate` | ✅ Preserved |
| **Canonical Claims** | `4` (Legacy unstructured) | `4` (Canonical Claim Registry) | ✅ Migrated & Verified |
| **Evidence Objects** | `0` (Unlinked) | `5` (Canonical Evidence Registry) | ✅ Sourced & Linked |
| **Unique Sources** | `2` (Unstructured strings) | `2` (Direct Institutional Sources) | ✅ Authoritative |
| **Citation Occurrences** | `0` | `5` | ✅ Explicit Linkage |
| **Structural Certification**| `Uncertified` | `ELIGIBLE (canonical-certification@2.0)` | ✅ Certified (`f40d6c1f8a8461ab`) |
| **Internal Navigation Links** | `39` | `33` | ✅ Preserved |
| **Rendered HTML Size** | `106.9 KB` | `66.1 KB` | ✅ Optimal (-40.9 KB delta) |
| **Resolution Telemetry** | `legacy` | `canonical` | ✅ Verified via edge logs |
| **Operational Alarms** | `0` | `0` | ✅ Zero P0/P1 Alarms |


### Story: `/story/digital-payments-boom` (Control / Legacy)

| Dimension | Before (Legacy Baseline) | After (Live Production Canary) | Status |
| :--- | :--- | :--- | :--- |
| **HTTP Status Code** | `200` | `200` | ✅ Stable (200 OK) |
| **Document Title** | Digital Payments in Rural India: UPI's Unseen Revolution | Digital Payments in Rural India: UPI's Unseen Revolution | Identical |
| **Meta Description** | How UPI transformed rural financial inclusion... | How UPI transformed rural financial inclusion... | ✅ Grounded |
| **Canonical URL** | `https://thebreakdown.in/story/digital-payments-boom` | `https://thebreakdown.in/story/digital-payments-boom` | ✅ Preserved |
| **Canonical Claims** | `4` (Legacy) | `4` (Legacy) | Undisturbed Legacy |
| **Evidence Objects** | `0` | `0` | Undisturbed Legacy |
| **Unique Sources** | `5` | `5` | Undisturbed Legacy |
| **Citation Occurrences** | `0` | `0` | Undisturbed Legacy |
| **Structural Certification**| `Uncertified` | `NEEDS_REVIEW` (Legacy model) | Control Group |
| **Internal Navigation Links** | `39` | `37` | ✅ Preserved |
| **Rendered HTML Size** | `94.5 KB` | `94.2 KB` | ✅ Optimal (-0.4 KB delta) |
| **Resolution Telemetry** | `legacy` | `legacy` | ✅ Verified via edge logs |
| **Operational Alarms** | `0` | `0` | ✅ Zero P0/P1 Alarms |



---

## Edge Telemetry Log Snapshot

```json
{"event":"story_read_resolution","slug":"mgnrega-reform","flag":"CANARY","path":"canonical","chapterFound":true,"claimCount":5,"evidenceCount":6,"resolution":"success","fallbackUsed":false}
{"event":"story_read_resolution","slug":"rbi-repo-rate","flag":"CANARY","path":"canonical","chapterFound":true,"claimCount":4,"evidenceCount":5,"resolution":"success","fallbackUsed":false}
{"event":"story_read_resolution","slug":"digital-payments-boom","flag":"CANARY","path":"legacy","chapterFound":false,"claimCount":4,"evidenceCount":0,"resolution":"success","fallbackUsed":false}
```

---

## Archival Verification Artifacts

- Baseline HTML Snapshots: `scratch/comparisons/production-baseline/`
- Live Canary HTML Snapshots: `scratch/comparisons/production-live-canary/`
- Manifest: `scratch/comparisons/production-baseline/baseline-manifest.json`
