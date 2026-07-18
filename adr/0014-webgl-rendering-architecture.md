# ADR-014: WebGL Rendering Architecture and Globe Isolation

## Status
Accepted

## Context
The previous implementation of `GlobeRenderer` was a 652 LOC monolith that mixed React rendering, imperative DOM mutations, raw data arrays as fallbacks, animation loops, window resize listeners, and WebGL resource management all in one file.

Because `globe.gl` operates outside the React component lifecycle using imperative WebGL mutations, failing to strictly isolate it resulted in WebGL context leaks, poor rendering performance, and heavy memory usage. Furthermore, whenever the component unmounted, background animation loops and ResizeObservers would continue firing.

## Decision
1. **Isolation in Canvas**: We created `GlobeCanvas.tsx` to strictly encapsulate the WebGL rendering context. `GlobeCanvas` initializes the `globe.gl` instance, passes rendering controls to parent components using `useImperativeHandle`, and guarantees rigorous cleanup in its destructor (disposing of materials, renderer, controls, and unbinding observers).
2. **Registry and Strategy**: Similar to ADR-013, we implemented the generic `Registry<T>` pattern for `globe.gl`. Data layers (e.g. `CountryHighlightsLayer`, `TradeRoutesLayer`) are strictly defined as Strategies that implement `apply()` and `remove()`, avoiding monolith switch-statements and allowing easy expansion of 3D globe visualization types.
3. **Pure Orchestration**: `GlobeRenderer` was completely refactored to act as a pure UI orchestrator. It manages loading states, explicitly handles empty states without generating synthetic fallback data, and relies on `useIntersectionObserver` to completely defer WebGL context initialization until the globe enters the viewport.

## Consequences
- **Memory Safety**: Disposing of WebGL contexts manually avoids memory leaks across route transitions.
- **Performance**: Intersection observers block expensive 3D rendering contexts from instantiating when off-screen.
- **Maintainability**: `GlobeRenderer` is now 94 LOC. Adding new 3D data visualization modes involves creating a new strategy in `layers/` rather than modifying the renderer.
- **Consistency**: All three main visualization layers (Charts, Maps, Globes) now implement the strict Registry + Strategy orchestration pattern, satisfying the primary architectural principle of separating configuration from rendering logic.
