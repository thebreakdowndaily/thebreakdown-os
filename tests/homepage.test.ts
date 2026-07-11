/**
 * THE BREAKDOWN — Homepage Tests
 *
 * Tests buildHomepage() output using the canonical service layer.
 */

import { buildHomepage } from '../features/home/view-model';
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

  // Use the real bootstrapServices for testing the view model
  const services = bootstrapServices();
  const page = buildHomepage(services);

  // Test 1: SEO Structure
  try {
    assert(page.seo.title === 'The Breakdown — India Explained', 'SEO title is correct');
    assert(page.seo.description === 'Independent, data-driven journalism on Indian policy, politics, and society.', 'SEO description is correct');
    assert(page.seo.canonical === 'https://thebreakdown.in', 'Canonical URL is correct');
    assert(page.seo.ogType === 'website', 'OG type is website');
  } catch (e) {
    console.error('  FAIL: Homepage basic structure threw exception', e);
    failed++;
  }

  // Test 2: Contains valid top story
  try {
    assert(page.topStory !== null, 'Homepage has a top story');
    if (page.topStory) {
      assert(typeof page.topStory.headline === 'string', 'Top story has a headline');
      assert(typeof page.topStory.slug === 'string', 'Top story has a slug');
    }
  } catch (e) {
    console.error('  FAIL: Homepage top story check threw exception', e);
    failed++;
  }

  // Test 3: Arrays are defined
  try {
    assert(Array.isArray(page.stories), 'Stories is an array');
    assert(Array.isArray(page.investigations), 'Investigations is an array');
    assert(Array.isArray(page.fixes), 'Fixes is an array');
    assert(Array.isArray(page.topics), 'Topics is an array');
  } catch (e) {
    console.error('  FAIL: Homepage arrays check threw exception', e);
    failed++;
  }

  console.log(`\nHomepage Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
