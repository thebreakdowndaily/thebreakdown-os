# Visual Experience Principles

> **VXS v1.0 (Frozen)** — Part of the Visual Experience System. Do not modify outside the governance process defined in `README.md`.
>
> Every visual in The Breakdown belongs to exactly one of seven categories: Orientation, Evidence, Explanation, Context, Comparison, Timeline, Network. No decorative visuals. See `visual-taxonomy.md` for the full category definitions.

## 1. Pedagogical Purpose

### Why

Every visual takes up screen space, network bandwidth, and reader attention. If it does not teach something the text alone cannot teach, it consumes resources without producing understanding. Decorative visuals train readers to ignore visuals.

### Rule

Every visual must answer: "What does this teach that text alone cannot?" The answer must be documented in the visual's canonical metadata. If a visual's only purpose is to break up text or improve page aesthetics, it shall not be included.

### Good Example

A map of the Radcliffe Line overlaid on a religious demography layer. The text describes the boundary; the map shows why any boundary would divide communities. The reader understands spatial reality that text cannot convey.

### Anti-pattern

A generic photograph of the Himalayas at the top of a chapter on the India-China border. The image signals "this is about mountains" but teaches nothing about the border, the dispute, or the LAC. The reader learns nothing from looking at it.

### Related Components

Knowledge Block (visual type), Caption (pedagogical explanation), Linked Claims (what knowledge this visual supports).

---

## 2. Evidence Proximity

### Why

A visual without source attribution is decoration. A map without a scale and projection is an assertion. A chart without methodology is propaganda. Readers must be able to evaluate a visual's evidentiary basis from the visual itself.

### Rule

Every visual must display its source, date, and confidence level in a standard position (lower-right caption overlay by default). Charts must include source data references. Maps must include scale, projection, and a legend. The provenance must be accessible within one interaction.

### Good Example

A chart showing partition death-toll estimates displays "Sources: Census of India 1951, Bhatia (1967), Talbot (2009)" in the caption area. The reader can assess the evidentiary basis without leaving the page.

### Anti-pattern

A chart with no source citation. An archival photograph with a caption that says "photograph from 1947" but does not identify the photographer, archive, or collection. The reader has no way to evaluate the visual's trustworthiness.

### Related Components

Source badge, Confidence indicator, Caption metadata, Provenance link.

---

## 3. Default Legibility

### Why

A visual that requires zooming, toggling, or interaction to be understood has failed in its default state. Readers should not have to work to see what a visual is communicating. Interaction must reveal additional depth, not compensate for poor design.

### Rule

A visual must be fully interpretable at its default rendered size. All critical information (labels, legends, annotations, data points) must be legible without interaction. Interaction may add detail but must not be required for comprehension.

### Good Example

A partition migration flow map shows the direction and relative volume of population movements at a glance. Arrow widths encode quantity. City labels are readable at default size. Zooming reveals district-level detail and specific refugee camp locations — a bonus, not a necessity.

### Anti-pattern

A map of the Line of Actual Control where the actual line is one pixel wide and the place names are in 6pt type. The reader must zoom to see anything. The default state communicates nothing.

### Related Components

Default render size, Label hierarchy, Legend placement, Responsive breakpoints.

---

## 4. Format Follows Function

### Why

Different types of information require different visual treatments. A historical photograph and a GIS map have fundamentally different design requirements, production workflows, and interaction patterns. Applying the same rules to both produces bad outcomes for both.

### Rule

Each visual category in the VXS taxonomy has its own production standards, placement rules, and interaction patterns. A map (Orientation) is not treated like a photograph (Context). A chart (Comparison) is not treated like a diagram (Explanation). The category determines the rules.

### Good Example

An Orientation map uses GIS vector recreation, has a scale bar and north arrow, uses projection-appropriate distortion handling, and is zoomable. A Context archival photograph uses acquisition from the holding archive, has a provenance note, and is viewable at full resolution with a lightbox.

### Anti-pattern

A flow map that is designed like a chart (using bar-chart aesthetics for spatial data). A historical photograph that is treated as immovable decoration with no lightbox interaction. An Explanation diagram rendered at chart resolution standards.

### Related Components

Visual taxonomy, Production standards per category, Placement rules per category, Interaction patterns per category, Category selector.

---

## 5. One Visual, One Job

### Why

A visual that tries to show everything shows nothing. Cognitive load increases with visual complexity. A reader looking at a map with eight legend items, three data layers, and annotations in two languages will extract nothing from any of them. Split complex information across multiple visuals.

### Rule

A visual should communicate exactly one primary insight. If a visual requires more than five legend items, more than three data layers, or more than thirty seconds of study to extract its main point, it should be split into multiple visuals. The primary insight must be identifiable within five seconds of viewing.

### Good Example

Three separate maps for the India-China border: Map 1 shows the McMahon Line with terrain (eastern sector); Map 2 shows Aksai Chin and the LAC (western sector); Map 3 shows the 1962 war campaigns. Each map has one job, each communicates its insight at a glance.

### Anti-pattern

A single map of the entire India-China border trying to show the McMahon Line, the LAC, Chinese claims, Indian claims, Aksai Chin, the 1962 campaign arrows, and the Galwan location — all on one 800px-wide graphic. The reader sees noise, not signal.

### Related Components

Visual complexity scoring, Split-guidance in placement rules, Sequential visual narratives.

---

## 6. Sequential Visual Narrative

### Why

