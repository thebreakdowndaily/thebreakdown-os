# Knowledge Library

> **RXS v1.0 (Frozen)** — Part of the Reader Experience System. Do not modify outside the governance process defined in `README.md`.

## Goal

Design the surface where readers discover, organise, and revisit knowledge. The Knowledge Library is not a directory or a search-results page. It is the reader's relationship with the institution — the place they return to when they want to understand something new, pick up where they left off, or confirm what they know. If the Story screen earns trust, the Knowledge Library earns return.

## Reader Intent

**Start learning.** The reader arrives with no prior knowledge of the platform. They want to understand what exists, what is worth their time, and where to begin. The Library must orient without overwhelming.

**Resume learning.** The reader has been here before. They want to return to their last story, their bookmarked position, or their in-progress chapter. The Library must return them to context, not to the beginning.

**Browse collections.** The reader wants to see what the institution covers. They are exploring breadth — scanning collections, volumes, and topics to understand the scope of the knowledge available.

**Find references.** The reader needs a specific document, thinker profile, timeline, or dataset they encountered before. They are searching by memory, not by keyword. The Library must support recognition before recall.

**Build expertise.** The reader wants to study a topic systematically. They are not browsing — they are following a curriculum. The Library must show a clear path from foundational to advanced knowledge.

**Follow updates.** The reader has read something before and wants to know what changed. New evidence, revised interpretations, expanded sections. The Library must surface freshness without requiring the reader to check manually.

**Save for later.** The reader finds something they want to read but does not have time now. The Library must support intent without requiring immediate commitment.

## Reader Lifecycle

**Discover.** The reader arrives at the Library. They see the knowledge landscape — collections, featured volumes, recent updates, and their own progress. The discover stage is about breadth. Orientation precedes choice. The reader should never feel lost in the first five seconds — they should see a clear starting point or a clear way to find their own.

**Choose.** The reader selects a collection, volume, or chapter. The choice is informed by the signals visible in the discover stage: what is trusted, what is current, what is relevant to their intent. The Library must surface enough information to make choice possible without requiring the reader to enter every object to evaluate it.

**Explore.** The reader enters a collection or volume. They see its structure — chapters in sequence, topics covered, thinkers featured, documents available. Explore narrows the landscape from the entire library to one coherent body of knowledge. The reader can move freely without fear of getting lost because the volume's structure is always visible and the Library is always one action away.

**Read.** The reader opens a chapter. They transition from the Library surface to the Story surface. The Library and Story are connected — the reader always knows which volume and collection the chapter belongs to, and the reader can return to that position in the Library with one action.

**Connect.** The reader encounters a thinker, document, timeline, or dataset referenced across multiple chapters. They move from a single chapter's context to the cross-collection view of that entity. Connect is the stage where the Library proves it is a knowledge graph, not a list of pages. Every entity mention is a potential entry point to the broader collection.

**Save.** The reader bookmarks a chapter, follows a collection, or adds a volume to their reading plan. The save stage is the act of signalling intent. The reader is saying "I want this knowledge to be accessible later." The Library must honour that signal by making saved objects prominently available on every return.

**Return.** The reader comes back. The Library must show them what changed since their last visit — updated chapters, new volumes, fresh evidence — and exactly where they left off. The return stage is the moment that determines whether the reader's relationship with the institution deepens or weakens. A return that requires reorientation is a failure.

## Knowledge Organization

**Primary hierarchy.** Collections → Volumes → Chapters. Three levels. No more. A reader should be able to name which collection and volume they are in at any time. The hierarchy is the reader's mental map.

- **Collections** represent broad domains: India and the World, The Indian Constitution, Indian Economy. A collection is a reader's decision about what to study.
- **Volumes** represent temporal or thematic subdivisions: Foundations (1947–1962). A volume is a reader's commitment to a coherent body of knowledge.
- **Chapters** represent a single narrative: The Partition and Its Legacies. A chapter is a reader's session.

**Cross-cutting entities** exist outside the hierarchy but are accessible from every level.

