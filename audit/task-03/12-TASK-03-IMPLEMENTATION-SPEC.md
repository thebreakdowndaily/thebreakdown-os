Current Ticket:
TASK-03

Status:
Completed

Objective:
Define the engineering and product handoff specification for the information architecture and growth foundation implementation.

Blocked By:
None

Depends On:
TASK-02 — Technical SEO, Canonicalization & Evidence Integrity (COMPLETED)

Acceptance Criteria:
✓ 12-TASK-03-IMPLEMENTATION-SPEC.md compiled and verified.
✓ Components, route changes, data models, schema, and risks documented.

Definition of Done:
All implementation handoff requirements satisfied.

---

# TASK-03 — INFORMATION ARCHITECTURE & GROWTH UX: ENGINEERING HANDOFF

Version: 1.0  
Status: Completed  
Governance Level: 4 (Project Deliverable)  

---

## 1. Route Mapping & Validation
No changes are made to the routing structure. We continue to run the canonical routes established in TASK-02:
- Standalone stories: `/story/[slug]`
- Textbook chapters: `/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]`
- Legacy chapter redirects: `/story/[chapterSlug]` redirects via permanent 308 inside `app/story/[slug]/page.tsx`
- Topic Hubs: `/topic/[slug]`
- Entity Profiles: `/entity/[slug]`

---

## 2. Navigation Changes
### Component: `components/layout/Header.tsx`
- **Action**: Replace the `navLinks` list to support the new terminology (Option C):
  ```typescript
  const navLinks = [
    { label: "Topics", href: "/topics" },
    { label: "Briefings", href: "/stories" },
    { label: "Library", href: "/series" },
    { label: "Data", href: "/data" },
    { label: "Trust", href: "/trust" }
  ];
  ```
- **Mobile Menu**: Keep hamburger toggle. Ensure secondary links (Methodology, Constitution) are stacked cleanly in the drawer under Quick Links.

---

## 3. Component Hierarchy Adjustments
### Homepage Structure (`app/page.tsx`)
In the upcoming implementation phase, adjust the section rendering order to match the homepage specifications:
1.  **Header Component**
2.  **Lead Hero Section** (renders curated briefing/chapter update)
3.  **Latest Briefings Feed** (gridded cards, 3 items max)
4.  **Deep Analysis Vertical** (explainer/investigation cards)
5.  **Flagship Library Directory** (volume mapping lists)
6.  **Topics Grid**
7.  **Evidence Ticker Widget**
8.  **Newsletter Subscriber Card**
9.  **Footer Component**

### Article Layout (`app/story/[slug]/page.tsx` & `components/rxs/StoryShell.tsx`)
- Keep progressive disclosure: hide primary citations and evidence metadata behind mode selections or place them below the fold.
- Bylines must display `Last Verified: [Date]` dynamically using the story's update timestamp.

---

## 4. Data-Model Integrity & Eligibility
To prevent thin content generation, update the profile loader logic:
- Profile page file: `app/entity/[slug]/page.tsx`
- **Rule**: Load and render profile if `entity.publications.length >= 2` or if `entity.customSummary` is defined. If eligibility is not met, return `notFound()`.

---

## 5. Schema & SEO Specifications
- All indexable articles and pages must append JSON-LD schemas matching standard `https://schema.org` syntax.
- Custom/proprietary schemas are disallowed. Standard WebPage and NewsArticle mappings must be populated dynamically inside `lib/seo/jsonld-story.ts`.

---

## 6. Migration and Risks
- **Link dilution**: Verify that search engines do not hit 404 pages during redirect resolution of legacy URLs.
- **Mobile rendering performance**: Check that tables and horizontal timeline components do not cause horizontal layout overflows on mobile viewports.
