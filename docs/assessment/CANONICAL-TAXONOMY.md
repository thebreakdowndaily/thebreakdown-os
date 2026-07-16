# Canonical Taxonomy

> W2-S1 deliverable.
> Establishes the canonical language of The Breakdown Knowledge Platform.
> No implementation. Documentation only.
> **Status:** APPROVED v1.0 — Frozen. No further edits without new evidence.

---

## Introduction

The Reader Walkthrough (W2-PREFLIGHT) identified the largest source of reader confusion: **readers do not understand the platform vocabulary.**

A first-time reader encounters "Stories," "Chapters," "Investigations," "Intelligence," "Entities," "Topics," "Knowledge Library," "Collections," "The Fix," "Data," "Graph" — and cannot distinguish what these are, how they relate, or which to engage with first.

This document inventories every reader-facing noun, detects conflicts, and recommends one canonical term per concept. It does not rename anything in code. It establishes the language the platform should converge toward.

### Scope

- All reader-facing nouns in the public surface (nav, homepage, story pages, chapter pages, entity pages, topic pages, search, graph, data, footer, metadata)
- Internal code names, variables, file names, and routes are out of scope
- URLs are out of scope (changing routes would break links)
- Visual labels only

### Methodology

1. Full inventory of ~200+ reader-facing nouns across the codebase
2. Conflict detection: overlapping terms, synonyms, ambiguous usage
3. Canonical recommendation per conflict
4. Justification referencing: Editorial Constitution, RXS, Reader Walkthrough evidence
5. Migration strategy (no implementation in this sprint)

---

## Taxonomy Principles

1. **Educational language over technical language.** Prefer words a first-time reader understands in an educational context over database or newsroom jargon. "Chapter" over "Story." "Topic" over "Tag."

2. **Institutional language over newsroom language.** Prefer terms that signal a knowledge institution over a media outlet. "Further Reading" over "Latest News." "Learning Path" over "Series."

3. **One term per concept.** No synonyms for the same content type. If two terms mean the same thing, one must be deprecated.

4. **The concept determines the term, not the route.** If a URL says `/story/` but the content is a "Chapter," the label should say "Chapter." The URL is infrastructure, not vocabulary.

5. **Reader-first naming.** A noun is correct if a first-time reader understands what it points to without reading additional context. If a reader must guess, the term is wrong.

6. **Hierarchy is explicit.** The relationship between terms (Volume → Chapter, Topic → Story, Entity → Profile) must be clear from the language itself.

7. **Consistency across surfaces.** The same term must mean the same thing in nav, footer, cards, metadata, empty states, and page headings.

---

## Mental Model

Every major noun should evoke a specific reader mental model. This section defines what a first-time reader should think when encountering each term.

| Term | Reader Thinks |
|------|---------------|
| **Collection** | "A broad body of work on a major subject." |
| **Volume** | "A major division of a Collection. A complete treatment of one era or theme." |
| **Chapter** | "A guided learning unit within a Volume. I can read it start to finish and know what I learned." |
| **Story** | "A standalone publication. Not part of a larger work, but evidence-backed." |
| **Investigation** | "A deeper examination of a problem or claim. Multiple chapters, evidence-first." |
| **Entity** | "Something the platform knows about — a person, organization, country, policy, or concept with a verified profile." |
| **Person** | "An individual the platform tracks." |
| **Organization** | "An institution, body, or group the platform tracks." |
| **Topic** | "A subject area. I can explore it to find stories, entities, and investigations." |
| **Knowledge Graph** | "The map of relationships between everything the platform knows — entities, topics, stories, and how they connect." |
| **Claim** | "A verified factual assertion. An atomic piece of knowledge." |
| **Evidence** | "The supporting material for a claim. Sources, documents, data." |
| **Source** | "The origin of evidence. Where a claim comes from." |
| **Library** | "The full catalog of everything the institution has published." |
| **Learning Path** | "A recommended sequence to understand a subject from foundation to mastery." |

---

## Canonical Vocabulary

### Content Hierarchy

These are the canonical types of knowledge objects on the platform. Every reader-facing noun should map to exactly one of these.

