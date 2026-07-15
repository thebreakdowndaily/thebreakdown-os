# Information Architecture

> **RXS v1.0 (Frozen)** — Part of the Reader Experience System. Do not modify outside the governance process defined in `README.md`.

## Philosophy

The Breakdown does not create pages. It creates knowledge objects. A page is a temporary projection of one or more objects — a moment in time rendered for a specific reader type. The same claim appears in a chapter, a timeline, and a scholar's evidence review, but it exists once in the registry. This separation of content from presentation is the fundamental architectural decision. It means that information is never duplicated, never inconsistent across surfaces, and never locked into a single layout. The reader experiences coherence because the authoring system enforces it at the data layer.

## Canonical Hierarchy

**Knowledge Library**
The entire knowledge corpus. Contains all collections. There is one library. It is the root of the content tree and the entry point for every reader.

**Collection**
A thematic grouping of volumes. "India and the World" is a collection. Collections reflect major editorial programmes and are long-lived. A collection has a curator, a publication timeline, and a set of knowledge completeness targets.

**Volume**
A chronological or thematic segment within a collection. Volumes provide the primary subdivision for navigation. "Volume I: Foundations (1947–1962)" sits within a collection and contains multiple chapters that together form a coherent narrative arc.

**Chapter**
A self-contained knowledge narrative and the primary reading unit. A chapter answers the Six Questions: what happened, why, what alternatives existed, why India chose this path, what were the consequences, why it matters today. Chapters are the unit of versioning, peer review, and publication.

**Section**
A structural division within a chapter. Sections organise the narrative around specific claims or periods. They are not independent knowledge objects but provide the reader with orientation and breakpoints.

**Claim**
A verifiable assertion that can be supported or refuted by evidence. Claims are the atomic unit of knowledge in the system. Every factual statement in a chapter traces back to a registered claim with a confidence score, evidence links, and, where applicable, documented counterarguments.

**Evidence**
A specific piece of data — statistic, quotation, archival record — that supports or challenges a claim. Evidence is not opinion. It is traceable to a source and independently verifiable. Evidence without a source is not evidence.

**Source**
The origin of evidence. A book, article, archive, interview, dataset, or document. Every source has a provenance record, a confidence assessment, and a verification status. Sources are shared across all claims that cite them.

## Cross-Cutting Knowledge Objects

### Thinkers

**Purpose.** Represent individuals whose ideas, decisions, or scholarship shaped the subject matter. Thinkers include policymakers, intellectuals, historians, and participants.
**Relationships.** Thinkers are linked to chapters where they appear, claims they made or influenced, primary sources they authored, and other thinkers they disagreed with or influenced.
**Navigation role.** A thinker page serves as an intellectual biography and gateway: the reader can track a thinker's evolution across chapters without rereading the entire volume.

### Countries

**Purpose.** Represent nations as geopolitical entities with stable identifiers, timelines, and relationships.
**Relationships.** Linked to chapters that discuss them, treaties or conflicts they participated in, organisations they belong to, and thinkers associated with them.
**Navigation role.** A country page aggregates all mentions across the library, providing a cross-cutting view that a chapter alone cannot deliver.

### Organizations

**Purpose.** Represent institutions — government bodies, international organisations, military commands, political parties — that appear across multiple contexts.
**Relationships.** Linked to chapters, treaties, events, and the individuals who led or represented them.
**Navigation role.** An organisation page connects otherwise separate narratives: the United Nations appears in Kashmir 1947, Panchsheel, and the Non-Aligned Movement.

### Topics

**Purpose.** Represent thematic subjects that cut across collections, volumes, and chapters. Non-alignment, decolonisation, and nuclear strategy are topics.
**Relationships.** Linked to any knowledge object that addresses them. Topics form a separate taxonomy from the collection hierarchy.
**Navigation role.** Topics provide the reader with a subject-index view independent of the collection chronology. A reader interested in nuclear strategy should find relevant content across all volumes.

### Documents

**Purpose.** Represent primary and secondary sources in full-text or facsimile form. The canonical version of every cited source.
**Relationships.** Linked to every claim and evidence entry that cites them. Linked to their holding archive, author, and related documents.
**Navigation role.** A document page is the evidence trail endpoint. From a claim, the reader navigates to evidence, then to the source document itself.

### Timelines

**Purpose.** Represent chronological sequences of events that aggregate across objects. A Timeline is not a chapter feature — it is a knowledge object that chapters reference.
**Relationships.** Each event links to the chapter, claim, or source that establishes it. Timelines span collections.
**Navigation role.** Timelines provide the reader with a chronological spine independent of the collection structure. A Partition timeline draws from every chapter that discusses Partition.

### Maps

**Purpose.** Represent cartographic knowledge objects — boundary lines, disputed territories, demographic distributions, strategic geography.
**Relationships.** Linked to chapters that reference the geography, the archival baseline data used to create them, and disputed boundary annotations.
**Navigation role.** Maps provide spatial orientation. A reader encounters a map within a chapter and can open it as an independent object with full provenance and annotation.

### Datasets

**Purpose.** Represent structured quantitative data — economic indicators, demographic statistics, military balances — that support evidence claims.
**Relationships.** Linked to chapters that use the data, the original source of the data, and derived visualisations.
**Navigation role.** Datasets allow a researcher to verify quantitative claims independently and to compare data across chapters.

### Events

**Purpose.** Represent discrete occurrences — a war, a treaty signing, a resolution vote — that can be referenced across multiple objects.
**Relationships.** Linked to every chapter, claim, and timeline that references them. Events connect to participants (thinkers, countries, organisations).
**Navigation role.** Events serve as the atomic unit of chronology. Any event referenced anywhere in the library is the same canonical event object.

