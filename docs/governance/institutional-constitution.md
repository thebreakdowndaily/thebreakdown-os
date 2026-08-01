# THE BREAKDOWN KNOWLEDGE PLATFORM — INSTITUTIONAL GOVERNANCE SYSTEM (v1.0 Frozen)
## The Supreme Institutional Framework, Constitutions, and Operating Architecture

**Document Status:** Frozen & Approved Master Institutional Constitution (v1.0)  
**Location:** `docs/governance/institutional-constitution.md`  
**Governance Scope:** Universal institutional governance across Public Mission, Editorial Independence, Data Integrity, Platform Architecture, Engineering, Design, AI, and Organizational Roles.  

---

# SECTION 1: INSTITUTIONAL PURPOSE & CONSTITUTIONAL HIERARCHY

### 1.1 Mission Statements
* **Public Mission Statement (External):**  
  > *"Transforming complex public affairs into structured, verifiable understanding."*
* **Internal Operating Vision (Architectural Metaphor):**  
  > *"The Knowledge Operating System for Evidence-Based Public Affairs."*

### 1.2 Constitutional Precedence & Conflict Resolution Hierarchy
When provisions between domain constitutions or engineering proposals conflict, the following **Immutable Hierarchy of Precedence** applies:

$$\text{Institutional (L0)} \succ \text{Editorial (L1)} \succ \text{Knowledge (L2)} \succ \text{Platform (L3)} \succ \text{Design (L4)} \succ \text{Engineering (L5)} \succ \text{AI (L6)}$$

---

# SECTION 2: THE INSTITUTIONAL CONSTITUTION (LEVEL 0)

### 2.1 Public Purpose & Charter
The Breakdown is an independent knowledge institution dedicated to democratic literacy, historical context, and evidence-first journalism. It operates in the public interest, free from commercial clickbait algorithms or partisan influence.

### 2.2 Editorial Independence & Funding Integrity
1. **Absolute Firewall:** Financial supporters, donors, or subscribers exercise zero influence over editorial coverage, claim verification, or historiographical assessments.
2. **Conflict of Interest Policy:** All researchers, editors, and engineers must declare financial or political conflicts of interest. No contributor may report on entities in which they hold a direct financial stake.
3. **Funding Transparency:** Institutional funding sources, major grants, and institutional sponsorships are published transparently on the public site.

---

# SECTION 3: ORGANIZATIONAL ROLES & DECISION RIGHTS (RACI)

| Operational Area | Editor-in-Chief | Managing Editor | Research Lead | Verification Lead | Knowledge Architect | Platform Lead | AI Lead |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Institutional Mission** | **A / R** | C | C | C | C | C | C |
| **Gold Standard Review Pass** | **A** | R | C | **R** | C | I | I |
| **Claim & Evidence Registry** | C | C | **R** | **A / R** | C | I | I |
| **Knowledge Graph Schema** | C | I | C | C | **A / R** | C | I |
| **Public UX & Density** | C | C | I | I | C | **A / R** | I |
| **AI Boundary Enforcement** | C | I | I | C | C | C | **A / R** |

*(Key: **A** = Accountable, **R** = Responsible, **C** = Consulted, **I** = Informed)*

---

# SECTION 4: DATA GOVERNANCE & LIFECYCLE ARCHITECTURE

1. **Provenance Ledger:** Every primary source document receives a SHA-256 cryptographic hash and permanent archive reference.
2. **Correction Propagation Engine:** When a factual claim is updated, the change automatically propagates to all dependent story views, timelines, and search indexes with a public change log.
3. **Retention & Immutable Versioning:** Historical snapshots of published chapters are preserved permanently.
4. **Open Access & Licensing:** Public Knowledge Objects are published under Creative Commons Attribution-NonCommercial 4.0 (CC-BY-NC-4.0).
5. **Zero Reader Tracking Privacy:** The Reader Product collects zero personally identifiable tracking data.

---

# SECTION 5: DOMAIN CONSTITUTIONS (LEVELS 1 – 6)

### 5.1 Editorial Constitution (Level 1)
- **Evidence Spine Standard:** Factual assertions must link to verified evidence in the Claim Registry.
- **Content Boundaries:** Clear operational separation between *Reporting*, *Explanation*, *Analysis*, and *Opinion*.

