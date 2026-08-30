Current Ticket:
TASK-03

Status:
Completed

Objective:
Define internal linking rules and outline an orphan-content remediation strategy.

Blocked By:
None

Depends On:
TASK-02 — Technical SEO, Canonicalization & Evidence Integrity (COMPLETED)

Acceptance Criteria:
✓ Internal linking rules documented for all page types.
✓ Orphan content strategy outlined based on website inventory.

Definition of Done:
All linking specification requirements satisfied.

---

# THE BREAKDOWN: INTERNAL LINKING SPECIFICATION

Version: 1.0  
Status: Drafted  
Governance Level: 4 (Project Deliverable)  

This document defines the topological linking matrix and orphan-remediation guidelines to optimize search bot crawler navigation and internal PageRank distribution.

---

## 1. Topological Linking Matrix

The relationship between pages must obey these strict inbound and outbound rules to form a coherent crawl path:

| Page Type | Outbound Linking Rules | Inbound Linking Rules |
| :--- | :--- | :--- |
| **Homepage** | Must link to: Lead Story, latest 3 briefings, top 4 topic hubs, and trust dashboard. | Linked to from: Brand logo in header, footer home links of all subpages. |
| **Topic Hub** | Must link to: Top 3 explainers, 5 latest briefings, 5 main entities, and parent index `/topics`. | Linked to from: Header nav dropdown, category badges on articles, and entity hubs. |
| **Briefing / Story** | Must link to: Primary topic hub, referenced entity profiles, related articles (3), and citations. | Linked to from: Homepage, index `/stories`, topic hubs, and referenced entity profiles. |
| **Chapter** | Must link to: Series index, current volume, next/previous chapters, entities, and citations. | Linked to from: Series page, volume page, next/previous chapter buttons, and related stories. |
| **Entity Profile** | Must link to: Associated topic hubs, linked primary documents, and all referencing articles. | Linked to from: Entity index, articles containing the entity, and related entities. |
| **Primary Document**| Must link to: Referring claim/article, and citing entity profile. | Linked to from: Evidence panels, article citation lists, and entity profile lists. |

---

## 2. Orphan-Content Remediation Strategy

Based on the TASK-01 and TASK-02 audit inventories, we define the following remediation strategies:

### Category 1: Articles Without Topic Links (Orphan Articles)
- **Status**: 0 articles found without topic links. Every story has an assigned `category` (which maps to a topic).
- **Rule**: If a story is uploaded without a category, it must fall back to the `general` category and link to the `/topics` index page.

### Category 2: Entities Without Stories (Orphan Entities)
- **Status**: Mapped entities that are defined in `entities` database but have no story associations (e.g. minor policy boards or specific sub-committees).
- **Rule**: Do not publish standalone profiles for entities carrying 0 story links. These profiles must return a `404 Not Found` or remain unpublished draft schemas. To index them, they must have at least one valid story reference.

### Category 3: Documents and Timelines Without Linked Stories
- **Status**: Dynamic timelines and documents that are parsed but not rendered on a primary article.
- **Rule**: All timeline events and primary document metadata must exist as dependent nodes of a parent article. They are not indexable as standalone pages unless they are integrated as a child of a `Story` or `Chapter`.

### Category 4: Series/Chapters Lacking Standalone Links
- **Status**: Library chapters are linked inside `/series/...` routes but not cross-referenced in standard story views.
- **Rule**: Add a "Historical Context" widget in the sidebar of standalone briefings that automatically query and display chapters in the Library covering similar subjects or entities.
