# ADR-011: Chart Rendering Architecture

**Status:** Accepted  
**Date:** 2026-07-09  
**Component:** Frontend / Visualizations / `ChartRenderer.tsx`

## Context

The `ChartRenderer.tsx` component had evolved into a "God Component", reaching 1431 lines of code. It was responsible for React component lifecycle orchestration, massive data formatting logic, and exact D3 coordinate calculation/rendering for 18 distinct chart types.

### Why the monolith existed

Initially, starting with one or two basic charts (like line and bar), it was easiest to embed D3 logic directly within a single `useEffect` or `drawChart` function using a standard `switch` statement. As more complex charts were requested (Heatmaps, Sankeys, Streamgraphs, Pack layouts), they were appended to the existing switch cases. The component simply grew organically over time until it became an unmaintainable bottleneck where a bug fix in one chart risked regressing others due to shared scope and variables.

## Decision

We have decoupled the orchestration of chart data from the actual rendering implementation by moving to a **Registry + Strategy Pattern**.

1. **Strategy Pattern**: The inner D3 logic has been extracted into 17 independent strategies (e.g. `renderers/area.ts`, `renderers/sankey.ts`). Each exports a pure function that takes the chart container and typed data and renders the correct SVG output.
2. **Registry Pattern**: A `registry.ts` file maintains a strict dictionary mapping chart type strings to their respective implementation strategies.
3. **Container**: `ChartRenderer.tsx` now purely acts as the Container component that reads the current chart type, looks up the function in the registry, and executes it.

### Why Registry was chosen

The Registry pattern provides an O(1) lookup map that is strongly typed and statically analyzable. It cleanly separates the configuration/mapping from the execution. If a new chart is added, it requires creating a single isolated file and updating one line in the registry—without ever touching the `ChartRenderer.tsx` container again.

### Why Strategy Pattern

D3 rendering is fundamentally procedural (modifying DOM elements based on data structures). A Strategy pattern allows us to define a common interface `(container: SVGGElement, data: any, dimensions: Dimensions, theme: Theme) => void` for every visual representation. This means `ChartRenderer.tsx` doesn't need to know *how* to draw a Sankey diagram, only *who* knows how to draw it.

### Alternatives considered

1. **React-based wrappers (e.g. Recharts or Visx)**
   - *Why rejected:* The Breakdown OS relies heavily on custom, complex bespoke data stories (like dynamic Sankeys with specific storytelling annotations) which generic wrapper libraries cannot easily provide. We need bare-metal D3 control.
2. **Splitting into separate React components (`<LineChart />`, `<BarChart />`)**
   - *Why rejected:* The API returns a dynamic array of blocks from the CMS where the visualization type is just a string payload (`{ type: "chart", chartType: "line" }`). A single `<ChartRenderer />` entry point is necessary for the main CMS block parser. It is simpler to use pure D3 functions rather than creating 18 separate React components that just wrap D3.

## Future extension points

By moving to a Registry + Strategy Pattern, the architecture is now set up to easily support a **RendererFactory** in Version 2. This will allow the platform to support:
- `SVG` renderers (current)
- `Canvas` renderers (for massive datasets)
- `WebGL` renderers (for 3D charts)

The factory will dynamically select the appropriate implementation based on data size and the device's hardware acceleration capabilities without altering the parent application logic.
