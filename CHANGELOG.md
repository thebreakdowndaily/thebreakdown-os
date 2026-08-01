# Changelog

This changelog records every significant change to frozen artifacts of The Breakdown Knowledge Platform. No silent evolution. Every change includes date, author, and justification.

## Frozen Artifacts (v1.0)

| Artifact | Version | Status |
|----------|---------|--------|
| Editorial Constitution | v1.1 | Locked |
| AGENTS.md | v1.0 | Active |
| Knowledge Platform | v1.0 | Frozen |
| RXS (Reader Experience System) | v1.0 | Frozen |
| VXS (Visual Experience System) | v1.0 | Frozen |
| KIS (Knowledge Investigation System) | v1.0.1 | Frozen |
| Founding Publication | v1.0 | Published (`v1.0.0-chapter1`) |
| NOS Volume III (Website Experience Constitution) | v1.1 | Ratified |
| Narrative Experience Architecture (Design Philosophy) | v1.0 | Ratified |

---

## Entries

### 2026-07-28 — Narrative Experience Architecture Ratified as Governance Peer

- **Author:** Narrative Architecture Council
- **Change:** Ratified `docs/narrative/narrative-experience-architecture.md` as a Level 3 governance peer to NOS Volume III. Design philosophy document covering: reader psychology model (Green & Brock, Csikszentmihalyi, Loewenstein), emotional journey mapping with two arc templates (Investigation Arc, Policy Arc), tension callouts (inevitability vs. manipulation, transportation vs. critical resistance, hope-after-trauma, cinematic-vs-visible-evidence-chain, AI bounded by Claim Registry), non-engagement success metrics (reflection-completion rate, counterargument engagement rate, self-reported understanding delta), Journey-as-playlist abstraction, user journey maps (curious newcomer, policy reader, returning specialist Map C), and minimal design extensions (arc indicator + Journey transition only).
- **Justification:** NOS Volume III provides the constitutional breadth — navigation, search, learning, annotation, accessibility, anti-patterns, certification. The Narrative Experience Architecture provides the design depth — reader psychology, emotional arc mapping, tension resolution, and non-engagement metrics — that the constitutional breadth requires for grounded integration. The two documents are peers; neither supersedes the other.
- **Verification:** Document complete. 192 lines. Governance metadata added. Peer relationship to NOS Vol III established.

### 2026-07-28 — NOS Volume III Updated to v1.1

- **Author:** Narrative Architecture Council
- **Change:** Updated `docs/narrative/narrative-operating-system-volume-iii.md` from v1.0 to v1.1. Added: reader psychology model (§2.5 — Green & Brock narrative transportation, Csikszentmihalyi flow, Loewenstein information gap), emotional arc templates (§5.11 — Investigation Arc and Policy Arc replacing one universal shape), tension callouts (§I.4 — inevitability vs. manipulation, transportation vs. critical resistance), understanding metrics (§26.8 — 6 non-engagement metrics), and structuring-vs-persuasion closing principle. All additions integrated from the Narrative Experience Architecture peer document.
- **Justification:** NOS Vol III v1.0 lacked research grounding for its narrative principles, had no mechanism for flagging genuine tensions between narrative goals and evidence-first principles, and prescribed one universal emotional arc that would fail for trauma content. The additions address all three gaps without expanding the document's scope.
- **Verification:** TSC clean. Build unaffected (governance documents only).

### 2026-07-28 — Governance Index Updated for Narrative Experience Architecture

- **Author:** Architecture Execution Agent
- **Change:** Updated `docs/architecture/governance-index.md` to map the Narrative Experience Architecture as a Level 3 peer governance document. Added 10 new principle entries to the Narrative Experience Principles section (reader psychology, emotional arc templates, inevitability tension, transportation tension, understanding metrics, structuring-vs-persuasion, and 4 narrative-specific principles). Added new "Narrative Experience (NOS Vol III ↔ Narrative Experience Architecture)" overlap area to the Overlap Map with 10 cross-references and explicit resolution rules.
- **Justification:** The governance corpus now has two narrative experience documents at Level 3. The Governance Index must resolve which document is authoritative for each principle to prevent duplication and ambiguity.
- **Verification:** Index updated. All new principles mapped. Overlap area documented.

### 2026-07-28 — Narrative Operating System Volume III Ratified

