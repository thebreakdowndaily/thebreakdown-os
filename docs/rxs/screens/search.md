# Knowledge Explorer

> **RXS v1.0 (Frozen)** — Part of the Reader Experience System. Do not modify outside the governance process defined in `README.md`.

## Goal

Design the primary discovery system for the Knowledge Library. The Knowledge Explorer is not a keyword search. It is a structured discovery environment with twelve canonical paths into the knowledge graph. Readers discover knowledge even when they do not know exactly what to search for, and they navigate across dimensions — topic, thinker, timeline, country, evidence — without reformulating their intent.

## Reader Intent

**Find a topic.** The reader wants to explore everything the institution knows about a subject — chapters, investigations, thinkers, documents, and evidence — in one view.

**Discover related knowledge.** The reader has found one relevant result and wants to find everything connected to it. They navigate by relationship, not by keyword.

**Verify a claim.** The reader encountered a claim — "India was the first to recognise the PRC" — and wants to see the evidence, confidence score, sources, and competing explanations.

**Locate a document.** The reader remembers a primary source — the Panchsheel Agreement, the UN Resolution 47 — and wants to find its full text, provenance, and every chapter that cites it.

**Compare thinkers.** The reader wants to see two thinkers side by side — their chapters, their key claims, their documents — across the knowledge graph.

**Browse timelines.** The reader wants to see what happened in a period — events, chapters, documents — organised chronologically.

**Explore collections.** The reader wants to understand the scope of a collection — its volumes, chapters, topics, thinkers, and evidence coverage — before committing to a specific path.

**Resume research.** The reader returns to a previous discovery session. They want to pick up where they left off, with their filters, queries, and bookmarked results preserved.

## Discovery Philosophy

Keyword search assumes the reader knows what they are looking for. It rewards precise vocabulary and punishes vague intent. A reader who types "water pollution India" must sort through news articles, government reports, and opinion pieces to find institutional knowledge. The reader who types "tell me about the Ganga" receives results that match the string but not the intent.

Discovery inverts this. The reader selects a dimension that matches how they think — "I am thinking about a person" (Thinker mode), "I am thinking about a time" (Timeline mode), "I am thinking about a place" (Country mode) — and enters their intent within that dimension. The discovery system interprets the signal through the knowledge graph, returning results organised for that mode. The reader never needs to translate their mental model into keywords.

Keyword search is preserved as a fallback for readers who know exactly what they want. But it is not the default, not the primary interface, and not the system's identity.

## Discovery Modes

**Topic.** Purpose: Surface every knowledge object associated with a subject, organised by collection and subtopic. Reader question answered: "What does this institution know about [topic]?"

**Collection.** Purpose: Reveal the structure and scope of a collection — its volumes, chapters, topics, thinkers, documents, evidence coverage. Reader question answered: "What is in this collection and should I read it?"

**Timeline.** Purpose: Display events, chapters, and documents on a chronological axis with density indicators. Reader question answered: "What happened in [year/period]?"

**Thinker.** Purpose: Show a thinker's full footprint in the knowledge graph — their chapters, key claims, authored or cited documents, related thinkers. Reader question answered: "What did [person] say and where are they cited?"

**Country.** Purpose: Aggregate every knowledge object addressing a country — chapters, investigations, documents, thinkers, timeline of events, relationships with other countries. Reader question answered: "What does this institution cover about [country]?"

**Organization.** Purpose: Map an organisation's involvement across the knowledge graph — chapters, documents, claims, timeline, relationships. Reader question answered: "What role did [organization] play and where is it documented?"

**Document.** Purpose: Surface a primary document with its full text or facsimile, provenance, archival location, and every knowledge object that cites it. Reader question answered: "Where can I find [document] and how is it used?"

**Claim.** Purpose: Present a single proposition with its evidence level, confidence score, supporting and challenging evidence, sources, and every chapter that asserts it. Reader question answered: "Is [claim] true and what is the evidence?"

**Evidence.** Purpose: Show a specific evidence block with its source, provenance, confidence score, all claims it supports, and all chapters that cite it. Reader question answered: "What does this piece of evidence prove and where does it come from?"

**Investigation.** Purpose: Display ongoing investigations by central question, status, evidence count, and open questions. Reader question answered: "What is the institution actively investigating?"

**Story.** Purpose: Surface individual chapters and narratives by theme, collection, freshness, and editorial recommendation. Reader question answered: "What can I read right now?"

