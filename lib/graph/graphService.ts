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

  async build(): Promise<Graph> {
    return this.services.graph.build();
  }

  async getNode(id: string): Promise<GraphNode | undefined> {
    return this.services.graph.getNode(id);
  }

  async getConnections(nodeId: string, options?: { maxDepth?: number; relation?: RelationType }): Promise<ConnectionResult[]> {
    return this.services.graph.getConnections(nodeId, options);
  }

  async getPath(from: string, to: string): Promise<GraphEdge[]> {
    return this.services.graph.getPath(from, to);
  }

  async getTrending(limit: number): Promise<Array<{ from: GraphNode; to: GraphNode }>> {
    const results = await this.services.graph.getTrending(limit);
    return results.map((r: any) => ({ from: r.from, to: r.to }));
  }

  async getStats() {
    return this.services.graph.getStats();
  }

  async project(options?: { types?: GraphNode['type'][]; relations?: RelationType[]; minConfidence?: number; maxNodes?: number }) {
    return this.services.graph.project(options);
  }
}