- **Author:** Narrative Architecture Council
- **Change:** Ratified `docs/narrative/narrative-operating-system-volume-iii.md` — the constitutional architecture governing every screen, interaction, transition, recommendation, search, AI interaction, navigation path, and learning journey across the platform. 26 chapters covering: Platform Narrative Philosophy, Global Reader Journey, Homepage Experience, Story World Experience, Story Experience, Investigation Experience, Knowledge Graph Experience, Search Experience, AI Experience, Reader Memory, Narrative Navigation, Learning Experience, Annotation Experience, Evidence Experience, Comparison Experience, Data Experience, Recommendation Philosophy, Community Experience, Accessibility Constitution, Mobile Narrative, Motion Philosophy, Narrative Grammar, Narrative Rhythm, Anti-Patterns, Certification Framework, Future Evolution. 534 lines, ~8,900 words. Operates under Editorial Constitution (Level 1) and AGENTS.md (Level 2). Defines 11 measurable certification areas with pass/fail criteria.
- **Justification:** The platform needed a constitutional governance document for its narrative experience layer — the domain where canonical knowledge becomes reader understanding. Existing systems govern data (NOS Volume I), visuals (NOS Volume II / VXS), and engineering (AGENTS.md). Volume III governs the narrative projection of all three.
- **Verification:** Document complete. All 26 chapters written. Governance hierarchy respected. No conflicts with existing frozen artifacts.

### 2026-07-28 — Governance Index Created

- **Author:** Architecture Execution Agent
- **Change:** Created `docs/architecture/governance-index.md` — maps every constitutional principle across all governance documents to its single authoritative source. Covers ~170 principles across Editorial Constitution, AGENTS.md, and NOS Volume III. Identifies 4 major overlap areas (Evidence Governance, AI Governance, Accessibility, Transparency) with explicit resolution rules. Defines maintenance protocol for ongoing index hygiene.
- **Justification:** As the governance corpus grew to ~15,000+ words across 5 documents, constitutional overlap became a real risk. The Governance Index resolves which document is authoritative for each principle, preventing duplication and ambiguity. Contributors now know exactly where to amend a principle.
- **Verification:** Index complete. All major principles mapped. Overlap areas identified and resolved. Maintenance protocol defined.

### 2026-07-27 — Chapter 2: Comparative Intelligence Foundation (ACP-001)

- **Author:** Architecture Execution Agent
- **Change:** Implemented Comparative Intelligence subsystem per ACP-001 (Approved). Level A additive change.
  - Added `reversibility` and `scalability` optional fields to Fix type in `types/canonical.ts`
  - Created `lib/compare-helpers.ts` — comparison dimension definitions, URL-based selection helpers, aggregation functions, factual summary derivation
  - Created `components/compare/` — FixSelector, ComparisonMatrix, EvidenceSynthesis, EditorialRecommendation, CompareView
  - Created `/compare` route — URL-driven comparison page with Fix selection, structured comparison matrix, evidence synthesis, factual summary
  - Added comparison entry points to ProblemDetailView ("Structured Comparison" link) and FixRenderer ("Compare with Other Solutions" section + sticky nav item)
  - Updated all 6 Fix fixtures with `reversibility` and `scalability` metadata
  - Created `tests/compare-helpers.test.ts` — 38 tests covering all comparison helpers
  - Created `docs/architecture/adr/ADR-008` — Comparative Intelligence is a compositional reader capability
  - Updated `docs/architecture/acp/acp-001-comparative-intelligence.md` with approved status, 3 new ACs, comparison identity clarification
- **Justification:** Chapter 2 architectural question: "Can readers compare competing solutions in a structured, evidence-backed, transparent way?" Comparison is a view, not a canonical object — composed at render time from Fix objects with no persistent identity.
- **Verification:** TSC clean. 144/144 tests pass (106 pre-existing + 38 new). Production build clean. /compare route live.

### 2026-07-12 — Platform Baseline

- **Author:** Editorial Engineering
- **Change:** Knowledge Platform reaches architecture-complete status (~95%). 248 pages build. Chapter 1 drafted to Internal Gold Candidate standard (~15,000 words, 22 sources).
- **Justification:** Baseline for the editorial phase. Engineering frozen pending Gold Standard Review.

### 2026-07-13 — Editorial Constitution Ratified

- **Author:** Editor-in-Chief
- **Change:** `docs/editorial/editorial-constitution.md` ratified at v1.0. 16 Articles + Preamble. Established as the supreme governing document (Level 1 in governance hierarchy).
- **Justification:** The platform required an authoritative governance framework before publishing content. Previously, engineering documentation (AGENTS.md) was the de facto governing document, which conflated software practice with editorial standards.

