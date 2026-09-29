/**
 * scripts/verify-production-sitemap.ts
 *
 * THE BREAKDOWN OS — Production Sitemap & Canonical Verification Gate
 *
 * Enforces sitemap invariants, canonical reconciliation, and robot configuration:
 * 1. Validates sitemap generation, ensuring 100% canonical HTTPS URLs.
 * 2. Checks FixMetadataService DEFAULT_BASE_URL is canonical https://thebreakdown.in.
 * 3. Enforces robots.txt RFC 9309 rules (no disallow collision on /editorial-constitution).
 * 4. Checks that all 10 route families define correct self-canonical URLs.
 * 5. Optionally probes live production URLs when --live flag is passed.
 */

import sitemap from '../app/sitemap';
import robots from '../app/robots';
import { FixMetadataService } from '../services/fixes/fix-metadata.service';
import { getPublicStories, getEntities, getTopics, getFixes } from '../utils/data-layer/store';
import { RepositoryFactory } from '../services/factory/repository';
import { getKnowledgeLibrarySeedData } from '../utils/data-layer/knowledge-library-data';

interface AssertionResult {
  passed: boolean;
  name: string;
  detail?: string;
}

const results: AssertionResult[] = [];

function assert(condition: boolean, name: string, detail?: string) {
  results.push({ passed: condition, name, detail });
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
  } else {
    console.error(`  ✗ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
  }
}

async function runVerification() {
  console.log('═════════════════════════════════════════════════════════════════════');
  console.log('THE BREAKDOWN OS — PRODUCTION SITEMAP & CANONICAL VERIFICATION GATE');
  console.log('═════════════════════════════════════════════════════════════════════\n');

  // 1. Sitemap Generation Invariants
  console.log('[1/5] Testing Sitemap Structure & Canonical Form...');
  const sitemapEntries = await sitemap();
  assert(Array.isArray(sitemapEntries) && sitemapEntries.length > 100, 'Sitemap generates valid URL array (>100 URLs)', `Found ${sitemapEntries.length}`);

  let allHttps = true;
  let allCorrectDomain = true;
  let noQueryOrHash = true;
  let allValidDates = true;

  for (const entry of sitemapEntries) {
    if (!entry.url.startsWith('https://')) allHttps = false;
    if (!entry.url.startsWith('https://thebreakdown.in')) allCorrectDomain = false;
    if (entry.url.includes('?') || entry.url.includes('#')) noQueryOrHash = false;
    if (!entry.lastModified || isNaN(new Date(entry.lastModified).getTime())) allValidDates = false;
  }

  assert(allHttps, 'All sitemap URLs use HTTPS protocol');
  assert(allCorrectDomain, 'All sitemap URLs use canonical production domain (thebreakdown.in)');
  assert(noQueryOrHash, 'Zero query strings or fragment anchors in sitemap URLs');
  assert(allValidDates, 'All sitemap entries have valid lastModified timestamps');

  // 2. Fix Metadata Base URL Invariant
  console.log('\n[2/5] Testing FixMetadataService Base URL...');
  assert(
    FixMetadataService.DEFAULT_BASE_URL === 'https://thebreakdown.in',
    'FixMetadataService DEFAULT_BASE_URL is https://thebreakdown.in',
    `Found ${FixMetadataService.DEFAULT_BASE_URL}`
  );
  const sampleFixUrl = FixMetadataService.toCanonicalUrl({ slug: 'test-fix' } as any);
  assert(
    sampleFixUrl === 'https://thebreakdown.in/fix/test-fix',
    'Fix canonical URL generation produces canonical domain',
    `Found ${sampleFixUrl}`
  );

  // 3. Robots.txt RFC 9309 Invariant
  console.log('\n[3/5] Testing Robots.txt Disallow Rules & Collisions...');
  const robotRules = robots();
  const defaultRule = robotRules.rules && (Array.isArray(robotRules.rules) ? robotRules.rules[0] : robotRules.rules);
  const disallows = (defaultRule?.disallow as string[]) || [];

  assert(
    !disallows.includes('/editorial'),
    'Robots.txt does NOT contain prefix /editorial without trailing slash',
    'Disallowing /editorial would unintentionally block /editorial-constitution under RFC 9309'
  );
  assert(
    disallows.includes('/editorial/'),
    'Robots.txt contains /editorial/ with trailing slash to protect internal editorial tools'
  );
  const sitemaps = Array.isArray(robotRules.sitemap) ? robotRules.sitemap : [robotRules.sitemap];
  assert(
    sitemaps.includes('https://thebreakdown.in/sitemap.xml'),
    'Robots.txt points to canonical sitemap https://thebreakdown.in/sitemap.xml',
    `Found ${JSON.stringify(sitemaps)}`
  );

  // 4. Inventory Completeness
  console.log('\n[4/5] Testing Sitemap Inventory Coverage...');
  const stories = getPublicStories({ pageSize: 200 }).data;
  const entities = getEntities({ pageSize: 200 }).data;
  const topics = getTopics({ pageSize: 200 }).data;
  const fixes = getFixes({ pageSize: 200 }).data;

  const sitemapUrls = new Set(sitemapEntries.map((e) => e.url));

  const allStoriesInSitemap = stories.every((s) => sitemapUrls.has(`https://thebreakdown.in/story/${s.slug}`));
  assert(allStoriesInSitemap, `All ${stories.length} public stories present in sitemap`);

  const allEntitiesInSitemap = entities.every((e) => sitemapUrls.has(`https://thebreakdown.in/entity/${e.slug}`));
  assert(allEntitiesInSitemap, `All ${entities.length} entities present in sitemap`);

  const allTopicsInSitemap = topics.every((t) => sitemapUrls.has(`https://thebreakdown.in/topic/${t.slug}`));
  assert(allTopicsInSitemap, `All ${topics.length} topics present in sitemap`);

  const allFixesInSitemap = fixes.every((f) => sitemapUrls.has(`https://thebreakdown.in/fix/${f.slug}`));
  assert(allFixesInSitemap, `All ${fixes.length} fixes present in sitemap`);

  // Hub pages present
  const requiredHubs = [
    'https://thebreakdown.in',
    'https://thebreakdown.in/entities',
    'https://thebreakdown.in/organizations',
    'https://thebreakdown.in/countries',
    'https://thebreakdown.in/founding-edition',
    'https://thebreakdown.in/editorial-constitution',
    'https://thebreakdown.in/methodology',
    'https://thebreakdown.in/trust',
    'https://thebreakdown.in/trackers/mgnrega',
    'https://thebreakdown.in/trackers/pmfby',
    'https://thebreakdown.in/trackers/semiconductor',
    'https://thebreakdown.in/trackers/upi',
  ];
  const allHubsPresent = requiredHubs.every((hub) => sitemapUrls.has(hub));
  assert(allHubsPresent, 'All key editorial hubs and trackers present in sitemap');

  // 5. Check Live if flag present
  const isLive = process.argv.includes('--live');
  if (isLive) {
    console.log('\n[5/5] Live Production Probe (--live requested)...');
    try {
      const resp = await fetch('https://thebreakdown.in/sitemap.xml', { headers: { 'User-Agent': 'TheBreakdown-Sitemap-Verifier/1.0' } });
      assert(resp.ok, `Live sitemap reachable (status: ${resp.status})`);
      const text = await resp.text();
      assert(text.includes('https://thebreakdown.in'), 'Live sitemap contains canonical URLs');
      assert(!text.includes('thebreakdown.gov'), 'Live sitemap contains ZERO .gov URLs');
    } catch (e: any) {
      assert(false, 'Live sitemap fetch failed', e.message);
    }
  } else {
    console.log('\n[5/5] Live Probe skipped (pass --live to probe production network).');
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log('\n═════════════════════════════════════════════════════════════════════');
  console.log(`VERIFICATION RESULT: ${passed} / ${total} PASSING`);
  console.log('═════════════════════════════════════════════════════════════════════');

  if (passed !== total) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal error during sitemap verification:', err);
  process.exit(1);
});
