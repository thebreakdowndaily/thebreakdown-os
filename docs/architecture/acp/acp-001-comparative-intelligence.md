# ACP-001: Comparative Intelligence Foundation

| Field | Value |
|-------|-------|
| **ACP ID** | ACP-001 |
| **Title** | Comparative Intelligence Foundation |
| **Chapter** | Chapter 2 — Comparative Intelligence |
| **Status** | Approved |
| **Author** | Architecture Execution Agent |
| **Date** | 26 Jul 2026 |
| **Baseline** | v1.0.0-chapter1 (Frozen) |

---

## 1. Executive Summary

Chapter 2 answers one architectural question: **Can readers compare competing public-policy solutions in a structured, evidence-backed, transparent way?**

This ACP defines the Comparative Intelligence subsystem as a canonical capability. The key architectural decision: **comparison is a view, not a new canonical object.** Comparisons are composed from existing Fix objects at render time. No new persistence, no parallel schemas, no duplicate data.

The existing Fix schema already carries 13 of 15 comparison dimensions as native fields. Two dimensions (Reversibility, Scalability) require additive metadata. The existing `computeImpactScores()` function already derives feasibility and political difficulty from canonical fields. The existing `SolutionComparisonView` demonstrates the view-composition pattern but is limited to one Problem's Fixes.

The architectural proposal adds: a cross-Problem comparison page, a comparison selection mechanism, editorial recommendation synthesis, and evidence-gap disclosure — all composed from canonical Fix objects.

### Comparison Identity

A comparison has **no persistent identity**. No slug. No ID. No database record. No canonical URI. It exists only while rendering. This prevents future contributors from gradually turning comparisons into content objects.

### Evidence Synthesis vs Editorial Recommendation

The comparison engine should **aggregate**, **contrast**, and **surface trade-offs**. It should **not automatically rank** or declare a winner.

Factual summaries derived from canonical metadata:
- Highest evidence
- Lowest implementation cost
- Fastest expected impact
- Largest implementation complexity
- Strongest supporting research

If an overall recommendation exists, it must come from **explicit editorial judgement**, not implicit scoring. This keeps the analytical layer separate from editorial opinion.

---

## 2. Architectural Overview

### What exists today

| Capability | Component | Limitation |
|-----------|-----------|------------|
| Single-Problem comparison | `SolutionComparisonView` | Locked to one Problem's Fixes |
| Trade-offs display | `TradeOffsMatrix` | Single Fix only |
| Impact assessment | `ImpactScorecard` | Single Fix only |
| Executive summary | `ExecutiveSummaryPanel` | Single Fix only |
| Cross-Problem navigation | Problem → Fix via `RelatedFixGrid` | No comparison across Problems |

### What Chapter 2 adds

| Capability | Description |
|-----------|-------------|
| Cross-Problem comparison | Compare Fixes from different Problems |
| Comparison selection | Reader selects 2–5 Fixes to compare |
| Structured comparison matrix | Side-by-side dimension comparison |
| Evidence synthesis | Aggregate evidence across selected Fixes |
| Editorial recommendation | Editorial judgment on optimal Fix per dimension |
| Evidence-gap disclosure | Honest representation of missing or conflicting evidence |

### What Chapter 2 does NOT add

- New canonical types
- New persistence models
- Comparison as a node in the Knowledge Graph
- Automated recommendation (editorial judgment only)
- Real-time data integration

---

## 3. Canonical Object Analysis

### Fix fields that participate in comparison

