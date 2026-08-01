# Search & Indexing Specification — Fix Domain

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Scope:** Search Indexing, Ranking Algorithms, & Faceted Search Architecture  

---

## 1. Overview

This specification defines how Fix Knowledge Objects are indexed, scored, ranked, and filtered across The Breakdown's search engine (`MemorySearchService` / Supabase Search).

Search is a zero-hallucination, evidence-weighted lookup engine. It never invents query results; it retrieves canonical objects matched against structured metadata fields.

---

## 2. Searchable Field Weights & Indexing Matrix

Search query terms are evaluated against canonical fields using weighted field scoring:

| Canonical Field | Search Weight | Boost Factor | Tokenization Strategy |
| :--- | :--- | :--- | :--- |
| `title` | **10.0** (Highest) | `x 2.5` | Standard stemming + N-gram phrase matching |
| `slug` | **8.0** | `x 2.0` | Exact match |
| `summary` | **6.0** | `x 1.5` | Standard stemming + synonym expansion |
| `problemStatement` | **5.0** | `x 1.2` | Full-text stemming |
| `rootCauses.content` | **4.0** | `x 1.0` | Full-text stemming |
| `recommendedActions.title`| **4.0** | `x 1.0` | Full-text stemming |
| `tags` | **3.0** | `x 1.0` | Exact keyword matching |
| `responsibleActorNames` | **3.0** | `x 1.0` | Entity name expansion |

---

## 3. Faceted Search Filter Architecture

Readers can filter solutions across seven orthogonal facets:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. INTERVENTION TYPE  : [ Statutory | Administrative | Fiscal | Tech ] │
│ 2. POLICY MATURITY    : [ Proposed | Pilot | Implemented | Measured ]  │
│ 3. EVIDENCE GRADE     : [ High | Moderate | Experimental | Contested ] │
│ 4. JURISDICTION       : [ Union / Central | State | Municipal | Global]│
│ 5. FISCAL COST        : [ Budget-Neutral | Low Cost | High CapEx ]    │
│ 6. TIME TO IMPACT     : [ Immediate (<1yr) | Medium (1-3yr) | Long ]   │
│ 7. UN SDG TARGET      : [ SDG 1 - SDG 17 ]                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Search Ranking Algorithm & Scoring Formula

The total relevance score \( S(F, Q) \) of a Fix \( F \) for query \( Q \) is computed as:

\[
S(F, Q) = \left( \sum_{i} W_i \cdot \text{BM25}(f_i, Q) \right) \cdot E(F) \cdot M(F) \cdot F_{\text{fresh}}(F)
\]

Where:
- \( \text{BM25}(f_i, Q) \): Standard text similarity score for field \( f_i \).
- \( W_i \): Field weight from Section 2.
- \( E(F) \): **Evidence Grade Multiplier**:
  - `High` = `1.3`
  - `Moderate` = `1.1`
  - `Experimental` = `1.0`
  - `Contested` = `0.9`
- \( M(F) \): **Maturity Multiplier**:
  - `Measured / Evaluated` = `1.2`
  - `Implemented` = `1.1`
  - `Pilot / Proposed` = `1.0`
  - `Archived / Obsolete` = `0.3` (Heavy penalty)
- \( F_{\text{fresh}}(F) \): **Freshness Factor**: Decay multiplier based on `lastVerified` timestamp.

---

## 5. Search Index Invariants

1. **Draft Exclusion**: Fix objects with `publicationStatus != 'published'` MUST NOT appear in public search results.
2. **Superseded Demotion**: Superseded Fixes (`publicationStatus == 'superseded'`) receive a `0.1x` penalty and display a warning tag pointing to the active Fix.
3. **Zero Partial Match Disruption**: A query matching an exact Entity ID (e.g., `Ministry of Finance`) MUST return all Fixes where `responsibleActorIds` includes that Entity ID.
