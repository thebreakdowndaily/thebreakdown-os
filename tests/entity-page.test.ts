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
  const allEntities = await services.entities.getEntities({ pageSize: 1 });
  const testEntity = allEntities.data[0];

  if (!testEntity) {
    console.error('  FAIL: No entities found in data layer to test');
    process.exit(1);
  }
  
  // Test 1: buildEntityPage returns valid EntityPageData
  try {
    const page = await buildEntityPage(services, testEntity.slug);
    if (page) {
      assert(page.entity.type === testEntity.type, 'Entity type is correct');
      assert(page.entity.slug === testEntity.slug, 'Entity slug is correct');
      assert(Array.isArray(page.stories), 'Related stories is an array');
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
    const page = await buildEntityPage(services, testEntity.slug);
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
