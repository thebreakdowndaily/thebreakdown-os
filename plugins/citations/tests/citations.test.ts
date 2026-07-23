import { CitationEnginePlugin } from "../engine";
import { CitationsKXEPlugin, CitationsPluginState } from "../kxe";
import { GraphStore, GraphNode, GraphEdge } from "../../../packages/graph/types";
import { NodeType, RelationshipType, EvidenceConfidence, Capability } from "../../../packages/plugin-sdk";
import { EnginePluginContext } from "../../../packages/engine/types";

// Simple mock graph for testing
class MockGraphStore implements GraphStore {
  private nodes = new Map<string, GraphNode>();
  private edges: GraphEdge[] = [];

  addNode(node: GraphNode) {
    this.nodes.set(node.id, node);
  }

  addEdge(sourceId: string, targetId: string, type: RelationshipType) {
    this.edges.push({ sourceId, targetId, type });
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  exists(id: string): boolean {
    return this.nodes.has(id);
  }

  getOutgoing(id: string) {
    return this.edges.filter(e => e.sourceId === id);
  }

  getIncoming(id: string) {
    return this.edges.filter(e => e.targetId === id);
  }

  getAllEdges(): GraphEdge[] {
    return this.edges;
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }
}

function createTestNode(id: string, nodeType: string, metadata: Record<string, unknown> = {}): GraphNode {
  return {
    id,
    manifest: {
      manifestVersion: "1.0",
      schemaVersion: "1.0",
      compilerVersion: "1.0",
      generatedAt: new Date().toISOString(),
      nodeId: id,
      nodeType: nodeType as any,
      metadata: {
        title: (metadata.title as string) || id,
        summary: (metadata.summary as string) || "",
        capabilities: (metadata.capabilities as any[]) || [],
        evidenceConfidence: (metadata.evidenceConfidence as EvidenceConfidence) || EvidenceConfidence.Medium,
      },
      relationships: [],
      journeys: { defaultJourneyId: "default", alternativeJourneyIds: [] },
    },
  };
}

function runTests() {
  console.log("Running Citations Plugin Tests...");

  const graph = new MockGraphStore();

  const sourceNode = createTestNode("source-1", NodeType.Source, {
    title: "Constituent Assembly Debates",
  });

  const evidenceNode = createTestNode("evidence-1", NodeType.Evidence, {
    title: "Nehru's Speech on Objective Resolution",
    summary: "Excerpt from speech",
    evidenceConfidence: EvidenceConfidence.High,
  });

  const claimNode = createTestNode("claim-1", NodeType.Claim, {
    title: "Nehru supported a strong centre.",
    summary: "The initial objective resolution hinted at centralized power.",
  });

  const rootNode = createTestNode("chapter-1", NodeType.Chapter, {
    title: "Chapter 1",
    capabilities: [Capability.Citations],
    evidenceConfidence: EvidenceConfidence.High,
  });

  graph.addNode(sourceNode);
  graph.addNode(evidenceNode);
  graph.addNode(claimNode);
  graph.addNode(rootNode);

  graph.addEdge(claimNode.id, evidenceNode.id, RelationshipType.Supports);
  graph.addEdge(evidenceNode.id, sourceNode.id, RelationshipType.Cites);

  const ctx: EnginePluginContext = {
    graph,
    currentNode: rootNode,
    context: {
      activeNodeId: "chapter-1",
      enabledCapabilities: [Capability.Citations],
      diagnostics: [],
    },
  };

  const resolved = CitationEnginePlugin.resolve(ctx);
  
  if (!resolved || !resolved.data) {
    throw new Error("Citation Engine failed to resolve.");
  }

  const data = resolved.data as any;
  if (data.claims.length !== 1) {
    throw new Error("Expected 1 claim to be resolved.");
  }

  const claim = data.claims[0];
  if (claim.supportingEvidence.length !== 1) {
    throw new Error("Expected 1 supporting evidence.");
  }

  const evidence = claim.supportingEvidence[0];
  if (evidence.sources.length !== 1) {
    throw new Error("Expected 1 source linked to evidence.");
  }

  if (evidence.sources[0].id !== "source-1") {
    throw new Error("Source ID mismatch.");
  }

  console.log("✅ Engine resolution passed.");

  const initialState: CitationsPluginState = {
    selectedClaimId: null,
    expandedEvidenceIds: [],
    confidenceFilter: "all",
  };

  let state = CitationsKXEPlugin.update!({} as any, { type: "citations/selectClaim", payload: "claim-1" }, initialState);
  if (state.selectedClaimId !== "claim-1") throw new Error("State update failed for selectClaim");

  state = CitationsKXEPlugin.update!({} as any, { type: "citations/expandEvidence", payload: "evidence-1" }, state);
  if (!state.expandedEvidenceIds.includes("evidence-1")) throw new Error("State update failed for expandEvidence");

  state = CitationsKXEPlugin.update!({} as any, { type: "citations/setConfidenceFilter", payload: EvidenceConfidence.High }, state);
  if (state.confidenceFilter !== EvidenceConfidence.High) throw new Error("State update failed for setConfidenceFilter");

  console.log("✅ KXE state transitions passed.");
  console.log("All Citation tests passed!");
}

try {
  runTests();
} catch (err) {
  console.error("Test failed:", err);
  process.exit(1);
}
