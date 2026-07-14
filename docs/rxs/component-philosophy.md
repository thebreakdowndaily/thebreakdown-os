# Component Philosophy

## Why Components Exist

Components translate canonical knowledge objects into intelligible reader experiences. They are the rendering surface of the knowledge layer — nothing more, nothing less. A component does not originate knowledge, does not decide what to show, and does not interpret evidence. It receives a validated knowledge object and renders it with the appropriate depth, trust signals, and accessibility for the reader's active mode.

## Component Categories

### Knowledge

**Purpose.** Render a canonical knowledge object (claim, evidence, source, document, timeline, thinker, entity) as a readable, verifiable unit.
**Reader benefit.** The reader encounters knowledge in a consistent structure regardless of which chapter, collection, or surface they are on. A claim card behaves the same everywhere.
**Never do.** Never display a knowledge object without its confidence signal. Never render partial data as complete.

### Navigation

**Purpose.** Orient the reader within the knowledge graph and enable movement between objects. Breadcrumbs, table of contents, progress indicators, cross-links, volume indexes.
**Reader benefit.** The reader always knows where they are, where they can go, and how much remains. Navigation is never a puzzle.
**Never do.** Never hide the current position. Never present cross-links without indicating the target type. Never break the back button.

### Trust

**Purpose.** Display the evidentiary status of every knowledge object. Confidence badges, freshness indicators, version numbers, review status, correction notices.
**Reader benefit.** The reader can assess reliability at a glance. Trust signals are integrated into the content, not relegated to tooltips or footers.
**Never do.** Never show a trust badge without a defined meaning. Never use colour as the only trust signal. Never display a stale badge without a next-verification date.

### Learning

**Purpose.** Support comprehension and retention. Learning objectives, key takeaways, glossary terms, review questions, further reading.
**Reader benefit.** The reader knows what they should learn before starting, confirms understanding at checkpoints, and can verify recall after finishing.
**Never do.** Never present learning elements as optional decoration. Never separate learning from the narrative that supports it.

### Discovery

**Purpose.** Help the reader find knowledge they did not know existed. Related chapters, entity links, topic aggregations, search results, knowledge graph suggestions.
**Reader benefit.** The reader naturally expands their understanding beyond the current chapter. Discovery feels like exploration, not marketing.
**Never do.** Never personalise discovery based on engagement metrics. Never suggest content the reader has already consumed without indicating so.

### Workspace

**Purpose.** Enable the reader to capture, organise, and export knowledge. Highlights, notes, collections, citations, flashcards, reading history.
**Reader benefit.** The reader's learning persists beyond the session. Knowledge accumulated across chapters becomes a personal reference library.
**Never do.** Never gate reading behind workspace features. Never sync reader data without explicit consent. Never suggest the workspace replaces the canonical knowledge layer.

### Feedback

**Purpose.** Allow the reader to report errors, challenge interpretations, suggest sources, and ask questions. Linked to specific claims, sections, or the chapter as a whole.
**Reader benefit.** The readerparticipates in the knowledge lifecycle. A reported error is acknowledged and, when acted upon, the reader is notified.
**Never do.** Never submit feedback without confirmation. Never discard feedback without review. Never use feedback submissions for marketing purposes.

## Component Hierarchy

**Primitive.** The smallest visual units. A confidence badge, a date stamp, a source citation, a glossary term. Primitives carry no knowledge context of their own. They are composed into higher-level components. A primitive never appears alone.

**Composite.** A collection of primitives that form a coherent knowledge unit. A claim card is a composite: claim text, confidence badge, evidence link, counterargument toggle. Composites are reusable across surfaces but belong to no specific page.

**Knowledge Component.** A composite that renders an entire canonical knowledge object. A ClaimCard (composite) becomes a Knowledge Component when it receives a validated claim object from the service layer and renders all its fields. Knowledge Components are the primary building blocks of surfaces.

