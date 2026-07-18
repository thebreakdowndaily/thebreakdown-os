import * as assert from "assert";
import { compareVersions, isCompatible, PluginCompatibilityError } from "../compatibility";
import { PluginRegistry, KOSPlugin } from "../registry";
import { Capability } from "../../../packages/compiler/types";

function runTests() {
  console.log("Running Plugin Compatibility Tests...\n");
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

  runTest("compareVersions works correctly", () => {
    assert.strictEqual(compareVersions("1.0.0", "1.0.0"), 0);
    assert.strictEqual(compareVersions("2.0.0", "1.0.0"), 1);
    assert.strictEqual(compareVersions("1.0.0", "2.0.0"), -1);
    assert.strictEqual(compareVersions("1.1.0", "1.0.0"), 1);
    assert.strictEqual(compareVersions("1.0.1", "1.0.0"), 1);
  });

  runTest("isCompatible works correctly", () => {
    assert.strictEqual(isCompatible("1.0.0", "1.0.0"), true);
    assert.strictEqual(isCompatible("1.0.0", "2.0.0"), true);
    assert.strictEqual(isCompatible("2.0.0", "1.9.9"), false);
    assert.strictEqual(isCompatible("1.0.1", "1.0.0"), false);
    assert.strictEqual(isCompatible("1.2.3", "1.2.3"), true);
  });

  runTest("PluginRegistry throws on incompatible plugin", () => {
    const registry = new PluginRegistry();
    const badPlugin: KOSPlugin = {
      manifest: {
        id: "future-plugin",
        version: "1.0.0",
        apiVersion: "1.0.0",
        displayName: "Future Plugin",
        capabilities: [Capability.Timeline], // using any valid capability
        minimumKOSVersion: "99.0.0"
      }
    };
    
    let caught = false;
    try {
      registry.register(badPlugin);
    } catch (err) {
      caught = true;
      assert.ok(err instanceof PluginCompatibilityError);
      if (err instanceof PluginCompatibilityError) {
        assert.strictEqual(err.pluginId, "future-plugin");
        assert.strictEqual(err.requiredVersion, "99.0.0");
      }
    }
    assert.strictEqual(caught, true, "Expected PluginCompatibilityError to be thrown");
  });

  runTest("PluginRegistry succeeds on compatible plugin", () => {
    const registry = new PluginRegistry();
    const goodPlugin: KOSPlugin = {
      manifest: {
        id: "good-plugin",
        version: "1.0.0",
        apiVersion: "1.0.0",
        displayName: "Good Plugin",
        capabilities: [Capability.Timeline],
        minimumKOSVersion: "1.0.0"
      }
    };
    
    registry.register(goodPlugin);
    assert.strictEqual(registry.getManifests().length, 1);
    assert.strictEqual(registry.getManifests()[0].id, "good-plugin");
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
