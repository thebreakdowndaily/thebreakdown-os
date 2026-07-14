# Reader Experience System (RXS)

> **Version 1.0 (Frozen)** — July 2026
>
> The five founding documents of RXS are frozen as of this date. Subsequent changes follow the same governance as the Editorial Constitution: proposals, review, approval, and version increment. No silent evolution.
>
| Document | Status |
|----------|--------|
| `README.md` | What RXS is |
| `principles.md` | How it should behave |
| `information-architecture.md` | How knowledge is organised |
| `story-experience.md` | How readers learn |
| `component-philosophy.md` | How building blocks relate to knowledge |



## 1. Mission

Design how readers move from curiosity to understanding. Every surface, interaction, and feedback loop serves one purpose: making complex knowledge accessible, trustworthy, and memorable. The Editorial Constitution guarantees what knowledge is; RXS guarantees what knowing feels like.

## 2. Reader Success

The Reader Experience System succeeds when a reader can:

- Understand a complex topic quickly.
- Explore deeper without becoming lost.
- Verify why a conclusion was reached.
- Discover related knowledge naturally.
- Leave more informed than when they arrived.

## 3. Vision

A reader anywhere in the world opens a chapter and, within minutes, understands not just what happened but why historians disagree, what the primary sources say, and why it still matters. The experience is so clear that the architecture behind it becomes invisible.

## 4. Design Philosophy

**Clarity over cleverness.** A reader should never need to guess what a link does, where they are, or what to do next.

**Trust is designed, not declared.** Every surface must signal its confidence level, update recency, and evidentiary basis through its structure — not a badge.

**Pace yourself.** Explorer, Scholar, and Researcher modes are not gimmicks. They represent three real reading behaviours. Any surface that serves only one mode excludes the other two.

**Navigation is a map, not a menu.** A reader should always know where they are in the knowledge graph and what lies ahead.

**Fast does not mean shallow.** Instant loading is table stakes. The harder problem is making depth discoverable without demanding it.

**Evidence is not decoration.** Every claim, source, and document exists in a canonical layer. The UI renders what the registry provides — nothing more, nothing less.

**Correction is a feature.** Version history and changelogs are not back-page footnotes. They are primary UX surfaces that build long-term credibility.

## 5. Reader Types

**Explorer**

- Skims at surface level; reads 2–3 paragraphs before deciding whether to commit
- Needs immediate orientation: what is this, why should I care, how long will it take
- Wants a narrative spine with optional depth on demand
- Primary completion signal: finished the chapter summary and timeline
- Returns when something in the news or their feed references content they remember seeing here

**Scholar**

- Reads methodically; shifts between narrative, claims, evidence, and counter-arguments
- Wants access to primary sources, confidence scores, and scholarly disagreements
- Needs to capture, cite, and compare — expects export and annotation
- Primary completion signal: finished the full chapter and consulted at least one primary source
- Returns to verify claims encountered elsewhere

**Researcher**

- Enters with a question, not a chapter; searches before browsing
- Reads across documents, not linearly; jumps between sources, claims, and timelines
- Wants the raw evidence layer: provenance, archival locations, confidence tiers
- Primary completion signal: extracted a verified claim with source trail
- Returns to track new evidence on specific topics

## 6. Core Design Principles

**1. Progressive disclosure**
Why it exists: Readers have varying depth tolerance. Forcing expert-level detail on an explorer causes abandonment; hiding it from a researcher causes frustration.
Design implication: Every surface must default to the most accessible entry point and expose depth through deliberate actions (expand, switch mode, follow link).

**2. Spatial orientation**
Why it exists: A reader in deep content needs to know where they are relative to the whole. Without orientation, any chapter longer than five minutes feels like a tunnel.
Design implication: Every reading surface includes a breadcrumb trail that doubles as a navigation path.

**3. Evidence proximity**
Why it exists: A claim without visible evidence is an assertion. Separating claims from their sources erodes trust regardless of actual verification status.
Design implication: Every claim must be rendered with inline access to its supporting evidence, source, and confidence score — never in a footnotes appendix.

**4. Version transparency**
Why it exists: Knowledge evolves. A reader encountering stale content without knowing it is being misled by omission.
Design implication: Every knowledge object must display its version number, last verified date, and a link to its change log — visible at chapter level, accessible at paragraph level.