| Canonical Term | Definition | Reader Meaning | Where Used |
|---|---|---|---|
| **Chapter** | A self-contained, verified knowledge object that is part of a Volume. | "A structured piece of knowledge I can read, study, and reference." | StoryShell, Volume page, footer, hero CTAs |
| **Volume** | A curated collection of chapters forming a complete treatment of a subject. | "A book-length treatment of a major subject." | PrimaryPath, Volume page, hero CTAs |
| **Collection** | A grouping of volumes, stories, or investigations around a theme. | "A themed set of knowledge objects." | CollectionsPreview (heading), footer |
| **Story** | A standalone, evidence-backed article (shorter than a chapter). | "A focused article on a specific topic." | Nav, Latest Stories, filter tabs |
| **Investigation** | A multi-chapter evidence-based report on a specific problem. | "An in-depth look at a problem and its causes." | Nav, investigations page, footer |

### Key Conflict: Story vs. Chapter

**Problem:** "Story" and "Chapter" are used interchangeably in some contexts. Investigation chapters use `/story/` URLs. The nav item "Stories" includes both standalone stories AND investigation chapters.

**Canonical term:** Both, with clear distinction.

- A **Chapter** is a canonical knowledge object within a Volume (Part I, Part II, etc.) or within an Investigation.
- A **Story** is a standalone knowledge object outside any Volume or Investigation.

**Reader distinction:** "A chapter belongs to something larger. A story stands on its own."

**Surface guidance:**
- Nav label "Stories" is acceptable for standalone articles (they are stories)
- Investigation sub-units should be labelled "Chapters" even though they use `/story/` URLs
- The filter "Stories" in search should exclude investigation chapters (or include a sub-filter)

### Finding & Discovery

| Canonical Term | Definition | Reader Meaning | Where Used |
|---|---|---|---|
| **Topic** | A subject area organizing stories, entities, and investigations. | "A subject I can explore to find related knowledge." | Nav, topic pages, explore by topic |
| **Entity** | A person, organization, country, policy, or institution with a profile. | "A profile of something or someone important." | Entity pages, search, spotlight |
| **Knowledge Graph** | The interconnected map of all entities, topics, and stories. | "A map showing how everything connects." | Graph page, preview, entity pages |

### Key Conflict: Entity vs. Thinker

**Problem:** The homepage section "Key Thinkers and Organizations" uses "Thinkers" but everywhere else uses "Entities." This introduces a third term ("Thinker") that conflicts with "Entity" and "Person."

**Canonical term:** Entity. Person is a type of Entity.

**Explanation:** "Key Thinkers and Organizations" should be "Key People and Organizations" or simply "Notable Entities." "Thinker" is not used anywhere else in the platform taxonomy and creates ambiguity (is a thinker different from an entity?).

**Surface guidance:**
- "Key Thinkers and Organizations" → "Notable Entities" or "Key Entities"
- Entity profile pages already say "Knowledge Terminal" — this sub-type distinction is unnecessary

### Key Conflict: Intelligence

**Problem:** "Intelligence" is used in 6+ distinct section headings with different meanings:
- "Today's Intelligence" (homepage activity section)
- "Live Intelligence" (breaking banner)
- "Data & Intelligence" (insights section)
- "Latest Intelligence" (topic page stories section)
- "Trending Intelligence" (insights card)
- "Recently Updated Intelligence" (insights card)

**Canonical term:** Deprecate "Intelligence" as a standalone noun. Replace with context-specific terms.

**Explanation:** "Intelligence" carries intelligence-agency connotations and is not transparent to first-time readers. It is also used too broadly — it sometimes means "stories," sometimes "data," sometimes "updates." In every case, a more specific term exists.

**Suggested replacements:**
- "Today's Intelligence" → "Activity" or "Recent Updates"
- "Live Intelligence" → Breaking or "Live" (if needed at all)
- "Data & Intelligence" → "Data & Insights"
- "Latest Intelligence" → "Latest Stories" or "Related Coverage"
- "Trending Intelligence" → "Trending"
- "Recently Updated Intelligence" → "Recently Updated"

### Governance & Transparency

| Canonical Term | Definition | Reader Meaning | Where Used |
|---|---|---|---|
| **Methodology** | Explanation of how research, verification, and publication work. | "How this institution does its work." | Hero, footer, trust link |
| **Editorial Constitution** | The governing document of the institution. | "The rules this institution follows." | Hero, footer, trust link |
| **Trust Dashboard** | Live transparency dashboard. | "All the metrics about how trustworthy this is." | Hero, footer, TrustBar |
| **Corrections Policy** | How errors are handled. | "What happens when you get something wrong." | Hero, footer |
| **Sources Policy** | How sources are selected and cited. | "Where the evidence comes from." | Footer |

