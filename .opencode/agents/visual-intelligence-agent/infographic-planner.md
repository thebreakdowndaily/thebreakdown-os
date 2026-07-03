# Infographic Planner — Cards, Flow, Accessibility & Performance

## Purpose

When the decision engine determines that comparison, summary, or step-by-step information needs a visual, this module plans infographic components. Infographics include cards, comparison boxes, and explainer layouts.

---

## STEP 8: Infographic Components

### Supported Card Types

#### 1. Comparison Card
Best for: before/after, policy comparison, scheme vs scheme
```
{
  "cardId": "uuid",
  "type": "comparison",
  "purpose": "Compare [X] vs [Y] across [dimensions]",
  "items": [
    {
      "label": "Scheme A",
      "color": "var(--color-brand-400)",
      "metrics": [
        { "label": "Budget", "value": "₹10,000 Cr" },
        { "label": "Coverage", "value": "50M beneficiaries" }
      ]
    },
    {
      "label": "Scheme B",
      "color": "var(--color-info)",
      "metrics": [
        { "label": "Budget", "value": "₹5,000 Cr" },
        { "label": "Coverage", "value": "25M beneficiaries" }
      ]
    }
  ],
  "caption": "Scheme A has double the budget and coverage of Scheme B."
}
```

#### 2. Fact Card
Best for: key statistics, single important number
```
{
  "cardId": "uuid",
  "type": "fact",
  "purpose": "Highlight a single key statistic",
  "value": "₹5.2 Lakh Crore",
  "label": "Education Budget 2024-25",
  "context": "15% increase over previous year",
  "icon": "trending-up",
  "caption": "The education budget reached a record high in 2024-25."
}
```

#### 3. Timeline Card
Best for: chronological milestones (fewer than 8 events)
```
{
  "cardId": "uuid",
  "type": "timeline",
  "purpose": "Show key milestones in chronological order",
  "events": [
    { "date": "2014", "title": "Scheme launched", "description": "..." },
    { "date": "2017", "title": "Expanded to 600 districts", "description": "..." },
    { "date": "2020", "title": "Digital platform launched", "description": "..." },
    { "date": "2024", "title": "100M beneficiaries reached", "description": "..." }
  ],
  "orientation": "vertical | horizontal",
  "interactive": true
}
```

#### 4. Statistics Card
Best for: multiple key numbers in a grid
```
{
  "cardId": "uuid",
  "type": "statistics",
  "purpose": "Display a grid of key statistics",
  "stats": [
    { "value": "78.5 Cr", "label": "Population", "change": "+1.2%" },
    { "value": "65.3%", "label": "Literacy Rate", "change": "+3.1%" },
    { "value": "7.2%", "label": "GDP Growth", "change": "+0.5%" }
  ],
  "columns": 3
}
```

#### 5. Country Card
Best for: country profiles in multi-country stories
```
{
  "cardId": "uuid",
  "type": "country",
  "purpose": "Profile a country relevant to the story",
  "country": {
    "name": "India",
    "iso": "IND",
    "flag": "/images/flags/ind.svg",
    "stats": [
      { "label": "GDP", "value": "$3.7T" },
      { "label": "Population", "value": "1.4B" }
    ],
    "highlight": "Key fact about this country's role"
  }
}
```

#### 6. Quote Card
Best for: important quotes from sources
```
{
  "cardId": "uuid",
  "type": "quote",
  "purpose": "Highlight a key quote from a source",
  "quote": "This is a direct quote from a primary source.",
  "attribution": "Name, Title",
  "source": "Source name, Date"
}
```

#### 7. Explainer Card
Best for: step-by-step explanation of a process
```
{
  "cardId": "uuid",
  "type": "explainer",
  "purpose": "Explain a process step by step",
  "steps": [
    { "number": 1, "title": "Application", "description": "..." },
    { "number": 2, "title": "Verification", "description": "..." },
    { "number": 3, "title": "Approval", "description": "..." },
    { "number": 4, "title": "Disbursement", "description": "..." }
  ],
  "showConnector": true
}
```

---

## STEP 9: Visual Story Flow

Arrange all planned visuals in a coherent reading order. The flow follows the story's natural progression.

### Default Flow

