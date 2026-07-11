import type { Graph, GraphNode, GraphEdge, RelationType } from '@/types/canonical';
import type { Services } from '@/services/registry';
import { EventBus } from '@/lib/events/event-bus';

// ── Public Types ─────────────────────────────────────────────

export interface ConnectionOptions {
  maxDepth?: number;
  relation?: RelationType;
  types?: GraphNode['type'][];
  minConfidence?: number;
}

export interface ProjectionOptions {
  types?: GraphNode['type'][];
  relations?: RelationType[];
  minConfidence?: number;
  maxNodes?: number;
}

export interface ConnectionResult {
  node: GraphNode;
  edge: GraphEdge;
  depth: number;
}

export interface TrendingResult {
  from: GraphNode;
  to: GraphNode;
  edge: GraphEdge;
  confidence: number;
  multiplicity: number;
}

export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  nodeTypeCounts: Record<string, number>;
  relationCounts: Record<string, number>;
  avgConfidence: number;
  density: number;
  isolatedNodes: number;
}

export interface GraphProjectionService {
  setServices(s: Services): void;
  build(): Graph;
  invalidate(): void;
  getNode(id: string): GraphNode | undefined;
  getConnections(nodeId: string, options?: ConnectionOptions): ConnectionResult[];
  getPath(from: string, to: string): GraphEdge[];
  getTrending(limit?: number): TrendingResult[];
  project(options?: ProjectionOptions): Graph;
  getSubgraph(nodeIds: string[]): Graph;
  projectOnto(type: GraphNode['type']): Graph;
  getStats(): GraphStats;
  subscribeToEvents(): () => void;
}

// ── Internal Types ───────────────────────────────────────────

interface RawEdge {
  from: string;
  to: string;
  relation: RelationType;
  baseConfidence: number;
  sourceType: 'story' | 'topic' | 'entity' | 'timeline' | 'dataset';
  sourceId: string;
}

interface EdgeGroup {
  edges: RawEdge[];
  best: RawEdge;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ── Implementation ───────────────────────────────────────────

export class MemoryGraphProjectionService implements GraphProjectionService {
  private services: Services;
  private cache: { graph: Graph; version: number } | null = null;
  private version = 0;
  private unsubscribers: (() => void)[] = [];

  constructor(services: Services) {
    this.services = services;
  }

  setServices(s: Services): void {
    this.services = s;
    this.invalidate();
  }

  // ── Core ──

  build(): Graph {
    if (this.cache && this.cache.version === this.version) {
      return this.cache.graph;
    }

    const { nodes, rawEdges } = this.buildRaw();
    const edges = this.scoreEdges(rawEdges, nodes);

    const graph: Graph = { nodes, edges };
    this.cache = { graph, version: this.version };
    return graph;
  }

  invalidate(): void {
    this.version++;
    this.cache = null;
  }

  subscribeToEvents(): () => void {
    const bus = EventBus.getInstance();
    const invalidate = () => this.invalidate();

    const contentEvents: Array<Parameters<typeof bus.subscribe>[0]> = [
      'story:created', 'story:updated', 'story:published', 'story:deleted',
      'topic:created', 'topic:updated', 'topic:deleted',
      'entity:created', 'entity:updated', 'entity:deleted',
      'timeline:created', 'timeline:updated', 'timeline:deleted',
      'fix:created', 'fix:updated', 'fix:deleted',
      'dataset:created', 'dataset:updated', 'dataset:deleted',
      'graph:updated',
    ];

    for (const evt of contentEvents) {
      this.unsubscribers.push(bus.subscribe(evt, invalidate));
    }

    const unsubscribe = () => {
      for (const unsub of this.unsubscribers) unsub();
      this.unsubscribers = [];
    };
    return unsubscribe;
  }

  // ── Node Queries ──

  getNode(id: string): GraphNode | undefined {
    return this.build().nodes.get(id);
  }

  // ── Traversal ──

