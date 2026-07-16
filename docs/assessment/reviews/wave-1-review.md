# Wave 1 — Reader Arrival: Review Log

> Institutional memory for the Platform Convergence Program.
> Each sprint appends to this log.

---

## Sprint W1-S1 — Institutional Identity

**Status:** Completed
**Product Review:** Accepted

### Reader Problem

A first-time visitor cannot immediately understand what The Breakdown is.

**Result:** Solved. A visitor now understands the institution, its purpose, and what they can do, within the first 30 seconds.

### Platform Score

**Before:** 2.5 / 5
**After:** 2.8 / 5

**Rationale:** The first-time reader now understands what this is, why it exists, and what they can do. Directly improves Reader Arrival.

### Deliverables

- `components/home/hero/InstitutionHero.tsx` — new server component
- `app/page.tsx` — replaced story-based Hero with InstitutionHero, removed news-first hero pattern

### Revisions (Product Review)

| Revision | Change |
|----------|--------|
| R1 | Value proposition rewritten to explain reader experience, not just philosophy |
| R2 | Trust metrics relabelled: Reviewed Chapters, Evidence-backed Claims, Last Editorial Review |
| R3 | Badge changed from "Knowledge Institution" to "Evidence-first Knowledge Platform" |
| R4 | Secondary CTA verified — `/methodology` is complete and reader-ready |

### Lessons Learned

- Institutional messaging must explain the reader experience, not just the editorial philosophy.
- Hero badge should communicate value to readers, not organizational classification.
- Trust metric labels are an opportunity to reinforce institutional rigour.

### Scope

**Maintained.** No new architecture, services, styling systems, or routes.

### Architecture

**Unchanged.** No architectural drift.

### Remaining Gaps

- TrustBar duplicates InstitutionHero trust stats (deferred to W1-S3)
- Root layout metadata still says "journalism" (deferred, cross-page scope)
- No Start Here path yet (W1-S2)

---

*Next entry: Sprint W1-S2 — Guided Entry*
