# Asset Standards

> **VXS v1.0 (Frozen)** — Technical and quality standards for visual asset production, acquisition, and delivery.

---

## 1. General Standards

### 1.1 Colour

- All visuals must use a colourblind-safe palette (tested against deuteranopia, protanopia, and tritanopia simulations)
- Maximum 8 distinct colours per visual
- Colour must never be the only encoding channel — shape, pattern, or label must reinforce
- No colour below WCAG AA contrast ratio against background (4.5:1 for text, 3:1 for graphical objects)
- Primary palette defined in design system tokens; visuals must use the design system palette unless the data requires otherwise

### 1.2 Typography

- All labels, legends, annotations, and captions use the design system typeface
- Minimum label size: 10px (desktop), 12px (mobile)
- Hierarchy: Main labels (bold), secondary labels (regular), annotations (italic or smaller weight)
- No label may be smaller than 8px on any device
- All text in visuals must be selectable or available via alt text — no text-as-image

### 1.3 File Formats by Category

| Category | Primary format | Alternative | Notes |
|----------|---------------|-------------|-------|
| Orientation | SVG | PNG (high res) | SVG required for zoom, layer interaction, hover |
| Evidence | PDF (multi-page) | JPEG page images | PDF must be text-searchable if source quality permits |
| Explanation | SVG | PNG (high res) | SVG required for step interaction, hover |
| Context | JPEG (85–95%) | WebP | Lossless PNG for scans of text-based archival photos |
| Comparison | SVG | PNG (high res) | SVG required for hover tooltips, accessibility |
| Timeline | SVG | PNG (high res) | SVG required for category filters, event interaction |
| Network | SVG | PNG (high res) | SVG required for node/edge interaction, zoom |

### 1.4 Resolution

| Target | Width | DPI | Notes |
|--------|-------|-----|-------|
| Desktop (default) | 1,200px | 72 DPI | Rendered at container width, not pixel width |
| Retina (2x) | 2,400px | 144 DPI | JPEG/PNG only; SVG is resolution-independent |
| Mobile (default) | 360px–480px | 72 DPI | Responsive image source set |
| Thumbnail | 200px | 72 DPI | For reference panels, inline previews, search results |

- SVGs are resolution-independent and preferred for all recreated visuals (Orientation, Explanation, Comparison, Timeline, Network)
- JPEG/PNG assets must provide srcset with 1x, 2x, and thumbnail variants
- No asset's file size may exceed 5MB (with rare exception approved by Visual Editor)

### 1.5 File Naming

Convention: `{category}-{sequence}-{descriptive-slug}.{format}`

| Segment | Source | Example |
|---------|--------|---------|
| Category | VXS taxonomy | `orientation`, `evidence`, `explanation`, `context`, `comparison`, `timeline`, `network` |
| Sequence | 2-digit numeric | `01`, `02`, `03` |
| Slug | Short hyphenated description | `radcliffe-line`, `nehru-unga-1948` |
| Format | File extension | `.svg`, `.jpg`, `.pdf` |

Examples:
- `orientation-03-radcliffe-line.svg`
- `evidence-01-independence-act-1947.pdf`
- `context-01-mountbatten-jinnah-1947.jpg`
- `comparison-01-death-toll-estimates.svg`
- `explanation-01-decision-tree-partition.svg`
- `timeline-01-india-china-border.svg`
- `network-01-partition-actors.svg`

---

## 2. Standards by Visual Category

### 2.1 Orientation

