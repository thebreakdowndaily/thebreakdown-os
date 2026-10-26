import { XMLParser } from 'fast-xml-parser';
import {
  escapeXml,
  getValidRssPubDate,
  getRssAuthor,
  buildRssXml,
  generateAuthoritativeRssResponse,
  RSS_CANONICAL_FEED_URL,
  RSS_SITE_URL,
} from '../lib/rss/generator';
import { GET as getRssRoute } from '../app/rss/route';
import { GET as getFeedXmlRoute } from '../app/feed.xml/route';
import type { Story } from '../types/canonical';

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

  console.log('─── Workstream C: Authoritative RSS Integrity Tests ───\n');

  const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const nowBoundary = new Date('2026-10-26T12:00:00.000Z');

  // 1. XML escaping tests
  assert(escapeXml('Tom & Jerry <5> "quote" \'single\'') === 'Tom &amp; Jerry &lt;5&gt; &quot;quote&quot; &apos;single&apos;', 'escapeXml escapes &, <, >, ", and \'');
  assert(escapeXml(null) === '', 'escapeXml handles null');
  assert(escapeXml(undefined) === '', 'escapeXml handles undefined');

  // 2. Publication date validation invariants
  assert(getValidRssPubDate(null, nowBoundary) === null, 'getValidRssPubDate rejects null');
  assert(getValidRssPubDate('', nowBoundary) === null, 'getValidRssPubDate rejects empty string');
  assert(getValidRssPubDate('invalid-date', nowBoundary) === null, 'getValidRssPubDate rejects invalid date string');
  assert(getValidRssPubDate('2026-11-01T00:00:00.000Z', nowBoundary) === null, 'getValidRssPubDate rejects future date');
  assert(
    getValidRssPubDate('2026-10-24T03:13:58.193Z', nowBoundary) === new Date('2026-10-24T03:13:58.193Z').toUTCString(),
    'getValidRssPubDate formats valid date to RFC 822 UTC string'
  );

  // 3. Author resolution
  const mockStoryWithAuthorObj = {
    headline: 'Test',
    slug: 'test',
    summary: 'Summary',
    author: { name: 'Lead Reporter' },
  } as unknown as Story;
  assert(getRssAuthor(mockStoryWithAuthorObj) === 'Lead Reporter', 'Author object resolves author name');

  const mockStoryWithAuthorStr = {
    headline: 'Test',
    slug: 'test',
    summary: 'Summary',
    author: 'Desk Staff',
  } as unknown as Story;
  assert(getRssAuthor(mockStoryWithAuthorStr) === 'Desk Staff', 'Author string resolves directly');

  // 4. Special characters & XML validity via FastXMLParser
  const mockStoriesWithSpecialChars: Story[] = [
    {
      id: 's-1',
      slug: 'bcci-cricket-fees',
      headline: 'BCCI & Domestic Cricket: How Revenue > Expenses & "Player Shares"',
      summary: 'Analysis of ₹1,000 Cr & contracts < 2026 > with "quotes" & errata',
      category: 'Policy & Governance',
      publishedAt: '2026-10-24T10:00:00.000Z',
      author: 'Sports Desk & Editorial',
    } as unknown as Story,
    {
      id: 's-2',
      slug: 'namami-gange-audit',
      headline: 'Namami Gange: ₹20,000 Cr Spent, But Is Water Cleaner?',
      summary: 'Data audit & parliamentary questions on water quality standards.',
      category: 'Environment',
      publishedAt: '2026-10-22T08:00:00.000Z',
      author: 'Environment Desk',
    } as unknown as Story,
  ];

  const generatedXml = buildRssXml(mockStoriesWithSpecialChars, {
    selfUrl: RSS_CANONICAL_FEED_URL,
    now: nowBoundary,
  });

  let parsed: any;
  try {
    parsed = xmlParser.parse(generatedXml);
    assert(Boolean(parsed.rss), 'Generated XML parses cleanly as RSS 2.0 without syntax error');
    assert(Boolean(parsed.rss.channel), 'Parsed RSS contains valid <channel>');
  } catch (err: any) {
    assert(false, 'XML parsing threw an error', err.message);
  }

  if (parsed?.rss?.channel) {
    const channel = parsed.rss.channel;
    assert(channel.title === 'The Breakdown', 'Channel title matches');
    assert(channel.link === RSS_SITE_URL, 'Channel link matches site URL');
    assert(channel.language === 'en-in', 'Channel language is en-in');

    const atomLink = channel['atom:link'];
    assert(Boolean(atomLink), 'Channel contains atom:link');
    assert(atomLink['@_href'] === RSS_CANONICAL_FEED_URL, 'atom:link href is canonical /rss');
    assert(atomLink['@_rel'] === 'self', 'atom:link rel is self');

    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    assert(items.length === 2, 'Parsed exactly 2 story items');
    assert(items[0].title === 'BCCI & Domestic Cricket: How Revenue > Expenses & "Player Shares"', 'Item title special chars decoded correctly');
    assert(items[0].link === 'https://thebreakdown.in/story/bcci-cricket-fees', 'Item link is canonical');
    assert(items[0].guid['#text'] === 'https://thebreakdown.in/story/bcci-cricket-fees', 'Item GUID matches link');
    assert(items[0].guid['@_isPermaLink'] === 'true', 'GUID isPermaLink is true');
  }

  // 5. Strict newest-first chronological ordering
  const unorderedStories: Story[] = [
    { id: '1', slug: 'story-old', headline: 'Old Story', publishedAt: '2026-06-01T00:00:00.000Z' } as Story,
    { id: '2', slug: 'story-newest', headline: 'Newest Story', publishedAt: '2026-10-25T00:00:00.000Z' } as Story,
    { id: '3', slug: 'story-middle', headline: 'Middle Story', publishedAt: '2026-08-15T00:00:00.000Z' } as Story,
  ];
  const orderedXml = buildRssXml(unorderedStories, { now: nowBoundary });
  const parsedOrdered = xmlParser.parse(orderedXml);
  const orderedItems = parsedOrdered.rss.channel.item;
  assert(orderedItems[0].title === 'Newest Story', 'First item is newest story');
  assert(orderedItems[1].title === 'Middle Story', 'Second item is middle story');
  assert(orderedItems[2].title === 'Old Story', 'Third item is oldest story');

  // 6. Exclusion of records with missing, invalid, or future dates (Never synthesize)
  const storiesWithBadDates: Story[] = [
    { id: '1', slug: 'valid-story', headline: 'Valid', publishedAt: '2026-10-20T00:00:00.000Z' } as Story,
    { id: '2', slug: 'missing-date', headline: 'Missing Date' } as unknown as Story,
    { id: '3', slug: 'invalid-date', headline: 'Invalid Date', publishedAt: 'garbage-date' } as Story,
    { id: '4', slug: 'future-story', headline: 'Future Story', publishedAt: '2030-01-01T00:00:00.000Z' } as Story,
  ];
  const badDateXml = buildRssXml(storiesWithBadDates, { now: nowBoundary });
  const parsedBadDate = xmlParser.parse(badDateXml);
  const badDateItems = Array.isArray(parsedBadDate.rss.channel.item)
    ? parsedBadDate.rss.channel.item
    : (parsedBadDate.rss.channel.item ? [parsedBadDate.rss.channel.item] : []);
  assert(badDateItems.length === 1, 'Only 1 valid story included; stories with missing/invalid/future dates excluded');
  assert(badDateItems[0].title === 'Valid', 'Only the valid past story is syndicated');

  // 7. Deduplication by slug / GUID
  const duplicateStories: Story[] = [
    { id: '1', slug: 'dup-slug', headline: 'Version 1', publishedAt: '2026-10-20T00:00:00.000Z' } as Story,
    { id: '2', slug: 'dup-slug', headline: 'Version 2 (Dup)', publishedAt: '2026-10-20T00:00:00.000Z' } as Story,
  ];
  const dedupXml = buildRssXml(duplicateStories, { now: nowBoundary });
  const parsedDedup = xmlParser.parse(dedupXml);
  const dedupItems = Array.isArray(parsedDedup.rss.channel.item)
    ? parsedDedup.rss.channel.item
    : (parsedDedup.rss.channel.item ? [parsedDedup.rss.channel.item] : []);
  assert(dedupItems.length === 1, 'Duplicate story slugs are deduplicated; zero duplicate GUIDs');

  // 8. Empty inventory behavior: valid empty channel
  const emptyXml = buildRssXml([], { now: nowBoundary });
  const parsedEmpty = xmlParser.parse(emptyXml);
  assert(Boolean(parsedEmpty.rss.channel), 'Empty inventory produces valid RSS channel');
  assert(!parsedEmpty.rss.channel.item, 'Empty channel has no item nodes');

  // 9. Route compatibility & integration tests: /rss and /feed.xml
  const rssResponse = await getRssRoute();
  assert(rssResponse.status === 200, '/rss route returns HTTP 200');
  assert(
    rssResponse.headers.get('Content-Type') === 'application/rss+xml; charset=utf-8',
    '/rss route has Content-Type: application/rss+xml; charset=utf-8'
  );
  assert(
    rssResponse.headers.get('Cache-Control')?.includes('public'),
    '/rss route declares public Cache-Control'
  );

  const feedXmlResponse = await getFeedXmlRoute();
  assert(feedXmlResponse.status === 200, '/feed.xml route returns HTTP 200');
  assert(
    feedXmlResponse.headers.get('Content-Type') === 'application/xml',
    '/feed.xml route has Content-Type: application/xml'
  );
  assert(
    feedXmlResponse.headers.get('Cache-Control')?.includes('public'),
    '/feed.xml route declares public Cache-Control'
  );

  // Both routes output valid RSS that parses cleanly
  const liveRssText = await rssResponse.text();
  const liveFeedText = await feedXmlResponse.text();
  const parsedLiveRss = xmlParser.parse(liveRssText);
  const parsedLiveFeed = xmlParser.parse(liveFeedText);

  assert(
    Array.isArray(parsedLiveRss.rss.channel.item) && parsedLiveRss.rss.channel.item.length > 0,
    '/rss serves populated story inventory',
    `Found ${parsedLiveRss.rss.channel.item.length} items`
  );
  assert(
    Array.isArray(parsedLiveFeed.rss.channel.item) && parsedLiveFeed.rss.channel.item.length > 0,
    '/feed.xml serves populated story inventory',
    `Found ${parsedLiveFeed.rss.channel.item.length} items`
  );
  assert(
    parsedLiveRss.rss.channel.item.length === parsedLiveFeed.rss.channel.item.length,
    '/rss and /feed.xml have exact 100% item count parity',
    `rss: ${parsedLiveRss.rss.channel.item.length}, feed.xml: ${parsedLiveFeed.rss.channel.item.length}`
  );

  console.log(`\nRSS Integrity Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
