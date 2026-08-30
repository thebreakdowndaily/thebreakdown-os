Current Ticket:
TASK-03

Status:
Completed

Objective:
Define the entity classes, page eligibility rules, and structural wireframe requirements.

Blocked By:
None

Depends On:
TASK-02 — Technical SEO, Canonicalization & Evidence Integrity (COMPLETED)

Acceptance Criteria:
✓ Eligible entity classes defined.
✓ Minimum publication value threshold established.
✓ Entity profile layout structure specified.

Definition of Done:
All entity architecture requirements satisfied.

---

# THE BREAKDOWN: ENTITY PAGE & DISCOVERY ARCHITECTURE

Version: 1.0  
Status: Drafted  
Governance Level: 4 (Project Deliverable)  

This document outlines the classification and publication criteria for entity profile pages to prevent index bloat and ensure high-value search landing surfaces.

---

## 1. Mapped Entity Classes

To ensure accurate database mapping and valid schema markup, entities are classified into one of the following classes:

1.  **Person**: Government leaders, policy analysts, key decision-makers. (e.g. Narendra Modi, Raghuram Rajan).
2.  **Organization / Ministry**: Government departments and statutory bodies. (e.g. Ministry of Finance, RBI, SEBI).
3.  **Policy / Scheme**: Major government initiatives and legislation. (e.g. MGNREGA, DPDP Act, PM Fasal Bima Yojana).
4.  **Company / Institution**: Corporates or academic bodies. (e.g. UPI/NPCI, SIPRI, Adani Group).
5.  **Technology**: Tech platforms and standards. (e.g. Aadhaar, 5G Network).

---

## 2. Profile Publication Eligibility Threshold

To maintain high editorial standards and avoid "thin content" flags by search engines, entity pages are subject to a **Strict Quality Gate**:

- **Threshold**: An entity is eligible for a public indexable page (`/entity/[slug]`) **ONLY** if it meets one of the following conditions:
  1.  It is referenced in at least **2 published articles** (briefings or chapters) on the platform, OR
  2.  It contains a customized, peer-reviewed summary/description (minimum 100 words) + at least 3 verified structural metadata parameters (e.g. founded date, governing body, headquarters).
- **Draft Status fallback**: Entities that do not meet this threshold remain as unlinked text in stories or render with a simple tooltip, but do not generate a public indexable URL. This prevents indexing thousands of low-value stub pages.

---

## 3. Entity Profile Page Structure

Eligible profile pages must conform to the following information hierarchy:

1.  **Header**: Entity Name, Class Badge, and official logo/portrait.
2.  **Fact Box (Dossier)**: Key facts (e.g., Parent Organization, Headquarters, Year of Inception, Associated legislation).
3.  **Dossier Summary**: A 150-250 word peer-reviewed summary explaining the entity's role in public policy or economy.
4.  **Referenced Briefings & Chapters**: A chronological feed of all platform articles referencing this entity, sorted by date.
5.  **Verification Timeline**: Chronological events and statements attributed to the entity that are audited in our briefings.
6.  **Primary Documents Mapped**: Direct links to official government gazettes, reports, or data files associated with the entity.
7.  **Related Entities**: Interactive tag list pointing to related partners or parent organizations.
