/**
 * THE BREAKDOWN — Story Page Tests
 *
 * Tests buildStoryPage() output structure, sections, SEO, breadcrumbs, and filtering.
 */

import { buildStoryPage } from '../features/story/view-model';
import { bootstrapServices } from '../lib/bootstrap';
import type { Services } from '../services/registry';
import type { Story, Topic, Entity, StoryBlock } from '../types/canonical';

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

  // Initialize real services for the view model
  const services = bootstrapServices();
  const allStories = await services.stories.getStories({ pageSize: 1 });
  const testStory = allStories.data[0];

  if (!testStory) {
    console.error('  FAIL: No stories found in data layer to test');
    process.exit(1);
  }

  // Test 1: buildStoryPage returns a valid ViewModel
  try {
    const vm = await buildStoryPage(services, testStory.slug);
    assert(vm !== null, 'buildStoryPage returns a view model');
    assert(vm!.story.slug === testStory.slug, 'Slug matches input');
    assert(vm!.breadcrumbs.length === 2, 'Breadcrumbs generated');
  } catch (e) {
    console.error('  FAIL: buildStoryPage basic structure threw exception', e);
    failed++;
  }

  // Test 2: Blocks are generated with regions
  try {
    const vm = await buildStoryPage(services, testStory.slug);
    const blocks = vm!.story.blocks;
    const heroBlock = blocks.find((b: StoryBlock) => b.region === 'hero');
    const footerBlocks = blocks.filter((b: StoryBlock) => b.region === 'footer');
    assert(!!heroBlock, 'Hero block is assigned to hero region');
    assert(footerBlocks.length > 0, 'Footer blocks generated');
  } catch (e) {
    console.error('  FAIL: Blocks check threw exception', e);
    failed++;
  }

  // Test 3: SEO data is generated correctly
  try {
    const vm = await buildStoryPage(services, testStory.slug);
    assert(vm!.seo.title === testStory.title, 'SEO title includes headline');
    // We expect the SEO description to fall back correctly or match
    assert(typeof vm!.seo.description === 'string', 'SEO description is a string');
  } catch (e) {
    console.error('  FAIL: SEO check threw exception', e);
    failed++;
  }

  console.log(`\nStory Page Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
