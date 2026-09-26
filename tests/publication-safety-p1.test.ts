/**
 * P1 Publication Safety Regression Test Suite
 *
 * Validates remediation for:
 *   - F-01: Chapter redirect publication gate in app/story/[slug]/page.tsx
 *   - F-02: Search draft filtering in app/search/page.tsx
 *   - F-03: Chapter generateMetadata() fail-closed in app/series/.../chapter/[chapterSlug]/page.tsx
 *   - TEST 4: Future-dated published content embargo validation
 *   - TEST 5: Canonical regression for published rbi-repo-rate
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { isPubliclyPublished, isCanonicalStoryPublic } from '../lib/story/publication';
import { resolveStory, resolveCanonicalStory } from '../lib/story/resolver';
import { CANONICAL_ELIGIBILITY_REGISTRY } from '../lib/feature-flags';
import { RepositoryFactory } from '../services/factory/repository';
import { getKnowledgeLibrarySeedData } from '../utils/data-layer/knowledge-library-data';
import StoryPage, { generateMetadata as generateStoryMetadata } from '../app/story/[slug]/page';
import { generateMetadata as generateChapterMetadata } from '../app/series/[collectionSlug]/volume/[volumeSlug]/chapter/[chapterSlug]/page';

describe('P1 Publication Safety Suite', () => {
  const originalEnv = process.env.CANONICAL_READ_PATH;

  afterEach(() => {
    process.env.CANONICAL_READ_PATH = originalEnv;
    delete (CANONICAL_ELIGIBILITY_REGISTRY as any)['kashmir-the-first-test'];
    delete (CANONICAL_ELIGIBILITY_REGISTRY as any)['india-china-border-lac'];
  });

  // ─── TEST 1: DRAFT CHAPTER REDIRECT (F-01) ──────────────────────────────────
  describe('F-01: Draft Chapter Redirect Gate (/story/[slug])', () => {
    beforeEach(() => {
      // Configure test environment so kashmir-the-first-test routes through canonical chapter path
      (CANONICAL_ELIGIBILITY_REGISTRY as any)['kashmir-the-first-test'] = 'ELIGIBLE';
      process.env.CANONICAL_READ_PATH = 'ON';
    });

    it('verifies resolveCanonicalStory marks draft chapter kashmir-the-first-test as not public', async () => {
      const resolution = await resolveCanonicalStory('kashmir-the-first-test');
      assert.equal(resolution.type, 'chapter');
      if (resolution.type === 'chapter') {
        assert.equal(resolution.chapter.status, 'draft');
        assert.equal(resolution.canonicalStory.publicationStatus, 'draft');
        assert.equal(isCanonicalStoryPublic(resolution.canonicalStory), false, 'Draft chapter must not be canonical public');
      }
    });

    it('does NOT issue a 308 canonical redirect for draft chapter kashmir-the-first-test', async () => {
      let threwNotFound = false;
      let threwRedirect = false;
      let redirectUrl = '';

      try {
        await StoryPage({
          params: Promise.resolve({ slug: 'kashmir-the-first-test' }),
          searchParams: Promise.resolve({}),
        });
      } catch (err: any) {
        if (err?.digest?.startsWith('NEXT_REDIRECT')) {
          threwRedirect = true;
          redirectUrl = err.digest;
        } else if (
          err?.digest === 'NEXT_NOT_FOUND' ||
          err?.digest?.includes('404') ||
          err?.digest?.includes('NEXT_HTTP_ERROR_FALLBACK') ||
          err?.message === 'NEXT_NOT_FOUND'
        ) {
          threwNotFound = true;
        }
      }

      assert.equal(threwRedirect, false, `Draft chapter must not trigger a redirect! Triggered: ${redirectUrl}`);
      assert.equal(threwNotFound, true, 'Draft chapter must fail-closed with NEXT_NOT_FOUND');
    });

    it('emits not-found metadata for draft chapter requested on /story route', async () => {
      const meta = await generateStoryMetadata({
        params: Promise.resolve({ slug: 'kashmir-the-first-test' }),
      });

      assert.equal(meta.title, 'Story Not Found — The Breakdown');
      assert.equal(meta.description, undefined, 'Draft description must not be leaked');
      assert.equal(meta.openGraph, undefined, 'Draft OpenGraph must not be leaked');
    });
  });

  // ─── TEST 2: SEARCH DRAFT FILTER (F-02) ──────────────────────────────────────
  describe('F-02: Search Draft Filter', () => {
    it('excludes draft chapters from search results for query "kashmir"', async () => {
      const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
      const library = await repo.getLibrary('india-and-the-world');
      assert.ok(library, 'india-and-the-world library must exist');

      const now = new Date();
      const isChapterPublic = (ch: { status?: string; createdAt?: string; publishedAt?: string }): boolean => {
        const isStatusPublic = ch.status === 'published' || ch.status === 'verified';
        const pubStatus = isStatusPublic ? 'published' : 'draft';
        const publishedAt = ch.publishedAt || ch.createdAt;
        return isPubliclyPublished({ publicationStatus: pubStatus, publishedAt }, now);
      };

      const query = 'kashmir';
      const matchingChapters = library.collections.flatMap((c) =>
        c.volumes.flatMap((v) =>
          v.chapters.filter(
            (ch) =>
              isChapterPublic(ch) &&
              (ch.title.toLowerCase().includes(query.toLowerCase()) ||
               ch.summary.toLowerCase().includes(query.toLowerCase()))
          ).map((ch) => ({
            ...ch,
            collectionSlug: c.slug,
            volumeSlug: v.slug,
          }))
        )
      );

      const foundDraft = matchingChapters.some(
        (ch) => ch.slug === 'kashmir-the-first-test' || ch.status === 'draft'
      );
      assert.equal(foundDraft, false, 'Draft chapter kashmir-the-first-test MUST NOT be in search results');
    });

    it('excludes draft chapter india-china-border-lac from search results', async () => {
      const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
      const library = await repo.getLibrary('india-and-the-world');
      assert.ok(library, 'india-and-the-world library must exist');

      const now = new Date();
      const isChapterPublic = (ch: { status?: string; createdAt?: string; publishedAt?: string }): boolean => {
        const isStatusPublic = ch.status === 'published' || ch.status === 'verified';
        const pubStatus = isStatusPublic ? 'published' : 'draft';
        const publishedAt = ch.publishedAt || ch.createdAt;
        return isPubliclyPublished({ publicationStatus: pubStatus, publishedAt }, now);
      };

      const query = 'lac';
      const matchingChapters = library.collections.flatMap((c) =>
        c.volumes.flatMap((v) =>
          v.chapters.filter(
            (ch) =>
              isChapterPublic(ch) &&
              (ch.title.toLowerCase().includes(query.toLowerCase()) ||
               ch.summary.toLowerCase().includes(query.toLowerCase()))
          )
        )
      );

      const foundDraftLac = matchingChapters.some((ch) => ch.slug === 'india-china-border-lac');
      assert.equal(foundDraftLac, false, 'Draft chapter india-china-border-lac MUST NOT appear in search');
    });

    it('keeps verified matching chapters present in search results', async () => {
      const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
      const library = await repo.getLibrary('india-and-the-world');
      assert.ok(library, 'india-and-the-world library must exist');

      const now = new Date();
      const isChapterPublic = (ch: { status?: string; createdAt?: string; publishedAt?: string }): boolean => {
        const isStatusPublic = ch.status === 'published' || ch.status === 'verified';
        const pubStatus = isStatusPublic ? 'published' : 'draft';
        const publishedAt = ch.publishedAt || ch.createdAt;
        return isPubliclyPublished({ publicationStatus: pubStatus, publishedAt }, now);
      };

      const query = 'partition';
      const matchingChapters = library.collections.flatMap((c) =>
        c.volumes.flatMap((v) =>
          v.chapters.filter(
            (ch) =>
              isChapterPublic(ch) &&
              (ch.title.toLowerCase().includes(query.toLowerCase()) ||
               ch.summary.toLowerCase().includes(query.toLowerCase()))
          )
        )
      );

      assert.ok(matchingChapters.length > 0, 'Verified chapter indias-inheritance should be found');
      assert.equal(matchingChapters[0].slug, 'indias-inheritance');
    });
  });

  // ─── TEST 3: CHAPTER METADATA (F-03) ─────────────────────────────────────────
  describe('F-03: Chapter generateMetadata() Gate', () => {
    it('returns fail-closed not-found metadata for draft chapter kashmir-the-first-test', async () => {
      const meta = await generateChapterMetadata({
        params: Promise.resolve({
          collectionSlug: 'foundations-1947-1962',
          volumeSlug: 'the-nehruvian-era',
          chapterSlug: 'kashmir-the-first-test',
        }),
      });

      assert.equal(meta.title, 'Chapter Not Found — The Breakdown');
      assert.equal(meta.description, undefined, 'Draft description must not be leaked');
      assert.equal(meta.openGraph, undefined, 'Draft OpenGraph metadata must not be leaked');
      assert.equal(meta.twitter, undefined, 'Draft Twitter metadata must not be leaked');
      assert.equal(meta.alternates, undefined, 'Draft canonical link must not be leaked');
    });

    it('returns fail-closed not-found metadata for draft chapter india-china-border-lac', async () => {
      const meta = await generateChapterMetadata({
        params: Promise.resolve({
          collectionSlug: 'foundations-1947-1962',
          volumeSlug: 'the-nehruvian-era',
          chapterSlug: 'india-china-border-lac',
        }),
      });

      assert.equal(meta.title, 'Chapter Not Found — The Breakdown');
      assert.equal(meta.description, undefined);
      assert.equal(meta.openGraph, undefined);
    });
  });

  // ─── TEST 4: FUTURE-DATED PUBLISHED CONTENT ──────────────────────────────────
  describe('TEST 4: Future-Dated Published Chapter Embargo', () => {
    it('rejects publication when status is published but publishedAt is in the future', () => {
      const futureDate = '2099-01-01T00:00:00Z';
      const isPublic = isPubliclyPublished({
        publicationStatus: 'published',
        publishedAt: futureDate,
      });

      assert.equal(isPublic, false, 'Future-dated published content must fail-closed (embargoed)');
    });

    it('rejects publication when publishedAt is invalid or missing', () => {
      assert.equal(
        isPubliclyPublished({ publicationStatus: 'published', publishedAt: 'invalid-date' }),
        false,
        'Invalid publishedAt must fail-closed'
      );
      assert.equal(
        isPubliclyPublished({ publicationStatus: 'published', publishedAt: undefined }),
        false,
        'Missing publishedAt must fail-closed'
      );
    });
  });

  // ─── TEST 5: CANONICAL REGRESSION FOR rbi-repo-rate ─────────────────────────
  describe('TEST 5: Published Canonical Regression (rbi-repo-rate)', () => {
    beforeEach(() => {
      process.env.CANONICAL_READ_PATH = 'CANARY';
    });

    it('resolves rbi-repo-rate as a canonical chapter under CANARY read path', async () => {
      const resolution = await resolveStory('rbi-repo-rate');
      assert.equal(resolution.type, 'chapter', 'rbi-repo-rate must resolve as canonical chapter under CANARY');

      if (resolution.type === 'chapter') {
        assert.equal(resolution.collectionSlug, 'economic-policy-2026');
        assert.equal(resolution.volumeSlug, 'structural-reforms');
        assert.equal(resolution.chapter.slug, 'rbi-repo-rate');
        assert.equal(isCanonicalStoryPublic(resolution.canonicalStory), true, 'rbi-repo-rate must be public');
      }
    });

    it('issues a 308 permanent redirect from /story/rbi-repo-rate to its canonical chapter path', async () => {
      let redirectedTo = '';
      try {
        await StoryPage({
          params: Promise.resolve({ slug: 'rbi-repo-rate' }),
          searchParams: Promise.resolve({}),
        });
      } catch (err: any) {
        if (err?.digest?.startsWith('NEXT_REDIRECT')) {
          redirectedTo = err.digest;
        }
      }

      assert.ok(
        redirectedTo.includes('/series/economic-policy-2026/volume/structural-reforms/chapter/rbi-repo-rate'),
        `Expected redirect to canonical chapter route, got: ${redirectedTo}`
      );
      assert.ok(
        redirectedTo.includes('308'),
        `Expected permanent redirect (308), got: ${redirectedTo}`
      );
    });

    it('generates full public metadata for published chapter rbi-repo-rate', async () => {
      const meta = await generateChapterMetadata({
        params: Promise.resolve({
          collectionSlug: 'economic-policy-2026',
          volumeSlug: 'structural-reforms',
          chapterSlug: 'rbi-repo-rate',
        }),
      });

      assert.ok(
        meta.title?.toString().includes('RBI Monetary Policy Adjustments 2026'),
        `Expected title to include RBI chapter title, got: ${meta.title}`
      );
      assert.ok(meta.description && meta.description.length > 0, 'Published chapter must have description');
      assert.ok(meta.openGraph, 'Published chapter must have OpenGraph metadata');
      assert.ok(meta.twitter, 'Published chapter must have Twitter metadata');
      assert.equal(
        (meta.alternates as any)?.canonical,
        'https://thebreakdown.in/series/economic-policy-2026/volume/structural-reforms/chapter/rbi-repo-rate',
        'Canonical URL must point to canonical chapter path'
      );
    });
  });
});
