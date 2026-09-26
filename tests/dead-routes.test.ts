/**
 * Dead Routes & Public Surface Integrity Test Suite
 *
 * Verifies remediation of dead routes, 404 errors, broken internal links,
 * and unauthorized redirects across The Breakdown platform:
 *  1. All 41 canonical entities resolve to valid Terminal View Models (0 dead entity routes)
 *  2. Public surfaces contain zero links to protected internal /operations
 *  3. Middleware redirects legacy routes (/tracking, /problems, /evolution, /precedents) to canonical destinations with 308
 *  4. Middleware unblocks /compare and permits public /api/search
 *  5. Compare page metadata domain typo (.gov -> .in) and canonical alternate are correct
 *  6. Next.js config includes security headers and legacy redirects
 *  7. Sitemap contains no deprecated debug URLs and includes required public hubs
 *  8. Hub pages contain valid canonical metadata
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { bootstrapServices } from '../lib/bootstrap';
import { buildEntityTerminalViewModel } from '../features/entity/view-model';
import { middleware } from '../middleware';
import sitemap from '../app/sitemap';
import robots from '../app/robots';
import { metadata as compareMetadata } from '../app/compare/page';
import { metadata as aboutMetadata } from '../app/about/page';
import { metadata as topicsMetadata } from '../app/topics/page';
import { metadata as trackersMetadata } from '../app/trackers/page';
import { metadata as dataMetadata } from '../app/data/page';
import { metadata as investigationsMetadata } from '../app/investigations/page';
import { metadata as seriesMetadata } from '../app/series/page';
import { metadata as trustMetadata } from '../app/trust/page';
import { metadata as methodologyMetadata } from '../app/methodology/page';
import fs from 'node:fs';
import path from 'node:path';

describe('Dead Routes & Surface Integrity Suite', () => {
  const services = bootstrapServices({ publicOnly: true });

  // ─── 1. Canonical Entity Resolution ─────────────────────────────────────────
  describe('1. Canonical Entity Resolution (0 null view models)', () => {
    const previouslyFailingEntities = [
      'commonwealth',
      'nam',
      'isa',
      'cdri',
      'ministry-of-education',
      'nmcg',
      'ministry-of-jal-shakti',
      'cpcb',
      'ministry-of-women-and-child-development',
      'election-commission',
      'resecurity',
    ];

    it('resolves all 11 previously failing entity routes to non-null view models', async () => {
      for (const slug of previouslyFailingEntities) {
        const vm = await buildEntityTerminalViewModel(services, slug);
        assert.ok(vm, `Entity "${slug}" must resolve to a valid view model, not null`);
        assert.equal(vm.slug, slug, `Entity slug must match "${slug}"`);
        assert.ok(vm.name, `Entity "${slug}" must have a name`);
      }
    });

    it('resolves all 41 canonical entities in the store without rejection', async () => {
      const allEntities = (await services.entities.getEntities({ pageSize: 100 })).data;
      assert.equal(allEntities.length, 41, 'Expected 41 entities in the canonical store');

      const nullEntities: string[] = [];
      for (const e of allEntities) {
        const vm = await buildEntityTerminalViewModel(services, e.slug);
        if (!vm) {
          nullEntities.push(e.slug);
        }
      }

      assert.deepEqual(nullEntities, [], `All 41 entities must resolve. Failed: ${nullEntities.join(', ')}`);
    });
  });

  // ─── 2. Operations Public Link Purge ────────────────────────────────────────
  describe('2. Public Surface Protection (/operations purge)', () => {
    it('verifies Footer.tsx does not link to protected /operations', () => {
      const footerPath = path.resolve(process.cwd(), 'components/layout/Footer.tsx');
      const footerContent = fs.readFileSync(footerPath, 'utf8');
      assert.ok(
        !footerContent.includes("href: '/operations'"),
        'Footer must not contain public links to /operations'
      );
    });

    it('verifies app/about/page.tsx does not link to protected /operations', () => {
      const aboutPath = path.resolve(process.cwd(), 'app/about/page.tsx');
      const aboutContent = fs.readFileSync(aboutPath, 'utf8');
      assert.ok(
        !aboutContent.includes('href="/operations"'),
        'About page must not contain public links to /operations'
      );
    });
  });

  // ─── 3. Middleware Redirects & Unblocking ────────────────────────────────────
  describe('3. Middleware Routing & Legacy Redirects', () => {
    it('redirects /tracking to /trackers with 308 permanent redirect', async () => {
      const req = new NextRequest('https://thebreakdown.in/tracking');
      const res = await middleware(req);
      assert.equal(res.status, 308);
      assert.equal(res.headers.get('location'), 'https://thebreakdown.in/trackers');
    });

    it('redirects /problems to /fix with 308 permanent redirect', async () => {
      const req = new NextRequest('https://thebreakdown.in/problems');
      const res = await middleware(req);
      assert.equal(res.status, 308);
      assert.equal(res.headers.get('location'), 'https://thebreakdown.in/fix');
    });

    it('redirects /problems/some-slug to /fix with 308 permanent redirect', async () => {
      const req = new NextRequest('https://thebreakdown.in/problems/learning-poverty');
      const res = await middleware(req);
      assert.equal(res.status, 308);
      assert.equal(res.headers.get('location'), 'https://thebreakdown.in/fix');
    });

    it('redirects /evolution to /data with 308 permanent redirect', async () => {
      const req = new NextRequest('https://thebreakdown.in/evolution');
      const res = await middleware(req);
      assert.equal(res.status, 308);
      assert.equal(res.headers.get('location'), 'https://thebreakdown.in/data');
    });

    it('redirects /precedents to /fix with 308 permanent redirect', async () => {
      const req = new NextRequest('https://thebreakdown.in/precedents');
      const res = await middleware(req);
      assert.equal(res.status, 308);
      assert.equal(res.headers.get('location'), 'https://thebreakdown.in/fix');
    });

    it('does NOT block /compare with 404 in middleware', async () => {
      const req = new NextRequest('https://thebreakdown.in/compare');
      const res = await middleware(req);
      // Middleware should allow /compare through (returns undefined/next response, NOT 404)
      assert.notEqual(res?.status, 404, '/compare must not be blocked with 404 in middleware');
    });

    it('permits unauthenticated access to /api/search in middleware', async () => {
      const req = new NextRequest('https://thebreakdown.in/api/search?q=kashmir');
      const res = await middleware(req);
      // Middleware must not return 401 Unauthorized for public /api/search
      assert.notEqual(res?.status, 401, '/api/search must be publicly accessible without API keys');
    });
  });

  // ─── 4. Compare Page Metadata & Typo Remediation ─────────────────────────────
  describe('4. Compare Page Metadata', () => {
    it('has canonical metadata pointing to https://thebreakdown.in/compare', () => {
      assert.equal(compareMetadata.alternates?.canonical, 'https://thebreakdown.in/compare');
    });

    it('has openGraph URL pointing to .in domain, not .gov', () => {
      assert.equal(compareMetadata.openGraph?.url, 'https://thebreakdown.in/compare');
      assert.ok(!JSON.stringify(compareMetadata).includes('thebreakdown.gov'));
    });
  });

  // ─── 5. Next.js Config Redirects & Headers ──────────────────────────────────
  describe('5. Next.js Configuration (Redirects & Security Headers)', () => {
    const nextConfig = require('../next.config.js');

    it('contains permanent redirects for legacy entry points', async () => {
      const redirects = await nextConfig.redirects();
      const expectedSources = [
        '/rss.xml',
        '/feed',
        '/chapters',
        '/explainers',
        '/the-fix',
        '/data-stories',
        '/policy-tracker',
        '/tracking',
      ];

      for (const src of expectedSources) {
        const found = redirects.find((r: any) => r.source === src);
        assert.ok(found, `next.config.js must contain redirect for ${src}`);
        assert.equal(found.permanent, true, `Redirect for ${src} must be permanent (308)`);
      }
    });

    it('contains comprehensive global security headers', async () => {
      const headerConfigs = await nextConfig.headers();
      const globalHeaders = headerConfigs.find((h: any) => h.source === '/:path*')?.headers || [];
      const headerMap = new Map(globalHeaders.map((h: any) => [h.key, h.value]));

      assert.equal(headerMap.get('X-Content-Type-Options'), 'nosniff');
      assert.equal(headerMap.get('X-Frame-Options'), 'DENY');
      assert.equal(headerMap.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
      assert.ok(headerMap.has('Permissions-Policy'));
    });
  });

  // ─── 6. Sitemap & Robots.txt Integrity ──────────────────────────────────────
  describe('6. Sitemap & Robots.txt Integrity', () => {
    it('verifies sitemap does not contain deprecated debug routes', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      const forbiddenPrefixes = [
        'https://thebreakdown.in/problems',
        'https://thebreakdown.in/evolution',
        'https://thebreakdown.in/precedents',
        'https://thebreakdown.in/tracking',
      ];

      for (const prefix of forbiddenPrefixes) {
        const badUrls = urls.filter((u) => u === prefix || u.startsWith(prefix + '/'));
        assert.deepEqual(badUrls, [], `Sitemap must not contain deprecated route: ${prefix}`);
      }
    });

    it('verifies sitemap includes essential public hubs', async () => {
      const entries = await sitemap();
      const urls = new Set(entries.map((e) => e.url));

      assert.ok(urls.has('https://thebreakdown.in/about'), 'Sitemap must contain /about');
      assert.ok(urls.has('https://thebreakdown.in/investigations'), 'Sitemap must contain /investigations');
      assert.ok(urls.has('https://thebreakdown.in/compare'), 'Sitemap must contain /compare');
      assert.ok(urls.has('https://thebreakdown.in/series'), 'Sitemap must contain /series');
      assert.ok(urls.has('https://thebreakdown.in/topics'), 'Sitemap must contain /topics');
      assert.ok(urls.has('https://thebreakdown.in/trackers'), 'Sitemap must contain /trackers');
      assert.ok(urls.has('https://thebreakdown.in/data'), 'Sitemap must contain /data');
    });

    it('verifies robots.txt disallows deprecated routes and allows investigations', () => {
      const robotsConfig = robots();
      const rule = robotsConfig.rules?.[0];
      assert.ok(rule);

      const allowed = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
      const disallowed = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];

      assert.ok(allowed.includes('/investigations'), 'Robots must allow /investigations');
      assert.ok(allowed.includes('/compare'), 'Robots must allow /compare');

      assert.ok(disallowed.includes('/problems'), 'Robots must disallow /problems');
      assert.ok(disallowed.includes('/evolution'), 'Robots must disallow /evolution');
      assert.ok(disallowed.includes('/precedents'), 'Robots must disallow /precedents');
      assert.ok(disallowed.includes('/tracking'), 'Robots must disallow /tracking');
    });
  });

  // ─── 7. Hub Pages Canonical Metadata ────────────────────────────────────────
  describe('7. Hub Pages Canonical Metadata', () => {
    const hubPages = [
      { name: 'About', meta: aboutMetadata, expected: 'https://thebreakdown.in/about' },
      { name: 'Topics', meta: topicsMetadata, expected: 'https://thebreakdown.in/topics' },
      { name: 'Trackers', meta: trackersMetadata, expected: 'https://thebreakdown.in/trackers' },
      { name: 'Data', meta: dataMetadata, expected: 'https://thebreakdown.in/data' },
      { name: 'Investigations', meta: investigationsMetadata, expected: 'https://thebreakdown.in/investigations' },
      { name: 'Series', meta: seriesMetadata, expected: 'https://thebreakdown.in/series' },
      { name: 'Trust', meta: trustMetadata, expected: 'https://thebreakdown.in/trust' },
      { name: 'Methodology', meta: methodologyMetadata, expected: 'https://thebreakdown.in/methodology' },
    ];

    for (const { name, meta, expected } of hubPages) {
      it(`verifies ${name} page contains canonical metadata pointing to ${expected}`, () => {
        assert.equal(meta.alternates?.canonical, expected, `${name} page canonical must be ${expected}`);
      });
    }
  });
});
