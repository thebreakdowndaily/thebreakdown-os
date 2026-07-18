import * as assert from "assert";
import { compile } from "../index";
import { minimalFix, fullFix, invalidFix } from "./fixtures";

function runTests() {
  console.log("Running KOS Compiler Tests...\n");

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

  // 1. Idempotence & Correctness
  runTest("Minimal compilation succeeds", () => {
    const result = compile(minimalFix);
    assert.ok(result.manifest, "Manifest should be generated");
    assert.strictEqual(result.validation.valid, true, "Validation should be valid");
    assert.strictEqual(result.manifest.metadata.title, "Minimal Test Node");
    assert.strictEqual(result.manifest.metadata.capabilities.length, 0);
  });

  runTest("Idempotence - two compiles produce identical output", () => {
    const r1 = compile(fullFix);
    const r2 = compile(fullFix);
    
    assert.ok(r1.manifest);
    assert.ok(r2.manifest);

    // generatedAt will differ, so we ignore it for equivalence
    const m1 = { ...r1.manifest, generatedAt: "" };
    const m2 = { ...r2.manifest, generatedAt: "" };
    
    assert.deepStrictEqual(m1, m2);
  });

  // 2. Canonical Array Sorting & Deduplication
  runTest("Canonical sorting and deduplication", () => {
    const result = compile(fullFix);
    assert.ok(result.manifest);
    
    // Capabilities should be alphabetically sorted
    // fullFix has Metrics, Comparison, Simulation (via capability rules)
    const expectedCapabilities = ["comparison", "metrics", "simulation"];
    assert.deepStrictEqual(result.manifest.metadata.capabilities, expectedCapabilities);

    // Relationships should be deduplicated and sorted by type, then targetId
    // causes: node-3 (duplicate removed)
    // supersedes: node-1
    assert.strictEqual(result.manifest.relationships.length, 2);
    assert.strictEqual(result.manifest.relationships[0].type, "causes");
    assert.strictEqual(result.manifest.relationships[0].targetNodeId, "node-3");
    assert.strictEqual(result.manifest.relationships[1].type, "supersedes");
    assert.strictEqual(result.manifest.relationships[1].targetNodeId, "node-1");
  });

  // 3. Invalid Schema Detection
  runTest("Invalid schema and self-reference detection", () => {
    const result = compile(invalidFix);
    assert.strictEqual(result.manifest, null, "Manifest should not be returned for invalid node");
    assert.strictEqual(result.validation.valid, false, "Validation should fail");
    
    const codes = result.validation.diagnostics.map(d => d.code);
    assert.ok(codes.includes("KCOMP-011"), "Should detect invalid nodeType");
    assert.ok(codes.includes("KCOMP-010"), "Should detect missing title");
    assert.ok(codes.includes("REL-201"), "Should detect self-reference");
  });

  // 4. Validator Edge Cases & Relationship Errors
  runTest("Validator limits and relationship errors", () => {
    const hugeNode = {
      id: "huge-node",
      type: "chapter",
      title: "A".repeat(256), // Exceeds title limit
      relationships: Array.from({ length: 101 }).map((_, i) => ({
        type: "invalid_type",
        targetNodeId: `target-${i}`,
      })),
      defaultJourneyId: "journey-1",
    };
    
    // Also include a completely invalid relationship missing target
    hugeNode.relationships.push({ type: "causes" } as any);

    const result = compile(hugeNode);
    // Because title limit is an error, it should not produce a valid manifest
    assert.strictEqual(result.validation.valid, false, "Validation should fail due to title length");
    assert.strictEqual(result.manifest, null);

    const codes = result.validation.diagnostics.map((d) => d.code);
    assert.ok(codes.includes("VALIDATION-103"), "Should detect title length limit");
    // Wait, the relationship limit (VALIDATION-102) is a warning.
    // The type invalid (REL-204) is a warning.
    // The missing target (REL-203) is a warning.
    assert.ok(codes.includes("VALIDATION-102"), "Should detect relationship count limit");
    assert.ok(codes.includes("REL-204"), "Should detect unknown relationship type");
    assert.ok(codes.includes("REL-203"), "Should detect missing relationship target");
  });

  runTest("Null or non-object input is rejected", () => {
    const result = compile(null);
    assert.strictEqual(result.manifest, null, "Should return null manifest");
    assert.strictEqual(result.validation.valid, false, "Should be marked invalid");
    assert.strictEqual(result.validation.diagnostics[0].code, "KCOMP-001", "Should return ParseError KCOMP-001");
  });

  runTest("Builder throws on missing properties", () => {
    const builder = new (require("../manifest-builder").ManifestBuilder)();
    try {
      builder.build();
      assert.fail("Should have thrown ManifestValidationError");
    } catch (e: any) {
      assert.ok(e.message.includes("Missing required properties"));
    }
  });

  runTest("Invalid evidence confidence and relationships not array", () => {
    const result = compile({ 
      ...minimalFix, 
      evidenceConfidence: "invalid_conf",
      relationships: "not_an_array" 
    });
    const codes = result.validation.diagnostics.map((d: any) => d.code);
    assert.ok(codes.includes("VALIDATION-105"), "Should detect invalid confidence");
    assert.ok(codes.includes("REL-202"), "Should detect non-array relationships");
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
