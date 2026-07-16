# Institutional Assessment

> Phase 1 — PLATFORM-INTEGRATION-MASTERPLAN.md
> Narrative assessment of each public surface against governing documents
> Date: July 2026

---

## Scoring Summary

| Surface | Mission | Reader Exp | Navigation | Visual | Investigation | Trust | Learning | A11y | Perf | Editorial | **Composite** |
|---------|---------|-----------|------------|--------|--------------|-------|----------|------|------|-----------|--------------|
| Homepage | 4 | 2 | 2 | 2 | 0 | 3 | 1 | 3 | 3 | 2 | **2.3** |
| Story (legacy) | 2 | 1 | 1 | 1 | 0 | 1 | 1 | 1 | 3 | 1 | **1.3** |
| Story (Shell) | 4 | 3 | 3 | 2 | 2 | 2 | 3 | 2 | 3 | 3 | **2.8** |
| Knowledge Library | 3 | 2 | 3 | 1 | 0 | 2 | 1 | 2 | 3 | 2 | **2.1** |
| Investigation | 2 | 1 | 2 | 0 | 1 | 1 | 0 | 1 | 3 | 1 | **1.3** |
| Search | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 1 | 3 | 0 | **0.8** |
| Trust Dashboard | 3 | 1 | 2 | 0 | 0 | 2 | 0 | 2 | 3 | 2 | **1.7** |
| Methodology | 4 | 2 | 2 | 0 | 0 | 3 | 0 | 2 | 3 | 4 | **2.4** |
| Editorial Constitution | 4 | 1 | 2 | 0 | 0 | 2 | 0 | 1 | 3 | 3 | **2.0** |
| Founding Edition | 4 | 2 | 2 | 0 | 0 | 2 | 0 | 2 | 3 | 3 | **2.1** |
| **Platform Average** | **3.1** | **1.6** | **2.0** | **0.6** | **0.3** | **1.8** | **0.6** | **1.7** | **3.0** | **2.1** | **1.8** |

---

## 1. Homepage (/) — 2.3/5

**Governing docs:** `docs/rxs/screens/homepage.md`, Editorial Constitution

### What exists
Hero section with tagline + CTA buttons, featured story cards, knowledge-library grid, latest-articles list, topic taxonomy navigation, footer with disclaimer and links. Clean visual hierarchy. Server-rendered.

### Gaps against spec
1. **Continue Learning (CRITICAL):** RXS homepage spec §3.2 requires a "Continue Learning" section for returning readers — recently viewed chapters, reading progress, suggested next reads. Missing entirely. First-time reader gets the same experience as a returning reader.
2. **Featured Investigations:** RXS spec §3.3 requires featured investigations as top-tier content alongside stories. Missing.
3. **Governance Footer:** Editorial Constitution requires prominent links to /methodology, /trust, /editorial-constitution in footer. Current footer has only generic links.
4. **Visual Spine:** Homepage hero/cards don't consume Visual Spine metadata (evidence level, provenance badge). Images are decorative.
5. **LatestStories section:** Uses news-first pattern (chronological list of stories). Institutional homepage should lead with curated knowledge, not recency.

### Recommendations
- Add ContinueLearning section above LatestStories; track via localStorage or session
- Add featured investigation cards (2-3 max)
- Restructure homepage hierarchy: Hero → Continue Learning → Featured Investigations → Knowledge Library → Latest
- Add governance links to footer
- Low effort, high reader-visibility

---

## 2. Story Page — Legacy Path (/story/[slug]) — 1.3/5

**Governing docs:** `docs/rxs/screens/story.md`, `docs/rxs/contracts/story-shell.md`, Editorial Constitution

### What exists
Custom page component with prose rendering, sidebar components, chapter cards, evidence panel, thinker cards, timeline integration, related content. Functional but built outside the RXS StoryShell architecture.

### Gaps against spec
1. **StoryShell bypass (BLOCKING):** Does not use `StoryShell` component from `components/rxs/`. All layout logic duplicated. Creates two parallel rendering paths.
2. **Table of Contents:** No sticky TOC for long-form navigation — violates RXS §4.1 reading pattern requirement.
3. **Progress tracking:** No reading progress indicator. Reader cannot tell how far through a story they are.
4. **Reading Mode Toggle:** `ReadingModeToggle` component exists in codebase but is not rendered here. No focus/reference/learning mode switching.
5. **Version/Livestatus badge:** No version indicator, last-verified timestamp, or freshness score — violates Editorial Constitution transparency requirements.
6. **Evidence proximity:** Claims reference evidence but evidence is not reachable within one interaction from a claim on this path.
7. **State of the Evidence:** Missing "State of the Evidence" section required by RXS §5 — would show confidence levels, scholarly disagreement count, evidence debt.

