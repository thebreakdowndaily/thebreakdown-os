import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Story, Topic } from '../types/canonical';

const mocks = vi.hoisted(() => ({
  getServices: vi.fn(),
}));

vi.mock('@/services/registry', () => ({
  getServices: mocks.getServices,
}));

import { StoryAggregator } from '../services/topics/pipeline/stories';

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
  const now = '2026-10-01T00:00:00.000Z';
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
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
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

function mockPublicStories(stories: Story[]) {
  const getPublicStories = vi.fn().mockResolvedValue({
    data: stories,
    meta: { total: stories.length, page: 1, pageSize: stories.length },
  });
  mocks.getServices.mockReturnValue({
    stories: { getPublicStories },
  });
  return getPublicStories;
}

describe('StoryAggregator', () => {
  beforeEach(() => {
    mocks.getServices.mockReset();
  });

  it('populates a topic when topic.storyIds is empty using reverse links and exact categories', async () => {
    const topic = makeTopic();
    const byUuid = makeStory({ id: 'uuid-linked', slug: 'uuid-linked', relatedTopicIds: [topic.id] });
    const bySlug = makeStory({ id: 'slug-linked', slug: 'slug-linked', relatedTopicIds: [topic.slug] });
    const byCategory = makeStory({ id: 'category-linked', slug: 'category-linked', category: ' POLICY ' });
    const unrelated = makeStory({ id: 'unrelated', slug: 'unrelated', category: 'governance' });
    const getPublicStories = mockPublicStories([byUuid, bySlug, byCategory, unrelated]);

    const result = await new StoryAggregator().aggregate(topic, { topic });

    expect(getPublicStories).toHaveBeenCalledOnce();
    expect(result.storyGroups?.latest.map((story) => story.id)).toEqual([
      'uuid-linked',
      'slug-linked',
      'category-linked',
    ]);
  });

  it('deduplicates a story that matches multiple relationship paths', async () => {
    const topic = makeTopic({
      storyIds: ['same-story'],
      featuredStoryIds: ['same-story'],
    });
    const matching = makeStory({
      id: 'same-story',
      slug: 'same-story',
      relatedTopicIds: [topic.id, topic.slug],
    });
    mockPublicStories([matching]);

    const result = await new StoryAggregator().aggregate(topic, { topic });

    expect(result.storyGroups?.latest).toHaveLength(1);
  });

  it('fails closed for drafts, future stories, and quarantined artifacts', async () => {
    const topic = makeTopic();
    const draft = makeStory({
      id: 'draft',
      slug: 'draft',
      relatedTopicIds: [topic.id],
      publicationStatus: 'draft',
      status: 'draft',
    });
    const future = makeStory({
      id: 'future',
      slug: 'future',
      relatedTopicIds: [topic.id],
      publishedAt: '2099-01-01T00:00:00.000Z',
    });
    const artifact = makeStory({
      id: 'artifact',
      slug: 'artifact',
      relatedTopicIds: [topic.id],
      isTestArtifact: true,
    });
    mockPublicStories([draft, future, artifact]);

    const result = await new StoryAggregator().aggregate(topic, { topic });

    expect(result.storyGroups?.latest).toEqual([]);
  });
});