**Experience Section.** A curated arrangement of knowledge components that serves a specific phase of the reader journey. The "Evidence" section of a chapter contains multiple ClaimCards with their EvidencePanels. Experience Sections are defined by editorial convention, not by the component system.

**Page.** The full-surface assembly of experience sections for a given URL. A chapter page is an ordered sequence of sections: Orientation, Context, Narrative, Evidence, Debate, Learning, Next. Pages are the only level that composes across categories (knowledge + navigation + trust + learning + feedback).

## Component Lifecycle

**Draft.** Designed and documented but not implemented. The component exists in the inventory and is available for prototyping. No production use.

**Experimental.** Implemented and available behind a feature flag. Behaviour may change. Not yet accessibility-audited. Not included in the institutional accessibility commitment.

**Stable.** Fully implemented, accessibility-audited, token-compliant, and documented in the inventory. Available for any surface. Behaviour is frozen until the next major version.

**Institutional.** Passed the same review as Stable plus a design principles audit and a cross-surface consistency review. Institutional components define the platform's visual identity. They are changed only through the same process as the Editorial Constitution.

**Deprecated.** Replaced by a newer component or found to violate a design principle. Remains in the inventory with a deprecation notice and migration path. Removed after two release cycles.

A component must reach Stable before it appears in any published surface. A component must reach Institutional before it defines a surface-level pattern.

## Trust Components

**Confidence Badge.** Renders the evidentiary confidence of a single claim or source. Four tiers: Verified (Tier 1), High Confidence (Tier 2), Moderate Confidence (Tier 3), Low Confidence (Tier 4). Also supports a Disputed state. Tier 1 and Tier 4 are visually distinct at a glance. The badge includes a text label so it is never colour-dependent. Every knowledge component that renders a claim includes a Confidence Badge.

**Evidence Badge.** Indicates that a claim has supporting evidence attached and how many items. Distinct from the Confidence Badge — a claim can have high confidence but zero directly attached evidence (confidence inherited from source). The Evidence Badge shows count and expandability.

**Freshness Badge.** Renders the last-verified date and a relative assessment: Current, Needs Review, Overdue. A chapter last verified within 90 days is Current. Between 90 and 180 days is Needs Review. Beyond 180 days is Overdue. The Freshness Badge appears on every chapter header and on any knowledge object with a verification cycle.

**Version Badge.** Displays the semantic version of a knowledge object. Major, minor, patch. Links to the change log. Visible on every chapter header. The Version Badge is the reader's anchor for version transparency.

**Review Badge.** Indicates the review status of a knowledge object: Unreviewed, Peer Review Complete, Gold Standard Complete, External Review Complete. Only Gold Standard Complete and above are eligible for publication. The Review Badge is visible on the Trust Dashboard and in editorial surfaces, not on published chapters.

## Knowledge Components

**Claim.** Renders a single registered claim with its confidence score, evidence links, counterargument toggle, and attribution. The Claim component is the fundamental knowledge unit of the entire platform. Every factual assertion in every chapter is rendered by a Claim component.

**Evidence.** Renders the supporting material behind a claim. One or more evidence items, each with source attribution, excerpt, and link to the full source. The Evidence component is always a child of a Claim — it never appears independently.

**Timeline.** Renders a chronological sequence of events. Events link to the chapters, claims, or sources that establish them. The Timeline component aggregates from the registry — it does not author events. Shared across chapters, entities, and standalone timeline pages.

**Document.** Renders a primary or secondary source in full-text or facsimile form. Includes provenance, holding archive, confidence assessment, and links to every claim that cites it. The Document component is the verification endpoint.

**Thinker.** Renders an individual's profile, biography, key claims, relationships to other thinkers, and cross-links to every chapter they appear in. The Thinker component is generated from registry data — no editorial effort per think er.