- **Topics** tag across collections. "Nuclear policy" appears in India and the World and in Indian Economy. Topics are the reader's way of following a thread across domains.
- **Thinkers** have profiles with their contributions across collections. A thinker is a person whose ideas shaped the knowledge in multiple chapters.
- **Documents** are primary sources. Each document belongs to a chapter but is accessible from a central document registry. A document is evidence a reader can verify independently.
- **Timelines** aggregate events across chapters within a volume. A timeline is chronological context that spans the narrative.
- **Maps** are spatial reference objects. A map belongs to a chapter but is indexed spatially across volumes.
- **Datasets** are structured evidence — tables, statistics, economic data. A dataset is raw material for the reader's own analysis.

**Avoiding overwhelm.** The Library never shows all six entity types simultaneously. At each stage of the reader lifecycle, only the entities relevant to that stage are surfaced. In the discover stage, the reader sees collections and recent updates. In the explore stage, the reader sees the selected volume's chapters, topics, and thinkers. Documents, timelines, maps, and datasets are available on demand from within the chapter surface. The rule: one primary dimension at a time. The reader can switch dimensions but is never forced to navigate all of them at once.

## Discovery Paths

**Topic-first.** The reader thinks "I want to learn about nuclear non-proliferation and India." They enter by topic, see all chapters across all collections that address this topic, and choose a volume to study. Topic-first is the most common path for readers with a specific interest but no prior relationship with the institution.

**Timeline-first.** The reader thinks "What happened in 1962?" They enter by year or period, see a chronological view of events, chapters, and documents. Timeline-first is the path for readers who think in dates — students writing papers, journalists verifying chronology, researchers checking sequence.

**Thinker-first.** The reader thinks "I want to understand Nehru's worldview." They enter by thinker, see all chapters where this thinker appears, their biographical profile, key documents, and the thinker's relationship to the broader knowledge graph. Thinker-first is the path for readers who learn through individuals and their ideas.

**Country-first.** The reader thinks "Tell me about India's relationship with China." They enter by country or region, see all chapters and collections that address this geography. Country-first is the path for readers interested in foreign policy, regional history, and international relations.

**Document-first.** The reader thinks "I want to read the actual text of the Panchsheel Agreement." They enter by document, see its full text, provenance, and all chapters that cite it. Document-first is the path for researchers and readers who trust primary sources over narrative.

**Investigation-first.** The reader thinks "I want to understand the Namami Gange project deeply." They enter by investigation — a multi-chapter deep dive into a single question. Investigation-first is the path for readers who want the full evidence stack on one subject.

**Story-first.** The reader thinks "I just want to read something interesting." They enter by featured or recommended chapter — the editorial pick, the most recently updated, the highest-trusted. Story-first is the path for new readers who do not yet know what they are looking for.

The Library supports all seven paths. No path is privileged over another in the architecture. In the interface, the most common paths (topic-first, story-first, continue-learning) are the most visible. The others are one action away. Every path leads to the same destination: a chapter and the knowledge it contains.

## Progress Model

**Completed.** A chapter or volume the reader has finished. Visual signal: a check or a filled indicator. Completed status is meaningful because it lets the reader distinguish between "I have read this" and "I have not." The Library only marks completion when the reader reaches the final learning section. Skimming does not count.

**In Progress.** A chapter the reader has started but not finished. Visual signal: a partial fill, a progress percentage, or a bookmark indicator. In Progress is the reader's primary signal for where to resume. A reader with five in-progress chapters across three volumes sees their learning landscape at a glance.

**Unread.** A chapter with no reading activity. Visual signal: absence of any status indicator. Unread is the default state. It means nothing more than "this exists and you have not opened it." The absence of a signal is itself a signal.

**Bookmarked.** A specific position within a chapter the reader marked for later return. Visual signal: a bookmark icon on the chapter card and in the table of contents. Bookmark differs from In Progress because it is intentional — the reader chose to mark that position. A chapter can be both In Progress and Bookmarked.

**Following.** A collection, volume, or thinker the reader has subscribed to for updates. Visual signal: a bell or follow icon. Following means "notify me when this changes." The reader is signalling ongoing interest. The Library must honour this by surfacing changes on return.

**Recommended.** A chapter the institution has surfaced based on knowledge-graph proximity, editorial curation, or the reader's expressed interests. Visual signal: a subtle badge or section heading. Recommended is the institution's voice — "you might find this relevant because..." The recommendation must always carry an explicit reason.

