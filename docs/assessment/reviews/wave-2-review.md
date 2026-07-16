# Wave 2 — Reader Orientation: Review Log

> Institutional memory for the Platform Convergence Program.
> Each sprint appends to this log.

---

## Sprint W2-S1 — Canonical Taxonomy and Reader Vocabulary

**Status:** Completed
**Product Review:** Accepted (Score: 10/10)

### Reader Problem

Readers do not understand the platform vocabulary. Terms like "Story," "Chapter," "Investigation," "Intelligence," "Entity," "Knowledge Library," and "Collection" are used inconsistently across surfaces, creating confusion about what each concept is and how they relate.

**Result:** Solved. A canonical institutional vocabulary has been established, frozen, and deferred for implementation in subsequent sprints.

### Platform Score

**Before:** 3.6 / 5
**After:** 3.6 / 5

**Rationale:** No reader-visible change. This is governance, not delivery.

### Key Deliverables

- `docs/assessment/CANONICAL-TAXONOMY.md` — v1.0, Approved, Frozen
- ~200+ reader-facing terms inventoried across 25+ surface areas
- 40 unique canonical concepts defined
- 12 terminology conflicts identified and resolved with recommendations
- 12 terms recommended for deprecation
- 6 approved synonyms for specific contexts
- Mental Model section mapping every major noun to reader comprehension

### Major Conflicts Identified

| Rank | Conflict | Resolution |
|------|----------|------------|
| 1 | "Intelligence" used 6+ ways | Deprecate as standalone noun. Replace with context-specific terms. |
| 2 | Story vs. Chapter overlap | Both retained. Chapter = belongs to larger work. Story = standalone. |
| 3 | Thinker vs. Entity | "Thinker" deprecated as top-level label. Entity hierarchy: Person, Organization, Place, etc. |

### Lessons Learned

- Language is infrastructure. Changing terminology before defining vocabulary would have increased inconsistency.
- A controlled vocabulary is the semantic foundation of the product.
- Documentation-only sprints produce governance value without code risk.

### Scope

**Maintained.** No code, no routes, no components, no architecture.

### Architecture

**Unchanged.** No architectural drift.

### Remaining Gaps

- Taxonomy implementation deferred to subsequent Wave 2 sprints.
- Six open questions require editorial input before final convergence.

## Sprint W2-S2B — Continue Learning

**Status:** Completed
**Product Review:** Accepted

### Reader Problem

"What should I do next?"

**Result:** Canonical continuation established using existing editorial relationships.

### Platform Score

**Before:** 3.8 / 5
**After:** 4.0 / 5

### Key Deliverables

- Next Chapter routing
- Related Investigation links
- Primary Documents continuation
- Return to Collection fallback

### Lessons Learned

Editorial learning paths are more valuable than recommendation systems.

### Architecture

**Unchanged.**

## Sprint W2-S3 — Reading Focus

**Status:** Completed
**Product Review:** Accepted

### Reader Problem

"What should I pay attention to while reading?"

**Result:** Reading flow clarified through stage separation, improved hierarchy, and reduced cognitive load.

### Platform Score

**Before:** 4.0 / 5
**After:** 4.2 / 5

### Key Deliverables

- Six-stage progression flow (Context → Narrative → Evidence → Reflection → Reference → Continue Learning)
- Scoped typography for Narrative to improve readability
- Stronger section heading margins and weights in HeadingBlock
- Visual blocks (Image, Map, Chart, Diagram) framed cleanly with spacing to avoid text flow interruptions

### Lessons Learned

Clean layout spacing and visual structure prevent cognitive fatigue. Scoped typography wrapper in StoryShell is safer than styling elements globally.

### Architecture

**Unchanged.**

---

### Wave 2 Status

| Sprint | Status |
|--------|--------|
| W2-S1 — Canonical Taxonomy | ✅ |
| W2-S2A — Universal Wayfinding | ✅ |
| W2-S2B — Continue Learning | ✅ |
| W2-S3 — Reading Focus | ✅ |
| W2-S4 — Knowledge Discovery | ✅ |

---

## Sprint W2-S4 — Knowledge Discovery

**Status:** Completed
**Product Review:** Accepted

### Reader Problem

"Where should I explore after this?"

**Result:** Discovery unified through existing canonical relationships.

### Platform Score

**Before:** 4.2 / 5
**After:** 4.5 / 5

### Key Deliverables

- Entity pages expose related Chapters and Investigations.
- Search surfaces Collections and Chapters after standard search results.
- Topic pages provide a unified Continue Exploring section containing Collections and Chapters.
- Knowledge Graph nodes map directly to valid canonical pages, hiding navigation options when no destination exists.

### Lessons Learned

Exposing paths using existing canonical relationships connects independent views into a coherent graph-like system without building complex personalization or discovery services.

### Architecture

**Unchanged.**

---

## Wave 2 Summary

**Objective:** Reader Comprehension

**Platform Score:** 3.6 → 4.5

**Completed Sprints:**
- W2-S1 Canonical Taxonomy
- W2-S2A Universal Wayfinding
- W2-S2B Continue Learning
- W2-S3 Reading Focus
- W2-S4 Knowledge Discovery

**Major Outcomes:**
- Canonical vocabulary established
- Universal wayfinding implemented
- Structured continuation paths added
- Reading flow improved
- Discovery unified across Search, Graph, Topics, Entities and Chapters

**Architecture:** Unchanged.
**Wave Status:** Accepted.
