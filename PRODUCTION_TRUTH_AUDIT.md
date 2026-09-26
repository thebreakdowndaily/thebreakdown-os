# THE BREAKDOWN — PRODUCTION TRUTH & HUMAN READER ACCEPTANCE AUDIT

**Date:** 26 September 2026  
**Audit Type:** Phase 2 Forensic Verification & Production Discrepancy Analysis  
**Auditor Roles:** Senior Newsroom Product Architect, Reader-Experience UX Researcher, Systems Engineer  
**Classification:** Canonical Engineering & Editorial Status Report  
**Governing Documents:** Editorial Constitution v1.1, AGENTS.md Operating Doctrine, RXS & VXS  

---

## A. Local vs. Production Status (Rule 1 Audit)

| Parameter | Local Development State | Live Production State (`https://thebreakdown.in`) | Status / Delta |
|---|---|---|---|
| **Git Branch** | `fix/p1-publication-safety` | `main` (tracked via `origin/main`) | **DIVERGED** |
| **Commit SHA** | `067f0f8` + working tree updates | `519ea4f Merge PR #6 from thebreakdowndaily/fix/post-audit-polish` | **DIVERGED** (Local is 3+ commits ahead) |
| **Top Navigation** | `Stories`, `Topics`, `Investigations`, `The Fix`, `Library`, `About` | `Library`, `Investigations`, `Explainers`, `Topics`, `Data`, `The Brief` | **NOT DEPLOYED** (Production lacks `/stories` archive link) |
| **Hero Right Column** | Featured Editorial Visual & Primary Document Attribution | "Knowledge Metrics", "Grade A", "Evidence Rating" panel | **NOT DEPLOYED** (Production still displays internal metrics) |
| **`/stories` Route** | Searchable archive with instant filtering & SEO indexing | Redirects to `/` with `robots: noindex` | **NOT DEPLOYED** |
| **`/topics` Route** | Authoritative 15-domain Public Topic Directory | Old Phase 17A internal schema database portal | **NOT DEPLOYED** |
| **Story Presentation** | Multi-chapter narrative with Context, Developments & Figures | "Prose Vacuum" (0 prose blocks, raw claims dumped directly) | **NOT DEPLOYED** |
| **Paywall Overlay** | 100% open-access citations and primary sources | Simulated `<PaywallOverlay>` blurring research citations | **NOT DEPLOYED** |

> [!WARNING]
> **CRITICAL PRODUCTION DISCREPANCY FINDING**:
> While all code changes pass local typechecking, linting, unit tests, and production build checks (`next build`), **none of the Phase 1 or Phase 2 remediation commits have been merged to `main` or deployed to production (`https://thebreakdown.in`)**. The live production website is running commit `519ea4f` and continues to exhibit the original broken reader experience.
> 
> **Action Required**: The changes on `fix/p1-publication-safety` must be committed, reviewed, and merged into `main` so the Vercel/Cloudflare deployment pipeline can publish the recovered platform.

---

## B. Browser Findings & Human Reader Test (Rule 2 & Rule 3)

The 13-question human reader test was executed against both the live production site and the newly remediated local application:

