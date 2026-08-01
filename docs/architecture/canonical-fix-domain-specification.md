# Canonical Fix Domain Specification

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Domain:** Knowledge Architecture / Content Domain  
**Governing Documents:** *Editorial Constitution v1.1*, *AGENTS.md*, *docs/research/the-fix-hub-research.md*  

---

## 1. Executive Summary & Purpose

This specification defines the canonical schema, identity rules, structural fields, invariants, projections, and domain rules for **The Fix** as a primary Knowledge Object within The Breakdown Knowledge Platform.

As established in *AGENTS.md*, everything on The Breakdown is a Knowledge Object. Pages are temporary projections of knowledge; canonical editorial objects are the single source of truth. Every downstream system—Repository Layer, Services, Search, Knowledge Graph, Metadata, Analytics, and Reader Surfaces—must consume or project directly from this specification without creating parallel representations.

---

## 2. Canonical Domain Invariants

Domain invariants are fundamental rules that must evaluate to `TRUE` across all states of the platform. A violation of any invariant constitutes a database/domain integrity corruption.

| Invariant ID | Description | Enforced By | Severity |
| :--- | :--- | :--- | :--- |
| `INV-FIX-001` | **Single Canonical Identifier**: Every Fix has exactly one immutable, globally unique UUIDv4 `id`. | Core Repository | **BLOCKER** |
| `INV-FIX-002` | **Single Canonical Slug**: Every Fix has exactly one unique human-readable `slug` following the `/fix/[slug]` routing contract. | Repository / Routing | **BLOCKER** |
| `INV-FIX-003` | **Mandatory Source Attestation**: A published Fix (`status: published`) must reference at least one canonical `Source` (Level 1, 2, or 3). | Validation Bureau | **BLOCKER** |
| `INV-FIX-004` | **Single Parent Claim Ownership**: Every factual claim extracted within a Fix belongs to exactly one parent Claim object in the Claim Registry. | Graph Engine | **BLOCKER** |
| `INV-FIX-005` | **Supersession Pointer Integrity**: A superseded Fix (`status: superseded`) must contain a valid `supersededByFixId` referencing its active replacement. | Repository Service | **BLOCKER** |
| `INV-FIX-006` | **Lifecycle Status Guard**: No published Fix may exist without an assigned `editorialStatus` and `publicationStatus`. | State Machine | **BLOCKER** |
| `INV-FIX-007` | **Actor Responsibility Mapping**: Every recommended action inside a Fix must reference at least one valid `Entity` representing a responsible public/private actor. | Entity Registry | **BLOCKER** |
| `INV-FIX-008` | **Neutrality Language Guard**: A published Fix must pass automated linters confirming zero prohibited certainty words ("obviously", "clearly", "undoubtedly"). | Editorial Linter | **BLOCKER** |

---

## 3. Canonical Fix Schema Specification

The canonical model represents the internal, authoritative shape used by editors, services, and repository layers.

### 3.1 Field Specification & Traceability Matrix

