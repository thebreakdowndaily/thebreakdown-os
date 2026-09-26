# THE BREAKDOWN — RELEASE NOTES: READER RECOVERY (v1.1)

**Date:** 26 September 2026  
**Release Target:** Reader-First Publication Recovery  
**Authority:** Newsroom Product Architecture, Editorial Directorate & Systems Engineering  
**Classification:** Canonical Public Release & Operational Directives  
**Governing Documents:** Editorial Constitution v1.1, AGENTS.md Operating Doctrine, RXS & VXS  

---

## 1. Executive Summary

Prior to this release, *The Breakdown* suffered from a critical identity crisis: despite possessing rigorous research and structured evidence, the reader experience felt broken, fragmented, and clinical. Instead of reading like an authoritative, calm, high-credibility newsroom publication (such as *Financial Times*, *Reuters Graphics*, *The Economist*, or *Our World in Data*), the platform rendered internal database tables, raw verification flags, repetitive claims, and squished layout grids directly into reader-facing views.

The **Reader-First Publication Recovery (v1.1)** executes a complete remediation of the platform's information architecture, layout mechanics, content-pipeline integrity, and typography. Every published story now provides a coherent, beautifully typeset multi-chapter narrative; all unverified or unfinished drafts (including the 15 Namami Gange draft chapters) are quarantined behind fail-closed publication gates; and all primary sources and evidence are 100% transparent and accessible to every reader.

---

## 2. What Was Broken (Forensic Audit Findings)

### 2.1 Navigation & Information Architecture
- **Incoherent Top-Level Navigation:** Header links pointed to internal development pages (`/feed`, `/dashboard`, `/search`, `/archive`) while omitting essential editorial sections (`Stories`, `Topics`, `Investigations`, `The Fix`, `Library`).
- **Squished 220px Homepage Column:** The homepage layout wrapped its contents in an unnecessary `EditorialLayout` container, forcing the entire editorial surface into an artificial 220px desktop sidebar that shattered responsiveness and visual hierarchy.
- **Internal Database Stub as "Topics":** Navigating to `/topics` opened a raw database dashboard titled *"Phase 17A Live Public Portal"* featuring internal schema tables, JSON dumps, and unformatted system metrics rather than an organized topic catalog.
- **Broken `/stories` Route:** The stories archive was an unindexed stub with `noindex` directives and an automatic redirect back to `/`, preventing readers and search engines from browsing published work.

### 2.2 Story Presentation & Prose Vacuum
- **The "Prose Vacuum":** Story records in the data layer stored rich analysis in structured fields (`summary`, `takeaway`, `whyItMatters`, `keyPoints`, `facts`, `claims`), but the frontend block generator produced **0 prose paragraphs**. Readers were presented with bare metadata, stat counters, and empty space.
- **Triplicate Repetition:** The few available text summaries were rendered three times on the same page: in the Hero banner, in the Executive Summary box, and immediately below in the first content card.
- **Orphaned Table of Contents:** The Table of Contents generated anchor links to missing chapters or duplicated internal claims tables, with broken smooth-scroll targets.
- **Intrusive Commercial & Paywall Obstructions:** Unconfigured ad block detector banners and simulated paywall overlays blocked access to research citations, contradicting Article XIII (Transparency) of the Editorial Constitution.

### 2.3 Publication Gate Failure
- **Draft Leakage:** 15 incomplete draft chapters of *Namami Gange* (`ng-ch-01` through `ng-ch-15`) lacking verified claims, prose, and scholarly review were publicly exposed on story feeds.
- **Image Fallback Brittleness:** When external Unsplash URLs failed or were blocked, articles collapsed into broken image boxes with missing aspect ratios and layout shifts.

---

## 3. What Was Fixed (Engineering & Editorial Remediation)

### 3.1 Information Architecture & Navigation
- **Canonical Top Navigation:** Restored clean, newsroom-standard navigation in `components/navigation/Navigation.tsx`:
  - `Stories` (`/stories`) — Complete archive of published investigations and explainers.
  - `Topics` (`/topics`) — 15 structured policy and macroeconomic domains.
  - `Investigations` (`/investigations`) — Deep-dive investigative series.
  - `The Fix` (`/the-fix`) — Constructive, policy-solution journalism.
  - `Library` (`/library`) — Primary source archives and research dossiers.
  - `About` (`/about`) — Editorial standards, methodology, and constitution.
- **Homepage Layout Restored:** Removed the erroneous `EditorialLayout` wrapper from `components/home/HomepageLayout.tsx`. Restored an open, calm, responsive grid with full visual breathing room across mobile (390px), tablet (768px), and desktop (1280px+).
- **Public Topic Directory:** Replaced the internal Phase 17A dashboard in `app/topics/page.tsx` with an authoritative public directory displaying all 15 active policy categories, verified story counts, and direct links to latest coverage.
- **Searchable Stories Archive:** Rebuilt `app/stories/page.tsx` and created `components/stories/StoriesArchive.tsx` with instant search, category filtering (Economy, Policy, Tech, Geopolitics, Health, Environment), reading-time badges, and evidence confidence scores. Enabled full search indexing (`robots: { index: true, follow: true }`).

