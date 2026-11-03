import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getStore } from '@/utils/data-layer/store';
import { bootstrapServices } from '@/lib/bootstrap';
import { isPubliclyPublished, isCanonicalStoryPublic, diagnosePublication } from '@/lib/story/publication';
import { resolveStory } from '@/lib/story/resolver';
import type { Investigation, Story } from '@/types/canonical';

describe('Namami Gange Investigation & Chapter Integrity (AC-01..03)', () => {
  const all15ChapterSlugs = [
    'ng-ch-01-the-promise',
    'ng-ch-02-follow-the-money',
    'ng-ch-03-the-sewage-problem',
    'ng-ch-04-the-audit-trail',
    'ng-ch-05-procurement-and-accountability',
    'ng-ch-06-why-stps-dont-work',
    'ng-ch-07-water-quality',
    'ng-ch-08-city-report-cards',
    'ng-ch-09-contractors',
    'ng-ch-10-timeline-of-delays',
    'ng-ch-11-ecology',
    'ng-ch-12-voices-from-the-river',
    'ng-ch-13-government-response',
    'ng-ch-14-what-worked',
    'ng-ch-15-recommendations',
  ];

  it('AC-01: establishes authoritative state for all 15 Namami Gange chapters as quarantined drafts', async () => {
    const store = getStore();
    const services = bootstrapServices({ publicOnly: true });

    assert.strictEqual(all15ChapterSlugs.length, 15, 'Must have exactly 15 chapter slugs');

    for (const slug of all15ChapterSlugs) {
      const story = store.stories.get(slug);
      assert.ok(story, `Chapter ${slug} must exist in data layer store`);
      assert.notStrictEqual(story.publicationStatus, 'published', `Chapter ${slug} must not be marked published`);

      const diag = diagnosePublication(slug, {
        publicationStatus: story.publicationStatus,
        publishedAt: story.publishedAt,
        isTestArtifact: story.isTestArtifact,
        slug,
      });
      assert.strictEqual(diag.isPublic, false, `Chapter ${slug} must fail publication diagnostic`);

      // Public services must NOT expose quarantined draft chapters
      const publicStory = await services.stories.getPublicStoryBySlug(slug);
      assert.strictEqual(publicStory, undefined, `Public story service must not return quarantined draft ${slug}`);
    }
  });

  it('AC-03: verifies all 15 chapter routes fail closed with not_found (HTTP 404)', async () => {
    for (const slug of all15ChapterSlugs) {
      const resolution = await resolveStory(slug);
      assert.strictEqual(resolution.type, 'not_found', `Route resolver must return not_found for ${slug}`);
    }
  });

  it('AC-02: investigation page derives chapter publication state and computes accurate published count', async () => {
    const services = bootstrapServices({ publicOnly: true });
    const inv = await services.investigations.getInvestigationBySlug('namami-gange');
    assert.ok(inv, 'Namami Gange investigation must exist');
    assert.strictEqual(inv.chapters.length, 15, 'Investigation must contain 15 total planned chapters');

    // Evaluate each chapter using canonical publication policy
    const evaluated = await Promise.all(
      inv.chapters.map(async (ch) => {
        const publicStory = await services.stories.getPublicStoryBySlug(ch.storySlug);
        const isPublished = Boolean(publicStory && isCanonicalStoryPublic(publicStory));
        return { ch, isPublished };
      })
    );

    const publishedChapters = evaluated.filter((e) => e.isPublished);
    const publishedCount = publishedChapters.length;

    // All 15 chapters are quarantined drafts, so published count MUST be 0
    assert.strictEqual(publishedCount, 0, 'Published chapter count must be 0 when all chapters are quarantined');

    // Overview story must resolve to the real published investigative overview story
    const candidateOverview = inv.overviewStorySlug || 'namami-gange-under-fire';
    const overviewStory = await services.stories.getPublicStoryBySlug(candidateOverview);
    assert.ok(overviewStory, 'Overview story namami-gange-under-fire must be a public story');
    assert.strictEqual(overviewStory.slug, 'namami-gange-under-fire');
    assert.strictEqual(isCanonicalStoryPublic(overviewStory), true);
  });

  it('simulates mixed publication states: only eligible chapters generate public routes', async () => {
    // Construct mock investigation with 1 published and 2 draft chapters
    const mockChapters = [
      { id: 'ch-pub', slug: 'mgnrega-reform', storySlug: 'mgnrega-reform', title: 'MGNREGA', summary: '', order: 1 },
      { id: 'ch-draft-1', slug: 'ng-ch-01-the-promise', storySlug: 'ng-ch-01-the-promise', title: 'Promise', summary: '', order: 2 },
      { id: 'ch-draft-2', slug: 'ng-ch-02-follow-the-money', storySlug: 'ng-ch-02-follow-the-money', title: 'Money', summary: '', order: 3 },
    ];

    const services = bootstrapServices({ publicOnly: true });
    const evaluated = await Promise.all(
      mockChapters.map(async (ch) => {
        const publicStory = await services.stories.getPublicStoryBySlug(ch.storySlug);
        const isPublished = Boolean(publicStory && isCanonicalStoryPublic(publicStory));
        return { ch, isPublished };
      })
    );

    const published = evaluated.filter((e) => e.isPublished);
    assert.strictEqual(published.length, 1, 'Only the published chapter is counted');
    assert.strictEqual(published[0].ch.storySlug, 'mgnrega-reform');
  });

  it('rejects malformed or nonexistent chapter slug requests safely', async () => {
    const invalidSlugs = [
      'ng-ch-99-nonexistent',
      'ng-ch-00',
      '../../../etc/passwd',
      'ng-ch-01-the-promise/../../admin',
      '',
    ];

    for (const slug of invalidSlugs) {
      const resolution = await resolveStory(slug);
      assert.strictEqual(resolution.type, 'not_found', `Malformed slug ${slug} must return not_found`);
    }
  });
});