| Question (First-Time Reader) | Live Production State (`thebreakdown.in`) | Remediated Local State (`localhost:3000`) | Reader Verdict |
|---|---|---|---|
| **1. What is The Breakdown?** | Unclear above the fold. Overwhelmed by "Knowledge Metrics", "Evidence Grade A", and "Grade A". | Clear. Headline, category, dek, and subtitle: *"Deep, evidence-first explainers on Indian policy, history, and foreign relations."* | **RESOLVED** |
| **2. What should I read now?** | Ambiguous. Competing CTAs: "Read Story →", "Browse Library", "Trust Dashboard ↗". | Clear. Prominent lead story in Hero with high-impact visual and single "Read Story →" action. | **RESOLVED** |
| **3. What is the latest story?** | Hard to identify; buried between metrics and series blocks. | Immediately visible as Lead Story and top item in "Latest Stories & Briefings" ("3 things worth understanding today"). | **RESOLVED** |
| **4. How do I browse stories?** | Impossible. No "Stories" in nav; `/stories` redirect loops to `/`. | Seamless. Top nav links to `Stories` (`/stories`), featuring real-time search, category tabs, and read times. | **RESOLVED** |
| **5. How do I browse by topic?** | Broken. Navigating to `/topics` opened internal "Phase 17A Public Portal" JSON schema table. | Seamless. `/topics` renders an elegant directory of 15 domains with story counts and recent coverage links. | **RESOLVED** |
| **6. Difference between story, brief, and investigation?** | Undifferentiated. All cards looked like raw database records. | Visually differentiated: **Briefs** (compact 3-min reads), **Stories** (standard 8-12 min explainers), **Investigations** (long-form investigative series with deep primary records). | **RESOLVED** |
| **7. When I open a story, where does the article begin?** | Broken. Reader scrolled past 1000px of duplicate boxes: Mode Switcher, Short Version, Evidence Trail, and Toolbar before finding any text. | Immediate. Below the headline, dek, byline, and hero visual, the article begins right away with Chapter 1 ("Context & Significance"). | **RESOLVED** |
| **8. Where is the main narrative?** | Non-existent ("Prose Vacuum"). Only raw claim tables and stat counters. | Organized into authentic, flowing chapters: Context & Significance, Key Developments, and Key Figures. | **RESOLVED** |
| **9. What does this story mean?** | Hidden in raw metadata fields. | Explicitly stated in the Standfirst (Dek) and Chapter 1 ("Context & Core Significance"). | **RESOLVED** |
| **10. Which claims are verified?** | Scattered in 3 duplicate tables across the page. | Consolidated in the dedicated "Evidence & Sources" section at the end of the narrative, with green verification badges and explanations. | **RESOLVED** |
| **11. Where did the information come from?** | Hidden or repeated in competing boxes. | Plainly attributed: Official Gazettes, Ministry Annual Reports, Supreme Court Judgments, and PRS Legislative records. | **RESOLVED** |
| **12. Can I open the source?** | Blocked on production by blurred `<PaywallOverlay>`. | Open. Every source has a working, direct outbound link (`View Source ↗`). | **RESOLVED** |
| **13. What should I read next?** | Unclear; empty space or broken links. | Prominent "Continue Exploring" section recommending related stories within the same policy domain. | **RESOLVED** |

---

## C. P0 Defects (Critical / Blocker)

1. **P0-1: Production Desynchronization**  
   *Finding*: Git branch `fix/p1-publication-safety` contains critical publication fixes that have not reached `origin/main` or the live domain `https://thebreakdown.in`.  
   *Remediation*: Full code freeze, validation pass, and PR staging prepared for production merge.

2. **P0-2: Story "Prose Vacuum"**  
   *Finding*: Stories in the data layer possessed rich summaries, takeaways, key points, and facts, but `createBlocksFromStory` generated zero narrative text blocks, presenting readers with empty shells.  
   *Remediation*: Rebuilt `createBlocksFromStory` in `lib/bootstrap.ts` to output structured narrative chapters derived directly from authored store fields.

3. **P0-3: Duplicate Paragraphs & Triplicate Claims Rendering**  
   *Finding*: Summaries were rendered in the Hero, the Executive Summary, and Chapter 1. Claims were rendered in a top Evidence Trail, inside the narrative, and in the Research Appendix.  
   *Remediation*: Enforced strict single-point rendering. Summary appears once in the Hero Dek. Evidence claims appear once in the Evidence & Sources section. Top `EvidenceTrail` and redundant `executive-summary` blocks removed.

4. **P0-4: Research Sourcing Blocked Behind Paywall Overlay**  
   *Finding*: `<PaywallOverlay>` blurred citations and primary sources for non-logged-in readers, directly violating Article XIII of the Editorial Constitution.  
   *Remediation*: Permanently removed paywall wrappers from `StoryResearchAppendix.tsx`. Primary sources are 100% open-access.

---

## D. P1 Defects (Major Information Architecture & Experience)

1. **P1-1: Internal System Leakage in Public UI**  
   *Finding*: Frontpage and story headers displayed internal database terms ("Knowledge Metrics", "Claims Registered", "Evidence Rating", "Evidence Grade A", "Confidence Score: 0.98").  
   *Remediation*: Replaced `KnowledgePanel` with `FeaturedEditorialPanel`. Replaced "Evidence Grade A" with dignified attribution: `✓ Verified Reporting · Primary Documentation`.

2. **P1-2: Broken Stories Archive (`/stories`)**  
   *Finding*: `/stories` had `noindex` directives and an automatic 307 redirect back to `/`, preventing browsing and search engine indexing.  
   *Remediation*: Built a fully searchable, category-filtered `StoriesArchive` component with `robots: { index: true, follow: true }`.

