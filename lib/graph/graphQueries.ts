import type { GraphNode, GraphEdge } from './graphTypes';

export interface ConnectedNode {
  node: GraphNode;
  edge: GraphEdge;
  distance?: number;
}
