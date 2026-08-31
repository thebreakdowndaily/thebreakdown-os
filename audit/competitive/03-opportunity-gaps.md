# Opportunity Gaps — The Breakdown Competitive Analysis

Date: 31 Aug 2026

---

## Gap 1: Evidence Chain Visibility (HIGH PRIORITY)

**Competitor gap:** No competitor in the Indian market shows a structured evidence chain to readers. ISignal cites sources. Indian Express mentions experts. But none connect: Claim → Source → Evidence → Document → Timeline in a visible, interactive way.

**The Breakdown advantage:** This infrastructure exists (`claim-registry.ts`, `source-registry.ts`, `evidence-registry.ts`, `document-registry.ts`, `timeline-registry.ts`). But it's invisible to first-time readers.

**Opportunity:** Make the evidence chain a first-class UI element on story pages and topic pages. Show readers: "This claim is supported by 3 sources, verified on [date], with confidence [score]."

**Impact:** User value (trust), Competitive advantage (unique), Search potential (structured data), Evidence moat (compounds).

---

## Gap 2: Flagship Scheme Trackers (HIGH PRIORITY)

**Competitor gap:** ISignal has "Flagship Scheme Tracker" monitoring MGNREGA, POSHAN, Ujjwala, etc. But their trackers are data dashboards without evidence chains or claim tracking.

**The Breakdown advantage:** We have MGNREGA reform story, entity data (Ministry of Rural Development), problem tracker infrastructure, and the evidence chain.

**Opportunity:** Build persistent issue trackers for 2-3 flagship topics (MGNREGA, UPI/Digital Payments, India-China) that show: current state, what changed, historical timeline, key data, evidence, documents, related stories, last verified.

**Impact:** User value (repeat utility — "what changed since I last checked"), Competitive advantage (ISignal has data, we have evidence+claims), Search potential (MGNREGA is heavily searched), Compounds (every data point makes tracker more valuable).

---

## Gap 3: Topic Page Depth (HIGH PRIORITY)

**Competitor gap:** Indian Express has topic/category pages that are article lists. ISignal has project pages (Earthcheck, Education Check) that are deeper. Our World in Data has 126 topic pages that are comprehensive research hubs.

**The Breakdown advantage:** We have `buildTopicPage()` with deterministic multi-section model (In Focus / Latest / Deep Research / Important / Archive). But topic tiles on the homepage show no data (story count, claim count, entity count).

**Opportunity:** Enrich topic tiles with data counts. Add "What Changed" section to topic pages. Add evidence chain display. Make topic pages the primary research entry point.

**Impact:** User value (research starting point), Competitive advantage (depth), Search potential (topic pages rank well).

---

## Gap 4: Newsletter as Knowledge Product (MEDIUM PRIORITY)

**Competitor gap:** Every competitor has a newsletter. ISignal has project-specific newsletters. Our World in Data has two newsletters (Brief + Data Insights). The Morning Context has theme-based newsletters.

**The Breakdown advantage:** We have newsletter capture and analytics. But no archive, no sample edition, no topic preference selection.

**Opportunity:** Build newsletter archive. Create sample edition. Add topic preference during signup. Structure newsletter as: What changed → Why it matters → Evidence → What to watch.

**Impact:** User value (return utility), Competitive advantage (evidence-backed newsletter is unique), Revenue potential (owned audience).

---

## Gap 5: Author Identity (MEDIUM PRIORITY)

**Competitor gap:** Indian Express has "Expert Explains" with named experts. ISignal names researchers. The Morning Context names analysts.

**The Breakdown advantage:** We have thinker profiles (Nehru, Patel, etc.) in the knowledge library. But no author/byline system for current content.

**Opportunity:** Create author profiles with expertise areas, published work, and transparent disclosures. Surface bylines on stories.

**Impact:** User value (trust), Competitive advantage (authority), Search potential (author pages rank).

---

## Gap 6: Data Interactivity (LOW-MEDIUM PRIORITY)

**Competitor gap:** Our World in Data has 29 interactive Data Explorers. FACTLY has Data Dashboards and Counting India. ISignal has DataViz.

**The Breakdown advantage:** We have datasets (`lib/datasets/seed-data.ts`) and a data hub page. But charts are static SVGs.

**Opportunity:** Build interactive data explorers for key datasets (GDP growth, MGNREGA expenditure, trade data). Start with 1-2 explorers, not 29.

**Impact:** User value (exploration), Competitive advantage (interactive + evidence chain), Search potential (data queries).

---

## Gap 7: Search Quality (LOW-MEDIUM PRIORITY)

**Competitor gap:** Indian Express has strong search with trending and categories. Our World in Data has search across 14,085 charts.

**The Breakdown advantage:** We have search infrastructure (`features/search/view-model.ts`) but naive string matching.

**Opportunity:** Improve search with fuzzy matching, ranking, and result previews. Add search suggestions. Add advanced filtering (by type, date, evidence score).

**Impact:** User value (discovery), Search potential (internal search quality).

---

## Gap 8: About/Team Page (LOW PRIORITY)

**Competitor gap:** Every competitor has an About page. ISignal has "Our Team" and "Trustees & Patrons." The Morning Context has "Who Reads Us."

**The Breakdown advantage:** We have `app/about/page.tsx` and `app/about/team/page.tsx` but they may be thin.

**Opportunity:** Ensure About page communicates the evidence-first mission, team expertise, and editorial standards clearly.

**Impact:** User value (trust), Competitive advantage (transparency).

---

## Priority Selection

Based on: User value × Competitive advantage × Search potential × Evidence moat ÷ Implementation complexity

| Priority | Gap | Score | Rationale |
|----------|-----|-------|-----------|
| 1 | Flagship Scheme Trackers | 9/10 | Highest compound value; ISignal validates demand; uses existing infrastructure |
| 2 | Evidence Chain Visibility | 8/10 | Unique differentiator; already built but invisible |
| 3 | Topic Page Depth | 7/10 | High search potential; infrastructure exists |
| 4 | Newsletter Archive | 6/10 | Quick win; high return utility |
| 5 | Author Identity | 5/10 | Trust signal; moderate complexity |
| 6 | Data Interactivity | 5/10 | High value but high complexity |
| 7 | Search Quality | 4/10 | Important but not the first priority |
| 8 | About/Team Page | 3/10 | Quick win but low impact |

---

## Recommended First Sprint

**Build the MGNREGA Tracker as the first flagship knowledge system + persistent issue tracker.**

Why MGNREGA:
1. We already have a story about MGNREGA Reform (in `store.ts`)
2. We have entity data (Ministry of Rural Development)
3. We have problem tracker infrastructure (`/problems/[slug]/tracking`)
4. ISignal validates the demand (their Flagship Scheme Tracker includes MGNREGA)
5. High search volume for MGNREGA queries
6. Regular data releases (budget, CAG reports, employment data)
7. Solves "I want to know what changed since I last checked"
8. Connects to evidence chain (government data → claims → evidence)

Implementation:
1. Create `/trackers/mgnrega` page with current state, historical timeline, key data, evidence, documents
2. Enhance the existing MGNREGA story with tracker link
3. Add MGNREGA entity to the entity index
4. Add tracker to homepage navigation
5. Test and verify
