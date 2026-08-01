# Baseline: v1.0.0-chapter1

**Tag:** `v1.0.0-chapter1`
**Status:** Stable
**Established:** 26 Jul 2026

---

## Chapter 1 Contracts

Chapter 1 establishes five contracts that define the platform beyond any individual feature. These contracts are the architectural inheritance of every future chapter.

### 1. Canonical Data Contract

Canonical objects remain the single source of truth. No parallel persistence, no competing schemas, no duplicate data models. A claim lives in the Claim Registry. A source lives in the Source Registry. A Fix lives in the Fix type. If code asks "where should this data live?", the answer is always: in the canonical model.

### 2. Reader Experience Contract

`Problem → Story → Fix → Evidence → Trust` is the canonical reader journey. Navigation is a public interface. Routes may be added but existing routes are stable unless intentionally versioned. A reader who learns the navigation model once can use it across the entire platform.

### 3. Knowledge Graph Contract

Relationships are governed, not inferred ad hoc. Every new entity type integrates into the graph instead of creating isolated structures. The graph is the connective tissue of the platform — it must remain traversable, consistent, and honest about what it knows.

### 4. Editorial Trust Contract

Trust state is explicit. Verified, Under Review, In Development, and Unknown are all distinguishable. Missing data is represented honestly ("Under editorial review") rather than hidden or faked. A reader can always answer: Why should I trust this? When was it last verified? What evidence supports it?

### 5. Compatibility Contract

Future chapters extend the platform without invalidating Chapter 1 unless a deliberate baseline revision is approved. Changes are classified as Additive (A), Compatible Evolution (B), or Breaking (C). Level A ships freely. Level B requires review. Level C requires a new baseline.

---

## Governance

### Architecture Change Proposal (ACP)

All changes that affect the frozen baseline must be submitted as an ACP before implementation. The template is at `docs/architecture/acp-template.md`. ACPs are one page with six sections: Problem Statement, Architectural Impact, Compatibility Assessment, Alternatives Considered, Migration Plan, and Acceptance Criteria.

### Architecture Decision Register (ADR)

Important architectural decisions are recorded in `docs/architecture/adr-index.md`. ACPs propose changes; ADRs record the decisions that shaped the platform. Together they form institutional memory. New ADRs are added whenever a significant architectural choice is made and documented.

### Architectural Fitness Functions

The platform's contracts are validated by repeatable checks defined in `docs/architecture/fitness-functions.md`. These are permanent architectural expectations, not release-specific checklists. They cover: Canonical Integrity, Knowledge Graph Integrity, Reader Journey Integrity, Trust Integrity, and Compatibility Integrity.

### Architecture Execution Agent

Implementation against the baseline follows the operational doctrine in `docs/architecture/execution-agent.md`. It defines the pre-implementation checklist, compatibility classification rules, stop conditions, fitness function verification, and completion report format. Every implementation against the baseline uses this process.

### Compatibility Levels

| Level | Name | Description | Requirement |
|-------|------|-------------|-------------|
| **A** | Additive | New components, new pages, optional metadata, new reader capabilities | No migration. No review required. |
| **B** | Compatible Evolution | New relationships, extended search, additional trust metadata, new comparison views | Architectural review. Existing content continues to work. |
| **C** | Breaking | Schema changes, removing canonical fields, navigation restructuring, relationship semantics changing | New baseline version. Documented migration. Architecture review required. |

Level A changes ship freely. Level B changes require an ACP reviewed by at least one architect. Level C changes require a new baseline tag, a migration plan, and sign-off from two reviewers.

### Version Semantics

| Version | Meaning |
|---------|---------|
| Patch (`1.0.x`) | Bug fixes only. No architectural changes. No ACP required. |
| Minor (`1.x.0`) | New reader capabilities compatible with the current baseline. Level A or B changes. |
| Major (`2.0.0`) | New baseline with breaking architectural changes. Level C changes. Requires new ACP and migration plan. |

---

## Recurring Reviews

### 1. Baseline Review

Occurs only when publishing a new baseline (e.g., Chapter 2). Answers three questions:

- Is a new baseline required?
- Is the previous baseline still supported?
- What compatibility guarantees change?

### 2. Graph Integrity Review

Run before every release. Verifies:

- No orphaned entities
- No broken relationships
- No duplicate canonical data
- Graph traversal remains complete

This is the knowledge platform equivalent of a schema migration check.

### 3. Reader Journey Review

A feature is not complete simply because it compiles — it should also integrate into the reader's end-to-end journey. The AR-13C audit methodology is a permanent release gate. Every release includes a representative journey spot-check.

---

## Frozen Schemas

The following canonical types are frozen as of this baseline. They may not be renamed, restructured, or have required fields added or removed without architecture review.

| Schema | Location | Frozen Since |
|--------|----------|-------------|
| `Fix` | `types/canonical.ts` | v1.0.0-chapter1 |
| `Story` | `types/canonical.ts` | v1.0.0-chapter1 |
| `Problem` | `lib/problem-helpers.ts` | v1.0.0-chapter1 |
| `SearchIndexEntry` | `types/canonical.ts` | v1.0.0-chapter1 |
| `EvidenceGrade` | `types/canonical.ts` | v1.0.0-chapter1 |
| `PolicyMaturity` | `types/canonical.ts` | v1.0.0-chapter1 |
| `TimeHorizon` | `types/canonical.ts` | v1.0.0-chapter1 |

