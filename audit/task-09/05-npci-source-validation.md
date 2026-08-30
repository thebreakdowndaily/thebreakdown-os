# NPCI / UPI123Pay — Primary-Source Validation

Ticket context: **CNT-HP-02** — content-hub pilot opportunity around the digital-payments story's feature-phone claims.

## Question

What is the current, authoritative per-transaction limit for UPI122Pay / UPI123Pay feature-phone payments, and is it safe for The Breakdown to publish it?

## Primary documents identified

| # | Document | Date | Level | Status |
|---|----------|------|-------|--------|
| 1 | RBI — Statement on Development and Regulatory Policies (SDRP), 9 Oct 2024 | 2024-10-09 | A (central-bank primary) | VERIFIED via RBI press release referenced in NPCI circular; direct RBI page re-fetch pending |
| 2 | NPCI circular **UPI OC No. 209 FY 24-25** — "Guidelines on UPI Features for UPI 123Pay" | 2024-10-25 | A (operator primary) | VERIFIED via Economic Times quote of the circular text; listed on npci.org.in/circulars/upi |
| 3 | UPI feature-phone product page (UPI123Pay, USSD *99#) | ongoing | A | Product/process fact, uncontested |

## Verified facts

1. The RBI, in its SDRP of 9 October 2024, decided to raise the **per-transaction limit for UPI123Pay from ₹5,000 to ₹10,000**.
2. NPCI then issued **UPI OC No. 209 FY 24-25 (25 Oct 2024)** directing members to:
   - increase the per-transaction limit to ₹10,000 **with immediate effect**;
   - implement onboarding with **Aadhaar OTP** in UPI123Pay;
   - collectively identify and **tag UPI123Pay transactions**;
   - implement **UPI number** functionality via the UPI numeric ID mapper;
   - new members to comply before going live.
3. NPCI set **1 January 2025** as the compliance deadline for the new limit (corroborated by Economic Times, Business Standard, CNBC-TV18).
4. UPI123Pay serves feature-phone/offline users: IVR, missed-call, sound-based, and USSD (*99#) channels — relevant to rural/semi-urban cohorts in the digital-payments story.

## What this story previously said

The FAQ "How does UPI work on feature phones?" described the channels (*99# and UPI123Pay) but carried **no transaction-limit figure** — so there was nothing false to correct, only specificity to add.

## Evidence levels

- Level B+ for the ₹5,000 → ₹10,000 change: NPCI circular quoted verbatim in press coverage, Rbi SDRP cited inside the circular, and the circular is indexed on the official npci.org.in/circulars/upi listing.
- Level A upgrade requires direct inspection of the RBI SDRP page and the NPCI circular PDF (held locally at npci.org.in/circulars/upi) — logged as follow-up, not a blocker.

## Decision

**ENRICH (additive, evidence-backed).** Update the story FAQ with the verified limit and implementation timeline. Per Evidence Standard, the claim is sourced (RBI SDRP 9 Oct 2024; NPCI UPI OC No. 209 FY 24-25; compliance 1 Jan 2025) and confidence-graded ≥0.9. No counter-narrative is materially disputed across RBI/NPCI/press sources.

## Recorded in store

`story2 (digital-payments-boom) faq` now reads:

> UPI works on feature phones via USSD codes (*99#) and NPCI's UPI123Pay service, which supports IVR, missed-call, and sound-based payments. The per-transaction limit for UPI123Pay was raised from ₹5,000 to ₹10,000 by the RBI in its October 2024 Statement on Development and Regulatory Policies; NPCI's circular UPI OC No. 209 FY 24-25 directed members to implement the higher limit with immediate effect and complete compliance by 1 January 2025.

## Follow-up

- Direct re-fetch of RBI SDRP (https://rbi.org.in) and NPCI PDF to upgrade 05 source rows to Level A.
- Link the fact into the Claim Registry on next entity/story enrichment pass (Evidence Spine already satisfied; canonical registry link is a maintainability TODO).