**Why progress matters.** Progress is the reader's relationship with the institution across time. Without progress signals, every return is a fresh start. The reader must reconstruct their mental state from scratch. With progress signals, the reader picks up exactly where they left off. Progress transforms the Library from a static collection into a living learning environment that respects the reader's time and attention.

## Continue Learning

**Principles over algorithms.** No engagement-based ranking. No "readers also liked." No personalised recommendations driven by page views. The Library's continue-learning signals are determined by editorial judgment and knowledge-graph structure, not by what maximises session duration.

**Graph proximity.** The strongest recommendation is the next chapter in the current volume. The second strongest is the next volume in the current collection. The third is a chapter from a different collection that shares topics, thinkers, or documents with what the reader just read. Graph proximity is deterministic and transparent — the reader can see why a recommendation was made.

**Editorial pick.** The editorial team selects one or two featured recommendations per volume. These are not personalised. Every reader sees the same editorial pick for a given context. Editorial picks carry an explicit note: "Our editors recommend..." Editorial picks exist because the institution has a point of view about what is important to read next.

**Learning path.** For readers who want systematic study, the Library offers curated learning paths — sequences of volumes across collections that build expertise in a domain. A learning path is explicit, stable, and editorially maintained. It is not adaptive. The reader can see the entire path before committing.

**Freshness signal.** A chapter with recent updates, new evidence, or expanded sections may be surfaced under "Recently Updated." The signal includes what changed and when. Freshness is independent of whether the reader has read the chapter before.

**Reader context.** A returning reader sees their in-progress chapters first, their bookmarked positions second, and their followed collections third. The Library assumes the reader returns to continue, not to start over. Continue learning is the default state for returning readers. Discovery is the second state.

## Trust Signals

**Collection-level trust score.** Every collection displays an aggregate trust score — a weighted composite of evidence quality, review completion, freshness, and transparency. The score is a single number from 0–100 with a letter grade. A reader evaluating whether to invest time in a collection can see its institutional trust rating before entering.

**Volume freshness badge.** Every volume displays its last-verified date and a freshness indicator: current (within 3 months), recent (within 12 months), or stale (over 12 months). The badge appears on the volume card and on every chapter within the volume. Freshness is the reader's signal that the institution maintains its knowledge.

**Chapter review status.** Every chapter displays whether it has passed Gold Standard Review, Internal Review, or is in Draft status. The review status is visible on the chapter card in the Library. A reader deciding which chapter to read can distinguish between fully verified chapters and those still in progress.

**Evidence coverage indicator.** Every collection and volume displays an evidence coverage ratio — the percentage of claims that are backed by verified sources with confidence scores above the publication threshold. The indicator is a simple progress bar. It tells the reader how complete the evidentiary foundation is.

**Open corrections badge.** If a collection, volume, or chapter has open corrections, a badge appears showing the count. The badge links to the corrections log. Transparency about errors is a trust signal, not a liability.

**Primary source ratio.** Every collection displays the ratio of primary sources to secondary sources. A higher primary-source ratio signals deeper evidentiary rigour. The ratio is visible in the collection header.

**Expert review count.** Every volume displays the number of expert reviewers who have examined it. A volume reviewed by multiple experts from different disciplinary perspectives earns higher trust than one reviewed by a single expert.

**Methodology link.** A persistent link to the institution's methodology page is available from every Library view. The reader never has to search for how the knowledge was produced.

**Editorial Constitution link.** A persistent link to the Editorial Constitution is available from every Library view. The reader can always see the standards this institution holds itself to.

**Version identifier.** Every volume and chapter displays its current version number. The version number is the reader's anchor for tracking change. If they read version 1.2 and return to find version 1.3, they know something changed.

## Failure Modes

1. **Infinite grid.** Every collection and volume displayed as identical cards. The reader cannot distinguish between types of knowledge objects. Everything looks the same.

2. **Empty state.** The Library greets a first-time reader with nothing. No guidance, no featured content, no starting point. The reader leaves before they begin.

3. **Buried progress.** The return reader's in-progress chapters are hidden behind navigation. The reader must search for their own context.

