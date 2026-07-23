import * as assert from "assert";
import React from "react";
import { renderToString } from "react-dom/server";
import { GraphStore, GraphNode } from "../../../packages/graph/types";
import { KnowledgeEngine } from "../../../packages/engine/engine";
import { DefaultReasoningPolicy } from "../../../packages/engine/policy";
import { TimelineEnginePlugin, TimelineExtensionData } from "../engine";
import { TimelineKXEPlugin } from "../kxe";
import { TimelineRenderer } from "../renderer";
import { KnowledgeExperienceEngine } from "../../../packages/kxe/kxe";
import { RendererRegistry } from "../../../packages/renderer/registry";
import { ExperienceProvider } from "../../../packages/renderer/provider";
import { PluginRegistry } from "../../../packages/plugin-sdk/registry";
import { TimelinePlugin } from "../index";

function runTests() {
  console.log("Running Timeline Plugin Tests...\n");
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
      failed++;
    }
  }

  // 1. Mock Graph with Temporal Data
  class MockGraph implements GraphStore {
    getAllNodes() {
      return [
        {
          id: "event-1",
          manifest: {
            metadata: { title: "Independence", summary: "Independence", capabilities: [], evidenceConfidence: "medium" as any, temporal: { start: "1947", precision: "year" as const } },
            journeys: { defaultJourneyId: "default", alternativeJourneyIds: [] },
            nodeId: "event-1", nodeType: "chapter" as any, manifestVersion: "1.0" as const, schemaVersion: "1.0" as const, compilerVersion: "1.0" as const, generatedAt: "", relationships: [],
          },
        } as GraphNode,
        {
          id: "event-2",
          manifest: {
            metadata: { title: "Republic", summary: "Republic", capabilities: [], evidenceConfidence: "medium" as any, temporal: { start: "1950", end: "1950", precision: "year" as const } },
            journeys: { defaultJourneyId: "default", alternativeJourneyIds: [] },
            nodeId: "event-2", nodeType: "chapter" as any, manifestVersion: "1.0" as const, schemaVersion: "1.0" as const, compilerVersion: "1.0" as const, generatedAt: "", relationships: [],
          },
        } as GraphNode,
        {
          id: "event-3",
          manifest: {
            metadata: { title: "No Date", summary: "No Date", capabilities: [], evidenceConfidence: "medium" as any },
            journeys: { defaultJourneyId: "default", alternativeJourneyIds: [] },
            nodeId: "event-3", nodeType: "chapter" as any, manifestVersion: "1.0" as const, schemaVersion: "1.0" as const, compilerVersion: "1.0" as const, generatedAt: "", relationships: [],
          },
        } as GraphNode
      ];
    }
    getNodes() { return this.getAllNodes(); } // Alias for our timeline plugin implementation
    getNode(id: string) { return this.getAllNodes().find(n => n.id === id); }
    getOutgoing(id: string) { return []; }
    getIncoming(id: string) { return []; }
    getAllEdges() { return []; }
    exists(id: string) { return !!this.getNode(id); }
    hasNode(id: string) { return this.exists(id); }
  }

  const graph = new MockGraph();
  
  const pluginRegistry = new PluginRegistry();
  pluginRegistry.register(TimelinePlugin);
  
  const engine = new KnowledgeEngine(graph, DefaultReasoningPolicy, pluginRegistry.getEnginePlugins());

  let resolvedSession: any;

  runTest("Engine Plugin resolves chronological events", () => {
    resolvedSession = engine.resolveSession({ activeNodeId: "event-1", enabledCapabilities: ["timeline" as any] });
    
    assert.ok(resolvedSession.extensions["timeline"]);
    const timelineData = resolvedSession.extensions["timeline"].data as TimelineExtensionData;
    
    assert.strictEqual(timelineData.events.length, 2);
    assert.strictEqual(timelineData.events[0].startYear, 1947);
    assert.strictEqual(timelineData.events[1].startYear, 1950);
  });

  runTest("KXE Plugin initializes and handles namespaced actions", () => {
    const kxe = new KnowledgeExperienceEngine(resolvedSession, 1);
    pluginRegistry.getKXEPlugins().forEach(p => kxe.registerPlugin(p));
    kxe.activatePlugin("timeline");

    const state = kxe.getState();
    assert.strictEqual((state.plugins.pluginState["timeline"] as any).selectedYear, null);

    kxe.dispatch({ type: "timeline/selectYear", payload: 1947 });
    assert.strictEqual((kxe.getState().plugins.pluginState["timeline"] as any).selectedYear, 1947);

    kxe.dispatch({ type: "timeline/play" });
    assert.strictEqual((kxe.getState().plugins.pluginState["timeline"] as any).isPlaying, true);
  });

  runTest("Renderer renders timeline visually", () => {
    const kxe = new KnowledgeExperienceEngine(resolvedSession, 1);
    pluginRegistry.getKXEPlugins().forEach(p => kxe.registerPlugin(p));
    kxe.activatePlugin("timeline");
    kxe.dispatch({ type: "timeline/selectYear", payload: 1950 });

    const registry = new RendererRegistry();
    pluginRegistry.getRenderers().forEach(r => registry.register(r));

    // Render directly using TimelineRenderer
    const renderer = pluginRegistry.getRenderers()[0];
    const html = renderToString(
      <ExperienceProvider engine={kxe} registry={registry}>
        {renderer.render(kxe.getState())}
      </ExperienceProvider>
    );

    assert.ok(html.includes("Interactive Timeline") || html.includes("Timeline"));
    assert.ok(html.includes("1947"));
    assert.ok(html.includes("Independence"));
    assert.ok(html.includes("1950"));
    assert.ok(html.includes("Republic"));
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
