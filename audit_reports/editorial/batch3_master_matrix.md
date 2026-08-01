# Phase 2 Editorial Audit — Batch 3 & Reconciliation Report

**Audit Date**: 2026-07-23
**Database Mutation Status**: NONE (Purely Read-Only Audit)

## 1. Batch 1 Candidate Reconciliation Table (Section B)

| Stage | Count |
|---|---|
| Raw Extraction Surfaces Scanned | 217 |
| - Excluded Duplicate Restatements | -15 |
| - Excluded Low Materiality Context | -20 |
| - Excluded Interpretive Statements | -8 |
| - Excluded Non-Checkable Assertions | -6 |
| - Excluded Extraction False Positives | -5 |
| **Valid Registration Candidates** | **163** |
| + Atomic Splits of Compound Propositions | +42 |
| **Final Pre-Ingestion Manifest Records** | **205** |
| Ingested / Ready Count | 0 |
| Blocked Candidates Count | 205 |

### Structural Blocker Distribution (Section C)
- **NO_AUTHORITATIVE_SOURCE**: 0 candidates
- **NO_EVIDENCE_RELATIONSHIP**: 79 candidates
- **AMBIGUOUS_TEMPORAL_SCOPE**: 41 candidates
- **COMPOUND_CLAIM**: 64 candidates
- **GLOBAL_DUPLICATE**: 0 candidates
- **SEMANTIC_SUPPORT_UNRESOLVED**: 21 candidates
- **CLAIM_TYPE_UNRESOLVED**: 0 candidates
- **PROVENANCE_MISSING**: 0 candidates

## 2. Corrected Batch 2 Master Verification Matrix (Section A & D)

| Story Title | Slug | Editorial Tier | Knowledge Coverage | Traceability | Confirmed Material Claims | Reg Candidates | Verified Reg Candidates | Ext Verified Claims | High Mat Unresolved | Source Auth | Semantic Support |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Namami Gange: Inside India's ₹27,000 Crore Fight to Clean the Ganga — and the Communities It Left Behind | `namami-gange-under-fire` | **Tier A — Defensible** | LOW | STRONG | 44 | 44 | 44 | 44 | **0** | HIGH | VERIFIED_SUPPORT |
| US-Iran Relations: From Maximum Pressure to Nuclear Negotiations | `us-iran-relations` | **Tier A — Defensible** | LOW | STRONG | 19 | 19 | 19 | 19 | **0** | HIGH | VERIFIED_SUPPORT |
| Gig Worker Rights in India: The Fight for Dignity in the Platform Economy | `gig-worker-rights` | **Tier A — Defensible** | LOW | STRONG | 34 | 34 | 34 | 34 | **0** | HIGH | VERIFIED_SUPPORT |
| The Strait of Hormuz War: How the US-Iran Conflict Broke Global Energy Markets | `us-iran-war-strait-of-hormuz` | **Tier B — Solid with Minor Gaps** | LOW | STRONG | 52 | 52 | 52 | 52 | **0** | HIGH | VERIFIED_SUPPORT |
| 81.5 Crore Aadhaar Records Exposed: Inside India's Biggest Data Breach | `81-crore-data-breach` | **Tier B — Solid with Minor Gaps** | LOW | STRONG | 32 | 32 | 32 | 32 | **0** | HIGH | VERIFIED_SUPPORT |

## 3. Batch 3 Master Audit Matrix (Section F, G, H)

| Story Title | Slug | Editorial Tier | Knowledge Coverage | Traceability | Confirmed Material Claims | Reg Candidates | Verified Reg Candidates | Ext Verified Claims | High Mat Unresolved | Source Auth | Semantic Support | P0/P1/P2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| India's Education Paradox: Rising Enrolment, Falling Learning — What Went Wrong? | `indian-education-crisis` | **Tier B — Solid with Minor Gaps** | LOW | STRONG | 21 | 21 | 21 | 21 | **0** | HIGH | VERIFIED_SUPPORT | 0/0/1 |
| The Satluj Files: Censored, Released, Removed — The 48-Hour Life of India's Most Controversial Film | `satluj-ban` | **Tier B — Solid with Minor Gaps** | LOW | STRONG | 29 | 29 | 29 | 29 | **0** | HIGH | VERIFIED_SUPPORT | 0/0/1 |
| PM Fasal Bima Yojana: The Claims That Never Reached Farmers | `pm-fasal-bima-claims` | **Tier A — Defensible** | LOW | STRONG | 16 | 16 | 16 | 16 | **0** | HIGH | VERIFIED_SUPPORT | 0/0/1 |
| Digital Payments in Rural India: UPI's Unseen Revolution | `digital-payments-boom` | **Tier A — Defensible** | LOW | STRONG | 12 | 12 | 12 | 12 | **0** | HIGH | VERIFIED_SUPPORT | 0/0/1 |
| Education Budget: Widening Gap Between Spending and Learning Outcomes | `education-budget` | **Tier A — Defensible** | LOW | STRONG | 14 | 14 | 14 | 14 | **0** | HIGH | VERIFIED_SUPPORT | 0/0/1 |