| Standard | Requirement |
|----------|-------------|
| Format | SVG (required) |
| Minimum dimensions | 800px × 600px (desktop), 360px × 270px (mobile) |
| Scale | Graphic scale bar required. Verbal scale (e.g., "1:4,000,000") in caption |
| Projection | Named and documented. Appropriate for the region. Albers Equal-Area (India-wide), Lambert Conformal (regional), Mercator (avoid except for equatorial regions) |
| Inset map | Required when the map shows a sub-region (less than 10% of India's land area) |
| Data sources | All GIS data layers attributed |
| Disputed boundaries | Dashed lines per Book of Record #0003. Labelled note in caption |
| Legend | Maximum 5 items. Complete and legible at default size |
| Labels | All major geographic features (rivers, cities, regions) labelled |
| Grid | Latitude/longitude grid lines or border coordinates |
| Compass | North arrow (magnetic or true north, labelled) |
| Flow arrows | Width proportional to quantity. Scale documented. One colour per direction. Min 2px width |

### 2.2 Evidence

| Standard | Requirement |
|----------|-------------|
| Minimum resolution | 300 DPI at original size |
| Source requirement | Holding archive, reference number, URL |
| License requirement | Public Domain or CC (paid RM only with Visual Editor approval) |
| File format | PDF (multi-page) + JPEG page images for lightbox |
| Maximum pages | 20 pages. Longer documents: show key pages as facsimile, rest as transcription |
| OCR requirement | Text-searchable PDF preferred, not required for handwritten documents |
| Transcription | Required for all documents. Full transcript for first page; key excerpts for subsequent pages |

### 2.3 Explanation

| Standard | Requirement |
|----------|-------------|
| Format | SVG (required) |
| Minimum dimensions | 600px × 400px (desktop), 360px wide (mobile) |
| Node encoding (process diagram) | Decision node = diamond. Action node = rectangle. Outcome node = rounded rectangle |
| Path labels | Conditions written on paths. Max 5 words |
| Direction | Top-to-bottom or left-to-right. Sankey layout for flow processes |
| Step numbering | Each node numbered in sequence order |
| Maximum nodes (process diagram) | 20 nodes. Split into sub-steps if more required |
| Maximum nodes (study aid) | 20 items in a list, 6×6 grid in a table, 10 nodes in a concept map |
| Sources (study aid) | Internal chapter sources only. No external citations |
| Printability (study aid) | Legible in B&W print. No colour-dependent information |

### 2.4 Context

| Standard | Requirement |
|----------|-------------|
| Minimum resolution | 1,200px on longest side |
| Source requirement | Named archive, collection number, IIIF URL or equivalent |
| License requirement | Public Domain, CC, or paid RM license on file |
| Colour space | sRGB |
| File format | JPEG (85–95%) or WebP |
| Maximum file size | 5MB (JPEG) / 3MB (WebP) |
| Provenance metadata | A–E evidence level; archive name; collection ID; date of creation |
| AI-generation | Prohibited (per Editorial Constitution Article VIII) |

### 2.5 Comparison

| Standard | Requirement |
|----------|-------------|
| Format | SVG (required) |
| Minimum dimensions | 600px × 400px (desktop), 360px × 240px (mobile) |
| Axis labels | Full labels (no abbreviations). Units in parentheses |
| Grid lines | Horizontal for bar/scatter. Vertical for line charts with time axes |
| Data source | Every data point attributed. Multiple sources distinguished by style with legend |
| Margin of error / CI | Displayed as error bars for estimated values. Caption must state methodology |
| Colour scheme | Colourblind-safe. Maximum 8 categories |
| Legend | Required if more than one data series. Positioned adjacent or below |
| Interaction | Hover/tap reveals exact value. No zoom required |
| Title | Concise, descriptive. "Death-toll estimates for the Partition of India by source" not "Death tolls" |

### 2.6 Timeline

| Standard | Requirement |
|----------|-------------|
| Format | SVG (required) |
| Minimum dimensions | Full chapter width × 200px (desktop) |
| Scale | Linear time scale. Proportional spacing |
| Events | Maximum 30 per timeline. Split into period sub-timelines if more required |
| Category colour | Max 5 categories. Legend required if more than 3 |
| Markers | Major event markers distinct from minor. Milestone markers for key turning points |
| Labels | Event label = concise date + short description. Full description on hover/tap |
| Data source | Rendered from the knowledge model timeline (timeline.yaml). Not manually created |

### 2.7 Network

| Standard | Requirement |
|----------|-------------|
| Format | SVG (required) |
| Maximum nodes | 15 primary nodes. Split into sub-diagrams if more required |
| Node encoding | Shape indicates type (person = circle, institution = square, event = diamond). Colour indicates alignment or role |
| Edge encoding | Line style indicates relationship (solid = direct, dashed = indirect, dotted = historical). Arrow optional if direction matters |
| Labels | All nodes labelled. Edge labels optional — if used, maximum 3 words |
| Legend | Required if encoding is not self-evident |
