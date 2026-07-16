# Implementation Gap Matrix

> Phase 1 — PLATFORM-INTEGRATION-MASTERPLAN.md
> Every documented capability vs current implementation status
> Date: July 2026

## Legend

| Score | Label | Meaning |
|-------|-------|---------|
| 0 | None | No implementation exists |
| 1 | Prototype | Minimal/experimental implementation |
| 2 | Partial | Some capabilities implemented, major gaps |
| 3 | Functional | Core capabilities work, refinements remain |
| 4 | Complete | Fully meets documented spec |
| 5 | Exemplary | Exceeds spec, sets new standard |

---

## 1. Homepage

| Capability | Doc Source | Status | Score | Evidence |
|------------|-----------|--------|-------|----------|
| Hero section | RXS homepage §3.1 | ✅ Implemented | 4 | Tagline, CTAs, visual hierarchy |
| Continue Learning | RXS homepage §3.2 | ❌ Missing | 0 | No returning-reader context |
| Featured Investigations | RXS homepage §3.3 | ❌ Missing | 0 | No investigation cards |
| Knowledge Library grid | RXS homepage §3.4 | ✅ Implemented | 3 | Grid of collections; no completeness indicators |
| Latest articles | RXS homepage §3.5 | ⚠️ Partial | 2 | News-first; should be curatorial |
| Governance footer links | Editorial Constitution | ❌ Missing | 0 | No /methodology, /trust, /constitution links |
| Visual Spine consumption | VXS visual-spine.md | ❌ Missing | 0 | Images lack evidenceLevel/provenance badges |
| Taxonomy navigation | RXS homepage §3.6 | ✅ Implemented | 3 | Topic navigation present |
| Mobile responsive | PQS mobile | ✅ Implemented | 3 | Functional but not optimized |
| Structured data | PQS SEO | ⚠️ Partial | 2 | Basic metadata only |
| **Homepage Composite** | | | **2.3** | |

## 2. Story — Legacy Path (/story/[slug])

| Capability | Doc Source | Status | Score | Evidence |
|------------|-----------|--------|-------|----------|
| Prose rendering | Editorial Constitution | ✅ Implemented | 3 | Full prose with formatting |
| StoryShell architecture | RXS contract story-shell.md | ❌ Missing | 0 | Bypasses entire StoryShell |
| Table of Contents | RXS §4.1 | ❌ Missing | 0 | No sticky TOC |
| Reading progress | RXS §4.1 | ❌ Missing | 0 | No progress indicator |
| Reading Mode Toggle | RXS §4.2 | ❌ Missing | 0 | Component exists, not rendered |
| Evidence panel | Editorial Constitution | ⚠️ Partial | 2 | Present but not reachable from claims in 1 interaction |
| Version/livestatus badge | Editorial Constitution | ❌ Missing | 0 | No trust signals |
| State of the Evidence | RXS §5 | ❌ Missing | 0 | Not implemented |
| Glossary sidebar | Editorial Constitution | ✅ Implemented | 3 | Sidebar glossary present |
| Thinker cards | Editorial Constitution | ✅ Implemented | 3 | Thinker profiles present |
| Timeline integration | Editorial Constitution | ✅ Implemented | 3 | Timeline component present |
| Related content | RXS §6 | ✅ Implemented | 3 | Related stories/chapters |
| **Legacy Story Composite** | | | **1.3** | |

## 3. Story — StoryShell Path (/chapter/[id])

| Capability | Doc Source | Status | Score | Evidence |
|------------|-----------|--------|-------|----------|
| 5-region shell architecture | RXS contract story-shell.md | ✅ Implemented | 4 | Header, prose, evidence, sidebar, learning |
| Chapter header | RXS contract | ✅ Implemented | 4 | Title, metadata, breadcrumbs |
| Prose content region | RXS contract | ✅ Implemented | 4 | Rich prose rendering |
| Evidence panel | RXS contract | ✅ Implemented | 3 | Functional; could improve evidence proximity |
| Sidebar navigation | RXS contract | ✅ Implemented | 3 | Glossary, thinkers, documents |
| Learning block | RXS contract | ✅ Implemented | 3 | Learning section present |
| Reading Mode Toggle | RXS §4.2 | ❌ Missing | 0 | Component exists, slot available, not wired |
| Version badge | Editorial Constitution | ❌ Missing | 0 | No trust/livestatus indicator |
| State of the Evidence | RXS §5 | ❌ Missing | 0 | Not implemented |
| Visual Spine metadata | VXS visual-spine.md | ❌ Missing | 0 | Images don't show evidence/provenance |
| Continue to Next Chapter | RXS contract | ❌ Missing | 0 | No post-chapter navigation |
| **StoryShell Composite** | | | **2.8** | |

## 4. Knowledge Library

