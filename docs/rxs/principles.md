# Reader Experience Principles

## 1. Progressive Disclosure

### Why

Readers have different levels of prior knowledge, attention, and intent. Forcing expert-level detail on an explorer causes abandonment. Hiding it from a researcher causes frustration. The same surface must serve all three.

### Rule

Never expose advanced material before foundational context. Every surface must default to the most accessible entry point and expose depth only through deliberate actions.

### Good Example

Explorer mode shows the executive summary and timeline. Scholar mode reveals evidence panels and source lists. Researcher mode unlocks primary documents and archival provenance — all on the same page without a reload.

### Anti-pattern

Displaying raw historiography immediately after the hero image. Expecting a first-time reader to interpret confidence scores before they understand the claim.

### Related Components

Reading Mode selector, Claim Card, Evidence Panel, Chapter navigation.

---

## 2. Spatial Orientation

### Why

A reader in deep content needs to know where they are relative to the whole. Without orientation, any chapter longer than five minutes feels like a tunnel. Disorientation is the primary cause of abandonment in long-form knowledge content.

### Rule

Every reading surface must include a visible position indicator that shows where the reader is within the current object and how to navigate to adjacent or parent objects.

### Good Example

A breadcrumb trail showing Collection → Volume → Chapter + a sidebar progress indicator with section titles. The reader can jump to any major section or return to the volume overview in one click.

### Anti-pattern

A long scrollable page with no section markers, no progress indicator, and no way to return to the table of contents without using the browser back button.

### Related Components

Breadcrumb, Table of Contents, Progress Bar, Section navigation, Volume index.

---

## 3. Evidence Proximity

### Why

A claim without visible evidence is an assertion. Separating claims from their sources erodes trust regardless of actual verification status. Readers should never have to hunt for the evidence behind a statement.

### Rule

Every claim must be rendered with inline access to its supporting evidence, source attribution, and confidence score. Footnotes at the bottom of the page are not acceptable.

### Good Example

A highlighted claim with an expandable evidence panel showing the primary source excerpt, confidence badge, and a link to the full document. The reader never leaves the narrative flow.

### Anti-pattern

A superscript number next to a claim that leads to a numbered footnote at the bottom of the page with no source verification details.

### Related Components

Claim Card, Evidence Panel, Source Card, Confidence Badge, Document viewer.

---

## 4. Mode Equivalence

### Why

Explorer, Scholar, and Researcher are not tiers. They are parallel reading strategies. Prioritising one over the others breaks trust with the remaining two. A surface designed only for Scholars excludes Explorers who need orientation and Researchers who need raw evidence.

### Rule

All three reading modes must coexist on the same surface. No mode should require a separate URL, page reload, or login to access. Switching modes must preserve reading position.

### Good Example

A toggle at the chapter header that filters visible content density: Executive Summary mode shows only the narrative; Full Evidence mode adds inline claims and sources; Research mode unlocks document references and archival data.

### Anti-pattern

A separate "Deep Dive" page that requires navigation away from the main chapter. A "For Experts" section that buries the evidence instead of integrating it.

### Related Components

Reading Mode toggle, Content density filter, Chapter header, Section expander.

---

## 5. Version Transparency

### Why

Knowledge evolves. A reader encountering stale content without knowing it is being misled by omission. Trust requires that every knowledge object communicates its currentness honestly.

### Rule

Every knowledge object must display its version number, last verified date, and a link to its change log. This must be visible at the chapter level and accessible at the paragraph level for corrected claims.

### Good Example

A chapter header showing "v1.0.0 | Last verified: 12 Jul 2026" with a subtle link to the change log. A corrected paragraph displays a "Revised v1.1" badge with the previous version accessible.

### Anti-pattern

A static page with no date, no version, and no indication that content may have been updated since the reader last visited. A "Last updated" field buried in the footer in grey text.

### Related Components

Version badge, Change Log, Correction notice, Revision diff view, Freshness indicator.

---

## 6. Search as Navigation

### Why

A search bar that only finds page titles fails the researcher and frustrates the scholar. Knowledge objects contain claims, sources, entities, and documents — all of which must be discoverable through search for the system to function as a knowledge tool rather than a page archive.

