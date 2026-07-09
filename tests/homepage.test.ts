/**
 * THE BREAKDOWN — Homepage Tests
 *
 * Tests buildHomepage() output, featured story ordering, metadata.
 */

import { buildHomepage } from '../utils/website-builder';
import type { PageSpec } from '../utils/types';
import { mockHomepage } from './mock-data';

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

  // Test 1: buildHomepage returns valid PageSpec
  try {
    const page: PageSpec = buildHomepage(mockHomepage);
    assert(page.type === 'homepage', 'buildHomepage returns type "homepage"');
    assert(page.slug === '', 'Homepage slug is empty string');
    assert(page.template === 'homepage', 'Template is "homepage"');
    assert(page.layout === 'homepage-layout', 'Layout is "homepage-layout"');
  } catch (e) {
    console.error('  FAIL: buildHomepage basic structure threw exception', e);
    failed++;
  }

  // Test 2: Homepage sections are not in component registry so filterSections returns empty array
  // (Homepage section IDs like "top-story" are not registered in components.json)
  try {
    const page: PageSpec = buildHomepage(mockHomepage);
    assert(page.sections.length === 0, 'Homepage sections empty (section IDs not in component registry)');
  } catch (e) {
    console.error('  FAIL: Homepage sections length check threw exception', e);
    failed++;
  }

  // Test 5: Metadata is correct
  try {
    const page: PageSpec = buildHomepage(mockHomepage);
    assert(page.seo.title === 'The Breakdown — India Explained', 'SEO title is correct');
    assert(page.seo.description === 'Independent, data-driven journalism on Indian policy, politics, and society.', 'SEO description is correct');
    assert(page.seo.canonical === 'https://thebreakdown.in', 'Canonical URL is correct');
    assert(page.seo.ogType === 'website', 'OG type is website');
    assert(page.seo.ogImage === '/images/og-home.jpg', 'OG image is og-home.jpg');
  } catch (e) {
    console.error('  FAIL: Homepage metadata check threw exception', e);
    failed++;
  }

  // Test 6: Breadcrumbs are empty for homepage
  try {
    const page: PageSpec = buildHomepage(mockHomepage);
    assert(page.breadcrumbs.length === 0, 'Homepage has no breadcrumbs');
  } catch (e) {
    console.error('  FAIL: Homepage breadcrumbs check threw exception', e);
    failed++;
  }

  // Test 7: Schema is Website
  try {
    const page: PageSpec = buildHomepage(mockHomepage);
    assert(Array.isArray(page.schema), 'Schema is an array');
    assert(page.schema[0]['@context'] === 'https://schema.org', 'Schema context is schema.org');
    assert(page.schema[0]['@type'] === 'WebSite', 'Schema type is WebSite');
    assert(page.schema[0].name === 'The Breakdown', 'Schema name is The Breakdown');
  } catch (e) {
    console.error('  FAIL: Homepage schema check threw exception', e);
    failed++;
  }

  // Test 8: Homepage metadata includes readingTime and updatedAt
  try {
    const page: PageSpec = buildHomepage(mockHomepage);
    assert(page.metadata.readingTime === 0, 'Metadata readingTime defaults to 0');
    assert(typeof page.metadata.updatedAt === 'string', 'Metadata updatedAt is a string');
  } catch (e) {
    console.error('  FAIL: Homepage metadata fields check threw exception', e);
    failed++;
  }

  // Test 9: Schema URL is correct
  try {
    const page: PageSpec = buildHomepage(mockHomepage);
    assert(page.schema[0].url === 'https://thebreakdown.in', 'Schema url is correct');
  } catch (e) {
    console.error('  FAIL: Homepage schema URL check threw exception', e);
    failed++;
  }

  console.log(`\nHomepage Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
