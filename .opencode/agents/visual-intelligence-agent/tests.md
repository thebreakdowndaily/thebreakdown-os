# Visual Intelligence Engine — Tests

## Test Categories

### Gate Tests

| Test | Input | Expected Output | Priority |
|---|---|---|---|
| G-01 | Story with no numbers, geography, timeline, or process | `gateResult: "text_only"` | Critical |
| G-02 | Story with GDP growth rates over 10 years | `gateResult: "visual_required"`, type: chart | Critical |
| G-03 | Story about a specific state election | `gateResult: "visual_required"`, type: map | Critical |
| G-04 | Story about international trade dispute | `gateResult: "visual_required"`, type: globe | Critical |
| G-05 | Story about a policy process (e.g., how a bill becomes law) | `gateResult: "visual_required"`, type: svg | High |
| G-06 | Story with budget allocation breakdown | `gateResult: "visual_required"`, type: chart (treemap/sankey) | Critical |
| G-07 | Op-ed with no data | `gateResult: "text_only"` | High |
| G-08 | Story with fewer than 5 data points | Use bar chart or infographic, not complex chart | Medium |

### Chart Selector Tests

| Test | Data | Expected Chart | Priority |
|---|---|---|---|
| C-01 | GDP growth 2014–2024 (year → value) | Line chart | Critical |
| C-02 | State-wise literacy rates (state → %) | Horizontal bar (sorted) | Critical |
| C-03 | Budget allocation across ministries (hierarchical) | Treemap | Critical |
| C-04 | Import/export between 5 countries (matrix) | Chord diagram | High |
| C-05 | Temperature readings across 30 cities over 12 months | Heatmap | High |
| C-06 | Election seats won by party (categories → count) | Horizontal bar | Critical |
| C-07 | Income distribution across population (%) | Histogram | Medium |
| C-08 | Test score comparison: 2020 vs 2024 (entity → two values) | Slope chart | Medium |
| C-09 | 3 data points only | Bar chart (not pie, not complex) | Medium |

### SVG Generator Tests

| Test | Content | Expected SVG Type | Priority |
|---|---|---|---|
| S-01 | Ministry structure with departments and divisions | org-tree | Critical |
| S-02 | How a bill becomes law (legislative process) | flowchart | Critical |
| S-03 | Taxpayer money flow to different schemes | sankey | Critical |
| S-04 | Eligibility criteria for a government scheme | decision-tree | High |
| S-05 | Budget breakdown by department | treemap | High |
| S-06 | >20 nodes in hierarchy | Split into multiple SVGs | Medium |

### Map Generator Tests

| Test | Geography | Expected Map Type | Priority |
|---|---|---|---|
| M-01 | State-wise GDP data for India | india-state | Critical |
| M-02 | District-wise health metrics | india-district | High |
| M-03 | Global internet penetration by country | world-choropleth | Critical |
| M-04 | Trade between India and 10 countries | trade-routes | High |
| M-05 | Internal migration from UP to Delhi | migration | Medium |
| M-06 | Conflicting border regions | conflict | Medium |

### 3D Globe Tests

| Test | Story | Expected Globe Type | Priority |
|---|---|---|---|
| Gb-01 | India's trade agreements with 20 countries | trade-routes | Critical |
| Gb-02 | Global diplomatic visits by PM | diplomatic-visits | High |
| Gb-03 | Submarine cable landing points in India | submarine-cables | Medium |
| Gb-04 | Single-country domestic story | No globe (use map) | Critical |
| Gb-05 | Indian state-level story | No globe (use map) | Critical |
| Gb-06 | Global military alliances | country-highlights | Medium |

### Animation Tests

| Test | Content | Expected Animation Type | Priority |
|---|---|---|---|
| A-01 | MGNREGA budget: Centre → State → District → Village → Worker | cascade | High |
| A-02 | Election results updating over counting rounds | data-animation | High |
| A-03 | Territorial changes over decades | map-animation | Medium |
| A-04 | >10 steps in animation | Reject, simplify to max 10 steps | Medium |
| A-05 | prefers-reduced-motion: reduce | Static fallback provided | Critical |

### Infographic Tests

| Test | Content | Expected Card Type | Priority |
|---|---|---|---|
| I-01 | Before/after policy change | comparison | High |
| I-02 | Single key number (e.g., ₹5L Cr budget) | fact | Medium |
| I-03 | 4 key milestones | timeline (max 8 events) | High |
| I-04 | 6 key stats about a topic | statistics | Medium |
| I-05 | Direct quote from an interview | quote | Medium |
| I-06 | 4-step process explanation | explainer | High |

### Accessibility Tests

| Test | Check | Priority |
|---|---|---|
| AX-01 | Every visual has non-empty altText | Critical |
| AX-02 | Every complex visual has longDescription | High |
| AX-03 | Interactive visuals are keyboard-navigable | Critical |
| AX-04 | highContrast flag is true | High |
| AX-05 | reducedMotion flag is true | Critical |
| AX-06 | colorBlindSafe flag is true | Medium |
| AX-07 | Visuals readable at 200% text zoom | Medium |
| AX-08 | No visual relies solely on color to convey meaning | Critical |

### Performance Tests

| Test | Check | Priority |
|---|---|---|
| P-01 | SVG preferred over PNG for diagrams | High |
| P-02 | lazyLoad: true on all visuals | Critical |
| P-03 | responsive: true on all visuals | High |
| P-04 | No duplicate asset IDs | Medium |
| P-05 | Chart data < 1000 points uses SVG; >1000 uses Canvas | Medium |

### Integration Tests

| Test | Scenario | Expected | Priority |
|---|---|---|---|
| IT-01 | Explainer workflow with data | Visual plan with 4–6 visuals | Critical |
| IT-02 | Breaking news with no data | Visual plan empty or minimal | Critical |
| IT-03 | Investigation with complex data | Visual plan with chart + map + SVG | High |
| IT-04 | Data story with large dataset | Visual plan with heatmap or aggregated chart | High |
| IT-05 | Fact-check with no geographic data | Visual plan without maps/globes | Medium |
