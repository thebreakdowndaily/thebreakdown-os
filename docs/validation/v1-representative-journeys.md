# Phase V-1B — Representative Journey Definition

**Governing Standard:** Level 3 Architecture & Conformance Framework  
**Scope:** Canonical Journey Trajectory Mapping for Reader Comprehension Validation  
**Authoritative Reference:** `docs/architecture/governance-index.md`, Editorial Constitution, NOS Volumes I–III, V-1A Baseline (`docs/validation/v1-narrative-validation-baseline.md`)  
**Date:** 28 July 2026  
**Status:** PHASE V-1B COMPLETE

---

## 1. Overview & Selection Principles

Phase V-1B defines **five representative reader journeys** derived strictly from published canonical content within Volume I (*Foundations of Strategic Autonomy 1947–1962*) and the Core Launch Corpus.

No test content was fabricated. Each journey represents a distinct cognitive entry pattern, starting intent, and learning objective.

---

## 2. The 5 Representative Validation Journeys

### Journey A — Curious New Reader (Guided Narrative Entry)

```text
Homepage (/) ──► Question ──► Story World ──► Investigation ──► Story ──► Evidence ──► Reflection
```

- **Starting Intent:** General curiosity about India's strategic foreign policy origins.
- **Central Question:** *"Why did India choose Non-Alignment during the early Cold War?"*
- **Canonical Objects Involved:**
  - Collection: `foundations-1947-1962`
  - Volume: `the-nehruvian-era`
  - Chapter: `chapter-1` (`indias-inheritance`) & `chapter-7` (`belgrade-1961`)
  - Claims: `CLM-1947-001`, `CLM-1961-002`
- **Critical Evidence:** Primary diplomatic correspondence, 1961 Belgrade Summit declarations, 1954 Panchsheel Agreement.
- **Expected Understanding:** The reader understands that Non-Alignment was an assertion of sovereign strategic autonomy, not passive neutrality or ideological isolation.
- **Expected Uncertainty:** Acknowledging historiographical debate over whether Non-Alignment sacrificed defence preparedness prior to 1962.
- **Possible Misconceptions:** Confusing Non-Alignment with passive pacifism or anti-Western bias.
- **Required Reader Choices:** Transitioning from 4-scene homepage trailer to Story World volume, expanding split-view Evidence Drawer, completing post-story reflection.
- **Accessibility Considerations:** Screen-reader landmark navigation, high contrast text (18:1 ratio), `prefers-reduced-motion` compliance.
- **Success Criteria:** Reader can correctly state the core strategic rationale of Non-Alignment and identify 2 supporting primary sources.

---

### Journey B — Direct Search Reader (Un-Scaffolded Inquiry Entry)

```text
Search (/search?q=MGNREGA) ──► Claim / Story / Entity ──► Evidence ──► Structural Knowledge
```

- **Starting Intent:** Targeted research on rural employment guarantees and policy reforms.
- **Central Question:** *"What evidence demonstrates the fiscal and welfare impact of MGNREGA?"*
- **Canonical Objects Involved:**
  - Story: `mgnrega-reform`
  - Entity: `Ministry of Rural Development`
  - Dataset: `mgnrega-budget-allocation`
  - Claims: `CLM-MGNREGA-01`, `CLM-MGNREGA-02`
- **Critical Evidence:** CAG audit reports, Union Budget allocations (2006–2026), RBI rural wage statistical reports.
- **Expected Understanding:** The reader understands MGNREGA's dual role as a rural safety net and fiscal automatic stabilizer.
- **Expected Uncertainty:** Disagreement on wage leakages vs. asset quality outcomes across states.
- **Possible Misconceptions:** Assuming MGNREGA is a permanent unconditional cash transfer.
- **Required Reader Choices:** Querying search engine, filtering by dataset or story, inspecting confidence scores.
- **Accessibility Considerations:** Accessible search input with ARIA live region results and keyboard arrow selection.
- **Success Criteria:** Reader locates primary audit source within 2 clicks and identifies the confidence classification (`Strong`).

---

### Journey C — Independent Researcher (Analytical Explorer Entry)

```text
Deep Link ──► Story / Claim ──► Evidence ──► Knowledge Graph (/graph) ──► Timeline / Data (/data)
```

