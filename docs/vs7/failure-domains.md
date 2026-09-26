# The Breakdown OS — Failure Domains & Blast Radius Analysis (VS7)

**Phase:** VS7 Architecture Reconnaissance & Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Failure Domain Analysis  
**Governing Rule:** Blast Radius Isolation & Defense-in-Depth

---

## 1. Executive Summary

To maintain platform stability across production environments, every candidate capability in VS7 must have clearly defined failure domains, containment boundaries, and recovery pathways. 

No component in VS7 should have a blast radius that affects the frozen operational control plane (VS6) or interrupts the reader's ability to browse published stories.

---

## 2. Failure Domain Breakdown

### 2.1. Domain FD-1: Reader Correction Submission Subsystem
- **Failure Modes:**
  1. *Spam Flood / DoS:* Malicious bot storms submitting thousands of corrections per minute.
  2. *Database Down / Degraded:* Supabase connection pool exhaustion or timeout during submission insert.
  3. *PII Exposure:* Accidental logging or leak of submitter email address.
- **Blast Radius:**
  - **Isolated to:** `/api/corrections/submit` and the reader submission drawer.
  - **Does NOT affect:** Story reading, navigation, search, operational control plane, or existing CMS routes.
- **Detection Mechanism:**
  - HTTP 429 spike alerts, 5xx rate monitoring on correction submission route.
- **Containment & Fallback:**
  - Fail-soft UI: If database is unreachable, submission form displays polite temporary message ("Unable to record correction right now; please try again shortly").
  - Submitter email is stripped from application log outputs; only submission UUID and story slug are logged.

---

### 2.2. Domain FD-2: Automated Gold Standard Review Engine
- **Failure Modes:**
  1. *Evaluation Timeout / Infinite Loop:* Complex graph traversal hanging during pre-publication check.
  2. *False Negative Blockage:* Strict density or defensibility thresholds blocking legitimate urgent updates.
  3. *Missing Metadata:* Incomplete story JSON causing evaluation crash.
- **Blast Radius:**
  - **Isolated to:** Editorial publishing workflow in `/cms`.
  - **Does NOT affect:** Already published stories on the public edge or reader runtime.
- **Detection Mechanism:**
  - Automated test suite `test:gold-standard`, structured error outputs in CMS review panel.
- **Containment & Fallback:**
  - Deterministic pure function execution: `evaluateGoldStandardPass()` operates without network calls or external IO.
  - Clear breakdown report: The engine outputs specific failing criteria (e.g. "Phase 6 failed: 42/50 claims present") so editors know exactly what needs remediation.

---

### 2.3. Domain FD-3: Public Errata & Transparency Log
- **Failure Modes:**
  1. *Broken Foreign Keys:* An errata record references a story or claim that was archived.
  2. *Rendering Crash:* Malformed HTML or unescaped markdown in `explanation` field.
- **Blast Radius:**
  - **Isolated to:** `/transparency/corrections` page.
  - **Does NOT affect:** Primary story reading (`/series/*`, `/stories/*`).
- **Detection Mechanism:**
  - Static build validation, React ErrorBoundary wrapping the errata table.
- **Containment & Fallback:**
  - React ErrorBoundary renders graceful fallback message.
  - Foreign key constraint `ON DELETE SET NULL` on `story_id` and `claim_id` prevents query crashes.

---

### 2.4. Domain FD-4: Volume I, Chapter 1 Content Rendering
- **Failure Modes:**
  1. *Hydration Mismatch:* Non-deterministic dates or browser-specific rendering in complex visual blocks.
  2. *Missing Citation Anchor:* Jump-link referencing a source footnote that was re-indexed.
- **Blast Radius:**
  - **Isolated to:** Chapter 1 page view.
- **Detection Mechanism:**
  - Next.js build-time prerender check (1,129 routes cleanly prerendered), Vitest chapter rendering suite.
- **Containment & Fallback:**
  - Static site generation guarantees immutable HTML on edge CDN. Any build failure halts CI prior to deployment.

---

## 3. Blast Radius Summary Matrix

| Subsystem | Max Blast Radius | Impact on Public Readers | Impact on Mission Control (VS6) | Recovery Time |
| :--- | :--- | :--- | :--- | :--- |
| **Reader Corrections API** | Submission form only | None (form temporarily unavailable) | None | Immediate (rate-limit drop) |
| **Gold Standard Gate** | Draft publication in CMS | None | None | Instant (remedy content in CMS) |
| **Errata Transparency Page** | `/transparency/corrections` | None on story reading | None | < 5 minutes |
| **Chapter 1 Rendering** | Single chapter route | Potential display error caught at build | None | Immediate (rollback build) |