### Rule

Search must return claims, sources, entities, chapters, and collections — each with a type indicator and confidence score. Search results must link directly to the relevant object, not just the containing page.

### Good Example

Typing "Kashmir 1947" returns: the chapter on Partition (Chapter), the UN Resolution 47 document (Source), the Kashmir conflict entity (Entity), and the claim "India took the Kashmir dispute to the UN in 1948" (Claim) — each with a confidence score and direct link.

### Anti-pattern

A search that returns only pages, forcing the researcher to open each one and Ctrl+F to find the relevant passage. No indication of result type or confidence.

### Related Components

Search input, Search results panel, Result type indicator, Confidence badge, Entity card.

---

## 7. Correction Prominence

### Why

A buried corrections link signals that errors are embarrassing. A visible corrections surface signals that accuracy is the priority. The handling of mistakes is one of the strongest trust signals an institution can send.

### Rule

Corrections must have a dedicated discoverable surface and be linked from every affected knowledge object. Each correction must state what changed, why, and when — with a link to the previous version.

### Good Example

A corrections page listing every change with before/after comparison, date, and reason. Each corrected chapter displays a banner: "This chapter was revised on [date]. See what changed." The banner links to the specific correction entry.

### Anti-pattern

A "Corrections" link in the footer that leads to an empty page or a generic email address. Corrected text with no indication that it was changed.

### Related Components

Corrections log, Correction banner, Revision diff, Change notification, Version history.

---

## 8. Reading State Persistence

### Why

A reader who leaves mid-chapter and returns to a blank page will not come back a third time. Knowledge reading is rarely linear or completed in one session. The system must respect the reader's time and attention.

### Rule

Scroll position, expanded claims, active reading mode, and open evidence panels must persist across sessions for authenticated readers. The reader should return to exactly where they left off.

### Good Example

An authenticated reader closes a chapter halfway through section 3 with two evidence panels open. Returning the next day, the page restores to section 3 at the same scroll position with the same panels expanded.

### Anti-pattern

A reader who has spent 20 minutes on a chapter accidentally navigates away and returns to find the page at the top with all panels collapsed. No bookmark, no history, no continuity.

### Related Components

Session state manager, Scroll restoration, Expanded state persistence, Bookmark, Reading progress indicator.

---

## 9. Minimal Cognitive Load

### Why

Every decision a reader makes about the interface is a decision not made about the content. The interface must default to the most common reading path and avoid presenting choices that the reader did not ask for.

### Rule

Default states must show the most common reading path without configuration. Advanced features, metadata panels, and customisation options must be available but not default-visible. Never ask a reader to make a decision about the interface before they have engaged with the content.

### Good Example

A chapter page loads with the narrative visible, the reading mode set to Explorer, and the table of contents collapsed. The reader can expand evidence, switch modes, or open navigation only when they choose to.

### Anti-pattern

A page that displays five toolbars, three metadata panels, two feedback prompts, and a mode selector before the reader has read a single sentence. A reader is asked to "Customise your experience" before they know what the experience is.

### Related Components

Default state, Content density, Toolbar visibility, Metadata panel, Onboarding.

---

## 10. Feedback Symmetry

### Why

A reader who reports an error and never hears back learns that the institution does not listen. Feedback without acknowledgement erodes trust faster than the original error.

### Rule

Every feedback submission must trigger an acknowledgement within a defined timeframe. When feedback results in a change, the submitter must receive a notification linking to the published correction.

### Good Example

A reader submits a correction via an inline "Report" button on a claim card. An automated reply acknowledges receipt within minutes. When the editorial team publishes a revision, the reader receives a notification: "Your reported issue in Chapter 1 has been reviewed and a correction published. View change."

### Anti-pattern

A feedback form with no confirmation screen. A reader who submits a detailed correction never hears back and never sees whether their input led to a change. No record of their submission.

### Related Components

Feedback button, Acknowledgement notification, Correction notification, Submission history, Change log link.

---

## Enforcement

These principles are immutable. Any design decision that violates a principle must be escalated to the CPO with a written justification. No feature may ship with a known violation unless the CPO documents the exception and sets a remediation date.
