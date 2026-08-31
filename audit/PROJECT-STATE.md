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

## Next Priorities (Sprint 5 & Beyond)

1. **Fourth Flagship Tracker**: PM Fasal Bima Yojana (Crop Insurance) or Climate Finance Tracker.
2. **Interactive Multi-Series Comparison**: Allow side-by-side comparison of policy metrics across states or years.
3. **Citation & Annotation Tooling**: Allow researchers to copy inline formatted BibTeX and APA citations directly from tracker document previews.

---

## Notes & Observability

- External provider metrics (GA4, GSC, Beehiiv, Stripe, AdSense) remain NOT VERIFIED LIVE — unchanged from `FINAL-PRODUCTION-STATE.md` §6. Production access required; not a code blocker.
- Do not modify the frozen `FINAL-PRODUCTION-STATE.md` handoff record; this rolling file records post-handoff improvements.

Last verified: 31 Aug 2026, Sprint 4 complete.
