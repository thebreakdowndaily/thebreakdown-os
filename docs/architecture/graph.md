---
title: Knowledge Graph Architecture
status: active
owner: engineering
last_updated: 2026-07-09
---

# Knowledge Graph Architecture

This document describes the design and flow of the Knowledge Graph within The Breakdown OS.

## Overview

The Knowledge Graph is entirely a **projection** of the canonical `Services` locator registry. It does not possess its own decoupled data store or manually managed state files. It generates typed nodes and edges (`GraphNode`, `GraphEdge`) by aggregating data natively from the underlying domain services.

```mermaid
flowchart TD
    Registry[Service Registry] --> |Injected| GraphService(GraphProjectionService)
    
    subgraph Services
        StoryService[Story Service]
        EntityService[Entity Service]
        TopicService[Topic Service]
        TimelineService[Timeline Service]
    end
    
    Services -.-> Registry
    
    GraphService --> |build()| Nodes[Canonical GraphNodes]
    GraphService --> |build()| Edges[Canonical GraphEdges]
    
    Nodes --> UI[Graph UI Components]
    Edges --> UI
```

## Component Architecture

The visual components are purely presentation-layer consumers of canonical data. They strictly import types from `types/canonical.ts`.

- **`ForceGraph.tsx`**: Renders the global D3-powered force-directed graph.
- **`KnowledgeGraph.tsx`**: A focused component for visualizing the neighborhood of a specific entity or topic.
- **`ExploreConnections.tsx`**: A sub-component providing interactive pathfinding between localized nodes.

## Legacy Considerations

We have formally deprecated and removed the "Graph V1" system (ADR-008). 
- Do not use standalone `buildGraph.ts` or `graphData.ts` files. 
- Do not bypass `bootstrapServices()` when accessing graph data. 
- Do not import `GraphNode` or `GraphEdge` from localized graph utility directories. All types must originate from `types/canonical.ts`.
