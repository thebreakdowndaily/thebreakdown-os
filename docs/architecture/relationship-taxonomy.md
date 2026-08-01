# Relationship Taxonomy & Knowledge Graph Specification — Fix Domain

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Scope:** Knowledge Graph Ontology & Edge Semantics  

---

## 1. Executive Summary

This specification defines the formal graph relationships, edge semantics, required edges, allowed edges, forbidden edges, and graph invariants connecting **The Fix** to all canonical Knowledge Objects in The Breakdown Knowledge Graph.

The Knowledge Graph is a single, unified graph. Fix nodes participate as first-class entity nodes.

---

## 2. Node Typology in the Fix Graph

The Fix Graph integrates twelve canonical node types:
1. `FIX` (Canonical Fix Object)
2. `STORY` (Investigative Story)
3. `INVESTIGATION` (Multi-chapter Investigation)
4. `CLAIM` (Verified Claim)
5. `SOURCE` (Primary/Secondary Citation)
6. `ENTITY` (Person / Organization / Ministry)
7. `DATASET` (Statistical Time-Series)
8. `POLICY` (Government Scheme / Executive Order)
9. `LAW` (Statute / Constitutional Article)
10. `TIMELINE_EVENT` (Chronological Milestone)
11. `COUNTRY` (Geographic Jurisdiction)
12. `CONCEPT` (Taxonomy / Topic Node)

---

## 3. Edge Matrix Specification

```
                               ┌───────────────────┐
                               │   Canonical FIX   │
                               └─────────┬─────────┘
                                         │
        ┌───────────────────┬────────────┴────────────┬───────────────────┐
        │ addresses_problem │ supported_by            │ requires_action   │
        ▼                   ▼                         ▼                   ▼
┌───────────────┐   ┌───────────────┐         ┌───────────────┐   ┌───────────────┐
│ STORY / INVEST│   │ CLAIM / SOURCE│         │ ENTITY (Ministry)││ LAW / POLICY  │
└───────────────┘   └───────────────┘         └───────────────┘   └───────────────┘
```

### 3.1 Edge Definitions

| Source Node | Target Node | Edge Relationship Type | Multiplicity | Edge Direction | Required / Optional | Semantics |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `FIX` | `STORY` | `addresses_problem` | 1:N | Outgoing | **Required** (Min 1) | Fix addresses systemic problem reported in Story. |
| `FIX` | `INVESTIGATION`| `addresses_investigation`| 1:N | Outgoing | Optional | Fix provides remedies for multi-chapter Investigation. |
| `FIX` | `CLAIM` | `supported_by_claim` | N:M | Outgoing | **Required** (Min 1) | Fact claim backing effectiveness or problem scope. |
| `FIX` | `SOURCE` | `cites_source` | N:M | Outgoing | **Required** (Min 1) | Direct Level 1-3 primary citation attestation. |
| `FIX` | `ENTITY` | `requires_action_by` | N:M | Outgoing | **Required** (Min 1) | Entity with legal authority to execute reform. |
| `FIX` | `LAW` | `amends_law` | N:M | Outgoing | Optional | Statutory act or constitutional clause targeted. |
| `FIX` | `POLICY` | `replaces_policy` | N:M | Outgoing | Optional | Existing non-statutory scheme superseded by Fix. |
| `FIX` | `DATASET` | `evaluated_by_metric`| N:M | Outgoing | **Required** (Min 1) | Dataset tracking policy outcomes over time. |
| `FIX` | `COUNTRY` | `applicable_to` | N:M | Outgoing | **Required** (Min 1) | Geographic jurisdiction for policy scope. |
| `FIX` | `FIX` | `superseded_by` | 1:1 | Outgoing | Conditional | Present if `publicationStatus == superseded`. |
| `FIX` | `FIX` | `alternative_to` | N:M | Undirected | Optional | Peer Fix addressing same problem via alternative mechanism. |

---

## 4. Forbidden Edges (Negative Constraints)

To prevent bad graph topology and circular reasoning, the following edge configurations are **STRICTLY FORBIDDEN**:

| Forbidden Edge Configuration | Rationale for Prohibition | Enforcement |
| :--- | :--- | :--- |
| `FIX - [addresses_problem] -> FIX` | A Fix addresses a problem in a Story, not another Fix. Use `superseded_by` or `alternative_to`. | Graph Linter |
| `FIX - [cites_source] -> STORY` | Stories are narratives, not Level 1-3 primary sources. Citations must point to `SOURCE` objects. | Schema Guard |
| `FIX - [authored_by] -> FIX` | A Fix cannot author another Fix. Authorship belongs to `ENTITY` (Person). | Type Checker |
| `FIX_A - [superseded_by] -> FIX_B - [superseded_by] -> FIX_A` | **Circular Supersession**: Creates infinite loop in resolution algorithms. | Graph Engine |

---

## 5. Graph Invariants

1. **Reachability Invariant**: Every published `FIX` node MUST be reachable from at least one `STORY` or `CONCEPT` node via an `addresses_problem` or `belongs_to` edge.
2. **Attestation Invariant**: Every `FIX` node MUST have an unbroken path `FIX -> CLAIM -> SOURCE` or `FIX -> SOURCE` terminating at a Level 1, 2, or 3 Source node.
3. **No Orphan Actions**: Every `FixAction` child block inside a `FIX` node MUST maintain an active `requires_action_by` edge pointing to a valid `ENTITY` node.
