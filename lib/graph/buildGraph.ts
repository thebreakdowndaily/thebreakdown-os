import type { StoryJSON, TopicJSON, EntityJSON } from '@/utils/types';
import { createGraph, addNode, addEdge, type Graph, type GraphNode } from './graphTypes';
import { extractStoryNodes, extractTopicNodes, extractEntityNodes } from './entityExtraction';
import { buildStoryRelationships, buildTopicRelationships, buildEntityRelationships } from './relationshipBuilder';

export interface ContentCollection {
  stories: StoryJSON[];
  topics: TopicJSON[];
  entities: EntityJSON[];
}

export function buildGraph(collection: ContentCollection): Graph {
  const graph = createGraph();

  for (const story of collection.stories) {
    const nodes = extractStoryNodes(story);
    for (const node of nodes) addNode(graph, node);
    buildStoryRelationships(graph, story);
  }

  for (const topic of collection.topics) {
    const nodes = extractTopicNodes(topic);
    for (const node of nodes) addNode(graph, node);
    buildTopicRelationships(graph, topic);
  }

  for (const entity of collection.entities) {
    const nodes = extractEntityNodes(entity);
    for (const node of nodes) addNode(graph, node);
    buildEntityRelationships(graph, entity);
  }

  return graph;
}

export function getNodeBySlug(graph: Graph, slug: string, prefix?: string): GraphNode | undefined {
  if (prefix) return graph.nodes.get(`${prefix}:${slug}`);
  for (const [, node] of graph.nodes) {
    if (node.slug === slug) return node;
  }
  return undefined;
}

export function getNodesByType(graph: Graph, type: string): GraphNode[] {
  const result: GraphNode[] = [];
  for (const [, node] of graph.nodes) {
    if (node.type === type) result.push(node);
  }
  return result;
}
