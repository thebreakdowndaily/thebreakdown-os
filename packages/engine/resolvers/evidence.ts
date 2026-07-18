import { GraphNode } from "../../graph/types";
import { EngineContext } from "../types";
import { ReasoningPolicy } from "../policy";

const CONFIDENCE_LEVELS = {
  high: 3,
  medium: 2,
  low: 1,
};

export class EvidenceResolver {
  constructor(private readonly policy: ReasoningPolicy) {}

  public resolve(node: GraphNode, context: EngineContext): any[] {
    // If the node doesn't have an evidence block (not fully implemented in our compiler AST yet,
    // but the node's metadata has an evidenceConfidence string), we simulate evidence resolution.
    
    // 1. Candidate Evidence
    // In a mature compiler, we'd read node.manifest.evidence[]
    // For now, we mock returning a generic evidence item if the node meets the threshold.
    
    const nodeConfidence = node.manifest.metadata.evidenceConfidence || "low";
    const threshold = context.evidenceThreshold || this.policy.defaultEvidenceThreshold;

    const nodeLevel = CONFIDENCE_LEVELS[nodeConfidence as keyof typeof CONFIDENCE_LEVELS] || 1;
    const thresholdLevel = CONFIDENCE_LEVELS[threshold as keyof typeof CONFIDENCE_LEVELS] || 1;

    // 2. Relevance Filtering
    if (nodeLevel >= thresholdLevel) {
      return [
        {
          id: `${node.id}-primary-evidence`,
          confidence: nodeConfidence,
          reason: `Meets evidence threshold '${threshold}'`,
        }
      ];
    }

    return [];
  }
}