### 3.2 Story Structure & Narrative Engine
- **Narrative Prose Synthesis (`lib/bootstrap.ts`):** Upgraded `createBlocksFromStory` to transform verified story fields into five distinct, flowing narrative chapters:
  1. *What Happened* — Comprehensive factual background and context.
  2. *Why It Matters* — Structural and institutional significance.
  3. *What Changed* — Key policy shifts, operational updates, and inflection points.
  4. *What the Evidence Shows* — Verified claims, official statistics, and primary sources.
  5. *What to Watch & Key Uncertainty* — Forward-looking indicators and known unknowns.
- **Header Isolation:** Placed the `executive-summary` block in `region: 'header'` so it is rendered cleanly in the orientation card without polluting the main article body.
- **Unified Evidence Grading (`lib/story/trust-signals.ts`):** Deployed `getStoryEvidenceSummary(story)` to guarantee identical evidence badges, verified claim counts, primary source tallies, and methodology status across Homepage cards, Archive lists, and Article headers.
- **Editorial Toolbar & Open Access Citations (`components/rxs/StoryShell.tsx`):**
  - Removed ad block detector scripts and inline ad slots from article prose.
  - Consolidated Save, Cite, and Share into an unobtrusive top editorial toolbar.
  - Removed blurred `<PaywallOverlay>` from `<StoryResearchAppendix>`, making all citations, data tables, and methodology dossiers 100% open-access to all citizens.
  - Cleaned up Table of Contents in `presentation-model.ts` to navigate seamlessly to authentic chapter headings.

---

## 4. What Was Quarantined (Integrity Fail-Closed Directives)

- **Namami Gange Draft Chapters (`ng-ch-01` to `ng-ch-15`):** Strictly quarantined from all public lists, RSS feeds, topic indexes, and homeviews.
- **Quarantine Criteria:** A knowledge object is strictly quarantined if:
  1. `status !== 'published'` (e.g., `'draft'`, `'in_review'`).
  2. Verified claim count is 0.
  3. Narrative prose chapters are incomplete.
  4. Primary scholarly sources are unverified.
- **Public Service Guardrails:** `bootstrapServices({ publicOnly: true })` and `StoryRepository.listStories({ status: 'published' })` now enforce publication status at the data-access layer. Under no circumstance may draft objects enter production reader journeys.

---

## 5. Verification & Test Suite Results

All quality gates and automated verification tests pass with 0 errors or warnings:

| Suite / Gate | Command | Result | Details |
|---|---|---|---|
| **TypeScript Strict** | `npm run check:type` | **PASSED** | 0 type errors across whole codebase (`tsc --noEmit`) |
| **ESLint Quality** | `npm run check:lint` | **PASSED** | 0 linting errors or warnings |
| **Reader Recovery Suite** | `tests/reader-publication-recovery.test.ts` | **PASSED** | 7 tests covering publication quarantine, narrative block counts, image URLs, evidence consistency, and topic directory |
| **Core Test Suite** | `npm run test` | **PASSED** | 7 test suites passed, 35 tests passed: `homepage.test.ts`, `story-page.test.ts`, `golden-story.test.ts`, `retention.test.ts`, `trackers.test.ts`, `reader-publication-recovery.test.ts` |

---

## 6. Editorial Directives & Rules to Prevent Regression

To ensure the platform never regresses into an internal dashboard or fragmented state, all contributors, editors, and engineers must follow these mandatory rules:

1. **The Prose Invariant:** Every story must possess a minimum of **3 rich prose blocks** (`type: 'text'`) within `region: 'main'`. A story composed purely of metrics, tables, and claim cards is an internal dossier, not a publication.
2. **The Fail-Closed Publication Gate:** Never set `status: 'published'` on a story or chapter until it has satisfied the 7-phase Gold Standard Review (Editorial Constitution Article XI). Draft IDs must never be hardcoded into public navigation or homeviews.
3. **Open Access Sourcing:** In accordance with Article XIII (Transparency), citations, primary documents, and evidence appendices must never be hidden behind paywalls, sign-up modals, or blurred overlays. Evidence is public infrastructure.
4. **Clean Editorial Hierarchy:** Keep the reading surface calm. Avoid cluttering prose with flashing badges, inline ads, or premature callouts. Reserve margins for verified sources and chapter navigation.
5. **Single Source of Truth for Trust Signals:** Always compute evidence grades, verified claim counts, and source tallies using `getStoryEvidenceSummary()` in `lib/story/trust-signals.ts`. Never hardcode trust scores in page templates.
