# Relationship Graph Plugin

## Overview

The Relationship Graph plugin provides deterministic semantic‑graph exploration. It validates the core graph using a reusable `TraversalPolicy` and renders the result with a simple hierarchical view.

## Extension Points Used

| Layer            | Details |
|------------------|---------|
| **Compiler**     | none |
| **Graph**        | existing relationships (no new types) |
| **Engine**       | `RelationshipGraphExtension` session extension |
| **KXE**          | `relationshipGraph/*` action namespace (focusNode, expandNode, setDepth, setRelationshipFilter, setLayout, highlightPath, clearHighlight, setPolicy) |
| **Renderer**     | hierarchical visualization (future radial / force‑directed layouts) |

## Capabilities

- `Capability.RelationshipGraph`

## Files

- `manifest.ts` – plugin manifest
- `engine/index.ts` – deterministic BFS traversal
- `kxe/index.ts` – KXE reducer and state
- `renderer/index.tsx` – hierarchical UI
- `index.ts` – single `KOSPlugin` export

## Testing (planned)

- SDK contract tests
- Engine unit tests (deterministic output)
- KXE reducer tests
- Renderer snapshot tests
- Performance benchmark

---

*Implemented per the approved implementation plan.*
