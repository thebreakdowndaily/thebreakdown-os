# The Fix Hub Research
## Theoretical, Editorial, and Architectural Foundations for Evidence-First Solutions Journalism

**Version:** 1.0 — Master Research Specification  
**Status:** Published (Research Standard)  
**Date:** July 2026  
**Scope:** Strategy, Knowledge Architecture, Editorial Governance, Information Design, and User Experience  
**Governance Alignment:** Level 1 (*Editorial Constitution v1.1*), Level 2 (*AGENTS.md*), Level 3 (*RXS / VXS*)  

---

## Executive Summary

"The Fix" is not a page, a navigation category, or a collection of opinion pieces. It is the **solutions engine** of The Breakdown Knowledge Platform.

The central thesis of this research is that traditional journalism fails at solutions because it treats remedies as ephemeral commentary rather than **structured, verifiable Knowledge Objects**. When news outlets present solutions, they frequently lapse into advocacy, uncritical promotion of single interventions ("silver bullets"), or partisan policy debates unsupported by empirical evidence.

The Breakdown resolves this failure through a fundamental institutional motto:
> **Understand Problems. Understand Evidence. Understand Solutions.**

This paper establishes the definitive research foundation for "The Fix" Hub. It synthesizes findings across five distinct domains—Investigative Journalism, Public Policy Think Tanks, Knowledge Platforms, Civic Technology, and Parliamentary Repositories—to define how evidence-first solutions must be conceptualized, classified, verified, presented, and maintained over time.

---

## 1. What is a "Fix"? — Taxonomy & Boundary Definitions

### 1.1 First-Principles Definition

A **Fix** is a canonical Knowledge Object representing a structured, evidence-backed intervention designed to resolve or mitigate a systemic public problem.

A Fix is **not**:
- An editorial opinion or endorsement.
- A single news report about a reform.
- A unverified campaign promise or political slogan.
- A raw legislative draft without empirical analysis.

### 1.2 Boundary Definitions: When Does a Proposal Become a Canonical Fix?

To preserve trust and prevent the platform from becoming a repository for unvetted ideas, we establish precise conceptual boundaries distinguishing five distinct stages of policy discourse:

| Entity Type | Definition | Inclusion in Fix Hub? | Canonical Status |
| :--- | :--- | :--- | :--- |
| **Policy Option / Idea** | A speculative solution proposed by commentators, politicians, or activists without empirical modeling or primary source backing. | ❌ Excluded | Raw input; referenced only as contextual background in problem narratives. |
| **Policy Proposal** | A structured reform authored by a recognized institutional body, parliamentary committee, commission, or scholarly paper with clear mechanics and data. | ⚠️ Conditional | Included as *Maturity: Research / Proposed* if supported by Level 1–3 evidence. |
| **Recommendation** | An actionable finding produced by an official audit, commission of inquiry, or peer-reviewed evaluation targeting specific actors. | ⚠️ Conditional | Included as *Maturity: Expert Reviewed* when tied to a specific root cause. |
| **Canonical Fix** | A fully synthesized, evidence-graded Knowledge Object that pairs a verified problem statement with one or more structured intervention options, global precedents, feasibility assessments, trade-offs, and tracking metrics. | ✅ Core Entity | **Primary unit of knowledge** in The Fix Hub. |
| **Adopted Reform / Implemented Fix** | A statutory enactment, executive order, or operational intervention currently active in a jurisdiction. | ✅ Core Entity | Included as *Maturity: Implemented / Measured*. |

#### Decision Criteria for Creating a Canonical Fix
A new Fix Knowledge Object is created **if and only if** all four criteria are satisfied:
1. **Evidentiary Threshold**: The underlying problem is supported by Level 1 (Primary Documents), Level 2 (Academic Scholarship), or Level 3 (Institutional Reports) evidence as defined in *Article III of the Editorial Constitution*.
2. **Actionability**: The intervention specifies *who* must act (legislature, regulator, executive agency, court, or civic body) and *what* concrete action is required.
3. **Comparative Precedent or Empirical Basis**: There is either global precedent (implemented elsewhere) or rigorous counterfactual/econometric modeling supporting potential effectiveness.
4. **Feasibility & Trade-Off Analysis**: The intervention can be analyzed for cost, risks, legal/constitutional basis, and unintended consequences.