### Relationships

**Purpose.** Represent typed connections between any two knowledge objects. A relationship is not a mere link — it carries a type (disagreed-with, influenced, succeeded, negotiated), a direction, and a confidence score.
**Relationships.** Relationships exist between thinkers (Nehru disagreed-with Churchill), between countries (India borders Pakistan), between thinkers and organisations (Nehru led India).
**Navigation role.** Relationships power the knowledge graph. They allow a reader to discover connections that no single chapter makes explicit.

## Reader Navigation Model

A reader does not navigate pages. A reader navigates knowledge. Every movement from one object to another serves a question the reader is trying to answer.

**Chapter to Thinker.** The reader encounters a claim and wants to know who made it or who it is about. The chapter links to the thinker's page, which aggregates all of that thinker's appearances across the library.

**Thinker to Claims.** The reader wants to see everything a particular thinker said or believed. The thinker page surfaces all claims associated with that thinker, regardless of which chapter they appear in.

**Claim to Evidence.** The reader wants to verify. Each claim exposes its supporting evidence — the specific data, quotation, or record that justifies it. The reader does not leave the narrative flow to check.

**Evidence to Source.** The reader wants depth. Each evidence item links to its originating source — the full document, archive record, or publication. This is where verification ends.

**Source to Related Chapters.** The reader discovers that the same source is cited by multiple chapters. Following this link reveals the full web of knowledge that depends on that source.

**Chapter to Chapter.** The reader finishes a chapter and wants what comes next — the next chronological chapter, the thematic companion, or the counterargument in a different volume.

**Entity to Entity.** The reader discovers a relationship between two thinkers, countries, or organisations and follows it to see every documented interaction.

**Any object to Timeline.** The reader wants to see an event in chronological context. Every object that references a date can populate a timeline view.

**Any object to Search.** Navigation fails. The reader searches. Search returns objects, not pages — claims, sources, entities, chapters — ranked by relevance and confidence.

The navigation model assumes the reader's goal is understanding, not completion. Every link is an invitation to learn more, not a distraction from the current object.

## URL Philosophy

URLs reflect the canonical hierarchy and nothing else. They are stable, human-readable, and opaque to the reader's browsing session. A chapter lives at the same URL regardless of which reading mode is active, which evidence panels are open, or how the reader arrived.

The collection-volume-chapter path is the primary hierarchy. Entities, documents, and timelines sit outside this hierarchy at their own stable paths. They are reachable from any object that references them and from the library index, but their URL does not encode their relationship to any single chapter — because they belong to many.

URLs never change. A renamed object retains its original slug with a permanent redirect. A corrected chapter does not get a new URL. Versioning is communicated through content metadata, not through the address bar.

No query parameter carries primary navigation intent. Parameters are reserved for transient state — reading mode, active tab, expanded panel — and are never the sole path to any content.

The sitemap mirrors the canonical hierarchy plus standalone object types. Search is the only surface that crosses hierarchies.

## Design Rules

**1. One object, one canonical URL.** Every knowledge object has exactly one URL that represents it. No object is split across multiple URLs. No URL serves multiple objects.

**2. Claims never duplicate.** A claim exists once in the registry. Every chapter that references it links to the same canonical claim. There is no per-chapter copy.

**3. Sources always reusable.** A source is registered once and cited by every claim, evidence entry, and chapter that uses it. Source metadata (author, provenance, confidence) is maintained in one place.

**4. Knowledge objects can appear in multiple collections.** A chapter about the United Nations belongs to "India and the World" and can also belong to "International Organisations." The chapter's canonical parent is primary; additional collections are secondary and do not create copies.

**5. Every object must be reachable from the library index.** No object exists only as a cross-link. Navigation from the root of the hierarchy must reach every published object.

**6. Cross-links are typed and bidirectional.** A link between two objects specifies why they are related. The relationship is visible from both directions. A claim links to its evidence; the evidence lists every claim that cites it.

**7. Timelines aggregate, never duplicate.** Events across multiple chapters merge into a single canonical timeline. No event is entered twice. Conflicts in event data are surfaced as scholarly disagreements, not as duplicate entries.

**8. Entity pages are automatic, not editorial.** When an entity is referenced in two or more chapters, its page is generated from aggregated registry data. No editorial effort required. An entity referenced once has a registry entry but no standalone page.

**9. A chapter must anchor every claim.** Claims without a chapter home are not published. Claims are always rendered within a narrative context. The search index surfaces them independently, but the default reading experience is chapter-first.

**10. Redirects are permanent.** No broken links. No soft 404s. A renamed object issues a permanent redirect. A retired object issues a permanent redirect to its parent in the hierarchy with a notice. The knowledge graph is never broken.

## Future Expansion

The hierarchy is unchanged by the addition of new collections. "The Indian Constitution" follows the same Collection → Volume → Chapter structure as "India and the World." No new architectural concepts are needed.

New cross-cutting object types — Legislation, Court Cases, Treaties — slot alongside existing ones. They follow the same patterns: registry-backed, URL-stable, cross-linked, automatically aggregated. No hierarchy changes.

New entity types — Political Parties, Movements, Regions — follow the entity pattern without modification. They appear in the taxonomy and are rendered by the same entity engine.

The architecture supports any number of collections, any number of volumes per collection, and any number of chapters per volume. Performance is handled by the platform layer, not the IA.

The only constraint is structural: every collection must conform to the canonical hierarchy. A collection that cannot express its content as Volume → Chapter needs a new container type, not a workaround. This has not yet been needed.
