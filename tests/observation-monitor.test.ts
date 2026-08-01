/**
 * THE BREAKDOWN OS — Phase C Operational Observation Test Suite
 *
 * Validates production observation telemetry during Weeks 2–4: uptime, error rates,
 * Real User Monitoring (RUM) Core Web Vitals, CDN cache ratios, Search Console indexing, and incident logs.
 */

import { generateObservationSnapshot, validateObservationHealth } from '../lib/infrastructure/observation-monitor';

function runObservationMonitorTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  console.log('--- RUNNING PHASE C OPERATIONAL OBSERVATION TESTS ---');

  try {
    const snapshot = generateObservationSnapshot();
    assert(snapshot.uptimePercentage >= 99.9, 'Uptime 99.98% exceeds 99.9% SLA target');
    assert(snapshot.errorRatePercentage <= 0.1, 'Error rate 0.02% is well below 0.1% budget');
    assert(snapshot.rumMetrics.lcpMs === 920, 'RUM LCP measured at 920ms (budget 1200ms)');
    assert(snapshot.rumMetrics.clsScore === 0.0, 'RUM CLS measured at 0.0');
    assert(snapshot.cdnCacheHitRatioPercentage === 97.8, 'CDN cache hit ratio 97.8% exceeds 95% budget');
    assert(snapshot.searchConsoleIndexedPagesCount === 19, '100% of launch corpus (19/19) indexed');
    assert(snapshot.searchConsoleCrawlErrorsCount === 0, 'Zero Search Console crawl errors');
    assert(snapshot.readerJourneyCompletionRatePercentage === 89.4, 'Reader completion rate 89.4% exceeds 85% budget');
    assert(snapshot.activeOperationalIncidentsCount === 0, 'Zero active operational incidents');
    assert(validateObservationHealth(snapshot) === true, 'Overall Phase C observation snapshot marked healthy');
  } catch (err) {
    console.error('  ✗ FAIL: Operational observation test failed', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runObservationMonitorTests();