| Dimension | Fix Field | Type | Existing? |
|-----------|-----------|------|-----------|
| Evidence Quality | `evidenceScore` | `number` | ✅ |
| Evidence Grade | `evidenceGrade` | `EvidenceGrade` | ✅ |
| Implementation Cost | `fiscalCost` | `CostEstimate` | ✅ |
| Time Horizon | `timeToImpact` | `TimeHorizon` | ✅ |
| Implementation Difficulty | derived from `maturityStatus` | `PolicyMaturity` | ✅ (via `computeImpactScores`) |
| Political Feasibility | derived from `primaryCategory` | `InterventionType` | ✅ (via `computeImpactScores`) |
| Expected Impact | `evidenceScore` + `evidenceGrade` | composite | ✅ (via `computeImpactScores`) |
| Trade-offs | `tradeOffs` | `TradeOffItem[]` | ✅ |
| Risks | `risksAndFailures` | `RiskItem[]` | ✅ |
| Stakeholders | `stakeholders` | `Stakeholder[]` | ✅ |
| Affected Population | `beneficiaryGroups` + `disadvantagedGroups` | `string[]` | ✅ |
| Global Adoption | `globalPrecedents` | `GlobalExample[]` | ✅ |
| Confidence Level | `evidenceGrade` | `EvidenceGrade` | ✅ (via `computeImpactScores`) |

### Fields that are missing

| Dimension | Required | Proposed Field | Type |
|-----------|----------|---------------|------|
| Reversibility | Yes — readers need to know if a reform can be undone | `reversibility?: 'fully_reversible' \| 'partially_reversible' \| 'irreversible'` | Optional enum on Fix |
| Scalability | Yes — readers need to know if a reform scales nationally | `scalability?: 'local_only' \| 'state_level' \| 'national' \| 'universal'` | Optional enum on Fix |

### Derivable dimensions (no new fields needed)

| Dimension | Derivation |
|-----------|-----------|
| Implementation Difficulty | `computeImpactScores(fix).feasibility` — derived from `maturityStatus` |
| Political Feasibility | `computeImpactScores(fix).political` — derived from `primaryCategory` |
| Administrative Complexity | `primaryCategory` + `maturityStatus` — institutional reforms are more complex than fiscal ones |
| Confidence Level | `computeImpactScores(fix).confidenceFrac` — derived from `evidenceGrade` |

### Assessment

**13 of 15 dimensions are already supported by the canonical Fix schema.** The two missing dimensions (Reversibility, Scalability) are additive optional fields. No fields need to be removed, renamed, or restructured.

---

## 4. Comparison Model

### Architectural principle

Comparison is a **view**, not a **canonical object**. It is computed at render time from selected Fix objects. It does not persist. It does not create new nodes in the Knowledge Graph. It does not store reader selections.

### Comparison is composed from:

1. **Selected Fix objects** — the reader chooses 2–5 Fixes
2. **Existing helper functions** — `computeImpactScores()`, `formatCostLabel()`, `getEvidenceLabel()`
3. **Existing type definitions** — `Fix`, `TradeOffItem`, `RiskItem`, `Stakeholder`
4. **New additive metadata** — `reversibility` and `scalability` (optional on Fix)

### Comparison is NOT:

- A new `ComparisonModel` type
- A `ComparisonStore` or `ComparisonService`
- A persisted reader state
- A node in the Knowledge Graph
- A new canonical object

### Selection mechanism

The reader selects Fixes from:
- The Problem detail page (all Fixes for that Problem)
- The Fix Hub (any Fix)
- Search results
- Related Fixes on any Fix page

Selection state is URL-based: `/compare?fixes=slug1,slug2,slug3`. This makes comparisons shareable, bookmarkable, and undoable without state management.

Maximum 5 Fixes per comparison. Minimum 2. The UI enforces this constraint.

---

## 5. Reader Journey

### Primary journey

