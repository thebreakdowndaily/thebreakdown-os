# THE BREAKDOWN
## Frontend Product Specification (FPS) v1.0
**Knowledge-First Intelligence Platform**

---

## 1. Vision

### Mission
Build the world's most trusted evidence-first knowledge platform for policy, governance, economy, technology, science, and geopolitics.

Not another news website.
Not another blog.
Not another research portal.

A platform where every article becomes structured knowledge.

### Product Philosophy
Every page must answer:
What happened?
↓
Why did it happen?
↓
Why does it matter?
↓
What evidence supports it?
↓
What happens next?

---

## 2. Product Principles
Everything should satisfy these principles.

- **Principle 1**: Evidence over opinions.
- **Principle 2**: Understanding over speed.
- **Principle 3**: Knowledge over articles.
- **Principle 4**: Minimal UI. Maximum readability.
- **Principle 5**: Everything connected. Every article links to:
  - People
  - Organizations
  - Policies
  - Laws
  - Events
  - Sources
  - Topics

---

## 3. Information Architecture
- Home
- Stories
- Topics
- Research
- Timeline
- Knowledge Graph
- Search
- Newsletter
- About
- Account
- Settings

---

## 4. Content Architecture
Everything revolves around Knowledge Objects.

**Knowledge Object**
- Headline
- Summary
- Claims
- Evidence
- Sources
- Timeline
- Entities
- Documents
- Media
- Updates
- Metadata

---

## 5. Homepage
- Hero Story
- Today's Breakdown
- Breaking Intelligence
- Trending
- Topics
- Featured Analysis
- Interactive Timeline
- Latest Research
- Newsletter
- Footer

### Homepage Sections
- **Hero**: Large immersive feature. Latest important story.
- **Today's Breakdown**: One editorial pick.
- **Latest Intelligence**: Grid. 4–8 cards.
- **Trending**: Horizontal scroll.
- **Topics**: Policy, Economy, Technology, Science, Climate, AI, World, Business.
- **Featured Investigation**: Long-form feature.
- **Timeline**: Latest important events.
- **Knowledge Highlights**: Claims, Reports, Data, Documents.
- **Newsletter**

---

## 6. Story Page
- Hero
- Summary
- Quick Facts
- Timeline
- Main Story
- Evidence
- Sources
- Documents
- Charts
- Entity Cards
- Related Stories
- Updates
- Discussion
- Newsletter

### Story Components
- **Hero**: Image, Category, Headline, Author, Date, Reading Time, Share.
- **Summary**: 5 bullet summary.
- **Quick Facts**: Cards.
- **Timeline**: Interactive.
- **Story**: Rich typography.
- **Evidence**: Every claim backed.
- **Sources**: Primary sources.
- **Documents**: PDFs, Government notifications, Research papers.
- **Related Topics**: Entity chips.
- **Updates**: Living article.

---

## 7. Topic Page
*Example: Artificial Intelligence*
- Overview
- Timeline
- Latest Stories
- Organizations
- People
- Policies
- Reports
- Documents
- Statistics
- Related Topics

---

## 8. Entity Pages
*Templates*: Person, Organization, Law, Policy, Country, Company, Technology, Court Case, Research Paper, Event.

*Each has*:
- Overview
- Timeline
- Related Stories
- Sources
- Connections

---

## 9. Search
- **Global Search**: Command Palette (Keyboard `CTRL+K`)
- **Searches**: Stories, Entities, Topics, Documents, People, Organizations, Policies, Laws.

---

## 10. Knowledge Graph
- Interactive
- Nodes & Edges
- Zoom & Filters
- Timeline integration
- Relationship Explorer

---

## 11. Timeline
- World Events, Policy, Technology, Economy, Science, Conflict, Climate.

---

## 12. Research Library
- Government reports, Court judgments, White papers, Acts, Bills, Notifications, Research papers.
- PDF Viewer.

---

## 13. User Dashboard
- Saved stories
- Bookmarks
- Reading history
- Following topics
- Reading statistics
- Newsletter preferences

