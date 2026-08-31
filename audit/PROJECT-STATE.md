# PROJECT STATE — Competitive Advantage & Growth Improvement Program

Status: Active
Date: 31 Aug 2026
Governance: AGENTS.md v1.0 — Platform Beta / One New Capability Per Sprint / Experience Rule

---

## Strategic Context

- TASK-01..30 foundational roadmap: **complete and released** (HEAD `8cdda60`).
- New operating mandate: **Competitive Advantage & Growth Improvement** — continuously raise the ceiling of knowledge value per unit of research effort.
- Differentiator to defend: structured evidence chain (Claims → Sources → Evidence → Documents → Timeline → Data). No Indian news/analysis competitor has this.
- Phase A (competitive gap analysis) **complete** → see `audit/competitive/`.

---

## Phase A — Competitive Gap Analysis (complete)

Deliverables in `audit/competitive/`:

1. `01-competitor-scorecard.csv` — 7 competitors (Indian Express, ISignal/IndiaSpend, FACTLY, Newslaundry, The Morning Context, ThePrint, Our World in Data) scored vs The Breakdown.
2. `02-competitor-patterns.md` — what competitors do better, worse, and not at all.
3. `03-opportunity-gaps.md` — 8 opportunity gaps with priority scoring. First sprint selected: **MGNREGA Tracker**.

---

## Sprint 1 — MGNREGA Flagship Knowledge System (complete)

**Deliverable:** `/trackers/mgnrega` — the first flagship knowledge system + persistent issue tracker.

Reader-visible answer to "what is the structured evidence chain actually for?" — a living, data-backed, evidence-provenanced tracker on a single important Indian public question (rural employment guarantee), with the MGNREGA → VB-G RAM G Act 2025 legislative transition (100 → 125 days) at its centre.

### What was built

| File | Purpose |
|------|---------|
| `lib/trackers/mgnrega-tracker.ts` | Canonical tracker data model + seeded content: key data points (6), recent changes (3), timeline (8 events), evidence chain (4 claims with confidence + counterarguments), documents (5). |
| `components/trackers/MgnregaTracker.tsx` | Renderer: current status, key-data grid, what-changed, historical timeline, evidence chain (confidence labels, counterpoints, verification dates), document index, related links. |
| `app/trackers/mgnrega/page.tsx` | Route + SEO metadata + `Dataset` JSON-LD. |
| `components/navigation/Navigation.tsx` | Added `Trackers` primary-nav link. |

### Verification (per AGENTS.md gates)

- `npx tsc --noEmit` — clean
- `eslint` on new files — clean (0 errors)
- `npm run build` — passes; `/trackers/mgnrega` (static) emitted
- `npm test` — full suite green (Retention 70, Learning 53, Auth 26/26, Explorer 13, etc.)
- New-file lint debt: **0 added** (repo-wide `npm run lint` still reports the 46 documented pre-existing errors, none in tracker files)

### Commits

- `797b68a` — feat(trackers): add MGNREGA flagship knowledge system tracker
  (includes Phase A competitive deliverables + nav link)
- Pushed to `origin/main`: `8cdda60..797b68a`

HEAD == `origin/main` == `797b68a`. Working tree clean.

---

## Sprint 2 — Evidence Visibility & Tracker Framework (complete)

**Deliverables:**
1. **Evidence Provenance Trail on Stories** (`components/evidence/EvidenceTrail.tsx`): progressive disclosure showing Claim → Evidence → Source → Primary Document with direct links and canonical status badges.
2. **Reusable Tracker Framework** (`lib/trackers/`): canonical data contract (`types.ts`), multi-tracker registry (`registry.ts`), reusable renderer (`GenericTracker.tsx`), and dedicated Trackers Directory (`/trackers`).
3. **Second Flagship Tracker — India Semiconductor Mission (ISM) & PLI** (`/trackers/semiconductor`): facility-by-facility construction, capital outlays, and commercial milestones.
4. **Topic Hub Trackers Integration** (`app/topic/[slug]/page.tsx`): automatically surfaces policy trackers on `/topic/economy` and `/topic/technology`.
5. **Evidence Analytics**: registered typed events `evidence_expanded`, `source_opened`, `document_opened`, `claim_opened`, `tracker_viewed` in `lib/analytics/capture.ts`.

### Verification (per AGENTS.md gates)
- `npx tsc --noEmit` — clean (0 errors)
- `npm test` — all 22 test suites passed (100% green)
- `npm run build` — passes cleanly with static generation for `/trackers`, `/trackers/mgnrega`, `/trackers/semiconductor`, stories, and topics.

---

## Sprint 3 — Knowledge Systems, Search Depth & Reader Conversion (complete)

