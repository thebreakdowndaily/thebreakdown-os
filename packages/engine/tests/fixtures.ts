import { KnowledgeManifest, EvidenceConfidence } from "../../compiler/types";

// Helper to create a dummy manifest
export function createManifest(
  id: string, 
  rels: { type: any; targetNodeId: string }[] = [],
  capabilities: any[] = [],
  evidenceConfidence: EvidenceConfidence = "low" as EvidenceConfidence,
  defaultJourneyId: string = "journey-1",
  alternativeJourneyIds: string[] = []
): KnowledgeManifest {
  return {
    manifestVersion: "1.0",
    schemaVersion: "1.0",
    compilerVersion: "1.0",
    generatedAt: new Date().toISOString(),
    nodeId: id,
    nodeType: "chapter",
    metadata: {
      title: `Node ${id}`,
      summary: "Test node",
      capabilities,
      evidenceConfidence,
    },
    relationships: rels as any,
    journeys: {
      defaultJourneyId,
      alternativeJourneyIds,
    },
  };
}

// A more complex graph setup for Engine reasoning tests
// A -> B (next, causes, implements)
// A -> C (causes)
// B -> D (next)
// C -> E (causes)
export const engineNodes = [
  createManifest("A", [
    { type: "next", targetNodeId: "B" },
    { type: "causes", targetNodeId: "B" },
    { type: "implements", targetNodeId: "B" },
    { type: "causes", targetNodeId: "C" }
  ], ["Timeline"], "high", "journey-main", ["journey-alt"]),
  
  createManifest("B", [
    { type: "next", targetNodeId: "D" }
  ], ["Maps"], "medium", "journey-main"),
  
  createManifest("C", [
    { type: "causes", targetNodeId: "E" }
  ], [], "low"),

  createManifest("D", [], [], "low"),
  
  createManifest("E", [], [], "low")
];
