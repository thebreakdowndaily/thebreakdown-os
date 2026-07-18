// packages/graph/policy.ts

/**
 * TraversalPolicy defines configurable constraints for graph traversal operations.
 * It is deliberately placed in the shared `graph` package so that any plugin or core
 * component can import and reuse it without duplication.
 */
export interface TraversalPolicy {
  /** Maximum depth of traversal from the root node. */
  maxDepth: number;
  /** Maximum number of neighbor nodes to explore at each step. */
  maxNeighbors: number;
  /** Optional whitelist of relationship types to follow during traversal. */
  relationshipTypes?: readonly string[]; // using string to avoid circular import of RelationshipType enum
  /** Strategy used to rank or prioritize traversal paths. */
  rankingStrategy: RankingStrategy;
  /** Whether cycles should be detected and included in the results. */
  includeCycles: boolean;
}

/**
 * RankingStrategy enumerates the supported ways to order traversal results.
 * Plugins can implement custom logic for each strategy.
 */
export enum RankingStrategy {
  BreadthFirst = "breadthFirst",
  DepthFirst = "depthFirst",
  ShortestPath = "shortestPath",
  Custom = "custom"
}
