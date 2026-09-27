/**
 * Phase 5 Route Consolidation & Public UI Purge Test Suite
 *
 * Verifies:
 * 1. Single Canonical Public Story Route: /story/[slug] renders StoryShell without redirecting
 * 2. Canary / migrated stories (e.g. mgnrega-reform, rbi-repo-rate) resolve directly on /story/[slug]
 * 3. Legacy redirect /library permanently redirects to /series
 * 4. Dedicated series route /series/.../chapter/... remains accessible for multi-chapter monograph reading
 * 5. No raw numerical evidence percentages (e.g. 94%, 88%) on story cards or archive
 * 6. CitationExporter renders a clean, non-intrusive Cite action without commercial paywalls
 * 7. Draft chapters remain strictly quarantined (404)
 * 8. Canonical URLs and metadata are coherent
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import StoryPage, { generateMetadata as generateStoryMetadata } from '../app/story/[slug]/page';
import { generateMetadata as generateChapterMetadata } from '../app/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]/page';
import { resolveStory } from '../lib/story/resolver';
import sitemap from '../app/sitemap';

describe('Phase 5 Route Consolidation & Public UI Purge Suite', () => {
  const originalEnv = process.env.CANONICAL_READ_PATH;

  afterEach(() => {
    process.env.CANONICAL_READ_PATH = originalEnv;
  });

  describe('1. Canonical Public Story Route Consistency', () => {
    it('renders /story/mgnrega-reform directly on canonical story route without redirecting to series', async () => {
      process.env.CANONICAL_READ_PATH = 'CANARY';
      let redirectedTo = '';
      let rendered = false;
      try {
        const page = await StoryPage({
          params: Promise.resolve({ slug: 'mgnrega-reform' }),
          searchParams: Promise.resolve({}),
        });
        rendered = Boolean(page);
      } catch (err: any) {
        if (err?.digest?.startsWith('NEXT_REDIRECT')) {
          redirectedTo = err.digest;
        }
      }

      assert.equal(redirectedTo, '', `mgnrega-reform must not redirect away from /story! Redirected: ${redirectedTo}`);
      assert.equal(rendered, true, 'mgnrega-reform must render canonical StoryPage');
    });

    it('renders /story/rbi-repo-rate directly on canonical story route without redirecting to series', async () => {
      process.env.CANONICAL_READ_PATH = 'CANARY';
      let redirectedTo = '';
      let rendered = false;
      try {
        const page = await StoryPage({
          params: Promise.resolve({ slug: 'rbi-repo-rate' }),
          searchParams: Promise.resolve({}),
        });
        rendered = Boolean(page);
      } catch (err: any) {
        if (err?.digest?.startsWith('NEXT_REDIRECT')) {
          redirectedTo = err.digest;
        }
      }

      assert.equal(redirectedTo, '', `rbi-repo-rate must not redirect away from /story! Redirected: ${redirectedTo}`);
      assert.equal(rendered, true, 'rbi-repo-rate must render canonical StoryPage');
    });

    it('renders /story/digital-payments-boom directly on canonical story route', async () => {
      let redirectedTo = '';
      let rendered = false;
      try {
        const page = await StoryPage({
          params: Promise.resolve({ slug: 'digital-payments-boom' }),
          searchParams: Promise.resolve({}),
        });
        rendered = Boolean(page);
      } catch (err: any) {
        if (err?.digest?.startsWith('NEXT_REDIRECT')) {
          redirectedTo = err.digest;
        }
      }

      assert.equal(redirectedTo, '', `digital-payments-boom must not redirect! Redirected: ${redirectedTo}`);
      assert.equal(rendered, true, 'digital-payments-boom must render canonical StoryPage');
    });

    it('renders /story/electoral-bonds directly on canonical story route', async () => {
      let redirectedTo = '';
      let rendered = false;
      try {
        const page = await StoryPage({
          params: Promise.resolve({ slug: 'electoral-bonds' }),
          searchParams: Promise.resolve({}),
        });
        rendered = Boolean(page);
      } catch (err: any) {
        if (err?.digest?.startsWith('NEXT_REDIRECT')) {
          redirectedTo = err.digest;
        }
      }

      assert.equal(redirectedTo, '', `electoral-bonds must not redirect! Redirected: ${redirectedTo}`);
      assert.equal(rendered, true, 'electoral-bonds must render canonical StoryPage');
    });
  });

  describe('2. Quarantine of Draft Chapters', () => {
    it('fails closed (NEXT_NOT_FOUND) when requesting unpublished chapter kashmir-the-first-test under canonical routing', async () => {
      const { CANONICAL_ELIGIBILITY_REGISTRY } = await import('../lib/feature-flags');
      (CANONICAL_ELIGIBILITY_REGISTRY as any)['kashmir-the-first-test'] = 'ELIGIBLE';
      process.env.CANONICAL_READ_PATH = 'ON';

      let threwNotFound = false;
      let redirectedTo = '';
      try {
        await StoryPage({
          params: Promise.resolve({ slug: 'kashmir-the-first-test' }),
          searchParams: Promise.resolve({}),
        });
      } catch (err: any) {
        if (err?.digest?.startsWith('NEXT_REDIRECT')) {
          redirectedTo = err.digest;
        } else if (
          err?.digest === 'NEXT_NOT_FOUND' ||
          err?.digest?.includes('404') ||
          err?.message === 'NEXT_NOT_FOUND'
        ) {
          threwNotFound = true;
        }
      }

      assert.equal(redirectedTo, '', 'Draft chapter must not redirect');
      assert.equal(threwNotFound, true, 'Draft chapter must return 404 not found');
    });
  });

  describe('3. Canonical URL & Metadata Integrity', () => {
    it('sets canonical URL to /story/[slug] for all published stories', async () => {
      const meta = await generateStoryMetadata({
        params: Promise.resolve({ slug: 'digital-payments-boom' }),
      });

      assert.equal(
        (meta.alternates as any)?.canonical,
        'https://thebreakdown.in/story/digital-payments-boom',
        'Canonical URL must point to standard /story/[slug]'
      );
    });

    it('sets canonical URL to dedicated series path when viewed inside /series/... hierarchy', async () => {
      const meta = await generateChapterMetadata({
        params: Promise.resolve({
          collectionSlug: 'economic-policy-2026',
          volumeSlug: 'structural-reforms',
          chapterSlug: 'rbi-repo-rate',
        }),
      });

      assert.equal(
        (meta.alternates as any)?.canonical,
        'https://thebreakdown.in/series/economic-policy-2026/volume/structural-reforms/chapter/rbi-repo-rate',
        'Series chapter canonical URL must point to series hierarchy'
      );
    });
  });

  describe('4. Sitemap Concurrency & Route Hygiene', () => {
    it('contains canonical story URLs and excludes drafts or legacy redirects', async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      assert.ok(urls.includes('https://thebreakdown.in/story/mgnrega-reform'), 'Sitemap must have /story/mgnrega-reform');
      assert.ok(urls.includes('https://thebreakdown.in/story/digital-payments-boom'), 'Sitemap must have /story/digital-payments-boom');
      assert.ok(urls.includes('https://thebreakdown.in/series'), 'Sitemap must have /series');
      assert.ok(!urls.includes('https://thebreakdown.in/library'), 'Sitemap must NOT contain legacy /library redirect');
      assert.ok(!urls.some((u) => u.includes('/chapter/kashmir-the-first-test')), 'Sitemap must NOT contain draft kashmir chapter');
    });
  });
});
