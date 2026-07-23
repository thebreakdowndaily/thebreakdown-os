# Timeline Plugin (Vertical 001)

This is the reference vertical plugin for the Knowledge Operating System (KOS). It provides an interactive chronological timeline of historical events by consuming the frozen core architectures.

## Architecture

This plugin exercises all extension points established in the KOS core:

1. **Compiler (Implicit):** Relies on `Capability.Timeline` and the generic `temporal` metadata fields on `KnowledgeManifest`s.
2. **Graph (Implicit):** Relies on `before`, `after`, and `contemporary` graph edge semantics.
3. **Engine (`engine/`):** Supplies `TimelineEnginePlugin` to the `KnowledgeEngine`. It traverses the active graph to assemble a chronologically sorted sequence of `TimelineEvent`s, saving them to `session.extensions.timeline`.
4. **KXE (`kxe/`):** Supplies `TimelineKXEPlugin` to the `KnowledgeExperienceEngine`. Manages namespaced interaction state (`timeline/selectYear`, `timeline/setZoom`).
5. **Renderer (`renderer/`):** Provides a React component `TimelineRenderer` dynamically injected by the `RendererRegistry` whenever the `timeline` capability is active.
