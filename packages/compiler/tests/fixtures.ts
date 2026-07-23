export const minimalFix = {
  id: "node-1",
  type: "fix",
  title: "Minimal Test Node",
  summary: "A valid node with minimum required fields.",
  defaultJourneyId: "journey-1",
};

export const fullFix = {
  id: "node-2",
  type: "chapter",
  title: "Full Test Node",
  summary: "A node with all fields",
  evidenceConfidence: "high",
  metricsToTrack: [{ id: "metric-1", value: 100 }],
  globalExamples: [{ id: "example-1" }],
  recommendedActions: [{ id: "action-1", simulationValues: { impact: 5 } }],
  relationships: [
    { type: "causes", targetNodeId: "node-3" },
    { type: "causes", targetNodeId: "node-3" }, // Duplicate for testing
    { type: "supersedes", targetNodeId: "node-1" },
  ],
  defaultJourneyId: "journey-2",
  alternativeJourneyIds: ["journey-alt"],
};

export const invalidFix = {
  id: "node-3",
  type: "invalid_type",
  // missing title
  relationships: [
    { type: "causes", targetNodeId: "node-3" }, // Self reference
  ],
  defaultJourneyId: "journey-3",
};