---

## 14. Admin CMS
- Dashboard
- Article Editor
- Knowledge Editor
- Entity Editor
- Timeline Editor
- Source Manager
- Analytics
- Media Library
- User Management
- Audit Dashboard

---

## 15. Design System

### Colors
- **Primary**: Gold
- **Accent**: Blue
- **Neutral**: Slate
- **Background**: Near Black
- **Text**: White
- **Success**: Green
- **Warning**: Amber
- **Danger**: Red

### Typography
- **Display**: Newsreader
- **Heading**: Merriweather
- **Body**: Inter
- **Mono**: JetBrains Mono

### Grid & Layout
- 12-column
- 8px spacing
- 1440px max width
- 760px reading width

### Components
- Buttons, Cards, Badges, Inputs, Tabs, Tables, Timeline, Charts, Dialogs, Dropdowns, Tooltips, Breadcrumbs, Pagination, Skeletons, Alerts, Accordions, Sidebars, Headers, Footers, Navigation, Search, Command Palette.

---

## 16. Animations
- Page transitions
- Loading skeletons (Fade, Slide, Expand, Hover)
- Timeline animations
- Knowledge graph transitions

---

## 17. Accessibility
- WCAG AA compliant
- Keyboard navigation & Focus indicators
- ARIA support
- Screen reader optimized
- High Contrast
- Reduced motion support

---

## 18. Performance (Budgets)
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **INP**: < 200ms
- **JS Payload**: < 250KB
- **Images**: AVIF/WebP, Lazy Loading
- **Rendering**: Streaming, Edge Rendering

---

## 19. SEO
- Metadata API
- OpenGraph & Twitter Cards
- Schema.org (Structured Data)
- Breadcrumbs
- Canonical URLs
- Sitemap & Robots
- RSS

---

## 20. Analytics
- Reading depth & Scroll tracking
- Clicks
- Topic popularity
- Search analytics
- Entity & Knowledge graph analytics
- Performance analytics

---

## 21. Security
- CSP Headers
- CSRF protection
- Rate limiting
- Authentication & Session management
- Input validation

---

## 22. Development Roadmap

### Phase 1 — Foundation (2–3 weeks)
- Finalize design tokens and typography.
- Build the global layout, header, footer, navigation, and theme system.
- Create the reusable UI component library (buttons, cards, forms, modals, etc.).
- Set up responsive grid, routing, and accessibility baseline.
- **Exit criteria**: Shared design system complete; all core UI primitives available.

### Phase 2 — Core Reading Experience (2–3 weeks)
- Homepage.
- Story page.
- Topic page.
- Global search (basic).
- Responsive mobile layouts.
- Reading progress, table of contents, sharing.
- **Exit criteria**: Users can browse, search, and read content comfortably.

### Phase 3 — Knowledge Layer (3–4 weeks)
- Entity pages.
- Knowledge graph explorer.
- Timelines.
- Evidence blocks.
- Source cards.
- Cross-linking between entities and stories.
- **Exit criteria**: The platform clearly differentiates itself through connected knowledge.

### Phase 4 — Research & CMS (3–4 weeks)
- Research library.
- Admin dashboard.
- Content editor.
- Entity and source management.
- Media library.
- **Exit criteria**: Editors can manage structured knowledge efficiently.

### Phase 5 — Production Readiness (2–3 weeks)
- Performance optimization.
- Accessibility audit fixes.
- SEO refinement.
- Analytics integration.
- Error handling and observability.
- Final UI polish and QA.
- **Exit criteria**: Meets launch quality standards for performance, accessibility, and reliability.

---

## Success Metrics

### Technical
- Lighthouse Performance ≥ 95
- Accessibility ≥ 95
- SEO ≥ 95
- Best Practices ≥ 95
- Core Web Vitals all in the "Good" range

### Product
- Readers reach key facts within 30 seconds.
- Every major claim links to supporting evidence.
- Every story connects to relevant entities, timelines, and sources.
- Mobile and desktop experiences are feature-complete.
- Consistent design system across the entire application.
