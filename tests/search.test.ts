/**
 * THE BREAKDOWN — Search Tests
 *
 * Tests SearchService functionality using the canonical service layer.
 */

import { bootstrapServices } from '../lib/bootstrap';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  const services = bootstrapServices();

  // Test 1: Search indexing works
  try {
    const results = services.search.search('adani');
    assert(Array.isArray(results), 'Search returns an array');
    if (results.length > 0) {
      assert(typeof results[0].title === 'string', 'Search result has a title');
      assert(typeof results[0].type === 'string', 'Search result has a type');
    }
  } catch (e) {
    console.error('  FAIL: Search structure threw exception', e);
    failed++;
  }

  // Test 2: Search handles empty queries
  try {
    const results = services.search.search('');
    assert(Array.isArray(results), 'Empty search returns an array');
  } catch (e) {
    console.error('  FAIL: Empty search threw exception', e);
    failed++;
  }

  console.log(`\nSearch Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
