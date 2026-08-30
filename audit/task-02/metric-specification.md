Current Ticket:
TASK-02

Status:
Completed

Objective:
Define the metric taxonomy and calculation models for Evidence Score and Completeness Score to prevent naming conflicts and metrics discrepancies.

Blocked By:
None

Depends On:
Frozen MVP Specification v1.1

Acceptance Criteria:
✓ Metric taxonomy written for Evidence Score.
✓ Metric taxonomy written for Article Completeness.
✓ Calculation models defined and documented.

Definition of Done:
All acceptance criteria satisfied.
No scope expansion.

---

# THE BREAKDOWN: EVIDENCE & COMPLETENESS METRIC SPECIFICATION

Version: 1.0  
Status: Ratified Specification  
Governance Level: 4 (Project Specification)  

This document defines the semantic definitions, calculations, sources, and labeling rules for the core trust and layout metrics rendered to readers across The Breakdown platform. Every metric visible in the user interface must conform to this taxonomy to prevent conflicting nomenclature.

---

## 1. Evidence Score (Manual / Peer-Reviewed)

### Semantic Definition
The overall trust rating representing the authority, diversity, and reliability of the sources backing the facts in a story. It is a qualitative editorial score assigned after rigorous peer review and fact auditing.

### Source
`Story.evidenceScore` (retrieved from the metadata payload in `store.ts` or database row).

### Calculation
Calculated manually by the Editorial Board during the **Gold Standard Review** using the evidence tier weightings:
- Tier 1 & 2 Sources (Primary/Government): 100% weight
- Tier 3 & 4 Sources (Court/Peer-reviewed): 85% weight
- Tier 5 & 6 Sources (Secondary/Eyewitness): 50% weight
- Unverified Claims: 0% weight

### Audience Meaning
"How reliable and authoritative are the facts behind this narrative?" A score of 90%+ indicates the story relies on verified primary archival or official government records.

---

## 2. Article Completeness (CS - Computed)

### Semantic Definition
A structural metric representing the density of layout and trust elements (timelines, charts, claims, citations, FAQ blocks, hero assets) present in the article. It measures completeness of presentation, not factual truth.

### Source
`qualityScore.score` (computed dynamically at build/runtime by the `QualityBuilder` pipeline stage).

### Calculation
Calculated programmatically as an checklist of required blocks in the pipeline:
- Timeline block present: +25%
- Claim citations verified: +25%
- Interactive chart or dataset block present: +20%
- FAQ blocks present: +15%
- Structured metadata & hero image present: +15%
- Max score: 100%

### Audience Meaning
"How thoroughly documented and feature-rich is this article's presentation?" A score of 80%+ indicates the page provides interactive timeline explorations, citations, and data visualizations alongside the narrative text.

---

## 3. UI Implementation Standards
- **Labeling**: The manual editorial metric must be labeled as **"Evidence Score"** or **"Confidence"** (never "Quality Score").
- **Badge Representation**: Mapped using `<Badge variant="evidence">`.
- **Completeness Metric**: The programmatically calculated score must be labeled as **"Completeness Score"** or **"CS"** (never "QS" or "Quality Score").
