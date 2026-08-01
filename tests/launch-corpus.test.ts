/**
 * THE BREAKDOWN OS — Phase B Launch Corpus Test Suite
 *
 * Validates the ingestion of the Minimum Viable Newsroom Launch Corpus (19 items):
 * 8 Lead Stories, 3 Explainers, 3 Analyses, 3 Topic Hubs, and 2 Timelines.
 */

import { getLaunchCorpusSummary, LAUNCH_CORPUS } from '../lib/editorial/launch-corpus';

function runLaunchCorpusTests() {
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

  console.log('--- RUNNING PHASE B LAUNCH CORPUS INGESTION TESTS ---');

  try {
    const summary = getLaunchCorpusSummary(LAUNCH_CORPUS);
    assert(summary.totalItems === 19, 'Launch corpus contains exactly 19 items');
    assert(summary.breakdown['news'] === 8, 'Includes 8 Lead News Stories');
    assert(summary.breakdown['explainer'] === 3, 'Includes 3 Explainers');
    assert(summary.breakdown['analysis'] === 3, 'Includes 3 Deep Analyses');
    assert(summary.breakdown['topic_hub'] === 3, 'Includes 3 Topic Hubs');
    assert(summary.breakdown['timeline'] === 2, 'Includes 2 Timelines');
    assert(summary.allGoldStandardPassed === true, '100% of launch items pass Gold Standard Audit');
    assert(summary.totalClaims >= 400, 'Launch corpus contains 400+ verified canonical claims');
    assert(summary.totalSources >= 300, 'Launch corpus links 300+ primary sources');

    const slugs = LAUNCH_CORPUS.map((i) => i.slug);
    const uniqueSlugs = new Set(slugs);
    assert(slugs.length === uniqueSlugs.size, 'All launch corpus item slugs are unique');
  } catch (err) {
    console.error('  ✗ FAIL: Launch corpus test failed', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runLaunchCorpusTests();
