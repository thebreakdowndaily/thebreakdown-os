# Architecture Test Strategy — Fix Domain

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Scope:** Automated Test Taxonomy, Conformance Verification, & Quality Gates  

---

## 1. Overview & Purpose

This document defines how the engineering implementation (Phases 13B.1 through 13B.5) will verify adherence to the Phase 13A architectural specification suite.

Testing in The Breakdown is a verification layer that enforces domain contracts, invariants, repository atomicity, graph topology, metadata generation, and state transitions.

---

## 2. Architecture Test Taxonomy

```
                       ┌───────────────────────────────────────┐
                       │      Architecture Test Suite          │
                       └───────────────────┬───────────────────┘
                                           │
  ┌─────────────────┬──────────────────────┼──────────────────────┬─────────────────┐
  ▼                 ▼                      ▼                      ▼                 ▼
┌──────────────┐ ┌──────────────┐   ┌──────────────┐       ┌──────────────┐  ┌──────────────┐
│ Domain Tests │ │ Repo Tests   │   │ Graph Tests  │       │ Workflow     │  │ Metadata     │
│ & Invariants │ │ & Mutate     │   │ & Invariants │       │ & Gates      │  │ & Search     │
└──────────────┘ └──────────────┘   └──────────────┘       └──────────────┘  └──────────────┘
```

---

## 3. Test Suite Specifications

### 3.1 Domain & Invariant Test Suite (`TEST-DOM`)

Verifies that the canonical model and invariants (`INV-FIX-001` through `INV-FIX-008`) hold across all memory states.

| Test ID | Test Target | Test Condition / Verification Method | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `TEST-DOM-01` | `INV-FIX-001` | Attempt to instantiate Fix without valid UUIDv4. | Throws `DomainValidationError`. |
| `TEST-DOM-02` | `INV-FIX-003` | Transition Fix to `published` with zero sources in `sourceIds`. | Fails validation; publication blocked. |
| `TEST-DOM-03` | `INV-FIX-004` | Attempt to attach a Claim owned by another editorial object. | Throws `ClaimOwnershipViolation`. |
| `TEST-DOM-04` | `INV-FIX-005` | Set `publicationStatus = superseded` without `supersededByFixId`. | Throws `MissingSupersessionPointer`. |
| `TEST-DOM-05` | Merge Operation | Execute `merge([FixA, FixB], targetDTO)`. | FixA and FixB superseded; target Fix created. |
| `TEST-DOM-06` | Split Operation | Execute `split(FixA, [targetDTO_1, targetDTO_2])`. | FixA archived with split note; 2 new Fixes created. |

---

### 3.2 Repository Contract Test Suite (`TEST-REP`)

Verifies atomic storage operations, non-deletion invariants, and state persistence.

| Test ID | Test Target | Test Condition / Verification Method | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `TEST-REP-01` | Transaction Rollback| Inject database error during multi-table Fix update transaction. | All state changes roll back 100%. |
| `TEST-REP-02` | Deletion Ban | Execute physical delete query against repository. | Repository rejects command; `DeleteOperationProhibited`. |
| `TEST-REP-03` | Supersede Cycle | Attempt to create supersession cycle (`FixA -> FixB -> FixA`). | Throws `CircularSupersessionError`. |
| `TEST-REP-04` | Audit Log Emission| Mutate any Fix property via repository. | Emits immutable audit log entry with diff payload. |

---

### 3.3 Knowledge Graph Test Suite (`TEST-GRPH`)

Verifies edge matrix rules, forbidden edges, and graph reachability.

| Test ID | Test Target | Test Condition / Verification Method | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `TEST-GRPH-01` | Forbidden Edge | Attempt to create `FIX - [addresses_problem] -> FIX`. | Graph Linter rejects edge creation. |
| `TEST-GRPH-02` | Reachability | Run graph crawler on published Fix nodes. | 100% of published Fixes reachable from a Story node. |
| `TEST-GRPH-03` | Attestation Path | Validate attestation path from Fix to Source. | Every Fix has unbroken path `FIX -> CLAIM -> SOURCE`. |
| `TEST-GRPH-04` | Orphan Action | Remove Entity node referenced by `requires_action_by` edge. | Orphan detection linter flags broken edge. |

---

### 3.4 Workflow & Gate Test Suite (`TEST-WFL`)

Verifies state machine transitions, Gold Standard Fix Audit checks, and publication gates.

| Test ID | Test Target | Test Condition / Verification Method | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `TEST-WFL-01` | State Bypass | Attempt to transition `Draft -> Published` directly. | State machine rejects illegal state jump. |
| `TEST-WFL-02` | Gold Standard Gate | Attempt `Approved -> Published` without Gold Standard audit sign-off. | Publication gate blocks transition. |
| `TEST-WFL-03` | Neutrality Linter | Submit text containing `"clearly"` or `"obviously"`. | Linter flags error; publication blocked. |

---

### 3.5 Metadata & Search Test Suite (`TEST-META`)

Verifies projection accuracy, search scoring, and schema validity.

| Test ID | Test Target | Test Condition / Verification Method | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `TEST-META-01` | Schema.org JSON-LD | Validate generated JSON-LD output against Schema.org linter. | Zero validation errors; 100% compliant `Legislation`. |
| `TEST-META-02` | Draft Index Exclusion| Search for text unique to a `draft` status Fix. | Search returns zero matches. |
| `TEST-META-03` | BM25 Weight Boost | Query term appearing in `title` vs `summary`. | `title` match scores higher than `summary` match. |

---

## 4. Phase 13B Implementation Milestones & Test Gate Requirements

Implementation proceeds incrementally across five sub-phases. Progression to the next sub-phase requires 100% test pass rates on prior milestone suites:

```
  Phase 13B.1: Core Domain       ──►  Must pass TEST-DOM & TEST-REP (Unit/Domain)
       │
       ▼
  Phase 13B.2: Validation        ──►  Must pass TEST-WFL (Validators & Gates)
       │
       ▼
  Phase 13B.3: Workflow Engine   ──►  Must pass TEST-WFL (State Machine & Audits)
       │
       ▼
  Phase 13B.4: Knowledge Infra   ──►  Must pass TEST-GRPH & TEST-META (Graph & Search)
       │
       ▼
  Phase 13B.5: System Integration──►  Must pass FULL SUITE (100% Conformance Gate)
```

1. **Phase 13B.1 — Core Domain**: Implement canonical model, `INV-FIX-001..008` checks, and `IFixRepository` contracts. (*Gate: TEST-DOM, TEST-REP*).
2. **Phase 13B.2 — Validation**: Implement validator suite (`VAL-ID`, `VAL-EVD`, `VAL-MCH`, `VAL-LC`) and publication gates. (*Gate: TEST-WFL validators*).
3. **Phase 13B.3 — Workflow**: Implement state machine engine, Gold Standard Audit hooks, and audit logging. (*Gate: TEST-WFL state machine*).
4. **Phase 13B.4 — Knowledge Infrastructure**: Implement relationship registry, JSON-LD metadata generator, and search indexer. (*Gate: TEST-GRPH, TEST-META*).
5. **Phase 13B.5 — System Integration**: Wire Story ↔ Fix projections, service dependencies, and registry hooks. (*Gate: 100% Full Suite Pass*).
