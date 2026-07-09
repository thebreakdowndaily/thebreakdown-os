/**
 * @deprecated Use `services.graph` (GraphProjectionService) instead of instantiating GraphService.
 * This class wraps the registered GraphProjectionService for backward compatibility.
 */
import type { Graph, GraphNode, GraphEdge, RelationType } from '@/types/canonical';
import type { Services } from '@/services/registry';

interface ConnectionResult {
  node: GraphNode;
  edge: GraphEdge;
  depth: number;
}

export class GraphService {
  private services: Services;

  constructor(services: Services) {
    this.services = services;
  }

  build(): Graph {
    return this.services.graph.build();
  }

  getNode(id: string): GraphNode | undefined {
    return this.services.graph.getNode(id);
  }

  getConnections(nodeId: string, options?: { maxDepth?: number; relation?: RelationType }): ConnectionResult[] {
    return this.services.graph.getConnections(nodeId, options);
  }

  getPath(from: string, to: string): GraphEdge[] {
    return this.services.graph.getPath(from, to);
  }

  getTrending(limit: number): Array<{ from: GraphNode; to: GraphNode }> {
    const results = this.services.graph.getTrending(limit);
    return results.map(r => ({ from: r.from, to: r.to }));
  }

  getStats() {
    return this.services.graph.getStats();
  }

  project(options?: { types?: GraphNode['type'][]; relations?: RelationType[]; minConfidence?: number; maxNodes?: number }) {
    return this.services.graph.project(options);
  }
}