### Key Conflict: Trust vs. Trust Dashboard

**Problem:** TrustBar link says "Trust" (short form), footer and hero say "Trust Dashboard."

**Canonical term:** "Trust Dashboard" (full form). The shorter "Trust" is ambiguous — trust in what? The dashboard name is self-explanatory.

**Surface guidance:** TrustBar link text should use the full canonical name.

### Navigation & Sections

| Canonical Term | Definition | Reader Meaning | Where Used |
|---|---|---|---|
| **The Fix** | Evidence-based solutions to problems. | "Not just what's wrong — what would fix it." | Nav, footer, fix page |
| **Data** | Datasets, charts, and statistics. | "Numbers and data behind the stories." | Nav |
| **Founding Edition** | The first publication package. | "The first thing this institution published." | Footer |
| **Library** | The full catalog of all knowledge objects. | "Everything this institution has." | Footer, breadcrumbs |

### Key Conflict: Data vs. Data Stories

**Problem:** Nav says "Data." Footer says "Data Stories." Both link to `/data`.

**Canonical term:** "Data." "Data Stories" implies all data items are stories, which may not be true (datasets, charts, statistics).

**Surface guidance:** Footer link "Data Stories" → "Data." The page heading can remain "Data Hub" or become simply "Data."

### Key Conflict: Knowledge Library vs. Library vs. Collections

**Problem:** Footer section heading says "Knowledge Library." Content preview says "library" (lowercase). Breadcrumb says "Back to Library." The nav used to have "Library" (legacy). None are consistent.

**Canonical term:** "Library" as the primary term. "Knowledge Library" is redundant — what other kind of library would a knowledge platform have?

**Surface guidance:**
- Footer section heading "Knowledge Library" → "Library"
- Content preview "Explore the full library" → consistent with "Library"
- Breadcrumb "Back to Library" → consistent
- "Browse the complete library" → consistent

### Key Conflict: Knowledge Graph vs. Graph

**Problem:** Nav uses "Graph" (short). Page heading uses "Knowledge Graph." Entity section uses "Knowledge Graph." Topic sidebar uses "Knowledge Graph."

**Canonical term:** "Knowledge Graph" for page headings and descriptive context. "Graph" is acceptable as a short nav label IF space constrained, but the primary canonical term is the full form.

**Surface guidance:** Nav could remain "Graph" for brevity, but all headings, descriptions, and CTAs should use "Knowledge Graph."

### Learning & Reader Guidance

| Canonical Term | Definition | Reader Meaning | Where Used |
|---|---|---|---|
| **Learning Path** | A recommended sequence of chapters. | "A suggested reading order to understand a subject." | PrimaryPath eyebrow |
| **What You Will Learn** | Learning objectives preview. | "What I will know after reading this." | PrimaryPath, chapter hero |
| **Continue Your Learning** | Secondary content recommendation. | "What to read after finishing the main path." | CollectionsPreview heading |
| **Further Reading** | Additional recommended stories. | "More things to read on related subjects." | LatestStories heading |
| **Start Here** | The primary entry point. | "The one thing to begin with." | PrimaryPath heading |
| **Active Research** | Current editorial activity signal. | "What the institution is working on now." | Homepage transition label |
| **Explore Knowledge** | Gateway to discovery tools. | "Ways to explore beyond the main path." | Homepage transition label |

### Reading Experience

| Canonical Term | Definition | Reader Meaning | Where Used |
|---|---|---|---|
| **Reading Mode** | Configurable reading depth. | "How deeply I want to read." | Chapter hero |
| **On This Page** | Section navigation within a chapter. | "What sections are in this chapter." | Chapter sidebar |
| **Learning Objectives** | What the reader should learn. | "What I should know when I'm done." | Chapter hero |

### Key Conflict: Reading Modes

**Problem:** "Explorer," "Scholar," "Researcher" are not explained. A reader does not know what changes between them — are they different content? Different layout? Different duration estimates?

**Canonical terms:** Keep the three labels but add brief explanatory tooltips or helper text.