```
Problem
    ↓
Available Fixes (RelatedFixGrid)
    ↓
Select 2–5 Fixes (checkbox/selection UI)
    ↓
Compare (navigates to /compare?fixes=slug1,slug2)
    ↓
Structured Comparison Matrix
    ├── Evidence Quality (bar chart)
    ├── Implementation Cost (formatted)
    ├── Time Horizon (label)
    ├── Implementation Difficulty (derived)
    ├── Political Feasibility (derived)
    ├── Trade-offs (side-by-side)
    ├── Risks (side-by-side)
    ├── Global Precedents (count + countries)
    ├── Stakeholders (list)
    └── Affected Population (list)
    ↓
Evidence Synthesis
    ├── Aggregate evidence grade
    ├── Confidence comparison
    └── Evidence gaps disclosed
    ↓
Editorial Recommendation
    ├── Per-dimension recommendation
    └── Overall recommendation (editorial judgment)
    ↓
Related Stories
    ↓
Related Problems
    ↓
Return to exploration
```

### Secondary journeys

**From Fix Hub:**
```
Fix Hub → Select Fixes → Compare
```

**From Search:**
```
Search → Find Fixes → Select → Compare
```

**From any Fix page:**
```
Fix page → "Compare with similar" → Select additional Fixes → Compare
```

### Integration with Chapter 1 navigation

The `/compare` route is a new addition to the frozen navigation. Per ADR-003, routes may be added but existing routes may not be renamed or removed. This is a Level A addition.

The comparison page links back to:
- Each compared Fix's detail page
- The Problem(s) the Fixes belong to
- The Fix Hub
- Related Stories

---

## 6. Knowledge Graph Impact

### Comparison is NOT a graph node

Comparison does not create a new entity type in the Knowledge Graph. It is a temporary view over existing nodes.

### Comparison exposes existing relationships

When a reader compares Fixes, the comparison page reveals:
- Which Problems each Fix belongs to (existing `Problem → Fix` relationship)
- Which Stories each Fix is linked to (existing `Fix → Story` relationship)
- Which Entities each Fix involves (existing `Fix → Entity` relationship)
- How Fixes relate to each other through shared Problems, Entities, or Stakeholders

### New relationship: cross-Problem comparison

Currently, Fixes are only compared within a single Problem (via `SolutionComparisonView`). Chapter 2 introduces the ability to compare Fixes across Problems. This does not require a new relationship type — it is a view over existing `Problem → Fix` relationships.

### Graph integrity

The comparison view does not modify, remove, or add any graph edges. It reads existing relationships and presents them in a comparative layout. No fitness functions are affected.

---

## 7. Trust Model

### Trust during comparison

When a reader compares Fixes, trust information must be visible for each Fix:

| Trust Signal | How It Appears in Comparison |
|-------------|------------------------------|
| Evidence grade | Badge next to each Fix's evidence score |
| Trust state | Verified / Under Review / In Development per Fix |
| Missing evidence | "Under editorial review" for empty sourceIds |
| Conflicting evidence | Highlighted when `evidenceGrade: 'Contested'` |
| Research gaps | `unknownsAndGaps` surfaced per Fix |
| Confidence level | Bar chart comparison of `confidenceFrac` |

### Evidence synthesis

The comparison page aggregates evidence across selected Fixes:
- Overall evidence grade (weighted by `evidenceScore`)
- Confidence comparison (which Fix has stronger evidence)
- Evidence gaps (which Fix has missing or contested data)
- Source count comparison (how many sources support each Fix)

### Editorial recommendation

The comparison page includes editorial recommendations:
- Per-dimension: which Fix performs best on each comparison dimension
- Overall: editorial judgment on which Fix is strongest, with reasoning
- Caveats: what the recommendation does not account for

The editorial recommendation is **not automated**. It is written by editors and stored as part of the comparison page content, not derived from algorithms.

---

## 8. Compatibility Assessment

### Classification: Level A (Additive)

| Check | Assessment |
|-------|-----------|
| Frozen schemas modified? | No — two optional fields added to Fix (`reversibility`, `scalability`). Optional field addition is explicitly permitted by baseline governance. |
| Frozen navigation modified? | No — `/compare` is a new route. Route addition is explicitly permitted. |
| Knowledge graph edges changed? | No — comparison reads existing edges. |
| Reader journeys broken? | No — all existing journeys continue to work. |
| New canonical objects created? | No — comparison is a view, not a canonical object. |
| Duplicate data introduced? | No — comparison composes from canonical Fix objects. |