4. **Orphaned collections.** Collections visible with zero published chapters. The reader encounters an empty shell and loses confidence.

5. **Missing progress tracking.** The Library does not remember what the reader has read. Every visit is a blank slate.

6. **No freshness signals.** Chapters last updated two years ago look identical to chapters updated yesterday. The reader cannot distinguish current from stale.

7. **Algorithms without explanation.** "Recommended for you" with no rationale. The reader does not know why a recommendation appeared and cannot evaluate its relevance.

8. **Over-tagged entities.** Every chapter tagged with every topic, thinker, and document. The signal-to-noise ratio collapses. Tags become useless.

9. **Search-before-browse.** The Library forces the reader to search before they can find anything. Browsing is not supported. The reader must know what they are looking for before they arrive.

10. **No cross-collection connections.** Chapters in different collections that share topics or themes are never linked. The reader discovers nothing outside their current view.

11. **Silent deprecation.** A chapter removed or consolidated with no notice. The reader's bookmark returns nothing. No explanation, no redirect.

12. **Duplicate discovery paths.** Topic search, thinker search, and full-text search return different results for the same intent. The reader cannot trust any path.

13. **No bookmark persistence.** Bookmarks lost across sessions or devices. The reader's saved positions vanish. The reader learns not to save.

14. **Glacial load times.** The Library is the first surface a new reader encounters. If it is slow, the reader assumes the entire platform is slow.

15. **Decoration-only images.** Hero images in collection and volume cards that communicate nothing about the content. Visuals that decorate rather than teach.

16. **No exit context.** The reader finishes a chapter and returns to the Library. The Library does not acknowledge what they just read. No transition, no continuation.

17. **Inconsistent ordering.** Chapters or volumes sorted differently across views. The reader cannot predict where to find the next item in a sequence.

18. **Missing mode awareness.** The Library treats Explorer and Researcher identically. The returning researcher is shown the same surface as the first-time Explorer.

19. **No offline consideration.** The Library assumes constant connectivity. The reader cannot browse or access saved content without a network.

20. **Homepage-only discoverability.** The Library is accessible only from the homepage. The reader who enters via a direct link or search result cannot find the Library without navigating to the root.

## Success Metrics

1. **Return rate (7-day).** Percentage of readers who return to the Library within seven days of their first visit. Measures whether the Library earned a second visit.

2. **Return-to-context rate.** Percentage of returning readers who directly access a previously started chapter. Measures whether progress tracking works.

3. **Collection entry rate.** Percentage of Library visitors who enter at least one collection. Measures whether the hierarchy is discoverable.

4. **Volume completion rate.** Percentage of readers who complete every chapter in a volume. Measures whether the reading experience sustains through a volume.

5. **Cross-collection discovery rate.** Percentage of readers who enter a second collection after completing content in the first. Measures whether the knowledge graph is navigable.

6. **Bookmark rate.** Percentage of readers who bookmark at least one chapter. Measures whether the save action is discoverable and valued.

7. **Follow rate.** Percentage of readers who follow at least one collection or volume. Measures whether the update signal is compelling.

8. **Time-to-first-chapter.** Median time from Library arrival to opening a chapter. Measures whether the Library orients quickly enough.

9. **Search-to-browse ratio.** Ratio of readers who search to readers who browse. A high search ratio may indicate that browsing does not work.

10. **No-interaction bounce rate.** Percentage of readers who leave without selecting anything. Measures whether the landing state communicates value.

11. **Freshness awareness rate.** Percentage of returning readers who view a chapter updated since their last visit. Measures whether freshness signals are visible.

12. **Trust score view rate.** Percentage of readers who view a collection-level trust score or open the trust details. Measures whether trust signals are noticed.

13. **Recommended-click rate.** Percentage of readers who click a recommended chapter from the continue-learning section. Measures whether recommendations are trusted.

14. **Learning path conversion rate.** Percentage of readers who start a learning path and complete at least 50% of it. Measures whether systematic study paths hold engagement.

15. **Library-to-Story return rate.** Percentage of readers who, after reading a chapter, return to the Library and then open another chapter. Measures whether the Library functions as a persistent hub rather than a one-time entry point.
