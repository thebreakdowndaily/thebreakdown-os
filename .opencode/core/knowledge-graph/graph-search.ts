/**
 * THE BREAKDOWN OS — Knowledge Graph Search
 *
 * Graph search, traversal, path finding, and structured queries.
 *
 * Supports queries like:
 *   "Show every scheme managed by the Ministry of Rural Development"
 *   "Show every story mentioning RBI since 2020"
 *   "Find all laws related to data privacy"
 *   "List every court case involving MGNREGA"
 *   "Show budgets connected to renewable energy"
 */

import { EntityManager } from './entity-manager';
import { RelationshipManager } from './relationship-manager';
import type { GraphNode, GraphEdge, GraphConfig, GraphQuery, QueryResult, RelatedResult } from './types';

export class GraphSearch {
  private entities: EntityManager;
  private relationships: RelationshipManager;

  constructor(config: GraphConfig, entities: EntityManager, relationships: RelationshipManager) {
    this.entities = entities;
    this.relationships = relationships;
  }

  /**
   * Full-text search across all nodes and edges.
   * Returns matching nodes, their relationships, and contextual paths.
   */
  async search(query: string): Promise<QueryResult> {
    const q = query.toLowerCase().trim();

    // 1. Find matching nodes
    const nodes = await this.entities.find(q);

    // 2. For each matching node, find connected edges
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges: GraphEdge[] = [];
    const visitedEdges = new Set<string>();

    for (const nodeId of nodeIds) {
      const connectedEdges = await this.relationships.getEdgesForNode(nodeId);
      for (const edge of connectedEdges) {
        if (!visitedEdges.has(edge.id)) {
          visitedEdges.add(edge.id);
          edges.push(edge);
        }
      }
    }

    // 3. Build path context
    const paths = edges.map(e => ({
      from: e.from,
      relationship: e.relationship,
      to: e.to,
      confidence: e.confidence,
    }));

    return {
      nodes: Array.from(nodes),
      edges,
      paths,
      totalCount: nodes.length,
    };
  }

  /**
   * Find entities by name/alias (shorthand for agents).
   */
  async findEntity(query: string): Promise<GraphNode[]> {
    return this.entities.find(query);
  }

  /**
   * Find related nodes up to a given depth.
   * Returns a categorized result for website integration.
   */
  async findRelated(nodeId: string, depth: number = 2): Promise<RelatedResult> {
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];
    visited.add(nodeId);

    const result: RelatedResult = {
      people: [],
      organizations: [],
      countries: [],
      laws: [],
      schemes: [],
      budgets: [],
      reports: [],
      events: [],
      courtCases: [],
      articles: [],
      allEdges: [],
    };

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth >= depth) continue;

      const edges = await this.relationships.getEdgesForNode(current.id);
      for (const edge of edges) {
        if (!result.allEdges.find(e => e.id === edge.id)) {
          result.allEdges.push(edge);
        }

        const neighborId = edge.from === current.id ? edge.to : edge.from;
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);

        const neighbor = await this.entities.get(neighborId);
        if (!neighbor || !neighbor.active) continue;

        queue.push({ id: neighborId, depth: current.depth + 1 });

        switch (neighbor.type) {
          case 'person': result.people.push(neighbor); break;
          case 'organization':
          case 'company': result.organizations.push(neighbor); break;
          case 'country': result.countries.push(neighbor); break;
          case 'law': result.laws.push(neighbor); break;
          case 'scheme': result.schemes.push(neighbor); break;
          case 'budget': result.budgets.push(neighbor); break;
          case 'report': result.reports.push(neighbor); break;
          case 'event': result.events.push(neighbor); break;
          case 'court-case': result.courtCases.push(neighbor); break;
          case 'article': result.articles.push(neighbor); break;
        }
      }
    }

    // Deduplicate
    for (const key of Object.keys(result) as Array<keyof RelatedResult>) {
      if (key === 'allEdges') continue;
      const arr = result[key] as GraphNode[];
      const seen = new Set<string>();
      result[key] = arr.filter(n => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      }) as any;
    }

    return result;
  }

  /**
   * Get chronological edges for a node (events, timeline data).
   */
  async getTimeline(nodeId: string): Promise<GraphEdge[]> {
    const allEdges = await this.relationships.getEdgesForNode(nodeId);

    // Filter to time-relevant relationships
    const timelineEdges = allEdges.filter(e =>
      ['caused_by', 'influenced_by', 'created_by', 'approved_by', 'references'].includes(e.relationship)
    );

    // Sort by firstObserved (chronological)
    timelineEdges.sort((a, b) => {
      if (a.firstObserved! < b.firstObserved!) return -1;
      if (a.firstObserved! > b.firstObserved!) return 1;
      return 0;
    });

    return timelineEdges;
  }

  /**
   * Execute a structured graph query.
   */
  async executeQuery(query: GraphQuery): Promise<QueryResult> {
    // Filter by node type
    let nodes = await this.entities.getByType(query.nodeType || '');

    // Filter by edge relationship
    if (query.edgeType) {
      const edges = await this.relationships.getByType(query.edgeType);
      const connectedNodeIds = new Set<string>();
      for (const edge of edges) {
        connectedNodeIds.add(edge.from);
        connectedNodeIds.add(edge.to);
      }
      nodes = nodes.filter(n => connectedNodeIds.has(n.id));
    }

    // Filter by connected node
    if (query.connectedTo) {
      const edges = await this.relationships.getEdgesForNode(query.connectedTo);
      const connectedNodeIds = new Set<string>();
      for (const edge of edges) {
        connectedNodeIds.add(edge.from);
        connectedNodeIds.add(edge.to);
      }
      nodes = nodes.filter(n => connectedNodeIds.has(n.id));
    }

    // Get edges between returned nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    const allEdges: GraphEdge[] = [];
    for (const nodeId of nodeIds) {
      const edges = await this.relationships.getEdgesForNode(nodeId);
      for (const edge of edges) {
        if (nodeIds.has(edge.from) && nodeIds.has(edge.to)) {
          if (!allEdges.find(e => e.id === edge.id)) {
            allEdges.push(edge);
          }
        }
      }
    }

    const paths = allEdges.map(e => ({
      from: e.from,
      relationship: e.relationship,
      to: e.to,
      confidence: e.confidence,
    }));

    return {
      nodes,
      edges: allEdges,
      paths,
      totalCount: nodes.length,
    };
  }

  /**
   * Find the shortest path between two nodes (BFS).
   */
  async findPath(from: string, to: string): Promise<GraphEdge[] | null> {
    const visited = new Set<string>();
    const queue: Array<{ id: string; path: GraphEdge[] }> = [{ id: from, path: [] }];
    visited.add(from);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.id === to) return current.path;

      const edges = await this.relationships.getEdgesForNode(current.id);
      for (const edge of edges) {
        const neighborId = edge.from === current.id ? edge.to : edge.from;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({
            id: neighborId,
            path: [...current.path, edge],
          });
        }
      }
    }

    return null; // No path found
  }
}
