import * as assert from "assert";
import { KnowledgeExperienceEngine } from "../kxe";
import { ResolvedKnowledgeSession } from "../../engine/types";
import { KXEPlugin, ExperienceState, ExperienceAction } from "../types";
import { StageGuard } from "../managers/stage";

// Mock session
const mockSession = {
  sessionMetadata: { engineVersion: "1.0", graphVersion: "1.0", policyVersion: "1.0", generatedAt: "", reasoningDurationMs: 0 },
  currentNode: { id: "mockNode" } as any,
  activeJourney: { id: "journey-1", nextSteps: [], previousSteps: [] },
  capabilities: [],
  relevantEvidence: [],
  prerequisites: [],
  recommendations: [],
  diagnostics: []
} as ResolvedKnowledgeSession;

function runTests() {
  console.log("Running KXE Tests...\n");
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

  runTest("Initialization", () => {
    const kxe = new KnowledgeExperienceEngine(mockSession, 3);
    const state = kxe.getState();
    assert.strictEqual(state.navigation.currentStageIndex, 0);
    assert.strictEqual(state.navigation.totalStages, 3);
    assert.strictEqual(state.navigation.canGoNext, true);
    assert.strictEqual(state.navigation.canGoPrevious, false);
  });

  runTest("Stage Navigation & Boundaries", () => {
    const kxe = new KnowledgeExperienceEngine(mockSession, 3);
    
    // 0 -> 1
    kxe.nextStage();
    assert.strictEqual(kxe.getState().navigation.currentStageIndex, 1);
    assert.strictEqual(kxe.getState().navigation.canGoPrevious, true);

    // 1 -> 2
    kxe.nextStage();
    assert.strictEqual(kxe.getState().navigation.currentStageIndex, 2);
    assert.strictEqual(kxe.getState().navigation.canGoNext, false);

    // 2 -> 3 (Should fail/ignore due to boundary)
    kxe.nextStage();
    assert.strictEqual(kxe.getState().navigation.currentStageIndex, 2); // still 2
    const diags = kxe.getState().diagnostics;
    assert.ok(diags.find(d => d.type === "INVALID_TRANSITION"));

    // Jump
    kxe.jumpToStage(0);
    assert.strictEqual(kxe.getState().navigation.currentStageIndex, 0);
  });

  runTest("Stage Guards", () => {
    const kxe = new KnowledgeExperienceEngine(mockSession, 3);
    let allowLeave = false;

    const guard: StageGuard = {
      canEnter: () => true,
      canLeave: () => allowLeave,
    };

    kxe.registerGuard(0, guard);

    kxe.nextStage(); // blocked
    assert.strictEqual(kxe.getState().navigation.currentStageIndex, 0);

    allowLeave = true;
    kxe.nextStage(); // allowed
    assert.strictEqual(kxe.getState().navigation.currentStageIndex, 1);
  });

  runTest("Plugin Lifecycle & Immutability", () => {
    const kxe = new KnowledgeExperienceEngine(mockSession, 3);
    let initialized = false;
    let activated = false;
    let deactivated = false;

    const testPlugin: KXEPlugin<{ count: number }> = {
      id: "test-plugin",
      name: "Test Plugin",
      initialize() { initialized = true; },
      activate(state) {
        activated = true;
        return { count: 0 };
      },
      update(state, action, pluginState) {
        if (action.type === "INCREMENT") {
          return { count: pluginState.count + 1 };
        }
        return pluginState;
      },
      deactivate() {
        deactivated = true;
      }
    };

    kxe.registerPlugin(testPlugin);
    assert.ok(initialized);

    kxe.activatePlugin("test-plugin");
    assert.ok(activated);
    
    const state1 = kxe.getState();
    assert.deepStrictEqual(state1.plugins.activeIds, ["test-plugin"]);
    assert.strictEqual((state1.plugins.pluginState["test-plugin"] as any).count, 0);

    // Dispatch a custom action to trigger plugin update
    kxe.dispatch({ type: "INCREMENT" });

    const state2 = kxe.getState();
    assert.strictEqual((state2.plugins.pluginState["test-plugin"] as any).count, 1);

    // Verify Immutability
    assert.notStrictEqual(state1, state2); // entire state changed
    assert.notStrictEqual(state1.plugins, state2.plugins);

    kxe.deactivatePlugin("test-plugin");
    assert.ok(deactivated);
    assert.deepStrictEqual(kxe.getState().plugins.activeIds, []);
  });

  runTest("Reducer and Edge Case Coverage", () => {
    const kxe = new KnowledgeExperienceEngine(mockSession, 3);
    
    // Jump to invalid stage
    kxe.jumpToStage(5);
    assert.strictEqual(kxe.getState().navigation.currentStageIndex, 0);

    // Jump to stage 1, then previous stage
    kxe.jumpToStage(1);
    kxe.previousStage();
    assert.strictEqual(kxe.getState().navigation.currentStageIndex, 0);

    // Try previous stage when already at 0
    kxe.previousStage();
    assert.strictEqual(kxe.getState().navigation.currentStageIndex, 0);

    // Try to activate unknown plugin
    kxe.activatePlugin("unknown-plugin");

    // Try to deactivate unknown plugin
    kxe.deactivatePlugin("unknown-plugin");

    // Register a plugin
    kxe.registerPlugin({ id: "valid-plugin", name: "Valid" });
    
    // Activate it
    kxe.activatePlugin("valid-plugin");

    // Activate it again (duplicate)
    kxe.activatePlugin("valid-plugin");

    // UI actions
    kxe.dispatch({ type: "SET_TRANSITIONING", payload: true });
    assert.strictEqual(kxe.getState().ui.isTransitioning, true);

    kxe.dispatch({ type: "SET_UI_STATE", payload: { loading: true } });
    assert.strictEqual(kxe.getState().ui.transientState.loading, true);
  });

  runTest("Subscriber Resilience", () => {
    const kxe = new KnowledgeExperienceEngine(mockSession, 3);
    let callCount = 0;

    kxe.subscribe(() => {
      throw new Error("I am a bad subscriber");
    });

    kxe.subscribe(() => {
      callCount++;
    });

    // Despite the first subscriber throwing, the second should still execute.
    kxe.dispatch({ type: "NEXT_STAGE" });
    assert.strictEqual(callCount, 1);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
