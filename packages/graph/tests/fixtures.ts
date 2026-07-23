import { KnowledgeManifest } from "../../compiler/types";

// Helper to create a dummy manifest
export function createManifest(id: string, rels: { type: any; targetNodeId: string }[] = []): KnowledgeManifest {
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
      capabilities: [],
      evidenceConfidence: "high",
    },
    relationships: rels as any,
    journeys: {
      defaultJourneyId: "default",
      alternativeJourneyIds: [],
    },
  };
}

// A valid interconnected graph
// A causes B, B causes C
// A contradicts D
// D contradicts A (Cycle allowed for contradicts)
export const validNodes = [
  createManifest("A", [
    { type: "causes", targetNodeId: "B" },
    { type: "contradicts", targetNodeId: "D" }
  ]),
  createManifest("B", [
    { type: "causes", targetNodeId: "C" }
  ]),
  createManifest("C", []),
  createManifest("D", [
    { type: "contradicts", targetNodeId: "A" }
  ])
];

// Graph with a cycle in 'causes' (Not Allowed)
// E causes F, F causes G, G causes E
export const cycleNodes = [
  createManifest("E", [
    { type: "causes", targetNodeId: "F" }
  ]),
  createManifest("F", [
    { type: "causes", targetNodeId: "G" }
  ]),
  createManifest("G", [
    { type: "causes", targetNodeId: "E" }
  ])
];

// Graph with dangling reference
export const danglingNodes = [
  createManifest("H", [
    { type: "causes", targetNodeId: "NON_EXISTENT_NODE" }
  ])
];

// Graph with duplicates
export const duplicateNodes = [
  createManifest("Dup"),
  createManifest("Dup")
];
