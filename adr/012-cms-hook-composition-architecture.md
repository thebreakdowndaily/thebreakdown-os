# ADR-012: CMS Hook Composition Architecture

**Date:** 2026-07-09
**Status:** Accepted
**Context:** The `StoryEditor` component had grown into a monolithic View Model, managing over 9 interconnected state variables, handling drag-and-drop transient state, managing autosave timers, and directly managing data persistence. This violated our architecture limits on component size and responsibilities, creating a god-object pattern that was difficult to extend.

## Decision
We decided to strictly decompose the CMS state layer into granular, independent hooks rather than creating a singular monolithic `useStoryEditor` hook.

The composition follows these rules:
1. **Independent Hooks**: `useAutosave`, `useDragAndDrop`, `usePreviewMode`, and `useStoryEditor` manage their own state bounds and do not call each other directly.
2. **Orchestrator Pattern**: The `StoryEditor.tsx` component is designated as the Orchestrator. It instantiates the hooks and mediates interactions between them.
3. **Action Grouping**: Handlers are grouped into cohesive objects (e.g., `editor.actions.*`) to streamline prop drilling and orchestrator mediation, preventing runaway prop-types.
4. **Isolated Rendering**: Block mapping and rendering is isolated to a `BlockCanvas` component to cleanly separate the visual mapping rules from the orchestrator logic.

## Rationale
- **Testability**: Independent hooks like `useAutosave` can be tested without mocking drag-and-drop APIs.
- **Reusability**: `useAutosave` and `usePreviewMode` can now be utilized by future CMS editors (e.g., Knowledge Graph editors, Site Settings editors).
- **Preventing Regressions**: Adhering to the newly added `Rule 26 — Editor Components`, we ensure that future editors will never fall into the same monolithic trap.

## Alternatives Considered
- **Single Monolithic Hook (`useStoryEditor`)**: Rejected because it merely shifts the God Object problem from the component layer to the hook layer.
- **Redux / Global State**: Rejected because CMS editor transient state (drag index, saving status) does not need to bleed into global application state.

## Consequences
- The orchestrator component (`StoryEditor`) must continue to act strictly as a mediator. 
- Any new features (e.g., Revision History) must be built as a separate hook and composed within the orchestrator.