**Recommendation:** No rename, but each mode needs a one-line explanation:
- Explorer (5–10 min): "Key narrative and essential evidence"
- Scholar (20–30 min): "Full analysis with historiography and sources"
- Researcher (2–4 hrs): "Complete chapter with all evidence, documents, and citation data"

### Platform Objects

| Canonical Term | Definition | Reader Meaning | Where Used |
|---|---|---|---|
| **Claim** | A verified factual assertion. | "A fact that has been checked." | Hero stat, claim registry, terminal |
| **Evidence** | Supporting material for a claim. | "The proof behind a fact." | Terminal, evidence panel |
| **Source** | The origin of evidence. | "Where the evidence came from." | Source registry, footer, citations |
| **Primary Source** | A firsthand document or record. | "An original document from the time." | Hero stat, methodology |
| **Confidence** | How certain we are about a claim. | "How sure the institution is." | Entity card, claim registry |
| **Document** | A reproduced primary source. | "A historical document you can read." | Chapter primary sources section |
| **Timeline** | Chronological events related to a subject. | "Key events in order." | Chapter, entity page, topic page |

### Homepage Sections

| Section Eyebrow | Section Heading | Canonical? |
|---|---|---|
| (badge) | "Evidence-first Knowledge Platform" | ✅ Canonical |
| — | "The Breakdown" with motto | ✅ Canonical |
| — | Trust metrics + CTAs | ✅ Canonical |
| — | TrustBar | ✅ Canonical |
| "The Canonical Learning Path" | "Start Here: India and the World" | ✅ Canonical |
| "Next: Explore the full library" | "Continue Your Learning" | ✅ Canonical |
| "Active Research" | (divider label) | ⚠️ Acceptable |
| — | "Today's..." section | ⚠️ Conflicting term (Intelligence) |
| — | "Further Reading" | ✅ Canonical |
| "Explore Knowledge" | (divider label) | ✅ Canonical |
| — | "Explore by Topic" | ✅ Canonical |
| — | "Key Thinkers and Organizations" | ❌ "Thinkers" conflicts with "Entity" |
| "Architecture" | "Powered by the Knowledge Graph" | ✅ Canonical |
| — | "Platform Overview" | ✅ Canonical |
| — | "Weekly Briefing" | ✅ Canonical |

---

## Deprecated Vocabulary

These terms should be phased out of reader-facing surfaces. They may remain in code, routes, or internal documentation.

| Term | Reason for Deprecation | Canonical Replacement |
|---|---|---|
| **Intelligence** (as standalone noun) | Intelligence-agency connotations; too broad to be meaningful | Context-specific: "Updates," "Insights," "Activity," "Coverage" |
| **Thinker** | Not used anywhere else in taxonomy; conflicts with "Entity/Person" | "Person" or remove (use "Key Entities") |
| **Knowledge Library** | Redundant ("Knowledge" is implied by the institution) | "Library" |
| **Data Stories** | Not all data items are stories; conflicts with "Data" nav label | "Data" |
| **Trust** (as nav/section link) | Ambiguous without noun context | "Trust Dashboard" |
| **Live Intelligence** | Redundant (Intelligence deprecated) | "Live" or remove |
| **Today's Intelligence** | Redundant (Intelligence deprecated) | "Today's Updates" or "Activity" |
| **Latest Intelligence** | Redundant (Intelligence deprecated) | "Latest Coverage" or "Related Stories" |
| **Trending Intelligence** | Redundant (Intelligence deprecated) | "Trending" |
| **Recently Updated Intelligence** | Redundant (Intelligence deprecated) | "Recently Updated" |
| **Intelligence Terminal** (breadcrumb) | Intelligence-agency connotation | "Entities" or "Entity Directory" |
| **Knowledge Terminal** (page title) | "Terminal" is technical jargon | "Entities" or "{Entity Name} — Entity Profile" |
| **Knowledge Hub** | Vague; doesn't tell reader what it is | "Topics" or "Explore Topics" |
| **Knowledge Spotlight** (search) | Vague; "Spotlight" is feature language | "Featured Results" or "Top Result" |
| **Data & Intelligence** | Intelligence deprecated; too broad | "Data & Insights" |
| **The Canonical Learning Path** (eyebrow) | "Canonical" is technical jargon | Remove "Canonical" — "The Learning Path" or "Start Here" |

