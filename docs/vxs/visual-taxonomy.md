# Visual Taxonomy

> **VXS v1.0 (Frozen)** — Every visual in The Breakdown belongs to exactly one of seven categories. The category determines its pedagogical purpose, production method, placement rules, interaction patterns, and quality standards.

| # | Category | Core question | Examples |
|---|----------|---------------|----------|
| 1 | **Orientation** | Where? | Reference maps, thematic maps, flow maps |
| 2 | **Evidence** | Proof? | Document facsimiles, primary source reproductions |
| 3 | **Explanation** | How? | Process diagrams, decision trees, causal chains, study aids |
| 4 | **Context** | What was it like? | Archival photographs |
| 5 | **Comparison** | How do they relate? | Data charts, comparison tables, quantitative graphics |
| 6 | **Timeline** | When? | Chronological displays rendered from the knowledge model |
| 7 | **Network** | Who connects to whom? | Relationship diagrams, entity networks |

No visual belongs to more than one category. A photograph that also contains a map (e.g., a photo of a cartographer at work) is still Context — the map inside it is incidental, not navigable. A document that contains a chart is still Evidence — the chart is part of the document's content.

---

## 1. Orientation

**Purpose:** Answer "Where?" — show geographic location, boundaries, distributions, or movements across space.

**Pedagogical role:** Orient the reader in geographic space. Make visible the spatial patterns, boundaries, and flows that text can describe but cannot display. The reader understands where things happened before the narrative explains what they mean.

**Sub-types:**

| Sub-type | What it shows | Production method |
|----------|--------------|-------------------|
| Reference map | Location, boundaries, administrative divisions | GIS vector recreation from archival baseline data |
| Thematic map | Distribution, density, or pattern across space (choropleth, dot-density, graduated-symbol) | GIS vector recreation from census, survey, or historical records |
| Flow map | Movement of people, goods, or ideas across space (arrow/line width encodes quantity) | GIS vector recreation from migration, trade, or military records |

**Examples:** Radcliffe Line boundary (B-03), religious demography of Punjab 1941 (B-06), Partition migration flows — Punjab (Flow-1), India-China border — McMahon Line and LAC.