**Learning Path.** Purpose: Present curated sequences of volumes and chapters for systematic study, with progress tracking. Reader question answered: "How do I learn [subject] from foundation to advanced understanding?"

## Search Lifecycle

**Question.** The reader arrives with an intent — a topic, a name, a date, a claim, a document. The intent may be precise ("What did Patel say about the Kashmir accession?") or vague ("Tell me about the 1960s"). The Explorer does not require precision. The reader selects a discovery mode that matches how they think and enters their signal.

**Discovery.** The Explorer returns results organised within the active mode. Topic mode shows grouped subtopics. Timeline mode shows plotted events. Thinker mode shows the thinker's profile and associated content. The reader sees what exists before deciding what to open. Discovery is the stage where the reader learns the scope of the institution's knowledge.

**Evaluation.** The reader evaluates results using the signals visible on each result — confidence score, object type, collection context, evidence level, freshness. The reader decides which results are worth opening without opening them. Evaluation is the stage where trust signals earn their place.

**Selection.** The reader opens a result — a chapter, a thinker profile, a document facsimile, a claim with evidence stack. They leave the Explorer and enter the knowledge object's native surface. Selection is a commitment of attention.

**Learning.** The reader engages with the knowledge object. This stage occurs outside the Explorer. The Explorer's job is complete when the reader is learning.

**Expansion.** The reader finishes the knowledge object and wants to explore further. They may return to the Explorer with a refined intent, follow a cross-dimension link within the object, or start a new discovery session. Expansion is the stage where the Explorer proves it is a discovery system, not a search page.

## Result Philosophy

Every result represents a knowledge object — not a page. A chapter is a knowledge object. A claim is a knowledge object. A thinker is a knowledge object. A document is a knowledge object. A timeline event is a knowledge object.

The Explorer never returns "a page that contains the word Nehru." It returns the thinker object "Jawaharlal Nehru" with his profile, chapters, claims, and documents. It never returns "a page about non-proliferation that was tagged with a topic." It returns the topic object "Nuclear Non-Proliferation" with every associated chapter, investigation, thinker, and document across all collections.

This distinction is the fundamental design decision. Pages are rendered surfaces. Knowledge objects are canonical entities. Returning pages forces the reader to scan for relevance. Returning knowledge objects gives the reader the entity itself, structured for its type, with all relationships intact.

Every result carries: the object's type label, its confidence score or evidence strength, its collection and volume context, its last-verified date, and a direct link to the canonical object. The result is not a link to a URL. It is a representation of the object, and the link opens the object in its native rendering surface.

## Filters

Filters exist to refine results within a discovery mode, not to replace the mode itself. A reader in Timeline mode may filter by collection or region. A reader in Topic mode may filter by evidence strength or time period. Filters narrow the set without changing the dimension.

**Evidence strength filter.** Narrow results to claims and evidence blocks above a confidence threshold. The reader who only wants documented facts selects 80%+. The reader exploring hypotheses sees all levels.

**Time period filter.** Restrict results to a date range. Applied to chapters, events, documents, and claims with temporal scope. The reader who wants only post-1991 content filters by decade.

**Region filter.** Restrict results to a geographic area — country, region, continent. Applied to chapters, investigations, and documents with geographic coverage. The reader who wants only Southeast Asian content filters by region.

**Knowledge type filter.** Show or hide specific object types — chapters only, thinkers only, documents only. Applied on top of any discovery mode. The reader in Timeline mode who wants only documents filters by type.

**Confidence filter.** Restrict results to objects that meet a minimum confidence score. Independent of evidence strength — a high-confidence thinker profile is different from a high-confidence claim. The reader who trusts only verified content sets a minimum threshold.

**Collection filter.** Restrict results to a specific collection. The reader interested only in "India and the World" filters by collection. All discovery modes respect this filter.

Filters compound. A reader in Timeline mode with Region: South Asia, Time Period: 1947–1962, and Knowledge Type: Documents sees every primary document from the founding period. Filters are visible, removable, and their effect on result count is shown in real time.

## Reader Decisions

**Select a discovery mode.** The reader chooses one of twelve dimensions. This is the primary decision. The Explorer's default mode is Topic.

**Enter a signal.** The reader types, selects from entity-aware autocomplete, or browses the mode's index. The signal is interpreted within the active mode.

