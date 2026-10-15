import type { Story, Topic } from '@/types/canonical';
import { canPubliclyViewStory, storyPublicationContext } from '@/lib/story/publication';

export interface PublicTopicStoryPreview {
  slug: string;
  headline: string;
}

export interface PublicTopicSummary {
  storyCount: number;
  stories: PublicTopicStoryPreview[];
}

/**
 * Build topic counts from public stories and explicit topic relationships.
 *
 * Topic-side storyIds/featuredStoryIds and story-side relatedTopicIds are
 * both supported because historical records may not have fully synchronized
 * both sides of the relationship. Category names and tags are deliberately
 * not used to infer relationships.
 */
export function buildPublicTopicSummaries(
  topics: Topic[],
  stories: Story[],
): Map<string, PublicTopicSummary> {
  const publicStories = stories.filter((story) =>
    canPubliclyViewStory(storyPublicationContext(story)),
  );

  const summaries = new Map<string, PublicTopicSummary>();

  for (const topic of topics) {
    const topicStoryRefs = new Set([
      ...(topic.storyIds ?? []),
      ...(topic.featuredStoryIds ?? []),
    ]);
    const topicIdentity = new Set([topic.id, topic.slug]);

    const relatedById = new Map<string, Story>();
    for (const story of publicStories) {
      const matchesTopicSide =
        topicStoryRefs.has(story.id) || topicStoryRefs.has(story.slug);
      const matchesStorySide = (story.relatedTopicIds ?? []).some((reference) =>
        topicIdentity.has(reference),
      );

      if (matchesTopicSide || matchesStorySide) {
        // Use a stable story identity so overlapping forward/reverse links
        // never inflate the count.
        relatedById.set(story.id, story);
      }
    }

    const orderedStories = [...relatedById.values()].sort((left, right) => {
      const leftTime = Date.parse(left.publishedAt);
      const rightTime = Date.parse(right.publishedAt);
      return (Number.isFinite(rightTime) ? rightTime : 0) -
        (Number.isFinite(leftTime) ? leftTime : 0);
    });

    summaries.set(topic.slug, {
      storyCount: orderedStories.length,
      stories: orderedStories.slice(0, 2).map(({ slug, headline }) => ({
        slug,
        headline,
      })),
    });
  }

  return summaries;
}
