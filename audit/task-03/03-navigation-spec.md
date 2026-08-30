Current Ticket:
TASK-03

Status:
Completed

Objective:
Design and spec the primary navigation menu layout to maximize search indexing, clear taxonomy discovery, and mobile accessibility.

Blocked By:
None

Depends On:
TASK-02 — Technical SEO, Canonicalization & Evidence Integrity (COMPLETED)

Acceptance Criteria:
✓ Navigation structure options evaluated (Option A, Option B, and Option C).
✓ One structure chosen and fully spec'd with SEO and mobile layout considerations.

Definition of Done:
All navigation design requirements satisfied.

---

# THE BREAKDOWN: PRIMARY NAVIGATION SPECIFICATION

Version: 1.0  
Status: Drafted  
Governance Level: 4 (Project Deliverable)  

This document evaluates the navigation architectures for The Breakdown and defines the chosen layout to optimize session depth and crawl accessibility.

---

## 1. Evaluation of Options

### Option A: The Archive Model
`Topics` | `Explainers` | `Investigations` | `Data` | `Documents`
- **Pros**: Matches traditional publishers. Highly descriptive of document categories.
- **Cons**: Explainer vs. Investigation is an editorial distinction that readers often fail to distinguish. "Documents" page sounds dry and academic to first-time visitors.

### Option B: The Magazine Model
`Topics` | `Latest` | `Deep Dives` | `Data` | `Knowledge`
- **Pros**: High-impact editorial branding. Clear hierarchy.
- **Cons**: "Knowledge" is highly ambiguous. Dilutes SEO keyword targeting since "Latest" and "Deep Dives" do not carry semantic topical value.

### Option C: The Reader-Centric Silo Model (Selected)
`Topics` | `Briefings` | `Library` | `Data` | `Trust`
- **Pros**: Highly descriptive. 
  - **Topics**: Explores category silos.
  - **Briefings**: Replaces "Stories" to denote timely, structured reports on current issues.
  - **Library**: Replaces `/series` to represent authoritative historical volumes and books.
  - **Data**: Signals transparency and raw resource access (`/data`).
  - **Trust**: Highlights our verification metrics (`/trust`), establishing immediate E-E-A-T.
- **Cons**: Requires mapping legacy URLs to support the new terminology.

---

## 2. Selection Rationale: Option C
We selected **Option C** because it matches the platform's core identity as a **Knowledge Operating System** rather than a news site.
- **Topical Siloing**: Grouping content under "Topics" and "Library" creates structured, thematic link nests, boosting SEO topical authority.
- **E-E-A-T Prominence**: Elevating "Trust" directly to primary navigation highlights our fact-checking and source-verification methods.
- **Logical Differentiation**: Users immediately understand that "Briefings" are current and short, whereas "Library" contains definitive textbook chapters.

---

## 3. Navigation Schema Map

```text
DESKTOP HEADER
├── Logo (Links to /)
├── Navigation Links:
│     ├── Topics (href: /topics) ──> Sub-menu panel: Geopolitics, Economy, Policy, Tech
│     ├── Briefings (href: /stories) ──> Chronological list of standalone reports
│     ├── Library (href: /series) ──> Flagship historical volumes directory
│     ├── Data (href: /data) ──> Datasets and methodology playground
│     └── Trust (href: /trust) ──> Facts audited, accuracy logs, constitution
└── Unified Search Bar (Integrated component)

MOBILE NAVIGATION TRAY
├── Collapsible hamburger trigger
├── Primary Links: Topics, Briefings, Library, Data, Trust
└── Quick Links: Sourcing Methodology (/methodology), Editorial Constitution (/editorial-constitution)
```

---

## 4. Accessibility & SEO Compliance
1. **Semantic Markup**: Deployed inside `<nav aria-label="Primary navigation">` with `role="banner"` on header shell.
2. **Keyboard Focus**: Focus ring outlines (`focus-visible:ring-2`) on all interactive link states.
3. **Internal Link Equity**: Search crawlers can access all primary taxonomy indexes directly from the HTML header source of every page.