**Relationship.** Renders a typed connection between two knowledge objects (thinker disagreed with thinker, country borders country, organisation led by person). Includes direction, type label, confidence score, and links to supporting evidence. Relationships are the atomic unit of the knowledge graph rendering.

**Counterargument.** Renders a dissenting interpretation alongside the claim it challenges. Includes attribution to the historian or school, supporting evidence, and the confidence comparison. The Counterargument component never stands alone — it is always paired with the claim it contests.

**Source.** Renders a complete source record: author, title, publication, date, archive location, confidence assessment, verification status, and links to all claims that cite it. The Source component is the canonical display for every item in the source registry. Reusable across any surface that references a source.

**Learning.** Renders learning objectives, key takeaways, glossary terms, and review questions. The Learning component is data-driven from the chapter's metadata. It does not invent content — it displays what the editorial team registered.

## Design Constraints

**1. One responsibility per component.** A component does one thing. A ClaimCard renders a claim. It does not render a timeline, a map, or a thinker profile.

**2. No duplicate meaning.** Two components must not convey the same information in different ways. If a confidence score appears on a claim, it must not also appear on the claim's parent section heading.

**3. No decorative badges.** Every badge conveys actionable information. If a badge cannot answer "What should the reader do differently?", the badge does not belong.

**4. Trust components are always visible when present.** A confidence badge is never hidden, collapsed, or placed below the fold. Trust signals render at the point of the knowledge they describe.

**5. Knowledge components are reusable across surfaces.** A ClaimCard behaves the same in a chapter, a search result, and a workspace collection. Surface-specific behaviour is configured through the mode property, not through component variants.

**6. Navigation never surprises.** Every navigation component indicates the target object type before the reader clicks. A cross-link reads "See thinker: Jawaharlal Nehru" not "Learn more."

**7. Feedback components require acknowledgement.** Every feedback submission triggers a visible confirmation. Silent submission is not permitted.

**8. Workspace components do not replicate the knowledge layer.** Highlights reference the original object. Notes attach to objects. Collections contain references. The workspace never duplicates canonical data.

**9. Component behaviour is predictable by type.** All ClaimCards share the same interaction model. All SourceCards share the same layout. A reader who understands one instance understands all instances.

**10. Components degrade gracefully without data.** A ClaimCard with no evidence shows "This claim does not yet have supporting evidence" — it does not hide the claim or show an empty panel.

**11. Primitives are never interactive.** A confidence badge is a label. It does not expand, collapse, or link. Interactivity is added at the composite level.

**12. Experience sections are not components.** A section can be rendered by different components on different surfaces. Section is an editorial structure, not a component type.

**13. No component may assume another component's existence.** A ClaimCard renders correctly even if no EvidencePanel exists on the page. Independence is the default.

**14. Component changes are versioned.** Every Stable and Institutional component change increments a version. Deprecation and migration are documented. Breaking changes are announced two release cycles in advance.

**15. Every component is tested against each reader mode.** A component that works in Explorer mode but fails in Researcher mode is not Stable.

## Success Criteria

**1.** Any knowledge object can be rendered by exactly one component type. No ambiguous object-to-component mapping.

**2.** A reader can identify the component type without reading the content. Visual consistency is absolute within each type.

**3.** Trust components render within the reader's initial viewport on every knowledge surface. No scrolling required.

**4.** Navigation components reduce time-to-orientation to under three seconds on any chapter page.

**5.** Knowledge components render correctly with no data (empty state), partial data, and full data. Graceful degradation is verified per component.

**6.** Every composite component passes keyboard-only navigation. No component ships without this.

**7.** Workspace references remain valid after the referenced object is updated. A highlight from v1.0 resolves in v1.1.

**8.** Feedback submissions reach the editorial team within the defined SLA and trigger an acknowledgement within sixty seconds.

**9.** The component inventory contains every rendering component on every public surface. No undocumented component exists in production.

**10.** A new designer can understand any component's purpose, data source, and mode behaviour by reading its inventory entry — without access to implementation code.