---

### 1.3 Typology of Interventions

Public policy interventions take fundamentally different structural forms depending on the leverage point within the governance system. A Fix must be classified under one primary category and may select up to two secondary categories:

```
                          ┌────────────────────────┐
                          │   Canonical Fix Type   │
                          └───────────┬────────────┘
                                      │
     ┌──────────────┬─────────────────┼─────────────────┬──────────────┐
     │              │                 │                 │              │
┌────┴─────┐  ┌─────┴──────┐  ┌───────┴──────┐  ┌───────┴──────┐ ┌─────┴──────┐
│Legislative│  │Administrative│  │Institutional │  │ Economic /   │ │Tech / Infra│
│Reform    │  │& Regulatory  │  │& Governance  │  │ Fiscal       │ │Intervention│
└──────────┘  └──────────────┘  └──────────────┘  └──────────────┘ └────────────┘
     │                                                                 │
┌────┴─────┐                                                     ┌─────┴──────┐
│Judicial /│                                                     │ Behavioral │
│Constitut.│                                                     │ Intervention│
└──────────┘                                                     └────────────┘
```

1. **Legislative Reform (Statutory Amendment)**: Changes to primary legislation passed by parliament or state assemblies (e.g., amending the Right to Information Act to enforce automated disclosure).
2. **Administrative & Regulatory Reform**: Executive orders, gazette notifications, departmental rule changes, or regulatory guidelines issued by statutory bodies (e.g., RBI tightening capital adequacy norms).
3. **Institutional & Governance Reform**: Structural reorganization of public institutions, creation of independent oversight bodies, decentralization of authority, or civil service cadre reform.
4. **Economic & Fiscal Instrument**: Budgetary reallocations, tax incentives, carbon pricing, targeted subsidies, user fees, or public financial management reform.
5. **Technological & Infrastructure Intervention**: Implementation of digital public infrastructure, open API data standards, physical infrastructure investments, or technical protocols.
6. **Behavioral & Choice Architecture**: Choice architecture modifications, public disclosure mechanisms ("naming and shaming"), default options, or information nudges.
7. **Judicial & Constitutional Intervention**: Public Interest Litigation (PIL) directions, constitutional amendments, or judicial enforcement of fundamental rights.

---

## 2. Competitive & Cross-Domain Analysis

To ensure The Breakdown's Fix Hub sets a new global benchmark, we analyzed 18 platforms across five domains. Below is the synthesis of strengths, weaknesses, and extracted design principles.

### 2.1 Cross-Domain Matrix

| Domain | Key Platforms Studied | Key Strengths | Critical Weaknesses | Extracted Design Principle |
| :--- | :--- | :--- | :--- | :--- |
| **Investigative Journalism** | ProPublica (*Impact Tracker*), The Markup (*Impact & Methodology*), OCCRP, ICIJ | Deep narrative impact; high reader trust; clear cause-and-effect reporting on real-world fallout. | Solutions are episodic; articles decay quickly; lacks structured data schemas; solutions are treated as narrative conclusions rather than queryable objects. | **Principle of Permanent Knowledge**: Solutions must exist as durable, versioned entities, not temporary article conclusions. |
| **Public Policy Think Tanks** | Brookings Institution, RAND Corporation (*Toolkits*), NITI Aayog (*Best Practices*), OECD, World Bank | Rigorous cost-benefit analysis; explicit risk modeling; deep academic and institutional authority. | Dense, inaccessible layout; heavy PDF reliance; opaque academic jargon; disconnected from live investigative journalism. | **Principle of Accessible Rigor**: Retain academic depth, trade-off modeling, and risk analysis while delivering progressive disclosure for non-specialists. |
| **Knowledge Platforms** | Wikipedia (*Policy/Reform Articles*), Our World in Data (*OWID*), Gapminder | Transparent edit histories; multi-perspective coverage; world-class data visualization linking trendlines to policy interventions. | Wikipedia lacks editorial synthesis and editorial judgment; OWID focuses on historical trends rather than actionable forward-looking reforms. | **Principle of Empirical Baseline**: Every proposed solution must be grounded in interactive baseline data showing the historical trendline before and after intervention. |
| **Civic Technology** | GovTrack, OpenStates, mySociety (*FixMyStreet*, *WriteToThem*) | High actionability; explicit tracking of legislative status; clear mapping to responsible public actors and jurisdictions. | Narrow focus on process (bill tracking) rather than outcome or evidence quality; ignores non-legislative/administrative solutions. | **Principle of Actor Accountability**: Every Fix must explicitly map the exact institutional actor possessing the legal authority to execute the reform. |
| **Government Repositories** | UK Legislation, India Code, data.gov, Indian Parliament Portals | Authoritative primary sources; statutory precision; immutable gazette record. | Zero contextual analysis; completely incomprehensible to ordinary citizens; no evidence grading or efficacy assessment. | **Principle of Primary Attestation**: Every Fix must link directly to official statutory texts and gazettes as Level 1 evidence without adopting government spin. |

