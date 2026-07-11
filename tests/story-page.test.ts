/**
 * THE BREAKDOWN — Story Page Tests
 *
 * Tests buildStoryPage() output structure, sections, SEO, breadcrumbs, and filtering.
 */

import { buildStoryPage } from '../features/story/view-model';
import { apiStoryToCanonical } from '../lib/bootstrap';
import { mockStory } from './mock-data';
import type { Services } from '../services/registry';
import type { Story, Topic, Entity } from '../types/canonical';

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

  const canonicalStory = apiStoryToCanonical(mockStory);
  const mockServices = {
    stories: {
      getStoryBySlug: (slug: string) => slug === mockStory.slug ? canonicalStory : null,
      getStory: () => null,
      getStories: () => ({ data: [canonicalStory], total: 1 }),
    },
    topics: {
      getTopic: () => null,
      getTopics: () => ({ data: [], total: 0 }),
    },
    entities: {
      getEntity: () => null,
      getEntities: () => ({ data: [], total: 0 }),
    }
  } as unknown as Services;

  // Test 1: buildStoryPage returns a valid ViewModel
  try {
    const vm = buildStoryPage(mockServices, mockStory.slug);
    assert(vm !== null, 'buildStoryPage returns a view model');
    assert(vm!.story.slug === mockStory.slug, 'Slug matches input');
    assert(vm!.breadcrumbs.length === 2, 'Breadcrumbs generated');
  } catch (e) {
    console.error('  FAIL: buildStoryPage basic structure threw exception', e);
    failed++;
  }

  // Test 2: Blocks are generated with regions
  try {
    const vm = buildStoryPage(mockServices, mockStory.slug);
    const blocks = vm!.story.blocks;
    const heroBlock = blocks.find(b => b.region === 'hero');
    const footerBlocks = blocks.filter(b => b.region === 'footer');
    assert(!!heroBlock, 'Hero block is assigned to hero region');
    assert(footerBlocks.length > 0, 'Footer blocks generated');
  } catch (e) {
    console.error('  FAIL: Blocks check threw exception', e);
    failed++;
  }

  // Test 3: SEO data is generated correctly
  try {
    const vm = buildStoryPage(mockServices, mockStory.slug);
    assert(vm!.seo.title === mockStory.headline, 'SEO title includes headline');
    assert(vm!.seo.description === mockStory.summary, 'SEO description matches summary');
  } catch (e) {
    console.error('  FAIL: SEO check threw exception', e);
    failed++;
  }

  console.log(`\nStory Page Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
