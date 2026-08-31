/**
 * THE BREAKDOWN — Trust Metrics Engine Tests
 *
 * Validates the dynamic calculations of the Trust Metrics engine,
 * covering average trust score, evidence debt, verification dates, and fallbacks.
 */

import { getCanonicalTrustMetrics } from '../lib/knowledge/trust-metrics';
import { getKnowledgeCore, seedAll } from '../lib/knowledge/knowledge-core';

function assert(condition: boolean, name: string, results: { passed: number; failed: number }) {
  if (condition) {
    console.log(`  PASS: ${name}`);
    results.passed++;
  } else {
    console.error(`  FAIL: ${name}`);
    results.failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, name: string, results: { passed: number; failed: number }) {
  if (actual === expected) {
    console.log(`  PASS: ${name}`);
    results.passed++;
  } else {
    console.error(`  FAIL: ${name} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    results.failed++;
  }
}

async function runTests() {
  const r = { passed: 0, failed: 0 };

  console.log('\n── Trust Metrics Engine Tests ──');

  try {
    seedAll();
    const core = getKnowledgeCore();

    // Fetch the calculated metrics
    const metrics = await getCanonicalTrustMetrics();

    // 1. Validate average trust score calculation
    console.log('\n── Average Trust Score ──');
    assert(metrics.averageTrustScore !== undefined, 'averageTrustScore is computed and defined', r);
    assert(metrics.averageTrustScore! >= 0 && metrics.averageTrustScore! <= 100, 'averageTrustScore is a percentage between 0 and 100', r);
    console.log(`  Value computed: ${metrics.averageTrustScore}`);

    // 2. Validate evidence debt calculation
    console.log('\n── Evidence Debt ──');
    const allClaims = core.claims.all();
    const debatedClaimsCount = allClaims.filter(c => c.confidence === 'debated' || c.confidence === 'contested').length;
    assertEqual(metrics.evidenceDebt, debatedClaimsCount, `evidenceDebt matches the count of debated/contested claims (${debatedClaimsCount})`, r);

    // 3. Validate last verified date
    console.log('\n── Last Verified Date ──');
    assert(metrics.lastVerifiedDate !== 'NOT VERIFIED', 'lastVerifiedDate is successfully parsed and not NOT VERIFIED', r);
    assert(metrics.lastVerifiedDate.length > 0, 'lastVerifiedDate string is non-empty', r);
    console.log(`  Latest verification timestamp computed: ${metrics.lastVerifiedDate}`);

    // 4. Test empty / failure fallbacks (mock behavior / empty core)
    console.log('\n── Fallback Boundaries ──');
    const invalidDateMetrics = await getCanonicalTrustMetrics(new Date('invalid-date'));
    assert(invalidDateMetrics !== null, 'getCanonicalTrustMetrics handles invalid dates gracefully without crashing', r);
    assertEqual(invalidDateMetrics.publishedChapters, 1, 'handles invalid date fallback for published chapters count', r);

  } catch (err) {
    console.error('Test execution failed with error:', err);
    r.failed++;
  }

  console.log(`\nTrust Metrics Tests: ${r.passed} passed, ${r.failed} failed`);
  if (r.failed > 0) process.exit(1);
}

runTests();
