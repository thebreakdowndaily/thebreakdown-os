Current Ticket:
TASK-03

Status:
Completed

Objective:
Document the current public architecture mapping and compile a severity-categorized problem analysis (P0-P3).

Blocked By:
None

Depends On:
TASK-02 — Technical SEO, Canonicalization & Evidence Integrity (COMPLETED)

Acceptance Criteria:
✓ Current architecture mapped with actual routes and parameter matrices.
✓ IA problem analysis documented and classified by priority (P0-P3).

Definition of Done:
All current IA map and problem analysis requirements satisfied.

---

# THE BREAKDOWN: CURRENT-STATE IA MAP & PROBLEM ANALYSIS

Version: 1.0  
Status: Drafted  
Governance Level: 4 (Project Deliverable)  

This document details the current public routing architecture of The Breakdown and analyzes its informational gaps, duplicate structures, and structural barriers to discovery and authority.

---

## 1. Route Mapping Registry

The public and gated routes currently deployed on the production platform resolve to the following structures:

| Route Type | Example / Pattern | Purpose | Indexable | Canonical Tag | User Value | SEO Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Homepage** | `/` | Editorial landing and briefings dashboard | Yes | Absolute (`/`) | High (overview of latest briefings & hot topics) | High (root authority page) |
| **Stories Index** | `/stories` | List of all published briefings and explainers | Yes | Absolute (`/stories`) | Medium (chronological feed of articles) | High (internal link hub) |
| **Topic Index** | `/topics` | List of all subject areas (e.g. economy, tech) | Yes | Absolute (`/topics`) | Medium (categorical taxonomy map) | High (silo directory page) |
| **Topic Hub** | `/topic/[slug]` | Dedicated landing page for a specific subject | Yes | Absolute (`/topic/[slug]`) | High (deep explore by topic) | Very High (topical authority landing) |
| **Entity Index** | `/entities` | Alphabetical list of entities (people, policies) | Yes | Absolute (`/entities`) | Medium (index directory) | High (directory page index) |
| **Entity Profile** | `/entity/[slug]` | Profile tracking statements, relationships, timeline | Yes | Absolute (`/entity/[slug]`) | High (cross-referenced details of actors) | Very High (knowledge graph landing) |
| **Series Directory** | `/series` | Browse collections and volumes | Yes | Absolute (`/series`) | High (curated series paths) | Medium (index directory) |
| **Series Page** | `/series/[collectionSlug]` | Specific flagship collection detail | Yes | Absolute (`/series/[collSlug]`) | High (volume tracking index) | Medium (silo directory) |
| **Volume Page** | `/series/[collSlug]/volume/[volSlug]` | Volume chapter collection detail | Yes | Absolute (`/series/.../volume/...`) | High (ordered book structure) | Medium (deep thematic link hub) |
| **Chapter Page** | `/series/.../volume/.../chapter/[slug]` | Long-form canonical textbook chapter | Yes | Absolute (`/series/.../chapter/[slug]`) | Very High (definitive evidence-backed text) | Very High (evergreen authority landing) |
| **Legacy Chapter** | `/story/[slug]` (for library chapters) | Duplicate story shell entry | No | Absolute (points to series path) | Low (redirects permanently to series URL) | Zero (redirect handler) |
| **Standalone Story**| `/story/[slug]` (for non-library stories) | Briefing or standalone data explainer | Yes | Absolute (`/story/[slug]`) | Very High (short-form context on current events) | Very High (targeted search landing) |
| **Fix Solution** | `/fix/[slug]` | Analysis of systemic solutions | Yes | Absolute (`/fix/[slug]`) | High (actionable policy solutions) | High (long-tail keywords) |
| **Trust Dashboard** | `/trust` | Live platform trust statistics and correction logs | Yes | Absolute (`/trust`) | High (transparency on editorial metrics) | Very High (E-E-A-T trust signal) |
| **Methodology** | `/methodology` | Sourcing, fact audits, and confidence guidelines | Yes | Absolute (`/methodology`) | High (understanding verification standards) | Very High (E-E-A-T trust signal) |
| **Constitution** | `/editorial-constitution` | Editorial standards and ethics policy | Yes | Absolute (`/editorial-constitution`) | High (principles document) | Very High (E-E-A-T trust signal) |
| **Data Playground**| `/data` | Open-source research packages and download portal | Yes | Absolute (`/data`) | High (structured CSV/JSON downloads) | High (deep-tech links) |
| **Investigations** | `/investigations` | Archive of original investigations | Yes | Absolute (`/investigations`) | Medium (simple list of deep-dives) | Medium (indexing) |
| **Sub-App** | `/up403` | UP legislative and constituency coverage sub-site | Yes | Absolute (`/up403`) | Very High (localized election telemetry) | High (regional target search) |

---

## 2. Information Architecture Problem Analysis

Based on repository discovery and baseline statistics, we identify the following structural problems in the current architecture:

### P0: Duplicate Route Overhead & Crawler Dilution (Critical)
- **Problem**: Prior to TASK-02, long-form textbook chapters were accessible through both `/story/[chapterSlug]` and `/series/[collSlug]/volume/[volSlug]/chapter/[chapterSlug]`. While the 308 permanent redirect resolved this on the server side, search engines still have both paths in historical indices.
- **Impact**: Dilutes link equity and crawl efficiency.

### P1: Weak Cross-Referencing & Discovery Gaps (High)
- **Problem**: The connection between standalone stories (e.g. UPI boom, Fasal Bima) and canonical series (e.g. India and the World) is almost non-existent. A user reading a story does not get a clear bridge into the deeper textbook chapters of the same subject.
- **Impact**: High bounce rates (~68% on mobile) and low pages/session (1.4).

### P1: Empty and Low-Value Index Directories (High)
- **Problem**: The `/countries` page contains simple bullet lists of countries, and `/organizations` lists institutional nodes with minimal content. These directories function as shallow landing pages.
- **Impact**: dilutes crawl value and fails search engine quality guidelines (thin content).

### P2: Confusing Content Types & Nomenclature Mismatch (Medium)
- **Problem**: The term "Library" (`/series`) conflicts with "Stories" (`/stories`) and "Investigations" (`/investigations`). The user does not easily understand the difference between a standalone briefing story, an investigation, and a textbook chapter.
- **Impact**: Cognitive load on new visitors.

### P2: Orphaned Entity Profiles (Medium)
- **Problem**: Several entities mapped in the database have no associated story links or contextual descriptions. Clicking these profiles leads to thin, dashboard-like pages with empty tables.
- **Impact**: Poor user experience and index bloat.

### P3: Hidden Deep Resources (Low)
- **Problem**: Excellent resources such as the "Trust Dashboard" (`/trust`), "Data Playground" (`/data`), and "Methodology" (`/methodology`) are buried in footer menus, making them invisible to the general audience.
- **Impact**: Fails to project the platform's E-E-A-T superiority.
