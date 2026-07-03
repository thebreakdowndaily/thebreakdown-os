/**
 * THE BREAKDOWN OS — Knowledge Graph Manager
 *
 * The Knowledge Graph is the central brain of The Breakdown OS.
 * It connects everything: stories, people, organizations, laws, budgets,
 * policies, countries, reports, events, sources.
 *
 * Nothing exists in isolation. Every story strengthens the graph.
 *
 * It never writes stories. It never researches. It never verifies.
 * Its only responsibility is connecting knowledge.
 *
 * Public API:
 *   graph.createNode(node)       — add a new node
 *   graph.updateNode(id, data)   — update an existing node
 *   graph.deleteNode(id)         — remove a node and its edges
 *   graph.getNode(id)            — retrieve a single node
 *   graph.findEntity(query)      — search entities across all types
 *   graph.createEdge(edge)       — add a new edge
 *   graph.deleteEdge(id)         — remove an edge
 *   graph.getEdges(from, rel, to) — query edges with filters
 *   graph.search(query)          — full graph search
 *   graph.related(nodeId)        — find related nodes and edges
 *   graph.timeline(nodeId)       — chronological events for a node
 *   graph.statistics()           — graph-level metrics
 *   graph.query(graphQuery)      — structured graph queries
 *   graph.infer()                — run relationship inference
 *   graph.validate()             — run full validation
 */

import { EntityManager } from './entity-manager';
import { RelationshipManager } from './relationship-manager';
import { GraphSearch } from './graph-search';
import { GraphUpdater } from './graph-updater';
import { GraphBuilder } from './graph-builder';
import { GraphValidator } from './graph-validator';
import type { GraphNode, GraphEdge, GraphConfig, GraphQuery, QueryResult, RelatedResult, GraphStatistics } from './types';

export class KnowledgeGraph {
  private entities: EntityManager;
  private relationships: RelationshipManager;
  private search: GraphSearch;
  private updater: GraphUpdater;
  private builder: GraphBuilder;
  private validator: GraphValidator;
  private config: GraphConfig;

  constructor(config: GraphConfig) {
    this.config = config;
    this.entities = new EntityManager(config);
    this.relationships = new RelationshipManager(config);
    this.search = new GraphSearch(config, this.entities, this.relationships);
    this.updater = new GraphUpdater(config, this.entities, this.relationships);
    this.builder = new GraphBuilder(config, this.entities, this.relationships);
    this.validator = new GraphValidator(config, this.entities, this.relationships);
  }

  // ── Node Operations ───────────────────────────────────────────────────

  async createNode(node: Omit<GraphNode, 'firstSeen' | 'lastSeen' | 'storyCount' | 'active'>): Promise<GraphNode> {
    return this.entities.create(node);
  }

  async updateNode(id: string, data: Partial<GraphNode>): Promise<GraphNode> {
    return this.entities.update(id, data);
  }

  async deleteNode(id: string): Promise<void> {
    // Remove all edges connected to this node first
    await this.relationships.removeEdgesForNode(id);
    await this.entities.delete(id);
  }

  async getNode(id: string): Promise<GraphNode | null> {
    return this.entities.get(id);
  }

  async findEntity(query: string): Promise<GraphNode[]> {
    return this.search.findEntity(query);
  }

  // ── Edge Operations ───────────────────────────────────────────────────

  async createEdge(edge: Omit<GraphEdge, 'id' | 'firstObserved' | 'lastObserved' | 'active'>): Promise<GraphEdge> {
    // Ensure both nodes exist
    const fromNode = await this.entities.get(edge.from);
    if (!fromNode) throw new Error(`Source node '${edge.from}' does not exist. Create it first.`);
    const toNode = await this.entities.get(edge.to);
    if (!toNode) throw new Error(`Target node '${edge.to}' does not exist. Create it first.`);

    return this.relationships.create(edge);
  }

  async deleteEdge(id: string): Promise<void> {
    return this.relationships.delete(id);
  }

  async getEdges(from?: string, relationship?: string, to?: string): Promise<GraphEdge[]> {
    return this.relationships.query({ from, relationship, to });
  }

  // ── Search & Discovery ────────────────────────────────────────────────

  async search(query: string): Promise<QueryResult> {
    return this.search.search(query);
  }

  async related(nodeId: string, depth: number = 2): Promise<RelatedResult> {
    return this.search.findRelated(nodeId, depth);
  }

  async timeline(nodeId: string): Promise<GraphEdge[]> {
    return this.search.getTimeline(nodeId);
  }

  // ── Structured Queries ────────────────────────────────────────────────

  async query(graphQuery: GraphQuery): Promise<QueryResult> {
    return this.search.executeQuery(graphQuery);
  }

  // ── Inference ─────────────────────────────────────────────────────────

  async infer(): Promise<{ inferred: number; errors: string[] }> {
    return this.updater.runInference();
  }

  // ── Validation ────────────────────────────────────────────────────────

  async validate(): Promise<ValidationReport> {
    return this.validator.runFullValidation();
  }

  // ── Build / Rebuild ───────────────────────────────────────────────────

  async buildFromMemory(memoryStorePath: string): Promise<BuildReport> {
    return this.builder.buildFromMemory(memoryStorePath);
  }

  // ── Statistics ────────────────────────────────────────────────────────

  async statistics(): Promise<GraphStatistics> {
    const [nodeStats, edgeStats] = await Promise.all([
      this.entities.statistics(),
      this.relationships.statistics(),
    ]);

    const totalNodes = nodeStats.total;
    const totalEdges = edgeStats.total;
    const density = totalNodes > 1 ? (2 * totalEdges) / (totalNodes * (totalNodes - 1)) : 0;

    return {
      nodeCount: totalNodes,
      edgeCount: totalEdges,
      nodesByType: nodeStats.byType,
      edgesByType: edgeStats.byType,
      avgDegree: totalNodes > 0 ? (2 * totalEdges) / totalNodes : 0,
      density,
      topConnected: nodeStats.topConnected,
    };
  }

  // ── Health ────────────────────────────────────────────────────────────

  async health(): Promise<boolean> {
    try {
      const [entityHealth, relHealth] = await Promise.all([
        this.entities.health(),
        this.relationships.health(),
      ]);
      return entityHealth && relHealth;
    } catch {
      return false;
    }
  }
}

export interface ValidationReport {
  timestamp: string;
  summary: {
    totalNodes: number;
    totalEdges: number;
    issuesFound: number;
    autoRepaired: number;
    flaggedForReview: number;
  };
  checks: {
    brokenNodes: { count: number; details: string[] };
    duplicateEntities: { count: number; details: string[] };
    circularReferences: { count: number; details: string[]; cycles: string[][] };
    orphanEntities: { count: number; details: string[] };
    invalidIds: { count: number; details: string[] };
    missingRelationships: { count: number; details: string[] };
  };
}

export interface BuildReport {
  nodesCreated: number;
  nodesUpdated: number;
  edgesCreated: number;
  edgesUpdated: number;
  errors: string[];
  duration: number;
}
