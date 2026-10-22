import { afterEach, describe, expect, it } from 'vitest';
import type { Story } from '../types/canonical';
import type { APIStory } from '../utils/data-layer/types';
import { getPublicStories, getPublicStory, getStore } from '../utils/data-layer/store';
import { MemoryStoryService } from '../services/repositories/memory/story';

const LEGACY_SLUG = 'mgnrega-reform';
const PAST_DATE = '2000-01-01T00:00:00.000Z';

let originalApiStory: APIStory | null | undefined;

afterEach(() => {
  if (originalApiStory !== undefined) {
    const stories = getStore().stories;
    if (originalApiStory === null) stories.delete(LEGACY_SLUG);
    else stories.set(LEGACY_SLUG, originalApiStory);
    originalApiStory = undefined;
  }
});

function makeCanonicalStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 'legacy-quarantine-test',
    title: 'Legacy story fixture',
    slug: LEGACY_SLUG,
    headline: 'Legacy story fixture',
    summary: 'Regression fixture for publication quarantine.',
    heroImage: '',
    author: 'Test',
    category: 'test',
    status: 'draft',
    publicationStatus: 'draft',
    storyType: 'standard',
    evidenceScore: 0,
    readingTime: 1,
    publishedAt: PAST_DATE,
    createdAt: PAST_DATE,
    updatedAt: PAST_DATE,
    tags: [],
    blocks: [],
    sources: [],
    claims: [],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
    ...overrides,
  };
}

describe('test-artifact publication quarantine', () => {
  it('rejects quarantined legacy slugs in the raw data-layer detail and listing reads', () => {
    const stories = getStore().stories;
    const original = stories.get(LEGACY_SLUG);
    expect(original, `expected legacy fixture ${LEGACY_SLUG} in the seeded data`).toBeDefined();
    if (!original) throw new Error(`Missing seeded legacy fixture: ${LEGACY_SLUG}`);

    originalApiStory = original;
    stories.set(LEGACY_SLUG, {
      ...original,
      publicationStatus: 'draft',
      publishedAt: PAST_DATE,
      isTestArtifact: true,
    });

    expect(getPublicStory(LEGACY_SLUG)).toBeNull();
    expect(getPublicStories({ page: 1, pageSize: 100 }).data.some((story) => story.slug === LEGACY_SLUG)).toBe(false);
  });

  it('preserves legacy compatibility for non-quarantined stories', async () => {
    const story = makeCanonicalStory({ isTestArtifact: false });
    const service = new MemoryStoryService([story]);

    await expect(service.getPublicStoryBySlug(LEGACY_SLUG)).resolves.toMatchObject({
      slug: LEGACY_SLUG,
      isTestArtifact: false,
    });
  });

  it('rejects quarantined legacy slugs from memory repository detail and listing reads', async () => {
    const service = new MemoryStoryService([
      makeCanonicalStory({ isTestArtifact: true }),
    ]);

    await expect(service.getPublicStoryBySlug(LEGACY_SLUG)).resolves.toBeUndefined();
    const listed = await service.getPublicStories({ page: 1, pageSize: 20 });
    expect(listed.data.some((story) => story.slug === LEGACY_SLUG)).toBe(false);
  });
});
