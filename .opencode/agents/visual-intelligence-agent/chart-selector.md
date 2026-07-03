# Chart Selector — 22 Supported Chart Types

## Purpose

When the decision engine determines that numeric data needs a chart, this module selects the exact chart type and specifies its structure.

## Supported Chart Types

| # | Chart | Best For | Data Requirements |
|---|-------|----------|-------------------|
| 1 | **Line** | Trends over time (continuous) | X: time, Y: numeric value |
| 2 | **Bar** | Comparing categories | X: categories, Y: values |
| 3 | **Horizontal Bar** | Many categories, long labels | Y: categories, X: values |
| 4 | **Area** | Volume over time, cumulative | X: time, Y: numeric + fill |
| 5 | **Scatter** | Correlation between 2 variables | X: numeric, Y: numeric |
| 6 | **Bubble** | 3-variable correlation | X, Y, size, optional color |
| 7 | **Treemap** | Hierarchical proportions | Categories + sizes, nesting |
| 8 | **Sankey** | Flows between entities (money, energy, trade) | Source → Target → Value |
| 9 | **Network** | Entity relationships | Nodes + Edges |
| 10 | **Radar** | Multi-dimensional comparison | Dimensions + Scores per entity |
| 11 | **Heatmap** | 2D density / intensity | X categories, Y categories, intensity |
| 12 | **Sunburst** | Hierarchical proportions (multi-level) | Nested categories + sizes |
| 13 | **Waterfall** | Incremental change (budget, P&L) | Steps + values + totals |
| 14 | **Histogram** | Distribution of a single variable | Binned numeric values |
| 15 | **Box Plot** | Statistical distribution (median, quartiles, outliers) | Categories + min/Q1/median/Q3/max |
| 16 | **Violin** | Distribution shape + density | Categories + density data |
| 17 | **Slope** | Change between 2 time points | Entity, Time-1 value, Time-2 value |
| 18 | **Calendar** | Daily values over a year | Date + value (365 rows) |
| 19 | **Dot Plot** | Comparing distributions | Categories + values |
| 20 | **Lollipop** | Ranking with emphasis on value | Categories + values |
| 21 | **Ridgeline** | Distribution changes over time | Time, value, density curves |
| 22 | **Chord** | Inter-entity flows (trade, migration) | Source → Target → Value (matrix) |

## Selection Rules

### By Story Type

| Story Contains | Preferred Chart(s) | Avoid |
|---|---|---|
| Time series (months, years) | Line, Area, Slope | Pie, Treemap |
| Budget / allocation | Treemap, Sankey, Waterfall | Line, Scatter |
| Rankings | Bar, Lollipop, Dot | Pie, Radar |
| Proportions | Treemap, Sunburst | Radar, Scatter |
| Comparisons (2 time points) | Slope, Bar | Heatmap, Network |
| Distribution | Histogram, Box, Violin, Ridgeline | Pie, Line |
| Relationships | Network, Chord | Bar, Treemap |
| Trade flow | Sankey, Chord, Bubble | Pie, Histogram |
| Multi-dimensional | Radar, Heatmap, Scatter | Pie, Treemap |
| Daily / calendar data | Calendar, Line | Bar, Pie |

### By Data Size

| Data Points | Recommended |
|---|---|
| 1–5 | Horizontal Bar, Dot Plot, Infographic Card |
| 6–20 | Bar, Lollipop, Slope |
| 21–50 | Line, Scatter, Heatmap |
| 51–200 | Heatmap, Ridgeline, Box Plot |
| 200+ | Heatmap, Histogram, Area (aggregated) |

### Rules

- **Never use a pie chart.** Use treemap, sunburst, or horizontal bar instead.
- **Never use 3D charts.** They distort perception.
- **Never use dual Y-axes.** Use a single-axis chart or facet.
- **Always prefer horizontal bars** when category labels are long (>10 chars).
- **Always sort bar charts** by value (ascending or descending), never alphabetically.
- **Always show zero baseline** for bar charts.
- **Use color intentionally:** one hue for one category, diverging for change, sequential for intensity.

## Output Format

Every chart specification requires:

```json
{
  "chartId": "uuid-or-slug",
  "type": "line | bar | horizontal-bar | area | scatter | bubble | treemap | sankey | network | radar | heatmap | sunburst | waterfall | histogram | box-plot | violin | slope | calendar | dot-plot | lollipop | ridgeline | chord",
  "purpose": "The specific question this chart answers (e.g., 'How has GDP growth changed across Indian states from 2014 to 2024?')",
  "question": "The question string for the reader",
  "xAxis": { "label": "", "field": "", "type": "category | numeric | time | ordinal" },
  "yAxis": { "label": "", "field": "", "type": "category | numeric | ordinal" },
  "dataset": {
    "source": "Reference to specific data in research.json or knowledgeGraph.json",
    "fields": ["field1", "field2", "field3"],
    "filters": {},
    "transformations": ["sort", "aggregate", "bin", "filter-outliers"]
  },
  "colorField": "",
  "sizeField": "",
  "facetField": "",
  "interactive": true | false,
  "caption": "A plain-English sentence explaining what the chart shows and what the reader should notice.",
  "altText": "A detailed screen-reader description of the chart data.",
  "annotations": [
    { "label": "", "x": null, "y": null, "description": "" }
  ],
  "sortOrder": "ascending | descending | none",
  "zeroBaseline": true | false,
  "theme": "dark",
  "responsive": true,
  "lazyLoad": true
}
```
