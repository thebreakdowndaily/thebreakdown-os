# ADR 0001: Core KOS Architecture Freeze

**Status:** Accepted
**Date:** 2026-07-17

## Context

The Knowledge Operating System (KOS) core platform has completed its foundational engineering milestones (MS1 through MS5). The platform is designed to transform unstructured authored content into a strictly typed, semantic experience that is framework-agnostic up to the final rendering layer.

To prevent architectural erosion, we are freezing the core platform layer structure. Future development will focus on vertical product domains (Visualizations, Discovery, Learning, Authoring, Operations) rather than introducing new horizontal foundation layers.

## Decision

We will strictly enforce a five-stage unidirectional pipeline. Each layer consumes a single upstream contract and exposes a single downstream contract. 

### 1. Layer Responsibilities & Public APIs

| Package | Responsibility | Input | Public API (Output) |
|---------|----------------|-------|----------------------|
| **Compiler** (`packages/compiler/`) | Parses, normalizes, and validates authored content against strict schemas. Extracts embedded capabilities. | Authored Content (Raw) | `KnowledgeManifest` |
| **Graph** (`packages/graph/`) | Models semantic relationships between manifests as a normalized, queryable DAG without runtime logic. | `KnowledgeManifest[]` | `GraphStore` (Immutable Graph) |
| **Engine** (`packages/engine/`) | Performs deterministic runtime reasoning (journey resolution, recommendation ranking, prerequisites) on the graph. | `GraphStore` | `ResolvedKnowledgeSession` |
| **KXE** (`packages/kxe/`) | Orchestrates experience progression and interaction state. Exposes a reactive state machine. | `ResolvedKnowledgeSession`| `ExperienceState` (`dispatch`/`subscribe`) |
| **Renderer** (`packages/renderer/`) | Adapt KXE state to React UI. Replaces conditional rendering with dynamic capability resolution. | `ExperienceState` | Declarative React UI |

### 2. Dependency Rules

To maintain strict separation of concerns, the following import rules are enforced globally:
- **Renderer** must **not** import from `Graph` or `Engine`. It only consumes `ExperienceState` from `KXE`.
- **KXE** must **not** import from `Graph`. It relies entirely on the semantic output of `Engine` (`ResolvedKnowledgeSession`).
- **Engine** must **not** import UI, rendering, or specific client-side interaction state logic.
- **Graph** must **not** import from `Engine` or `Compiler` internals, operating solely on the `KnowledgeManifest` contract.

### 3. Extension Points

New features must be implemented via the designated extension points for each layer:
- **Compiler:** Extend `ManifestBuilder` strategies or `Capability` types.
- **Graph:** Add new semantic relationship types (e.g. `Supports`, `Contradicts`).
- **Engine:** Inject new ranking strategies (`RankingStrategy`), journey resolvers, or policy versions.
- **KXE:** Register new `KXEPlugin` implementations to manage opaque domain-specific interaction state.
- **Renderer:** Register new `Renderer` implementations dynamically mapped to explicit `Capability` types in `RendererRegistry`.

### 4. Architectural Invariants

- **Immutability:** State emitted by `Engine` and `KXE` (`getState()`) is deeply immutable (`Readonly<T>`). Direct mutation of `ExperienceState` or `ResolvedKnowledgeSession` is prohibited.
- **Determinism:** The `Compiler` and `Engine` must produce identical outputs for the same inputs. `KXE` reducers must be pure functions.
- **Framework Independence:** KOS core logic (MS1-MS4) is strictly decoupled from React, DOM, or browser environments. `packages/renderer/` acts as the exclusive framework bridge.
- **Referential Transparency:** Renderers must be pure functions of the immutable `ExperienceState`.

## Consequences

- The foundational logic is robust, tested ($\ge 90\%$ coverage per package), and strictly typed.
- Extending vertical capabilities (e.g., interactive maps, quizzes) requires no changes to the core semantic engines.
- Engineers can reason about state and rendering entirely in isolation.
