/**
 * THE BREAKDOWN — SEO Tests
 *
 * Tests generateMetaTags, generateJsonLd, sitemap, RSS feed, and schema.org article schema.
 */

import { generateMetaTags, generateJsonLd, generateOpenGraph, generateTwitterCard, generateBreadcrumbJsonLd } from '../utils/seo-generator';
import { articleSchema, personSchema, organizationSchema, websiteSchema, breadcrumbListSchema, faqPageSchema, sitelinksSearchBox } from '../utils/schema-generator';
import { generateSitemap, generateSitemapIndex, generateRobotsTxt, SITEMAP_CONFIG } from '../utils/sitemap-generator';
import { generateRssFeed, generateJsonFeed, generateAtomFeed } from '../utils/feed-generator';
import { mockStory, mockPersonEntity, mockOrganizationEntity, mockSEO, mockBreadcrumbs } from './mock-data';

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

  // ── generateMetaTags ────────────────────────────────────────────────

  try {
    const tags = generateMetaTags(mockSEO);
    assert(tags.title === mockSEO.title, 'Title tag matches');
    assert(tags.description === mockSEO.description, 'Description tag matches');
    assert(tags.canonical === mockSEO.canonical, 'Canonical tag matches');
    assert(tags['og:title'] === mockSEO.title, 'og:title matches');
    assert(tags['og:description'] === mockSEO.description, 'og:description matches');
    assert(tags['og:image'] === mockSEO.ogImage, 'og:image matches');
    assert(tags['og:type'] === mockSEO.ogType, 'og:type matches');
    assert(tags['og:url'] === mockSEO.canonical, 'og:url matches canonical');
    assert(tags['article:published_time'] === mockSEO.ogPublishDate, 'article:published_time present when date set');
    assert(tags['twitter:card'] === mockSEO.twitterCard, 'twitter:card matches');
    assert(tags['twitter:title'] === mockSEO.title, 'twitter:title matches');
    assert(tags['twitter:description'] === mockSEO.description, 'twitter:description matches');
    assert(tags['twitter:image'] === mockSEO.ogImage, 'twitter:image matches');
    assert(tags.keywords === mockSEO.keywords, 'keywords tag matches');
  } catch (e) {
    console.error('  FAIL: generateMetaTags threw exception', e);
    failed++;
  }

  // Test: Meta tags without optional fields
  try {
    const minimalSEO = { ...mockSEO, ogImage: undefined, twitterCard: undefined, ogPublishDate: undefined, keywords: undefined };
    const tags = generateMetaTags(minimalSEO);
    assert(tags['og:image'] === '/images/og-default.jpg', 'og:image falls back to default');
    assert(tags['twitter:card'] === 'summary_large_image', 'twitter:card falls back to summary_large_image');
    assert(tags['article:published_time'] === undefined, 'article:published_time not set when missing');
    assert(tags.keywords === '', 'keywords defaults to empty string');
  } catch (e) {
    console.error('  FAIL: generateMetaTags minimal fields threw exception', e);
    failed++;
  }

  // ── generateJsonLd ──────────────────────────────────────────────────

  try {
    const schema = { '@type': 'NewsArticle', headline: 'Test' };
    const jsonLd = generateJsonLd(schema);
    const parsed = JSON.parse(jsonLd);
    assert(parsed['@context'] === 'https://schema.org', 'JSON-LD includes schema.org context');
    assert(parsed['@type'] === 'NewsArticle', 'JSON-LD includes type');
    assert(parsed.headline === 'Test', 'JSON-LD includes custom fields');
    assert(typeof jsonLd === 'string', 'generateJsonLd returns a string');

    // Verify valid JSON
    JSON.parse(jsonLd);
    assert(true, 'generateJsonLd output is valid JSON');
  } catch (e) {
    console.error('  FAIL: generateJsonLd threw exception', e);
    failed++;
  }

  // ── generateOpenGraph ───────────────────────────────────────────────

  try {
    const og = generateOpenGraph(mockSEO);
    assert(og['og:title'] === mockSEO.title, 'OG title matches');
    assert(og['og:description'] === mockSEO.description, 'OG description matches');
    assert(og['og:image'] === mockSEO.ogImage, 'OG image matches');
    assert(og['og:type'] === mockSEO.ogType, 'OG type matches');
    assert(og['og:url'] === mockSEO.canonical, 'OG url matches');
    assert(og['og:updated_time'] === mockSEO.ogPublishDate, 'OG updated_time matches publish date');
  } catch (e) {
    console.error('  FAIL: generateOpenGraph threw exception', e);
    failed++;
  }

  // ── generateTwitterCard ─────────────────────────────────────────────

  try {
    const card = generateTwitterCard(mockSEO);
    assert(card['twitter:card'] === mockSEO.twitterCard, 'Twitter card type matches');
    assert(card['twitter:title'] === mockSEO.title, 'Twitter title matches');
    assert(card['twitter:description'] === mockSEO.description, 'Twitter description matches');
    assert(card['twitter:image'] === mockSEO.ogImage, 'Twitter image matches');
  } catch (e) {
    console.error('  FAIL: generateTwitterCard threw exception', e);
    failed++;
  }

  // ── generateBreadcrumbJsonLd ────────────────────────────────────────

  try {
    const breadcrumbLd = generateBreadcrumbJsonLd(mockBreadcrumbs);
    assert(breadcrumbLd['@type'] === 'BreadcrumbList', 'Breadcrumb JSON-LD type is BreadcrumbList');
    assert(breadcrumbLd.itemListElement.length === 3, 'Has 3 breadcrumb items');
    assert(breadcrumbLd.itemListElement[0].position === 1, 'First item position is 1');
    assert(breadcrumbLd.itemListElement[0].name === 'Home', 'First item name is Home');
    assert(breadcrumbLd.itemListElement[1].position === 2, 'Second item position is 2');
    assert(breadcrumbLd.itemListElement[1].name === 'Stories', 'Second item name is Stories');
    assert(breadcrumbLd.itemListElement[2].position === 3, 'Third item position is 3');
  } catch (e) {
    console.error('  FAIL: generateBreadcrumbJsonLd threw exception', e);
    failed++;
  }

  // ── articleSchema ────────────────────────────────────────────────────

  try {
    const schema = articleSchema(mockStory);
    assert(schema['@type'] === 'NewsArticle', 'Article schema type is NewsArticle');
    assert(schema.headline === mockStory.headline, 'Article headline matches');
    assert(schema.description === mockStory.summary, 'Article description matches');
    assert(schema.datePublished === mockStory.publishedAt, 'Article datePublished matches');
    assert(schema.dateModified === mockStory.updatedAt, 'Article dateModified matches');
    assert(schema.author.name === mockStory.author.name, 'Article author name matches');
    assert(schema.publisher.name === 'The Breakdown', 'Publisher name is correct');
    assert(schema.mainEntityOfPage === `https://thebreakdown.in/story/${mockStory.slug}`, 'Main entity page is correct');
    assert(schema.wordCount === mockStory.wordCount, 'Word count matches');
    assert(schema.timeRequired === `PT${mockStory.readingTime}M`, 'Reading time in ISO format');
    assert(schema.keywords === mockStory.tags.join(', '), 'Article keywords matches tags');
    assert(schema.articleSection === mockStory.category, 'Article section matches category');
  } catch (e) {
    console.error('  FAIL: articleSchema threw exception', e);
    failed++;
  }

  // ── personSchema ────────────────────────────────────────────────────

  try {
    const schema = personSchema(mockPersonEntity);
    assert(schema['@type'] === 'Person', 'Person schema type is Person');
    assert(schema.name === mockPersonEntity.name, 'Person name matches');
    assert(schema.description === mockPersonEntity.description, 'Person description matches');
    assert(schema.url === `https://thebreakdown.in/entity/${mockPersonEntity.slug}`, 'Person URL matches');
    assert(schema.image === mockPersonEntity.image, 'Person image matches');
    assert(Array.isArray(schema.additionalName), 'Person aliases is array');
    assert(JSON.stringify(schema.additionalName) === JSON.stringify(mockPersonEntity.aliases), 'Person aliases match');
  } catch (e) {
    console.error('  FAIL: personSchema threw exception', e);
    failed++;
  }

  // ── organizationSchema ─────────────────────────────────────────────

  try {
    const schema = organizationSchema(mockOrganizationEntity);
    assert(schema['@type'] === 'Organization', 'Org schema type is Organization');
    assert(schema.name === mockOrganizationEntity.name, 'Org name matches');
    assert(Array.isArray(schema.alternateName), 'Org aliases is alternateName');
    assert(JSON.stringify(schema.alternateName) === JSON.stringify(mockOrganizationEntity.aliases), 'Org aliases match');
  } catch (e) {
    console.error('  FAIL: organizationSchema threw exception', e);
    failed++;
  }

  // ── websiteSchema ──────────────────────────────────────────────────

  try {
    const schema = websiteSchema();
    assert(schema['@type'] === 'WebSite', 'Website schema type is WebSite');
    assert(schema.name === 'The Breakdown', 'Website name is correct');
    assert(schema.url === 'https://thebreakdown.in', 'Website URL is correct');
    assert(schema.publisher['@type'] === 'Organization', 'Publisher type is Organization');
  } catch (e) {
    console.error('  FAIL: websiteSchema threw exception', e);
    failed++;
  }

  // ── breadcrumbListSchema ──────────────────────────────────────────

  try {
    const schema = breadcrumbListSchema(mockBreadcrumbs);
    assert(schema['@type'] === 'BreadcrumbList', 'BreadcrumbList schema type matches');
    assert(schema.itemListElement.length === 3, 'Has 3 elements');
    assert(schema.itemListElement[0].item === 'https://thebreakdown.in/', 'Home URL is fully qualified');
  } catch (e) {
    console.error('  FAIL: breadcrumbListSchema threw exception', e);
    failed++;
  }

  // ── faqPageSchema ────────────────────────────────────────────────────

  try {
    const faqData = [
      { question: 'What is GDP?', answer: 'Gross Domestic Product.' },
      { question: 'When is data released?', answer: 'Quarterly.' },
    ];
    const schema = faqPageSchema(faqData);
    assert(schema['@type'] === 'FAQPage', 'FAQPage schema type matches');
    assert(schema.mainEntity.length === 2, 'Has 2 FAQ items');
    assert(schema.mainEntity[0]['@type'] === 'Question', 'First item is Question');
    assert(schema.mainEntity[0].name === 'What is GDP?', 'Question matches');
    assert(schema.mainEntity[0].acceptedAnswer['@type'] === 'Answer', 'AcceptedAnswer type is Answer');
    assert(schema.mainEntity[0].acceptedAnswer.text === 'Gross Domestic Product.', 'Answer matches');
  } catch (e) {
    console.error('  FAIL: faqPageSchema threw exception', e);
    failed++;
  }

  // ── sitelinksSearchBox ──────────────────────────────────────────────

  try {
    const schema = sitelinksSearchBox();
    assert(schema['@type'] === 'WebSite', 'Sitelinks schema type is WebSite');
    assert(schema.potentialAction['@type'] === 'SearchAction', 'Has SearchAction');
    assert(schema.potentialAction.target['@type'] === 'EntryPoint', 'Target is EntryPoint');
    assert(schema.potentialAction.target.urlTemplate === 'https://thebreakdown.in/search?q={search_term_string}', 'URL template is correct');
    assert(schema.potentialAction['query-input'] === 'required name=search_term_string', 'Query input is correct');
  } catch (e) {
    console.error('  FAIL: sitelinksSearchBox threw exception', e);
    failed++;
  }

  // ── Sitemap Generation ──────────────────────────────────────────────

  try {
    const pages = [
      { url: 'https://thebreakdown.in/', lastModified: '2025-07-20', changeFreq: 'hourly', priority: 1.0 },
      { url: 'https://thebreakdown.in/story/india-gdp', lastModified: '2025-07-15', changeFreq: 'weekly', priority: 0.9 },
    ];
    const sitemap = generateSitemap(pages);
    assert(sitemap.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'Sitemap has XML declaration');
    assert(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Sitemap has urlset tag');
    assert(sitemap.includes('<loc>https://thebreakdown.in/</loc>'), 'Sitemap includes homepage URL');
    assert(sitemap.includes('<changefreq>hourly</changefreq>'), 'Sitemap includes changefreq');
    assert(sitemap.includes('<priority>1.0</priority>'), 'Sitemap includes priority');
  } catch (e) {
    console.error('  FAIL: generateSitemap threw exception', e);
    failed++;
  }

  // Test: Sitemap XML validity (basic structure)
  try {
    const pages = [{ url: 'https://thebreakdown.in/', lastModified: '2025-07-20' }];
    const sitemap = generateSitemap(pages);
    assert(sitemap.startsWith('<?xml'), 'Sitemap starts with XML declaration');
    assert(sitemap.includes('</urlset>'), 'Sitemap ends with urlset close tag');
    assert(sitemap.includes('<lastmod>2025-07-20</lastmod>'), 'Sitemap has ISO date');
  } catch (e) {
    console.error('  FAIL: Sitemap structure check threw exception', e);
    failed++;
  }

  // ── Sitemap Index ──────────────────────────────────────────────────

  try {
    const index = generateSitemapIndex([
      { url: 'https://thebreakdown.in/sitemap-stories.xml', lastModified: '2025-07-20' },
      { url: 'https://thebreakdown.in/sitemap-entities.xml', lastModified: '2025-07-19' },
    ]);
    assert(index.includes('<sitemapindex'), 'Sitemap index has sitemapindex tag');
    assert(index.includes('sitemap-stories.xml'), 'Sitemap index includes stories sitemap');
    assert(index.includes('sitemap-entities.xml'), 'Sitemap index includes entities sitemap');
    assert(index.includes('</sitemapindex>'), 'Sitemap index has closing tag');
  } catch (e) {
    console.error('  FAIL: generateSitemapIndex threw exception', e);
    failed++;
  }

  // ── Robots.txt ─────────────────────────────────────────────────────

  try {
    const robots = generateRobotsTxt('https://thebreakdown.in/sitemap.xml');
    assert(robots.includes('User-agent: *'), 'Robots.txt has User-agent');
    assert(robots.includes('Allow: /'), 'Robots.txt has Allow');
    assert(robots.includes('Sitemap: https://thebreakdown.in/sitemap.xml'), 'Robots.txt has Sitemap URL');
  } catch (e) {
    console.error('  FAIL: generateRobotsTxt threw exception', e);
    failed++;
  }

  // ── SITEMAP_CONFIG ─────────────────────────────────────────────────

  try {
    assert(SITEMAP_CONFIG.changefreq.homepage === 'hourly', 'Homepage changefreq is hourly');
    assert(SITEMAP_CONFIG.changefreq.story === 'weekly', 'Story changefreq is weekly');
    assert(SITEMAP_CONFIG.changefreq.entity === 'weekly', 'Entity changefreq is weekly');
    assert(SITEMAP_CONFIG.changefreq.topic === 'daily', 'Topic changefreq is daily');
    assert(SITEMAP_CONFIG.changefreq.static === 'monthly', 'Static changefreq is monthly');
    assert(SITEMAP_CONFIG.priority.homepage === 1.0, 'Homepage priority is 1.0');
    assert(SITEMAP_CONFIG.priority.story === 0.9, 'Story priority is 0.9');
    assert(SITEMAP_CONFIG.priority.entity === 0.8, 'Entity priority is 0.8');
    assert(SITEMAP_CONFIG.priority.topic === 0.7, 'Topic priority is 0.7');
    assert(SITEMAP_CONFIG.priority.static === 0.5, 'Static priority is 0.5');
  } catch (e) {
    console.error('  FAIL: SITEMAP_CONFIG check threw exception', e);
    failed++;
  }

  // ── RSS Feed ────────────────────────────────────────────────────────

  try {
    const rss = generateRssFeed([mockStory], {
      title: 'The Breakdown',
      description: 'Independent journalism',
      url: 'https://thebreakdown.in',
    });
    assert(rss.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'RSS has XML declaration');
    assert(rss.includes('<rss version="2.0"'), 'RSS has version 2.0');
    assert(rss.includes('<channel>'), 'RSS has channel tag');
    assert(rss.includes('<title>The Breakdown</title>'), 'RSS has feed title');
    assert(rss.includes('<item>'), 'RSS has item tag');
    assert(rss.includes(mockStory.headline), 'RSS includes story headline');
    assert(rss.includes(mockStory.summary), 'RSS includes story summary');
    assert(rss.includes(mockStory.slug), 'RSS includes story slug in link');
    assert(rss.includes('</channel>'), 'RSS has closing channel tag');
    assert(rss.includes('</rss>'), 'RSS has closing rss tag');
  } catch (e) {
    console.error('  FAIL: generateRssFeed threw exception', e);
    failed++;
  }

  // Test: RSS feed with custom language
  try {
    const rss = generateRssFeed([mockStory], {
      title: 'The Breakdown',
      description: 'Test',
      url: 'https://thebreakdown.in',
      language: 'hi',
    });
    assert(rss.includes('<language>hi</language>'), 'RSS includes custom language');
  } catch (e) {
    console.error('  FAIL: RSS custom language threw exception', e);
    failed++;
  }

  // ── JSON Feed ──────────────────────────────────────────────────────

  try {
    const jsonFeed = generateJsonFeed([mockStory], {
      title: 'The Breakdown',
      description: 'Independent journalism',
      url: 'https://thebreakdown.in',
      feedUrl: 'https://thebreakdown.in/feed.json',
    });
    const parsed = JSON.parse(jsonFeed);
    assert(parsed.version === 'https://jsonfeed.org/version/1.1', 'JSON Feed version is 1.1');
    assert(parsed.title === 'The Breakdown', 'JSON Feed title matches');
    assert(parsed.feed_url === 'https://thebreakdown.in/feed.json', 'JSON Feed URL matches');
    assert(Array.isArray(parsed.items), 'JSON Feed has items array');
    assert(parsed.items.length === 1, 'JSON Feed has 1 item');
    assert(parsed.items[0].title === mockStory.headline, 'JSON Feed item title matches');
    assert(parsed.items[0].id === `https://thebreakdown.in/story/${mockStory.slug}`, 'JSON Feed item ID matches');
    assert(parsed.items[0].authors[0].name === mockStory.author.name, 'JSON Feed author name matches');
  } catch (e) {
    console.error('  FAIL: generateJsonFeed threw exception', e);
    failed++;
  }

  // ── Atom Feed ──────────────────────────────────────────────────────

  try {
    const atom = generateAtomFeed([mockStory], {
      title: 'The Breakdown',
      description: 'Independent journalism',
      url: 'https://thebreakdown.in',
    });
    assert(atom.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'Atom has XML declaration');
    assert(atom.includes('<feed xmlns="http://www.w3.org/2005/Atom">'), 'Atom has feed tag');
    assert(atom.includes('<entry>'), 'Atom has entry tag');
    assert(atom.includes(mockStory.headline), 'Atom includes story headline');
    assert(atom.includes(mockStory.slug), 'Atom includes story slug');
    assert(atom.includes('</feed>'), 'Atom has closing feed tag');
  } catch (e) {
    console.error('  FAIL: generateAtomFeed threw exception', e);
    failed++;
  }

  // ── Feed Edge Cases ────────────────────────────────────────────────

  try {
    const emptyRss = generateRssFeed([], {
      title: 'The Breakdown',
      description: 'Test',
      url: 'https://thebreakdown.in',
    });
    assert(!emptyRss.includes('<item>'), 'Empty RSS feed has no items');
    assert(emptyRss.includes('<channel>'), 'Empty RSS still has channel');
  } catch (e) {
    console.error('  FAIL: Empty RSS feed check threw exception', e);
    failed++;
  }

  try {
    const emptyJson = generateJsonFeed([], {
      title: 'The Breakdown',
      description: 'Test',
      url: 'https://thebreakdown.in',
      feedUrl: 'https://thebreakdown.in/feed.json',
    });
    const parsed = JSON.parse(emptyJson);
    assert(parsed.items.length === 0, 'Empty JSON Feed has zero items');
  } catch (e) {
    console.error('  FAIL: Empty JSON Feed check threw exception', e);
    failed++;
  }

  console.log(`\nSEO Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