Some concepts require multiple visuals in sequence. A before-and-after map, a process diagram with steps, or a timeline with phases are single narratives expressed across multiple visual objects. The system must support visual sequences as first-class narrative structures.

### Rule

When a concept requires multiple visuals to convey, the visuals must be authored as a sequence with explicit ordering, transition logic, and a cumulative learning objective. Each visual in the sequence must work independently but gain meaning from the sequence.

### Good Example

A three-map sequence showing the Partition of Punjab: Map 1 (pre-1947 religious demography), Map 2 (the Radcliffe Line), Map 3 (post-Partition migration flows and population composition). The reader scrolls through the sequence and understands how a demography became a boundary and then a migration.

### Anti-pattern

A single map attempting to show pre-Partition demography, the boundary, and post-Partition outcomes simultaneously. The reader cannot separate cause from effect or chronology from geography.

### Related Components

Visual sequence block, Step indicator, Cumulative caption, Transition annotation.

---

## 7. Orientation Anchoring

### Why

Readers can become disoriented by visuals — particularly maps showing unfamiliar geographies or historical photographs of unknown locations. Without orientation, a visual can confuse more than it clarifies. Every visual must answer: "Where (or when) am I looking?"

### Rule

Every visual must provide immediate spatial and temporal orientation. Maps must indicate the region within India/world context (an inset map is required for sub-regional maps). Historical photographs must include the date and location in the caption. Charts must indicate the time period in the title.

### Good Example

A map of the Aksai Chin region includes a small inset of South Asia showing the region's location. The caption reads: "Western sector of the India-China border, showing the Xinjiang-Tibet Highway (constructed 1954–1957) and the Line of Actual Control." The reader knows where they are within two seconds.

### Anti-pattern

A map of a small section of the McMahon Line with no inset, no compass, and a caption that reads "The border in the eastern sector." The reader has no idea where in the eastern sector, what the surrounding geography is, or how this relates to the overall border.

### Related Components

Inset map, Context indicator, Location stamp, Date stamp, Caption orientation.

---

## 8. Responsive Fidelity

### Why

Readers access visuals on devices ranging from 360px phone screens to 4K monitors. A map that is legible on a desktop may be illegible on a phone. A photograph that loads at full resolution on a phone wastes data and slows rendering. The visual must adapt to the device without losing its pedagogical function.

### Rule

Every visual must specify at least three fidelity levels (mobile, tablet, desktop) with appropriate resolution, label size, and simplification. Maps must simplify on mobile (fewer labels, fewer layers, broader stroke widths). Charts must maintain legibility at the smallest target size. The default state on any device must be fully functional.

### Good Example

A partition migration map on desktop shows all district-level labels, arrow annotations, and a detailed legend. On mobile, it shows only provincial labels, aggregates arrows to provincial level, and increases label size. The reader on either device understands the direction and scale of migration.

### Anti-pattern

A dense reference map designed at full desktop resolution that loads on mobile at the same size, rendering labels at 4pt and legend items unreadable. The reader must pinch-zoom and scroll in two dimensions to understand the visual.

### Related Components

Responsive breakpoint standards, Label size floor, Mobile simplification rules, Resolution targets.

---

## 9. Trust Transparency

### Why

Visuals communicate authority. A sourced, captioned, and verified visual signals trust. An uncaptioned, unattributed visual signals carelessness. Readers judge institutional credibility by the quality and transparency of visuals.

### Rule

Every visual must display its provenance metadata in a standard location accessible from the visual. Required metadata: source archive or creator, date of creation, license status, evidence level (A–E). Maps must additionally display scale, projection, and data sources. Charts must display data source and methodology.

### Good Example

An archival photograph displays at the lower right: "Imperial War Museum, IND 5302. Crown Copyright (expired). Evidence level: A. July 1947." The reader knows exactly what they are looking at and how to verify it.

### Anti-pattern

An archival photograph with no attribution, no date, and a generic caption like "Partition refugees, 1947." The reader has no way to assess the visual's authenticity or provenance.

### Related Components

Provenance badge, Evidence level indicator, License badge, Caption metadata block.

---

## 10. Accessibility by Design

### Why

Alt text added after a visual is designed is usually incomplete. If a visual was designed without considering its non-visual representation, the alt text will describe the visual object rather than the information it conveys. Accessibility must be part of the visual's conception.

### Rule

Every visual must have a complete, descriptive alt text that conveys all information present in the visual — not just what the visual is but what it means. The alt text must be authored at the same time as the visual, not added as an afterthought. Charts and maps must describe the data patterns, not just the presence of a chart or map.

### Good Example

Alt text for a migration flow map: "Flow map of migration during the Partition of Punjab, 1947. Orange arrows show Sikh and Hindu movement from West Punjab to East Punjab (approximately 4.5 million). Green arrows show Muslim movement from East Punjab to West Punjab (approximately 5.5 million). Arrow widths are proportional to population. The largest movement is concentrated in a 200-kilometre corridor along the Grand Trunk Road."

### Anti-pattern

Alt text: "A map of Punjab showing migration arrows." Describes the presence of the visual but conveys none of the information. A non-visual reader learns nothing.

### Related Components

Alt text template per visual type, WCAG compliance checklist, Accessibility review gate.

---

## Enforcement

These principles are immutable. Any visual that violates a principle must be escalated to the Visual Editor with a written justification. No visual may be published with a known violation unless the Editor-in-Chief documents the exception and sets a remediation date.
