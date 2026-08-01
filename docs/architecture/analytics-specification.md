# Behavioral Analytics & Learning Metrics Specification — Fix Domain

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Governance Alignment:** *AGENTS.md Platform Beta Rules*, *Article XIII of Editorial Constitution*  

---

## 1. Executive Summary & Privacy Principles

The Breakdown rejects traditional ad-tech analytics, personal user profiling, session fingerprinting, and vanity engagement tracking (e.g., likes, shares, clickbait heatmaps).

All telemetry in the Fix Domain measures **Learning Journeys and Understanding Metrics**.

### Core Privacy Constraints
- **Zero Personal Profiling**: No IP addresses, user IDs, device fingerprints, or cross-site cookies stored.
- **Privacy-First Telemetry**: All events are aggregated anonymously at the Knowledge Object level.
- **Data Minimization**: Event payloads store only Knowledge Object IDs, interaction categories, and coarse timestamps.
- **Retention Limit**: Raw event logs expire after 90 days; aggregated performance counters persist permanently.

---

## 2. Event Taxonomy Matrix

Analytics events are routed strictly through `PluginAnalyticsService` and classified into six categories:

| Category | Event Name | Trigger Condition | Payload Data | Strategic Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Reading** | `FIX_LEVEL1_VIEWED` | Reader loads Fix page orientation header. | `fixId`, `slug`, `maturityStatus` | Measures baseline orientation views. |
| **Reading** | `FIX_LEVEL2_EXPANDED`| Reader expands Level 2 mechanics & trade-offs. | `fixId`, `timeToExpandMs` | Measures deep narrative engagement. |
| **Evidence** | `FIX_PRIMARY_SOURCE_OPENED`| Reader clicks Level 1-3 statutory citation. | `fixId`, `sourceId`, `sourceTier` | **Key Metric**: Verifies evidence exploration rate. |
| **Evidence** | `FIX_UNCERTAINTY_VIEWED`| Reader expands `unknownsAndGaps` or risk callout. | `fixId`, `uncertaintyType` | Measures reader engagement with policy caveats. |
| **Reference** | `FIX_PRECEDENT_COMPARED`| Reader compares global case studies in matrix. | `fixId`, `comparedCountryCodes` | Measures comparative learning depth. |
| **Reference** | `FIX_DATASET_DOWNLOADED`| Reader downloads verified data pack (CSV/JSON). | `fixId`, `format` | Measures research utility. |
| **Learning Journey**| `FIX_JOURNEY_COMPLETED`| Reader navigates: *Story → Fix → Source → Continue Learning*. | `fixId`, `storyId`, `journeyDurationSec` | **Canonical Metric**: Measures full understanding journey. |
| **Administrative** | `FIX_CORRECTION_SUBMITTED`| Reader submits evidentiary correction or peer note. | `fixId`, `claimId` | Measures community verification input. |

---

## 3. Canonical Understanding Metric Definitions

Understanding metrics measure learning outcomes rather than attention capture:

1. **Solution Completion Rate (\( CR_{\text{fix}} \))**:
   \[
   CR_{\text{fix}} = \frac{\text{Count}(\text{FIX\_LEVEL2\_EXPANDED})}{\text{Count}(\text{FIX\_LEVEL1\_VIEWED})} \times 100\%
   \]
2. **Primary Source Verification Ratio (\( VR_{\text{source}} \))**:
   \[
   VR_{\text{source}} = \frac{\text{Count}(\text{FIX\_PRIMARY\_SOURCE\_OPENED})}{\text{Count}(\text{FIX\_LEVEL1\_VIEWED})} \times 100\%
   \]
3. **Canonical Learning Journey Completion Rate (\( JCR \))**:
   \[
   JCR = \frac{\text{Count}(\text{FIX\_JOURNEY\_COMPLETED})}{\text{Count}(\text{FIX\_LEVEL1\_VIEWED})} \times 100\%
   \]

---

## 4. Analytical Prohibitions

The following tracking implementations are **PERMANENTLY BANNED**:

❌ Inferring user political ideology based on policy reading patterns.  
❌ Storing individual user reading speed or time-on-page to calculate "comprehension scores" for specific individuals.  
❌ Selling or transferring telemetry logs to third-party ad networks or data brokers.  
❌ Requiring user authentication or email sign-up to access Level 3 primary evidence.  
