export interface ReasoningPolicy {
  version: string;
  maxRecommendations: number;
  defaultEvidenceThreshold: "high" | "medium" | "low";
  maxPrerequisiteDepth: number;
  rankingWeights: {
    sharedCauses: number;
    sharedMetrics: number;
    semanticSimilarity: number;
  };
}

export const DefaultReasoningPolicy: ReasoningPolicy = {
  version: "1.0",
  maxRecommendations: 5,
  defaultEvidenceThreshold: "low", // Show all by default
  maxPrerequisiteDepth: 3,
  rankingWeights: {
    sharedCauses: 2.0,
    sharedMetrics: 1.5,
    semanticSimilarity: 1.0,
  }
};
