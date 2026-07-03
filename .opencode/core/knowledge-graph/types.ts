/**
 * THE BREAKDOWN OS — Knowledge Graph Types
 *
 * Shared type definitions for the Knowledge Graph.
 */

// ── Graph Config ────────────────────────────────────────────────────────

export interface GraphConfig {
  store: {
    nodes_path: string;
    edges_path: string;
  };
  inference: {
    enabled: boolean;
    max_depth: number;
    min_confidence: number;
  };
  validation: {
    schedule: string;
    fuzzy_threshold: number;
    stale_edge_days: number;
    auto_repair: boolean;
  };
}

// ── Graph Nodes ─────────────────────────────────────────────────────────

export interface GraphNode {
  /** Canonical ID: `<type>::<sanitized-label>` */
  id: string;
  /** Node type from the 20-type taxonomy */
  type: NodeType;
  /** Human-readable label */
  label: string;
  /** Brief description */
  description?: string;
  /** Alternative names */
  aliases?: string[];
  /** Arbitrary metadata */
  metadata?: Record<string, any>;
  /** When this entity was first seen */
  firstSeen?: string;
  /** When this entity was last referenced */
  lastSeen?: string;
  /** How many stories reference this entity */
  storyCount?: number;
  /** Active or soft-deleted */
  active?: boolean;
}

export type NodeType =
  | 'person' | 'organization' | 'company'
  | 'country' | 'state' | 'district' | 'city'
  | 'law' | 'policy' | 'scheme'
  | 'budget' | 'report' | 'committee'
  | 'court-case' | 'technology' | 'project'
  | 'event' | 'article' | 'dataset' | 'statistic'
  | 'topic';

// ── Graph Edges ─────────────────────────────────────────────────────────

export interface GraphEdge {
  /** Canonical ID: `<from>|<rel>|<to>` */
  id: string;
  /** Source node ID */
  from: string;
  /** Target node ID */
  to: string;
  /** Relationship type from the 21-type taxonomy */
  relationship: RelationshipType;
  /** Confidence score (0.0–1.0) */
  confidence: number;
  /** Edge weight (higher = stronger connection) */
  weight?: number;
  /** Source story URLs */
  sources?: string[];
  /** Arbitrary metadata */
  metadata?: Record<string, any>;
  /** When this relationship was first observed */
  firstObserved?: string;
  /** When this relationship was last observed */
  lastObserved?: string;
  /** Active or soft-deleted */
  active?: boolean;
}

export type RelationshipType =
  | 'implements'
  | 'created_by'
  | 'approved_by'
  | 'funded_by'
  | 'managed_by'
  | 'reports_to'
  | 'member_of'
  | 'located_in'
  | 'criticised_by'
  | 'supports'
  | 'opposes'
  | 'related_to'
  | 'amends'
  | 'replaces'
  | 'references'
  | 'cites'
  | 'depends_on'
  | 'caused_by'
  | 'influenced_by'
  | 'regulated_by'
  | 'audited_by';

// ── Edge Query ──────────────────────────────────────────────────────────

export interface EdgeQuery {
  from?: string;
  to?: string;
  relationship?: string;
  minConfidence?: number;
}

// ── Graph Query ─────────────────────────────────────────────────────────

export interface GraphQuery {
  nodeType?: NodeType | string;
  edgeType?: RelationshipType | string;
  connectedTo?: string;
  limit?: number;
}

// ── Query Result ────────────────────────────────────────────────────────

export interface QueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  paths: PathContext[];
  totalCount: number;
}

export interface PathContext {
  from: string;
  relationship: string;
  to: string;
  confidence?: number;
}

// ── Related Result ──────────────────────────────────────────────────────

export interface RelatedResult {
  people: GraphNode[];
  organizations: GraphNode[];
  countries: GraphNode[];
  laws: GraphNode[];
  schemes: GraphNode[];
  budgets: GraphNode[];
  reports: GraphNode[];
  events: GraphNode[];
  courtCases: GraphNode[];
  articles: GraphNode[];
  allEdges: GraphEdge[];
}

// ── Statistics ──────────────────────────────────────────────────────────

export interface GraphStatistics {
  nodeCount: number;
  edgeCount: number;
  nodesByType: Record<string, number>;
  edgesByType: Record<string, number>;
  avgDegree: number;
  density: number;
  topConnected: Array<{ id: string; count: number }>;
}

export interface NodeStatistics {
  total: number;
  byType: Record<string, number>;
  topConnected: Array<{ id: string; count: number }>;
}

export interface EdgeStatistics {
  total: number;
  byType: Record<string, number>;
}
