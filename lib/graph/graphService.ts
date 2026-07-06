import type { Graph, GraphNode, GraphEdge, RelationType, EntityKind } from '@/types/canonical';
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
    const nodes = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];

    const stories = this.services.stories.getStories().data;
    const topics = this.services.topics.getTopics().data;
    const entities = this.services.entities.getEntities().data;
    const timelines = this.services.timelines.getTimelines().data;
    const fixes = this.services.fixes.getFixes().data;

    for (const story of stories) {
      this.addNode(nodes, { id: story.id, type: 'story', title: story.title, slug: story.slug, subtitle: story.summary });
      for (const topicId of story.relatedTopicIds) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          this.addNode(nodes, { id: topic.id, type: 'topic', title: topic.name, slug: topic.slug, subtitle: topic.description });
          edges.push({ from: story.id, to: topic.id, relation: 'belongs_to', confidence: 0.9 });
        }
      }
      for (const entityId of story.relatedEntityIds) {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
          this.addNode(nodes, { id: entity.id, type: entity.type, title: entity.name, slug: entity.slug, subtitle: entity.description });
          edges.push({ from: story.id, to: entity.id, relation: 'mentions', confidence: 0.9 });
        }
      }
    }

    for (const topic of topics) {
      this.addNode(nodes, { id: topic.id, type: 'topic', title: topic.name, slug: topic.slug, subtitle: topic.description });
      for (const entityId of topic.relatedEntityIds) {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
          this.addNodeIfMissing(nodes, entity);
          edges.push({ from: entity.id, to: topic.id, relation: 'part_of', confidence: 0.85 });
        }
      }
    }

    for (const entity of entities) {
      this.addNode(nodes, { id: entity.id, type: entity.type, title: entity.name, slug: entity.slug, subtitle: entity.description });
      for (const relatedId of entity.relatedEntityIds) {
        const related = entities.find(e => e.id === relatedId);
        if (related) {
          this.addNodeIfMissing(nodes, related);
          edges.push({ from: entity.id, to: related.id, relation: 'related_to', confidence: 0.8 });
        }
      }
      for (const topicId of entity.relatedTopicIds) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          this.addNodeIfMissing(nodes, topic, 'topic');
          edges.push({ from: entity.id, to: topic.id, relation: 'part_of', confidence: 0.85 });
        }
      }
    }

    for (const timeline of timelines) {
      this.addNode(nodes, { id: timeline.id, type: 'timeline', title: timeline.title, slug: '', subtitle: timeline.description });
      for (const storyId of timeline.storyIds) {
        const story = stories.find(s => s.id === storyId);
        if (story) {
          this.addNodeIfMissing(nodes, story, 'story');
          edges.push({ from: timeline.id, to: story.id, relation: 'covers', confidence: 0.9 });
        }
      }
      for (const entityId of timeline.entityIds) {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
          this.addNodeIfMissing(nodes, entity);
          edges.push({ from: timeline.id, to: entity.id, relation: 'mentions', confidence: 0.85 });
        }
      }
      for (const topicId of timeline.topicIds) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          this.addNodeIfMissing(nodes, topic, 'topic');
          edges.push({ from: timeline.id, to: topic.id, relation: 'belongs_to', confidence: 0.85 });
        }
      }
    }

    for (const fix of fixes) {
      this.addNode(nodes, { id: fix.id, type: 'fix', title: fix.title, slug: fix.slug, subtitle: fix.problem });
    }

    const datasets = this.services.datasets.getDatasets().data;
    for (const dataset of datasets) {
      this.addNode(nodes, { id: dataset.id, type: 'dataset', title: dataset.title, slug: dataset.slug, subtitle: dataset.description });
      for (const entityId of dataset.relatedEntityIds) {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
          this.addNodeIfMissing(nodes, entity);
          edges.push({ from: dataset.id, to: entity.id, relation: 'analyzes', confidence: 0.85 });
        }
      }
      for (const storyId of dataset.relatedStoryIds) {
        const story = stories.find(s => s.id === storyId);
        if (story) {
          this.addNodeIfMissing(nodes, story, 'story');
          edges.push({ from: dataset.id, to: story.id, relation: 'references', confidence: 0.8 });
        }
      }
      for (const topicId of dataset.relatedTopicIds) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          this.addNodeIfMissing(nodes, topic, 'topic');
          edges.push({ from: dataset.id, to: topic.id, relation: 'belongs_to', confidence: 0.85 });
        }
      }
    }

    return { nodes, edges };
  }

  getNode(id: string): GraphNode | undefined {
    const graph = this.build();
    return graph.nodes.get(id);
  }

  getConnections(nodeId: string, options?: { maxDepth?: number; relation?: RelationType }): ConnectionResult[] {
    const graph = this.build();
    const maxDepth = options?.maxDepth ?? 2;
    const visited = new Set<string>();
    const results: ConnectionResult[] = [];
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

          results.push({ node, edge, depth: current.depth + 1 });
          queue.push({ id: neighborId, depth: current.depth + 1 });
        }
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

  getTrending(limit: number): Array<{ from: GraphNode; to: GraphNode }> {
    const graph = this.build();
    const sorted = [...graph.edges]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);

    const results: Array<{ from: GraphNode; to: GraphNode }> = [];
    for (const edge of sorted) {
      const from = graph.nodes.get(edge.from);
      const to = graph.nodes.get(edge.to);
      if (from && to) results.push({ from, to });
    }
    return results;
  }

  private addNode(nodes: Map<string, GraphNode>, node: GraphNode): void {
    if (!nodes.has(node.id)) {
      nodes.set(node.id, node);
    }
  }

  private addNodeIfMissing(nodes: Map<string, GraphNode>, source: { id: string; type?: string; name?: string; title?: string; slug: string; description?: string }, fallbackType: GraphNode['type'] = 'story'): void {
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