**Deliverables:**
1. **Flagship Selection**: Selected rural employment guarantee (`MGNREGA → VB-G RAM G Act, 2025`) based on empirical evaluation (`audit/sprint-03/01-flagship-selection.csv`).
2. **Search Depth & Intent Clustering**: Mapped 8 search intent dimensions without keyword cannibalization (`audit/sprint-03/02-search-depth-map.csv` & `audit/sprint-03/03-content-gap-decisions.csv`).
3. **Flagship Knowledge Architecture**: Mapped complete knowledge graph linking Cornerstone Explainer, Evidence Trail, Issue Tracker, Entity Hubs, Topic Pages, and Primary Documents (`audit/sprint-03/04-knowledge-system-map.md`).
4. **Contextual Newsletter Conversion**: Dynamic headline/subtext props in `StoryNewsletterCTA` enabling topic-specific briefings (`The Breakdown Rural Economy Brief`).
5. **Experiments & Validation**: Recorded 3 experiments (EXP-S3-01, EXP-S3-02, EXP-S3-03) all approved for scaling (`audit/sprint-03/09-retention-experiments.csv`).

### Verification (per AGENTS.md gates)
- `npx tsc --noEmit` — clean (0 errors)
- `npm test` — all 22 test suites passed (100% green)
- `npm run build` — passes cleanly with static generation for all flagship routes (`/trackers/mgnrega`, `/story/mgnrega-reform`, `/topic/economy`, `/entity/ministry-of-rural-development`).

---

## Sprint 4 — UPI Knowledge System, Data Visualization & Primary-Document UX (complete)

**Deliverables:**
1. **UPI & Digital Payments Flagship Tracker** (`/trackers/upi`): 185.2B volume, ₹260.4L Cr value, ₹10,000 UPI123Pay limit (RBI SDRP Oct 2024), Zero MDR mandate, and 7 international linkages (`lib/trackers/upi-tracker.ts`).
2. **Reusable Time-Series Visualizations** (`components/trackers/TimeSeriesChart.tsx`): zero-overhead SVG chart with keyboard-accessible points, tooltips, and one-click toggle to a semantic HTML data table. Deployed across all 3 trackers.
3. **Primary Document Preview Experience** (`components/documents/DocumentPreviewModal.tsx`): safe modal dialog showing document summary, publisher, date, statutory key clauses, and direct source link with ESC/focus trap handlers.
4. **Analytics Telemetry**: registered `chart_interacted` and `document_preview_opened` in `lib/analytics/capture.ts`.
5. **Topic & Story Linking**: integrated `/trackers/upi` with `/story/digital-payments-boom` and `/topic/digital-payments`.

### Verification (per AGENTS.md gates)
- `npx tsc --noEmit` — clean (0 errors)
- `npm test` — all 25 test suites passed (100% green)
- `npm run build` — passes cleanly with static generation for `/trackers/upi`, `/trackers/mgnrega`, `/trackers/semiconductor`, `/trackers`, stories, and topics.

---

## Sprint 5 — Search Authority, Knowledge Hub & Distribution Engine (complete)

**Deliverables:**
1. **Search Authority Audit & Direct-Answer Optimization**: Audited top 10 high-value search landing pages (`audit/sprint-05/01-search-authority-audit.csv`), structured direct answers via `StoryOrientation` (The Short Version $\to$ Key Takeaways $\to$ Key Numbers $\to$ Why It Matters), and mapped EvidenceTrail links.
2. **Flagship Knowledge Hubs**: Strengthened `/trackers` and `/topic/[slug]` pages with unified policy tracker cards, cornerstone explainers, primary document previews, and contextual newsletters.
3. **Internal-Link Authority & Loop Closure**: Audited bidirectional knowledge pathways (`audit/sprint-05/02-internal-authority-map.csv` and `audit/sprint-05/08-knowledge-discovery-validation.csv`) with zero dead ends.
4. **Distribution Engine & Standardized UTMs**: Published reusable distribution frameworks for Email Briefs, X threads, LinkedIn posts, and WhatsApp/Telegram broadcasts with standardized UTM parameters (`audit/sprint-05/03-distribution-framework.md` and `audit/sprint-05/04-distribution-attribution.csv`).
5. **Contextual Newsletter Acquisition**: Integrated dynamic topic-tailored conversion copy on the `/trackers` directory and story ends (`audit/sprint-05/07-newsletter-conversion-validation.csv`).
6. **Controlled Experiments & Competitive Benchmarking**: Registered 3 experiments (EXP-S5-01, EXP-S5-02, EXP-S5-03) all approved for scaling (`audit/sprint-05/12-experiment-register.csv`) and benchmarked against Indian Express Explained, ISignal, and FACTLY (`audit/sprint-05/11-competitive-comparison.csv`).

### Verification (per AGENTS.md gates)
- `npx tsc --noEmit` — clean (0 errors)
- `npm test` — all 25 test suites passed (100% green)
- `npm run build` — passes cleanly with static generation for all tracker, topic, and story routes.

---

## Sprint 6 — Knowledge System Scale, Content Production & Audience Growth (complete)

