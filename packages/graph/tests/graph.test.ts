import * as assert from "assert";
import { GraphBuilder, GraphValidator, GraphQueries, GraphContext } from "../index";
import { validNodes, cycleNodes, danglingNodes, duplicateNodes, createManifest } from "./fixtures";
import { compile } from "../../compiler/index";

function runTests() {
  console.log("Running Knowledge Graph Tests...\n");
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

  runTest("Graph Construction and Lookup", () => {
    const ctx = new GraphContext({ strictMode: true });
    const builder = new GraphBuilder(ctx);
    builder.ingestAll(validNodes);
    const store = builder.build();

    assert.strictEqual(store.getAllNodes().length, 4, "Should have 4 nodes");
    assert.strictEqual(ctx.statistics.nodeCount, 4);
    assert.ok(store.exists("A"), "Node A should exist");
    
    // Check incoming/outgoing edges
    const outgoingA = store.getOutgoing("A");
    assert.strictEqual(outgoingA.length, 2);
    
    const incomingC = store.getIncoming("C");
    assert.strictEqual(incomingC.length, 1);
    assert.strictEqual(incomingC[0].sourceId, "B");
  });

  runTest("Duplicate Node IDs fail before edge construction", () => {
    const ctx = new GraphContext({ strictMode: true });
    const builder = new GraphBuilder(ctx);
    builder.ingestAll(duplicateNodes);
    
    assert.strictEqual(ctx.diagnostics.length, 1, "Should flag 1 error");
    assert.strictEqual(ctx.diagnostics[0].code, "GRAPH-001");
    
    const store = builder.build();
    assert.strictEqual(store.getAllNodes().length, 1, "Only one node should actually exist");
  });

  runTest("Strict vs Relaxed Mode on dangling references", () => {
    const strictCtx = new GraphContext({ strictMode: true });
    const relaxedCtx = new GraphContext({ strictMode: false });
    
    const strictBuilder = new GraphBuilder(strictCtx);
    const relaxedBuilder = new GraphBuilder(relaxedCtx);
    
    strictBuilder.ingestAll(danglingNodes);
    relaxedBuilder.ingestAll(danglingNodes);
    
    const strictStore = strictBuilder.build();
    const relaxedStore = relaxedBuilder.build();

    const strictValidator = new GraphValidator(strictCtx);
    const relaxedValidator = new GraphValidator(relaxedCtx);

    strictValidator.validate(strictStore);
    relaxedValidator.validate(relaxedStore);

    assert.strictEqual(strictCtx.diagnostics[0].severity, "error", "Strict mode flags error");
    assert.strictEqual(relaxedCtx.diagnostics[0].severity, "warning", "Relaxed mode flags warning");
  });

  runTest("Cycle Detection constraints", () => {
    const ctx = new GraphContext({ strictMode: true });
    const builder = new GraphBuilder(ctx);
    builder.ingestAll(cycleNodes);
    const store = builder.build();

    const validator = new GraphValidator(ctx);
    validator.validate(store);

    const hasCycleError = ctx.diagnostics.some(d => d.code === "GRAPH-003");
    assert.ok(hasCycleError, "Should detect cycle in 'causes' relationship");

    // Valid graph (with 'contradicts' cycle) should NOT flag GRAPH-003
    const ctx2 = new GraphContext({ strictMode: true });
    const builder2 = new GraphBuilder(ctx2);
    builder2.ingestAll(validNodes);
    const store2 = builder2.build();
    new GraphValidator(ctx2).validate(store2);
    const hasCycleError2 = ctx2.diagnostics.some(d => d.code === "GRAPH-003");
    assert.strictEqual(hasCycleError2, false, "Should allow cycle in 'contradicts' relationship");
  });

  runTest("Deterministic Queries", () => {
    const ctx = new GraphContext({ strictMode: true });
    const builder = new GraphBuilder(ctx);
    
    // Ingest out of order to ensure deterministic behavior
    builder.ingest(createManifest("C"));
    builder.ingest(createManifest("A", [{ type: "causes", targetNodeId: "B" }]));
    builder.ingest(createManifest("B", [{ type: "causes", targetNodeId: "C" }]));
    
    const store = builder.build();
    const queries = new GraphQueries(store);

    // B -> outgoing -> [C], incoming -> [A]
    // Traverse 'both' direction
    const result1 = queries.traverse("B", { direction: "both" });
    const result2 = queries.traverse("B", { direction: "both" });

    // Node IDs returned: A, C
    assert.strictEqual(result1.nodes.length, 2);
    assert.strictEqual(result1.nodes[0].id, "A");
    assert.strictEqual(result1.nodes[1].id, "C");
    assert.strictEqual(result1.edgesTraversed, 4);

    assert.deepStrictEqual(result1.nodes.map(n => n.id), result2.nodes.map(n => n.id), "Queries should be deterministic");
    assert.throws(() => queries.traverse("B", { strategy: "DFS" }), /DFS traversal strategy is not yet implemented/);
  });
  
  runTest("Max Depth Traversal limits", () => {
    const ctx = new GraphContext({ strictMode: true });
    const builder = new GraphBuilder(ctx);
    builder.ingestAll(validNodes); // A -> B -> C
    const store = builder.build();
    const queries = new GraphQueries(store);
    
    // Depth 1 outgoing from A should only find B and D (due to A -> B and A -> D)
    const resultDepth1 = queries.traverse("A", { maxDepth: 1, direction: "outgoing" });
    assert.strictEqual(resultDepth1.nodes.length, 2);
    assert.strictEqual(resultDepth1.truncated, true);
    assert.strictEqual(resultDepth1.depthReached, 1);
    const ids = resultDepth1.nodes.map(n => n.id).sort();
    assert.deepStrictEqual(ids, ["B", "D"]);
    
    // Depth 2 outgoing from A should find B, C, D
    const resultDepth2 = queries.traverse("A", { maxDepth: 2, direction: "outgoing" });
    assert.strictEqual(resultDepth2.nodes.length, 3);
    const ids2 = resultDepth2.nodes.map(n => n.id).sort();
    assert.deepStrictEqual(ids2, ["B", "C", "D"]);
  });

  runTest("Compiler -> Graph Snapshot Regression", () => {
    const rawContent = {
      id: "test-snapshot",
      type: "chapter",
      title: "Test Snapshot",
      summary: "Test",
      defaultJourneyId: "test-journey",
      relationships: [
        { type: "causes", targetNodeId: "node-b" }
      ]
    };
    
    // Compile
    const { manifest } = compile(rawContent);
    assert.ok(manifest, "Manifest should successfully compile");
    
    // Build Graph
    const ctx = new GraphContext({ strictMode: true });
    const builder = new GraphBuilder(ctx);
    builder.ingest(manifest!);
    const store = builder.build();
    
    const nodes = store.getAllNodes();
    assert.strictEqual(nodes.length, 1);
    
    // Create serialized snapshot and verify
    const serialized = JSON.stringify(nodes.map(n => ({ id: n.id, edges: store.getOutgoing(n.id) })));
    const expected = '[{"id":"test-snapshot","edges":[{"sourceId":"test-snapshot","targetId":"node-b","type":"causes"}]}]';
    assert.strictEqual(serialized, expected, "Graph serialized snapshot should exactly match compiler output deterministic wiring");
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
