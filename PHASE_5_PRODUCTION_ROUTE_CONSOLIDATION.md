# PHASE 5 — PRODUCTION ROUTE CONSOLIDATION & PUBLIC UI PURGE
**The Breakdown OS (`thebreakdown.in`)**  
**Execution Date:** 27 September 2026  
**Status:** COMPLETE & VERIFIED ON PRODUCTION  
**Deployed Commit:** `94843de`  
**Production Deployment:** `dpl_68ptmGWCmxVYk9TswXidD7GkjPV5`  
**Live Production URL:** `https://thebreakdown.in`

---

## EXECUTIVE SUMMARY

Phase 5 executed a surgical consolidation of public reading routes and eliminated confusing internal research telemetry across the public surface of *The Breakdown*.

Prior to this phase, an independent forensic inspection identified that:
1. Canonical stories linked from the homepage or archives (e.g. `/story/mgnrega-reform`) were being hijacked via HTTP 308 permanent redirects to deep chapter routes (`/series/economic-policy-2026/volume/structural-reforms/chapter/mgnrega-reform`). This subjected normal article readers to the multi-chapter monograph shell (`ChapterPageShell`) instead of the canonical public story shell (`StoryShell`).
2. Internal telemetry, raw percentage scores (e.g. `94% Evidence`, `Grade A`, `82/100`), database entity counters (`14 Entities Tracked`), and commercial lockbox prompts ("Exclusive to Institutional Supporters: Upgrade") were bleeding into public reader views.
3. Incongruous stock/placeholder images were mapped to critical policy stories (e.g. UPSC exam headquarters displayed on a youth mental health investigation).

Through targeted code modifications, comprehensive local testing (27/27 test suites passing, zero TypeScript errors, zero lint errors, successful production build of 1,131 static prerendered pages), and production deployment to Vercel, all route conflicts and UI defects have been resolved and verified live against `https://thebreakdown.in`.

---

## SECTION A — CURRENT PRODUCTION ROUTE MAP

The canonical route architecture for *The Breakdown* is now strictly partitioned into clear reader intents:

| Public URL Pattern | Target Intent | Canonical Component | Status |
| :--- | :--- | :--- | :--- |
| `/` | Publication Front Page | `HomePageClient` / `HomeClient` | `200 OK` |
| `/stories` | Universal Story Archive | `StoriesArchive` | `200 OK` |
| `/story/[slug]` | **Single Canonical Story Experience** | `StoryShell` | `200 OK` |
| `/topics` | Editorial Topic Directory | `TopicsPage` | `200 OK` |
| `/topic/[slug]` | Topic Dossier & Curated Stories | `TopicDossier` | `200 OK` |
| `/series` | Monograph & Series Catalog | `KnowledgeLibraryIndex` | `200 OK` |
| `/series/[seriesSlug]/volume/[volumeSlug]/chapter/[slug]` | Dedicated Multi-Chapter Monograph Reader | `ChapterPageShell` | `200 OK` |
| `/library` | Legacy Route | Redirect to `/series` | `308 Redirect` |

---

## SECTION B — CONFLICTING ROUTE SYSTEMS IDENTIFIED

The forensic audit revealed two competing public story presentation systems colliding at runtime:

1. **The Universal Story Shell (`/story/[slug]`):**
   Designed as the clean, distraction-free reading experience for newsroom investigations, featuring standard bylines, read-time estimates, lead media, verified claim callouts, and footnoted evidence citations.
2. **The Knowledge Library Chapter Shell (`/series/.../chapter/[slug]`):**
   Designed for multi-volume scholarly compendiums and policy monographs, featuring volume hierarchical trees, chapter sequence steppers (Previous/Next Chapter), and institutional pedagogical drawers.

### The Conflict:
When a reader clicked on a story card for stories like `mgnrega-reform` on the homepage or in the archive, the URL requested was `/story/mgnrega-reform`. Instead of serving the clean article, the application server issued a `308 Permanent Redirect` to the deep chapter route. This broke reader expectations:
- The reader expected an independent article, but was plunged into chapter 3 of an economic policy compendium.
- Canonical meta tags pointed away from the clean story path.
- Bookmarks and shared URLs forced readers into the monograph interface.