---

## 3. Discovery Pathways & Progressive Disclosure Architecture

### 3.1 Reader Mental Models & Exploration Pathways

How do readers naturally navigate from a problem to a solution? We identified three distinct reader intents:

```
[Intent A: Narrative Reader]     Problem Narrative  ──►  Evidence Audit  ──►  The Fix
[Intent B: Solutions Explorer]   Fix Directory      ──►  Comparative Precedent ──► Root Problem
[Intent C: Policy Researcher]    Faceted Search     ──►  Schema & Trade-Offs   ──► Primary Sources
```

1. **Pathway A (Linear Narrative Discovery: *Problem → Evidence → Fix*)**: The standard reader journey starting from an investigation or story. The reader absorbs the problem, verifies the evidence, and seeks an answer to: *"What can be done about this?"*
2. **Pathway B (Exploratory Discovery: *Fix → Problem → Precedent*)**: Readers facing a specific civic challenge who enter directly via The Fix Hub. They ask: *"What proven policies exist for urban flood management?"*
3. **Pathway C (Faceted Policy Search: *Actor / Sector / Budget → Fix*)**: Policy analysts, journalists, and legislative aides filtering interventions by jurisdiction, budget scale, or implementation difficulty.

### 3.2 Progressive Disclosure: The 3-Level Reading Model

To serve both laypersons and domain experts without cluttering the screen or diluting rigor, content within a Fix Knowledge Object is structured into three progressive disclosure layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: ORIENTATION (Surface Layer — 30-Second Read)                 │
│ • Executive Headline & Intervening Objective                          │
│ • Canonical Fix Type Badge & Evidence Tier Indicator                   │
│ • Primary Responsible Actor & Current Maturity Lifecycle Status        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Reader expands section
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 2: UNDERSTANDING (Analysis Layer — 5-Minute Read)               │
│ • Problem & Root Cause Mapping                                         │
│ • Recommended Action Mechanics & Implementation Steps                 │
│ • Trade-Off Matrix (Winners vs. Losers, Fiscal Cost, Feasibility)     │
│ • Global Precedents & Comparative Case Studies                         │
│ • Steel-Manned Counterarguments & Risk Analysis                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Reader clicks "Audit Evidence"
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 3: AUDIT & RESEARCH (Evidentiary Deep-Dive)                     │
│ • Full Evidence Ledger (Level 1 Statutory Records, Peer-Reviewed Papers)│
│ • Methodological Caveats, Unknowns & Conflicting Evidence Warnings     │
│ • Raw Datasets & Replicable Outcome Metrics                            │
│ • Complete Version History & Audit Log                                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Canonical Information Architecture & Schema Specification

A single Fix Knowledge Object is composed of mandatory (essential) and conditional (optional) fields designed to ensure zero factual ambiguity.

### 4.1 Schema Definition Table