| Field Name | Type | Requirement | Origin / Traceability | Rationale & Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string (UUIDv4)` | **Mandatory** | Core Arch / AGENTS.md | Immutable primary key across database and Knowledge Graph. |
| `slug` | `string (Kebab)` | **Mandatory** | RXS / Search Spec | Unique URL path segment (e.g., `digital-procurement-audit-trail`). |
| `title` | `string` | **Mandatory** | Research Sec 4.1 | Concise, active title of the intervention (e.g., *Mandatory E-Procurement Auditing*). |
| `summary` | `string` | **Mandatory** | Editorial Const Art VII | 2–3 sentence executive summary explaining intervention mechanics. |
| `primaryCategory` | `InterventionType` | **Mandatory** | Research Sec 1.3 | Statutory, Administrative, Institutional, Fiscal, Tech, Behavioral, Judicial. |
| `secondaryCategories`| `InterventionType[]`| Optional (Max 2)| Research Sec 1.3 | Secondary categories where multi-system leverage exists. |
| `editorialStatus` | `EditorialStatus` | **Mandatory** | Editorial Const Art XIV| Draft, Research, Editorial Review, Fact Check, Expert Review, Approved. |
| `publicationStatus` | `PublicationStatus`| **Mandatory** | AGENTS.md / Types | Draft, Review, Scheduled, Published, Archived, Superseded. |
| `maturityStatus` | `PolicyMaturity` | **Mandatory** | Research Sec 5.1 | Idea, Proposed, Expert Reviewed, Pilot, Implemented, Measured, Updated, Archived. |
| `problemStatement` | `RichText` | **Mandatory** | Research Sec 4.1 | Problem description linked to canonical Story/Claim IDs. |
| `rootCauses` | `FixSection[]` | **Mandatory** | Research Sec 4.1 | Structural diagnosis explaining system failure mechanisms. |
| `recommendedActions` | `FixAction[]` | **Mandatory** | Research Sec 4.1 | Explicit operational reform steps. |
| `responsibleActorIds`| `string[] (EntityIDs)`| **Mandatory** | Research Sec 2.1 | Array of Entity IDs holding legal/exec authority. |
| `beneficiaryGroups` | `TaxonomyTerm[]` | **Mandatory** | Research Sec 8 | Groups benefiting from the intervention. |
| `disadvantagedGroups`| `TaxonomyTerm[]` | **Mandatory** | Research Sec 8 | **Distributional Impact**: Groups bearing costs or disruption. |
| `fiscalCost` | `CostEstimate` | **Mandatory** | Research Sec 8 | Capital/OpEx estimate, currency, and funding mechanism. |
| `timeToImpact` | `TimeHorizon` | **Mandatory** | Research Sec 8 | Immediate (<1yr), Short (1-3yrs), Medium (3-5yrs), Long (5+yrs). |
| `globalPrecedents` | `GlobalExample[]` | Optional | Research Sec 7 | Comparative implementations in other jurisdictions. |
| `tradeOffs` | `TradeOffItem[]` | **Mandatory** | Research Sec 4.1 | Explicit compromise analysis (e.g., Transparency vs Speed). |
| `risksAndFailures` | `RiskItem[]` | **Mandatory** | Research Sec 6.2 | Potential unintended negative consequences and failure modes. |
| `constitutionalBasis`| `LegalBasis` | Optional | Research Sec 8 | Enabling statutory clauses, constitutional articles, or gazettes. |
| `evidenceGrade` | `EvidenceGrade` | **Mandatory** | Editorial Const Art III| GRADE-CERQual: High, Moderate, Low/Experimental, Contested. |
| `unknownsAndGaps` | `UncertaintyNote[]` | **Mandatory** | Research Sec 6.2 | Explicit callouts of missing data or unmeasured variables. |
| `successMetrics` | `FixMetric[]` | **Mandatory** | Research Sec 14 | Replicable indicators measuring policy impact over time. |
| `sourceIds` | `string[] (SourceIDs)`| **Mandatory** | Editorial Const Art III| Level 1–3 source citations from Source Registry. |
| `supersededByFixId` | `string (FixID)` | Conditional | Research Sec 11.2 | Mandatory if `publicationStatus == superseded`. |
| `lastVerified` | `ISO-8601 Date` | **Mandatory** | Trust Gap Matrix P0 | Date of last audit by Verification Bureau. |
| `version` | `string (SemVer)` | **Mandatory** | Versioning Strategy | Object model version string (e.g., `1.2.0`). |

---

### 3.2 Field Rejection Log (Explicit Non-Fields)

The following fields were evaluated and explicitly rejected to maintain canonical purity:

| Rejected Field | Reason for Rejection | Superior Alternative |
| :--- | :--- | :--- |
| `truthScore` / `starRating` | Subjective, pseudo-scientific, violates *Editorial Constitution Art I*. | `evidenceGrade` (GRADE-CERQual framework with qualitative citations). |
| `renderedHtmlContent` | Formatted presentation leaks into canonical data layer. | Markdown / Structured `RichText` AST rendered on demand by UI engines. |
| `likeCount` / `shareCount` | Vanity engagement metric, violates *Platform Beta Rules*. | `LearningJourney` analytics (Primary sources opened, completion rate). |
| `authorOpinion` | Unverified commentary, violates neutrality standard. | Layered `editorialAnalysis` explicitly attributed to named editor/bureau. |

---

## 4. Model Projections: Internal vs. Public Views

To protect internal editorial workflows and security metadata from exposing internal state, the canonical model is projected into two distinct shapes:

```
                          ┌───────────────────────────┐
                          │   Canonical Fix Model     │
                          │ (Internal Source of Truth)│
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│        Internal Editorial View       │  │        Public Reader API View        │
│ • Full Edit History & Change Logs    │  │ • Level 1 Orientation Summary        │
│ • Verification Bureau Audit Notes    │  │ • Level 2 Structured Mechanics       │
│ • Fact-Checker Assignments & Roles   │  │ • Level 3 Evidence Ledger & Citations│
│ • Source Confidence Scores           │  │ • Public Freshness Badge             │
│ • Draft / Unreviewed Notes           │  │ • Stripped Internal Editorial Notes  │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## 5. Explicit Domain Extension Points

The Fix model defines five explicit extension points for future capabilities without requiring schema breaking changes:

1. **`extensions.multilingual`**: Dictionary mapping ISO 639-1 language codes to translated title, summary, and action fields.
2. **`extensions.jurisdiction`**: ISO 3166-1 (Country) and ISO 3166-2 (Subnational) codes for localized governance filtering.
3. **`extensions.externalIds`**: Mapping of canonical Fix to external registries (e.g., Wikidata ID, India Code Act ID, OpenAlex Topic ID).
4. **`extensions.liveMetrics`**: Automated endpoint configurations for real-time statistical API ingestion.
5. **`extensions.sdgMapping`**: Array of UN Sustainable Development Goal numbers (1–17) and targets.