---

## SECTION C — ROOT CAUSES

1. **Route Hijack in `app/story/[slug]/page.tsx`:**
   In lines 78–82 of `app/story/[slug]/page.tsx`, the route handler invoked `resolveContent(slug)`. If `resolution.type === 'chapter'`, the handler executed:
   ```typescript
   permanentRedirect(resolution.chapter.path);
   ```
   Because `selectReadPath` in the content layer considered canonical monograph chapters "active", stories dual-registered as chapters were forcibly ejected from `/story/[slug]`.
2. **Exposition of Internal Registry Metrics:**
   UI components (`StoryCard`, `TopicStories`, `TopicCollections`, `TopicPageHeader`) were originally drafted to expose internal quality assurance scores directly to end users. Readers were shown raw calculations (`94% Evidence`, `82/100`, `Grade A`) without semantic context, generating confusion rather than editorial trust.
3. **Paywall/Lockbox Mockup in Public Reader Surfaces:**
   `components/intel/CitationExporter.tsx` contained an artificial "Institutional Supporter Upgrade" upsell block, obstructing public readers from copying academic citations.
4. **Data Layer Fallback Image Misalignment:**
   In `utils/data-layer/store.ts`, missing hero images for certain stories had fallen back to loosely related images (e.g., `ews-quota-upsc.jpg` for `youth-mental-health-crisis`).

---

## SECTION D — CHANGES MADE

### 1. Route Hijack Elimination (`app/story/[slug]/page.tsx`)
- **Diff:** Removed `permanentRedirect` and lines 78–82 entirely.
- **Result:** Every published story requested at `/story/[slug]` now renders consistently inside `StoryShell`. Dual-registered stories can still be read inside their academic series at `/series/...`, but `/story/[slug]` remains the stable canonical public article presentation.
- **JSX Fragment Compatibility:** Added explicit `import React from 'react';` to ensure bulletproof compilation across standalone Node test runners and Next.js compiler environments.

### 2. Public UI Purge of Internal Telemetry
- **`components/ui/StoryCard.tsx`:** Removed `<ScoreBadge score={story.evidenceScore} />` (unexplained raw numbers like 94, 88). Replaced with a clean, dignified `Fact-Checked` editorial badge.
- **`components/stories/StoriesArchive.tsx`:** Replaced `{story.evidenceScore}% Verified` raw metrics with the `Fact-Checked` badge.
- **`components/topic/TopicStories.tsx`:** Replaced `{s.evidenceScore}% Evidence` with category metadata (`{s.category || 'Investigation'}`).
- **`components/topic/TopicCollections.tsx`:** Replaced `{story.evidenceScore}% Evidence` with category badge.
- **`app/topic/[slug]/page.tsx`:** Purged internal telemetry (`{qualityScore.score}% Coverage Score • {statistics.averageConfidence} Avg Confidence • {statistics.totalEntities} Entities Tracked`). Replaced with reader-facing editorial metrics (`{totalStories} Published Investigations • Primary Sourced & Verified`).
- **`components/home/trust/TrustBar.tsx`:** Updated internal database jargon from `Claims Registered` to `Documented Claims`, and `Trust Dashboard ↗` to `Standards & Methodology ↗`.
- **`components/knowledge-library/KnowledgeLibraryIndex.tsx`:** Replaced internal database wording (`Canonical Collections Registry`, `Knowledge Library Index`, `Trust 82/100 (A)`) with reader-facing editorial language (`Editorial Series & Monographs`, `Historical Monographs & Policy Compendiums`, `Primary Sourced`).
- **`components/story/ConfidenceMeter.tsx`:** Changed `Confidence Score` label to `Verification Rating`.

### 3. Open Citation Exporter (`components/intel/CitationExporter.tsx`)
- Removed the commercial lockbox modal ("Exclusive to Institutional Supporters: Upgrade to Unlock").
- Replaced with a clean, reader-accessible "Cite" button that copies standard APA citation to clipboard instantly.