### 2026-07-13 — Governance Hierarchy Established

- **Author:** Editor-in-Chief
- **Change:** AGENTS.md updated with four-level governance hierarchy. Editorial Constitution (Level 1) now supersedes AGENTS.md (Level 2) on editorial matters. Gold Standard Review formalised as a mandatory workflow stage.
- **Justification:** Clarifies precedence. Prevents engineering convenience from overriding editorial standards.

### 2026-07-13 — Editorial Review Checklist Created

- **Author:** Editorial Bureau
- **Change:** `docs/editorial/editorial-review-checklist.md` created at v1.0. Concrete yes/no criteria and scoring for all seven Gold Standard Review phases (70 criteria total).
- **Justification:** Companion to the Constitution. Ensures consistent application of review standards across editors.

### 2026-07-14 — Evidence Standard Added (Constitution v1.1)

- **Author:** Editor-in-Chief
- **Change:** Editorial Constitution upgraded to v1.1. Added: Evidence Spine, Four-Layer Structure, State of the Evidence, Open Questions, Evidence Challenges, Review Board Roles, pre-publication versioning, and Trust Score.
- **Justification:** The Constitution v1.0 covered governance but not the specific evidence discipline required per paragraph. Phase 13.5 ("The Evidence Standard") mandated these additions to ensure every paragraph answers "How do we know this?"

### 2026-07-14 — Institutional Memory Artifacts Created

- **Author:** Knowledge Operations
- **Change:** Three artifacts created:
  - `docs/editorial/book-of-record.md` — 15 editorial decisions logged
  - `docs/editorial/known-disagreements.md` — 8 scholarly disagreements surfaced
  - `docs/editorial/confidence-register.md` — 18 claims tracked with confidence scores
- **Justification:** Institutional memory must outlive individual editors. These artifacts record decisions, disagreements, and confidence — not rules. They complement (rather than amend) the locked Constitution.

### 2026-07-14 — Editorial Calendar Created

- **Author:** Knowledge Operations
- **Change:** `docs/editorial/editorial-calendar.md` created at v1.0. Verification schedule rotating across collections annually; flagship chapters reviewed every six months.
- **Justification:** Maintenance must be scheduled, not reactive. A calendar ensures no knowledge object falls below freshness standards.

### 2026-07-14 — Founding Publication Phase (Phase 14)

- **Author:** Editor-in-Chief
- **Change:** Phase 13 (Institutional Credibility) renamed to Phase 14 (Founding Publication). Defined four bureaus (Research, Editorial, Verification, Knowledge Operations), Version 1.0 — "The Breakdown Knowledge Library: Founding Edition", /methodology and /trust pages, external peer review process, and corrections policy. Directive: no new platform features until Chapter 1 is published and externally reviewed.
- **Justification:** The platform had reached feature completeness. The remaining risk was delaying publication in pursuit of perfection, not missing features.

### 2026-07-14 — Public-Facing Pages Published

- **Author:** Editorial Bureau
- **Change:** `app/methodology/page.tsx` and `app/trust/page.tsx` created. Methodology explains research, verification, confidence, disagreements, corrections, AI usage, and versioning to readers. Trust dashboard displays live transparency metrics.
- **Justification:** Readers must never have to guess the editorial process. Transparency is a feature, not an afterthought.

### 2026-07-14 — Operational Cycles Replaces Phase Roadmap

- **Author:** Editor-in-Chief
- **Change:** Retired the sequential phase roadmap (Phase 1–14). Introduced recurring Operational Cycles 1–5. Added Institutional Trust Index as the primary Mission Control metric (with 8-component weighting). Adopted motto: "Evidence before conclusions. Context before certainty." Froze Founding Publication artifacts at v1.0.
- **Justification:** The institution had outgrown a linear roadmap. Operational Cycles reflect the standing rhythm of an editorial institution. Success is measured by Trust, not completion.

---

### 2026-07-15 — KIS v0.9 (Initial Implementation)

- **Author:** Editorial Engineering
- **Change:** Knowledge Investigation System v0.9 implemented. `InvestigationPanel.tsx` (framer-motion slide-over), `InvestigationContent.tsx` (six sections: Claim Statement, Evidence, Primary Documents, Timeline, Counterarguments, Thinkers, Sources). `ClaimBlock.tsx` adds "Investigate" button dispatching `open-investigation` custom event. `KnowledgeRenderer.tsx` passes `block.id` to all renderers. `block-registry.tsx` adds `id: string` to `BlockComponentProps`. `StoryShell.tsx` mounts panel at layout root.
- **Justification:** Every claim needed a non-linear investigation entry point within the reading flow — reusing existing canonical knowledge objects and the StoryShell overlay pattern rather than creating new architecture.

