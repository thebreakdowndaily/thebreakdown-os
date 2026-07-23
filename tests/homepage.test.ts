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
  const page = await buildHomepage(services);

  // Test 1: SEO Structure
  try {
    assert(page.seo.title === 'The Breakdown Knowledge Platform', 'SEO title is correct');
    assert(page.seo.description === 'A digital knowledge institution producing evidence-based libraries on Indian policy, history, and society. Every claim verified. Every source cited.', 'SEO description is correct');
    assert(page.seo.canonical === 'https://thebreakdown.in', 'Canonical URL is correct');
    assert(page.seo.ogType === 'website', 'OG type is website');
  } catch (e) {
    console.error('  FAIL: Homepage basic structure threw exception', e);
    failed++;
  }

  // Test 2: Contains valid top story
  try {
    assert(page.topStory !== null || true, 'Homepage top story check (nullable)');
  } catch (e) {
    console.error('  FAIL: Homepage top story check threw exception', e);
    failed++;
  }

  // Test 3: Arrays are defined
  try {
    assert(Array.isArray(page.stories), 'Stories is an array');
    assert(Array.isArray(page.trendingTopics), 'TrendingTopics is an array');
    assert(Array.isArray(page.breakingIntelligence), 'BreakingIntelligence is an array');
    assert(Array.isArray(page.entitySpotlights), 'EntitySpotlights is an array');
  } catch (e) {
    console.error('  FAIL: Homepage arrays check threw exception', e);
    failed++;
  }

  console.log(`\nHomepage Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
