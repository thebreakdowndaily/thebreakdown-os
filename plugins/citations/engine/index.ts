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

    const claimNodes = allNodes.filter(n => n.manifest.nodeType === NodeType.Claim);

    for (const claimNode of claimNodes) {
      const supportingEvidence: ResolvedEvidence[] = [];
      const refutingEvidence: ResolvedEvidence[] = [];

      const outgoingEdges = ctx.graph.getOutgoing(claimNode.id);
      
      for (const edge of outgoingEdges) {
        if (edge.type === RelationshipType.Supports || edge.type === RelationshipType.Refutes) {
          const evidenceNode = ctx.graph.getNode(edge.targetId);
          if (evidenceNode && evidenceNode.manifest.nodeType === NodeType.Evidence) {
            const sources: ResolvedSource[] = [];
            const evidenceOutEdges = ctx.graph.getOutgoing(evidenceNode.id);
            
            for (const evEdge of evidenceOutEdges) {
              if (evEdge.type === RelationshipType.Cites) {
                const sourceNode = ctx.graph.getNode(evEdge.targetId);
                if (sourceNode && sourceNode.manifest.nodeType === NodeType.Source) {
                  sources.push({
                    id: sourceNode.id,
                    title: sourceNode.manifest.metadata?.title || "Unknown Source",
                    url: (sourceNode.manifest.metadata as any)?.url,
                    type: (sourceNode.manifest.metadata as any)?.sourceType || "document"
                  });
                }
              }
            }

            const resolvedEvidence: ResolvedEvidence = {
              id: evidenceNode.id,
              title: evidenceNode.manifest.metadata?.title || "Untitled Evidence",
              summary: evidenceNode.manifest.metadata?.summary || "",
              confidence: (evidenceNode.manifest.metadata?.evidenceConfidence as EvidenceConfidence) || EvidenceConfidence.Medium,
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
        title: claimNode.manifest.metadata?.title || "Untitled Claim",
        summary: claimNode.manifest.metadata?.summary || "",
        supportingEvidence,
        refutingEvidence
      });
    }

    return { claims };
  }
});