### 2026-07-15 — KIS v1.0 (Reader Investigation)

- **Author:** Editorial Bureau (Review) + Editorial Engineering
- **Change:** KIS upgraded to v1.0 following editorial review. Reordered sections (Timeline before Counterarguments). Added Editorial Question section ("Why do historians disagree?") with context-sensitive content based on claim confidence. Added Related Claims section (up to 5 claims sharing entities/concepts). Added breadcrumb showing chapter title from `appearsIn[0].contentTitle`. Renamed close button "Close" → "Continue Reading".
- **Justification:** Editorial review identified that the initial implementation didn't surface scholarly disagreement clearly enough. The reorder and Editorial Question section ensure every investigation answers "Where do historians disagree?" before presenting further reading. The breadcrumb and Continue Reading label maintain reader orientation and encourage return to narrative.

### 2026-07-15 — KIS v1.0.1 (Accessibility — Focus Management)

- **Author:** Release Engineer
- **Change:** Added `triggerRef`/`panelRef` focus management to `InvestigationPanel.tsx`. Saves `document.activeElement` on panel open. `useEffect` on `isOpen` moves focus to panel container on open, returns focus to trigger element on close. Panel container gets `tabIndex={-1}`, `ref={panelRef}`, `outline-none`.
- **Justification:** Release Engineer audit identified WCAG AA violation — keyboard users lost focus context after closing the panel. Product Quality Gate 17 requires focus management on modals, drawers, and overlays. This is a standards-compliance fix, not a feature addition.
- **Status:** KIS v1.0.1 frozen.

---

## Upcoming

- Chapter 1 external peer review (Operational Cycle 1)
- Gold Standard Review completion
- Publication of Founding Edition v1.0
- Operational Cycle 2 — Editorial Calibration test

---

### 2026-07-14 — CTO → Editor-in-Chief Handover

- **Author:** Founding Editor
- **Change:** CTO roadmap formally concluded. AGENTS.md reframed as the operating doctrine of an editorial institution. Handover note added: day-to-day ownership now rests with the Editor-in-Chief, supported by the four bureaus. Added Founding Publication definition (Version 1.0 = Founding Edition only), three pre-launch milestones (internal Gold Standard, external peer review, founding publication), post-publication observation period, and annual Founders' Review practice.
- **Justification:** The limiting factor is no longer technology. Engineering is mature enough (~95%) that additional code produces diminishing returns. The institution's future depends on whether it can consistently produce work that lives up to the Editorial Constitution. The next several years belong to subject-matter expertise, not engineering.
- **Status:** Founding Publication v1.0 remains in progress (Chapter 1 awaiting Gold Standard Review and external peer review).

---

### 2026-07-14 — Founding Architecture Program Closed

- **Author:** Founding Editor
- **Change:** Formally closed the Founding Architecture Program. The v1.0 architecture is accepted as sufficiently complete for publication. Future engineering is reactive to demonstrated editorial needs, not speculative feature development. Replaced the software-phase roadmap with the **Editorial Program** (Alpha — Founding Volume, Beta — Editorial Excellence, Gamma — Public Trust). Established the **Advisory Board** (governs knowledge, not company) with eight complementary domains. Confirmed public exposure of standards (Constitution, Methodology, Corrections Policy, Transparency Statement, Sources Policy, Trust Dashboard). Explicitly rejected vanity metrics (page views, shares, clicks) in favour of institutional outcomes (citations, university use, journalist references, corrections accepted). Defined the Founding Edition publication sequence (Methodology → Constitution → Trust Dashboard → Chapter 1 → announcement).
- **Justification:** Stages 1 (platform) and 2 (institution) are complete. Stage 3 (credibility) cannot be accelerated by engineering. Closing the program protects the institution from endless platform expansion and reorients all effort toward editorial quality. The mode of work has fundamentally changed — from building features to earning trust.
- **Status:** Editorial Program Alpha active. Founding Publication v1.0 in progress.

---

### 2026-07-15 — Chapter 1 Internal Gold Standard Review (Milestone 1, Part 1)