Optional fields may be added to frozen schemas without architecture review. Required field removal or renaming requires review.

---

## Frozen Navigation

The following navigation surfaces are frozen. Routes may be added but existing routes may not be renamed or removed without architecture review.

| Surface | Routes |
|---------|--------|
| Header | `/stories`, `/investigations`, `/data`, `/fix`, `/topics`, `/problems` |
| Footer | Sections, Topics, Knowledge Library, Governance groups |
| Homepage | 8-section layout (Lead Story through Newsletter) |
| Search | `/search` with grouped results (Stories, Entities, Topics, Problems, Fixes, etc.) |

---

## Frozen Knowledge Graph

The following relationship model is frozen. New relationship types may be added but existing bidirectional links may not be removed without architecture review.

```
Problem ←→ Fix (via fix.problem.title / getFixesForStory)
Story ←→ Fix (via fix.storySlug / fix.relatedStories)
Story ←→ Story (via story.relatedStoryIds)
Story ←→ Entity (via story.relatedEntityIds)
Problem ←→ Problem (derived from shared Fix categories)
```

---

## Chapter Success Criteria

Each chapter answers one architectural question. This prevents scope creep and makes each release evaluable.

| Chapter | Question |
|---------|----------|
| **Chapter 1 — Knowledge Foundation** | Can readers reliably move from problems to evidence-backed solutions? |
| **Chapter 2 — Comparative Intelligence** | Can readers compare competing solutions in a structured, evidence-based way? |
| **Chapter 3 — Global Intelligence** | Can readers understand how other jurisdictions approached the same problem? |
| **Chapter 4 — Measured Outcomes** | Can readers evaluate whether a solution actually worked over time? |

---

## Release Contents

### Capabilities

- Stories (40 public)
- The Fix Hub (6 canonical Fix fixtures)
- Problem Intelligence Explorer (6 problems derived from Fixes)
- Search (stories, entities, topics, organizations, countries, timelines, fixes, problems)
- Trust layer (TrustCard with Verified / Under Review / In Development states)
- Navigation (header, footer, homepage, search all link to Problems)
- Story → Fix relationship (NextExploration renders related Fix cards)

### Verification

- TypeScript: clean
- Tests: 106/106 passing
- Build: 253 pages, clean
- Knowledge Graph: 94/94 checks passed
- Trust States: all correct
- Representative Journeys: 20/20 passing

---

## Deferred Work (not frozen, may proceed freely)

| Item | Category | Priority |
|------|----------|----------|
| Populate real sourceIds | Editorial enrichment | Chapter 2 |
| KnowledgeConnections actor links | Graph richness | Chapter 2 |
| Fix dual-model cleanup (FixSection + domain fields) | Technical debt | Chapter 2 |
| Search results page Fix grouping | Discovery enhancement | Chapter 2 |
| Compare Fixes (cross-Fix analysis) | Comparative intelligence | Chapter 2 |
| Global precedents deep dive | International comparisons | Chapter 3 |
| Metrics and outcome tracking | Measured outcomes | Chapter 4 |
| Version history and longitudinal analysis | Measured outcomes | Chapter 4 |

---

## Changelog

### v1.0.0-chapter1 (26 Jul 2026)

**Chapter 1 — Founding Publication Baseline**

First stable release of The Breakdown Knowledge Platform.

**Added:**
- Problem Intelligence Explorer (`/problems`, `/problems/[slug]`, `/problems/[slug]/compare`)
- Problems indexed in global search and search results page
- Problems linked from Navigation header, Footer, and Homepage
- Trust states (Verified / Under Review / In Development) in TrustCard
- Graceful degradation for empty sourceIds ("Under editorial review")
- Story → Fix relationship via NextExploration
- Breadcrumbs on Problem detail pages
- "Compare All Solutions" link from Problem detail to comparison page
- Architecture Change Proposal (ACP) process
- Compatibility levels (A: Additive, B: Compatible Evolution, C: Breaking)
- Version semantics (patch/minor/major)
- Recurring reviews (Baseline, Graph Integrity, Reader Journey)
- Five contracts (Canonical Data, Reader Experience, Knowledge Graph, Editorial Trust, Compatibility)
- Chapter success criteria (one question per chapter)

**Fixed:**
- 3 phantom story slugs removed (`ews-quota`, `panchsheel-and-nonalignment`, `indias-inheritance`)
- 4 orphaned stories made public (`ration-digitization`, `anganwadi-icds`, `supply-chain-shift`, `ethanol-backlash`)
- GettingStartedGuide anchors now point to valid section IDs
- Category grid links use in-page anchor instead of unused URL param
- TrustCard PolicyMaturity type comparison corrected

**Resolved:**
- AR-13C Reader Journey Audit: all 7 exit criteria now PASS
- Pre-existing build failures: 3 components missing `"use client"` directive
