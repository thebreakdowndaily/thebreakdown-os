import type { Topic, Story } from '@/types/canonical';
import type { KnowledgeTopic, TopicAggregator } from './builder';
import { getServices } from '@/services/registry';
import { canPubliclyViewStory, storyPublicationContext } from '@/lib/story/publication';

const FALLBACK_PUBLIC_STORY_PAGE_SIZE = 100;

async function loadPublicStoriesForTopic(topic: Topic): Promise<Story[]> {
  const storyService = getServices().stories;

  // Supabase production reads should use a database relationship filter.
  // Other service providers retain a paginated compatibility path.
  if (storyService.getPublicStoriesForTopic) {
    const { data } = await storyService.getPublicStoriesForTopic(topic);
    return data;
  }

  const firstPage = await storyService.getPublicStories({
    page: 1,
    pageSize: FALLBACK_PUBLIC_STORY_PAGE_SIZE,
  });
  const stories = [...firstPage.data];
  const total = firstPage.meta?.total ?? firstPage.data.length;
  const pageCount = Math.ceil(total / FALLBACK_PUBLIC_STORY_PAGE_SIZE);

  for (let page = 2; page <= pageCount; page += 1) {
    const nextPage = await storyService.getPublicStories({
      page,
      pageSize: FALLBACK_PUBLIC_STORY_PAGE_SIZE,
    });
    stories.push(...nextPage.data);
  }

  return stories;
}

export class StoryAggregator implements TopicAggregator {
  async aggregate(topic: Topic, _currentKnowledge: KnowledgeTopic): Promise<KnowledgeTopic> {
    // Topic membership comes only from explicit canonical relationships.
    // Categories and tags describe content but do not establish topic links.
    // Production repositories support a targeted public relationship query;
    // the local check is defense in depth for provider parity.
    const publicStories = await loadPublicStoriesForTopic(topic);

    const storedStoryRefs = new Set([
      ...(topic.storyIds ?? []),
      ...(topic.featuredStoryIds ?? []),
    ]);
    const topicRefs = new Set([topic.id, topic.slug]);

    const stories = publicStories.filter((story: Story) => {
      if (!canPubliclyViewStory(storyPublicationContext(story))) return false;

      const matchesStoredReference =
        storedStoryRefs.has(story.id) || storedStoryRefs.has(story.slug);
      const matchesReverseReference = (story.relatedTopicIds ?? []).some((id) => topicRefs.has(id));

      return matchesStoredReference || matchesReverseReference;
    });

    // De-duplicate by canonical story ID when multiple relationships match.
    const uniqueStories = [...new Map(stories.map((story) => [story.id, story])).values()];

    // Latest: chronologically recent
    const latest = [...uniqueStories].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    // Important: High impact level
    const important = uniqueStories.filter(
      (story: Story) => story.impactLevel === 'critical' || story.impactLevel === 'high',
    );

    // Highest Evidence: score >= 90
    const highestEvidence = uniqueStories
      .filter((story: Story) => story.evidenceScore >= 90)
      .sort((a: Story, b: Story) => b.evidenceScore - a.evidenceScore);

    // Trending: recent + high impact (proxy for trending)
    const trending = latest.slice(0, 5).filter((story) => story.impactLevel !== 'low');

    // Historical: older than 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const historical = uniqueStories.filter(
      (story: Story) => new Date(story.publishedAt) < oneYearAgo,
    );

    // Recommended: Editor's pick or highly scored
    const recommended = highestEvidence.slice(0, 3);

        return {
      topic,
      totalStories: uniqueStories.length,
      allStories: uniqueStories,
      storyGroups: {
        latest: latest.slice(0, 10),
        important: important.slice(0, 5),
        highestEvidence: highestEvidence.slice(0, 5),
        trending,
        historical: historical.slice(0, 5),
        recommended,
        all: uniqueStories,
        totalCount: uniqueStories.length,
      },
    };
  }
}
