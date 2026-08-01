# Object Boundaries & Domain Responsibility Matrix

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Governing Principle:** *Single Responsibility per Knowledge Object — Zero Overlapping Ownership.*

---

## 1. Boundary Philosophy

In The Breakdown Knowledge Platform, every piece of information exists once in canonical form. Architectural degradation occurs when components or models begin duplicating domain responsibilities (e.g., a Story storing its own source citation copy instead of referencing the Source Registry, or a Fix authoring its own raw entity bios).

This specification establishes the **Definitive Domain Responsibility Matrix**. No object may own, store, or mutate data outside its explicit ownership boundaries.

---

## 2. Definitive Object Ownership Matrix

| Object Name | Domain Responsibility (OWNS) | Prohibited Overlaps (DOES NOT OWN) | External Reference Edge |
| :--- | :--- | :--- | :--- |
| **Story** | Investigative narrative structure, chapter sequence, hero media, editorial takeaways, reader orientation blocks. | Raw factual claims (owned by `Claim`), entity profiles (owned by `Entity`), solution mechanics (owned by `Fix`). | `references_claim`, `addresses_problem`, `mentions_entity` |
| **Fix** | Intervention mechanics, reform typology, implementation steps, trade-off matrix, failure modes, cost/funding estimates, policy maturity lifecycle. | General news narrative (owned by `Story`), raw legal statutes (owned by `Law`), primary document files (owned by `Source`). | `addresses_problem`, `supported_by`, `requires_action_by` |
| **Claim** | Atomic factual assertions, confidence scores, verification status, evidence tier rating, atomic verification timestamp. | Full story narratives (owned by `Story`), intervention proposals (owned by `Fix`), author profiles (owned by `Entity`). | `extracted_from`, `supports_fix`, `verified_by` |
| **Dataset** | Replicable statistical tables, time-series data points, schema definitions, update frequencies, data provider attestation. | Editorial analysis of data (owned by `Story`/`Fix`), raw source PDF files (owned by `Source`). | `provides_metrics_for`, `sourced_from` |
| **Entity** | Canonical bio, official name, aliases, entity type (Person/Org/Ministry), official identifiers (Wikidata, ROR). | Stories mentioning entity (owned by Knowledge Graph), policies passed by entity (owned by `Policy`/`Law`). | `authored_by`, `responsible_for` |
| **Timeline** | Chronological ordering of verified milestone events, date timestamps, event titles. | Full analytical articles (owned by `Story`), policy mechanics (owned by `Fix`). | `chronicles_event`, `milestone_for` |
| **Policy** | Non-statutory government schemes, administrative programs, executive guidelines, operational frameworks. | Statutory legislative acts (owned by `Law`), proposed solutions (owned by `Fix`). | `implemented_by`, `enacted_under` |
| **Law** | Enacted legislative statutes, constitutional articles, gazette notifications, legal clause hierarchy. | Analysis of statutory failure (owned by `Story`), proposed amendments (owned by `Fix`). | `codified_in`, `amended_by` |
| **Source** | Primary document metadata, bibliographic citation, DOI, archival URI, pub date, publisher authority score. | Claims extracted from document (owned by `Claim`), policy proposals (owned by `Fix`). | `cites_source`, `attests_claim` |
| **Methodology**| Institutional research protocols, evidence grading rules, auditing workflows, linter specifications. | Individual story content (owned by `Story`), specific fix evaluations (owned by `Fix`). | `governed_by` |

---

## 3. Boundary Violation Prevention Rules

To prevent architectural drift during development, the system enforces three strict boundary rules:

1. **Rule of Single Canonical Storage**: If a string, date, or dataset represents a canonical entity (e.g., a Ministry's official title), it MUST be stored in the `Entity` object and referenced by ID. Stories and Fixes MUST NOT duplicate raw entity metadata fields.
2. **Rule of Derived Presentation**: A UI component rendering a Fix alongside its supporting Story narrative MUST fetch both canonical objects and join them via the Knowledge Graph. It MUST NOT embed story paragraphs inside the Fix JSON object.
3. **Rule of Verification Delegation**: A Fix object stores `evidenceGrade` (an aggregate status indicator), but MUST delegate individual claim verifications to the `Claim` registry and source citations to the `Source` registry.
