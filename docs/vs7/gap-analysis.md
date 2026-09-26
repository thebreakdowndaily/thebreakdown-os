# The Breakdown OS — Architectural Gap Analysis (VS7)

**Phase:** VS7 Architecture Reconnaissance & Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Gap Analysis  
**Governing Documents:** Editorial Constitution v1.1 (Articles XI, XIII), AGENTS.md (Platform Beta Rules, 90/10 Rule)

---

## 1. Executive Summary

Following forensic evaluation of the codebase against the frozen platform baselines (P0–VS6), the engineering architecture is approximately 95% complete. In alignment with CTO Directive v2.0 and the Platform Beta mandate ("No new generic infrastructure; every commit must answer: Can a reader notice this?"), remaining gaps are strictly editorial quality, public accountability, and founding content execution.

Four discrete gaps have been identified and classified by severity.

---

## 2. Gap Ledger

### GAP-VS7-01: Reader Corrections Pipeline & Errata Transparency
- **Severity:** P1 (Essential for Editorial Trust & Article XIII Compliance)
- **Current State:**
  - Migration 013 (`013_create_corrections_schema.sql`) created two tables:
    1. `public.corrections`: Public, append-only published errata notices linked to stories.
    2. `public.reader_corrections`: Restricted reader submission queue with strict RLS (`anon` can INSERT; only `staff` can SELECT/UPDATE).
  - Current utilization: **0%**. No API route exists to accept submissions (`/api/corrections/submit`). No UI exists on story pages for readers to flag errors. No admin interface exists for editors to review or approve submissions into published errata notices.
- **Reader Impact:**
  - Readers cannot submit fact-checking tips or report factual errors directly against specific claims.
  - Transparent corrections are mandated by Editorial Constitution Article XIII but cannot be displayed.
- **Architectural Solution Required:**
  - API endpoint: `POST /api/corrections/submit` with strict rate limiting (via existing migration 016 rate-limiter) and input validation.
  - Reader UI: Lightweight, accessible modal or inline drawer on `StoryShell` to report an error against a claim.
  - Staff Action: Server action for editors in `/cms` or `/operations` to triage submissions and publish approved corrections to `public.corrections`.
  - Zero database migrations required (schema 013 already exists).

---

### GAP-VS7-02: Automated Gold Standard Review Quality Gate
- **Severity:** P1 (Essential for Article XI & Article XIV Quality Verification)
- **Current State:**
  - `lib/editorial/gold-standard-review.ts` provides complete TypeScript interfaces for the 7 Gold Standard Review phases (Expert Review, Reader Review, Evidence Audit, Bias Audit, Visual Audit, Knowledge Density Audit, Defensibility Audit) and a default scoring evaluator (`evaluateGoldStandardPass`).
  - However, this engine is not automatically executed prior to publication. `lib/editorial/publication-gate.ts` checks basic status and metadata, but does not enforce Gold Standard phase passing scores or density targets.
- **Reader Impact:**
  - Ensures no chapter can be published without meeting rigorous evidence density (50+ claims, 120+ evidence items, 100+ sources) and passing bias/defensibility audits.
- **Architectural Solution Required:**
  - Wire `evaluateGoldStandardPass()` into the publication gate verification pipeline.
  - Provide an automated CLI / automated test runner (`npm run test:gold-standard`) to evaluate story packages against density thresholds.
  - Zero database migrations required.

---

### GAP-VS7-03: Founding Publication (Volume I, Chapter 1) Assembly
- **Severity:** P0 (Mission Goal: The Breakdown's Founding Publication)
- **Current State:**
  - Chapter 1 ("The Partition and Its Legacies") exists in partial form in `lib/editorial/chapter-1-data.ts` and `app/series/india-and-the-world/the-partition-and-its-legacies/page.tsx`.
  - It does not yet meet full Article XI density targets (50+ claims, 120+ evidence, 100+ sources, 10+ maps/visuals).
- **Reader Impact:**
  - Delivers the flagship, publication-grade experience of The Breakdown to external readers, establishing the reference standard for the entire platform.
- **Architectural Solution Required:**
  - Complete the population of Chapter 1 canonical knowledge objects (claims, primary sources, historiographical schools, counterfactuals) adhering to canonical schema 002.
  - Verify static prerendering and hydration across all 5 reader modes.
  - Zero database migrations required.

---

### GAP-VS7-04: Public Transparency & Errata Log Surface
- **Severity:** P2 (High Value for Public Institutional Trust)
- **Current State:**
  - There is currently no public route displaying platform-wide corrections, methodology changes, or institutional disclosures.
- **Reader Impact:**
  - Readers seeking institutional accountability cannot view historical corrections or editorial updates in a single chronological ledger.
- **Architectural Solution Required:**
  - Public route `/transparency/corrections` reading directly from `public.corrections`.
  - Component displaying story title, error description, correction text, date, and link to the corrected story section.
  - Zero database migrations required.

---

## 3. Severity Matrix & Prioritization

| Gap ID | Title | Severity | Platform Beta Compliance | Reader Noticeable (< 5 min)? | Requires Migration? | Implementation Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-VS7-01** | Reader Corrections Pipeline | P1 | YES (No new infra; wires existing schema 013) | YES (Interactive Report Error button & drawer) | NO (0 migrations) | Low-Medium |
| **GAP-VS7-02** | Automated Gold Standard Review | P1 | YES (Extends existing `gold-standard-review.ts`) | YES (Quality guarantee & verification badge) | NO (0 migrations) | Low |
| **GAP-VS7-03** | Chapter 1 Founding Publication | P0 | YES (90% editorial focus per CTO Directive) | YES (Core flagship content experience) | NO (0 migrations) | Medium (Content density) |
| **GAP-VS7-04** | Public Errata Transparency Log | P2 | YES (Renders existing `public.corrections`) | YES (Dedicated transparency page) | NO (0 migrations) | Low |

---

## 4. Conclusion & Recommended VS7 Scope

All identified gaps strictly align with the **Editorial Constitution** and **Platform Beta Rules**. None require new database migrations, generic abstractions, or changes to the frozen VS6 operational control plane.

VS7 should be scoped as: **Editorial Quality, Reader Corrections & Founding Publication Readiness**.
