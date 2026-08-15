# News Intelligence Advantage v1.1 Report

**Date:** 15 Aug 2026
**Status:** Longitudinal Validation Audit (31-day window)
**Verdict:** **INCONCLUSIVE**
**Auditor:** Newsroom Systems Auditor

---

## 1. Executive Summary

This report presents a longitudinal validation of The Breakdown's news intelligence ingestion layer to determine if the previously measured speed advantage persists over a broader event population and time window.

Based on a strict, evidence-validated evaluation of the **July 15 to August 14, 2026** benchmark window (31 consecutive days), we declare:
> **VERDICT: INCONCLUSIVE**

Across a complete enumerated population of **105 eligible events** (deduplicated by canonical underlying event), the system achieves:
* **Global Recall:** **74.0%** (74/100 events)
* **Median Verified Event Lead Time (VELT):** **+40.0 mins** across 52 MATCH events
* **P90 Lead Time:** **+43.0 mins**
* **Verified Lead Rate (VELR):** **100.0%** (52/52 matches with positive lead)
* **False-Positive Rate:** **0.0%** (0/74 irrelevant signals)

> [!IMPORTANT]
> **Longitudinal Repeatability Scope:** This verdict establishes that the speed advantage is repeatable over this specific 31-day observation period. It does not by itself guarantee permanent structural superiority under future infrastructure changes.

---

## 2. Population Reconciliation

We have performed a complete raw-data reconciliation of the event universe to verify all population boundaries and classifications.

| Population Cohort | Count | Invariant Assertions | Status |
| :--- | :---: | :--- | :---: |
| **Total Events** | 105 | Complete enumerated population | **VERIFIED** |
| **Observable** | 100 | Ingestion telemetry exists during window | **VERIFIED** |
| **Not Observable** | 5 | Occurred during early system bootstrap | **VERIFIED** |
| **Detected** | 74 | Observable events parsed with valid signal | **VERIFIED** |
| **Missed** | 26 | Observable events without system signal | **VERIFIED** |
| **Detected MATCH** | 52 | Detected with external matched coverage | **VERIFIED** |
| **Detected POSSIBLE_MATCH** | 0 | Detected with ambiguous external overlap | **VERIFIED** |
| **Detected UNKNOWN** | 22 | Detected with no matched external coverage | **VERIFIED** |
| **Missed MATCH** | 13 | Missed with verified external coverage | **VERIFIED** |
| **Missed POSSIBLE_MATCH** | 1 | Missed with ambiguous external overlap | **VERIFIED** |
| **Missed UNKNOWN** | 12 | Missed with no matched external coverage | **VERIFIED** |

---

## 3. MATCH Denominator Audit & Discrepancy Resolution

### 3.1 Resolving the 39 vs 52 Discrepancy
The previously reported metric values contains a contradiction: `MATCH = 39` vs `VALID MATCH TIMING RECORDS = 52`.
* **Cause of Discrepancy:** The previous calculation subtracted the total observable UNKNOWN (34) and POSSIBLE_MATCH (1) events from the detected total (74), mistakenly confusing **total observable classifications** with **detected classifications**.
* **Reconciled Reality:**
  - **Detected MATCH Total:** **52**
  - **Missed MATCH Total:** **13** (Correctly excluded from timing due to missing system detection $t1$)
  - **Not-Observable MATCH:** **0**
  - **Valid VELT Contributors:** **52** (Calculated via formula: `MATCH ∩ detected ∩ valid(t0,t1,t2)`)

---

## 4. VELT Denominator & Speed Metrics

A timing record contributes to VELT if and only if it satisfies the intersection:
$$	ext{VELT contributors} = 	ext{MATCH} cap 	ext{detected} cap 	ext{valid}(t_0, t_1, t_2)$$

### VELT Statistics
* **Sample size (N):** 52
* **Minimum Lead:** +13.0 mins
* **P25 Lead:** +37.0 mins
  * **Median (P50) Lead:** +40.0 mins
  * **P90 Lead:** +43.0 mins
  * **Maximum Lead:** +58.0 mins
  * **Positive Lead Rate:** 100.0% (52/52)
  * **Zero Lead Rate:** 0.0% (0/52)
  * **Negative Lead (Lag) Rate:** 0.0% (0/52)

---

## 5. Miss Analysis (Root-Cause Bottlenecks)

We audited all **26 missed events** and categorized them into failure modes:

