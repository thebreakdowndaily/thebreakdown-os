# Architecture Governance, Conformance & Dependency Map — Fix Domain

**Version:** 1.1.0  
**Status:** Architectural Specification (Locked — Release AR-13A.0)  
**Date:** July 2026  
**Scope:** Stability Levels, Dependency Topology, Conformance Criteria, Gate Reviews & Governance  

---

## 1. Overview & Purpose

This document defines the architectural governance, contract stability levels, system dependency topology, engineering conformance criteria, and Architecture Gate Review checklists for the Canonical Fix Domain.

It ensures that as implementation proceeds across Phase 13B (Editorial Infrastructure) and Phase 13C (Reader Surfaces), all code strictly adheres to the architectural contracts established in Baseline Release AR-13A.0.

---

## 2. Architectural Dependency Map (Flow of Authority)

The hierarchy of authority flows strictly downwards. Lower layers MUST depend on and derive from higher layers. Lower layers MUST NEVER dictate, mutate, or override upper-layer rules.

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: EDITORIAL CONSTITUTION v1.1 (Supreme Governance)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 2: OPERATING DOCTRINE (AGENTS.md & First-Principles Research)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 3: CANONICAL DOMAIN MODEL (types/canonical.ts & Invariants)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 4: REPOSITORY & VALIDATION LAYER (IFixRepository & Validators)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 5: SERVICE & WORKFLOW ENGINES (State Machine, Graph, Search)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 6: METADATA & ANALYTICS PROJECTIONS (JSON-LD, PluginAnalytics)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 7: READER SURFACES & UI (Projections, /fix, Cards, Dashboards)   │
└───────────────────────────────────┬────────────────────────────────────┘
```

---

## 3. Specification Stability Levels

To clarify compatibility expectations for downstream consumers, every contract and specification document is assigned an explicit **Stability Level**:

| Specification Document | Stability Level | Compatibility Guarantee |
| :--- | :--- | :--- |
| `canonical-fix-domain-specification.md` | **STABLE** | Breaking changes require a MAJOR SemVer release, RFC review, and Editor-in-Chief approval. |
| `object-boundaries.md` | **STABLE** | Ownership rules are immutable. Zero responsibility overlap permitted. |
| `domain-invariants.md` (`INV-FIX-001` to `008`) | **STABLE** | Invariants cannot be relaxed or removed. |
| `repository-contracts.md` | **STABLE** | Interface signatures require N-1 window for breaking changes. |
| `validation-specification.md` | **EVOLVING** | Additive validation rules permitted in MINOR releases; existing ERROR blockers remain stable. |
| `editorial-workflow-specification.md` | **EVOLVING** | State machine states are stable; transition checks may introduce additive steps. |
| `relationship-taxonomy.md` | **EVOLVING** | Core edge types stable; new edge semantics may be added without breaking existing queries. |
| `metadata-specification.md` | **STABLE** | Schema.org JSON-LD and OpenGraph formats are locked for search engine consistency. |
| `search-specification.md` | **EVOLVING** | BM25 weights and boost multipliers may be tuned based on search analytics. |
| `analytics-specification.md` | **STABLE** | Privacy-first constraints and learning event categories are locked. |
| `versioning-strategy.md` | **STABLE** | Migration windows and SemVer rules are locked. |

---

## 4. Architecture Compliance Gate Review Checklist

Before signing off on any Architecture Gate (Gate A, B, C, D, or Release Candidate), the engineering team must review and check off all seven questions in the **Architecture Compliance Gate Checklist**:

```
[ ARCHITECTURE COMPLIANCE GATE REVIEW CHECKLIST ]
-------------------------------------------------------------------------
[ ] 1. ZERO PARALLEL MODELS: Does the implementation introduce a second source
       of truth or duplicate data model anywhere in services or routes?
[ ] 2. INVARIANT INTEGRITY: Are all domain invariants (INV-FIX-001..008)
       programmatically checked and enforced without bypasses?
[ ] 3. CONTRACT STRENGTH: Has any IFixRepository contract signature or invariant
       been weakened or altered?
[ ] 4. OBJECT BOUNDARY PURITY: Are object ownership boundaries preserved cleanly
       without embedding foreign entity/story blocks inside Fix objects?
[ ] 5. GRAPH TOPOLOGY: Are Knowledge Graph reachability and attestation invariants
       maintained with zero forbidden edges created?
[ ] 6. CANONICAL METADATA: Is metadata generated exclusively by projecting from
       canonical objects without hardcoded presentation templates?
[ ] 7. RFC COMPLIANCE: Has any Stable or Locked specification effectively changed
       without an approved Architecture RFC?
-------------------------------------------------------------------------
```

- If any question receives a **NO**, the Architecture Gate is **BLOCKED**.

---

## 5. Architecture Governance & Change Management Workflow

To preserve architecture integrity over decades, any proposed modification to Baseline Release AR-13A.0 specifications must follow the **Architectural Change Protocol**:

```
 1. Issue Architecture RFC  ──►  2. Impact & Invariant Audit  ──►  3. ADR Entry  ──►  4. Editor-in-Chief Ratification
```

1. **Request for Comments (RFC)**: Author drafts an RFC in `docs/rfc/` detailing proposed schema or contract changes.
2. **Impact & Invariant Audit**: Verification Bureau conducts an audit to confirm zero invariant violations or breaking contract shifts.
3. **ADR Record**: Approved changes are logged in `docs/architecture/fix-domain-decision-log.md` with rationale and trade-off analysis.
4. **SemVer Advancement**: Version updated in `versioning-strategy.md` according to SemVer rules (Patch, Minor, or Major).
