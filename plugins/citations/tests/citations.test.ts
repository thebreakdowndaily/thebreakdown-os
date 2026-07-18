import { CitationEnginePlugin } from "../engine";
import { CitationsKXEPlugin } from "../kxe";
import { GraphStore, GraphNode } from "../../../packages/graph/types";
import { NodeType, RelationshipType, EvidenceConfidence, Capability } from "../../../packages/plugin-sdk";
import { EnginePluginContext } from "../../../packages/engine/types";

// Simple mock graph for testing
class MockGraphStore implements GraphStore {
  private nodes = new Map<string, GraphNode>();
  private edges: Array<{ sourceId: string; targetId: string; type: RelationshipType }> = [];

  addNode(node: GraphNode) {
    this.nodes.set(node.id, node);
  }

  addEdge(sourceId: string, targetId: string, type: RelationshipType) {
    this.edges.push({ sourceId, targetId, type });
  }

  getNode(id: string): GraphNode | null {
    return this.nodes.get(id) || null;
  }

  exists(id: string): boolean {
    return this.nodes.has(id);
  }

  getOutgoingEdges(id: string) {
    return this.edges.filter(e => e.sourceId === id);
  }

  getIncomingEdges(id: string) {
    return this.edges.filter(e => e.targetId === id);
  }

  getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  // Not implemented for this mock
  query() { return []; }
  walk() { return []; }
  getNodesByType() { return []; }
}

async function runTests() {
  console.log("Running Citations Plugin Tests...");

  const graph = new MockGraphStore();

  const sourceNode: GraphNode = {
    id: "source-1",
    type: NodeType.Source as any,
    metadata: { title: "Constituent Assembly Debates", url: "https://example.com" }
  };

  const evidenceNode: GraphNode = {
    id: "evidence-1",
    type: NodeType.Evidence as any,
    metadata: { title: "Nehru's Speech on Objective Resolution", summary: "Excerpt from speech", evidenceConfidence: EvidenceConfidence.High }
  };

  const claimNode: GraphNode = {
    id: "claim-1",
    type: NodeType.Claim as any,
    metadata: { title: "Nehru supported a strong centre.", summary: "The initial objective resolution hinted at centralized power." }
  };

  const rootNode: GraphNode = {
    id: "chapter-1",
    type: NodeType.Chapter as any,
    metadata: { title: "Chapter 1", summary: "", capabilities: [Capability.Citations] as any, evidenceConfidence: EvidenceConfidence.High }
  };

  graph.addNode(sourceNode);
  graph.addNode(evidenceNode);
  graph.addNode(claimNode);
  graph.addNode(rootNode);

  // Edges
  graph.addEdge(claimNode.id, evidenceNode.id, RelationshipType.Supports);
  graph.addEdge(evidenceNode.id, sourceNode.id, RelationshipType.Cites);

  // Test Engine
  const ctx: EnginePluginContext = {
    graph,
    currentNode: rootNode,
    session: {
      id: "session-1",
      currentNodeId: "chapter-1",
      capabilities: [Capability.Citations],
      journey: { defaultPath: [], alternatives: [] },
      prerequisites: { required: [], met: [], missing: [] },
      extensions: {}
    } as any
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

  // Test KXE State Updates
  let state = CitationsKXEPlugin.initialState;
  
  state = CitationsKXEPlugin.update({} as any, { type: "citations/selectClaim", payload: "claim-1" }, state);
  if (state.selectedClaimId !== "claim-1") throw new Error("State update failed for selectClaim");

  state = CitationsKXEPlugin.update({} as any, { type: "citations/expandEvidence", payload: "evidence-1" }, state);
  if (!state.expandedEvidenceIds.includes("evidence-1")) throw new Error("State update failed for expandEvidence");

  state = CitationsKXEPlugin.update({} as any, { type: "citations/setConfidenceFilter", payload: EvidenceConfidence.High }, state);
  if (state.confidenceFilter !== EvidenceConfidence.High) throw new Error("State update failed for setConfidenceFilter");

  console.log("✅ KXE state transitions passed.");

  console.log("All Citation tests passed!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
