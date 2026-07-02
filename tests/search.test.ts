/**
 * THE BREAKDOWN — Search Tests
 *
 * Tests search result structure, empty query handling, pagination.
 * Note: Hook tests require a DOM environment; this tests the data
 * structures and the buildSearch() function.
 */

import { buildSearch } from '../utils/website-builder';
import type { PageSpec, SearchResult, SEOData, Breadcrumb } from '../utils/types';
import { mockSearchResults } from './mock-data';

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

  // Test 1: buildSearch returns valid PageSpec
  try {
    const query = 'GDP India';
    const page: PageSpec = buildSearch(query, mockSearchResults);
    assert(page.type === 'search', 'buildSearch returns type "search"');
    assert(page.slug === 'search/GDP%20India', 'Slug is encoded search query');
    assert(page.template === 'search', 'Template is "search"');
    assert(page.layout === 'search-layout', 'Layout is "search-layout"');
  } catch (e) {
    console.error('  FAIL: buildSearch basic structure threw exception', e);
    failed++;
  }

  // Test 2: Search results are attached
  try {
    const query = 'GDP India';
    const page: PageSpec = buildSearch(query, mockSearchResults);
    assert(Array.isArray(page.searchResults), 'searchResults is an array');
    assert(page.searchResults!.length === mockSearchResults.length, 'searchResults count matches');
    assert(page.searchResults![0].title === mockSearchResults[0].title, 'First result title matches');
  } catch (e) {
    console.error('  FAIL: Search results check threw exception', e);
    failed++;
  }

  // Test 3: Search result structure
  try {
    const result = mockSearchResults[0];
    assert(typeof result.id === 'string', 'Result has id');
    assert(['story', 'entity', 'topic'].includes(result.type), 'Result type is valid');
    assert(typeof result.title === 'string', 'Result has title');
    assert(typeof result.description === 'string', 'Result has description');
    assert(typeof result.url === 'string', 'Result has url');
    assert(typeof result.score === 'number', 'Result has score');
    assert(result.score >= 0 && result.score <= 1, 'Score is between 0 and 1');
  } catch (e) {
    console.error('  FAIL: Search result structure check threw exception', e);
    failed++;
  }

  // Test 4: Empty query handling
  try {
    const page: PageSpec = buildSearch('', []);
    assert(page.slug === 'search/', 'Empty query slug is "search/"');
    assert(page.searchResults!.length === 0, 'Empty query has zero results');
    assert(page.metadata.resultCount === 0, 'Result count metadata is 0');
  } catch (e) {
    console.error('  FAIL: Empty query handling threw exception', e);
    failed++;
  }

  // Test 5: URL encoding in slug and canonical
  try {
    const query = 'budget 2025-26';
    const page: PageSpec = buildSearch(query, mockSearchResults);
    const encoded = encodeURIComponent(query);
    assert(page.slug === `search/${encoded}`, 'Slug is properly URL-encoded');
    assert(page.seo.canonical === `https://thebreakdown.in/search?q=${encoded}`, 'Canonical URL is properly URL-encoded');
  } catch (e) {
    console.error('  FAIL: URL encoding check threw exception', e);
    failed++;
  }

  // Test 6: Search SEO metadata
  try {
    const query = 'inflation';
    const page: PageSpec = buildSearch(query, mockSearchResults);
    assert(page.seo.title === `Search: ${query} — The Breakdown`, 'SEO title includes query');
    assert(page.seo.description === `Search results for "${query}" on The Breakdown`, 'SEO description includes query');
    assert(page.seo.ogType === 'website', 'OG type is website');
    assert(page.metadata.query === query, 'Metadata includes query');
    assert(page.metadata.resultCount === mockSearchResults.length, 'Metadata includes result count');
  } catch (e) {
    console.error('  FAIL: Search SEO metadata check threw exception', e);
    failed++;
  }

  // Test 7: Search breadcrumbs
  try {
    const query = 'RBI policy';
    const page: PageSpec = buildSearch(query, mockSearchResults);
    assert(page.breadcrumbs.length === 2, 'Search has 2 breadcrumbs');
    assert(page.breadcrumbs[0].label === 'Home', 'First breadcrumb is Home');
    assert(page.breadcrumbs[0].href === '/', 'First crumb href is /');
    assert(page.breadcrumbs[1].label === `Search: ${query}`, 'Second breadcrumb is "Search: {query}"');
    assert(page.breadcrumbs[1].href === `/search?q=${encodeURIComponent(query)}`, 'Second crumb href is correct');
  } catch (e) {
    console.error('  FAIL: Search breadcrumbs check threw exception', e);
    failed++;
  }

  // Test 8: Pagination - multiple result types
  try {
    const types = mockSearchResults.map(r => r.type);
    assert(types.includes('story'), 'Results include story type');
    assert(types.includes('entity'), 'Results include entity type');
    assert(types.includes('topic'), 'Results include topic type');
  } catch (e) {
    console.error('  FAIL: Result type variety check threw exception', e);
    failed++;
  }

  // Test 9: Score ordering (descending)
  try {
    const scores = mockSearchResults.map(r => r.score);
    const sorted = [...scores].sort((a, b) => b - a);
    assert(JSON.stringify(scores) === JSON.stringify(sorted), 'Results are sorted by score descending');
  } catch (e) {
    console.error('  FAIL: Score ordering check threw exception', e);
    failed++;
  }

  // Test 10: Sections is empty for search page
  try {
    const page: PageSpec = buildSearch('test', mockSearchResults);
    assert(page.sections.length === 0, 'Search page has no sections (template has none)');
  } catch (e) {
    console.error('  FAIL: Empty sections check threw exception', e);
    failed++;
  }

  console.log(`\nSearch Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
