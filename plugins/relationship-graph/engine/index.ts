// plugins/relationship-graph/engine/index.ts

import { createEnginePlugin, EnginePluginContext } from "../../../packages/plugin-sdk";
import { relationshipGraphManifest } from "../manifest";
import { TraversalPolicy, RankingStrategy } from "../../../packages/graph/policy";
import { GraphStore, GraphNode, GraphEdge } from "../../../packages/graph/types";

/**
 * Extension data returned by the Relationship Graph engine.
 */
export interface RelationshipGraphExtension {
  /** The root node from which traversal started. */
  rootNode: GraphNode;
  /** All nodes reachable under the traversal policy (including root). */
  nodes: GraphNode[];
  /** All edges traversed between the included nodes. */
  edges: GraphEdge[];
  /** Deterministic paths from root to each node (array of node ids). */
  paths: Record<string, string[]>;
  /** Simple statistics useful for UI and debugging. */
  statistics: {
    nodeCount: number;
    edgeCount: number;
    traversalDepth: number;
    cyclesDetected: number;
  };
}

/**
 * Default traversal policy used when none is provided by the KXE.
 */
const defaultPolicy: TraversalPolicy = {
  maxDepth: 3,
  maxNeighbors: 10,
  relationshipTypes: undefined,
  rankingStrategy: RankingStrategy.BreadthFirst,
  includeCycles: false,
};

/**
 * Performs a deterministic BFS traversal respecting the supplied TraversalPolicy.
 * The algorithm never mutates the underlying GraphStore or any node data.
 */
function traverse(
  store: GraphStore,
  rootId: string,
  policy: TraversalPolicy
): RelationshipGraphExtension {
  const rootNode = store.getNode(rootId);
  if (!rootNode) {
    throw new Error(`Root node ${rootId} not found in graph`);
  }

  const visited = new Set<string>();
  const nodeQueue: { id: string; depth: number; path: string[] }[] = [{ id: rootId, depth: 0, path: [rootId] }];
  const resultNodes: GraphNode[] = [];
  const resultEdges: GraphEdge[] = [];
  const paths: Record<string, string[]> = {};
  let cycles = 0;
  let maxDepthReached = 0;

  while (nodeQueue.length > 0) {
    const current = nodeQueue.shift()!;
    if (visited.has(current.id)) {
      if (policy.includeCycles) cycles++;
      continue;
    }
    visited.add(current.id);
    const node = store.getNode(current.id)!;
    resultNodes.push(node);
    paths[node.id] = current.path;
    maxDepthReached = Math.max(maxDepthReached, current.depth);

    if (current.depth >= policy.maxDepth) continue;

    // Determine outgoing edges respecting optional relationship type filter
    const outgoing = store.getOutgoing(current.id).filter(e =>
      !policy.relationshipTypes || policy.relationshipTypes.includes(e.type)
    );

    // Apply neighbor limit
    const limited = outgoing.slice(0, policy.maxNeighbors);
    for (const edge of limited) {
      const neighborId = edge.targetId;
      if (visited.has(neighborId)) {
        if (policy.includeCycles) {
          resultEdges.push(edge);
          cycles++;
        }
      } else {
        resultEdges.push(edge);
        const nextPath = [...current.path, neighborId];
        nodeQueue.push({ id: neighborId, depth: current.depth + 1, path: nextPath });
      }
    }
  }

  // Ensure deterministic ordering by sorting by node id
  resultNodes.sort((a, b) => a.id.localeCompare(b.id));
  resultEdges.sort((a, b) => a.sourceId.localeCompare(b.sourceId) || a.targetId.localeCompare(b.targetId));

  return {
    rootNode,
    nodes: resultNodes,
    edges: resultEdges,
    paths,
    statistics: {
      nodeCount: resultNodes.length,
      edgeCount: resultEdges.length,
      traversalDepth: maxDepthReached,
      cyclesDetected: cycles,
    },
  };
}

export const RelationshipGraphEnginePlugin = createEnginePlugin<RelationshipGraphExtension>({
  manifest: relationshipGraphManifest,
  resolve: (ctx: EnginePluginContext) => {
    // Extract optional policy from the context (if provided)
    const policy: TraversalPolicy = (ctx.context as any).traversalPolicy ?? defaultPolicy;

    // Emit diagnostics – structured object for later logging
    ctx.diagnostics?.push({
      type: "traversalStart",
      plugin: relationshipGraphManifest.id,
      rootNodeId: ctx.currentNode.id,
      policy,
    });

    const extension = traverse(ctx.graph, ctx.currentNode.id, policy);

    ctx.diagnostics?.push({
      type: "traversalComplete",
      plugin: relationshipGraphManifest.id,
      stats: extension.statistics,
    });

    return extension;
  },
});
