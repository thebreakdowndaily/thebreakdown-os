import { KnowledgeManifest, RelationshipType } from "../compiler/types";

export interface GraphEdge {
  readonly sourceId: string;
  readonly targetId: string;
  readonly type: RelationshipType;
}

export interface GraphNode {
  readonly id: string;
  readonly manifest: KnowledgeManifest;
}

export interface GraphStore {
  exists(nodeId: string): boolean;
  getNode(id: string): GraphNode | undefined;
  getAllNodes(): GraphNode[];
  getAllEdges(): GraphEdge[];
  getOutgoing(nodeId: string): GraphEdge[];
  getIncoming(nodeId: string): GraphEdge[];
}

export interface TraversalOptions {
  maxDepth?: number;
  relationshipTypes?: RelationshipType[];
  direction?: "incoming" | "outgoing" | "both";
  strategy?: "BFS" | "DFS";
}

export interface TraversalResult {
  nodes: GraphNode[];
  edgesTraversed: number;
  depthReached: number;
  truncated: boolean;
}