### 5.2 Knowledge Constitution (Level 2)
- **7-Step Knowledge Pipeline:** $\text{Entity} \rightarrow \text{Observation} \rightarrow \text{Claim} \rightarrow \text{Evidence} \rightarrow \text{Source} \rightarrow \text{Publication} \rightarrow \text{Projection}$
- **8-Tier Evidence Hierarchy:** Ranging from *Tier 1: Primary Archival Source* to *Tier 8: Expert Analysis*.

### 5.3 Platform Constitution (Level 3)
- **5-Product Architecture:** Reader Product, Editorial Studio, Research Platform, Admin Console, Platform Infrastructure.
- **4-Tier Visibility Framework:** `PUBLIC-INDEXED`, `PUBLIC-UNINDEXED`, `AUTHENTICATED`, `INTERNAL`.

### 5.4 Design System Constitution (Level 4)
- **Principles vs. Policies Separation:** Principles are immutable; numerical thresholds reside in versioned Policy Documents.
- **Progressive Disclosure:** 4-layer depth engine (*Headline $\rightarrow$ Summary $\rightarrow$ Evidence Drawer $\rightarrow$ Research Mode*).

### 5.5 Engineering Constitution (Level 5)
- **5-Layer Architecture:** Knowledge $\rightarrow$ Editorial $\rightarrow$ Projection $\rightarrow$ Experience $\rightarrow$ Delivery.
- **Failure Modes & Anti-Patterns:** Enforces build breaks on incomplete narrative, data duplication, bypassed verification, cognitive overload, or accessibility failures.

### 5.6 AI Governance Constitution (Level 6)
- **Human-in-the-Loop Mandate:** AI assists with summarization and tagging; human editors retain sole authority over publication. AI never fabricates evidence.

---

# SECTION 6: REPOSITORY CONSTITUTION & CODEBASE ARCHITECTURE

```
c:\newsjack-content\thebreakdown-os\
├── app/                  # Next.js 15 Routes (Projections only)
│   ├── (public)/         # Public Reader Product (Indexed & Unindexed)
│   ├── editorial/        # Editorial Studio & CMS (Auth Required)
│   ├── research/         # Research Platform & Graph Tools (Auth Required)
│   └── admin/            # Admin Console & Ops (Internal Auth)
├── components/           # UI Components (Pure Renderers)
├── services/             # Business Logic & Service Layer
├── lib/                  # Graph Engine, Event Bus, Utilities
├── types/                # Canonical Types (types/canonical.ts)
├── docs/                 # Platform Documentation & ADRs
│   ├── governance/       # Frozen Institutional Constitutions
│   ├── adr/              # Architecture Decision Records (ADR-001+)
│   └── rfc/              # Request for Comments
└── tests/                # Automated Test Suites
```

---

# SECTION 7: INSTITUTIONAL RISK GOVERNANCE

| Risk Category | Risk Owner | Mitigation Strategy | Review Cadence |
| :--- | :--- | :--- | :--- |
| **Factual Misinformation** | Verification Lead | Mandatory 7-Phase Gold Standard Review. | Per Published Chapter |
| **Legal / Defamation** | Managing Editor | Pre-publication legal audit on sensitive claims. | Per Investigation |
| **AI Misattribution / Hallucination** | AI Governance Lead | Automated claim verification test against hash ledger. | Continuous CI/CD |
| **Cybersecurity / Data Breach** | Platform Lead | Supabase RLS, Cloudflare WAF, secret scanning. | Monthly Audit |
| **System Outage / Data Loss** | Platform Lead | Multi-region database backups. | Quarterly DR Test |
| **Cognitive Overload / Bloat** | Knowledge Architect | Information Density Budget audits. | Quarterly Review |

---

# SECTION 8: GOVERNANCE REVIEW CADENCE

* **Annual:** Constitutional Review (Level 0–2)
* **Quarterly:** Policy Review (Performance targets, design tokens, density budgets)
* **Monthly:** Architecture Review (ADR filings, dependency health)
* **Per-Release:** Gold Standard Verification Audit
* **Post-Incident:** Blameless Retrospective

---

**Ratified & Sealed:**  
*Governance Board & Editor-in-Chief — The Breakdown Knowledge Platform*