| Field Name | Type | Requirement | Strategic & Editorial Rationale |
| :--- | :--- | :--- | :--- |
| `id` | `string (UUID)` | **Mandatory** | Unique persistent identifier across the Knowledge Graph. |
| `slug` | `string` | **Mandatory** | Canonical URL handle (e.g., `/fix/digital-procurement-audit-trail`). |
| `title` | `string` | **Mandatory** | Concise, active summary of the intervention (e.g., *Mandatory Real-Time E-Procurement Auditing for Public Works*). |
| `primaryCategory` | `InterventionType` | **Mandatory** | Primary classification (Legislative, Administrative, Economic, etc.). |
| `secondaryCategories`| `InterventionType[]`| Optional | Secondary classifications (max 2). |
| `maturityStatus` | `PolicyMaturity` | **Mandatory** | Current state in the 8-stage lifecycle (Idea to Measured/Archived). |
| `problemStatement` | `RichText` | **Mandatory** | Concise statement of the systemic failure being addressed. Must link to canonical Story or Claim. |
| `rootCause` | `RichText` | **Mandatory** | Structural diagnosis explaining *why* the current system fails (e.g., weak enforcement mechanisms, split jurisdiction). |
| `recommendedAction` | `RichText` | **Mandatory** | Explicit description of the operational reform required. |
| `responsibleActors` | `EntityReference[]`| **Mandatory** | Public/private entities with legal authority to execute the Fix (Ministry, Statutory Regulator, Municipal Corp). |
| `beneficiaries` | `TaxonomyTerm[]` | **Mandatory** | Groups who gain from the intervention (e.g., smallholder farmers, urban commuters). |
| `disadvantagedGroups`| `TaxonomyTerm[]` | **Mandatory** | **Distributional Impact**: Groups who bear costs, lose privileges, or face disruption. |
| `fiscalCost` | `CostEstimate` | **Mandatory** | Financial expenditure required (CapEx/OpEx) and funding mechanism (tax, reallocation, user fee). |
| `timeToImpact` | `TimeHorizon` | **Mandatory** | Time required from enactment to observable results (Immediate, 1–3 yrs, 5+ yrs). |
| `globalPrecedents` | `PrecedentCase[]` | Optional | Documented implementations in other jurisdictions with recorded outcomes. |
| `tradeOffs` | `TradeOffItem[]` | **Mandatory** | Explicit compromise analysis (e.g., Increased Privacy vs. Higher Administrative Overhead). |
| `risksAndFailureModes`| `RiskItem[]` | **Mandatory** | Potential unintended negative consequences and mitigation strategies. |
| `constitutionalBasis`| `LegalBasis` | Optional | Enabling statutory clauses, constitutional articles, or jurisdictional boundaries. |
| `evidenceGrade` | `EvidenceGrade` | **Mandatory** | Overall confidence grade based on the GRADE-CERQual framework. |
| `unknownsAndGaps` | `UncertaintyNote[]` | **Mandatory** | **Explicit callouts** of unstudied variables, missing baseline data, or contested evidence. |
| `successMetrics` | `MetricIndicator[]`| **Mandatory** | Replicable metrics used to measure whether the Fix succeeds or fails over time. |
| `lastVerified` | `ISO-8601 Date` | **Mandatory** | Date of last manual verification by the Verification Bureau. |

---

## 5. Policy Maturity Lifecycle Model

A policy solution is not static; it evolves from an unrefined concept to an enacted statutory reform, or degrades into an obsolete proposal. Every Fix must be tagged with a single lifecycle stage:

```
[1. Idea / Concept] ──► [2. Research / Proposed] ──► [3. Expert Reviewed] ──► [4. Pilot / Experiment]
                                                                                      │
[8. Archived / Obsolete] ◄── [7. Updated / Refined] ◄── [6. Measured / Evaluated] ◄── [5. Enacted / Implemented]
```

### 5.1 Stage Definitions & Governance Triggers

