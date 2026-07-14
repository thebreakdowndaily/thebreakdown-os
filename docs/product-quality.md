# Product Quality Standard

> **Version:** v1.0
> **Status:** Ratified
> **Governance level:** 5 (below Code)
> **Last updated:** 14 Jul 2026

This document defines the measurable quality requirements every feature must satisfy before shipping. It is not philosophy — it is a checklist.

---

## Quality Gates

### Navigation

| # | Requirement | How to verify |
|---|-------------|---------------|
| 1 | Reader can reach any section of a chapter in ≤1 click | Manual: use TOC |
| 2 | Current section is visually indicated at all times | Manual: scroll through chapter |
| 3 | Back button restores previous scroll position | Manual: navigate in, navigate back |
| 4 | Deep links (`#section`) work on initial load and navigation | Manual: open URL with fragment |

### Trust

| # | Requirement | How to verify |
|---|-------------|---------------|
| 5 | Evidence is reachable from any claim in ≤1 interaction | Manual: click claim |
| 6 | Source tier is visible for every source | Audit: scan sources section |
| 7 | Confidence score is visible for every claim | Audit: scan claim registry |
| 8 | Editorial judgment is distinguished from factual claim | Audit: scan narrative sections |

### Performance

| # | Requirement | Target |
|---|-------------|--------|
| 9 | Largest Contentful Paint (LCP) | <2.5s |
| 10 | Cumulative Layout Shift (CLS) | <0.1 |
| 11 | First Input Delay (FID) / Interaction to Next Paint (INP) | <200ms |
| 12 | No hydration warnings in console | `npm run build` |
| 13 | No uncaught runtime errors | Manual: test all interactions |

### Accessibility

| # | Requirement | Verification |
|---|-------------|-------------|
| 14 | WCAG AA minimum, AAA where practical | Audit |
| 15 | All interactive elements keyboard-navigable | Manual: tab through |
| 16 | Screen reader announces dynamic content changes | Manual: VoiceOver/NVDA |
| 17 | Focus management on modals, drawers, overlays | Manual: open/close |
| 18 | Color contrast passes AA (4.5:1 normal, 3:1 large) | Audit |

### Mobile

| # | Requirement | Verification |
|---|-------------|-------------|
| 19 | All navigation operable with one thumb | Manual: hold device |
| 20 | Touch targets ≥44px | Audit |
| 21 | No horizontal scroll on 375px viewport | Manual: resize |
| 22 | Sidebar collapses on mobile | Manual: <1024px |

### Learning

| # | Requirement | Verification |
|---|-------------|-------------|
| 23 | Continue Learning is always available at chapter end | Manual: scroll to footer |
| 24 | Glossary terms are linked from the narrative | Audit |
| 25 | Key Questions are answered within the chapter | Audit |
| 26 | Misconceptions are explicitly addressed | Audit |

### SEO

| # | Requirement | Verification |
|---|-------------|-------------|
| 27 | Title, description, canonical URL set | Audit |
| 28 | Open Graph and Twitter Card metadata present | Audit |
| 29 | Structured data (JSON-LD) for article/FAQ/knowledge | Audit |
| 30 | `sitemap.xml` includes the page | Verify |

### Analytics

| # | Requirement | Verification |
|---|-------------|-------------|
| 31 | Every significant reader decision fires an event | Audit: match taxonomy |
| 32 | Events include `story_slug`, `version`, `timestamp` | Audit: inspect payload |
| 33 | No analytics calls in SSR/build-time | Audit: check for `window` guards |
| 34 | Understanding metrics (funnel) are computable from events | Audit: verify sequence |

---

## Definition of Done

Every PR must satisfy all applicable gates above before merging.

### PR Checklist

```
□ Matches RXS spec
□ Product Quality gates pass (applicable ones)
□ Mobile works (375px+)
□ Keyboard works (Tab, Enter, Escape, J/K where applicable)
□ Screen reader works (announces dynamic changes)
□ Analytics fires correct events
□ Deep links work (#sections)
□ SEO metadata present
□ No CLS (>0.1)
□ No hydration warnings
□ Build passes (npm run build)
□ TypeScript clean (npx tsc --noEmit)
□ Lint clean (npm run lint)
□ Tested on Chrome (latest)
□ Tested on Firefox (latest)
□ Tested on Safari (latest)
□ Reader can discover feature within 30 seconds
□ AGENTS.md traceability added (@rxs/implementation comment)
□ PR <500 changed lines
```

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 14 Jul 2026 | Initial standard — 34 quality gates across 8 categories | Architecture Review |
