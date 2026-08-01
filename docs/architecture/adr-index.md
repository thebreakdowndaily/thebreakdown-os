# Architecture Decision Register (ADR)

The ADR records important architectural decisions that were made and their rationale. ACPs propose changes; ADRs record the decisions that shaped the platform. Together they form institutional memory.

---

## ADR-001 — Canonical Objects Are the Only Source of Truth

**Date:** 2026-07-12
**Status:** Active
**Baseline:** v1.0.0-chapter1

**Decision:** Every piece of information exists once in canonical form and may be rendered many ways. A claim lives in the Claim Registry. A source lives in the Source Registry. A Fix lives in the Fix type. If code asks "where should this data live?", the answer is always: in the canonical model, not in a page.

**Rationale:** Duplication creates divergence. When two surfaces hold the same data, they eventually disagree. Canonical objects eliminate this failure mode by design.

**Consequences:** Every UI component renders canonical data — it never computes or persists knowledge. New features consume existing types rather than inventing parallel schemas.

---

## ADR-002 — Problems Are Virtual Entities Derived from Fixes

**Date:** 2026-07-20
**Status:** Active
**Baseline:** v1.0.0-chapter1

**Decision:** Problems are not persisted objects. They are derived at runtime from Fix fixtures via `extractProblems()` in `lib/problem-helpers.ts`. The Problem type exists for reader navigation, not as a separate data model.

**Rationale:** Problems and Fixes are two views of the same knowledge. Problems group Fixes by the question they answer. Separating them would create two sources of truth for the same underlying data.

**Consequences:** Problem content can never drift from Fix content. Adding a Fix automatically creates or updates its Problem. The trade-off is that Problem metadata is limited to what Fix data can express.

---

## ADR-003 — Reader Navigation Is Governed as a Public Interface

**Date:** 2026-07-26
**Status:** Active
**Baseline:** v1.0.0-chapter1

**Decision:** Navigation routes (header, footer, homepage, search) are frozen and treated as a public API. Routes may be added but existing routes may not be renamed or removed without architecture review.

**Rationale:** Navigation is how readers form mental models of the platform. Changing routes silently breaks those models. Governance ensures navigation evolves deliberately.

**Consequences:** New capabilities require new routes, not modifications to existing ones. This increases route count over time but preserves reader familiarity.

---

## ADR-004 — Trust States Use Explicit Editorial Status

**Date:** 2026-07-26
**Status:** Active
**Baseline:** v1.0.0-chapter1

**Decision:** Every Fix displays one of four trust states: Verified, Under Review, In Development, or Unknown. The state is computed from `maturityStatus` and `evidenceGrade`. Missing data shows "Under editorial review" rather than "0 sources".

**Rationale:** Trust is the platform's core promise. Readers must be able to distinguish verified knowledge from work-in-progress. Hiding incomplete data erodes trust more than displaying it honestly.

**Consequences:** Every new Fix must include `maturityStatus` and `evidenceGrade`. The TrustCard renders the appropriate state automatically. Components never display empty defaults for trust-critical fields.

---

## ADR-005 — Knowledge Graph Relationships Are Canonical

**Date:** 2026-07-26
**Status:** Active
**Baseline:** v1.0.0-chapter1

**Decision:** Relationships between Problems, Stories, Fixes, and Entities are defined in the canonical types and computed via helper functions. New relationship types must integrate into the existing graph rather than creating parallel connection mechanisms.

**Rationale:** The knowledge graph is the connective tissue of the platform. If relationships are scattered across components or computed ad hoc, the graph becomes inconsistent and untraversable.

**Consequences:** `getFixesForStory()`, `extractProblems()`, and related helpers are the canonical relationship resolvers. Components consume these functions rather than implementing their own relationship logic.

---

## ADR-006 — Architecture Is Treated as a Product

**Date:** 2026-07-26
**Status:** Active
**Baseline:** v1.0.0-chapter1

**Decision:** The architecture has its own governance (ACP process, compatibility levels, recurring reviews), its own versioning (patch/minor/major aligned to baseline), and its own release criteria (graph integrity, reader journeys, baseline review). Architecture evolves through the same disciplined process as features.

**Rationale:** A knowledge platform's longevity depends on architectural coherence more than feature breadth. Governing architecture explicitly prevents the drift that kills long-lived projects.

**Consequences:** Every Chapter 2+ change is classified by compatibility level. ACPs are required for Level B and C changes. The architecture is reviewed, not just the code.

---

## ADR-007 — One Question Per Chapter

**Date:** 2026-07-26
**Status:** Active
**Baseline:** v1.0.0-chapter1

**Decision:** Each chapter answers exactly one architectural question. Chapter 1: Can readers move from problems to evidence-backed solutions? Chapter 2: Can readers compare competing solutions? Chapter 3: Can readers understand international approaches? Chapter 4: Can readers evaluate whether solutions worked?

**Rationale:** A single question per chapter prevents scope creep and makes each release evaluable. It also creates a natural progression: foundation → comparison → global → longitudinal.

**Consequences:** Chapter 2 work must be filtered through the comparative intelligence question. Features that don't serve that question belong in a later chapter.

---

## ADR-008 — Comparative Intelligence Is a Compositional Reader Capability

**Date:** 2026-07-27
**Status:** Active
**Baseline:** v1.0.0-chapter1

**Decision:** Comparison of public-policy solutions is implemented as a render-time view composed from canonical Fix objects, not as a persisted canonical entity. A comparison has no persistent identity — no slug, no ID, no database record, no canonical URI. It exists only while rendering.

**Rationale:** Comparison is an analytical lens over existing knowledge, not knowledge itself. Persisting comparisons would create a second data model that must be kept in sync with Fix objects. URL-based selection (`/compare?fixes=slug1,slug2`) makes comparisons shareable, bookmarkable, and stateless without adding persistence.

**Consequences:**
- The Fix schema carries all comparison-relevant metadata (15 dimensions, 13 native, 2 additive optional fields).
- Comparison components compose from `Fix` objects at render time via `lib/compare-helpers.ts`.
- Factual summaries (highest evidence, lowest cost, fastest impact) are derived from canonical metadata, not stored separately.
- Editorial recommendations, if provided, are explicitly labelled as editorial judgement — not algorithmic ranking.
- Future contributors cannot gradually turn comparisons into content objects because the type system does not support it.
