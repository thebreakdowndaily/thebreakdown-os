import type { Graph, GraphNode, GraphEdge } from '@/types/canonical';
import type { Services } from '@/services/registry';
import { GraphService } from '@/lib/graph/graphService';

export interface GraphPageViewModel {
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
  nodeCount: number;
  edgeCount: number;
}

export interface EntityGraphPreviewViewModel {
  centerNode: GraphNode;
  connections: Array<{ node: GraphNode; edge: GraphEdge; depth: number }>;
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
}

export interface TopicGraphPreviewViewModel {
  centerNode: GraphNode;
  connections: Array<{ node: GraphNode; edge: GraphEdge; depth: number }>;
  allNodes: GraphNode[];
  allEdges: GraphEdge[];
}

export function buildGraphPage(services: Services): GraphPageViewModel {
  const graph = new GraphService(services);
  const fullGraph: Graph = graph.build();
  const allNodes = Array.from(fullGraph.nodes.values());
  const allEdges = fullGraph.edges;
  return { allNodes, allEdges, nodeCount: allNodes.length, edgeCount: allEdges.length };
}

export function buildEntityGraphPreview(services: Services, entitySlug: string): EntityGraphPreviewViewModel | null {
  const entity = services.entities.getEntityBySlug(entitySlug);
  if (!entity) return null;
  const graph = new GraphService(services);
  const fullGraph: Graph = graph.build();
  const centerNode = fullGraph.nodes.get(entity.id);
  if (!centerNode) return { centerNode: { id: entity.id, type: entity.type as string as GraphNode['type'], title: entity.name, slug: entity.slug }, connections: [], allNodes: Array.from(fullGraph.nodes.values()), allEdges: fullGraph.edges };
  const conns = graph.getConnections(entity.id, { maxDepth: 1 });
  return { centerNode, connections: conns, allNodes: Array.from(fullGraph.nodes.values()), allEdges: fullGraph.edges };
}

export function buildTopicGraphPreview(services: Services, topicSlug: string): TopicGraphPreviewViewModel | null {
  const topic = services.topics.getTopicBySlug(topicSlug);
  if (!topic) return null;
  const graph = new GraphService(services);
  const fullGraph: Graph = graph.build();
  const centerNode = fullGraph.nodes.get(topic.id);
  if (!centerNode) return { centerNode: { id: topic.id, type: 'topic', title: topic.name, slug: topic.slug }, connections: [], allNodes: Array.from(fullGraph.nodes.values()), allEdges: fullGraph.edges };
  const conns = graph.getConnections(topic.id, { maxDepth: 1 });
  return { centerNode, connections: conns, allNodes: Array.from(fullGraph.nodes.values()), allEdges: fullGraph.edges };
}
