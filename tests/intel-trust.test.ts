import { computeTrustIndex, validateWeights, TRUST_VERSION, TRUST_WEIGHTS, TRUST_COMPONENT_KEYS, trustConfidenceFromPositive } from '../lib/intel/trust';
import type { TrustInputs } from '../lib/intel/trust/types';

// Governing document: AGENTS.md (Institutional Trust Index composition)
// + docs/intelligence/mission-control-readiness.md (Phase III deliverable 5)
// Tests the reusable, engine-agnostic Trust Index service in isolation.

function makeInputs(overrides: Partial<TrustInputs> = {}): TrustInputs {
  const base: TrustInputs = {
    evidence_coverage: { value: 80, confidence: 'HIGH', evidence: ['test evidence'], limitation: 'test limitation' },
    evidence_confidence: { value: 70, confidence: 'HIGH', evidence: ['test evidence'], limitation: 'test limitation' },
    verification_completeness: { value: 60, confidence: 'MEDIUM', evidence: ['test evidence'], limitation: 'test limitation' },
    prediction_stability: { value: 50, confidence: 'MEDIUM', evidence: ['test evidence'], limitation: 'test limitation' },
    scenario_consistency: { value: 40, confidence: 'MEDIUM', evidence: ['test evidence'], limitation: 'test limitation' },
    research_completeness: { value: 30, confidence: 'MEDIUM', evidence: ['test evidence'], limitation: 'test limitation' },
    ...overrides,
  };
  return base;
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, msg: string) {
    if (cond) {
      passed++;
    } else {
      console.error(`  FAIL: ${msg}`);
      failed++;
    }
  }

  // Test 1: Published weights are explicit, sum to 1, and match AGENTS.md composition.
  try {
    assert(validateWeights(), 'Weights sum to 1');
    assert(TRUST_COMPONENT_KEYS.length === 6, 'Exactly six components');
    assert(TRUST_WEIGHTS.evidence_coverage === 0.25, 'evidence_coverage weight 0.25');
    assert(TRUST_WEIGHTS.evidence_confidence === 0.2, 'evidence_confidence weight 0.2');
    assert(TRUST_WEIGHTS.verification_completeness === 0.15, 'verification_completeness weight 0.15');
    assert(TRUST_WEIGHTS.prediction_stability === 0.15, 'prediction_stability weight 0.15');
    assert(TRUST_WEIGHTS.scenario_consistency === 0.15, 'scenario_consistency weight 0.15');
    assert(TRUST_WEIGHTS.research_completeness === 0.1, 'research_completeness weight 0.1');
    assert(TRUST_VERSION === '1.0.0', 'Trust version is explicit and versioned');
  } catch (e) {
    console.error('  FAIL: weights threw', e);
    failed++;
  }

  // Test 2: Index value is the sum of contributions, each contribution is value × weight.
  try {
    const inputs = makeInputs();
    const index = computeTrustIndex(inputs, 'test-dataset');
    const expected = inputs.evidence_coverage.value * 0.25
      + inputs.evidence_confidence.value * 0.2
      + inputs.verification_completeness.value * 0.15
      + inputs.prediction_stability.value * 0.15
      + inputs.scenario_consistency.value * 0.15
      + inputs.research_completeness.value * 0.1;
    assert(Math.abs(index.value - Math.round(expected)) <= 1, `Index equals weighted sum (${index.value} vs ${Math.round(expected)})`);
    assert(index.components.length === 6, 'Six components in output');
    for (const c of index.components) {
      const expectedContribution = Math.round(c.value * c.weight);
      assert(c.contribution === expectedContribution, `${c.key} contribution = value × weight`);
      assert(c.source.length > 0, `${c.key} names its source engine`);
      assert(c.evidence.length > 0, `${c.key} carries evidence`);
      assert(c.limitation.length > 0, `${c.key} carries a limitation`);
    }
  } catch (e) {
    console.error('  FAIL: computation threw', e);
    failed++;
  }

  // Test 3: Bounds — index and components stay within 0–100 regardless of inputs.
  try {
    const low = computeTrustIndex(makeInputs({
      evidence_coverage: { value: 0, evidence: ['e'] },
      evidence_confidence: { value: 0, evidence: ['e'] },
      verification_completeness: { value: 0, evidence: ['e'] },
      prediction_stability: { value: 0, evidence: ['e'] },
      scenario_consistency: { value: 0, evidence: ['e'] },
      research_completeness: { value: 0, evidence: ['e'] },
    }), 'test');
    assert(low.value === 0, 'All-zero inputs produce index 0');
    const high = computeTrustIndex(makeInputs({
      evidence_coverage: { value: 150, evidence: ['e'] },
      evidence_confidence: { value: 150, evidence: ['e'] },
      verification_completeness: { value: 150, evidence: ['e'] },
      prediction_stability: { value: 150, evidence: ['e'] },
      scenario_consistency: { value: 150, evidence: ['e'] },
      research_completeness: { value: 150, evidence: ['e'] },
    }), 'test');
    assert(high.value === 100, 'Over-100 inputs clamp to 100');
    assert(indexWithin(high), 'High index components stay within 0-100');
  } catch (e) {
    console.error('  FAIL: bounds threw', e);
    failed++;
  }

  function indexWithin(index: { components: Array<{ value: number; contribution: number }> }): boolean {
    return index.components.every((c) => c.value >= 0 && c.value <= 100 && c.contribution >= 0 && c.contribution <= 100);
  }

  // Test 4: Confidence aggregates from component confidences; reason string lists them.
  try {
    const allHigh = computeTrustIndex(makeInputs(), 'test');
    assert(allHigh.confidence === 'LOW', 'Fixture of 2 HIGH + 4 MEDIUM components aggregates to LOW (avg rank 2.33)');
    const allVeryHigh = computeTrustIndex(makeInputs({
      evidence_coverage: { value: 80, confidence: 'VERY_HIGH', evidence: ['e'] },
      evidence_confidence: { value: 70, confidence: 'VERY_HIGH', evidence: ['e'] },
      verification_completeness: { value: 60, confidence: 'VERY_HIGH', evidence: ['e'] },
      prediction_stability: { value: 50, confidence: 'VERY_HIGH', evidence: ['e'] },
      scenario_consistency: { value: 40, confidence: 'VERY_HIGH', evidence: ['e'] },
      research_completeness: { value: 30, confidence: 'VERY_HIGH', evidence: ['e'] },
    }), 'test');
    assert(allVeryHigh.confidence === 'HIGH', 'All-VERY_HIGH inputs aggregate to HIGH');
    const mixed = computeTrustIndex(makeInputs({
      evidence_coverage: { value: 80, confidence: 'VERY_LOW', evidence: ['e'] },
      evidence_confidence: { value: 70, confidence: 'VERY_LOW', evidence: ['e'] },
      verification_completeness: { value: 60, confidence: 'VERY_LOW', evidence: ['e'] },
      prediction_stability: { value: 50, confidence: 'VERY_LOW', evidence: ['e'] },
      scenario_consistency: { value: 40, confidence: 'VERY_LOW', evidence: ['e'] },
      research_completeness: { value: 30, confidence: 'VERY_LOW', evidence: ['e'] },
    }), 'test');
    assert(mixed.confidence === 'VERY_LOW', 'All VERY_LOW inputs produce VERY_LOW confidence');
    assert(mixed.confidenceReason.length > 0, 'Confidence reason is populated');
    assert(mixed.confidenceReason.toLowerCase().includes('evidence coverage'), 'Reason names the components');
  } catch (e) {
    console.error('  FAIL: confidence threw', e);
    failed++;
  }

  // Test 5: No value is ever AI-estimated — every component explains itself.
  try {
    const index = computeTrustIndex(makeInputs(), 'test');
    const allText = index.components.flatMap((c) => [...c.evidence, c.limitation]).join(' ');
    assert(allText.length > 0, 'Evidence and limitations are non-empty');
    assert(!allText.includes('AI'), 'No AI-estimated value appears in component narrative');
    assert(index.limitations.length >= 3, 'Global limitations include honesty statements');
  } catch (e) {
    console.error('  FAIL: honesty threw', e);
    failed++;
  }

  // Test 6: Engine-agnostic — identical inputs give identical outputs regardless of caller.
  try {
    const a = computeTrustIndex(makeInputs(), 'source-a');
    const b = computeTrustIndex(makeInputs(), 'source-b');
    assert(a.value === b.value, 'Same inputs produce same value across callers');
    assert(a.components.map((c) => c.contribution).join(',') === b.components.map((c) => c.contribution).join(','), 'Same contributions across callers');
    assert(a.dataSource === 'source-a' && b.dataSource === 'source-b', 'DataSource is caller-supplied metadata only');
  } catch (e) {
    console.error('  FAIL: reuse threw', e);
    failed++;
  }

  // Test 7: Helper confidence maps positive/total to tiers.
  try {
    assert(trustConfidenceFromPositive(90, 100) === 'VERY_HIGH', '90% positive → VERY_HIGH');
    assert(trustConfidenceFromPositive(75, 100) === 'HIGH', '75% positive → HIGH');
    assert(trustConfidenceFromPositive(50, 100) === 'MEDIUM', '50% positive → MEDIUM');
    assert(trustConfidenceFromPositive(30, 100) === 'LOW', '30% positive → LOW');
    assert(trustConfidenceFromPositive(0, 100) === 'VERY_LOW', '0% positive → VERY_LOW');
    assert(trustConfidenceFromPositive(5, 0) === 'MEDIUM', 'Zero total → MEDIUM fallback');
  } catch (e) {
    console.error('  FAIL: helper threw', e);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Intel Trust Index Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
