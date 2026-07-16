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

## Sprint W1-S2 — Guided Entry

**Status:** Completed
**Product Review:** Accepted

### Reader Problem

A visitor understands what The Breakdown is but cannot find where to begin.

**Result:** Solved. Homepage now provides a single, unmistakable guided entry path.

### Platform Score

**Before:** 2.8 / 5
**After:** 3.0 / 5

**Rationale:** The homepage now behaves like the entrance hall of an institution. A reader discovers the starting point in under five seconds.

### Key Improvement

Hierarchy is more important than adding content. Reducing competing entry points improves clarity without redesign.

### Deliverables

- `components/home/primary-path/PrimaryPath.tsx` — rewritten as dominant museum-style entrance (dark institutional background, "The Canonical Learning Path" label, What You Will Learn preview cards, prominent emerald CTA)
- `components/home/collections/CollectionsPreview.tsx` — reframed from "Knowledge Collections" (equal options) to "Continue Your Learning" (secondary, post-Volume I)
- `components/home/latest/LatestStories.tsx` — heading changed from "Latest Intelligence" to "Further Reading" to remove news-urgency competition

### Lessons Learned

- Hierarchy is more important than adding content.
- Reducing competing entry points improves clarity without redesign.
- The museum curator mindset (one recommended path, secondary options clearly subordinate) produces a more confident reader.

### Scope

**Maintained.** No new architecture, services, styling systems, or routes.

### Architecture

**Unchanged.** No architectural drift.

### Remaining Gaps

- TrustBar duplication with InstitutionHero trust stats (deferred to W1-S3)
- Root layout metadata still says "journalism" (deferred, cross-page scope)

---

## Sprint W1-S3 — Trust in the First Viewport

**Status:** Completed
**Product Review:** Accepted

### Reader Problem

A visitor understands what The Breakdown is and where to begin, but does not know why they should trust it.

**Result:** Solved. Institutional trust is now visible before readers engage with content.

### Platform Score

**Before:** 3.0 / 5
**After:** 3.3 / 5

**Rationale:** Readers can now identify at least three institutional trust signals without scrolling — transparency documents in the hero, process-focused TrustBar, and evidence metrics — all using existing infrastructure.

### Key Improvement

Institutional trust is now visible before readers engage with content.

### Deliverables

- `components/home/hero/InstitutionHero.tsx` — added trust-document link row (Methodology, Editorial Constitution, Corrections Policy, Trust Dashboard) below CTAs. Each answers: Where can I inspect your process?
- `components/home/trust/TrustBar.tsx` — reframed from generic statistics to process signals: Editorially Reviewed · Evidence-based Research · Transparent Methodology · Corrections on Record · Last Review. Each answers: Who reviewed it? How is this verified? Where to inspect? What happens when wrong? How current?

### Lessons Learned

- Readers trust transparent editorial processes more than generic trust claims.
- Separating evidence metrics (hero) from governance commitments (TrustBar) creates a clearer mental model of institutional credibility.

### Scope

**Maintained.** No new architecture, services, styling systems, or routes.

### Architecture

**Unchanged.** No architectural drift.

### Remaining Gaps

- Root layout metadata still says "journalism" (deferred, cross-page scope)

---

*Next sprint: W1-S4 — Homepage Narrative Flow*
