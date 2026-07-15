# Interaction Patterns

> **VXS v1.0 (Frozen)** — How readers engage with visuals. These patterns govern the interactive behaviour of visual knowledge objects across all surfaces.

---

## 1. Interaction Philosophy

Visual interaction serves one purpose: **revealing depth that is present but not visible at the default state.** Interaction should never compensate for poor default design. If a visual requires interaction to be understood, it has failed at default legibility.

Every interaction must:
- Be optional (the default state is always complete)
- Be discoverable (the reader knows they can interact)
- Be reversible (the reader can return to default state)
- Respect attention (interaction effort must be justified by information gained)

---

## 2. Standard Interaction Patterns

### 2.1 Lightbox

**Purpose:** View a visual at its maximum available resolution without leaving the narrative flow.

**Trigger:** Tap or click on any visual.

**Behaviour:** Visual expands to full-screen overlay with dimmed background. Caption and metadata remain visible below the visual. Close on tap outside, tap X, or Escape key.

**All categories:** Lightbox is the default interaction for all visuals.

**Mobile:** Lightbox fills viewport. Swipe down to dismiss.

**Accessibility:** Focus moves to lightbox on open. Escape key closes. Alt text available via screen reader.

### 2.2 Zoom (Pan-and-Scan)

**Purpose:** Inspect detail within a visual that is present at source resolution but not legible at default rendered size.

**Trigger:** Pinch (mobile) or scroll wheel / double-tap (desktop) within lightbox or inline for Orientation visuals.

**Behaviour:** Pinch-to-zoom with inertia. Pan by dragging. Zoom level indicator optional.

**Available for:** Orientation (maps), Evidence (document facsimiles), Context (archival photographs), Network (relationship diagrams).

**Not available for:** Explanation (legible at default size per Default Legibility principle), Comparison (legible at default size), Timeline (legible at default size).

**Constraints:** Maximum zoom = 100% of source resolution. No artificial zoom beyond pixel density.

**Accessibility:** Pinch-to-zoom is not accessible to all users. Provide alternative controls (zoom buttons + / -). Keyboard: +/- keys, arrow keys for pan.

### 2.3 Layer Toggle

**Purpose:** Show or hide data layers within a visual to reduce cognitive load and allow exploration of individual dimensions.

**Trigger:** Toggle buttons, checkboxes, or dropdown in a control bar overlaying the visual or adjacent to it.

**Behaviour:** Toggling a layer shows or hides it with a smooth opacity transition (200ms). Multiple layers can be active simultaneously. Layer labels appear in a legend that updates as layers change.

**Available for:** Orientation (thematic maps — show/hide data layers, terrain, infrastructure), Network (show/hide entity types), Timeline (filter by category).

**Constraints:** Maximum 5 toggleable layers. If more layers are required, the visual should be split into separate visuals. Default state must show the most informative single layer or combination.

**Accessibility:** Layer toggles must be keyboard-accessible. Each layer's alt text must describe what is shown with that layer active.

### 2.4 Hover / Tap Reveal

**Purpose:** Show additional detail for individual elements within a visual without zooming.

**Trigger:** Hover (desktop) or tap (mobile) on a visual element.

**Behaviour:** Tooltip or overlay card appears near the element showing: label, value, source reference, confidence score if applicable. Tooltip disappears on mouse-out or tap-out.

**Available for:** Orientation (tap flow arrow for exact figures, tap region for data value), Comparison (tap bar or data point for exact value), Timeline (tap event for full description), Network (tap node for entity summary, tap edge for relationship description).

**Constraints:** Tooltip must not obscure the element being examined. Tooltip must be dismissible. Maximum 3 lines of text (label + value + source).

**Accessibility:** Tooltip content must be available via screen reader as accessible description. Expandable panel is preferred over hover-only interaction.

### 2.5 Sequential Navigation

**Purpose:** Navigate between visuals in a sequence (before/after, step-by-step, comparison).

**Trigger:** Next/Previous buttons, dot indicators, or swipe (mobile). Auto-advance optional with pause-on-interaction.

**Behaviour:** The visual container transitions to the next visual in the sequence. Caption updates. Progress indicator shows position in sequence (e.g., "Map 2 of 3").