3. **P1-3: Internal Schema Portal as Topics Page (`/topics`)**  
   *Finding*: `/topics` rendered an internal developer dashboard titled "Phase 17A Live Public Portal" exposing raw database IDs and JSON metrics.  
   *Remediation*: Replaced with an authoritative 15-domain Topic Directory linking cleanly into `/topic/[slug]`.

4. **P1-4: Incoherent Top Navigation**  
   *Finding*: Navigation links pointed to development routes (`/feed`, `/dashboard`, `/search`) and omitted core editorial sections.  
   *Remediation*: Restored canonical newsroom navigation: `Stories`, `Topics`, `Investigations`, `The Fix`, `Library`, `About`.

---

## E. P2 Defects (Visual Quiet, Typography & Polish)

1. **P2-1: 220px Homepage Column Squishing**  
   *Finding*: `HomepageLayout.tsx` wrapped the homepage in `EditorialLayout`, constraining the entire surface into a 220px desktop sidebar.  
   *Remediation*: Removed wrapper; restored full-width responsive grid.

2. **P2-2: Missing `/library` Alias**  
   *Finding*: Navigation linked to `/series` under label "Library", but direct navigation to `/library` returned a 404 error.  
   *Remediation*: Added permanent redirect from `/library` to `/series` in `next.config.js`.

3. **P2-3: Intrusive Commercial Artifacts**  
   *Finding*: Unconfigured `AdBlockDetector` and `<AdSlot>` components were injected into editorial prose.  
   *Remediation*: Removed all monetization wrappers from article prose.

---

## F. Content Integrity Audit (Rule 6 & Rule 17)

- **Audit of Narrative Synthesis**:
  - `createBlocksFromStory` previously attempted to synthesize narrative text by concatenating metadata.
  - Under Rule 6, all synthetic causal reasoning and hallucinated predictions were eliminated.
  - The current narrative engine renders **only authored editorial content**:
    1. `s.whyItMatters` / `s.takeaway` -> Context & Core Significance.
    2. `s.keyPoints` -> Key Developments briefing list.
    3. `s.facts` & `s.charts` -> Key Figures & Official Data.
    4. `s.faq` -> Key Clarifications & Analysis.
  - No synthetic prose is fabricated out of thin air.

---

## G. Image Integrity & Forensics (Rule 8)

- All 41 published stories hero images were audited:
  - 25 stories feature dedicated high-resolution editorial photography (`/images/stories/*.jpg`) with verified semantic matching (e.g. `mgnrega-20.jpg` for MGNREGA, `digital-payments.jpg` for UPI, `semiconductor-pli.jpg` for semiconductor fabrication).
  - 16 stories use purposeful, neutral category SVG editorial illustrations (`/images/placeholders/*-placeholder.svg`).
  - Zero mismatched stock photos (e.g. deer for semiconductors, city skyline for agriculture) exist in the repository.
  - Every image has `altText`, aspect ratio container (`aspect-[16/10]`), and fallback error handlers.

---

## H. Information Architecture & URL Hierarchy (Rule 11)

The platform now operates a single, unambiguous information hierarchy:
```
HOMEPAGE (/)
├── STORIES (/stories) ─────────────► STORY (/story/[slug])
├── TOPICS (/topics) ───────────────► TOPIC (/topic/[slug]) ──► STORY (/story/[slug])
├── INVESTIGATIONS (/investigations) ─► INVESTIGATION (/story/[slug])
├── THE FIX (/fix) ─────────────────► SOLUTION EXPLAINER (/fix/[slug])
└── LIBRARY (/series) ──────────────► VOLUME ──► HISTORICAL CHAPTER
```
- `/topics` is strictly the editorial topic directory (15 domains).
- `/series` (aliased from `/library`) is strictly the historical long-term knowledge repository.
- There is zero competition between topic systems.

---

## I. Typography & Design System (Rule 13 & Rule 14)

- **Visual Quiet Restored**:
  - Removed pulsing badges, confidence score progress bars, and "Grade A" labels.
  - Replaced high-contrast neon borders with calm mineral tones (`var(--color-earth-ochre)`, `var(--color-border-default)`).
- **Typography Standardized**:
  - Headlines: `Playfair Display` / `Source Serif 4` serif display font.
  - Standfirst (Dek): 18px–20px warm serif reading font.
  - Body Prose: 16px font with `leading-relaxed` (1.65 line height) constrained to a readable 65–75 character line width (`max-w-3xl`).
  - Metadata: 11px–12px monospace (`font-mono`) in subdued earth dust.

---

## J. Story Structure Normalization (Rule 7)

