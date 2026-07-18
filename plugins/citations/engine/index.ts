import { createEnginePlugin, EnginePluginContext, NodeType, RelationshipType, EvidenceConfidence } from "../../../packages/plugin-sdk";
import { citationsManifest } from "../manifest";

export interface ResolvedSource {
  id: string;
  title: string;
  url?: string;
  type: string;
}

export interface ResolvedEvidence {
  id: string;
  title: string;
  summary: string;
  confidence: EvidenceConfidence;
  sources: ResolvedSource[];
}

export interface ResolvedClaim {
  id: string;
  title: string;
  summary: string;
  supportingEvidence: ResolvedEvidence[];
  refutingEvidence: ResolvedEvidence[];
}

export interface CitationExtensionData {
  claims: ResolvedClaim[];
}

export const CitationEnginePlugin = createEnginePlugin<CitationExtensionData>({
  manifest: citationsManifest,
  resolve: (ctx: EnginePluginContext) => {
    const claims: ResolvedClaim[] = [];
    const allNodes = ctx.graph.getAllNodes();

    // Find all claim nodes
    const claimNodes = allNodes.filter(n => n.type === NodeType.Claim);

    for (const claimNode of claimNodes) {
      const supportingEvidence: ResolvedEvidence[] = [];
      const refutingEvidence: ResolvedEvidence[] = [];

      // Find evidence connected to this claim
      const outgoingEdges = ctx.graph.getOutgoingEdges(claimNode.id);
      
      for (const edge of outgoingEdges) {
        if (edge.type === RelationshipType.Supports || edge.type === RelationshipType.Refutes) {
          const evidenceNode = ctx.graph.getNode(edge.targetId);
          if (evidenceNode && evidenceNode.type === NodeType.Evidence) {
            
            // Find sources connected to this evidence
            const sources: ResolvedSource[] = [];
            const evidenceOutEdges = ctx.graph.getOutgoingEdges(evidenceNode.id);
            
            for (const evEdge of evidenceOutEdges) {
              if (evEdge.type === RelationshipType.Cites) {
                const sourceNode = ctx.graph.getNode(evEdge.targetId);
                if (sourceNode && sourceNode.type === NodeType.Source) {
                  sources.push({
                    id: sourceNode.id,
                    title: sourceNode.metadata?.title as string || "Unknown Source",
                    url: (sourceNode.metadata as any)?.url,
                    type: (sourceNode.metadata as any)?.sourceType || "document"
                  });
                }
              }
            }

            const resolvedEvidence: ResolvedEvidence = {
              id: evidenceNode.id,
              title: evidenceNode.metadata?.title as string || "Untitled Evidence",
              summary: evidenceNode.metadata?.summary as string || "",
              confidence: (evidenceNode.metadata?.evidenceConfidence as EvidenceConfidence) || EvidenceConfidence.Medium,
              sources
            };

            if (edge.type === RelationshipType.Supports) {
              supportingEvidence.push(resolvedEvidence);
            } else {
              refutingEvidence.push(resolvedEvidence);
            }
          }
        }
      }

      claims.push({
        id: claimNode.id,
        title: claimNode.metadata?.title as string || "Untitled Claim",
        summary: claimNode.metadata?.summary as string || "",
        supportingEvidence,
        refutingEvidence
      });
    }

    return { claims };
  }
});