**Browse a mode index.** The reader navigates an alphabetical or chronological index of all entities in the selected dimension. No query required.

**Switch modes.** The reader switches from one discovery mode to another. The current signal is preserved and reinterpreted in the new mode where meaningful.

**Apply a filter.** The reader narrows results within the active mode using one or more filters. Filters are additive and removable.

**Open a result.** The reader selects a knowledge object — chapter, thinker, document, claim, evidence block, timeline event. They leave the Explorer and enter the object's native surface.

**Follow a cross-dimension link.** From an opened result, the reader navigates to a related entity in a different dimension — a thinker from a chapter, a document from a claim, a country from a thinker.

**Bookmark a result.** The reader saves a specific result for later reference. Bookmarks are preserved across sessions.

**Follow an entity.** The reader subscribes to updates on a topic, thinker, country, or organisation. Changes to that entity appear in the reader's homepage and notification stream.

**Save a query.** The reader saves the current mode, signal, and filter combination for reuse.

**Return to a previous session.** The reader returns to the Explorer and recovers their last session's mode, signal, filters, and result set.

**Clear all.** The reader resets the Explorer to its default state — Topic mode, no signal, no filters.

## Trust Signals

**Confidence score on every result.** Every knowledge object displays its confidence score or evidence strength indicator in the result card. The reader evaluates reliability before committing to open.

**Object type label.** Every result carries a visible, colour-coded type label. The reader knows whether they are about to open a chapter, a claim, a thinker profile, or a document.

**Evidence level on claim results.** Claim results display their evidence level — documented fact, inference, hypothesis, speculation, editorial judgment — as a badge. The reader knows the epistemic status before reading the claim.

**Collection and volume context.** Every result shows which collection and volume it belongs to. The reader evaluates authority through provenance.

**Freshness indicator.** Every result shows last-verified date and version number. The reader knows whether the knowledge is current.

**Provenance on document results.** Document results display archival source, holding institution, and acquisition status. The reader evaluates the primary source before opening.

**Result count by mode.** The Explorer shows total result counts per mode. A low count signals narrow coverage; the reader adjusts expectations. A high count signals breadth; the reader knows exploration is worthwhile.

**Filter effect on count.** Every filter shows the resulting count before the reader applies it. The reader knows the impact of narrowing before committing.

**Entity match vs text match.** When the Explorer recognises a known entity, it labels the result as "Entity Match" rather than "Text Match." The reader knows when the result is a canonical object rather than a full-text hit.

## Failure Modes

1. **Keyword default.** The Explorer presents a search bar as the primary interface. Discovery modes are hidden in a dropdown. The reader never discovers that alternative paths exist.

2. **Single result type.** Every discovery mode returns the same flat list of chapters. Switching from Topic to Timeline to Thinker produces the same result structure labelled differently.

3. **No browse path.** Every mode requires the reader to type something. The reader who wants to browse all thinkers or all countries cannot.

4. **Mode as filter.** Selecting Timeline mode filters chapter results by date range rather than transforming the result structure into a chronological view.

5. **Vanishing context.** Switching modes resets the signal. The reader must re-enter their intent after every mode change.

6. **Confidence hidden.** Results shown without confidence scores or evidence levels. The reader cannot distinguish verified content from unverified.

7. **Page results instead of objects.** A search for "Nehru" returns pages containing the word "Nehru" rather than the canonical thinker object.

8. **No cross-dimension links.** A chapter result does not link to its thinkers, timeline, or documents. Each result is an island.

9. **Empty state silence.** A mode with zero results shows a blank page. No suggestion, no alternative mode, no browse option.

10. **Overwhelming autocomplete.** Twenty suggestions before the reader has typed three characters. The reader is paralysed by incomplete signals.

11. **No freshness sorting.** Results cannot be ordered by last-verified date. The reader cannot find the most current knowledge.

12. **Saved state lost.** The reader bookmarks results and returns to find everything reset. Discovery context is not preserved across sessions.

13. **Filter paralysis.** Twenty filters displayed simultaneously. The reader spends more time configuring filters than exploring results.

14. **No mobile mode switching.** Discovery modes require horizontal space. On mobile, modes collapse into a dropdown and are never opened.

15. **Result count hidden.** The Explorer shows results without indicating how many exist. The reader does not know whether they have seen everything.

16. **Provenance omitted on documents.** Document results show the title but not the archival source or holding institution. The reader cannot evaluate the primary source.

