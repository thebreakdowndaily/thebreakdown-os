import * as assert from "assert";
import { GraphBuilder, GraphContext } from "../../graph/index";
import { KnowledgeEngine, DefaultReasoningPolicy, EngineContext, Recommendation, RankingStrategy } from "../index";
import { engineNodes } from "./fixtures";
import { GraphNode, GraphStore } from "../../graph/types";

function runTests() {
  console.log("Running Knowledge Engine Tests...\n");
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

  // Setup Graph
  const ctx = new GraphContext({ strictMode: true });
  const builder = new GraphBuilder(ctx);
  builder.ingestAll(engineNodes);
  const store = builder.build();

  runTest("Session Resolution & Full Pipeline", () => {
    const engine = new KnowledgeEngine(store);
    const session = engine.resolveSession({ activeNodeId: "A" });

    // Current Node
    assert.strictEqual(session.currentNode.id, "A");
    
    // Metadata
    assert.ok(session.sessionMetadata);
    assert.strictEqual(session.sessionMetadata.engineVersion, "1.0");

    // Journey
    assert.strictEqual(session.activeJourney.id, "journey-main");
    assert.strictEqual(session.activeJourney.nextSteps.length, 1);
    assert.strictEqual(session.activeJourney.nextSteps[0].id, "B");
    assert.strictEqual(session.activeJourney.previousSteps.length, 0);

    // Capabilities
    assert.deepStrictEqual(session.capabilities, ["Timeline"]);

    // Evidence
    assert.strictEqual(session.relevantEvidence.length, 1);
    assert.strictEqual(session.relevantEvidence[0].confidence, "high");

    // Prerequisites (A has 'causes' and 'implements' edges to B, and 'causes' to C)
    // C has 'causes' to E.
    // So B, C, and E should be prerequisites for A.
    assert.strictEqual(session.prerequisites.length, 3);
    const pIds = session.prerequisites.map(p => p.node.id).sort();
    assert.deepStrictEqual(pIds, ["B", "C", "E"]);
    assert.strictEqual(session.prerequisites[0].level, "required");

    // Recommendations
    // A shares targets? A -> B, A -> C.
    // We expect the default ranking strategy to return an array of recommendations.
    assert.ok(Array.isArray(session.recommendations));
  });

  runTest("Journey Fallback", () => {
    const engine = new KnowledgeEngine(store);
    
    // Request invalid journey
    const session = engine.resolveSession({ 
      activeNodeId: "A",
      activeJourneyId: "invalid-journey"
    });

    // Should fallback to default 'journey-main'
    assert.strictEqual(session.activeJourney.id, "journey-main");

    // Request valid alternative journey
    const sessionAlt = engine.resolveSession({ 
      activeNodeId: "A",
      activeJourneyId: "journey-alt"
    });

    assert.strictEqual(sessionAlt.activeJourney.id, "journey-alt");
  });

  runTest("Policy Constraints", () => {
    const policy = { ...DefaultReasoningPolicy, maxRecommendations: 1 };
    const engine = new KnowledgeEngine(store, policy);

    // B has 'next' -> D. If D also had something, etc.
    // Let's just mock a ranking strategy to ensure limits are respected.
    class MockStrategy implements RankingStrategy {
      rank(node: GraphNode, context: EngineContext, graph: GraphStore): Recommendation[] {
        const nodes = graph.getAllNodes();
        const recs = nodes.map(n => ({
          node: n,
          score: 1,
          reason: "mock"
        }));
        return recs.slice(0, context.maxRecommendations ?? policy.maxRecommendations);
      }
    }

    // Since KnowledgeEngine instantiates its own RankingResolver with SharedEdgeRankingStrategy,
    // we test the context override first if supported. But our RankingResolver uses strategy directly.
    // Wait, let's just use the real engine and pass a maxRecommendations in context.
    const session = engine.resolveSession({ 
      activeNodeId: "A",
      maxRecommendations: 1
    });

    assert.ok(session.recommendations.length <= 1, "Should respect maxRecommendations constraint");
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
