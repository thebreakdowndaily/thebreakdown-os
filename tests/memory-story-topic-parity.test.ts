import { describe, expect, it } from 'vitest';
import { MemoryStoryService } from '../services/repositories/memory/story';
import type { Story, Topic } from '../types/canonical';

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: '7a5d6a35-3261-47cc-8d75-90b6d7f1f012',
    slug: 'policy',
    name: 'Policy',
    description: 'Policy reporting',
    storyIds: [],
    relatedEntityIds: [],
    featuredStoryIds: [],
    countries: [],
    faq: [],
    timeline: [],
    statistics: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeStory(overrides: Partial<Story> = {}): Story {
  const past = '2026-01-01T00:00:00.000Z';
  return {
    id: 'story-1',
    slug: 'story-1',
    title: 'Policy story',
    headline: 'Policy story headline',
    summary: 'A factual summary',
    heroImage: '',
    author: 'The Breakdown Editorial',
    category: 'Policy',
    status: 'published',
    publicationStatus: 'published',
    storyType: 'standard',
    evidenceScore: 90,
    readingTime: 5,
    publishedAt: past,
    createdAt: past,
    updatedAt: past,
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

describe('MemoryStoryService.getPublicStoriesForTopic', () => {
  it('matches only explicit topic references and ignores category strings', async () => {
    const topic = makeTopic();
    const byUuid = makeStory({ id: 'uuid-story', slug: 'uuid-story', relatedTopicIds: [topic.id] });
    const bySlug = makeStory({ id: 'slug-story', slug: 'slug-story', relatedTopicIds: [topic.slug] });
    const byStoredId = makeStory({ id: 'stored-story', slug: 'stored-story' });
    const byCategoryOnly = makeStory({ id: 'cat-story', slug: 'cat-story', category: 'Policy' });
    const draftStory = makeStory({ id: 'draft-story', slug: 'draft-story', relatedTopicIds: [topic.slug], status: 'draft', publicationStatus: 'draft' });

    const topicWithStored = makeTopic({ storyIds: ['stored-story'] });
    const repo = new MemoryStoryService([byUuid, bySlug, byStoredId, byCategoryOnly, draftStory]);

    const res = await repo.getPublicStoriesForTopic(topicWithStored);

    expect(res.data.map((s) => s.id)).toEqual(
      expect.arrayContaining(['uuid-story', 'slug-story', 'stored-story'])
    );
    expect(res.data.map((s) => s.id)).not.toContain('cat-story');
    expect(res.data.map((s) => s.id)).not.toContain('draft-story');
    expect(res.meta.total).toBe(3);
  });
});