### Recommendations
- Migrate this route to use StoryShell (same as /chapter/[id])
- If consolidation not feasible, align layout contract to match StoryShell's 5-region architecture
- Add ReadingModeToggle, TOC, progress bar, version badge
- Medium-to-high effort but critical for institutional coherence

---

## 3. Story Page — StoryShell Path (/chapter/[id]) — 2.8/5

**Governing docs:** `docs/rxs/contracts/story-shell.md`, Editorial Constitution

### What exists
Full StoryShell implementation with chapter-header, prose-content, evidence-panel, sidebar-navigation, learning-block. Five regions wired per spec. Editorial-sidebar with glossary, thinkers, documents. Best-implemented surface on platform.

### Gaps against spec
1. **ReadingModeToggle exists but not wired:** Component exists, StoryShell has a `readingMode` slot, but toggle is not rendered in any shell region.
2. **Version badge missing:** No trust/livestatus badge visible in the shell header. Trust signals required by Editorial Constitution.
3. **State of the Evidence section:** Not implemented. Would show confidence aggregation, evidence debt warnings, scholarly disagreements count.
4. **Visual metadata not consumed:** Visual Spine evidenceLevel, provenance, status fields exist in knowledge objects but are not rendered alongside images.
5. **No "Continue to Next Chapter" footer:** Reader finishes a chapter and hits blank space — no clear next-action.

### Recommendations
- Wire ReadingModeToggle into the shell's control region
- Add version badge to chapter-header region
- Implement State of the Evidence as collapsible section
- Add post-chapter navigation footer
- Lower effort than legacy path migration; high reader impact

---

## 4. Knowledge Library — Collection/Volume/Chapter — 2.1/5

**Governing docs:** `docs/rxs/screens/knowledge-library.md`, Editorial Constitution

### What exists
Full three-level hierarchy: Collection → Volume → Chapter. Collection page shows volumes as cards with descriptions and stats. Volume page shows organizational info, metadata, chapter progression with completion status, chapter cards with read-time estimates. Chapter page uses StoryShell.

### Gaps against spec
1. **RXS Knowledge Library spec elements missing:** The spec at docs/rxs/screens/knowledge-library.md includes search within collection, knowledge density indicators, filter/sort options, and comparison features — none implemented.
2. **Visual assets minimal:** Collection/volume cards lack rich visual treatment (hero images, visual spine data).
3. **Progress tracking:** Chapter cards show completion status but no cross-collection reading progress.
4. **Knowledge completeness indicators:** The Knowledge Completeness checklist from Editorial Constitution isn't surfaced — readers can't see which chapters are "Published" vs "Draft" vs "In Review".
5. **No learning path guidance:** Spec suggests showing "What to Read Next" based on reading history.

### Recommendations
- Add search/filter within collection
- Surface knowledge completeness status per chapter
- Add visual hero images from asset registry to collection/volume cards
- Add cross-collection progress view
- Medium effort; clarifies institutional state

---

## 5. Investigation Page (/investigation/[slug]) — 1.3/5

**Governing docs:** `docs/rxs/screens/investigation.md` (279 lines), Editorial Constitution

### What exists
Basic page shell with title, description, evidence panel, and sources list. Far simpler than the 279-line RXS specification.

### Gaps against spec
1. **Evidence blocks:** RXS spec requires structured evidence blocks with type, venue, date, description, and significance. Not implemented.
2. **Competing explanations:** Spec requires explicit "Competing Explanations" section presenting alternative interpretations of evidence. Missing.
3. **Open questions:** Spec requires "Open Questions" section identifying what remains unknown. Missing.
4. **Timeline integration:** Investigation should include a timeline of key events. Not present.
5. **Key documents:** Spec requires a "Key Documents" section with document facsimiles and analysis. Missing.
6. **Verification status per claim:** RXS requires per-claim verification badges. Not present.

### Recommendations
- Complete rewrite per RXS investigation spec (279 lines)
- Prioritize evidence blocks, competing explanations, and open questions
- Medium-to-high effort; currently the weakest narrative surface after search

---

## 6. Search Page (/search) — 0.8/5

**Governing docs:** `docs/rxs/screens/search.md`, Editorial Constitution

### What exists
Simple keyword search with text input, results list showing title, type, excerpt, and relevance score. Basic and functional.

