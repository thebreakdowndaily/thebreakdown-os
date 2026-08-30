Current Ticket:
TASK-04

Status:
In Progress

Objective:
Establish the pre-implementation baseline checkpoints for TASK-04 before modifying any code.

Blocked By:
None

Depends On:
TASK-03 — Information Architecture & Growth UX (COMPLETED)

Acceptance Criteria:
✓ audit/task-04/ folder created.
✓ pre-implementation-baseline.md written covering build, tests, route count, navigation, structures, performance, and SEO.

Definition of Done:
Pre-implementation baseline checkpoints recorded.

---

# TASK-04 — PRE-IMPLEMENTATION BASELINE REPORT

Version: 1.0  
Status: Recorded  
Governance Level: 4 (Project Deliverable)  

This document captures the platform's state before beginning the Information Architecture & Growth UX implementation.

---

## 1. Quality & Verification Gates
- **Build Status**: `SUCCESS` (passes next build compilation with zero warnings/errors).
- **Test Status**: `SUCCESS` (53/53 tests pass under `npm test`).
- **Route Count**: Mapped a total of 124 public/dynamic routes:
  - Homepage: 1
  - Index pages: 7
  - Standalone stories: 41
  - Flagship library chapters: 5
  - Topics: 15
  - Entity profiles: 41
  - Fixes: 6
  - Investigations: 1
  - Sub-app routes (UP-403): ~400 (not indexed in main sitemap).

---

## 2. Structural & Layout Checkpoints
- **Current Navigation**: 6 items in primary header (`/stories`, `/investigations`, `/data`, `/fix`, `/topics`, `/series`).
- **Current Homepage Structure**:
  1. Header
  2. Hero (Latest stories/Briefings)
  3. Quick briefings list
  4. Deep analysis section
  5. Topics grid
  6. Newsletter subscription
  7. Footer
- **Current Article Structure**: Eyebrow + H1 + Dek + Bylines + Reading Time + Meta Badges + Orientation Rail (Takeaways, Key numbers) + Body Prose + Timeline + Claims verification panel + Further reading + Footer.
- **Current Topic Structure**: Simple grid list page rendering all story briefings belonging to that topic.

---

## 3. SEO & Performance Baselines
- **Performance**:
  - Desktop Performance Score: `90/100` (Lighthouse)
  - Mobile Performance Score: `65/100` (Lighthouse)
  - Mobile LCP: `3.46s`
  - Average JS Weight: `~480 KB`
  - Average Image Weight: `~620 KB`
  - Total Page Weight: `~1.25 MB`
- **SEO Elements**:
  - Robots.txt: Allow search crawlers to scan `/stories`, `/investigation`, and `/investigations`.
  - Canonicals: Absolute URLs resolving to dynamic routes. Chapter fallbacks permanently redirect (308) to series chapter routes.
  - JSON-LD: Standards-compliant `@context: 'https://schema.org'` and `@type: 'WebPage'` schemas on story articles.