```
Hero Visual (if any)
    ↓
Timeline (context)
    ↓
Chart 1 (main data point)
    ↓
Map / Globe (geography)
    ↓
SVG / System Diagram (structure)
    ↓
Quote Card (human element)
    ↓
Data Cards / Statistics (key numbers)
    ↓
Chart 2 (secondary data)
    ↓
Comparison Card (before/after)
    ↓
Conclusion Visual (summary)
```

### Flow Output

```json
{
  "storyFlow": [
    { "position": 1, "type": "hero", "visualId": "..." },
    { "position": 2, "type": "timeline", "visualId": "..." },
    { "position": 3, "type": "chart", "visualId": "..." },
    { "position": 4, "type": "map", "visualId": "..." },
    { "position": 5, "type": "infographic", "visualId": "..." }
  ]
}
```

### Flow Rules

1. **Maximum 8 visual elements** per story (excluding hero).
2. **Every visual must be separated by text** — never two visuals in a row.
3. **Hero visual first** (if available).
4. **Data visuals before narrative visuals** (charts before quote cards).
5. **Map or globe before SVG** (geography before systems).
6. **Comparison card near the conclusion** (to reinforce the main point).

---

## STEP 10: Accessibility

Every visual specification **must** include these fields:

```json
{
  "accessible": {
    "altText": "Detailed description of the visual content and data.",
    "longDescription": "Extended description for complex visuals (SVG, maps).",
    "keyboardNavigation": true,
    "focusable": true,
    "ariaLabel": "Short label for screen readers.",
    "highContrast": true,
    "reducedMotion": true,
    "colorBlindSafe": true,
    "textZoom": "Supports 200% text zoom without loss."
  }
}
```

### Accessibility Rules

1. **Alt text required** on every visual — must describe the data, not the appearance.
   - Bad: "A blue bar chart"
   - Good: "A bar chart showing GDP growth in Indian states from 2014 to 2024. Maharashtra leads at 8.2%, followed by Gujarat at 7.8%."
2. **Long description** required for complex SVGs and maps (explains the full structure).
3. **Keyboard navigation** required for interactive visuals (Tab, Enter, Arrow keys).
4. **High contrast mode** — visuals must work with `forced-colors: active`.
5. **Reduced motion** — animations must stop or simplify with `prefers-reduced-motion: reduce`.
6. **Color-blind safe** — use patterns + labels, not just color, to convey information.
7. **Text zoom** — all visuals must be readable at 200% zoom.

---

## STEP 11: Performance

### Format Selection Priority

| Priority | Format | When |
|---|---|---|
| 1 | SVG | Diagrams, icons, simple graphics |
| 2 | Canvas (WebGL) | Charts with >1000 data points |
| 3 | SVG + Image | Raster only when SVG is impossible |
| 4 | Three.js | 3D globe, 3D data visualization |

### Performance Rules

1. **SVG preferred over PNG** in all cases.
2. **Lazy load** — visuals load only when scrolled into view (IntersectionObserver).
3. **Responsive** — visuals render at container width, not fixed width.
4. **Dark theme** — visuals must switch theme without reload.
5. **Compressed assets** — all raster images must be WebP.
6. **No duplicate assets** — same chart with different data reuses the component.
7. **Compute budget**: chart rendering must complete in <100ms on mid-range devices.
8. **Bundle budget**: visual components must be code-split by type (charts, maps, globe, svg).

---

## STEP 12: Final Output

The complete VisualPlan output combines all decisions and specifications into a single structured document.

```json
{
  "visualPlan": {
    "storySlug": "slug-of-the-story",
    "gateResult": "visual_required",
    "primaryVisual": { ... },
    "secondaryVisuals": [ ... ],
    "charts": [ ... ],
    "maps": [ ... ],
    "globes": [ ... ],
    "svgs": [ ... ],
    "animations": [ ... ],
    "infographics": [ ... ],
    "cards": [ ... ],
    "storyFlow": [ ... ],
    "heroVisual": { "type": "hero", "data": {} },
    "assets": [
      { "id": "...", "type": "svg | map | chart | globe | animation | card", "url": "", "lazyLoad": true }
    ],
    "captions": [
      { "visualId": "...", "caption": "...", "altText": "..." }
    ]
  },
  "metadata": {
    "generatedBy": "visual-intelligence-agent",
    "version": "1.0",
    "timestamp": "2026-07-02T12:00:00Z",
    "visualCount": 4,
    "totalAssets": 6
  }
}
```