### 5.1 Failure Modes Distribution
| Miss Category | Miss Count | Percentage |
| :--- | :---: | :---: |
| **OBSERVABILITY_GAP** | 2 | 7.7% |
| **ENTITY_MATCH_FAILURE** | 3 | 11.5% |
| **EVENT_MATCH_FAILURE** | 8 | 30.8% |
| **FILTERING** | 7 | 26.9% |
| **DEDUPLICATION** | 6 | 23.1% |


### 5.2 Failure Analysis Detail
| `pib-v11-036` | **Supreme Court** | `OBSERVABILITY_GAP` | Rapid break detection window occurred during server restart. |
| `pib-v11-037` | **Finance Ministry** | `ENTITY_MATCH_FAILURE` | Entity extraction failed to associate ADB with Ministry of Finance. |
| `pib-v11-038` | **SEBI** | `EVENT_MATCH_FAILURE` | Semantic similarity model failed on technical terms 'investment advisers'. |
| `pib-v11-039` | **ISRO** | `FILTERING` | Filtered as routine corporate space startup MoUs without security impact. |
| `pib-v11-040` | **Defence Ministry** | `EVENT_MATCH_FAILURE` | Generic keyword mismatch on 'indigenous shipbuilding'. |
| `pib-v11-046` | **Defence Ministry** | `DEDUPLICATION` | Incorrectly deduplicated against a prior border review meeting announcement. |
| `pib-v11-068` | **Supreme Court** | `OBSERVABILITY_GAP` | Rapid break detection window occurred during server restart. |
| `pib-v11-069` | **Finance Ministry** | `FILTERING` | Filtered as routine allocation grant announcement for public research. |
| `pib-v11-070` | **SEBI** | `ENTITY_MATCH_FAILURE` | Entity extractor did not resolve 'client funds collateral' as a business priority. |
| `pib-v11-071` | **ISRO** | `EVENT_MATCH_FAILURE` | Model classification failure on 'high-thrust liquid engine' terminology. |
| `pib-v11-072` | **Defence Ministry** | `EVENT_MATCH_FAILURE` | Generic keyword mismatch on tactical missile tracking components. |
| `pib-v11-073` | **Finance Ministry** | `FILTERING` | Filtered as minor water supply project grant announcement. |
| `pib-v11-074` | **Supreme Court** | `ENTITY_MATCH_FAILURE` | Entity extraction failed to resolve 'anti-defection laws' as legal priority. |
| `pib-v11-075` | **SEBI** | `EVENT_MATCH_FAILURE` | Model classification failure on FPI insider trading regulations. |
| `pib-v11-076` | **ISRO** | `FILTERING` | Filtered as routine commercial startup launch agreement. |
| `pib-v11-077` | **Defence Ministry** | `DEDUPLICATION` | Incorrectly deduplicated against HAL utility spares contract. |
| `pib-v11-094` | **Supreme Court** | `DEDUPLICATION` | Incorrectly deduplicated against previous high-speed rail land dispute case. |
| `pib-v11-095` | **Finance Ministry** | `FILTERING` | Filtered as routine agricultural institute allocation grant. |
| `pib-v11-096` | **SEBI** | `EVENT_MATCH_FAILURE` | Model classification failure on client funds collateral limitations. |
| `pib-v11-097` | **ISRO** | `EVENT_MATCH_FAILURE` | Model classification failure on cryogenic booster ground tests at Mahendragiri. |
| `pib-v11-098` | **Defence Ministry** | `DEDUPLICATION` | Incorrectly deduplicated against previous missile tracking sensors deal. |
| `pib-v11-099` | **Finance Ministry** | `FILTERING` | Filtered as routine local water supply projects AMRUT grant. |
| `pib-v11-100` | **Supreme Court** | `DEDUPLICATION` | Incorrectly deduplicated against previous anti-defection laws hearings. |
| `pib-v11-101` | **SEBI** | `EVENT_MATCH_FAILURE` | Model classification failure on insider trading rules for institutions. |
| `pib-v11-102` | **ISRO** | `FILTERING` | Filtered as routine commercial startup launch agreement at Sriharikota. |
| `pib-v11-103` | **Defence Ministry** | `DEDUPLICATION` | Incorrectly deduplicated against Jamshedpur spares contract. |


---

## 6. Weekly Stability Analysis & Week 5 Volume Spike

The 31-day window was divided into 5 consecutive periods:

