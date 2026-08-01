# Full Website Narrative Experience Map (Phase W-1)

**Governing Standard:** Level 3 Experience Architecture System  
**Depends On:** NOS Volume III (`docs/philosophy/narrative-operating-system-v3.md`), Governance Index (`docs/architecture/governance-index.md`), W-0 Audit (`docs/architecture/full-website-narrative-conformance-audit.md`)  
**Date:** 28 July 2026  
**Status:** CANONICAL & FROZEN

---

## 1. Primary Reader Journey Mapping

The canonical reader journey defines the structural path of progressive understanding:

```text
                                [ The Beginning (/) ]
                                          │
                                          ▼
                             [ Story World (/series/*) ]
                                          │
                                          ▼
                            [ Investigation (/investigation/*) ]
                                          │
                                          ▼
                                [ Story (/story/*) ]
                                          │
                                          ▼
                            [ Claims / Evidence Drawer ]
                                          │
                                          ▼
                           [ Metacognition & Reflection ]
                                          │
                                          ▼
                         [ Open Question / Continuation ]
                                          │
                                          ▼
                             [ Next Investigation Node ]
```

### Journey Step Mapping & Projection Contracts

| Step | Surface | Existing View Model / Repository | Narrative Grammar Mapping | Projection Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **1. Entry** | `/` (The Beginning) | `buildHomepage()` | `Question` → `Hook` | 4-scene trailer establishing intent and routing to investigations |
| **2. Ecosystem** | `/series/*`, `/topic/*` | `KnowledgeLibraryRepository` | `Context` → `Discovery` | Groups stories by structural forces (*State, Citizen, Planet, Economy*) |
| **3. Investigation**| `/investigation/[slug]`| `buildInvestigationViewModel()` | `Uncertainty` → `Evidence` | Contrasts what is known vs. what remains unresolved |
| **4. Story** | `/story/[slug]` | `buildStoryPresentationModel()` | `Opening Question` → `Evidence Spine` | Structured narrative grounded in verified claims |
| **5. Evidence** | Split-View Drawer | `ClaimRegistry` / `EvidenceRegistry` | `Proof` → `Provenance` | 2-click descent from claim to Tier 1 primary archival document |
| **6. Reflection** | Post-Story Section | `GoldStandardAuditService` | `Reflection` → `Synthesis` | Metacognitive synthesis evaluating evidence & assumptions |
| **7. Handoff** | Continuation Block | `KnowledgeGraphService` | `Open Question` → `Continuation` | Connects current story to the next logical investigation question |

---

## 2. Secondary Exploration Paths Mapping

Secondary exploration surfaces allow non-linear, multi-dimensional access to canonical knowledge without breaking narrative orientation.

```text
                          ┌────────────────────────┐
                          │   PRIMARY NARRATIVE    │
                          │   INQUIRY SPINE        │
                          └───────────┬────────────┘
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ▼                              ▼                              ▼
[ Exploration Surfaces ]   [ Structural Evidence ]       [ Applied & Solutions ]
• Search (/search)          • Knowledge Graph (/graph)    • The Fix (/fix/*)
• Topics (/topics)          • Timelines (/timeline)       • Datasets (/data)
• Countries (/country/*)    • Maps & Geography            • Comparisons (/compare)
• Orgs (/organization/*)    • Document Archives           • Workspace (/workspace)
```

### Secondary Surface Projection Mapping

1.  **Search (/search):** Projects `SearchService` results into an **Inquiry Engine**. Query maps to canonical claims and confidence scores ahead of page listings.
2.  **Knowledge Graph (/graph):** Projects `buildChapterGraph()` into relationship explanations rather than raw node-link diagrams.
3.  **Timelines (/timeline):** Projects master events into causal chains (`Causality Over Chronology`) with explicit evidence links.
4.  **Data Explorer (/data):** Projects quantitative datasets into argument-first visualisations displaying margins of error and baseline justifications.
5.  **Comparisons (/compare):** Projects shared canonical claims across entities/policies side-by-side; rejects entertainment tier lists.
6.  **The Fix (/fix/*):** Projects structural policy solutions connected directly to the systemic problems identified in investigations.
7.  **Workspace (/workspace):** Local-first working memory allowing readers to collect claims, annotate evidence, and export versioned citations.

---

## 3. The Direct-Access Invariant

> **Rule:** A reader or researcher arriving directly at ANY deep URL (e.g. `/story/mgnrega-reform`, `/entity/reserve-bank-of-india`, `/fix/semiconductor-policy`) must NEVER be forced through linear narrative gates.

### Direct Access Guarantees
- **Zero Gatekeeping:** External links, search engines, and bookmarks land directly on the requested surface.
- **Instant Epistemic Context:** Every deep surface renders a non-intrusive **Spatial Narrative Breadcrumb** (e.g., `Foundations → Nehruvian Era → Chapter 1 → Claim #4`), immediately establishing where the surface exists in the broader Knowledge Graph.
- **Immediate Evidence Descent:** The Evidence Drawer remains accessible in 1 click regardless of how the reader arrived.

---

## 4. Cross-Surface Continuity & Escape Routes

```text
[ Current Surface ] ──► (Reader Wants Depth)   ──► Open Evidence Drawer / Raw Document
                    ──► (Reader Wants Context) ──► Zoom out to Story World / Topic
                    ──► (Reader Wants Graph)   ──► View Node in Knowledge Graph
                    ──► (Reader Wants Exit)    ──► Direct Search or Clear Workspace
```

1.  **Continuity Anchor:** Every surface maintains position awareness via the shared `GlobalNarrativeShell`.
2.  **Reader Escape Routes:** Readers can at any moment bypass narrative scaffolding to launch a search, switch to Researcher Mode, or clear local session state.

---

## 5. Accessibility & Substrate Requirements (WCAG 2.2 AAA)

- **Semantic HTML & ARIA:** Every surface uses `<main>`, `<nav>`, `<article>`, `<section>`, and explicit `aria-labelledby` attributes.
- **Zero JavaScript Fallback:** Core prose, claims, sources, and static maps render completely on the server via SSR.
- **Motion Boundaries:** `prefers-reduced-motion: reduce` suppresses all visual transitions globally via `globals.css`.
- **Keyboard Navigation:** All interactive elements (toggles, drawer triggers, mode selectors) maintain visible focus rings and logical tab ordering.

---

## 6. Projection Boundaries (Canonical Safety Contract)

```text
┌─────────────────────────────────────────────────────────────────┐
│ CANONICAL DOMAIN LAYER (Frozen)                                 │
│ ClaimRegistry · EvidenceRegistry · StoryRegistry · Graph        │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Pure Read-Only Projection
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ NARRATIVE PROJECTION LAYER (Phase W-2 to W-6)                   │
│ NarrativeGrammar · StoryWorldTiles · InvestigationLenses        │
└─────────────────────────────────────────────────────────────────┘
```

- **No Domain Mutations:** Projection components only transform existing view model DTOs into NOS III narrative structures.
- **No Shadow Registries:** Presentation tags (e.g., `Opening Question`, `Evidence Spine`) are rendered during view synthesis and never written back to canonical database schemas.

---

**Status:** Phase W-1 Completed. Target Experience Map Canonical & Frozen. Proceeding to Phase W-2 (Global Narrative Shell).