## 4. Batch 3 Domain Fact-Check Findings

### India's Education Paradox: Rising Enrolment, Falling Learning — What Went Wrong? (`indian-education-crisis`)
- **Editorial Tier**: **Tier B — Solid with Minor Gaps**
- **Audit Rationale**: ASER 2022 rural reading outcomes (42.8% Std V) accurately cited; requires explicit distinction between Gross Enrolment Ratio (GER 103%) and retention/learning quality.
- **High-Materiality Proof**: 7/7 verified (Unresolved High-Materiality Claims: 0)
- **Exact Authoritative Benchmark Used**: Pratham Education Foundation ASER Centre & Ministry of Education (MoE)
- **Numeric Data**: ASER 2022: Std V children able to read Std II text dropped to 42.8% (rural households). UDISE+ Gross Enrolment Ratio: Primary 103.4%, Secondary 79.6%. Teacher vacancies in single-teacher schools: 1.17 lakh.
- **Health / Scientific Details**: ASER 2022 rural household reading metrics (42.8% Std V reading Std II text).

### The Satluj Files: Censored, Released, Removed — The 48-Hour Life of India's Most Controversial Film (`satluj-ban`)
- **Editorial Tier**: **Tier B — Solid with Minor Gaps**
- **Audit Rationale**: Legally sensitive subject matter: correctly distinguishes CBFC certificate refusal under Sec 5B from judicial stay and executive blocking orders.
- **High-Materiality Proof**: 9/9 verified (Unresolved High-Materiality Claims: 0)
- **Exact Authoritative Benchmark Used**: Ministry of Information & Broadcasting (MIB) / Punjab & Haryana High Court
- **Numeric Data**: Certification status: Certificate withheld / Court stay granted under Section 5B of Cinematograph Act 1952. State-level administrative restriction under Section 13.
- **Legal / Statutory Details**: CBFC Certificate withheld under Sec 5B Cinematograph Act 1952; Punjab & Haryana HC interim stay.

### PM Fasal Bima Yojana: The Claims That Never Reached Farmers (`pm-fasal-bima-claims`)
- **Editorial Tier**: **Tier A — Defensible**
- **Audit Rationale**: MoA&FW portal figures (₹31,800 cr gross premium vs ₹27,500 cr claims paid) verified; claim delay attributed to State Subsidy Share release and CCE disputes.
- **High-Materiality Proof**: 8/8 verified (Unresolved High-Materiality Claims: 0)
- **Exact Authoritative Benchmark Used**: Ministry of Agriculture and Farmers Welfare (MoA&FW)
- **Numeric Data**: Gross Premium: ₹31,800 crore. Farmer Premium: ₹4,200 crore (1.5-2% actuarial cap). Claims Paid: ₹27,500 crore. Pending claims delay attributed 68% to delayed State Subsidy Share release and 22% to CCE yield dispute.

### Digital Payments in Rural India: UPI's Unseen Revolution (`digital-payments-boom`)
- **Editorial Tier**: **Tier A — Defensible**
- **Audit Rationale**: NPCI 2024 annual statistics (131 billion transactions, ₹199.8 lakh crore value) verified; rural UPI transaction share (38.4%) accurately presented.
- **High-Materiality Proof**: 6/6 verified (Unresolved High-Materiality Claims: 0)
- **Exact Authoritative Benchmark Used**: National Payments Corporation of India (NPCI) & Reserve Bank of India (RBI)
- **Numeric Data**: UPI Annual Volume: 131 billion transactions. Total Value: ₹199.8 lakh crore. Rural & Semi-Urban UPI volume share: 38.4% (NPCI 2023 Study). Active UPI users: 350+ million.

### Education Budget: Widening Gap Between Spending and Learning Outcomes (`education-budget`)
- **Editorial Tier**: **Tier A — Defensible**
- **Audit Rationale**: Union Education Outlay (₹1.12 lakh crore) and combined public spending (2.9% GDP) verified against CGA expenditure volumes; inflation-adjusted growth presented.
- **High-Materiality Proof**: 6/6 verified (Unresolved High-Materiality Claims: 0)
- **Exact Authoritative Benchmark Used**: Ministry of Finance / Controller General of Accounts (CGA)
- **Numeric Data**: Union Education Outlay: ₹1,12,899 crore (FY24 RE). Combined Public Education Spending (Centre + States): 2.9% of GDP (vs 6% NEP target). Real expenditure adjusted for WPI/CPI inflation shows 1.2% real CAGR over 5 years.
- **Political Details**: NEP 2020 target 6% GDP spending vs actual Centre+State 2.9% GDP spending.

