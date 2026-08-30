Current Ticket:
TASK-03

Status:
Completed

Objective:
Specify the proposed homepage sections, content sources, and above-the-fold layout constraints.

Blocked By:
None

Depends On:
TASK-02 — Technical SEO, Canonicalization & Evidence Integrity (COMPLETED)

Acceptance Criteria:
✓ Proposed homepage information hierarchy specified section by section.
✓ Section characteristics (purpose, source, items, SEO/retention values) mapped to tabular layout.

Definition of Done:
All homepage architecture requirements satisfied.

---

# THE BREAKDOWN: HOMEPAGE ARCHITECTURE SPECIFICATION

Version: 1.0  
Status: Drafted  
Governance Level: 4 (Project Deliverable)  

This document details the layout structure, information hierarchy, and content sourcing rules for the revamped homepage of The Breakdown.

---

## 1. Homepage Section Specification

| Section Name | Purpose | Content Source | Number of Items | Primary User Action | SEO Value | Retention Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01. Hero / What Matters** | Highlight the most significant national or historical policy analysis. | Curated lead briefing or chapter update. | 1 primary + 2 secondary | Read Lead Article | High H1 and topical keyword concentration | High (establishes site credibility) |
| **02. Latest / What Changed** | Show developing stories and recent policy changes. | Dynamic feed of new briefings. | 3 grid items | Click Briefing | High fresh-content signal | High (shows platform activity) |
| **03. Deep Analysis** | Highlight evergreen explainers and investigations. | Mapped stories categorized as `explainer`/`investigation`. | 3 horizontal cards | Explore Deep Dive | Keyword targeting for "Explainers" | High (session depth booster) |
| **04. Flagship Library** | Expose volumes and chapters from canonical history series. | Mapped library collection registry. | 2 volumes + chapters | Browse Library | Internal linking to deep canonical subroutes | Very High (encourages structured study) |
| **05. Explore by Topic** | Direct users into thematic topic hubs. | Topic registry data (e.g. Economy, Geopolitics). | 4 top tier topic cards | View Topic | Anchor link text for categories | Medium (helps navigation) |
| **06. Verified Evidence Ticker**| Show live claim audits and source metrics. | Claim registry and trust dashboard feed. | Live ticker + 3 claims | Verify Claim | E-E-A-T trust signals (schema proof) | Very High (core differentiator) |
| **07. Newsletter Hook** | Capture returning readers and newsletter subscribers. | Static inline input form. | 1 input block | Subscribe | Zero | Critical (direct email audience acquisition) |

---

## 2. Scroll-Depth Layout Strategy

### Above the Fold (Viewport Entry)
- **Content**: Desktop Header (with search) + **Section 01 (Hero / What Matters)**.
- **Constraints**: Headline, category badge, and Evidence Score must be visible on standard viewports without scrolling. Prompts immediate engagement with the primary editorial topic.

### First Scroll (Comprehension & Activity)
- **Content**: **Section 02 (Latest / What Changed)** + **Section 03 (Deep Analysis)**.
- **Constraints**: Establishes that the site is active and fresh, while immediately displaying our signature deep policy explainers.

### Middle Scroll (Structured Navigation)
- **Content**: **Section 04 (Flagship Library)** + **Section 05 (Explore by Topic)**.
- **Constraints**: Redirects the reader from casual browsing into structured knowledge frameworks (Library series and Topic silos).

### Bottom Scroll (Verification & Retention)
- **Content**: **Section 06 (Verified Evidence Ticker)** + **Section 07 (Newsletter Hook)**.
- **Constraints**: Reinforces trust right before the page terminates, leaving the reader with a clear call to action to subscribe for updates.