### Gaps against spec
1. **12 search modes vs 1:** RXS spec defines 12 search modes (keyword, filter, claims, evidence, sources, thinkers, timeline, documents, maps, learning, cross-reference, advanced). Only keyword exists.
2. **No knowledge object facets:** Results don't distinguish between story/chapter/claim/evidence/source/thinker/document types.
3. **No visual search results:** Maps, images, and documents not returned in search results.
4. **No advanced filters:** Date range, topic, type, author, verification status filters all missing.
5. **No "Search within collection" context:** Spec requires ability to search within a specific collection or volume.

### Recommendations
- Phase 1: Add knowledge-object type facets (claim, evidence, source, thinker)
- Phase 2: Add filter sidebar (date, topic, verification status)
- Phase 3: Add visual search results
- Phase 4: Add remaining modes
- Large effort; highest gap score but should be incremental

---

## 7. Trust Dashboard (/trust) — 1.7/5

**Governing docs:** Editorial Constitution (Article XIII Transparency), docs/product-quality.md

### What exists
Page displaying trust metrics: Editorial Constitution version, chapters published, claims registered, primary sources cited, open scholarly disagreements, corrections issued, average Trust Score, evidence debt, Gold Standard Review completion, last verification date.

### Gaps against spec
1. **Institutional Trust Score hardcoded:** The 87/100 score is hardcoded. Editorial Constitution §Trust Index requires automatic computation from canonical data layer with 9 weighted components.
2. **No computation engine:** No TrustService that reads from registries and computes scores dynamically.
3. **Evidence debt hardcoded:** "—" displayed rather than computed value.
4. **No trend data:** Spec implies trend visualization (scores over time); not implemented.
5. **No drill-down:** Cannot click on any metric to see underlying data.
6. **Freshness not tracked:** Last-verified dates per chapter not surfaced.

### Recommendations
- Build TrustService that reads from claim/source/chapter registries
- Compute Institutional Trust Score automatically
- Add trend data (month-over-month)
- Add drill-down capability per metric
- High effort; critical for institutional transparency

---

## 8. Methodology Page (/methodology) — 2.4/5

**Governing docs:** Editorial Constitution, AGENTS.md (Publication Requirement)

### What exists
Comprehensive methodology page covering: research methodology, evidence verification, claim confidence, scholarly disagreements, corrections, AI use, chapter evolution, visual verification. Well-written and comprehensive.

### Gaps against spec
1. **Visual evidence verification:** Section on how visual assets are selected and verified is present but brief (2 paragraphs). Could expand to match asset management rules from AGENTS.md.
2. **Source intelligence:** No section on how sources are evaluated for authority, trust, freshness (as specified in AGENTS.md Priority 6).
3. **Knowledge lifecycle:** Section on chapter evolution could reference the Knowledge Lifecycle described in Editorial Constitution Article XII.
4. **AI use disclosure:** Section on AI use exists but doesn't reference specific policies from Editorial Constitution.

### Recommendations
- Expand visual verification section referencing asset management rules
- Add source intelligence methodology
- Reference Editorial Constitution articles explicitly
- Low effort; page is already the second-best implemented surface

---

## 9. Editorial Constitution Page (/editorial-constitution) — 2.0/5

**Governing docs:** Editorial Constitution (governing document itself)

### What exists
Full text of Editorial Constitution rendered as a page with article navigation. Faithful transcription of the governing document.

### Gaps against spec
1. **No interactive navigation:** Long document with no sticky TOC, no search within, no article jumping.
2. **No version badge:** No visible version indicator (v1.1 Locked) in the page header.
3. **No ratifying context:** No explanation of who ratified it, when, or the ratification process.
4. **No cross-references:** No links to related sections in other policies (/methodology, /trust, corrections policy).

### Recommendations
- Add sticky TOC with article links
- Add version badge with ratification date
- Add cross-reference links to related policies
- Low effort

---

## 10. Founding Edition Page (/founding-edition) — 2.1/5

**Governing docs:** AGENTS.md (Founding Publication)

### What exists
Landing page for the Founding Edition explaining what it is, what's included, and linking to components (Editorial Constitution, Methodology, etc.).

### Gaps against spec
1. **No publication sequence:** AGENTS.md specifies release sequence (Methodology → Constitution → Trust Dashboard → Chapter 1 → Announcement). Page doesn't show which are released vs pending.
2. **No milestone tracking:** Three milestones (Gold Standard Review, External Peer Review, Founding Publication) not shown with status.
3. **No observation period context:** No explanation that after publication there is an observation period before Chapter 2.
4. **Lacks institutional branding:** No version indicator, no founding date, no institutional statement.

### Recommendations
- Add milestone tracker showing Gold Standard, External Review, Publication status
- Show publication sequence with release dates
- Add observation period explanation
- Low effort