**Available for:** Sequential visual blocks across any category — Orientation sequences (reference → thematic → flow), Explanation step reveals, Timeline period filters, Comparison pairs.

**Constraints:** Maximum 6 items in a single sequential block. Caption must indicate the total number and current position.

**Accessibility:** Arrow keys for navigation. Aria-live region announces slide change. Pause button if auto-advance is used.

### 2.6 Slider Comparison

**Purpose:** Direct visual comparison of two states of the same scene (before/after, then/now, proposed/actual).

**Trigger:** A draggable divider between two overlaid or side-by-side images.

**Behaviour:** Dragging the slider left or right reveals more of one image and less of the other. Labels indicate which side is which. Smooth transition.

**Available for:** Orientation (pre-Partition / post-Partition demographic maps, boundary proposals), Context (historical photograph with modern rephotograph if available).

**Constraints:** Both images must have the same aspect ratio and alignment. Maximum 2 images per slider. Slider must have keyboard controls.

**Accessibility:** Slider must be keyboard-navigable (arrow keys). Both images' alt text must be available. Description of the comparison must be provided in caption.

### 2.7 Document Page-through

**Purpose:** Navigate multi-page Evidence document facsimiles.

**Trigger:** Next/Previous buttons, page number input, or swipe. Thumbnail strip for longer documents.

**Behaviour:** Single-page or spread view. Page number counter ("Page 3 of 12"). Zoom available within each page. Thumbnails for rapid navigation.

**Available for:** Evidence (document facsimiles with 3+ pages).

**Constraints:** Transcription must be available alongside or linked from each page. Minimum page size: legible at default view with zoom available.

**Accessibility:** Page number announced. Transcription available as visible text or linked panel.

---

## 3. Interaction by Visual Category Matrix

| Category | Lightbox | Zoom | Layer toggle | Hover/tap reveal | Sequential | Slider | Page-through |
|----------|----------|------|-------------|-----------------|------------|--------|-------------|
| Orientation | ✅ | ✅ | ✅ | ✅ (regions, arrows) | ✅ (map sequences) | ✅ | — |
| Evidence | ✅ | ✅ | — | — | — | — | ✅ |
| Explanation | ✅ | — | — | ✅ (step details) | ✅ (step reveal) | — | — |
| Context | ✅ | ✅ | — | — | — | ✅* | — |
| Comparison | ✅ | — | — | ✅ (data points) | ✅ (chart pairs) | — | — |
| Timeline | ✅ | — | ✅ (categories) | ✅ (event details) | ✅ (period filter) | — | — |
| Network | ✅ | ✅ | ✅ (entity types) | ✅ (nodes, edges) | — | — | — |

*Slider comparison for Context requires a rephotograph from the same location and angle — rare for archival material.

---

## 4. Interaction Constraints

### 4.1 No Auto-Play

No visual interaction may auto-start without reader action. No auto-advancing slideshows, no auto-zooming animations, no auto-playing video or animated content. The reader controls the pace.

### 4.2 No Full-Screen Video

Animated visual content is restricted to GIF or lightweight SVG animation. Full-screen video is not a visual knowledge object — it belongs in a separate media surface.

### 4.3 No Gesture Conflicts

Visual interactions must not conflict with browser-level gestures (pull-to-refresh, swipe-back). Map panning in the X axis must not trigger browser history navigation. Constrain gesture areas where necessary.

### 4.4 Interaction Announced

All interactive elements must be discoverable via a subtle visual cue (cursor change to pointer on hoverable elements, a "Tap to explore" prompt on first-load Orientation visuals). A reader should never discover interactivity by accident.

---

## 5. Fallback Behaviour

| If... | Then... |
|-------|---------|
| Image fails to load | Show alt text as visible fallback with icon indicating missing media |
| Zoom exceeds available resolution | Show notification: "Maximum zoom reached" |
| Layer data fails to load | Show the base layer only with notification: "Additional layer unavailable" |
| Document page fails to load | Show transcription instead with notification: "Page image unavailable" |
| Interaction unsupported on device | Show static default state with all information visible. Interaction is enhancement, not requirement. |