| Capability | Doc Source | Status | Score | Evidence |
|------------|-----------|--------|-------|----------|
| Collection page | RXS knowledge-library.md | ✅ Implemented | 3 | Shows volumes as cards |
| Volume page | RXS knowledge-library.md | ✅ Implemented | 3 | Metadata, chapter progression |
| Chapter page (StoryShell) | RXS knowledge-library.md | ✅ Implemented | 4 | Full StoryShell rendering |
| Search within collection | RXS knowledge-library.md | ❌ Missing | 0 | Not implemented |
| Knowledge density indicators | Editorial Constitution | ❌ Missing | 0 | Not surfaced |
| Filter/sort capabilities | RXS knowledge-library.md | ❌ Missing | 0 | Not implemented |
| Visual hero assets | VXS asset-standards.md | ❌ Missing | 0 | Cards lack rich visuals |
| Cross-collection progress | Editorial Constitution | ❌ Missing | 0 | No cross-volume tracking |
| Knowledge completeness status | Editorial Constitution | ❌ Missing | 0 | Published/Draft/Review not shown |
| Learning path guidance | RXS knowledge-library.md | ❌ Missing | 0 | No "What to Read Next" |
| **Knowledge Library Composite** | | | **2.1** | |

## 5. Investigation (/investigation/[slug])

| Capability | Doc Source | Status | Score | Evidence |
|------------|-----------|--------|-------|----------|
| Basic page shell | RXS investigation.md | ✅ Implemented | 2 | Title, description, evidence panel |
| Structured evidence blocks | RXS investigation.md §3 | ❌ Missing | 0 | Free-form only |
| Competing Explanations | RXS investigation.md §4 | ❌ Missing | 0 | Not implemented |
| Open Questions | RXS investigation.md §5 | ❌ Missing | 0 | Not implemented |
| Timeline integration | RXS investigation.md §6 | ❌ Missing | 0 | Not present |
| Key Documents section | RXS investigation.md §7 | ❌ Missing | 0 | Not present |
| Per-claim verification | Editorial Constitution | ❌ Missing | 0 | No verification badges |
| Sources list | RXS investigation.md | ✅ Implemented | 2 | Present but minimal |
| **Investigation Composite** | | | **1.3** | |

## 6. Search (/search)

| Capability | Doc Source | Status | Score | Evidence |
|------------|-----------|--------|-------|----------|
| Keyword search | RXS search.md | ✅ Implemented | 2 | Basic text input, results list |
| Knowledge object facets | RXS search.md §3 | ❌ Missing | 0 | No type differentiation |
| Claims mode | RXS search.md §4 | ❌ Missing | 0 | |
| Evidence mode | RXS search.md §4 | ❌ Missing | 0 | |
| Sources mode | RXS search.md §4 | ❌ Missing | 0 | |
| Thinkers mode | RXS search.md §4 | ❌ Missing | 0 | |
| Timeline mode | RXS search.md §4 | ❌ Missing | 0 | |
| Documents mode | RXS search.md §4 | ❌ Missing | 0 | |
| Maps mode | RXS search.md §4 | ❌ Missing | 0 | |
| Learning mode | RXS search.md §4 | ❌ Missing | 0 | |
| Cross-reference mode | RXS search.md §4 | ❌ Missing | 0 | |
| Advanced search | RXS search.md §4 | ❌ Missing | 0 | |
| Visual search results | RXS search.md §5 | ❌ Missing | 0 | No images/maps/documents in results |
| Advanced filters | RXS search.md §6 | ❌ Missing | 0 | Date, topic, type, status filters |
| Search within collection | RXS search.md §7 | ❌ Missing | 0 | |
| **Search Composite** | | | **0.8** | |

## 7. Trust Dashboard (/trust)

| Capability | Doc Source | Status | Score | Evidence |
|------------|-----------|--------|-------|----------|
| Trust metrics display | Editorial Constitution §XIII | ✅ Implemented | 3 | Metrics listed with values |
| Institutional Trust Score | Editorial Constitution Trust Index | ❌ Missing | 0 | Hardcoded 87/100, not computed |
| Trust computation engine | Editorial Constitution Trust Index | ❌ Missing | 0 | No TrustService |
| Evidence debt computation | Editorial Constitution | ❌ Missing | 0 | Hardcoded "—" |
| Trend visualization | Editorial Constitution | ❌ Missing | 0 | No score-over-time charts |
| Drill-down capability | Editorial Constitution | ❌ Missing | 0 | Metrics not clickable |
| Freshness tracking | Editorial Constitution §XII | ❌ Missing | 0 | Last-verified per chapter not shown |
| Gold Standard status | Editorial Constitution §XI | ✅ Implemented | 2 | Status shown but may be hardcoded |
| **Trust Dashboard Composite** | | | **1.7** | |

## 8. Methodology (/methodology)

