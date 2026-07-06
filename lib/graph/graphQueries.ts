import type { Graph, GraphNode, GraphEdge, NodeType, RelationType } from './graphTypes';

export type { GraphNode, GraphEdge, NodeType, RelationType } from './graphTypes';

export interface ConnectedNode {
  node: GraphNode;
  edge: GraphEdge;
  depth: number;
}

export function getConnectedNodes(
  graph: Graph,
  nodeId: string,
  options?: { maxDepth?: number; relation?: RelationType; type?: NodeType },
): ConnectedNode[] {
  const maxDepth = options?.maxDepth ?? 2;
  const visited = new Set<string>();
  const results: ConnectedNode[] = [];
  const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];
  visited.add(nodeId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= maxDepth) continue;

    for (const edge of graph.edges) {
      let neighborId: string | null = null;
      if (edge.from === current.id) neighborId = edge.to;
      else if (edge.to === current.id) neighborId = edge.from;

      if (neighborId && !visited.has(neighborId)) {
        visited.add(neighborId);
        const node = graph.nodes.get(neighborId);
        if (!node) continue;

        if (options?.relation && edge.relation !== options.relation) continue;
        if (options?.type && node.type !== options.type) continue;

        results.push({ node, edge, depth: current.depth + 1 });
        queue.push({ id: neighborId, depth: current.depth + 1 });
      }
    }
  }

  return results;
}

export function getRelatedStories(
  graph: Graph,
  nodeId: string,
  limit = 4,
): GraphNode[] {
  const connected = getConnectedNodes(graph, nodeId, {
    maxDepth: 2,
    type: 'story',
  });

  const seen = new Set<string>();
  const stories: GraphNode[] = [];
  for (const c of connected) {
    if (c.node.id === nodeId) continue;
    if (seen.has(c.node.id)) continue;
    seen.add(c.node.id);
    stories.push(c.node);
    if (stories.length >= limit) break;
  }

  return stories;
}

export function getTrendingConnections(
  graph: Graph,
  limit = 5,
): Array<{ from: GraphNode; to: GraphNode; edge: GraphEdge }> {
  const edgeFrequency = new Map<string, number>();
  for (const edge of graph.edges) {
    const key = `${edge.from}:${edge.to}`;
    edgeFrequency.set(key, (edgeFrequency.get(key) || 0) + 1);
  }

  const sorted = [...graph.edges]
    .sort((a, b) => (edgeFrequency.get(`${b.from}:${b.to}`) || 0) - (edgeFrequency.get(`${a.from}:${a.to}`) || 0))
    .slice(0, limit);

  const results: Array<{ from: GraphNode; to: GraphNode; edge: GraphEdge }> = [];
  for (const edge of sorted) {
    const from = graph.nodes.get(edge.from);
    const to = graph.nodes.get(edge.to);
    if (from && to) results.push({ from, to, edge });
  }

  return results;
}

export function getPathBetween(
  graph: Graph,
  fromId: string,
  toId: string,
): GraphNode[] | null {
  if (fromId === toId) return [graph.nodes.get(fromId)!].filter(Boolean);

  const visited = new Set<string>();
  const parent = new Map<string, string | null>();
  const queue: string[] = [fromId];
  visited.add(fromId);
  parent.set(fromId, null);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === toId) {
      const path: GraphNode[] = [];
      let step: string | null = toId;
      while (step !== null) {
        const node = graph.nodes.get(step);
        if (node) path.unshift(node);
        step = parent.get(step) ?? null;
      }
      return path;
    }

    for (const edge of graph.edges) {
      let neighbor: string | null = null;
      if (edge.from === current) neighbor = edge.to;
      else if (edge.to === current) neighbor = edge.from;

      if (neighbor && !visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  return null;
}
