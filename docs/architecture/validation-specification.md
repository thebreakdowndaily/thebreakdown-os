# Validation Specification — Fix Domain

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Execution Context:** CI Pipelines, Editorial Mission Control, Pre-Publication Quality Gates  

---

## 1. Overview & Validation Architecture

Validation in The Breakdown is a first-class subsystem. Validators run statically during linting, dynamically during editorial workflow transitions, in automated CI test pipelines, and before publication clearance.

### Severity Tiers
- **ERROR (Blocker)**: Halts publication transition; prevents saving if critical invariant violated.
- **WARNING (Caution)**: Highlights editorial gaps; requires explicit editorial override to publish.
- **INFO (Guidance)**: Provides suggestions for density, readability, or cross-linking improvements.

---

## 2. Validator Suite Specification

### 2.1 Identity & Schema Validators (`VAL-ID`)

| Rule ID | Rule Name | Condition / Logic | Severity | Blocker? |
| :--- | :--- | :--- | :--- | :--- |
| `VAL-ID-01` | UUID Format | `id` must be valid RFC 4122 UUIDv4 string. | **ERROR** | **YES** |
| `VAL-ID-02` | Kebab Slug | `slug` match `/^[a-z0-9]+(-[a-z0-9]+)*$/`. | **ERROR** | **YES** |
| `VAL-ID-03` | Unique Slug | `slug` must not collide with existing Fix/Story slugs. | **ERROR** | **YES** |
| `VAL-ID-04` | Category Valid | `primaryCategory` must belong to `InterventionType` enum. | **ERROR** | **YES** |

### 2.2 Evidence & Neutrality Validators (`VAL-EVD`)

| Rule ID | Rule Name | Condition / Logic | Severity | Blocker? |
| :--- | :--- | :--- | :--- | :--- |
| `VAL-EVD-01` | Min Source Count | Published Fix must reference `sourceIds.length >= 1`. | **ERROR** | **YES** |
| `VAL-EVD-02` | High Confidence Primary | `evidenceGrade == 'High'` requires at least 1 Level 1 (Statutory) source citation. | **ERROR** | **YES** |
| `VAL-EVD-03` | Neutral Language | Scans text for prohibited certainty words (`clearly`, `obviously`, `visionary`, `disastrous`). | **ERROR** | **YES** |
| `VAL-EVD-04` | Uncertainty Callouts | `unknownsAndGaps.length >= 1` must be populated. | **WARNING**| **NO** |

### 2.3 Structural Mechanics Validators (`VAL-MCH`)

| Rule ID | Rule Name | Condition / Logic | Severity | Blocker? |
| :--- | :--- | :--- | :--- | :--- |
| `VAL-MCH-01` | Responsible Actor | `responsibleActorIds.length >= 1` and all IDs resolve to active `Entity` records. | **ERROR** | **YES** |
| `VAL-MCH-02` | Distributional Impact | `disadvantagedGroups.length >= 1` must be specified to prevent ignoring policy losers. | **ERROR** | **YES** |
| `VAL-MCH-03` | Cost Estimate | `fiscalCost` must specify currency, amount/range, and funding source. | **ERROR** | **YES** |
| `VAL-MCH-04` | Metric Indicator | `successMetrics.length >= 1` with target value and data source attestation. | **ERROR** | **YES** |

### 2.4 Lifecycle & Governance Validators (`VAL-LC`)

| Rule ID | Rule Name | Condition / Logic | Severity | Blocker? |
| :--- | :--- | :--- | :--- | :--- |
| `VAL-LC-01` | Gold Standard Audit | `publicationStatus == 'published'` requires completed Gold Standard Audit record. | **ERROR** | **YES** |
| `VAL-LC-02` | Superseded Pointer | `publicationStatus == 'superseded'` requires valid `supersededByFixId`. | **ERROR** | **YES** |
| `VAL-LC-03` | Freshness Expiry | `lastVerified` date must be within 180 days for `High` evidence grade. | **WARNING**| **NO** |

---

## 3. Publication Blocking Criteria

A Fix Knowledge Object **CANNOT** transition to `publicationStatus == 'published'` if a single **ERROR** severity validator fails.

```
                  ┌─────────────────────────────────────┐
                  │ Target: publicationStatus = PUBLISHED│
                  └──────────────────┬──────────────────┘
                                     │
                        Execute Validator Suite
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
 💥 Any ERROR Severity Failed?                          ✅ All ERROR Severity Passed?
 ❌ Transition BLOCKED                                  🟢 Transition PERMITTED
 • Emit Validation Failure Log                          • Emit Audit Event
 • Highlight failing fields in UI                       • Publish to Reader Surfaces
```
