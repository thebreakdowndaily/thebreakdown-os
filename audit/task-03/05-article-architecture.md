Current Ticket:
TASK-03

Status:
Completed

Objective:
Define the structural layout and content ordering for long-form articles (briefings, explainers, and library chapters).

Blocked By:
None

Depends On:
TASK-02 — Technical SEO, Canonicalization & Evidence Integrity (COMPLETED)

Acceptance Criteria:
✓ Article information hierarchy specified from headline to newsletter signup.
✓ Above-the-fold layout constraints outlined.

Definition of Done:
All article architecture requirements satisfied.

---

# THE BREAKDOWN: ARTICLE INFORMATION ARCHITECTURE

Version: 1.0  
Status: Drafted  
Governance Level: 4 (Project Deliverable)  

This document defines the ideal, progressive-disclosure order of content blocks within all analytical articles published on The Breakdown.

---

## 1. Structural Information Hierarchy

Articles must strictly render content blocks in the following progressive-disclosure sequence:

1.  **Eyebrow Category & Type**: Displays the primary topic (e.g. Geopolitics) and format type (e.g. Briefing).
2.  **Headline**: Bold, high-contrast title (H1) targeting semantic keywords.
3.  **Dek / Summary**: A 1-2 sentence high-level takeaway of the core finding.
4.  **Author Bylines & Timestamps**: Active writer/auditor credits, initial publication date, and the "Last Verified" timestamp (crucial for E-E-A-T).
5.  **Evidence & Trust Bar**: Displays the overall **Evidence Score** and **Completeness Score** badges.
6.  **Orientation / Key Takeaways**: 3-5 high-density bullet points summarising the narrative (derived from `executive-summary`).
7.  **Primary Narrative Blocks**: The core article body comprising paragraphs, sub-headings, quotes, and primary charts.
8.  **Timeline Block**: Inline interactive or static chronological event track.
9.  **Evidence Registry Panel**: Dynamic claim list with verification statuses, claim-level confidence ratings, and linked source citations.
10. **Counterarguments & Dissenting Views**: Explicitly documents alternative interpretations or policy disagreements.
11. **Primary Documents Drawer**: Direct access links and descriptions of primary archival records.
12. **Related Entity Profile Links**: Clickable badges to entities referenced in the story.
13. **Related Topics & Continual Learning Paths**: Cross-linking to related stories and parent topic hubs.
14. **Newsletter Signup**: Inline subscriber prompt.
15. **Full Citations List**: Formal bibliography of cited works.

---

## 2. Viewport-Based Loading Strategy

### Above-the-Fold Experience
The initial viewport load must establish immediate context, value, and trustworthiness:
- **Title and Dek**: Answers "What happened?" and "Why does it matter?"
- **Metadata**: Answers "Who wrote this?" and "When was this verified?"
- **Evidence Badge**: Answers "How do we trust this?"
- **Prose Preview**: The first paragraph of the narrative or the key takeaways bullet list must begin above the fold, encouraging reading behavior.

### Progressive Deep-Dive (Reading Rails)
- Technical details (raw primary documents, citations, and claim audits) are kept at the bottom of the article column or rendered on-demand in the side registry rail to prevent cognitive overload.
- Reading mode triggers (`?mode=quick`, `?mode=deep`) toggle the visibility of supporting details dynamically.
