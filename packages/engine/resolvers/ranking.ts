import { GraphNode, GraphStore, GraphQueries } from "../../graph/index";
import { EngineContext, Recommendation, RankingStrategy } from "../types";
import { ReasoningPolicy } from "../policy";

export class SharedEdgeRankingStrategy implements RankingStrategy {
  constructor(private readonly policy: ReasoningPolicy) {}

  public rank(node: GraphNode, context: EngineContext, graph: GraphStore): Recommendation[] {
    const queries = new GraphQueries(graph);
    
    // We want to find nodes that share relationships.
    // A simple heuristic: traverse 1 step out to find what this node causes, implements, etc.
    // Then traverse 1 step in from those targets to find other nodes pointing to the same targets.
    const result1 = queries.traverse(node.id, { maxDepth: 1, direction: "outgoing", relationshipTypes: ["causes", "implements", "supersedes", "measures"] });
    
    const candidates = new Map<string, { node: GraphNode, score: number, reason: string, rel: string, provenance: { sourceId: string; targetId: string; type: string }[] }>();

    for (const targetNode of result1.nodes) {
      // Find what other nodes point to this targetNode
      const incomingEdges = graph.getIncoming(targetNode.id);
      
      for (const edge of incomingEdges) {
        if (edge.sourceId === node.id) continue; // Skip self
        
        const candidateNode = graph.getNode(edge.sourceId);
        if (!candidateNode) continue;
        
        // Calculate score based on policy weights
        let score = 1.0;
        let reason = `Shares a related target (${targetNode.manifest.metadata.title})`;
        if (edge.type === "causes") {
          score += this.policy.rankingWeights.sharedCauses;
          reason = `Shares causal dependencies with ${targetNode.manifest.metadata.title}`;
        } else if (edge.type === "measures") {
          score += this.policy.rankingWeights.sharedMetrics;
          reason = `Shares metrics with ${targetNode.manifest.metadata.title}`;
        }

        if (candidates.has(candidateNode.id)) {
          // Accumulate score
          const existing = candidates.get(candidateNode.id)!;
          existing.score += score;
          existing.provenance.push({ sourceId: edge.sourceId, targetId: edge.targetId, type: edge.type });
        } else {
          candidates.set(candidateNode.id, {
            node: candidateNode,
            score,
            reason,
            rel: edge.type,
            provenance: [{ sourceId: edge.sourceId, targetId: edge.targetId, type: edge.type }]
          });
        }
      }
    }

    // Sort deterministically: highest score first, then fallback to ID
    const recommendations = Array.from(candidates.values())
      .map(c => ({
        node: c.node,
        score: c.score,
        reason: c.reason,
        relationship: c.rel,
        provenance: c.provenance
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.node.id.localeCompare(b.node.id);
      });

    const limit = context.maxRecommendations ?? this.policy.maxRecommendations;
    return recommendations.slice(0, limit);
  }
}

export class RankingResolver {
  constructor(private readonly strategy: RankingStrategy) {}

  public resolve(node: GraphNode, context: EngineContext, graph: GraphStore): Recommendation[] {
    return this.strategy.rank(node, context, graph);
  }
}