**5. Mode equivalence**
Why it exists: Explorer, Scholar, and Researcher are not tiers. They are parallel reading strategies. Prioritising one breaks trust with the others.
Design implication: All three reading modes must coexist on the same surface without requiring a page reload or separate URL.

**6. Search as navigation**
Why it exists: A search bar that only finds page titles fails the researcher and frustrates the scholar. Knowledge objects have complex metadata that must be indexable.
Design implication: Search must return claims, sources, entities, chapters, and collections — each with a confidence indicator — not just pages.

**7. Correction prominence**
Why it exists: A buried corrections link signals that errors are embarrassing. A visible corrections surface signals that accuracy is the priority.
Design implication: Corrections must have a dedicated discoverable surface and be linked from every affected knowledge object.

**8. Reading state persistence**
Why it exists: A reader who leaves mid-chapter and returns to a blank page will not come back a third time.
Design implication: Scroll position, expanded claims, active mode, and open sources must persist across sessions for authenticated readers.

**9. Minimal cognitive load**
Why it exists: Every decision a reader makes about the interface is a decision not made about the content.
Design implication: Default states must show the most common reading path. Configuration, advanced features, and metadata panels must be available but not default-visible.

**10. Feedback symmetry**
Why it exists: A reader who reports an error and never hears back learns that the institution does not listen.
Design implication: Every feedback submission must trigger an acknowledgement and, when acted upon, a notification linking to the published change.

## 7. Product Scope

- Homepage
- Story
- Investigation
- Knowledge Library (series, volume, chapter)
- Search
- Reader Workspace (highlights, notes, collections, export, citations, flashcards)
- Entity pages (country, organisation, person, topic)
- Trust Dashboard
- Methodology page
- Editorial Constitution page
- Founding Edition hub
- Corrections log
- Changelog
- Reading progress
- Mode selector (Explorer / Scholar / Researcher)

## 8. Non-Goals

The Reader Experience System does not:

- Define editorial policy (Editorial Constitution).
- Define knowledge models (Canonical Knowledge Layer).
- Replace the CMS or editorial workflow.
- Optimize for page views over comprehension.
- Introduce interactions that distract from learning.
- Duplicate functionality already owned by the Knowledge Engine.

## 9. Deliverables

- RXS Design Tokens
- RXS Component Hierarchy
- RXS Surface Map
- RXS Navigation Model
- RXS Reading Mode Spec
- RXS Evidence Proximity Patterns
- RXS Search Index Blueprint
- RXS Reader State Model
- RXS Notification Framework
- RXS Accessibility Audit Checklist

## 10. Constraints

- Evidence before decoration.
- Typography over visual effects.
- Performance over animation.
- Accessibility before aesthetics.
- Mobile-first understanding.
- Progressive disclosure instead of information overload.

## 11. Sprint Roadmap

**Sprint 1.** Map every reader surface and document current gaps against the three reader types.
**Sprint 2.** Design the reading mode selector and progressive disclosure patterns for Explorer/Scholar/Researcher.
**Sprint 3.** Implement evidence proximity across all knowledge objects with inline source access and confidence display.
**Sprint 4.** Build the corrections, changelog, and version transparency surfaces.
**Sprint 5.** Design and implement search returning claims, sources, entities, and chapters with confidence indicators.
**Sprint 6.** Deliver Reader Workspace v1: highlights, notes, and persistent reading state.

## 12. Success Metrics

- Completion rate (Explorer: chapter summary reached; Scholar: full chapter; Researcher: evidence extracted)
- Knowledge Completion Rate (percentage of readers reaching the final learning section)
- Return reader rate (7-day and 30-day)
- Evidence Interaction Rate (percentage of readers opening evidence or source panels)
- Source interaction rate (clicks on evidence, primary sources, documents)
- Claim verification rate (clicks from a claim to its supporting evidence)
- Mode switch rate (Explorer to Scholar, Scholar to Researcher)
- Search success rate (result clicked and content engaged)
- Corrections submitted vs corrections actioned
- Reader satisfaction score (post-reading survey, sampled)
- Time-to-orientation (seconds to identify what the page is about)
