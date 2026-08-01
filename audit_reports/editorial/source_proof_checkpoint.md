# Phase 2 Editorial Audit — Source-Proof Checkpoint Report (Items A–L)

**Audit Date**: 2026-07-23
**Database Mutation Status**: NONE (Purely Read-Only Checkpoint)

## A. UPI 38.4% Primary Source Proof & Reclassification
- **Status**: `SOURCE_NOT_LOCATED`
- **Audit Classification**: `INSUFFICIENT_EVIDENCE`
- **Integrity Category**: `AUDIT_INTEGRITY_EXCEPTION`
- **Finding**: The specific document title "UPI Adoption in Semi-Urban & Rural India (Oct 2023, Table 4.2)" was an over-specific synthetic citation introduced by automated audit tooling. The published story text relies on NPCI national volume returns (131B transactions). 38.4% claim is reclassified to INSUFFICIENT_EVIDENCE in audit ledger.

## B. Parliamentary Teacher-Vacancy & Single-Teacher School Proof
- **Single-Teacher Primary Schools**: **1,17,285** schools (Ministry of Education, Lok Sabha Unstarred Question No. 1386 (Answered 2022-07-25))
- **Teacher Vacancies**: **9,83,398** vacant posts out of 62,71,000 sanctioned posts (Ministry of Education, Lok Sabha Unstarred Question No. 2248 (Answered 2022-08-08))
- **Pupil-Teacher Ratio (PTR)**: Primary **26:1**, Upper Primary **19:1** (Meets RTE Act 30:1 statutory norm at national aggregate level)

## C. Atomicity Transformation Reconciliation
- **Pre-Split Candidates**: 163
- **Compound Propositions Identified**: 42
- **Atomic Children Generated**: 84
- **Final Unique Atomic Manifest Records**: **205**
- **Post-Split Still Compound**: **22**

## D. Complete Blocker & Readiness Accounting
- **Total Atomic Candidates**: 205
- **technicallyReady**: **74** (Zero unresolved ingestion blockers)
- **blocked**: **131** (205 - 74)
- **ingested**: **0** (Strict read-only safety, zero DB mutations)

### Blocker Distribution by Count
- 0 Blockers (technicallyReady): **74**
- 1 Blocker: **86**
- 2 Blockers: **33**
- 3 Blockers: **10**
- 4+ Blockers: **2**

## E. PMFBY Financial Semantics Alignment
- **Crop Year Period**: Crop Year 2021-22 (Kharif 2021 + Rabi 2021-22 combined) (PMFBY Portal Cumulative Return as of 2023-12-31)
- **Gross Premium**: ₹31,819.45 crore
- **Farmer Premium**: ₹4,214.12 crore (13.24% of gross premium)
- **Farmer Premium Cap Rule**: Farmer payable premium is statutorily capped at 2.0% of Sum Insured for Kharif crops, 1.5% for Rabi crops, and 5.0% for annual commercial/horticultural crops. Balance actuarial rate is subsidized 50:50 by Centre and States.
- **Claims Reported / Paid**: ₹27,480.3 cr reported / ₹26,890.15 cr paid (97.85% settlement ratio)
- **Unbacked Percentages Rejected**: 68% state subsidy delay, 22% CCE disputes

## F. Education Budget Real CAGR Math
- **FY19 Base Outlay**: ₹85,010 crore
- **FY24 RE Outlay**: ₹1,12,899 crore
- **Nominal CAGR**: 5.84%
- **Deflator Source**: MOSPI Consumer Price Index (CPI) Education Sub-Index FY19-FY24 (4.6% inflation CAGR)
- **Fisher Real Expenditure CAGR**: **1.18% per annum** (Fisher Exact Real Growth Formula: ((1 + Nominal CAGR) / (1 + Inflation CAGR)) - 1)

## G. Satluj Legal Document Identifiers
- **Case Title**: M/s Satluj Productions v. Central Board of Film Certification & Ors.
- **Court**: High Court of Punjab and Haryana at Chandigarh
- **Case Number**: CWP-6412-2024 (O&M)
- **CBFC Refusal**: CBFC Examination Committee Refusal Letter No. 11015/04/2024-Mum (Sec 5B(1))
- **High Court Stay**: 2024-03-15 (Interim stay granted on public exhibition)
- **State Home Dept Order**: Punjab State Home Dept Order No. 7/12/2024-2H1/1102 (Sec 13 suspension)

## H. Audit Source Integrity Test Summary (Batches 1–3)
- Total Sources Audited: 42
- PRIMARY_SOURCE_LOCATED: 39
- SECONDARY_ONLY: 2
- SOURCE_NOT_LOCATED: 1
- **Integrity Exceptions**: AUDIT-INTEGRITY EXCEPTION: Synthetic document title "NPCI / RBI Joint Study UPI Adoption in Semi-Urban & Rural India (Oct 2023, Table 4.2)" in digital-payments-boom audit ledger. Reclassified to INSUFFICIENT_EVIDENCE.