  getConnections(nodeId: string, options?: ConnectionOptions): ConnectionResult[] {
    const graph = this.build();
    const maxDepth = options?.maxDepth ?? 2;
    const minConfidence = options?.minConfidence ?? 0;
    const visited = new Set<string>();
    const results: ConnectionResult[] = [];
    const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];
    visited.add(nodeId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth >= maxDepth) continue;

      for (const edge of graph.edges) {
        if (edge.confidence < minConfidence) continue;

        let neighborId: string | null = null;
        if (edge.from === current.id) neighborId = edge.to;
        else if (edge.to === current.id) neighborId = edge.from;

        if (!neighborId || visited.has(neighborId)) continue;
        visited.add(neighborId);

        const node = graph.nodes.get(neighborId);
        if (!node) continue;
        if (options?.relation && edge.relation !== options.relation) continue;
        if (options?.types && !options.types.includes(node.type)) continue;

        results.push({ node, edge, depth: current.depth + 1 });
        queue.push({ id: neighborId, depth: current.depth + 1 });
      }
    }

    return results;
  }

  getPath(from: string, to: string): GraphEdge[] {
    if (from === to) return [];

    const graph = this.build();
    const visited = new Set<string>();
    const parent = new Map<string, { node: string; edge: GraphEdge } | null>();
    const queue: string[] = [from];
    visited.add(from);
    parent.set(from, null);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === to) {
        const path: GraphEdge[] = [];
        let step: string | null = to;
        while (step !== null) {
          const entry = parent.get(step);
          if (entry) {
            path.unshift(entry.edge);
            step = entry.node;
          } else {
            step = null;
          }
        }
        return path;
      }

      for (const edge of graph.edges) {
        let neighbor: string | null = null;
        if (edge.from === current) neighbor = edge.to;
        else if (edge.to === current) neighbor = edge.from;

        if (neighbor && !visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, { node: current, edge });
          queue.push(neighbor);
        }
      }
    }

    return [];
  }

  getTrending(limit = 5): TrendingResult[] {
    const graph = this.build();

    const pairMultiplicity = new Map<string, number>();
    for (const edge of graph.edges) {
      const key = [edge.from, edge.to].sort().join('::');
      pairMultiplicity.set(key, (pairMultiplicity.get(key) || 0) + 1);
    }

    const scored = graph.edges.map(edge => {
      const key = [edge.from, edge.to].sort().join('::');
      const multiplicity = pairMultiplicity.get(key) || 1;
      const from = graph.nodes.get(edge.from);
      const to = graph.nodes.get(edge.to);
      if (!from || !to) return null;
      return { from, to, edge, confidence: edge.confidence, multiplicity };
    }).filter(Boolean) as TrendingResult[];

    return scored
      .sort((a, b) => b.confidence - a.confidence || b.multiplicity - a.multiplicity)
      .slice(0, limit);
  }

  // ── Projections ──

  project(options?: ProjectionOptions): Graph {
    const graph = this.build();
    let nodes = Array.from(graph.nodes.values());
    let edges = graph.edges;

    if (options?.types) {
      const typeSet = new Set(options.types);
      nodes = nodes.filter(n => typeSet.has(n.type));
      const nodeIds = new Set(nodes.map(n => n.id));
      edges = edges.filter(e => nodeIds.has(e.from) && nodeIds.has(e.to));
    }

    if (options?.relations) {
      const relSet = new Set(options.relations);
      edges = edges.filter(e => relSet.has(e.relation));
      const edgeNodeIds = new Set(edges.flatMap(e => [e.from, e.to]));
      nodes = nodes.filter(n => edgeNodeIds.has(n.id));
    }

    if (options?.minConfidence !== undefined) {
      edges = edges.filter(e => e.confidence >= options.minConfidence!);
      const edgeNodeIds = new Set(edges.flatMap(e => [e.from, e.to]));
      nodes = nodes.filter(n => edgeNodeIds.has(n.id));
    }

    if (options?.maxNodes && nodes.length > options.maxNodes) {
      const degree = new Map<string, number>();
      for (const e of edges) {
        degree.set(e.from, (degree.get(e.from) || 0) + 1);
        degree.set(e.to, (degree.get(e.to) || 0) + 1);
      }
      nodes.sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0));
      const kept = new Set(nodes.slice(0, options.maxNodes).map(n => n.id));
      nodes = nodes.filter(n => kept.has(n.id));
      edges = edges.filter(e => kept.has(e.from) && kept.has(e.to));
    }

    return { nodes: new Map(nodes.map(n => [n.id, n])), edges };
  }

  getSubgraph(nodeIds: string[]): Graph {
    const graph = this.build();
    const idSet = new Set(nodeIds);
    const nodes = new Map(
      Array.from(graph.nodes.entries()).filter(([id]) => idSet.has(id))
    );
    const edges = graph.edges.filter(e => idSet.has(e.from) && idSet.has(e.to));
    return { nodes, edges };
  }

  projectOnto(type: GraphNode['type']): Graph {
    return this.project({ types: [type] });
  }

  // ── Statistics ──

  getStats(): GraphStats {
    const graph = this.build();
    const nodes = Array.from(graph.nodes.values());
    const edges = graph.edges;

    const nodeTypeCounts: Record<string, number> = {};
    for (const n of nodes) {
      nodeTypeCounts[n.type] = (nodeTypeCounts[n.type] || 0) + 1;
    }

    const relationCounts: Record<string, number> = {};
    let totalConfidence = 0;
    for (const e of edges) {
      relationCounts[e.relation] = (relationCounts[e.relation] || 0) + 1;
      totalConfidence += e.confidence;
    }

    const nodeCount = nodes.length;
    const maxEdges = nodeCount * (nodeCount - 1) / 2;
    const density = maxEdges > 0 ? edges.length / maxEdges : 0;

    const connected = new Set<string>();
    for (const e of edges) {
      connected.add(e.from);
      connected.add(e.to);
    }
    const isolatedNodes = nodes.filter(n => !connected.has(n.id)).length;

    return {
      nodeCount,
      edgeCount: edges.length,
      nodeTypeCounts,
      relationCounts,
      avgConfidence: edges.length > 0 ? totalConfidence / edges.length : 0,
      density,
      isolatedNodes,
    };
  }

  // ── Private: Raw Build ──

  private buildRaw(): { nodes: Map<string, GraphNode>; rawEdges: RawEdge[] } {
    const nodes = new Map<string, GraphNode>();
    const rawEdges: RawEdge[] = [];

    const stories = this.services.stories.getStories().data;
    const topics = this.services.topics.getTopics().data;
    const entities = this.services.entities.getEntities().data;
    const timelines = this.services.timelines.getTimelines().data;
    const fixes = this.services.fixes.getFixes().data;
    const datasets = this.services.datasets.getDatasets().data;

    // ── Stories ──
    for (const story of stories) {
      this.addNode(nodes, { id: story.id, type: 'story', title: story.title, slug: story.slug, subtitle: story.summary });
      for (const topicId of story.relatedTopicIds) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          this.addNode(nodes, { id: topic.id, type: 'topic', title: topic.name, slug: topic.slug, subtitle: topic.description });
          rawEdges.push({ from: story.id, to: topic.id, relation: 'belongs_to', baseConfidence: 0.9, sourceType: 'story', sourceId: story.id });
        }
      }
      for (const entityId of story.relatedEntityIds) {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
          this.addNode(nodes, { id: entity.id, type: entity.type, title: entity.name, slug: entity.slug, subtitle: entity.description });
          rawEdges.push({ from: story.id, to: entity.id, relation: 'mentions', baseConfidence: 0.9, sourceType: 'story', sourceId: story.id });
        }
      }
    }

    // ── Topics ──
    for (const topic of topics) {
      this.addNode(nodes, { id: topic.id, type: 'topic', title: topic.name, slug: topic.slug, subtitle: topic.description });
      for (const storyId of topic.storyIds) {
        const story = stories.find(s => s.id === storyId || s.slug === storyId);
        if (story) {
          this.addNodeIfMissing(nodes, story);
          rawEdges.push({ from: story.id, to: topic.id, relation: 'belongs_to', baseConfidence: 0.9, sourceType: 'topic', sourceId: topic.id });
        }
      }
      for (const entityId of topic.relatedEntityIds) {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
          this.addNodeIfMissing(nodes, entity);
          rawEdges.push({ from: entity.id, to: topic.id, relation: 'part_of', baseConfidence: 0.85, sourceType: 'topic', sourceId: topic.id });
        }
      }
    }

    // ── Entities ──
    for (const entity of entities) {
      this.addNode(nodes, { id: entity.id, type: entity.type, title: entity.name, slug: entity.slug, subtitle: entity.description });
      for (const relatedId of entity.relatedEntityIds) {
        const related = entities.find(e => e.id === relatedId);
        if (related) {
          this.addNodeIfMissing(nodes, related);
          rawEdges.push({ from: entity.id, to: related.id, relation: 'related_to', baseConfidence: 0.8, sourceType: 'entity', sourceId: entity.id });
        }
      }
      for (const storyId of entity.relatedStoryIds) {
        const story = stories.find(s => s.id === storyId || s.slug === storyId);
        if (story) {
          this.addNodeIfMissing(nodes, story);
          rawEdges.push({ from: story.id, to: entity.id, relation: 'mentions', baseConfidence: 0.9, sourceType: 'entity', sourceId: entity.id });
        }
      }
      for (const topicId of entity.relatedTopicIds) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          this.addNodeIfMissing(nodes, topic, 'topic');
          rawEdges.push({ from: entity.id, to: topic.id, relation: 'part_of', baseConfidence: 0.85, sourceType: 'entity', sourceId: entity.id });
        }
      }
    }

    // ── Timelines ──
    for (const timeline of timelines) {
      this.addNode(nodes, { id: timeline.id, type: 'timeline', title: timeline.title, slug: '', subtitle: timeline.description });
      for (const storyId of timeline.storyIds) {
        const story = stories.find(s => s.id === storyId || s.slug === storyId);
        if (story) {
          this.addNodeIfMissing(nodes, story);
          rawEdges.push({ from: timeline.id, to: story.id, relation: 'covers', baseConfidence: 0.9, sourceType: 'timeline', sourceId: timeline.id });
        }
      }
      for (const entityId of timeline.entityIds) {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
          this.addNodeIfMissing(nodes, entity);
          rawEdges.push({ from: timeline.id, to: entity.id, relation: 'mentions', baseConfidence: 0.85, sourceType: 'timeline', sourceId: timeline.id });
        }
      }
      for (const topicId of timeline.topicIds) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          this.addNodeIfMissing(nodes, topic, 'topic');
          rawEdges.push({ from: timeline.id, to: topic.id, relation: 'belongs_to', baseConfidence: 0.85, sourceType: 'timeline', sourceId: timeline.id });
        }
      }
    }

    // ── Fixes ──
    for (const fix of fixes) {
      this.addNode(nodes, { id: fix.id, type: 'fix', title: fix.headline, slug: fix.slug, subtitle: fix.problem.content });
    }

    // ── Datasets ──
    for (const dataset of datasets) {
      this.addNode(nodes, { id: dataset.id, type: 'dataset', title: dataset.title, slug: dataset.slug, subtitle: dataset.description });
      for (const entityId of dataset.relatedEntityIds) {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
          this.addNodeIfMissing(nodes, entity);
          rawEdges.push({ from: dataset.id, to: entity.id, relation: 'analyzes', baseConfidence: 0.85, sourceType: 'dataset', sourceId: dataset.id });
        }
      }
      for (const storyId of dataset.relatedStoryIds) {
        const story = stories.find(s => s.id === storyId || s.slug === storyId);
        if (story) {
          this.addNodeIfMissing(nodes, story);
          rawEdges.push({ from: dataset.id, to: story.id, relation: 'references', baseConfidence: 0.8, sourceType: 'dataset', sourceId: dataset.id });
        }
      }
      for (const topicId of dataset.relatedTopicIds) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          this.addNodeIfMissing(nodes, topic, 'topic');
          rawEdges.push({ from: dataset.id, to: topic.id, relation: 'belongs_to', baseConfidence: 0.85, sourceType: 'dataset', sourceId: dataset.id });
        }
      }
    }

    return { nodes, rawEdges };
  }

  // ── Private: Dynamic Confidence Scoring ──

  private scoreEdges(rawEdges: RawEdge[], nodes: Map<string, GraphNode>): GraphEdge[] {
    const groups = new Map<string, EdgeGroup>();

    for (const re of rawEdges) {
      const key = [re.from, re.to].sort().join('::');
      const existing = groups.get(key);
      if (existing) {
        existing.edges.push(re);
        if (re.baseConfidence > existing.best.baseConfidence) {
          existing.best = re;
        }
      } else {
        groups.set(key, { edges: [re], best: re });
      }
    }

    const edges: GraphEdge[] = [];

    for (const [, group] of groups) {
      const { edges: reList, best } = group;
      const multiplicity = reList.length;
      const sourceTypes = new Set(reList.map(r => r.sourceType));

      const multiplicityBonus = Math.min((multiplicity - 1) * 0.05, 0.2);
      const diversityBonus = sourceTypes.size > 1 ? (sourceTypes.size - 1) * 0.05 : 0;

      const recentIds = reList
        .filter(r => r.sourceType === 'story' || r.sourceType === 'timeline')
        .map(r => r.sourceId);
      let recencyBonus = 0;
      if (recentIds.length > 0) {
        const allStories = this.services.stories.getStories().data;
        const now = Date.now();
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        for (const sid of recentIds) {
          const story = allStories.find(s => s.id === sid);
          if (story) {
            const age = now - new Date(story.updatedAt || story.publishedAt).getTime();
            if (age < THIRTY_DAYS_MS) {
              recencyBonus = 0.05;
              break;
            }
          }
        }
      }

      const confidence = clamp(
        best.baseConfidence + multiplicityBonus + diversityBonus + recencyBonus,
        0,
        1
      );

      edges.push({
        from: best.from,
        to: best.to,
        relation: best.relation,
        confidence: Math.round(confidence * 1000) / 1000,
      });
    }

    return edges;
  }

  // ── Private: Helpers ──

  private addNode(nodes: Map<string, GraphNode>, node: GraphNode): void {
    if (!nodes.has(node.id)) {
      nodes.set(node.id, node);
    }
  }

  private addNodeIfMissing(
    nodes: Map<string, GraphNode>,
    source: { id: string; name?: string; title?: string; slug: string; description?: string; type?: string },
    fallbackType: GraphNode['type'] = 'story'
  ): void {
    if (!nodes.has(source.id)) {
      nodes.set(source.id, {
        id: source.id,
        type: (source.type as GraphNode['type']) ?? fallbackType,
        title: source.name ?? source.title ?? source.id,
        slug: source.slug,
        subtitle: source.description,
      });
    }
  }
}

export function addEdge(
  edges: Map<string, RawEdge[]>,
  from: string,
  to: string,
  relation: RelationType,
  baseConfidence: number,
  sourceType: RawEdge['sourceType'],
  sourceId: string
): void {
  const key = [from, to].sort().join('::');
  const existing = edges.get(key);
  const re: RawEdge = { from, to, relation, baseConfidence, sourceType, sourceId };
  if (existing) {
    existing.push(re);
  } else {
    edges.set(key, [re]);
  }
}