- **Starting Intent:** Deep scholarly analysis of trade policy and economic precedents.
- **Central Question:** *"How did early trade agreements shape contemporary strategic partnerships?"*
- **Canonical Objects Involved:**
  - Chapter: `chapter-6` (`bandung-1955`)
  - Graph Nodes: `Bandung Conference`, `Panchsheel`, `Nehru`, `Chou En-lai`
  - Timeline Events: `1954-Panchsheel`, `1955-Bandung`, `1961-Belgrade`
- **Critical Evidence:** 1955 Bandung Final Communiqué, GATT archives, archival transcripts.
- **Expected Understanding:** The reader maps multi-node relationships between Afro-Asian solidarity movements and international law precedents.
- **Expected Uncertainty:** Differing Sino-Indian interpretive frameworks regarding frontier boundaries.
- **Possible Misconceptions:** Believing Bandung was an exclusive military alliance.
- **Required Reader Choices:** Leaving guided narrative via graph explorer node links and timeline filters.
- **Accessibility Considerations:** SVG graph node alternative text tables for screen readers; zero keyboard traps.
- **Success Criteria:** Reader successfully navigates between story, graph node, and timeline without losing spatial breadcrumb context.

---

### Journey D — Returning Reader (Continuity Entry)

```text
Homepage (/) ──► Reader Memory (tb_last_story) ──► Open Question ──► Continuation Node
```

- **Starting Intent:** Resuming a previous multi-session investigation.
- **Central Question:** *"What happened after the Bandung Conference established Afro-Asian principles?"*
- **Canonical Objects Involved:**
  - Memory State: `tb_last_story = 'bandung-1955'`
  - Target Handoff: `chapter-7` (`belgrade-1961`)
  - Section: `NarrativeReflectionBlock`
- **Critical Evidence:** 1961 Belgrade Summit participant records, Non-Aligned Movement charter drafting documents.
- **Expected Understanding:** The reader grasps the institutional evolution from informal conference (1955) to formal movement (1961).
- **Expected Uncertainty:** Evolving Cold War dynamics (Suez crisis, Congo crisis) challenging unity.
- **Possible Misconceptions:** Viewing Belgrade as a simple repetition of Bandung.
- **Required Reader Choices:** Clicking passive "Resume Reading" banner or selecting Open Question continuation link.
- **Accessibility Considerations:** Focus management returning reader to exact article scroll position.
- **Success Criteria:** Reader resumes inquiry at exact point of previous exit without forced re-onboarding.

---

### Journey E — Evidence Verification (Epistemic Audit Entry)

```text
Claim (CLM-1947-001) ──► Evidence Summary ──► Primary Source ──► Provenance Ledger
```

- **Starting Intent:** Fact-checking a disputed historical claim.
- **Central Question:** *"What primary document proves the diplomatic position of India during the 1948 Kashmir UN debate?"*
- **Canonical Objects Involved:**
  - Claim: `CLM-1948-UN-01`
  - Evidence: `EVD-UN-RES-47`
  - Source: `UN Security Council Resolution 47 (1948) Text`
  - Provenance Hash: SHA-256 Ledger Record
- **Critical Evidence:** UN Official Records, Letter from Prime Minister Nehru to UN Commission (1948).
- **Expected Understanding:** The reader can distinguish between documented UN text (Documented Fact) and subsequent political commentary (Interpretation).
- **Expected Uncertainty:** Differing legal interpretations of Resolution 47 preconditions.
- **Possible Misconceptions:** Believing UN Resolution 47 was unconditionally binding without prerequisite withdrawal clauses.
- **Required Reader Choices:** Descending from claim card to primary document viewer and SHA-256 ledger record.
- **Accessibility Considerations:** High-legibility document viewer with scalable text and downloadable plain-text source transcripts.
- **Success Criteria:** Reader identifies Tier 1 primary document source and verifies its cryptographic provenance link.

---

## 3. Transition to Phase V-1C

Phase V-1B is **COMPLETE**. The 5 representative journeys (`Journey A` through `Journey E`) establish concrete, evidence-backed evaluation paths covering new readers, direct searchers, independent researchers, returning readers, and fact-checkers.

**Next Step:** Proceed to **Phase V-1C (Comprehension Instrument Design)** to build the multi-dimensional comprehension evaluation framework.

---

**Certification Clearance:** Phase V-1B certified. Zero production code modified. Representative journeys defined.
