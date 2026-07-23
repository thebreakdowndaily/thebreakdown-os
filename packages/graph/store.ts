import { GraphEdge, GraphNode, GraphStore } from "./types";

/**
 * A passive, strictly immutable data model for the Knowledge Graph.
 * Internally uses Adjacency Maps for O(1) lookups and traversal.
 */
export class ImmutableGraphStore implements GraphStore {
  constructor(
    private readonly nodes: ReadonlyMap<string, GraphNode>,
    private readonly outgoing: ReadonlyMap<string, GraphEdge[]>,
    private readonly incoming: ReadonlyMap<string, GraphEdge[]>
  ) {}

  public exists(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): GraphNode[] {
    // Return deterministic (sorted by ID) array of nodes
    return Array.from(this.nodes.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  public getAllEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];
    for (const outEdges of this.outgoing.values()) {
      edges.push(...outEdges);
    }
    // Sort edges deterministically: sourceId, then targetId, then type
    return edges.sort((a, b) => {
      if (a.sourceId !== b.sourceId) return a.sourceId.localeCompare(b.sourceId);
      if (a.targetId !== b.targetId) return a.targetId.localeCompare(b.targetId);
      return a.type.localeCompare(b.type);
    });
  }

  public getOutgoing(nodeId: string): GraphEdge[] {
    return this.outgoing.get(nodeId) || [];
  }

  public getIncoming(nodeId: string): GraphEdge[] {
    return this.incoming.get(nodeId) || [];
  }
}
