/**
 * THE BREAKDOWN — Story Page Tests
 *
 * Tests buildStory() output structure, sections, SEO, breadcrumbs, and filtering.
 */

import { buildStory } from '../utils/website-builder';
import type { PageSpec, StoryJSON } from '../utils/types';
import { mockStory, mockSEO, mockBreadcrumbs } from './mock-data';

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

  // Test 1: buildStory returns a valid PageSpec
  try {
    const page: PageSpec = buildStory(mockStory);
    assert(page.type === 'story', 'buildStory returns type "story"');
    assert(page.slug === mockStory.slug, 'Slug matches input');
    assert(page.template === 'story', 'Template is "story"');
    assert(page.layout === 'story-layout', 'Layout is "story-layout"');
  } catch (e) {
    console.error('  FAIL: buildStory basic structure threw exception', e);
    failed++;
  }

  // Test 2: All required sections are present
  try {
    const page: PageSpec = buildStory(mockStory);
    const requiredIds = ['hero', 'executive-summary', 'evidence', 'related-stories', 'author-box'];
    for (const id of requiredIds) {
      const section = page.sections.find(s => s.id === id);
      assert(!!section, `Required section "${id}" is present`);
    }
  } catch (e) {
    console.error('  FAIL: Required sections check threw exception', e);
    failed++;
  }

  // Test 3: Conditional sections present (mockStory has facts, timeline, etc.)
  try {
    const page: PageSpec = buildStory(mockStory);
    const conditionalIds = ['quick-facts', 'timeline', 'data-cards', 'charts', 'maps', 'debate', 'faq', 'primary-sources', 'related-entities'];
    for (const id of conditionalIds) {
      const section = page.sections.find(s => s.id === id);
      assert(!!section, `Conditional section "${id}" is present when data exists`);
    }
  } catch (e) {
    console.error('  FAIL: Conditional sections check threw exception', e);
    failed++;
  }

  // Test 4: SEO data is generated correctly
  try {
    const page: PageSpec = buildStory(mockStory);
    assert(page.seo.title === `${mockStory.headline} — The Breakdown`, 'SEO title includes headline');
    assert(page.seo.description === mockStory.summary.substring(0, 160), 'SEO description matches summary');
    assert(page.seo.canonical === `https://thebreakdown.in/story/${mockStory.slug}`, 'Canonical URL is correct');
    assert(page.seo.ogType === 'article', 'OG type is "article"');
    assert(page.seo.ogImage === mockStory.heroImage, 'OG image matches hero image');
    assert(page.seo.ogPublishDate === mockStory.publishedAt, 'OG publish date matches');
    assert(page.seo.twitterCard === 'summary_large_image', 'Twitter card is summary_large_image');
    assert(page.seo.keywords === mockStory.tags.join(', '), 'Keywords match tags');
  } catch (e) {
    console.error('  FAIL: SEO check threw exception', e);
    failed++;
  }

  // Test 5: Breadcrumbs are correct
  try {
    const page: PageSpec = buildStory(mockStory);
    assert(page.breadcrumbs.length === 3, 'Three breadcrumbs present');
    assert(page.breadcrumbs[0].label === 'Home', 'First breadcrumb is Home');
    assert(page.breadcrumbs[0].href === '/', 'Home href is /');
    assert(page.breadcrumbs[1].label === 'Stories', 'Second breadcrumb is Stories');
    assert(page.breadcrumbs[1].href === '/stories', 'Stories href is /stories');
    assert(page.breadcrumbs[2].label === mockStory.headline, 'Third breadcrumb is headline');
    assert(page.breadcrumbs[2].href === `/story/${mockStory.slug}`, 'Headline href is correct');
  } catch (e) {
    console.error('  FAIL: Breadcrumbs check threw exception', e);
    failed++;
  }

  // Test 6: Schema is generated
  try {
    const page: PageSpec = buildStory(mockStory);
    assert(Array.isArray(page.schema), 'Schema is array');
    const articleSchema = page.schema.find((s: Record<string, unknown>) => s['@type'] === 'NewsArticle');
    assert(articleSchema !== undefined, 'NewsArticle schema found');
    assert(articleSchema!['@type'] === 'NewsArticle', 'Schema type is NewsArticle');
    assert(articleSchema!.headline === mockStory.headline, 'Schema headline matches');
    assert(articleSchema!.datePublished === mockStory.publishedAt, 'Schema datePublished matches');
    assert((articleSchema!.author as Record<string, unknown>)['@type'] === 'Person', 'Schema author type is Person');
    assert((articleSchema!.author as Record<string, unknown>).name === mockStory.author.name, 'Schema author name matches');
  } catch (e) {
    console.error('  FAIL: Schema check threw exception', e);
    failed++;
  }

  // Test 7: All sections from template are present (filterSections keeps non-required sections)
  try {
    const minimalStory: StoryJSON = {
      ...mockStory,
      facts: [],
      timeline: [],
      charts: [],
      datasets: [],
      geoData: undefined,
      debate: undefined,
      faq: [],
      primarySources: [],
      relatedEntities: [],
    };
    const page: PageSpec = buildStory(minimalStory);
    const sectionIds = page.sections.map(s => s.id);

    // All sections defined in the template are present (filterSections currently
    // only filters out unknown section IDs, not sections with empty data)
    const templateSections = ['hero', 'executive-summary', 'quick-facts', 'timeline', 'evidence', 'data-cards', 'charts', 'maps', 'debate', 'faq', 'primary-sources', 'related-stories', 'related-entities', 'author-box', 'newsletter'];
    for (const id of templateSections) {
      assert(sectionIds.includes(id), `Section "${id}" present in output (all template sections pass through)`);
    }

    // Required sections always present
    assert(sectionIds.includes('hero'), 'hero still present');
    assert(sectionIds.includes('evidence'), 'evidence still present');
    assert(sectionIds.includes('related-stories'), 'related-stories still present');
    assert(sectionIds.includes('author-box'), 'author-box still present');
  } catch (e) {
    console.error('  FAIL: Missing data filtering threw exception', e);
    failed++;
  }

  // Test 8: Metadata is extracted
  try {
    const page: PageSpec = buildStory(mockStory);
    assert(page.metadata.readingTime === mockStory.readingTime, 'Metadata readingTime matches');
    assert(page.metadata.wordCount === mockStory.wordCount, 'Metadata wordCount matches');
    assert(page.metadata.category === mockStory.category, 'Metadata category matches');
    assert(page.metadata.storyId === mockStory.id, 'Metadata storyId matches');
  } catch (e) {
    console.error('  FAIL: Metadata check threw exception', e);
    failed++;
  }

  console.log(`\nStory Page Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