1. **Stage 1: Idea / Concept**: Initial reform proposal identified in public discourse or academic literature. Needs formal modeling.
2. **Stage 2: Research / Proposed**: Supported by Level 2/3 evidence; formally drafted as a legislative bill, policy paper, or commission recommendation.
3. **Stage 3: Expert Reviewed**: Has undergone The Breakdown's *Gold Standard Fix Audit* (peer-reviewed by at least two domain specialists).
4. **Stage 4: Pilot / Experiment**: Implemented in a limited geographic or sectoral trial (e.g., direct benefit transfer trial in two districts).
5. **Stage 5: Enacted / Implemented**: Passed into law or administrative regulation at full scale.
6. **Stage 6: Measured / Evaluated**: Post-implementation empirical evaluation completed; outcomes compared against initial targets.
7. **Stage 7: Updated / Refined**: Policy modified based on measured outcome data or changing conditions.
8. **Stage 8: Archived / Obsolete**: Intervention superseded by superior policy, declared unconstitutional, or proven counterproductive by empirical evidence.

---

## 6. Evidence Framework & Uncertainty Modeling

### 6.1 Integrating Evidence Grading (GRADE-CERQual Adaptation)

To avoid arbitrary "truth scores" or biased ratings, The Breakdown applies an adapted **GRADE-CERQual** (Confidence in the Evidence from Reviews of Qualitative research) framework.

Every Fix receives an overall **Evidentiary Confidence Grade**:

| Grade Badge | Definition | Evidentiary Requirement |
| :--- | :--- | :--- |
| **High Confidence** | Highly likely that the intervention achieves the stated outcome. | Multiple Level 1 primary documents and high-quality Level 2 peer-reviewed systematic reviews from independent settings. |
| **Moderate Confidence** | Intervention is moderately likely to succeed, but contextual variations exist. | Supported by Level 2 studies or Level 3 institutional evaluations, but limited long-term outcome data. |
| **Low Confidence / Experimental** | Theoretical rationale is strong, but empirical precedent is limited or restricted to non-comparable settings. | Level 3 think-tank modeling or Level 5 expert consensus without large-scale empirical pilots. |
| **Contested Evidence** | Robust scholarly or institutional studies disagree on efficacy or net benefit. | High-quality studies demonstrate conflicting results (e.g., active academic debate on rent control efficacy). |

---

### 6.2 Uncertainty as a First-Class Concept

Policy interventions operate in complex adaptive systems. To preserve institutional trust, a Fix **must never present certainty where evidence is incomplete**.