| Capability | Doc Source | Status | Score | Evidence |
|------------|-----------|--------|-------|----------|
| Research methodology | AGENTS.md Publication Requirement | ✅ Implemented | 4 | Comprehensive |
| Evidence verification | Editorial Constitution §III | ✅ Implemented | 4 | Well-documented |
| Claim confidence | Editorial Constitution §IV | ✅ Implemented | 3 | Present |
| Scholarly disagreements | Editorial Constitution §VI | ✅ Implemented | 4 | Documented |
| Corrections policy | Editorial Constitution §XIII | ✅ Implemented | 3 | Present |
| AI use disclosure | Editorial Constitution | ⚠️ Partial | 2 | Present but brief; no policy references |
| Chapter evolution | Editorial Constitution §XII | ⚠️ Partial | 2 | Present but could reference Knowledge Lifecycle |
| Visual verification | AGENTS.md Asset Rules | ⚠️ Partial | 2 | Brief; could expand per asset management rules |
| Source intelligence | AGENTS.md Priority 6 | ❌ Missing | 0 | No section on source authority/trust evaluation |
| **Methodology Composite** | | | **2.4** | |

## 9. Editorial Constitution (/editorial-constitution)

| Capability | Doc Source | Status | Score | Evidence |
|------------|-----------|--------|-------|----------|
| Full text rendering | Editorial Constitution | ✅ Implemented | 4 | Faithful transcription |
| Article navigation | Editorial Constitution | ⚠️ Partial | 2 | Basic navigation without sticky TOC |
| Version badge | Editorial Constitution | ❌ Missing | 0 | No v1.1 Locked indicator |
| Ratification context | Editorial Constitution | ❌ Missing | 0 | No date/process explanation |
| Cross-references | Editorial Constitution | ❌ Missing | 0 | No links to /methodology, /trust |
| Search within document | Editorial Constitution | ❌ Missing | 0 | Not implemented |
| **Editorial Constitution Composite** | | | **2.0** | |

## 10. Founding Edition (/founding-edition)

| Capability | Doc Source | Status | Score | Evidence |
|------------|-----------|--------|-------|----------|
| Landing page | AGENTS.md Founding Publication | ✅ Implemented | 3 | Present with component links |
| Publication sequence | AGENTS.md Publication Sequence | ❌ Missing | 0 | Steps not shown with status |
| Milestone tracking | AGENTS.md Three Milestones | ❌ Missing | 0 | GSR/External Review/Publication status not shown |
| Observation period | AGENTS.md After Publication | ❌ Missing | 0 | Not mentioned |
| Version/copyright | AGENTS.md | ⚠️ Partial | 2 | Basic; could be stronger |
| **Founding Edition Composite** | | | **2.1** | |

---

## Cross-Cutting Gaps

These capabilities span multiple surfaces and represent systemic gaps:

| Gap | Surfaces Affected | Severity | Effort | Reader Impact |
|-----|------------------|----------|--------|---------------|
| Reading Mode Toggle not wired | StoryShell, legacy story | Medium | Low | High — readers can't switch modes |
| Version/livestatus badges missing | All content surfaces | High | Medium | High — reduces trust perception |
| Visual Spine metadata not consumed | Homepage, story, knowledge library | Medium | Medium | Medium — readers miss provenance |
| Institutional Trust Score not computed | Trust Dashboard | High | High | High — transparency promise broken |
| State of the Evidence not implemented | StoryShell, legacy story | Medium | Medium | Medium — reduces evidence awareness |
| Continue Learning not on homepage | Homepage | Medium | Low | High — returning readers underserved |
| Governance links missing from footer | Homepage, all pages | Low | Low | Medium — discoverability of institutional docs |

---

## Priority Matrix (Reader Impact × Effort)

### Quick Wins (High Impact, Low Effort)
1. Governance footer links — 1 file (layout.tsx)
2. Version badge on StoryShell — 1 component
3. ReadingModeToggle wiring — 1 slot connection
4. Post-chapter navigation footer — 1 component
5. Knowledge completeness status on chapter cards — data already exists

### Strategic (High Impact, Medium Effort)
6. Continue Learning section on homepage — new component + localStorage
7. State of the Evidence section — new component
8. Visual Spine metadata rendering — wire existing data to components
9. Investigation page upgrade to RXS spec — partial rewrite

### Major (High Impact, High Effort)
10. Search Knowledge Explorer — multi-phase implementation
11. Trust computation engine — new service
12. Legacy story path migration to StoryShell — route consolidation

---

## Phase 1 Assessment Summary

**Overall Platform Average: 1.8/5 (Partial/Prototype)**

The platform has a solid architectural foundation (StoryShell, knowledge registries, canonical types) but the reader-facing surfaces are approximately 36% of the capability defined in governing documents. The highest-leverage improvements are those that make the existing architecture visible to readers: trust signals, reading modes, evidence proximity, and Continue Learning — all of which use existing data or components.

**Key insight:** The gap is not in data or architecture — it's in rendering. The canonical knowledge layer is robust. The registries have the data. The components exist. But they aren't connected to the surfaces readers actually see.