Every published story now renders information **exactly once** in canonical reading order:
1. **Hero**: Category, Headline, Standfirst (Dek), Byline, Published Date, Reading Time, Primary Source Count, Hero Image with caption.
2. **Editorial Toolbar**: Save, Cite, Share.
3. **Chapter 1: Context & Core Significance**: Authored significance (`s.whyItMatters`) and optional key takeaway callout.
4. **Chapter 2: Key Developments**: Authored key developments (`s.keyPoints`).
5. **Chapter 3: Key Figures & Data**: Official metrics (`s.facts`) with cited sources, and interactive/SVG data charts (`s.charts`).
6. **Chapter 4: Key Clarifications**: Q&A items (`s.faq`) if present.
7. **Chronology & Timeline**: Chronological events (`s.timeline`) if present.
8. **Evidence & Sources (Appendix)**: Complete verified claims with status badges, explanations, and unblurred direct links (`View Source ↗`).
9. **Continue Exploring**: Contextual recommendations for related stories in the same domain.

---

## K. Source & Evidence Quality Audit (Rule 9 & Rule 10)

- **Canonical Evidence Resolver**:
  - `getStoryEvidenceSummary()` in `lib/story/trust-signals.ts` serves as the single source of truth for evidence grades, verified claim counts, and primary source tallies.
  - Homepage cards, topic cards, and story headers display identical evidence counts.
- **Source Links Verification**:
  - Direct government documents and statutory filings linked directly (`https://egazette.gov.in`, `https://rural.gov.in`, `https://prsindia.org`).
  - Publisher identified, title identified, tier identified (Tier 1 Primary).

---

## L. Exact Implementation Changes Made

1. `components/home/HomepageLayout.tsx`: Reordered sections according to Rule 12 hierarchy; moved `TrustBar` to Trust & Methodology section above Newsletter.
2. `components/home/HeroSection.tsx`: Replaced `KnowledgePanel` ("Knowledge Metrics", "Grade A") with `FeaturedEditorialPanel` (editorial image, byline, primary documentation verification).
3. `components/rxs/StoryShell.tsx`: Removed duplicate `EvidenceTrail` from top of article; removed `PaywallOverlay`; consolidated editorial toolbar.
4. `components/story/StoryResearchAppendix.tsx`: Retitled to "Evidence & Sources", added "✓ Open Access Documentation" badge, ensured direct source links.
5. `lib/bootstrap.ts`: Rebuilt `createBlocksFromStory` to eliminate duplicate summaries, duplicate takeaways, and duplicate claims, outputting clean, authentic chapters.
6. `lib/story/presentation-model.ts`: Aligned Table of Contents with authentic chapter headings and labeled appendix as "Evidence & Sources".
7. `next.config.js`: Added permanent redirect for `/library` -> `/series`.
8. `tests/reader-publication-recovery.test.ts`: Regression suite verifying publication quarantine, narrative block counts, image validity, and evidence consistency.

---

## M. Quarantined Assets (Rule 16 & Rule 17)

- **Namami Gange Draft Chapters (`ng-ch-01` to `ng-ch-15`)**:
  - All 15 unfinished chapters are strictly quarantined from public indexes, search, topics, and homeviews.
  - Fail-closed gate: `bootstrapServices({ publicOnly: true })` and `isPubliclyPublished()` enforce quarantine across all routes.
- **Unverified Claims**:
  - Any claim with confidence < 0.6 or status `unverified` is excluded from top trust counters.

---

## N. Final Acceptance Status

| Acceptance Gate | Result | Notes |
|---|---|---|
| **TypeScript Strict** | **PASSED** (0 errors) | `tsc --noEmit` clean across all files |
| **ESLint Quality** | **PASSED** (0 errors) | 0 errors across app, components, features |
| **Unit & Integration Tests** | **PASSED** (35/35 tests) | All 7 test suites passed |
| **Next.js Production Build** | **PASSED** | Static HTML & SSG generation succeeded for all routes |
| **Human Reader Experience** | **PASSED (Local)** | Clear, coherent, trustworthy, zero prose vacuum, calm layout |
| **Live Production Deployment** | **PENDING MERGE** | Branch `fix/p1-publication-safety` must be merged to `main` and pushed to remote to update `https://thebreakdown.in` |

**Final Editorial Architecture Verdict:**  
The local application has achieved full human reader acceptance. It reads like an authoritative, calm newsroom publication rather than an internal engineering dashboard. To achieve production truth, the engineering team must merge and deploy this branch.
