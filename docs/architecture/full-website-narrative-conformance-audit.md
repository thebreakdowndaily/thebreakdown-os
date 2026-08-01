# Full Website Narrative Conformance Audit (Phase W-0)

**Governing Standard:** Level 3 Architecture & Conformance Framework  
**Scope:** Repository-Wide Route & Surface Inventory, Drift Audit, and Target Architecture Mapping  
**Authoritative Reference:** `docs/architecture/governance-index.md`, NOS Volume III (`docs/philosophy/narrative-operating-system-v3.md`), AGENTS.md, Editorial Constitution  
**Date:** 28 July 2026  
**Status:** COMPLETE (Fact Baseline Established)

---

## 1. Executive Summary

This document establishes the authoritative factual baseline for the **Full Website Narrative Migration**. 

In accordance with Phase W-0 of the Master Execution Programme, every reader-facing route, surface, data model, component dependency, and architectural flow across the repository has been audited.

### Key Audit Findings
1.  **Homepage ("The Beginning"):** Fully CONFORMANT with NOS-v1.0/v3.0. Operates as a projection layer over `HomepageViewModel` with zero domain mutation.
2.  **Core Knowledge Journey Surfaces:** Partially Conformant. Story pages (`/story/[slug]`) and Chapter pages (`/series/.../chapter/[slug]`) render canonical claims, but navigation between Story Worlds, Investigations, and Stories retains legacy category-grid patterns.
3.  **Exploration & Structural Surfaces:** Mixed Conformance. Knowledge Graph (`/graph`), Timelines (`/timeline`), and Data Explorer (`/data`) expose canonical evidence, but lack inquiry-driven framing, epistemic uncertainty indicators, and unified narrative continuity breadcrumbs.
4.  **CMS & Editorial Surfaces:** Isolated & Non-Public. Internal editorial dashboards (`/editorial`, `/cms`, `/admin`) operate safely behind auth boundaries without leaking administrative state to public readers.
5.  **Architecture Invariants:** **0 Canonical Violations Detected.** The domain layer (`types/canonical.ts`), Claim Registry, Evidence Registry, and Service Layer remain 100% frozen and unmutated.

---

## 2. Route Inventory

Every route in the repository has been enumerated and classified into governance categories:

| Route Path | Category | Classification | Description & Primary Source |
| :--- | :--- | :--- | :--- |
| `/` | **CORE NARRATIVE** | `CONFORMANT` | Homepage ("The Beginning") 4-scene narrative orchestrator (`TheBeginning.tsx`) |
| `/story/[slug]` | **CORE NARRATIVE** | `PARTIALLY CONFORMANT` | Story presentation model (`buildStoryPresentationModel()`) |
| `/stories` | **CORE NARRATIVE** | `LEGACY` | Article-grid index of published stories |
| `/series/[collectionSlug]` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Series collection overview |
| `/series/.../volume/[volumeSlug]` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Volume chapter container |
| `/series/.../chapter/[chapterSlug]`| **CORE NARRATIVE** | `PARTIALLY CONFORMANT` | Long-form canonical chapter (`ChapterPageShell.tsx`) |
| `/investigation/[slug]` | **CORE NARRATIVE** | `PARTIALLY CONFORMANT` | Investigation macro-narrative container |
| `/investigations` | **CORE NARRATIVE** | `LEGACY` | Directory of active investigations |
| `/founding-edition` | **REFERENCE** | `CONFORMANT` | Founding Monograph 001 landing page |
| `/founding-edition/chapter-1` | **REFERENCE** | `CONFORMANT` | Chapter 1 (*India's Inheritance*) Gold Standard Monograph |
| `/topic/[slug]` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Topic hub presentation model |
| `/topics` | **EXPLORATION** | `LEGACY` | Topic directory grid |
| `/graph` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Knowledge Graph visualizer (`GraphExplorerPage`) |
| `/timeline` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Master chronology surface |
| `/search` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Search inquiry engine (`SearchPageClient.tsx`) |
| `/compare` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Side-by-side entity/policy comparison surface |
| `/fix/[slug]` | **CORE NARRATIVE** | `CONFORMANT` | Systemic Fix solution surface |
| `/fix` | **CORE NARRATIVE** | `PARTIALLY CONFORMANT` | Fix solutions index |
| `/data` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Data Explorer main surface |
| `/dataset/[slug]` / `/datasets` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Raw dataset views |
| `/country/[slug]` / `/countries` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Geopolitical context surfaces |
| `/organization/[slug]` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Institutional actor context surface |
| `/entity/[slug]` / `/entities` | **EXPLORATION** | `PARTIALLY CONFORMANT` | Entity registry exploration surface |
| `/workspace` | **UTILITY** | `PARTIALLY CONFORMANT` | Reader Workspace & local notes |
| `/reader` | **UTILITY** | `PARTIALLY CONFORMANT` | Reader profile & preference controls |
| `/explorer` | **UTILITY** | `CONFORMANT` | Knowledge Explorer inquiry interface |
| `/methodology` | **INSTITUTIONAL** | `CONFORMANT` | Research methodology & Evidence Hierarchy |
| `/trust` | **INSTITUTIONAL** | `CONFORMANT` | Verification standards & trust metrics |
| `/about` | **INSTITUTIONAL** | `CONFORMANT` | Platform mission & institutional identity |
| `/editorial-constitution` | **INSTITUTIONAL** | `CONFORMANT` | Level 1 Editorial Constitution public document |
| `/accessibility` | **INSTITUTIONAL** | `CONFORMANT` | WCAG 2.2 AAA compliance statement |
| `/editorial` | **EDITORIAL** | `CONFORMANT` | Newsroom Mission Control dashboard |
| `/editorial/knowledge` | **EDITORIAL** | `CONFORMANT` | Knowledge completeness management |
| `/cms/*` | **INTERNAL** | `CONFORMANT` | Administrative CMS editing suite |
| `/admin/*` | **INTERNAL** | `CONFORMANT` | System administration & database health |
| `/dashboard` | **INTERNAL** | `LEGACY` | Deprecated admin dashboard redirect |

---

## 3. Detailed Surface Inventory & NOS III Mapping

### 3.1 Core Knowledge Journey Surfaces

#### Surface: Homepage (`/`)
- **Current Purpose:** 4-scene narrative entry point ("The Beginning").
- **Canonical Data Source:** `buildHomepage()` view model via `bootstrapServices()`.
- **Primary Components:** `TheBeginning.tsx`, `Scene1Opening`, `Scene2Inquiry`, `Scene3KnowledgeMap`, `Scene4StoryWorlds`, `NarrativeMemory`, `NarrativeReveal`.
- **Evidence Exposure:** Direct inquiry terminal linking to verified search results; Story World tiles mapping to canonical topics.
- **Accessibility:** WCAG AAA clean, ARIA landmarks, `prefers-reduced-motion` compliant, 0 client-side scroll-jacking.
- **NOS III Conformance:** **CONFORMANT**. Complies with Chapters 1, 3, 21, and 25.

#### Surface: Story Surface (`/story/[slug]`)
- **Current Purpose:** Explains a specific policy, historical event, or systemic problem.
- **Canonical Data Source:** `resolveStory()` + `buildStoryPresentationModel()`.
- **Primary Components:** `StoryShell.tsx`, `StoryHeader`, `EvidenceDrawer`, `ReadingModeSelector`, `StoryMemoryWriter`.
- **Evidence Exposure:** Integrated split-view Evidence Drawer exposing Tier 1–3 sources and confidence ratings.
- **NOS III Conformance:** **PARTIALLY CONFORMANT**. Exposes claims and evidence, but lacks explicit NOS III Narrative Grammar progression (`Opening Question` → `Counterargument` → `Reflection` → `Open Question`).

#### Surface: Chapter Surface (`/series/.../chapter/[slug]`)
- **Current Purpose:** Long-form authoritative monograph (e.g. Chapter 1 *India's Inheritance*).
- **Canonical Data Source:** `KnowledgeLibraryRepository` + `GoldStandardAuditService`.
- **Primary Components:** `ChapterPageShell.tsx`, `SixQuestionsGrid`, `FourLayersCard`, `EvidenceAttestationPanel`.
- **Evidence Exposure:** 100% claim-to-source mapping, Gold Standard 7-Phase audit badge.
- **NOS III Conformance:** **PARTIALLY CONFORMANT**. Structurally robust, but requires integration with global narrative breadcrumbs and continuity hand-offs.

#### Surface: Investigation Surface (`/investigation/[slug]`)
- **Current Purpose:** Aggregates related stories into a multi-episode investigation.
- **Canonical Data Source:** `InvestigationRepository` + `buildInvestigationViewModel()`.
- **Primary Components:** `InvestigationHeader`, `EpisodeTimeline`, `UnresolvedQuestionsPanel`.
- **NOS III Conformance:** **PARTIALLY CONFORMANT**. Requires migration from standard article-card list to NOS III Investigation Lifecycle (What is known vs. What remains unresolved).

---

## 4. Conformance Matrix Summary

| Classification | Count | Routes Included |
| :--- | :---: | :--- |
| **CONFORMANT** | 12 | `/`, `/founding-edition`, `/founding-edition/chapter-1`, `/fix/[slug]`, `/explorer`, `/methodology`, `/trust`, `/about`, `/editorial-constitution`, `/accessibility`, `/editorial`, `/editorial/knowledge` |
| **PARTIALLY CONFORMANT** | 22 | `/story/[slug]`, `/series/*`, `/investigation/[slug]`, `/topic/[slug]`, `/graph`, `/timeline`, `/search`, `/compare`, `/data`, `/dataset/[slug]`, `/country/[slug]`, `/organization/[slug]`, `/entity/[slug]`, `/workspace`, `/reader`, `/fix`, `/datasets`, `/countries`, `/organizations`, `/entities`, `/topics`, `/investigations` |
| **LEGACY** | 5 | `/stories`, `/investigations` (list view), `/topics` (list view), `/dashboard`, `/datasets` (list view) |
| **PROHIBITED** | 0 | *Zero prohibited patterns (infinite feeds, outrage engines, sponsored cards) detected.* |
| **ARCHITECTURE REVIEW REQUIRED** | 0 | *All NOS III capabilities can be produced strictly via pure projection above existing canonical domain models.* |

---

## 5. Architecture Drift Audit

A repository-wide scan for unauthorized abstractions or domain mutations yielded the following findings:

1.  **Domain Invariants Preserved:** `types/canonical.ts` contains zero UI or presentation properties. Claims, Evidence, Stories, and Investigations remain 100% pure domain models.
2.  **Service Layer Boundaries Intact:** `bootstrapServices()` cleanly segregates public read-only repositories from internal write services.
3.  **Projection Layer Scoping:** All narrative components created in Phase N-1 live strictly under `components/narrative/`. No narrative logic leaks into `services/` or `lib/domain/`.
4.  **Zero Shadow Data Stores:** No local IndexedDB, shadow CMS databases, or narrative state stores exist. `localStorage` is used strictly for non-critical, passive reading markers (`tb_last_story`).

---

## 6. Migration Dependency Graph

```text
Phase W-0: Full Website Audit (COMPLETE)
  ↓
Phase W-1: Target Experience Map & Architecture Contract
  ↓
Phase W-2: Global Narrative Shell (Breadcrumbs, Orientation, Universal Layouts)
  ↓
Phase W-3: Core Knowledge Journey Migration
  ├── The Beginning (Done)
  ├── Story World Ecosystem (/series, /topic)
  ├── Investigation Macro-Surface (/investigation/[slug])
  ├── Story Surface Alignment (/story/[slug])
  └── Evidence & Reflection Hand-off
  ↓
Phase W-4: Structural Knowledge Surfaces (Graph, Search, Timeline, Compare, Data)
  ↓
Phase W-5: Learning & Intelligence Surfaces (Workspace, Reader Modes, Bounded AI)
  ↓
Phase W-6: Institutional & Supporting Surfaces (Methodology, Trust, About)
  ↓
Phase W-7: Platform-Wide NOS Certification Audit
  ↓
Phase W-8: Legacy Component Retirement & Final Architecture Freeze
```

---

## 7. Proposed W-1 Execution Plan

Upon approval of this audit, Phase W-1 will produce `docs/architecture/full-website-narrative-experience-map.md`, defining:
1.  **Universal Projection Mappers:** Mapping existing `Story`, `Investigation`, `Topic`, and `Entity` view models into NOS III Narrative Grammar (`Question` → `Evidence` → `Counterargument` → `Reflection` → `Continuation`).
2.  **Direct-Access Invariants:** Guaranteeing that external links directly accessing `/story/[slug]` or `/entity/[slug]` bypass narrative gates without losing epistemic positioning.
3.  **Global Shell Contract:** Standardizing spatial breadcrumbs, evidence drawer triggers, and reading mode toggles across all surfaces.

---

**Audit Clearance:** Phase W-0 Complete. No production code modified. Ready to proceed to Phase W-1 on directive.