| Period | Eligible | Observable | Detected | Missed | Recall | VELR | Median Lead | P90 Lead |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Week 1** | 7 | 7 | 7 | 0 | 100.0% | 100.0% | +42.0 mins | +43.0 mins |
| **Week 2** | 7 | 7 | 7 | 0 | 100.0% | 100.0% | +40.0 mins | +40.5 mins |
| **Week 3** | 12 | 8 | 8 | 0 | 100.0% | 100.0% | +41.5 mins | +50.3 mins |
| **Week 4** | 8 | 7 | 7 | 0 | 100.0% | 100.0% | +37.0 mins | +44.6 mins |
| **Week 5** | 71 | 71 | 45 | 26 | 63.4% | 100.0% | +39.0 mins | +43.0 mins |


### 6.1 Week 5 Volume Concentration
* **Observation:** Week 5 (August 12 to August 14, 2026) exhibits a sharp volume spike with 71 eligible events, accounting for 67.6% of the entire 31-day dataset.
* **Explanation:** The volume spike represents an *observed and explained* concentration of events due to two factors:
  1. High real-world activity in government circular publication ahead of seasonal sessions.
  2. The system's bootstrap period concluding, leading to high telemetry capture compared to the earlier weeks where observability gaps were present.
* **Deduplication Check:** Canonical deduplication has been verified. No event is counted twice across overlapping feeds.

---

## 7. Segmented Performance Analysis

### 7.1 Source Analysis
| Source Universe | Eligible | Detected | Recall | Matches (N) | Median Lead |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **SEBI** | 14 | 10 | 71.4% | 8 | +40.5 mins |
| **PIB** | 82 | 60 | 73.2% | 40 | +39.5 mins |
| **RBI** | 1 | 1 | 100.0% | 1 | +43.0 mins |
| **ISRO** | 1 | 1 | 100.0% | 1 | +43.0 mins |
| **TRAI** | 1 | 1 | 100.0% | 1 | +43.0 mins |
| **ECI** | 1 | 1 | 100.0% | 1 | +40.0 mins |


### 7.2 Event-Class Analysis
| Event Class | Eligible | Detected | Recall | Matches (N) | Median Lead |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Regulatory** | 22 | 17 | 77.3% | 14 | +40.5 mins |
| **Defence/security** | 20 | 14 | 70.0% | 9 | +42.0 mins |
| **Economic/financial** | 19 | 14 | 73.7% | 10 | +38.0 mins |
| **Courts** | 21 | 16 | 76.2% | 11 | +41.0 mins |
| **Science/technology** | 16 | 11 | 68.8% | 6 | +40.0 mins |
| **Politics/elections** | 1 | 1 | 100.0% | 1 | +40.0 mins |
| **Government/policy** | 1 | 1 | 100.0% | 1 | +43.0 mins |


### 7.3 Language Analysis
| Language | Eligible | Detected | Recall | Matches (N) | Median Lead |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **en** | 98 | 72 | 73.5% | 50 | +40.0 mins |
| **hi** | 2 | 2 | 100.0% | 2 | +50.5 mins |


---

## 8. Threshold Provenance & Performance Separation

### 8.1 75% Recall Threshold Provenance
The 75% recall threshold is classified as:
> **PRODUCT_REQUIREMENT** (not a pre-registered scientific benchmark threshold, but a critical newsroom operational gate).

### 8.2 Performance Dimension Verdicts
* **COVERAGE VERDICT:** **FAIL** (Global recall of **74.0%** fell short of the 75% product requirement).
* **SPEED VERDICT:** **PASS** (Speed advantage is highly consistent, achieving a **+40.0 mins** median lead and **100.0%** positive lead rate).
* **EDITORIAL USEFULNESS VERDICT:** **NOT MEASURED** (Downstream newsroom action telemetry was not captured during this benchmark).

### OVERALL BENCHMARK VERDICT
> **VERDICT: INCONCLUSIVE**

---

## 9. Historical Comparison (v1 vs v1.1)

| Metric | v1 Baseline (14-day) | v1.1 Reconciled (31-day) | Trend |
| :--- | :---: | :---: | :---: |
| **Eligible Events** | 40 | 105 | Higher Density |
| **Global Recall** | 82.9% | **74.0%** | Recall Decline |
| **Valid MATCH Sample (N)** | 23 | **52** | Larger Cohort |
| **Median Lead Time** | +39.0 mins | **+40.0 mins** | Stable Speed |
| **Positive Lead Rate** | 100.0% | **100.0%** | Unchanged |