17. **Entity matches not distinguished.** Entity matches and text matches appear identical. The reader does not know when a result is a canonical knowledge object versus a full-text hit.

18. **No mode recommendation.** The reader types a vague query in free-text mode. The Explorer does not suggest "This looks like a topic — try Topic mode."

19. **Filter and mode conflict.** A filter applied in one mode does not carry to another mode when the reader switches. The reader must reapply filters after every mode change.

20. **Performance collapse.** The Explorer queries across all dimensions simultaneously. Slow load times for complex queries convince the reader the platform is broken.

## Success Metrics

1. **Mode selection rate.** Percentage of sessions where the reader selects a discovery mode. Measures whether modes are discovered and preferred over free-text search.

2. **Cross-dimension navigation rate.** Percentage of sessions where results from two or more modes are viewed. Measures whether the Explorer enables multi-dimensional discovery.

3. **Browse-to-result conversion.** Percentage of browse sessions (no typed query) that produce at least one opened result. Measures whether browsing is viable.

4. **Mode switch rate.** Percentage of sessions where the reader switches modes at least once. Measures whether the initial mode selection was correct.

5. **Free-text fallback rate.** Percentage of sessions that use only the free-text input without selecting a mode. A high rate indicates discovery modes are not working.

6. **Result open rate.** Percentage of results displayed that the reader opens. Measures result relevance and trust signal effectiveness.

7. **Average result depth.** Average number of results opened per session. Measures discovery depth.

8. **Return-to-Explorer rate (7-day).** Percentage of readers who return within seven days. Measures whether the Explorer earns repeated use.

9. **Saved query reuse rate.** Percentage of readers who save a query and return to it. Measures whether saved state is valued.

10. **Bookmark rate.** Percentage of sessions where the reader bookmarks at least one result. Measures whether results are worth keeping.

11. **Follow rate.** Percentage of sessions where the reader follows a topic, thinker, or country from the Explorer. Measures whether discovery drives ongoing engagement.

12. **Time-to-first-result.** Median time from session start to first opened result. Measures performance and discoverability.

13. **Zero-result rate by mode.** Percentage of queries in each mode that return zero results. A high rate in one mode may indicate incomplete coverage or poor entity recognition.

14. **Entity match rate.** Percentage of queries where the Explorer recognised a known entity and returned an entity match rather than a text match. Measures knowledge graph coverage.

15. **Dimension parity score.** Variance in result quality, relevance, and zero-result rate across the twelve discovery modes. If one mode consistently underperforms, that dimension needs improvement.

## Immutable Rules

1. Discovery modes are the primary interface. The query bar is the secondary interface. This priority is never reversed.

2. Every discovery mode returns results structured for that dimension — Topic mode groups by subtopic, Timeline mode plots chronologically, Claim mode stacks evidence. No two modes return the same flat structure.

3. Switching modes preserves the reader's signal. The signal is reinterpreted in the new dimension, not discarded.

4. Every result displays its object type, confidence score, and collection context before the reader opens it. No result appears without these three signals.

5. Every result links to at least three other dimensions. A chapter result links to its thinkers, its timeline, and its documents. A thinker result links to their chapters, their timeline, and their countries.

6. The Explorer supports browsing without typing. Every mode has an index view navigable alphabetically, chronologically, or by entity count.

7. Discovery modes are never hidden behind a menu, dropdown, or settings panel. They are visible as the Explorer's primary navigation.

8. Entity matches are distinguished from text matches. The Explorer labels each result as "Entity Match" or "Text Match" so the reader knows whether the result is a canonical knowledge object.

9. Empty states are informative. A mode with zero results explains why and suggests alternatives. No blank pages.

10. The Explorer preserves session state. Returning after navigating to a result restores the mode, signal, filters, and result set.

11. Every filter shows its effect on result count before the reader applies it. The reader knows the impact of narrowing.

12. Free-text search results are ranked by relevance and confidence — never by engagement, popularity, or recency alone.

13. The Explorer never shows the same result twice in the same session. Deduplication is enforced across mode switches.

14. Every discovery mode is equally accessible on mobile. Modes are not collapsed on narrow viewports.

15. The Explorer is the only surface that crosses all knowledge hierarchies. It connects collections, volumes, chapters, claims, evidence, thinkers, documents, countries, organisations, timelines, investigations, stories, and learning paths in a single discoverable surface. No other surface attempts this.
