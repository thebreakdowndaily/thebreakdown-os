import type { Graph } from './graphTypes';

let cachedGraph: Graph | null = null;

export function setGraph(graph: Graph): void {
  cachedGraph = graph;
}

export function getGraph(): Graph | null {
  return cachedGraph;
}

export function clearCache(): void {
  cachedGraph = null;
}