**Properties:**
- Scale: Graphic scale bar required. Verbal scale optional.
- Projection: Named and appropriate for the region. Conic for mid-latitudes, Mercator only for equatorial regions.
- Legend: Complete, legible at default size. Maximum 5 items. More than 5 means split into multiple visuals.
- Data sources: All GIS data layers attributed.
- Disputed boundaries: Dashed lines with labelled note per Book of Record #0003.
- Inset map: Required when showing a sub-region (less than 10% of India's land area).
- Flow-specific: Arrow width proportional to quantity, scale documented. One colour per direction.

**Default interaction:** Pan and zoom for detailed exploration. Layer toggle for thematic maps. Hover/tap on flow arrows or regions for exact values.

**Accessibility:** Alt text must describe the geographic information, not the map object. Example: "Reference map of the Radcliffe Line dividing Punjab, 17 August 1947. The boundary runs through the middle of the province, separating Lahore (Pakistan) from Amritsar (India). Major rivers and cities are labelled. An inset shows the line in the context of the India-Pakistan border."

---

## 2. Evidence

**Purpose:** Answer "Proof?" — provide direct, unmediated access to a primary source document.

**Pedagogical role:** A transcribed quote is mediated. A facsimile of the document itself is unmediated evidence. The reader sees original formatting, handwriting, signatures, and physical context — details that transcription loses.

**Sub-types:**

| Sub-type | What it shows | Production method |
|----------|--------------|-------------------|
| Document facsimile | Full text of a primary source | Digitisation from holding archive or download from public digital library |
| Excerpt | Key page or passage from a longer document | As above, with context note |

**Examples:** Instrument of Accession of Jammu and Kashmir (A-06), UN Security Council Resolution 47 (C-03), Indian Independence Act 1947 (C-01), Cabinet Mission Plan memorandum (C-05).

**Properties:**
- Source: Holding archive, reference number, digital URL or IIIF link
- Pages: Number of pages and sequence
- Date: Document creation date
- Language: Original language; translation if applicable
- Transcription: Full or partial transcription provided alongside facsimile

**Default interaction:** Page-through or scroll for multi-page documents. Zoom for text legibility. Lightbox for single-page view.

**Accessibility:** Full transcription must be provided in the alt text or as linked text. Alt text: "Document facsimile of the Instrument of Accession of Jammu and Kashmir, 26 October 1947. Signed by Maharaja Hari Singh. Full transcription available below."

---

## 3. Explanation

**Purpose:** Answer "How?" — show processes, sequences, decision trees, causal chains, or conceptual relationships that unfold over time or logic.

**Pedagogical role:** Make complex processes visible and navigable. A decision tree shows branching paths and their consequences simultaneously — a structure text can describe but cannot display at once.

**Sub-types:**

| Sub-type | What it shows | Production method |
|----------|--------------|-------------------|
| Process diagram | Sequence, decision tree, or causal chain | Original illustration — flowchart, decision tree, or causal loop diagram |
| Study aid | Concept summary, comparison, or review aid | Original design — table, matrix, list, or concept map |

**Examples:** Decision tree of Partition (Diagram-3), Cabinet Mission Plan structure (Diagram-2), competing interpretations comparison table, key dates summary, evidence hierarchy.

**Properties:**
- Step labels (process diagram): Each step named. Decision nodes distinct from outcome nodes by shape.
- Path labels: Conditions or choices producing each branch. Maximum 5 words.
- Direction: Top-to-bottom or left-to-right. Sankey layout for flow processes.
- Complexity limit (process diagram): Maximum 20 nodes. If more required, split into sub-steps.
- Complexity limit (study aid): 20 items in a list, 6×6 grid in a table, 10 nodes in a concept map.
- Sources: Study aids reference internal chapter content only. No external citations.

**Default interaction:** Step-by-step reveal or sequential highlighting for process diagrams. Static for study aids (tap for full-screen on mobile).

**Accessibility:** Alt text must describe the process or conceptual structure. Example: "Decision tree of the Partition of India. Step 1: Cabinet Mission Plan proposed (May 1946). Branch A: Accepted by both (June) → Nehru press conference (10 July) → Congress declares freedom from agreement → Muslim League withdraws acceptance. Branch B: League calls Direct Action Day (16 August) → Calcutta Killing → Spread of violence → Partition becomes probable."

---

## 4. Context

**Purpose:** Answer "What was it like?" — show the human and material reality of a historical moment through a contemporary lens.

**Pedagogical role:** The archival photograph is the closest a reader can come to seeing what the historical actor saw. It provides emotional weight and human scale that text alone cannot achieve. It establishes atmosphere, not argument.

**Sub-types:**

| Sub-type | What it shows | Production method |
|----------|--------------|-------------------|
| Archival photograph | A specific moment captured at the time | Acquisition from holding archive |
| Composite | Multiple photographs on a related theme | Curated selection with shared caption |

**Examples:** Mountbatten and Jinnah at Viceroy's House (A-01), refugees on the Grand Trunk Road (A-05), Nehru addressing the UN (A-07), refugee train at New Delhi station (A-04).

**Properties:**
- Provenance: Archive name, collection number, IIIF URL or equivalent
- License: Type (PD, RM, CC), cost if applicable, publication terms
- Date: Date of creation (not digitisation or acquisition)
- Location: Geographic location of the photograph, if known
- Evidence level: A–E per Asset Management Rules
- AI-generation: Prohibited (per Editorial Constitution Article VIII)

**Default interaction:** Lightbox for full-resolution viewing. Zoom to inspect detail. No zoom beyond available resolution.

**Accessibility:** Alt text must describe what is visually present AND its historical significance. Example: "Jinnah and Mountbatten seated in an office, July 1947. Jinnah is formally dressed, reserved posture; Mountbatten leans forward, informal. The body language reflects the asymmetry of the final partition negotiations."

---

## 5. Comparison

**Purpose:** Answer "How do they relate?" — show quantities, trends, distributions, or comparisons between data points.

**Pedagogical role:** Make numerical and comparative patterns visible. A table of numbers is opaque; a chart of the same numbers is interpretable at a glance. Charts are the primary tool for quantitative evidence.

**Sub-types:**

| Sub-type | What it shows | Production method |
|----------|--------------|-------------------|
| Bar chart | Quantities across categories | Original chart from data, SVG |
| Line chart | Trends over time | Original chart from data, SVG |
| Scatter plot | Correlation between variables | Original chart from data, SVG |
| Area chart | Volume over time | Original chart from data, SVG |
| Comparison table | Side-by-side comparison of attributes | Original design, SVG preferred |

**Examples:** Partition death-toll estimates across sources (D-01), religious composition 1941 vs 1951 (D-04), India-Pakistan military balance 1947 (D-05).

**Properties:**
- Data source: Exact source for every data point. Multiple sources distinguished by style with legend.
- Methodology: Any calculation, normalisation, or estimation method used.
- Margin of error / confidence interval: Required for estimated values.
- Axis labels: Full labels, no abbreviations. Units in parentheses.
- Colour scheme: Colourblind-safe. Max 8 categories.
- Legend: Required if more than one data series.

**Default interaction:** Hover/tap for exact values. No zoom required — chart must be legible at default size.

**Accessibility:** Alt text must describe the data pattern, not the chart type. Example: "Bar chart comparing death-toll estimates for the Partition of India across four scholarly sources. Low estimate: Bhatia (1967) 500,000. Mid estimate: Talbot (2009) 700,000. Mid-high estimate: Pandey (2001) 1 million. High estimate: popular accounts (no scholarly consensus) 2 million. Error bars show uncertainty ranges."

---

## 6. Timeline

**Purpose:** Answer "When?" — show chronological relationships between events.

**Pedagogical role:** Make the sequence, proximity, and periodisation of events visible. A reader can see the gaps between events, the clustering of related events, and the overall chronology at a glance.

**Sub-types:**

| Sub-type | What it shows | Production method |
|----------|--------------|-------------------|
| Full timeline | Chronological events across the full scope of a chapter | Rendered from the knowledge model (timeline.yaml) |
| Period timeline | Events within a specific period | Rendered from the knowledge model with period filter |

**Properties:**
- Event labels: Concise — date plus short description
- Chronology: Linear scale. Proportional spacing (not fixed).
- Categories: Events colour-coded by type (diplomatic, military, political, humanitarian) with legend.
- Density: Maximum 30 events per timeline. If more required, split into period sub-timelines.
- Data source: Rendered from the knowledge model timeline (timeline.yaml). Not manually illustrated.

**Default interaction:** Scrollable for long timelines. Tap or hover for event detail. Filter by category.

**Accessibility:** Alt text must describe the chronological pattern, not the timeline object. Example: "Timeline of the India-China border dispute, 1914–2020. Key periods: Colonial inheritance (1914–1947), Friendship era (1947–1959), Collapse (1959–1962), The war (1962), Cold peace (1963–2019), New normal (2020–present). Military events cluster in 1962 and 2020. Diplomatic events cluster in 1993–1996."

---

## 7. Network

**Purpose:** Answer "Who connects to whom?" — show relationships, hierarchies, or connections between entities.

**Pedagogical role:** Visualise relationships that text must describe sequentially. A network diagram shows all key figures and their connections simultaneously — something text cannot achieve.

**Sub-types:**

| Sub-type | What it shows | Production method |
|----------|--------------|-------------------|
| Relationship diagram | Connections between entities | Original illustration — node-and-edge visualisation |
| Entity network | Organisational hierarchy or affiliation map | Original illustration from knowledge model |

**Examples:** Key actors in the Partition (Diagram-1), alliance structures, institutional hierarchies.

**Properties:**
- Node labels: All entities named. Colour or shape to indicate type (person = circle, institution = square, event = diamond).
- Edge labels: Nature of the relationship (opposed, supported, negotiated with). Max 3 words.
- Legend: Required if encoding is not self-evident.
- Complexity limit: Maximum 15 primary nodes. If more required, split into sub-diagrams.

**Default interaction:** Zoom for detail. Tap or hover on node for entity summary. Tap or hover on edge for relationship description.

**Accessibility:** Alt text must describe the network structure. Example: "Relationship diagram of Partition-era actors. Central nodes: Jawaharlal Nehru (Congress), Muhammad Ali Jinnah (Muslim League), Lord Louis Mountbatten (British). Edges: Nehru and Jinnah — opposed. Mountbatten — negotiated with both. Sardar Patel — aligned with Nehru. Mahatma Gandhi — aligned with Nehru, separate peace initiative."
