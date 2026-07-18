import * as assert from "assert";
import React from "react";
import { renderToString } from "react-dom/server";
import { GraphStore, GraphNode, GraphEdge } from "../../../packages/graph/types";
import { KnowledgeEngine } from "../../../packages/engine/engine";
import { DefaultReasoningPolicy } from "../../../packages/engine/policy";
import { RelationshipGraphEnginePlugin, RelationshipGraphExtension } from "../engine";
import { RelationshipGraphKxePlugin } from "../kxe";
import { RelationshipGraphRenderer } from "../renderer";
import { KnowledgeExperienceEngine } from "../../../packages/kxe/kxe";
import { RendererRegistry } from "../../../packages/renderer/registry";
import { ExperienceProvider } from "../../../packages/renderer/provider";
import { PluginRegistry } from "../../../packages/plugin-sdk/registry";
import { RelationshipGraphPlugin } from "../index";
import { Capability } from "../../../packages/compiler/types";

function runTests() {
  console.log("Running Relationship Graph Plugin Tests...\n");
  let passed = 0;
  let failed = 0;

  function runTest(name: string, testFn: () => void) {
    try {
      testFn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   ${e.message}`);
      console.error(e.stack);
      failed++;
    }
  }

  // Mock Graph
  class MockGraph implements GraphStore {
    private nodes: GraphNode[] = [
      {
        id: "node-root",
        type: "chapter" as any,
        title: "Root Chapter",
        metadata: { title: "Root Chapter", capabilities: [Capability.RelationshipGraph] },
        manifest: { metadata: { title: "Root Chapter", capabilities: [Capability.RelationshipGraph] }, journeys: { defaultJourneyId: "default", alternativeJourneyIds: [] } },
        relationships: []
      } as unknown as GraphNode,
      {
        id: "node-child-1",
        type: "claim" as any,
        title: "Child Claim 1",
        metadata: { title: "Child Claim 1", capabilities: [] },
        manifest: { metadata: { title: "Child Claim 1", capabilities: [] }, journeys: { defaultJourneyId: "default", alternativeJourneyIds: [] } },
        relationships: []
      } as unknown as GraphNode,
      {
        id: "node-child-2",
        type: "evidence" as any,
        title: "Child Evidence 2",
        metadata: { title: "Child Evidence 2", capabilities: [] },
        manifest: { metadata: { title: "Child Evidence 2", capabilities: [] }, journeys: { defaultJourneyId: "default", alternativeJourneyIds: [] } },
        relationships: []
      } as unknown as GraphNode,
    ];

    private edges: GraphEdge[] = [
      { sourceId: "node-root", targetId: "node-child-1", type: "supports" as any },
      { sourceId: "node-root", targetId: "node-child-2", type: "cites" as any },
      { sourceId: "node-child-1", targetId: "node-root", type: "causes" as any }, // cycle
    ];

    getAllNodes() { return this.nodes; }
    getNodes() { return this.nodes; }
    getNode(id: string) { return this.nodes.find(n => n.id === id) || null; }
    getOutgoing(id: string) { return this.edges.filter(e => e.sourceId === id); }
    getIncoming(id: string) { return this.edges.filter(e => e.targetId === id); }
    getAllEdges() { return this.edges; }
    exists(id: string) { return !!this.getNode(id); }
    hasNode(id: string) { return this.exists(id); }
  }

  const graph = new MockGraph();
  const pluginRegistry = new PluginRegistry();
  pluginRegistry.register(RelationshipGraphPlugin);

  const engine = new KnowledgeEngine(graph, DefaultReasoningPolicy, pluginRegistry.getEnginePlugins());
  let resolvedSession: any;

  runTest("Engine Plugin resolves graph traversal deterministically", () => {
    resolvedSession = engine.resolveSession({ activeNodeId: "node-root", enabledCapabilities: [Capability.RelationshipGraph] });
    
    assert.ok(resolvedSession.extensions["relationship-graph"]);
    const ext = resolvedSession.extensions["relationship-graph"].data as RelationshipGraphExtension;
    
    // Deterministic sort order
    assert.strictEqual(ext.nodes.length, 3);
    assert.strictEqual(ext.nodes[0].id, "node-child-1");
    assert.strictEqual(ext.nodes[1].id, "node-child-2");
    assert.strictEqual(ext.nodes[2].id, "node-root");

    assert.strictEqual(ext.edges.length, 2); // default BFS ignores cycles if includeCycles is false
    assert.strictEqual(ext.edges[0].sourceId, "node-root");
    assert.strictEqual(ext.edges[0].targetId, "node-child-1");
  });

  runTest("KXE Plugin manages interactive state", () => {
    const kxe = new KnowledgeExperienceEngine(resolvedSession, 1);
    pluginRegistry.getKXEPlugins().forEach(p => kxe.registerPlugin(p));
    kxe.activatePlugin("relationship-graph");

    const state = kxe.getState();
    assert.strictEqual(state.plugins.pluginState["relationship-graph"].layout, "hierarchical");

    kxe.dispatch({ type: "relationship-graph/setLayout", payload: { layout: "radial" } });
    assert.strictEqual(kxe.getState().plugins.pluginState["relationship-graph"].layout, "radial");

    kxe.dispatch({ type: "relationship-graph/focusNode", payload: { nodeId: "node-child-1" } });
    assert.strictEqual(kxe.getState().plugins.pluginState["relationship-graph"].focusNodeId, "node-child-1");
  });

  runTest("Renderer successfully renders HTML visually", () => {
    const kxe = new KnowledgeExperienceEngine(resolvedSession, 1);
    pluginRegistry.getKXEPlugins().forEach(p => kxe.registerPlugin(p));
    kxe.activatePlugin("relationship-graph");

    const registry = new RendererRegistry();
    pluginRegistry.getRenderers().forEach(r => registry.register(r));

    const renderer = pluginRegistry.getRenderers().find(r => r.id === "relationship-graph");
    assert.ok(renderer);

    const html = renderToString(
      <ExperienceProvider engine={kxe} registry={registry}>
        {renderer.render(kxe.getState())}
      </ExperienceProvider>
    );

    assert.ok(html.includes("Relationship Graph"));
    assert.ok(html.includes("node-root"));
    assert.ok(html.includes("node-child-1"));
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
