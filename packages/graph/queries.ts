import { GraphNode, GraphStore, TraversalOptions, TraversalResult } from "./types";

export class GraphQueries {
  constructor(private readonly store: GraphStore) {}

  /**
   * Performs a graph traversal from a starting node.
   * Returns a TraversalResult with nodes in a deterministic order (sorted by node ID),
   * excluding the starting node itself.
   */
  public traverse(nodeId: string, options: TraversalOptions = {}): TraversalResult {
    const maxDepth = options.maxDepth ?? Infinity;
    const direction = options.direction ?? "outgoing";
    const allowedTypes = options.relationshipTypes ? new Set(options.relationshipTypes) : null;
    const strategy = options.strategy ?? "BFS";

    if (strategy === "DFS") {
      throw new Error("DFS traversal strategy is not yet implemented.");
    }

    const emptyResult: TraversalResult = {
      nodes: [],
      edgesTraversed: 0,
      depthReached: 0,
      truncated: false,
    };

    if (!this.store.exists(nodeId)) {
      return emptyResult;
    }

    const visited = new Set<string>();
    visited.add(nodeId);

    let currentLevel = [nodeId];
    let depth = 0;
    let edgesTraversed = 0;

    const result = new Set<string>();

    while (currentLevel.length > 0 && depth < maxDepth) {
      const nextLevel = new Set<string>();

      for (const currId of currentLevel) {
        let edges = [];
        if (direction === "outgoing" || direction === "both") {
          edges.push(...this.store.getOutgoing(currId));
        }
        if (direction === "incoming" || direction === "both") {
          // For incoming edges, the "next" node is the sourceId
          edges.push(...this.store.getIncoming(currId));
        }

        for (const edge of edges) {
          if (allowedTypes && !allowedTypes.has(edge.type)) {
            continue;
          }

          edgesTraversed++;

          // Determine the adjacent node based on direction of traversal
          const adjacentId = edge.sourceId === currId ? edge.targetId : edge.sourceId;

          if (!visited.has(adjacentId) && this.store.exists(adjacentId)) {
            visited.add(adjacentId);
            nextLevel.add(adjacentId);
            result.add(adjacentId);
          }
        }
      }

      currentLevel = Array.from(nextLevel);
      if (currentLevel.length > 0) {
        depth++;
      }
    }

    // Resolve nodes and sort deterministically
    const nodes = Array.from(result)
      .map((id) => this.store.getNode(id)!)
      .sort((a, b) => a.id.localeCompare(b.id));

    return {
      nodes,
      edgesTraversed,
      depthReached: depth,
      truncated: currentLevel.length > 0 && depth === maxDepth,
    };
  }
}
