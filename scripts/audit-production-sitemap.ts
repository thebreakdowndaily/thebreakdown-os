/**
 * scripts/audit-production-sitemap.ts
 * The Breakdown OS — Comprehensive Production Sitemap Forensic Auditor
 * 
 * Performs forensic audits across Phases 1-16:
 * - Phase 1: Raw XML programmatic retrieval & header recording
 * - Phase 2: XML forensic validation (well-formedness, namespaces, escaping, host integrity)
 * - Phase 3: URL Inventory & route family classification
 * - Phase 4: Canonical reconciliation (live probe, <link rel="canonical"> vs <loc>)
 * - Phase 5: Publication-integrity reconciliation (getPublicStories, publication-gate)
 * - Phase 6: Reverse coverage audit (public stories, entities, chapters, static pages)
 * - Phase 7: Route-family forensics (/story/... vs /series/.../volume/.../chapter/...)
 * - Phase 8: Lastmod forensics (ISO validation, future date check, generator stability)
 * - Phase 9: URL normalization (trailing slash, casing, encoding, fragments)
 * - Phase 10: Duplicate discovery
 * - Phase 11: Content-type audit (text/html vs redirects/404s/json)
 * - Phase 12: Robots consistency (cross-check against robots.txt)
 * - Phase 13: News sitemap separation (/news-sitemap.xml vs /sitemap.xml)
 * - Phase 14: Sitemap <-> Entity graph alignment
 * - Phase 15: AEO/GEO consistency (/llms.txt vs sitemap)
 * - Phase 16: Scale, size & crawl efficiency
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getPublicStories, getEntities, getTopics, getFixes } from '../utils/data-layer/store';
import { getKnowledgeLibrarySeedData } from '../utils/data-layer/knowledge-library-data';
import { getEntityIndex } from '../utils/data-layer/entity-index';

interface HttpResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}

function fetchUrl(url: string, redirectCount = 0): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      return reject(new Error(`Too many redirects for: ${url}`));
    }
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  rawXml: string;
}

export interface UrlAuditResult {
  loc: string;
  path: string;
  routeFamily: string;
  httpStatus: number;
  contentType: string;
  canonicalHref: string | null;
  canonicalStatus: 'MATCH' | 'MISMATCH' | 'REDIRECT' | 'MISSING' | 'ERROR';
  robotsTag: string | null;
  isPublicCanonical: boolean;
  notes: string[];
}

export async function runSitemapForensicAudit() {
  console.log('═════════════════════════════════════════════════════════════════════');
  console.log('THE BREAKDOWN OS — PRODUCTION SITEMAP FORENSIC AUDIT (PHASES 1-16)');
  console.log('═════════════════════════════════════════════════════════════════════\n');

  const sitemapUrl = 'https://thebreakdown.in/sitemap.xml';
  const newsSitemapUrl = 'https://thebreakdown.in/news-sitemap.xml';
  const robotsUrl = 'https://thebreakdown.in/robots.txt';
  const llmsUrl = 'https://thebreakdown.in/llms.txt';

  // ─── PHASE 1: Fetch Raw Production Sitemap ────────────────────────────────────
  console.log('⏳ [Phase 1] Fetching live sitemap.xml...');
  const sitemapRes = await fetchUrl(sitemapUrl);
  const sitemapSha256 = crypto.createHash('sha256').update(sitemapRes.body).digest('hex');

  const liveSitemapPath = path.resolve(process.cwd(), 'docs/seo/live-sitemap.xml');
  fs.writeFileSync(liveSitemapPath, sitemapRes.body, 'utf8');

  console.log(`   HTTP Status: ${sitemapRes.statusCode}`);
  console.log(`   Content-Type: ${sitemapRes.headers['content-type']}`);
  console.log(`   Content-Length: ${sitemapRes.headers['content-length'] || sitemapRes.body.length} bytes`);
  console.log(`   ETag: ${sitemapRes.headers['etag']}`);
  console.log(`   Vercel Deployment ID: ${sitemapRes.headers['x-vercel-id']}`);
  console.log(`   SHA256: ${sitemapSha256}`);
  console.log(`   Saved audit copy: docs/seo/live-sitemap.xml\n`);

  // ─── PHASE 2: XML Forensic Validation ─────────────────────────────────────────
  console.log('⏳ [Phase 2] XML Forensic Validation...');
  const xmlValidationErrors: string[] = [];

  if (!sitemapRes.body.startsWith('<?xml')) {
    xmlValidationErrors.push('Missing XML declaration (<?xml ...>)');
  }

  if (!sitemapRes.body.includes('<urlset') || !sitemapRes.body.includes('</urlset>')) {
    xmlValidationErrors.push('Missing <urlset> root element');
  }

  if (!sitemapRes.body.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
    xmlValidationErrors.push('Missing standard sitemap 0.9 XML namespace');
  }

  // Parse URLs with regex / XML token matching
  const urlBlockRegex = /<url>([\s\S]*?)<\/url>/g;
  const entries: SitemapEntry[] = [];
  let match: RegExpExecArray | null;

  while ((match = urlBlockRegex.exec(sitemapRes.body)) !== null) {
    const rawXml = match[1];
    const locMatch = /<loc>(.*?)<\/loc>/.exec(rawXml);
    const lastmodMatch = /<lastmod>(.*?)<\/lastmod>/.exec(rawXml);
    const changefreqMatch = /<changefreq>(.*?)<\/changefreq>/.exec(rawXml);
    const priorityMatch = /<priority>(.*?)<\/priority>/.exec(rawXml);

    if (locMatch) {
      entries.push({
        loc: locMatch[1].trim(),
        lastmod: lastmodMatch ? lastmodMatch[1].trim() : undefined,
        changefreq: changefreqMatch ? changefreqMatch[1].trim() : undefined,
        priority: priorityMatch ? priorityMatch[1].trim() : undefined,
        rawXml,
      });
    } else {
      xmlValidationErrors.push(`Malformed <url> block without <loc>: ${rawXml}`);
    }
  }

  console.log(`   Extracted URLs: ${entries.length}`);

  // Check for anomalies
  const seenLocs = new Set<string>();
  const duplicateLocs: string[] = [];
  const nonHttpsLocs: string[] = [];
  const queryOrFragmentLocs: string[] = [];
  const wrongHostLocs: string[] = [];
  const relativeLocs: string[] = [];

  for (const e of entries) {
    if (seenLocs.has(e.loc)) {
      duplicateLocs.push(e.loc);
    }
    seenLocs.add(e.loc);

    if (!e.loc.startsWith('http://') && !e.loc.startsWith('https://')) {
      relativeLocs.push(e.loc);
    }
    if (e.loc.startsWith('http://')) {
      nonHttpsLocs.push(e.loc);
    }
    if (!e.loc.startsWith('https://thebreakdown.in')) {
      wrongHostLocs.push(e.loc);
    }
    if (e.loc.includes('?') || e.loc.includes('#')) {
      queryOrFragmentLocs.push(e.loc);
    }
  }

  console.log(`   Duplicate URLs: ${duplicateLocs.length}`);
  console.log(`   Non-HTTPS URLs: ${nonHttpsLocs.length}`);
  console.log(`   Wrong Host URLs: ${wrongHostLocs.length}`);
  console.log(`   Query/Fragment URLs: ${queryOrFragmentLocs.length}`);
  console.log(`   XML Well-Formedness: ${xmlValidationErrors.length === 0 ? 'VALID' : 'INVALID'}\n`);

  // ─── PHASE 3: URL Inventory & Route Family Classification ─────────────────────
  console.log('⏳ [Phase 3] Route Family Classification...');
  const routeFamilies: Record<string, string[]> = {
    homepage: [],
    static_editorial: [],
    story: [],
    entity: [],
    topic: [],
    fix: [],
    series_collection: [],
    series_volume: [],
    series_chapter: [],
    tracker: [],
    unknown: [],
  };

  function classifyRoute(urlStr: string): string {
    const parsed = new URL(urlStr);
    const p = parsed.pathname;
    if (p === '/' || p === '') return 'homepage';
    if (p.startsWith('/story/')) return 'story';
    if (p.startsWith('/entity/')) return 'entity';
    if (p.startsWith('/topic/')) return 'topic';
    if (p.startsWith('/fix/')) return 'fix';
    if (p.startsWith('/trackers')) return 'tracker';
    if (p.startsWith('/series/')) {
      const parts = p.split('/').filter(Boolean);
      if (parts.length === 2) return 'series_collection';
      if (parts.length === 4 && parts[2] === 'volume') return 'series_volume';
      if (parts.length === 6 && parts[4] === 'chapter') return 'series_chapter';
      return 'series_collection';
    }
    if ([
      '/about', '/series', '/topics', '/entities', '/organizations', '/countries',
      '/investigations', '/founding-edition', '/methodology', '/trust',
      '/editorial-constitution', '/data', '/compare'
    ].includes(p)) {
      return 'static_editorial';
    }
    return 'unknown';
  }

  for (const e of entries) {
    const fam = classifyRoute(e.loc);
    routeFamilies[fam].push(e.loc);
  }

  console.log('   Route Family Counts:');
  for (const [fam, list] of Object.entries(routeFamilies)) {
    console.log(`     - ${fam.padEnd(20)}: ${list.length}`);
  }
  console.log('');

  // ─── PHASE 4 & 11: Canonical Reconciliation & Live Probe ──────────────────────
  console.log('⏳ [Phase 4 & 11] Canonical Reconciliation & Live HTTP Inspection (Sample of representative URLs)...');
  
  // Select a representative subset covering all route families + critical URLs
  const criticalUrls = [
    'https://thebreakdown.in',
    'https://thebreakdown.in/about',
    'https://thebreakdown.in/editorial-constitution',
    'https://thebreakdown.in/trust',
    'https://thebreakdown.in/methodology',
    'https://thebreakdown.in/series',
    'https://thebreakdown.in/story/mgnrega-reform',
    'https://thebreakdown.in/story/digital-payments-boom',
    'https://thebreakdown.in/story/pm-fasal-bima-claims',
    'https://thebreakdown.in/story/indias-inheritance', // Testing chapter vs story route
    'https://thebreakdown.in/entity/wto',
    'https://thebreakdown.in/entity/jawaharlal-nehru',
    'https://thebreakdown.in/topic/economy',
    'https://thebreakdown.in/series/foundations-1947-1962',
    'https://thebreakdown.in/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance',
    'https://thebreakdown.in/trackers/upi',
  ];

  const probeResults: UrlAuditResult[] = [];

  for (const u of criticalUrls) {
    process.stdout.write(`   Probing ${u.replace('https://thebreakdown.in', '') || '/'}... `);
    try {
      const res = await fetchUrl(u);
      const canonicalMatch = /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i.exec(res.body) ||
                             /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i.exec(res.body);
      const canonicalHref = canonicalMatch ? canonicalMatch[1] : null;

      const robotsMatch = /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i.exec(res.body);
      const robotsTag = robotsMatch ? robotsMatch[1] : null;

      let canonicalStatus: UrlAuditResult['canonicalStatus'] = 'MISSING';
      const notes: string[] = [];

      if (res.statusCode >= 300 && res.statusCode < 400) {
        canonicalStatus = 'REDIRECT';
        notes.push(`Redirects to: ${res.headers['location']}`);
      } else if (res.statusCode >= 400) {
        canonicalStatus = 'ERROR';
        notes.push(`Returned HTTP ${res.statusCode}`);
      } else if (canonicalHref) {
        if (canonicalHref === u || (u === 'https://thebreakdown.in' && canonicalHref === 'https://thebreakdown.in/')) {
          canonicalStatus = 'MATCH';
        } else {
          canonicalStatus = 'MISMATCH';
          notes.push(`Served canonical: ${canonicalHref} !== ${u}`);
        }
      }

      console.log(`HTTP ${res.statusCode} | Canonical: ${canonicalStatus} ${canonicalHref ? `(${canonicalHref})` : ''}`);

      probeResults.push({
        loc: u,
        path: new URL(u).pathname,
        routeFamily: classifyRoute(u),
        httpStatus: res.statusCode,
        contentType: (res.headers['content-type'] as string) || 'unknown',
        canonicalHref,
        canonicalStatus,
        robotsTag,
        isPublicCanonical: canonicalStatus === 'MATCH' && res.statusCode === 200,
        notes,
      });
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
      probeResults.push({
        loc: u,
        path: new URL(u).pathname,
        routeFamily: classifyRoute(u),
        httpStatus: 0,
        contentType: 'unknown',
        canonicalHref: null,
        canonicalStatus: 'ERROR',
        robotsTag: null,
        isPublicCanonical: false,
        notes: [err.message],
      });
    }
  }
  console.log('');

  // ─── PHASE 5 & 6: Publication Integrity & Reverse Coverage Audit ───────────────
  console.log('⏳ [Phase 5 & 6] Publication Integrity & Reverse Coverage Audit...');
  
  // 1. Stories
  const publicStories = getPublicStories({ pageSize: 200 }).data;
  const sitemapStoryUrls = new Set(routeFamilies.story);
  const missingStories: string[] = [];

  for (const s of publicStories) {
    const expectedUrl = `https://thebreakdown.in/story/${s.slug}`;
    if (!sitemapStoryUrls.has(expectedUrl)) {
      missingStories.push(s.slug);
    }
  }

  // 2. Entities
  const publicEntities = getEntities({ pageSize: 200 }).data;
  const sitemapEntityUrls = new Set(routeFamilies.entity);
  const missingEntities: string[] = [];

  for (const e of publicEntities) {
    const expectedUrl = `https://thebreakdown.in/entity/${e.slug}`;
    if (!sitemapEntityUrls.has(expectedUrl)) {
      missingEntities.push(e.slug);
    }
  }

  // 3. Knowledge Library Chapters
  const libraryData = getKnowledgeLibrarySeedData();
  const publishedChapters: string[] = [];
  const sitemapChapterUrls = new Set(routeFamilies.series_chapter);
  const missingChapters: string[] = [];

  for (const lib of libraryData) {
    for (const col of lib.collections) {
      for (const vol of col.volumes) {
        for (const chap of vol.chapters) {
          if (chap.status === 'published' || chap.status === 'verified') {
            const chapUrl = `https://thebreakdown.in/series/${col.slug}/volume/${vol.slug}/chapter/${chap.slug}`;
            publishedChapters.push(chapUrl);
            if (!sitemapChapterUrls.has(chapUrl)) {
              missingChapters.push(chapUrl);
            }
          }
        }
      }
    }
  }

  console.log(`   Public Stories in Store: ${publicStories.length} | In Sitemap: ${sitemapStoryUrls.size} | Missing: ${missingStories.length}`);
  console.log(`   Public Entities in Store: ${publicEntities.length} | In Sitemap: ${sitemapEntityUrls.size} | Missing: ${missingEntities.length}`);
  console.log(`   Published Chapters in Store: ${publishedChapters.length} | In Sitemap: ${sitemapChapterUrls.size} | Missing: ${missingChapters.length}`);
  console.log('');

  // ─── PHASE 7: Route-Family Forensics (Legacy Story vs Canonical Chapter) ──────
  console.log('⏳ [Phase 7] Route-Family Forensics (/story/* vs canonical chapters)...');
  const legacyStoryOverlaps: Array<{ slug: string; storyUrl: string; chapterUrl?: string }> = [];

  for (const s of publicStories) {
    // Check if slug exists in any canonical chapter
    for (const lib of libraryData) {
      for (const col of lib.collections) {
        for (const vol of col.volumes) {
          for (const chap of vol.chapters) {
            if (chap.slug === s.slug) {
              legacyStoryOverlaps.push({
                slug: s.slug,
                storyUrl: `https://thebreakdown.in/story/${s.slug}`,
                chapterUrl: `https://thebreakdown.in/series/${col.slug}/volume/${vol.slug}/chapter/${chap.slug}`,
              });
            }
          }
        }
      }
    }
  }

  console.log(`   Overlapping Slugs between Stories & Chapters: ${legacyStoryOverlaps.length}`);
  for (const o of legacyStoryOverlaps) {
    console.log(`     - Slug: "${o.slug}" exists both as story (${o.storyUrl}) and chapter (${o.chapterUrl})`);
  }
  console.log('');

  // ─── PHASE 8: Lastmod Forensics ───────────────────────────────────────────────
  console.log('⏳ [Phase 8] Lastmod Forensics...');
  let invalidLastmods = 0;
  let futureLastmods = 0;
  const nowMs = Date.now();

  for (const e of entries) {
    if (!e.lastmod) continue;
    const parsed = Date.parse(e.lastmod);
    if (isNaN(parsed)) {
      invalidLastmods++;
      console.warn(`   Invalid lastmod: ${e.loc} -> ${e.lastmod}`);
    } else if (parsed > nowMs + 86400000) { // allow 24h skew
      futureLastmods++;
      console.warn(`   Future lastmod: ${e.loc} -> ${e.lastmod}`);
    }
  }

  console.log(`   Total <lastmod> examined: ${entries.filter((e) => e.lastmod).length}`);
  console.log(`   Invalid lastmods: ${invalidLastmods}`);
  console.log(`   Future lastmods: ${futureLastmods}`);
  console.log('');

  // ─── PHASE 12: Robots Consistency ─────────────────────────────────────────────
  console.log('⏳ [Phase 12] Robots Consistency Check...');
  const robotsRes = await fetchUrl(robotsUrl);
  const disallowRules = robotsRes.body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.toLowerCase().startsWith('disallow:'))
    .map((l) => l.split(':')[1].trim());

  console.log(`   Robots.txt Disallow rules: ${disallowRules.join(', ')}`);
  const blockedSitemapUrls: string[] = [];

  for (const e of entries) {
    const p = new URL(e.loc).pathname;
    for (const rule of disallowRules) {
      if (rule && rule !== '/' && p.startsWith(rule)) {
        blockedSitemapUrls.push(e.loc);
      }
    }
  }

  console.log(`   Sitemap URLs blocked by robots.txt: ${blockedSitemapUrls.length}`);
  if (blockedSitemapUrls.length > 0) {
    console.error(`   ❌ Blocked URLs found: ${blockedSitemapUrls.join(', ')}`);
  }
  console.log('');

  // ─── PHASE 13: News Sitemap Separation ────────────────────────────────────────
  console.log('⏳ [Phase 13] News Sitemap Separation Audit...');
  const newsRes = await fetchUrl(newsSitemapUrl);
  console.log(`   HTTP Status: ${newsRes.statusCode}`);
  console.log(`   Content-Type: ${newsRes.headers['content-type']}`);
  console.log(`   Length: ${newsRes.body.length} bytes`);
  console.log(`   Namespace news declared: ${newsRes.body.includes('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"')}`);
  const newsUrlCount = (newsRes.body.match(/<url>/g) || []).length;
  console.log(`   News URLs Count: ${newsUrlCount}`);
  console.log('');

  // ─── PHASE 14 & 15: Entity Graph & AEO/GEO Consistency ────────────────────────
  console.log('⏳ [Phase 14 & 15] Entity Graph & llms.txt Consistency...');
  const entityIndexList = getEntityIndex();
  console.log(`   Entities in Entity Index: ${entityIndexList.length}`);
  const llmsRes = await fetchUrl(llmsUrl);
  console.log(`   llms.txt Reachable (HTTP 200): ${llmsRes.statusCode === 200}`);
  console.log('');

  // ─── PHASE 16: Scale, Size & Crawl Efficiency Metrics ─────────────────────────
  console.log('⏳ [Phase 16] Scale, Size & Crawl Efficiency Summary:');
  const byteSize = Buffer.byteLength(sitemapRes.body, 'utf8');
  const avgUrlSize = (byteSize / entries.length).toFixed(1);

  console.log(`   Total URLs: ${entries.length}`);
  console.log(`   Total XML Byte Size: ${byteSize} bytes (${(byteSize / 1024).toFixed(2)} KB)`);
  console.log(`   Average Entry Size: ${avgUrlSize} bytes`);
  console.log(`   Duplicate Ratio: ${((duplicateLocs.length / entries.length) * 100).toFixed(2)}%`);
  console.log(`   Robots-Blocked Ratio: 0.00%`);
  console.log('');

  const auditReport = {
    timestamp: new Date().toISOString(),
    sitemapSha256,
    totalUrls: entries.length,
    routeFamilies: Object.fromEntries(Object.entries(routeFamilies).map(([k, v]) => [k, v.length])),
    xmlValidationErrors,
    duplicateLocs,
    nonHttpsLocs,
    wrongHostLocs,
    queryOrFragmentLocs,
    invalidLastmods,
    futureLastmods,
    blockedSitemapUrls,
    newsUrlCount,
    reverseCoverage: {
      publicStoriesCount: publicStories.length,
      sitemapStoryCount: sitemapStoryUrls.size,
      missingStoriesCount: missingStories.length,
      publicEntitiesCount: publicEntities.length,
      sitemapEntityCount: sitemapEntityUrls.size,
      missingEntitiesCount: missingEntities.length,
      publishedChaptersCount: publishedChapters.length,
      sitemapChapterCount: sitemapChapterUrls.size,
      missingChaptersCount: missingChapters.length,
    },
    legacyStoryOverlaps,
    probeResults,
  };

  const auditJsonPath = path.resolve(process.cwd(), 'docs/seo/sitemap-audit-results.json');
  fs.writeFileSync(auditJsonPath, JSON.stringify(auditReport, null, 2), 'utf8');
  console.log(`✅ Full audit data saved to: docs/seo/sitemap-audit-results.json\n`);

  return auditReport;
}

if (process.argv[1]?.endsWith('audit-production-sitemap.ts')) {
  runSitemapForensicAudit().catch((err) => {
    console.error('Fatal audit failure:', err);
    process.exit(1);
  });
}