Four mandatory uncertainty callout structures are embedded in every Fix:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ⚠️ UNKNOWN VARIABLES & DATA GAPS                                      │
│ Identifies variables where baseline data is missing or unmeasured      │
│ (e.g., "No municipal-level data exists on informal sector waste flows").│
├────────────────────────────────────────────────────────────────────────┤
│ ⚖️ CONTESTED SCHOLARLY EVIDENCE                                       │
│ Summarizes legitimate academic disagreements                           │
│ (e.g., "Economists disagree on whether wage subsidies displace unsk...│
├────────────────────────────────────────────────────────────────────────┤
│ 🌐 CONTEXT-DEPENDENCY WARNING                                         │
│ Explains why successful international precedents may fail locally      │
│ (e.g., "Requires high civil service technical capacity missing in..."). │
├────────────────────────────────────────────────────────────────────────┤
│ 📉 FAILURE MODES & RISK OF UNINTENDED CONSEQUENCES                    │
│ Explicitly details how the policy could backfire                       │
│ (e.g., "Per-head livestock subsidies may incentivize overbreeding").   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Context & Transferability Analysis

A major flaw in solutions journalism is assuming that an intervention that worked in Singapore, Sweden, or Kerala can be directly transplanted to Bihar, London, or Texas.

Every Fix featuring a global or regional precedent must evaluate six **Transferability Vectors**:

1. **State Capacity & Technical Competence**: Does the enforcing agency possess the administrative manpower and IT infrastructure required?
2. **Fiscal Space**: Can the public treasury sustain long-term operating expenditure without catastrophic debt displacement?
3. **Legal & Constitutional Framework**: Is the intervention compatible with local federalism, separation of powers, and statutory mandates?
4. **Political Economy & Vested Interests**: Which powerful interest groups (unions, industrial monopolies, bureaucratic elites) will attempt to block or capture the policy?
5. **Institutional Maturity & Rule of Law**: Does enforcement rely on low-corruption judicial/policing systems, or does it risk extortion?
6. **Cultural & Social Compatibility**: Does the policy conflict with local social norms, informal community structures, or historical practices?

---

## 8. Separation of Descriptive vs. Normative Content

To comply with *Article V (Neutrality Standards) of the Editorial Constitution*, a Fix Hub page must enforce an absolute structural separation between four content layers:

```
[ LAYER 1: WHAT EXISTS ] ──► Statutory status, active laws, official budget allocations.
[ LAYER 2: WHAT HAS BEEN PROPOSED ] ──► Specific reform proposals from commissions, bills, and scholars.
[ LAYER 3: WHAT THE EVIDENCE SHOWS ] ──► Empirical outcome data, systematic reviews, historical precedents.
[ LAYER 4: EDITORIAL ANALYSIS ] ──► Synthesized trade-off evaluation, feasibility scoring, and policy commentary.
```

- **Rule 8.1**: Layers 1–3 must contain zero value-laden adjectives (e.g., *"clearly," "obviously," "disastrous," "visionary"*).
- **Rule 8.2**: Layer 4 (Editorial Analysis) must always be explicitly labeled with an **Editorial Synthesis** badge, attributing the analysis to named editors or bureaus.

---

## 9. Reader Questions Answering Architecture

Readers consult a Fix with specific, urgent questions. The layout must prioritize answering these ten core questions:

```
 1. What is the proposed solution?  ──► Executive Headline & Mechanics (Level 1)
 2. Will it actually work?         ──► Evidence Confidence Grade & Peer Reviews (Level 2)
 3. Has it worked elsewhere?       ──► Global Case Studies & Precedents (Level 2)
 4. Who benefits from this?        ──► Beneficiary Mapping (Level 2)
 5. Who loses or pays the price?   ──► Distributional Impact & Disadvantaged Groups (Level 2)
 6. How much will it cost?         ──► Fiscal Cost & Funding Source (Level 2)
 7. How long will it take?         ──► Time Horizon to Impact (Level 1/2)
 8. What are the risks?            ──► Unintended Consequences & Failure Modes (Level 2)
 9. What is the legal basis?       ──► Constitutional & Statutory Enabling Basis (Level 3)
10. What is holding it back?       ──► Political Economy & Vested Interest Bottlenecks (Level 2)
```

---

## 10. Knowledge Relationship Graph Model

A Fix does not exist in isolation. It is a node in The Breakdown's unified Knowledge Graph, connected via typed, bidirectional relationships:

```
                    ┌─────────────────────────┐
                    │      Canonical Story    │
                    └────────────┬────────────┘
                                 │ addresses_problem
                                 ▼
┌──────────────┐    addresses    ┌─────────────────────────┐    implements    ┌──────────────┐
│  Claim Node  │───────────────► │   Canonical FIX Node    │─────────────────►│ Entity Node  │
└──────────────┘                 └────────────┬────────────┘                  └──────────────┘
                                              │
         ┌───────────────────┬────────────────┼───────────────────┬──────────────────┐
         │ evaluated_by      │ cites_source   │ uses_dataset      │ tracks_progress  │
         ▼                   ▼                ▼                   ▼                  ▼
┌─────────────────┐ ┌────────────────┐ ┌───────────────┐ ┌───────────────────┐ ┌─────────────┐
│ Historical Event│ │ Primary Source │ │ Dataset Node  │ │ Metric Indicator  │ │ Statute/Law │
└─────────────────┘ └────────────────┘ └───────────────┘ └───────────────────┘ └─────────────┘
```

### Relationship Edge Taxonomy
- `FIX` — `addresses_problem` → `STORY` / `INVESTIGATION`
- `FIX` — `supported_by` → `CLAIM`
- `FIX` — `requires_action_by` → `ENTITY` (Organization / Ministry)
- `FIX` — `amends_statute` → `POLICY` / `LAW`
- `FIX` — `evaluated_in` → `SOURCE` (Research Paper / Report)
- `FIX` — `measured_by` → `DATASET` / `METRIC`
- `FIX` — `preceded_by` → `TIMELINE_EVENT`

---

## 11. Editorial Governance & Editorial Decision Framework

### 11.1 The Gold Standard Fix Review Pipeline

Before any Fix is set to `PublicationStatus: Published`, it must pass through the **7-Phase Gold Standard Review** tailored specifically for solutions:

```
Phase 1: Research Bureau Evidence Audit (Primary documents verified)
   │
Phase 2: Domain Expert Review (Reviewed by at least 2 external specialists)
   │
Phase 3: Legal & Constitutional Sanity Check (Enforceability verified)
   │
Phase 4: Political Economy & Trade-Off Audit (Distributional impact verified)
   │
Phase 5: Bias & Language Check (Prohibited certainty language removed)
   │
Phase 6: Feasibility & Metric Verification (Data sources validated)
   │
Phase 7: Verification Bureau Sign-Off (Final publication clearance)
```

### 11.2 Editorial Decision Framework

This framework governs day-to-day editorial choices regarding creation, consolidation, updating, and retirement of Fix Knowledge Objects:

```
                                  ┌──────────────────────────┐
                                  │   Incoming Reform Idea   │
                                  └─────────────┬────────────┘
                                                │
                                  Is it backed by Level 1-3 evidence?
                                       ├── No  ──► DISCARD / Keep as raw note
                                       └── Yes
                                                │
                          Is it a distinct intervention or variation of an existing Fix?
                                       ├── Variation  ──► CONSOLIDATE into existing Fix (Add as alternative option)
                                       └── Distinct
                                                │
                                  CREATE NEW CANONICAL FIX OBJECT
```

#### Consolidation vs. Splitting Rules
- **Consolidate** when two proposals target the same root cause in the same jurisdiction using similar policy mechanisms (e.g., two minor variants of plastic bag bans are merged into one Fix with sub-options).
- **Split** when interventions target different leverage points (e.g., *Subsidizing Solar Irrigation Pumps* vs. *Reforming Agricultural Electricity Tariffs* remain separate Fixes because they involve different legal actors and budget mechanisms).

#### Superseding & Obsolescence Rules
- When a policy is enacted and subsequently fails empirically, its status changes to `Maturity: Archived / Obsolete`.
- It is **never deleted**. A prominent banner indicates: *"This policy option was enacted in [Year] and demonstrated negative outcomes. See Outcome Audit."*

---

## 12. Meaningful Civic & Reader Actions

The Fix Hub rejects low-friction, vanity engagement (likes, shares, superficial comment threads). Instead, it provides six high-value actions designed to advance civic understanding:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 📄 1. Inspect Primary Statute / Gazette Notification                   │
│ Open original legal text or parliamentary bill directly in split-screen│
├────────────────────────────────────────────────────────────────────────┤
│ 🌐 2. Compare Global Implementation Case Studies                       │
│ Interactive matrix comparing cost, timeline, and results across countries│
├────────────────────────────────────────────────────────────────────────┤
│ 📊 3. Download Verified Evidence & Data Pack                           │
│ Export full citations, underlying datasets, and methodologies (JSON/CSV)│
├────────────────────────────────────────────────────────────────────────┤
│ ⚖️ 4. Audit Trade-Offs & Counterarguments                              │
│ Explore steel-manned arguments from policy opponents                   │
├────────────────────────────────────────────────────────────────────────┤
│ 📈 5. Subscribe to Policy Metric & Implementation Tracker              │
│ Receive notifications when official progress datasets are updated     │
├────────────────────────────────────────────────────────────────────────┤
│ 📝 6. Submit Evidence or Peer Correction                               │
│ Academic and citizen submission channel for new evidence or audits    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Search, Discovery & Taxonomy Architecture

The Fix Hub search architecture utilizes a multi-faceted index enabling readers to query solutions by problem domain, intervention mechanics, or feasibility constraints:

### 13.1 Faceted Search Taxonomy

```
• Problem Domain:       [ Environment | Governance | Economy | Healthcare | Justice | Infra ]
• Intervention Type:    [ Legislative | Administrative | Fiscal | Institutional | Tech | Judicial ]
• Maturity Stage:       [ Proposed | Pilot | Implemented | Evaluated | Archived ]
• Evidence Grade:       [ High Confidence | Moderate Confidence | Experimental | Contested ]
• Jurisdiction / Scope: [ Central / National | State / Provincial | Municipal | Global ]
• Time to Impact:       [ Immediate (<1 yr) | Medium-Term (1-3 yrs) | Long-Term (5+ yrs) ]
• Fiscal Scale:         [ Budget-Neutral | Low Cost | High CapEx | Revenue-Generating ]
```

---

## 14. Metrics & Evaluation Framework

To evaluate the success of The Fix Hub, we track **Understanding Metrics** rather than traditional engagement or vanity click metrics:

| Metric Category | Vanity Metric (Avoided) | Canonical Understanding Metric (Tracked) | Target Benchmark |
| :--- | :--- | :--- | :--- |
| **Solution Comprehension** | Total Pageviews | **Solution Completion Rate**: Readers who scroll through Level 1 & Level 2 content. | > 45% completion |
| **Evidentiary Deep-Dive** | Banner Clicks | **Primary Source Verification Rate**: Readers who open Level 1 citations or legal texts. | > 20% of readers |
| **Comparative Learning** | Time on Page | **Precedent Exploration Ratio**: Readers who compare two or more global case studies. | > 30% of readers |
| **Civic Return Visits** | Social Shares | **Policy Lifecycle Return Visits**: Readers returning to check updated metric trackables. | > 25% 90-day return |

---

## 15. Accessibility (WCAG 2.1 AAA) & Mobile-First Recommendations

### 15.1 Accessibility Mandates
- **Screen Reader Navigation**: All complex trade-off matrices and comparative tables must supply alternative ARIA descriptions (`aria-describedby`) and accessible semantic HTML data structures.
- **Color Independence**: Evidence grades (High, Moderate, Contested) must use distinct icon shapes and text labels alongside color coding to ensure usability for color-blind readers.
- **Focus Management**: Keyboard focus must logically traverse progressive disclosure drawers and citation sidecars without trapping users.

### 15.2 Mobile-First Information Density
- **Stackable Comparison Cards**: Multi-column precedent matrices collapse into swipeable, stacked comparison cards on viewport widths < 768px.
- **Bottom-Sheet Evidence Drawers**: Primary source citations and trade-off details open as native mobile bottom-sheets to preserve reading position.

---

## 16. Strategic Implementation Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Canonical Data Model & Registry Integration (Month 1)        │
│ • Extend `types/canonical.ts` with updated Fix fields & evidence grades│
│ • Establish Fix Registry and service layer mappings                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Editorial Workflow & Review Pipeline (Month 2)               │
│ • Deploy Gold Standard Fix Audit checklist in Mission Control          │
│ • Seed 10 flagship canonical Fix objects for Volume I topics           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Surface Projections & Navigation Integration (Month 3)       │
│ • Render Fix Hub directory (/fix) and detail surfaces (/fix/[slug])    │
│ • Embed Fix projection cards into core Investigation & Story pages     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: Live Policy Tracking & Metric Engine (Month 4+)               │
│ • Connect success metrics to automated dataset refresh monitors         │
│ • Open reader evidence submission & peer correction channels           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 17. Open Questions & Future Research

1. **AI-Assisted Policy Synthesis**: How can language models assist research bureaus in extracting structured policy proposals from 500-page parliamentary committee reports without hallucinating outcomes?
2. **Sub-National Feasibility Variations**: How can the framework dynamically adjust fiscal and administrative feasibility scores when projecting a national policy to specific municipal contexts?
3. **Evaluating Long-Term Policy Decay**: What quantitative triggers should signal that a published Fix requires mandatory editorial re-audit due to shifting economic or geopolitical baselines?
