export const NODE_TYPES = [
  'story', 'topic', 'entity', 'country', 'organization',
  'person', 'policy', 'scheme', 'budget', 'event', 'report',
  'dataset', 'source', 'fix',
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export const RELATION_TYPES = [
  'mentions', 'belongs_to', 'implemented_by', 'announced_by',
  'funded_by', 'affects', 'related_to', 'part_of', 'located_in',
  'published_by', 'criticized_by', 'supports', 'opposes',
  'covers', 'analyzes', 'references',
] as const;

export type RelationType = (typeof RELATION_TYPES)[number];

export interface GraphNode {
  id: string;
  type: NodeType;
  title: string;
  slug: string;
  image?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: RelationType;
  confidence: number;
}

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

export function createGraph(): Graph {
  return { nodes: new Map(), edges: [] };
}

export function addNode(graph: Graph, node: GraphNode): GraphNode {
  const existing = graph.nodes.get(node.id);
  if (existing) return existing;
  graph.nodes.set(node.id, node);
  return node;
}

export function addEdge(graph: Graph, edge: GraphEdge): void {
  const key = `${edge.from}:${edge.relation}:${edge.to}`;
  const exists = graph.edges.some(
    (e) => e.from === edge.from && e.to === edge.to && e.relation === edge.relation,
  );
  if (!exists) graph.edges.push(edge);
}
