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
  const services = bootstrapServices({ publicOnly: true });
  const page = await buildHomepage(services);

  // Test 1: SEO Structure
  try {
    assert(page.seo.title === 'The Breakdown — Evidence Before Conclusions', 'SEO title is correct');
    assert(page.seo.description === 'An evidence-driven explanatory journalism and public-knowledge platform.', 'SEO description is correct');
    assert(page.seo.canonical === 'https://thebreakdown.in', 'Canonical URL is correct');
    assert(page.seo.ogType === 'website', 'OG type is website');
  } catch (e) {
    console.error('  FAIL: Homepage basic structure threw exception', e);
    failed++;
  }

  // Test 2: Contains valid lead story
  try {
    assert(page.leadStory !== null, 'Homepage lead story check');
    if (page.leadStory) {
      assert(typeof page.leadStory.headline === 'string' && page.leadStory.headline.length > 0, 'Lead story has valid headline');
      assert(Array.isArray(page.leadStory.trustSignals), 'Lead story has trust signals');
    }
  } catch (e) {
    console.error('  FAIL: Homepage lead story check threw exception', e);
    failed++;
  }

  // Test 3: View model arrays are defined
  try {
    assert(Array.isArray(page.briefings), 'Briefings is an array');
    assert(Array.isArray(page.deepDives), 'Deep Dives is an array');
    assert(Array.isArray(page.topics), 'Topics is an array');
    assert(Array.isArray(page.recentlyUpdated), 'Recently Updated is an array');
  } catch (e) {
    console.error('  FAIL: Homepage arrays check threw exception', e);
    failed++;
  }

  console.log(`\nHomepage Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