### 4. Image Semantic Normalization (`utils/data-layer/store.ts`)
- `youth-mental-health-crisis`: Replaced mismatched `ews-quota-upsc.jpg` (UPSC exam building) with deliberate editorial placeholder `/images/placeholders/health-placeholder.svg`.
- `bjp-mission-360`: Replaced mismatched `electoral-bonds.jpg` (State Bank of India headquarters) with deliberate policy placeholder `/images/placeholders/policy-placeholder.svg`.
- `ayushman-bharat`: Replaced child nutrition photo (`anganwadi.jpg`) with health topic image `/images/topics/health.jpg`.
- `namami-gange-under-fire`: Replaced cracked dry soil photo (`groundwater-depletion.jpg`) with river environment topic image `/images/topics/environment.jpg`.
- `india-russia-relations`: Replaced Himalayan military patrol (`india-china-border-tensions.jpg`) with foreign policy placeholder `/images/placeholders/policy-placeholder.svg`.

---

## SECTION E — REDIRECT STRATEGY

1. **Universal Canonical Stories:**
   - `/story/[slug]` **NEVER** redirects to `/series/...` or `/chapter/...`.
   - Every story is directly accessible and returns HTTP `200 OK` with canonical meta pointing to `https://thebreakdown.in/story/[slug]`.
2. **Scholarly Monographs & Series:**
   - `/series` acts as the catalog for multi-chapter monographs (`200 OK`).
   - `/series/[seriesSlug]/volume/[volumeSlug]/chapter/[slug]` acts as the dedicated monograph reader (`200 OK`).
3. **Legacy Paths:**
   - `/library` permanently redirects (`308`) to `/series`.
   - Trailing slash normalization is handled transparently by Next.js edge routing.

---

## SECTION F — PUBLIC UI ELEMENTS REMOVED / REPOSITIONED

| Component | Old UI Element | New UI Element | Rationale |
| :--- | :--- | :--- | :--- |
| `StoryCard` | Raw ScoreBadge `94` | `Fact-Checked` badge | Unexplained percentages confused readers. |
| `StoriesArchive` | `94% Verified` | `Fact-Checked` badge | Consistent editorial quality signal. |
| `TopicStories` | `88% Evidence` | Category badge | Clean topic taxonomy. |
| `TopicHeader` | `14 Entities Tracked • 82% Coverage` | `Published Investigations • Primary Sourced` | Shift from developer telemetry to journalism standards. |
| `CitationExporter`| Supporter Upgrade Paywall | Direct Copy APA Citation | Open knowledge access. |
| `TrustBar` | `Claims Registered` | `Documented Claims` | Human-readable language. |
| `KnowledgeIndex` | `Canonical Collections Registry` | `Editorial Series & Monographs` | Publishing standard terminology. |

---

## SECTION G — IMAGE SEMANTIC FINDINGS

| Story Slug | Previous Image | Defect Identified | Corrected Asset |
| :--- | :--- | :--- | :--- |
| `youth-mental-health-crisis` | `ews-quota-upsc.jpg` | Dholpur House (UPSC Civil Services exam) displayed for student suicide & depression report. | `/images/placeholders/health-placeholder.svg` |
| `bjp-mission-360` | `electoral-bonds.jpg` | SBI corporate banking building displayed for Lok Sabha election strategy analysis. | `/images/placeholders/policy-placeholder.svg` |
| `ayushman-bharat` | `anganwadi.jpg` | Child growth monitoring photo displayed for tertiary hospital insurance analysis. | `/images/topics/health.jpg` |
| `namami-gange-under-fire` | `groundwater-depletion.jpg` | Arid cracked earth displayed for river pollution investigation. | `/images/topics/environment.jpg` |
| `india-russia-relations` | `india-china-border-tensions.jpg` | Indo-Tibetan Border Police patrol in Ladakh displayed for bilateral defense diplomacy story. | `/images/placeholders/policy-placeholder.svg` |

---

## SECTION H — STORIES CARD & ARCHIVE IMPROVEMENTS

