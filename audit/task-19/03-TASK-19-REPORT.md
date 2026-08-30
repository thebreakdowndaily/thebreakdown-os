# TASK-19 Evidence Graph Architecture & Design Summary

## Objective
Implement a canonical Evidence Graph capable of modelling Claims, Evidence, and Sources as interconnected graph nodes with typed semantic edges, establishing a foundational Knowledge Model for The Breakdown platform.

## Design Decisions

1. **Graph Nodes Types**: 
   - `StoryNode`: Acts as the anchor/entry point in the Knowledge Graph for narrative surfaces.
   - `ClaimNode`: Represents an atomic, verified (or refuted) assertion.
   - `EvidenceNode`: Represents the underlying data or explanation supporting a claim.
   - `SourceNode`: The root authority cited.

2. **Semantic Edges**:
   - `references`: Used to link Stories to Claims and Stories to Sources.
   - `verifies` / `refutes`: Directional links from Evidence to Claim, determining validation status.
   - `cites`: Links Evidence or Claims to their provenance (Source).

3. **Data Hydration**:
   - The graph is hydrated dynamically via `buildEvidenceGraph(stories)` from the CMS Store.
   - Lineage isolation is supported via `getClaimLineage(graph, claimId)`, mapping the exact validation chain (Story -> Claim <- Evidence -> Source).

4. **Visualizer**:
   - Created `EvidenceGraphVisualizer`, a presentation-only component displaying columns for Stories, Claims, Evidence, and Sources, mapped visually using platform tokens (emerald for verified, amber for misleading).

## API & Endpoints
The graph is served via the `app/api/graph/evidence` endpoint, supporting the `claimId` query parameter to filter lineages.

This fulfills the architectural requirements set out in the platform roadmap.
