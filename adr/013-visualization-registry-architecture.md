# ADR 013: Visualization Registry Architecture

**Date:** 2026-07-09

**Status:** Accepted

## Context

The Breakdown OS heavily relies on data visualization (Charts, Maps, Globes, Timelines). Historically, these components (e.g., `ChartRenderer.tsx`, `MapRenderer.tsx`) evolved into massive "God Objects" or monoliths, often exceeding 500-1500 lines of code.

These legacy visualizers suffered from the following issues:
1. **Imperative DOM Manipulation:** Frequent use of raw D3 selections, `svg.appendChild()`, and direct DOM mutations bypassed React's virtual DOM, causing layout thrashing and making state synchronization difficult.
2. **Tangled Responsibilities:** Single files simultaneously fetched data, computed scales/projections, defined SVG elements, and bound event listeners (hover/click).
3. **Bloated Switch Statements:** Supporting new chart types or map types required modifying massive `switch` blocks, violating the Open-Closed Principle.
4. **Hardcoded Data:** Configuration, themes, and geo-datasets (e.g., world or country GeoJSON) were deeply embedded in the rendering logic.

To scale The Breakdown OS into a world-class Knowledge Operating System, visualization components must be robust, testable, and easily extensible.

## Decision

We have adopted a **Declarative, Registry-Driven Visualization Architecture** based on the separation of five distinct concerns:

1. **Data:** Raw metrics, metrics parsing, caching, and serialization (e.g., `useMapData`, `useChartData`).
2. **Configuration:** Thematic styling, type mapping, and rendering scales/projections (e.g., `theme.ts`, `mapTypes.ts`).
3. **Rendering:** Natively generating the UI (SVG/HTML) exclusively through declarative React elements (e.g., `<ChoroplethLayer />`, `<BarChart />`), entirely eliminating imperative DOM mutations.
4. **Interaction:** Event orchestration, hovering, zooming, and clicking, managed externally or passed down as callbacks (e.g., `MapControls.tsx`).
5. **Presentation:** Overlays, tooltips, legends, and layout wrappers, completely uncoupled from the core drawing logic (e.g., `TooltipLayer.tsx`, `Legend.tsx`).

To support this decoupled architecture, we enforce the **Registry Pattern** (`interface Registry<T>`) to look up specific visualization layers or projection strategies dynamically.

## Consequences

### Positive
- **Extensibility:** Adding a new chart type, layer, or projection only requires registering a new module, rather than modifying core renderers.
- **Maintainability:** Visualization components drop drastically in complexity (e.g., `MapRenderer.tsx` dropped from 559 LOC to 88 LOC).
- **React Compatibility:** Fully relying on declarative React for rendering (instead of `d3.append`) integrates seamlessly with React 19's concurrent features, Suspense, and SSR capabilities.
- **Testability:** Data parsing hooks, configuration dictionaries, and pure presentation components can be unit-tested in complete isolation.

### Negative
- **Indirection:** Developers must now look up implementations in a registry rather than following a linear flow in a single file.
- **Initial Refactoring Cost:** Migrating legacy imperative visualizers requires significant effort to untangle deeply coupled logic.

## Reference
- See `ARCHITECTURE.md` for the overarching Visualization Engine rules and generic `Registry<T>` interface definition.