- **Author:** Verification Bureau
- **Change:** Executed the internally executable Gold Standard Review phases for Chapter 1 (`kl-ch-1`). Fixed a citation-integrity defect: 4 source IDs (`s26`, `s27`, `s29`, `s31`) were referenced by 8 paragraphs but absent from the chapter's local `sources` array, breaking positional citation resolution. Extended the local `sources` array to s1–s31 to match the canonical Source Registry. Added the Constitution v1.1 required blocks "State of the Evidence" and "Evidence Challenges", and renamed "Unresolved Questions" → "Open Questions" for verbatim constitutional alignment. Recorded apparatus-section citation exemption in Book of Record #0016. Created `docs/editorial/chapter-1-gold-standard-review.md` tracking phase status.
- **Justification:** The Evidence Audit (Phase 3) is a mandatory gate. Citation integrity is a correctness defect, not a stylistic one — broken citations would undermine the entire evidence discipline. The two new blocks are required by the locked Constitution v1.1. Human-dependent phases (Expert Review, Reader Review, Visual Audit) and external peer review remain outstanding and block publication.
- **Status:** Chapter 1 CONDITIONAL PASS on internal phases. Awaiting Phases 1, 2, 5 and external peer review (Milestone 2).

---

### 2026-07-15 — Visual Assets Drafted (Deferred Render)

- **Author:** Editorial Bureau (with Verification Bureau)
- **Change:** Drafted 33 planned visuals for Chapter 1 as structured `image`/`map`/`chart` blocks in a deferred-render registry at the end of `chapter1Blocks`. Each carries provenance (creator/source/reference/date), license, credit, caption, status (`planned`), and linked claim IDs. Explanatory diagrams flagged `aiGenerated: true`. The paragraph-based Visual Asset Acquisition List is retained as the human-readable plan.
- **Justification:** The block renderer registry supports only 13 block types; there are no map/chart/image/table renderers (`KnowledgeRenderer.tsx:15` returns null for unregistered types). Building renderers is new platform feature work, forbidden by the Founding Publication freeze until Chapter 1 is published and externally reviewed. Drafting the data now makes the chapter render-ready and lets the Knowledge Density Audit count planned assets. Real archival assets must still be acquired and provenance-cleared in Phase 5 (Visual Audit).
- **Status:** Visual data drafted and deferred. Phase 5 (Visual Audit) outstanding; renderers outstanding (post-publication). Recorded in Book of Record #0017.

---

### 2026-07-15 — Visual Experience System v1.0 (Frozen)

- **Author:** Editorial Engineering
- **Change:** VXS v1.0 completed and frozen. Visual Spine implemented — 13 key narrative visuals (maps, photos, charts, diagrams, document facsimiles) placed inline at their narrative positions. Each visual answers the specific question raised by the preceding paragraph, creating a parallel reading path. Visual Archive retained as a 27-block reference index. PDF detection added to ImageBlock — `.pdf` URLs automatically render as document preview cards with an iframe viewer. Proximity Quality Gate added to `docs/vxs/visual-spine.md`: no major narrative section may introduce a new concept if its primary explanatory visual appears more than one screen later.
- **Justification:** VXS transitions the chapter from text-first-with-appendix to a guided narrative where visuals participate in teaching. This is the first sprint that materially changes what a first-time reader notices within five minutes — satisfying the Platform Beta Experience Rule. The system is frozen because the bottleneck is now editorial (content quality, not rendering capability.) No new visual types, viewers, or transitions will be added unless readers genuinely need them.
- **Capabilities:** Visual Spine (inline placement, maps, photos, charts, documents, diagrams, Visual Archive, PDF viewer, Proximity Quality Gate)
- **Future:** Evidence Exploration, interactive maps, visual comparison, document annotation, dataset explorer
- **Status:** VXS v1.0 frozen. Visual Storytelling complete. Next milestone is Evidence Exploration v1.0.

---

### 2026-07-26 — v1.0.0-chapter1 (Chapter 1 Founding Publication Baseline)