1. **Card Hierarchy Normalized:**
   All cards across Homepage, Archive, and Topic pages now follow a predictable visual hierarchy:
   - Primary Category kicker (e.g. *Governance*, *Economy*, *Geopolitics*)
   - Story Headline (Prose font, high contrast)
   - Verified Badge (`Fact-Checked`)
   - Read Time & Publication Date
   - Excerpt (clean 2-line clamp)
2. **Elimination of Visual Clutter:**
   Removed arbitrary colored confidence bars, raw percentage pills, and database entity tags from teaser cards.

---

## SECTION I — PRODUCTION VERIFICATION

Live HTTP requests were executed against `https://thebreakdown.in` following Vercel deployment of commit `94843de`.

### Live HTTP Probes:

| Target URL | HTTP Status | Response Header | Content Verification |
| :--- | :--- | :--- | :--- |
| `https://thebreakdown.in/` | **`200 OK`** | Next.js SSG | Front page renders cleanly with normalized cards. |
| `https://thebreakdown.in/stories` | **`200 OK`** | Next.js SSG | Universal story archive displays `Fact-Checked` badges. |
| `https://thebreakdown.in/story/mgnrega-reform` | **`200 OK`** | Next.js SSG | **CRITICAL FIX VERIFIED:** No 308 redirect; renders in canonical `StoryShell`. |
| `https://thebreakdown.in/story/electoral-bonds` | **`200 OK`** | Next.js SSG | Canonical `StoryShell` renders full text & citations. |
| `https://thebreakdown.in/story/digital-payments-boom`| **`200 OK`** | Next.js SSG | Canonical `StoryShell` renders full text & citations. |
| `https://thebreakdown.in/topics` | **`200 OK`** | Next.js SSG | Topic directory renders cleanly. |
| `https://thebreakdown.in/topic/economy` | **`200 OK`** | Next.js SSG | Telemetry purged; displays editorial metrics. |
| `https://thebreakdown.in/topic/geopolitics` | **`200 OK`** | Next.js SSG | Telemetry purged; displays editorial metrics. |
| `https://thebreakdown.in/series` | **`200 OK`** | Next.js SSG | Displays "Editorial Series & Monographs". |
| `https://thebreakdown.in/series/economic-policy-2026`| **`200 OK`** | Next.js SSG | Monograph volume index intact. |
| `https://thebreakdown.in/library` | **`308 Redirect`**| `Location: /series` | Clean permanent redirect for legacy linkers. |

### Canonical Tag Audit:
- `https://thebreakdown.in/story/mgnrega-reform` `<link rel="canonical" href="https://thebreakdown.in/story/mgnrega-reform" />`
- `https://thebreakdown.in/story/electoral-bonds` `<link rel="canonical" href="https://thebreakdown.in/story/electoral-bonds" />`
- No cross-route canonical mismatches detected.

---

## SECTION J — REMAINING ISSUES & FINAL ACCEPTANCE EVALUATION

### Remaining Non-Blocking Observations:
1. **ESLint Formatting Warnings:**
   `npm run check:lint` generates 428 warnings across the repository primarily related to React Hook exhaustive dependencies in older legacy charts, and unescaped HTML entities in static text. Zero errors.
2. **High-Res Editorial Photography Pipeline:**
   While mismatched stock images have been replaced with high-quality SVG placeholders and correct topic imagery, future editorial expansion will benefit from custom photojournalism licenses.

### Final Acceptance Evaluation:
- **Route Consolidation:** **PASS** (Zero hijacking; `/story/[slug]` is universal canonical article path).
- **Public UI Purge:** **PASS** (Internal registry jargon, raw percentages, and commercial lockboxes removed).
- **Image Semantics:** **PASS** (All flagged semantic mismatches resolved).
- **Build & Quality Gates:** **PASS** (27/27 test suites passing, zero TS errors, Next.js prerender passes).
- **Production Truth:** **PASS** (Live probes to `thebreakdown.in` verify commit `94843de` active and healthy).

**Phase 5 is formally marked COMPLETE.**
