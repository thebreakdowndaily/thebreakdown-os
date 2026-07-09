---
adr: "0008"
title: Remove Legacy Graph V1
status: accepted
date: 2026-07-09
---

# ADR 0008 — Remove Legacy Graph V1

## Status
Accepted

## Context

The platform's `lib/graph/` directory contained a large "Graph V1" system (`graphData.ts`, `buildGraph.ts`, `entityExtraction.ts`, etc.). This legacy system manually parsed mock data and built a graph independently of the established `Services` registry pattern (ADR 0003). 

Additionally, the active UI components were importing duplicate graph types from `lib/graph/graphTypes.ts` instead of utilizing the single source of truth (`types/canonical.ts`). Parallel unused view-models (`lib/view-models/entity.ts` and `lib/topicViewModel.ts`) also lingered in the codebase.

Retaining these files caused architectural confusion, bloated the codebase, and created a risk of developers relying on a deprecated pattern that bypassed `bootstrapServices()`.

## Decision

We decided to completely remove the legacy Graph V1 system and its dead dependencies:
- Deleted all V1 graph core files and duplicate UI mini-components (`GraphMini.tsx`, `TrendingGraphMini.tsx`).
- Deleted unused view-models.
- Refactored all surviving graph UI components (`ForceGraph.tsx`, `KnowledgeGraph.tsx`, `ExploreConnections.tsx`) to import `GraphNode` and `GraphEdge` directly from `types/canonical.ts`.

The active `GraphProjectionService` (`lib/graph/graphService.ts`) now serves as the only operational graph interface in the repository, resolving data strictly through the injected memory services.

## Consequences

**Positive:**
- Enforces the single source of truth for domain types (`types/canonical.ts`).
- Eliminates technical debt and architectural ambiguity.
- Reduces the repository footprint and guarantees no new features will be accidentally built on the deprecated data-fetching pattern.

**Negative:**
- Any future, out-of-tree branches that relied heavily on the V1 mock graph architecture will face substantial merge conflicts and require refactoring to use the canonical `Services` locator instead.
