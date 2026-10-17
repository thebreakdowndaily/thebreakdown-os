import { describe, expect, it } from 'vitest';
import type { Story, Topic } from '../types/canonical';
import { buildPublicTopicSummaries } from '../features/topic/public-topic-summary';

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: 'topic-economy-id',
    slug: 'economy',
    name: 'Economy & Finance',
    description: 'Economic reporting',
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
    title: 'A public story',
    slug: 'public-story',
    headline: 'A public story headline',
    summary: 'A factual summary',
    heroImage: '/images/stories/example.jpg',
    author: 'The Breakdown Editorial',
    category: 'Economy',
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

describe('buildPublicTopicSummaries', () => {
  it('reconciles reverse story-to-topic links and sorts recent coverage first', () => {
    const topic = makeTopic();
    const older = makeStory({
      id: 'story-old',
      slug: 'story-old',
      headline: 'Older coverage',
      publishedAt: '2026-08-01T00:00:00.000Z',
      relatedTopicIds: [topic.id],
    });
    const newer = makeStory({
      id: 'story-new',
      slug: 'story-new',
      headline: 'Newer coverage',
      publishedAt: '2026-10-01T00:00:00.000Z',
      relatedTopicIds: [topic.slug],
    });

    const summary = buildPublicTopicSummaries([topic], [older, newer]).get(topic.slug);

    expect(summary?.storyCount).toBe(2);
    expect(summary?.stories).toEqual([
      { slug: 'story-new', headline: 'Newer coverage' },
      { slug: 'story-old', headline: 'Older coverage' },
    ]);
  });

  it('supports stored story IDs and featured story IDs without double counting', () => {
    const topic = makeTopic({
      storyIds: ['story-1', 'featured-story'],
      featuredStoryIds: ['story-1', 'featured-story'],
    });
    const regular = makeStory({ id: 'story-1', slug: 'regular-story' });
    const featured = makeStory({
      id: 'featured-story',
      slug: 'featured-story',
      publishedAt: '2026-09-01T00:00:00.000Z',
    });

    const summary = buildPublicTopicSummaries([topic], [regular, featured]).get(topic.slug);

    expect(summary?.storyCount).toBe(2);
    expect(summary?.stories.map((story) => story.slug)).toEqual([
      'regular-story',
      'featured-story',
    ]);
  });

  it('does not infer topic links from category names or tags', () => {
    const topic = makeTopic();
    const unrelated = makeStory({ category: 'Economy', tags: ['economy'] });

    expect(buildPublicTopicSummaries([topic], [unrelated]).get(topic.slug)).toEqual({
      storyCount: 0,
      stories: [],
    });
  });

  it('excludes drafts, future publications, and quarantined test artifacts', () => {
    const topic = makeTopic({ storyIds: ['draft', 'future', 'test-artifact'] });
    const draft = makeStory({
      id: 'draft',
      slug: 'draft-story',
      status: 'draft',
      publicationStatus: 'draft',
    });
    const future = makeStory({
      id: 'future',
      slug: 'future-story',
      publishedAt: '2099-01-01T00:00:00.000Z',
    });
    const testArtifact = makeStory({
      id: 'test-artifact',
      slug: 'test-artifact',
      isTestArtifact: true,
    });

    const summary = buildPublicTopicSummaries([topic], [draft, future, testArtifact]).get(topic.slug);

    expect(summary?.storyCount).toBe(0);
    expect(summary?.stories).toEqual([]);
  });

  it('returns an explicit zero summary for a topic without public relationships', () => {
    const topic = makeTopic();
    expect(buildPublicTopicSummaries([topic], []).get(topic.slug)).toEqual({
      storyCount: 0,
      stories: [],
    });
  });
});
