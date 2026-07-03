# SVG Generator — Editorial SVG Specifications

## Purpose

When the decision engine determines that a system, process, hierarchy, or structure needs a visual, this module generates an editorial SVG specification. SVGs are preferred over raster images for all explanatory graphics.

## When to Use SVG Over Chart

| Situation | Choice |
|---|---|
| Government ministry structure | **SVG** — Org tree |
| Policy decision flow | **SVG** — Flowchart |
| Budget breakdown by department | **SVG** — Treemap or Sankey |
| Election process steps | **SVG** — Process flow |
| Judicial hierarchy | **SVG** — Org tree |
| Tax distribution flow | **SVG** — Sankey diagram |
| Trade flow between countries | **Chart** — Chord / Sankey |
| Supply chain stages | **SVG** — Flowchart |
| Constitutional structure | **SVG** — Tree diagram |
| Decision tree | **SVG** — Decision flowchart |
| Timeline of events | **Timeline Component** (or SVG) |
| Comparison of policies | **Infographic Cards** (or SVG) |

## Supported Editorial SVG Types

### 1. Organization Tree
Best for: ministry structures, judicial hierarchy, corporate structure
```
                Ministry
               /    |    \
         Dept A  Dept B  Dept C
         /  \      |       |  \
       Div1 Div2  Div3    Div4 Div5
```

### 2. Process Flowchart
Best for: policy process, election steps, legislative process
```
  Step 1 → Decision → Step 2 → Step 3 → Outcome
                        ↓
                     Reject → Step 1
```

### 3. Decision Tree
Best for: eligibility criteria, policy impact, legal decisions
```
  Question?
  ├─ Yes → Action A → Outcome A
  └─ No → Action B → Outcome B
```

### 4. Sankey Flow Diagram
Best for: budget flow, tax distribution, trade routes
```
  Source → [Flow width = value] → Target
```

### 5. Treemap
Best for: budget breakdown, resource allocation
```
  [Category A: 40%]
  [Cat B: 25%] [Cat C: 15%]
  [Cat D: 12%] [Cat E: 8%]
```

### 6. Timeline
Best for: chronological events, policy history
```
  Event1 ── Event2 ── Event3 ── Event4
  2000     2010     2020     2024
```

### 7. Comparison Matrix
Best for: policy comparison, scheme comparison
```
          | Scheme A | Scheme B | Scheme C
  Budget   |   100    |    50    |    75
  Coverage |   High   |  Medium  |   Low
```

## SVG Output Specification

```json
{
  "svgId": "uuid-or-slug",
  "type": "org-tree | flowchart | decision-tree | sankey | treemap | timeline | comparison-matrix",
  "purpose": "What this SVG explains",
  "question": "Question the reader should understand after viewing",
  "structure": {
    "layout": "top-to-bottom | left-to-right | radial | nested",
    "nodes": [
      {
        "id": "node-1",
        "label": "Ministry of Finance",
        "type": "root | parent | child | leaf",
        "value": null,
        "children": ["node-2", "node-3"]
      }
    ],
    "edges": [
      {
        "from": "node-1",
        "to": "node-2",
        "label": "",
        "value": null
      }
    ],
    "levels": 3,
    "orientation": "vertical | horizontal"
  },
  "styling": {
    "nodeWidth": 200,
    "nodeHeight": 60,
    "gapX": 40,
    "gapY": 60,
    "fontSize": "var(--text-sm)",
    "nodeColor": "var(--color-bg-secondary)",
    "borderColor": "var(--color-border-default)",
    "textColor": "var(--color-text-primary)",
    "accentColor": "var(--color-brand-400)",
    "linkColor": "var(--color-border-hover)"
  },
  "interactive": true | false,
  "responsive": true,
  "caption": "Plain-English explanation of what the SVG shows.",
  "altText": "Detailed screen-reader description of the diagram structure and data.",
  "theme": "dark",
  "lazyLoad": true
}
```

## Design Rules

1. **Maximum 3 levels deep** in hierarchy diagrams (beyond that, summarize).
2. **Maximum 20 nodes** per SVG (beyond that, break into multiple SVGs).
3. **Use consistent color** — accent color (brand-400) for the primary subject, neutral colors for context.
4. **Show direction** with arrowheads on all flow diagrams.
5. **Label every node** with text that is readable at the target size.
6. **Responsive width**: 100% of container, height proportional.
7. **Dark theme compatible**: use CSS variables, not hardcoded colors.
8. **No raster images** inside SVGs — pure vector only.
