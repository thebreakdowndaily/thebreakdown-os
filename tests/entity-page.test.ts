/**
 * THE BREAKDOWN — Entity Page Tests
 *
 * Tests buildEntityPage() output using the canonical service layer.
 */

import { buildEntityPage } from '../features/entity/view-model';
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
  
  // Test 1: buildEntityPage returns valid EntityPageData
  try {
    const page = buildEntityPage(services, 'adani-group');
    if (page) {
      assert(page.entity.type === 'organization', 'Entity type is correct');
      assert(page.entity.slug === 'adani-group', 'Entity slug is correct');
      assert(Array.isArray(page.relatedStories), 'Related stories is an array');
      assert(Array.isArray(page.relatedEntities), 'Related entities is an array');
    } else {
      console.error('  FAIL: Entity page not found');
      failed++;
    }
  } catch (e) {
    console.error('  FAIL: Entity page basic structure threw exception', e);
    failed++;
  }

  // Test 2: SEO properties
  try {
    const page = buildEntityPage(services, 'adani-group');
    if (page) {
      assert(typeof page.seo.title === 'string', 'SEO title is a string');
      assert(typeof page.seo.description === 'string', 'SEO description is a string');
    }
  } catch (e) {
    console.error('  FAIL: Entity SEO check threw exception', e);
    failed++;
  }

  console.log(`\nEntity Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