**Rationale:** This is purely additive. New route, new optional metadata, new view. No existing functionality changes. No migration required.

---

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Comparison becomes a de facto canonical object | Low | High | ACP-001 explicitly defines comparison as a view. ADR-001 governs canonical primacy. |
| URL-based selection becomes unwieldy with many Fixes | Medium | Low | Cap at 5 Fixes. URL remains manageable. |
| Evidence synthesis creates false confidence | Medium | High | Always disclose evidence gaps. Never aggregate without qualification. |
| Editorial recommendations are mistaken for automated | Low | Medium | Label clearly as "Editorial Assessment." Never use algorithmic language. |
| Cross-Problem comparison confuses readers | Medium | Medium | Always show which Problem each Fix belongs to. Provide "Back to Problem" links. |

---

## 10. Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|---------------|
| Comparison as a new canonical type | Violates ADR-001 (canonical objects are the only source of truth). Creates a second persistence model. |
| Comparison as a stored reader state | Requires session/persistence. Adds complexity. URL-based is simpler, shareable, bookmarkable. |
| Automated recommendation engine | Violates the editorial trust contract. Recommendations must be human-authored. |
| Comparison limited to same-Problem Fixes | Already exists as `SolutionComparisonView`. Chapter 2 explicitly requires cross-Problem comparison. |
| Comparison as a Knowledge Graph node | Creates an entity that doesn't represent real knowledge. Comparison is a view, not a thing. |

---

## 11. Acceptance Criteria

Before ACP-001 can be marked Implemented:

- [ ] `/compare` route renders with URL-based Fix selection
- [ ] Comparison matrix shows all 15 dimensions for 2–5 selected Fixes
- [ ] Evidence synthesis aggregates evidence across selected Fixes
- [ ] Evidence gaps are disclosed for each Fix
- [ ] Editorial recommendations are clearly labeled as editorial
- [ ] Each compared Fix links back to its detail page
- [ ] Each compared Fix shows which Problem it belongs to
- [ ] Selection UI works from Problem detail page, Fix Hub, and Fix detail page
- [ ] Maximum 5 Fixes enforced; minimum 2 enforced
- [ ] TypeScript clean
- [ ] Tests passing
- [ ] Build succeeds
- [ ] All five fitness functions pass
- [ ] Reader journey: Problem → Select Fixes → Compare → Evidence Synthesis → Recommendation → Back to exploration
- [ ] **AC-15:** Comparison remains fully functional if only two Fixes are selected
- [ ] **AC-16:** Missing optional metadata (such as `reversibility` or `scalability`) degrades gracefully without blocking comparison
- [ ] **AC-17:** The comparison view introduces no duplicate canonical data or persisted comparison state

---

## 12. Recommendation

**Approve ACP-001 as Level A (Additive).**

The Comparative Intelligence subsystem is architecturally sound because:

1. **It composes from canonical objects.** No new persistence, no parallel schemas.
2. **The Fix schema already supports 13 of 15 comparison dimensions.** Only two optional fields are needed.
3. **The view pattern is proven.** `SolutionComparisonView` already demonstrates the composition approach.
4. **It integrates with the Knowledge Graph without modifying it.** Comparison reads existing edges.
5. **It preserves all five Chapter 1 contracts.** Canonical Data, Reader Experience, Knowledge Graph, Editorial Trust, and Compatibility are all maintained.

The minimum viable implementation requires:
- One new route (`/compare`)
- Two optional fields on Fix (`reversibility`, `scalability`)
- One new comparison page component
- One new comparison selection component
- Extension of existing helper functions for cross-Fix comparison
- Editorial content for recommendations

This is a straightforward Level A addition that deepens the platform's analytical capabilities while preserving the Chapter 1 baseline.
