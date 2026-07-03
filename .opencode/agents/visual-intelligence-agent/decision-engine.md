# Decision Engine — Visual Gate + Type Matrix

## STEP 1: Visual Gate

Before generating any visual specification, answer these questions in order:

### Gate Questions

| # | Question | Yes → | No → |
|---|----------|-------|------|
| 1 | Would text alone explain this clearly to a Grade 10 reader? | Skip visual | Continue |
| 2 | Does this data contain numbers, comparisons, proportions, or trends? | Go to Chart | Continue |
| 3 | Does this involve a location, region, border, or route? | Go to Map | Continue |
| 4 | Does this involve multiple countries or global data? | Go to Globe | Continue |
| 5 | Does this describe a sequence, process, or flow? | Go to Animation | Continue |
| 6 | Does this describe a system, hierarchy, or structure? | Go to SVG | Continue |
| 7 | Would a comparison card, fact card, or step-by-step improve understanding? | Go to Infographic | Continue |

If ALL answers are **No**: output `{ "visualPlan": [], "reason": "Text alone explains this adequately." }` and stop.

---

## STEP 2: Visual Decision Matrix

Once the gate confirms a visual is needed, use the matrix below to select the **primary visual type**.

### Default Mappings

| Story Type | Primary Visual | Secondary Visual | Engine |
|---|---|---|---|
| Numbers / Statistics | Chart | Infographic Card | chart-selector.md |
| Geography / Location | Interactive Map | Globe (if multi-country) | map-generator.md |
| History / Timeline | Timeline Component | Chart | animation-planner.md |
| Money / Budget / Economy | Sankey / Treemap | Bar Chart | chart-selector.md |
| Organization / Hierarchy | SVG (Org Tree) | SVG (Flowchart) | svg-generator.md |
| Process / Workflow | SVG (Flowchart) | Animation | svg-generator.md |
| Relationships / Network | Network Graph | Chord Diagram | chart-selector.md |
| Trade / Imports-Exports | Chord Diagram | 3D Globe | chart-selector.md |
| Rankings | Bar Chart | Lollipop Chart | chart-selector.md |
| Budget Allocation | Treemap | Sankey | chart-selector.md |
| Global Position / Geopolitics | Interactive 3D Globe | Map | 3d-globe-engine.md |
| Elections | Constituency Map | Sankey (coalition) | map-generator.md |
| Climate / Weather | Heatmap | Line Chart | chart-selector.md |
| Infrastructure | GIS Map | SVG (system diagram) | map-generator.md |
| Conflict | Timeline + Map | 3D Globe (if multinational) | decision-engine.md → split |
| Demographics | Population Pyramid | Map | chart-selector.md |
| Health / Disease | Heatmap | Line Chart | chart-selector.md |
| Education | Bar Chart | Comparison Card | chart-selector.md |
| Environment | Area Chart | Map | chart-selector.md |
| Technology / Internet | Network Graph | Globe (cables) | chart-selector.md |

### Split Decisions

Some stories require **multiple visuals**. When a story has characteristics of multiple types (e.g., Conflict = Timeline + Map), generate separate visual specifications for each and arrange them in the Visual Story Flow (STEP 9).

### Override Rules

- **If the user audience is rural India**: prefer maps and infographic cards over charts and globes.
- **If the story is for policy audience**: prefer Sankey, treemap, and hierarchy SVGs.
- **If the story is breaking news**: keep visuals to a minimum — hero image + timeline.
- **If the data set has fewer than 5 data points**: use a simple bar chart or infographic card, not a complex chart.
- **If the data set has more than 50 data points**: use a heatmap, scatter plot, or aggregation — never a bar chart.

### Output

After running the gate and matrix, output:

```json
{
  "gateResult": "visual_required" | "text_only",
  "primaryVisual": {
    "type": "chart" | "map" | "globe" | "svg" | "animation" | "infographic",
    "engine": "<engine-md-reference>",
    "reason": "Why this visual type was chosen"
  },
  "secondaryVisuals": [
    {
      "type": "...",
      "engine": "...",
      "reason": "..."
    }
  ]
}
```