- **Author:** Editorial Engineering
- **Change:** Chapter 1 published and tagged as `v1.0.0-chapter1`. First stable release of The Breakdown Knowledge Platform. Includes Stories (40 public), The Fix Hub (6 canonical Fix fixtures), Problem Intelligence Explorer (6 problems derived from Fixes), Search (problems indexed), Trust layer (Verified / Under Review / In Development states), canonical navigation (header, footer, homepage, search all link to Problems), and Story→Fix relationship (NextExploration renders related Fix cards).
- **Verification:** TypeScript clean, 106/106 tests passing, production build succeeds (253 pages), knowledge graph 94/94 checks passed, 20/20 representative journeys passing.
- **Baseline governance established:** Frozen schemas (Fix, Story, Problem, SearchIndexEntry, EvidenceGrade, PolicyMaturity, TimeHorizon), frozen navigation (header, footer, homepage, search), frozen knowledge graph (Problem↔Fix, Story↔Fix, Story↔Story, Story↔Entity relationships). See `docs/architecture/baseline-v1.0.0-chapter1.md`.
- **Justification:** Founding Publication milestone. Architecture stable, reader journeys validated, trust model consistent. Platform transitions from construction to editorial institution.
- **Deferred:** Real sourceIds, KnowledgeConnections actor links, Fix dual-model cleanup, search results page Fix grouping. All deferred to Chapter 2.
- **Status:** Published. Baseline established. Future work governed by baseline compatibility rules.

---

### 2026-07-26 — ACP Process and Compatibility Levels

- **Author:** Editorial Engineering
- **Change:** Added Architecture Change Proposal (ACP) process and three-tier compatibility levels (A: Additive, B: Compatible Evolution, C: Breaking) to baseline governance. ACP template at `docs/architecture/acp-template.md`. Level A ships freely; Level B requires review; Level C requires new baseline version and migration plan.
- **Justification:** Governance infrastructure for managed evolution. Makes change deliberate without adding bureaucracy. One-page template, five questions.

---

### 2026-07-26 — Governance Framework Completion

- **Author:** Editorial Engineering
- **Change:** Completed governance framework with: five Chapter 1 contracts (Canonical Data, Reader Experience, Knowledge Graph, Editorial Trust, Compatibility), version semantics (patch/minor/major), three recurring reviews (Baseline Review, Graph Integrity Review, Reader Journey Review), and chapter success criteria (one architectural question per chapter). All documented in `docs/architecture/baseline-v1.0.0-chapter1.md` and `AGENTS.md`.
- **Justification:** Architecture treated as a product alongside the reader-facing platform. Governance, compatibility, and reader journeys are now release gates, not optional documentation. Each chapter answers a single architectural question to prevent scope creep.
- **Status:** Active. All future work governed by these contracts.

---

### 2026-07-26 — Architecture Decision Register (ADR)

- **Author:** Editorial Engineering
- **Change:** Created `docs/architecture/adr-index.md` — Architecture Decision Register recording 7 foundational decisions: canonical objects as single source of truth, Problems as virtual entities, navigation as public interface, explicit trust states, canonical graph relationships, architecture as a product, one question per chapter. ACPs propose changes; ADRs record decisions. Together they form institutional memory.
- **Justification:** Institutional memory for architectural decisions. Years later, the ADR answers "Why was this designed this way?" without relying on individual recollections.
- **Status:** Active. New ADRs added whenever significant architectural choices are made.

---

### 2026-07-26 — Architectural Fitness Functions

- **Author:** Editorial Engineering
- **Change:** Created `docs/architecture/fitness-functions.md` — repeatable checks that verify the architecture conforms to its contracts. Covers five areas: Canonical Integrity (no duplicates, no parallel schemas), Knowledge Graph Integrity (no orphaned entities, all relationships resolve), Reader Journey Integrity (core paths work, no dead ends), Trust Integrity (valid states, graceful degradation), Compatibility Integrity (ACP required for frozen schema changes). Three execution tiers: automated (build/test), semi-automated (release spot-checks), manual (baseline reviews).
- **Justification:** Fitness functions make architectural expectations permanent and verifiable rather than release-specific checklists. They are the executable expression of the five contracts.
- **Status:** Active. Growing as the architecture evolves.

---

### 2026-07-26 — Architecture Execution Agent

- **Author:** Editorial Engineering
- **Change:** Created `docs/architecture/execution-agent.md` — operational doctrine for implementing changes against the frozen baseline. Defines architecture hierarchy (baseline > AGENTS.md > ADR > ACP > fitness functions > canonical types > implementation), pre-implementation checklist (5 questions), compatibility classification (A: ship freely, B: ACP required, C: stop + explain), stop conditions (duplicate models, breaking changes, journey regressions, orphaned objects), fitness function verification, and completion report format.
- **Justification:** Governance without execution is documentation. The execution agent makes the governance stack operational by defining exactly how to implement changes while preserving Chapter 1 contracts.
- **Status:** Active. Every implementation against the baseline uses this process.
