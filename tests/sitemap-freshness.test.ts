import {
  parseValidContentDate,
  getLatestContentDate,
  resolveDynamicPageFreshness,
} from '../lib/seo/sitemap-freshness';
import sitemap from '../app/sitemap';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, detail?: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
      failed++;
    }
  }

  console.log('─── Workstream B: Dynamic Sitemap Freshness & Integrity Tests ───\n');

  const baselineDate = new Date('2026-09-29T00:00:00.000Z');
  const nowBoundary = new Date('2026-10-26T12:00:00.000Z');

  // Test 1: parseValidContentDate validation invariants
  assert(parseValidContentDate(null) === undefined, 'null date returns undefined');
  assert(parseValidContentDate(undefined) === undefined, 'undefined date returns undefined');
  assert(parseValidContentDate('') === undefined, 'empty string date returns undefined');
  assert(parseValidContentDate('not-a-valid-date') === undefined, 'invalid string date returns undefined');
  assert(
    parseValidContentDate('2026-10-24T03:13:58.193Z', nowBoundary)?.toISOString() === '2026-10-24T03:13:58.193Z',
    'valid ISO date string parses correctly'
  );

  // Test 2: Future date rejection
  const futureDateStr = '2026-11-01T00:00:00.000Z';
  assert(
    parseValidContentDate(futureDateStr, nowBoundary) === undefined,
    'Future date relative to maxAllowedDate is rejected'
  );

  // Test 3: Newly published story advances dynamic page date
  const mockStoriesNewPublish = [
    { publishedAt: '2026-10-20T10:00:00.000Z', updatedAt: null },
    { publishedAt: '2026-10-24T03:13:58.193Z', updatedAt: null },
    { publishedAt: '2026-10-15T08:00:00.000Z', updatedAt: null },
  ];
  const latestPublished = getLatestContentDate(mockStoriesNewPublish, nowBoundary);
  assert(
    latestPublished?.toISOString() === '2026-10-24T03:13:58.193Z',
    'Newly published story provides truthful latest timestamp'
  );

  // Test 4: Modified story with updatedAt advances dynamic date over older publishedAt
  const mockStoriesWithUpdate = [
    { publishedAt: '2026-10-20T10:00:00.000Z', updatedAt: null },
    { publishedAt: '2026-10-22T08:00:00.000Z', updatedAt: '2026-10-25T14:30:00.000Z' },
  ];
  const latestUpdated = getLatestContentDate(mockStoriesWithUpdate, nowBoundary);
  assert(
    latestUpdated?.toISOString() === '2026-10-25T14:30:00.000Z',
    'Story updatedAt takes precedence when newer than publishedAt'
  );

  // Test 5: Empty inventory falls back to stable documented baseline without throwing or NaN
  const emptyFreshness = resolveDynamicPageFreshness([], {
    fallbackDate: baselineDate,
    maxAllowedDate: nowBoundary,
  });
  assert(
    emptyFreshness.toISOString() === baselineDate.toISOString(),
    'Empty story inventory safely returns stable baseline date'
  );
  assert(!Number.isNaN(emptyFreshness.getTime()), 'Resolved date is not NaN');

  // Test 6: Invalid and absent timestamps do not corrupt output
  const corruptStories = [
    { publishedAt: 'invalid-date', updatedAt: undefined },
    { publishedAt: null, updatedAt: 'corrupted' },
    { publishedAt: undefined, updatedAt: null },
  ];
  const corruptFreshness = resolveDynamicPageFreshness(corruptStories, {
    fallbackDate: baselineDate,
    maxAllowedDate: nowBoundary,
  });
  assert(
    corruptFreshness.toISOString() === baselineDate.toISOString(),
    'Corrupted timestamps fall back to baseline without throwing'
  );

  // Test 7: Homepage vs Archive content dependency slicing
  // An older story outside homepage slice updated: archive advances, homepage stays on top slice
  const slicedStories = [
    { publishedAt: '2026-10-20T10:00:00.000Z' }, // Item 1 (homepage)
    { publishedAt: '2026-10-19T10:00:00.000Z' }, // Item 2 (homepage)
    { publishedAt: '2026-10-10T10:00:00.000Z', updatedAt: '2026-10-25T18:00:00.000Z' }, // Item 3 (archive-only, slice=2)
  ];
  const homeResolved = resolveDynamicPageFreshness(slicedStories, {
    sliceCount: 2,
    fallbackDate: baselineDate,
    maxAllowedDate: nowBoundary,
  });
  const archiveResolved = resolveDynamicPageFreshness(slicedStories, {
    fallbackDate: baselineDate,
    maxAllowedDate: nowBoundary,
  });
  assert(
    homeResolved.toISOString() === '2026-10-20T10:00:00.000Z',
    'Homepage date derives strictly from homepage content slice'
  );
  assert(
    archiveResolved.toISOString() === '2026-10-25T18:00:00.000Z',
    'Archive date captures deeper story update outside homepage slice'
  );

  // Test 8: Live repository sitemap generation verification
  const sitemapEntries = await sitemap();
  const homeEntry = sitemapEntries.find((e) => e.url === 'https://thebreakdown.in');
  const storiesEntry = sitemapEntries.find((e) => e.url === 'https://thebreakdown.in/stories');
  const aboutEntry = sitemapEntries.find((e) => e.url === 'https://thebreakdown.in/about');

  assert(Boolean(homeEntry), 'Sitemap contains homepage entry');
  assert(Boolean(storiesEntry), 'Sitemap contains stories archive entry');
  assert(Boolean(aboutEntry), 'Sitemap contains static about entry');

  // Verify that dynamic pages use real content-derived dates (not a fixed static constant like 2026-09-29)
  if (homeEntry?.lastModified) {
    const homeIso = new Date(homeEntry.lastModified).toISOString();
    assert(
      !isNaN(new Date(homeEntry.lastModified).getTime()),
      'Homepage lastModified is a valid date',
      `Found: ${homeIso}`
    );
    assert(
      homeIso !== '2026-09-29T00:00:00.000Z',
      'Homepage lastModified is no longer frozen on static 2026-09-29 baseline',
      `Found: ${homeIso}`
    );
  }

  if (storiesEntry?.lastModified) {
    const storiesIso = new Date(storiesEntry.lastModified).toISOString();
    assert(
      !isNaN(new Date(storiesEntry.lastModified).getTime()),
      'Stories archive lastModified is a valid date',
      `Found: ${storiesIso}`
    );
    assert(
      storiesIso !== '2026-09-29T00:00:00.000Z',
      'Stories archive lastModified is no longer frozen on static 2026-09-29 baseline',
      `Found: ${storiesIso}`
    );
  }

  // Verify that stable static pages retain stable review dates (no build-time inflation)
  if (aboutEntry?.lastModified) {
    assert(
      new Date(aboutEntry.lastModified).toISOString() === '2026-07-01T00:00:00.000Z',
      'Stable page (/about) retains authentic 2026-07-01 review date (no build-time inflation)'
    );
  }

  console.log(`\nSitemap Freshness Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