---

## Approved Synonyms

These terms are acceptable equivalents in specific contexts where the canonical term would be awkward. Limited to the exact scenarios listed.

| Canonical Term | Approved Synonym | Allowed Context | Reason |
|---|---|---|---|
| **Knowledge Graph** | **Graph** | Nav link (space-constrained) | Brevity in navigation |
| **Library** | **Knowledge Library** | Footer section heading | Can remain if "Library" alone feels too generic in footer context; prefer "Library" long-term |
| **Volume I** | **Volume I: Foundations (1947–1962)** | Hero, primary path | Full name in primary CTAs; short name after first reference |
| **Chapter** | **Chapter 1** | Footer, breadcrumb | Specific reference with number |
| **Methodology** | **How We Work** | Hero secondary CTA | Friendly alternative for the hero button; page title remains "Methodology" |
| **Entity** | **Person** / **Organization** / **Country** | Entity type labels, filters | These are subtypes of Entity, not synonyms for Entity itself |

---

## Naming Rules

These rules govern how canonical terms are applied in reader-facing surfaces.

### Rule 1: One Concept, One Term

Every knowledge object type has exactly one canonical name. Do not introduce alternative terms for the same content type.

**Example:** A "Chapter" is always a "Chapter." Never call it "Article," "Post," "Entry," or "Page" in a reader-facing label.

### Rule 2: Hierarchy in Labels

When a surface references two levels of hierarchy, use both terms.

**Example:** "Volume I, Chapter 3" not just "Chapter 3" — unless the volume context is already clear.

### Rule 3: No Jargon Without Explanation

Technical terms ("canonical," "node," "edge," "graph," "terminal," "registry") must not appear in reader-facing labels unless immediately explained.

**Example:** "The Canonical Learning Path" → "The Learning Path." "Knowledge Terminal" → entity page (with no "terminal" label).

### Rule 4: No Newsroom Language

Terms that signal a news operation ("Breaking," "Latest," "Trending," "Live") should be used sparingly and only when temporally accurate.

**Exception:** "Further Reading" is acceptable because it signals supplementary, not urgency.

### Rule 5: No Intelligence Language

"Intelligence" should not appear in any reader-facing label. Use "Insights," "Updates," "Activity," or "Coverage" instead.

### Rule 6: Titles vs. Labels

Page titles (H1) use the canonical term. Navigation labels may use shortened forms when space-constrained. Descriptive text and metadata must use full canonical terms.

**Example:** Nav may say "Graph." Page heading must say "Knowledge Graph."

---

## Reader Examples

These examples illustrate how canonical terms would read to a first-time visitor.

### Navigation (after convergence)

Current:
```
Stories | Topics | Investigations | Countries | Organizations | The Fix | Data | Graph
```

Canonical (labels only — no route changes):
```
Stories | Topics | Investigations | The Fix | Data | Graph
```
(Countries and Organizations are Entity subtypes accessed via the Entity directory)

### Homepage Section (after convergence)

Current:
```
Today's Intelligence — Major Stories · New Entities · New Topics · Claims Verified · Datasets Updated
```

Canonical:
```
Recent Activity — New Stories · Updated Topics · Claims Verified
```

### Chapter Metadata

Current:
```
Chapter 1 · Verified · v1.0.0 · Explorer E5–10 min · Scholar S20–30 min · Researcher R2–4 hrs
```

Canonical:
```
Chapter 1 · Verified · Explorer (5–10 min) · Scholar (20–30 min) · Researcher (2–4 hrs)
```
With tooltips:
- Explorer: "Key narrative and essential evidence"
- Scholar: "Full analysis with historiography and sources"
- Researcher: "Complete chapter with all evidence, documents, and citation data"

### Entity Page Title

Current:
```
United Nations — Knowledge Terminal
```

Canonical:
```
United Nations — Entity Profile
```

### Breadcrumb

Current:
```
Home / Intelligence Terminal / United Nations
```

Canonical:
```
Home / Entities / United Nations
```

### Search Section

Current:
```
Intelligence & Coverage — Knowledge Spotlight
```

Canonical:
```
Related Coverage — Top Result
```

### Story Page Metadata

Current:
```
geopolitics • 14 Min Read • QS 98
```