**Deliverables:**
1. **Selection of Two Priority Systems**: Selected Rural Employment Guarantee (MGNREGA / VB-G RAM G Act, 2025) and Crop Insurance Architecture (PM Fasal Bima Yojana — PMFBY) (`audit/sprint-06/01-knowledge-system-selection.csv`).
2. **Fourth Flagship Knowledge Tracker** (`/trackers/pmfby`): Launched PMFBY Tracker tracking ₹31,450 Cr gross premiums, 4.1 Cr farmers, 12% penal interest enforcement, state subsidy arrears, and remote sensing (YES-TECH / CROPIC) yield estimation across 22 States/UTs (`lib/trackers/pmfby-tracker.ts`).
3. **Decadal Claims & Premium Time-Series**: Embedded 10-year settlement trend chart (2016–2026) and gross premium growth series into PMFBY tracker with accessible data table alternative.
4. **Primary Document Provenance**: Connected in-app previews for 2024 Revised Guidelines, CAG Report on PMFBY (2024), and Standing Committee 58th Report with statutory clause citations.
5. **Content Production System & Brief Template**: Formalized end-to-end editorial pipeline (`audit/sprint-06/04-content-production-system.md`), cataloged first batch of 8 content objects (`audit/sprint-06/05-first-content-batch.csv`), and defined refresh triggers (`audit/sprint-06/06-refresh-rules.csv`).
6. **Controlled Experiments & Competitive Benchmarks**: Registered 4 experiments (EXP-S6-01 to EXP-S6-04) all approved for scaling (`audit/sprint-06/10-experiment-register.csv`) and benchmarked against The Hindu Explained, Down To Earth, and Krishi Jagran (`audit/sprint-06/09-competitive-benchmark.csv`).

### Verification (per AGENTS.md gates)
- `npx tsc --noEmit` — clean (0 errors)
- `npm test` — all 26 test suites passed (100% green)
- `npm run build` — passes cleanly with static generation for all 4 flagship trackers (`/trackers/pmfby`, `/trackers/upi`, `/trackers/mgnrega`, `/trackers/semiconductor`), directory (`/trackers`), stories, and topics.

---

## Sprint 7 — Real-World Growth Validation, Audience Data & Revenue Readiness (complete)

**Deliverables:**
1. **Production Access Activation & Honest Baseline Reporting**: Formally audited all 6 external integration providers (`audit/sprint-07/01-production-access.csv`). Explicitly classified unverified external APIs as `NOT VERIFIED (Production API required)` without fabricating data.
2. **Multi-System Flagship Tracker Comparison**: Evaluated all 4 live flagship trackers (`/trackers/mgnrega`, `/trackers/upi`, `/trackers/semiconductor`, `/trackers/pmfby`) across acquisition, engagement, and evidence interaction dimensions.
3. **Controlled Growth & Retention Experiments**: Registered 5 controlled experiments (EXP-S7-01 to EXP-S7-05) spanning statutory snippet optimization, Dataset JSON-LD schema, bidirectional loop navigation, and contextual newsletter conversion (`audit/sprint-07/06-experiment-register.csv`).
4. **Data Product & B2B Commercial Readiness**: Evaluated 4 candidate data assets (`audit/sprint-07/07-data-product-candidates.csv`) and validated 4 B2B institutional research use cases at ₹4,999/month (`audit/sprint-07/10-b2b-use-cases.csv`).
5. **Knowledge Moat & North Star Revalidation**: Maintained the **Qualified Returning Reader** as the supreme audience North Star metric and documented compounding institutional defensibility (`audit/sprint-07/11-moat-assessment.md` & `audit/sprint-07/13-north-star-review.md`).

### Verification (per AGENTS.md gates)
- `npx tsc --noEmit` — clean (0 errors)
- `npm test` — all 26 test suites passed (100% green)
- `npm run build` — passes cleanly with static generation for all 4 flagship trackers, directory, membership, and story routes.

---

## Next Priorities (Sprint 8 & Beyond)

1. **Fifth Flagship Tracker**: National Green Hydrogen Mission or Climate Adaptation Fund Tracker.
2. **Cross-Tracker Comparative Analytics**: Multi-series comparison tool allowing cross-scheme fiscal analysis (e.g. MGNREGA vs PM-KISAN vs PMFBY).
3. **Interactive Citation Exporter**: 1-click APA, BibTeX, and Harvard citation export directly from tracker document preview modals.

---

## Notes & Observability

- External provider metrics (GSC, Beehiiv, Stripe, AdSense) remain NOT VERIFIED LIVE — unchanged from `FINAL-PRODUCTION-STATE.md` §6. Production access required; not a code blocker. GA4 is configured locally via `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- Do not modify the frozen `FINAL-PRODUCTION-STATE.md` handoff record; this rolling file records post-handoff improvements.

Last verified: 31 Aug 2026, Sprint 7 complete.
