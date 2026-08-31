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

## Next Priorities (per priority framework)

Priority = `User value × Competitive advantage × Revenue potential × Search potential × Evidence/data moat ÷ Implementation complexity`

1. **Generalize the tracker pattern to more policy problems** (extend `lib/trackers/` model to a second flagship system — e.g. a fixed-interest / tax-tracker or a parliament-tracker) now that the renderer + canonical model exist.
2. **Surface the evidence chain on story and topic pages** — the core differentiator is currently invisible to first-time readers; make Claims/Sources/Evidence visible at the point of reading.
3. **Deepen `/trackers/mgnrega` data** — add a full MGNREGA MIS metrics time-series (person-days, expenditure, districts) and a "how this compares to other countries' job-guarantee schemes" section.
4. **Link the tracker to the topic hub** (`/topics/economy`) and to search results.

---

## Notes & Observability

- Live smoke test of `/trackers/mgnrega` after deployment: pending (requires the production push to propagate).
- External provider metrics (GA4, GSC, Beehiiv, Stripe, AdSense) remain NOT VERIFIED LIVE — unchanged from `FINAL-PRODUCTION-STATE.md` §6. Production access required; not a code blocker.
- Do not modify the frozen `FINAL-PRODUCTION-STATE.md` handoff record; this rolling file records post-handoff improvements.

Last verified: 31 Aug 2026, commit `797b68a` on `main`, origin in sync.