Canonical:
```
Geopolitics · 14 min · Confidence 98
```
(QS should be expanded or replaced with more transparent label)

---

## Migration Strategy

This sprint is documentation only. Implementation of these changes will occur in subsequent W2 sprints.

### Phase 1 (W2-S2: Orientation)
- No taxonomy changes
- Establish orientation patterns that use canonical vocabulary in new additions
- Avoid introducing deprecated terms in new code

### Phase 2 (W2-S3: Reading Guidance)
- Update reading mode labels add tooltips
- Apply canonical terms in reading experience enhancements
- Replace "Intelligence" usages in reading-adjacent surfaces

### Phase 3 (W2-S4: Discovery)
- Refine search and discovery vocabulary
- Align entity page labels with canonical taxonomy
- Update homepage section headings

### Phase 4 (Post-W2 — not yet scheduled)
- Navigation label updates
- Footer terminology alignment
- Metadata description convergence
- Meta tag alignment

### No-Action Items

These terms already conform to the canonical taxonomy and need no change:
- "Methodology" ✅
- "Editorial Constitution" ✅
- "Trust Dashboard" ✅ (subject to TrustBar consistency)
- "Corrections Policy" ✅
- "Sources Policy" ✅
- "Evidence" ✅
- "Claim" ✅
- "Source" ✅
- "Topic" ✅
- "Library" ✅ (as the canonical term; "Knowledge Library" → deprecated)
- "Further Reading" ✅

---

## Highest-Risk Terminology Conflicts

Ranked by impact on first-time reader comprehension:

| Rank | Conflict | Impact | Effort to Fix |
|------|----------|--------|---------------|
| 1 | **Intelligence** used 6+ ways | High — readers cannot distinguish between sections | Low-medium (mostly heading text changes) |
| 2 | **Story vs. Chapter** overlap | High — a reader cannot tell what a "Story" is vs. a "Chapter" | Medium (some component changes, URL patterns remain) |
| 3 | **Thinker vs. Entity** | Medium — introduces unnecessary term on homepage | Low (single heading change) |
| 4 | **Knowledge Library vs. Library vs. Collections** | Medium — three terms for the same concept | Low (heading changes) |
| 5 | **Data vs. Data Stories** | Medium — nav and footer disagree | Low (single footer link change) |
| 6 | **Reading mode labels unexplained** | Medium — reader does not know what modes do | Low (tooltip/helper text) |
| 7 | **Trust vs. Trust Dashboard** | Low — different lengths for same concept | Low (single link text change) |
| 8 | **Knowledge Graph vs. Graph** | Low — reader can infer meaning | Low (page heading already correct) |

---

## Open Questions

These questions require editorial input before final convergence.

1. **Should "Countries" and "Organizations" remain top-level nav items?** They are entity subtypes. Moving them under an "Entities" nav would simplify navigation but requires a route change (out of scope for this sprint).

2. **What is the canonical term for the Reader Mode feature?** "Reading Mode" vs. "Reading Depth" vs. "Reading Level." The current term "Reading Mode" is adequate but not self-explanatory.

3. **Should "QS" (Quality Score) be renamed?** "QS" is not transparent to new readers. Options: "Confidence," "Evidence Score," "Quality Score" (expanded), or the current abbreviation with a tooltip.

4. **What is the relationship between "Collections" and "Library"?** Currently "Collections" appears on the homepage as "Continue Your Learning" but the term recurs in the footer as "Knowledge Library." The recommended canonical is "Library" as the container for all content, but the editorial team should confirm.

5. **Should "The Fix" be renamed?** "The Fix" is distinctive and memorable but does not tell a reader what it contains. The tagline "Not just what's wrong. What would fix it." explains it, but the nav label alone may not. Editorial judgment needed.

6. **"Back to Volume" breadcrumb — which Volume name?** Currently uses the slug "the-nehruvian-era" which is not human-readable. Should the breadcrumb use the volume subtitle "Foundations (1947–1962)"? This requires a data change.

---

## Inventory Summary

| Metric | Count |
|--------|-------|
| Reader-facing terms inventoried | ~200+ |
| Unique concepts | ~40 |
| Conflicts detected | 12 |
| Highest-risk conflicts | 3 |
| Terms recommended for deprecation | 12 |
| Approved synonyms | 6 |
| Files created | 1 |
| Files modified | 0 |
