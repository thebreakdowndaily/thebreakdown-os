import type { Topic, Story } from '@/types/canonical';
import type { KnowledgeTopic, TopicAggregator } from './builder';
import { getServices } from '@/services/registry';
import { canPubliclyViewStory, storyPublicationContext } from '@/lib/story/publication';

function normalizeTopicKey(value: string | undefined | null): string {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export class StoryAggregator implements TopicAggregator {
  async aggregate(topic: Topic, _currentKnowledge: KnowledgeTopic): Promise<KnowledgeTopic> {
    // The canonical topic.storyIds array is not reliably populated in older
    // production records. Use the public story feed as the source of truth,
    // then reconcile forward references, reverse links, and exact categories.
    // getPublicStories already enforces publication eligibility at the
    // repository boundary; the second check remains defense in depth.
    const { data: publicStories } = await getServices().stories.getPublicStories();

    const storedStoryRefs = new Set([
      ...(topic.storyIds ?? []),
      ...(topic.featuredStoryIds ?? []),
    ]);
    const topicRefs = new Set([topic.id, topic.slug]);
    const categoryKeys = new Set(
      [topic.slug, topic.name]
        .map(normalizeTopicKey)
        .filter((key) => key.length > 0),
    );

    const stories = publicStories.filter((story: Story) => {
      if (!canPubliclyViewStory(storyPublicationContext(story))) return false;

      const matchesStoredReference =
        storedStoryRefs.has(story.id) || storedStoryRefs.has(story.slug);
      const matchesReverseReference = (story.relatedTopicIds ?? []).some((id) => topicRefs.has(id));
      const matchesExactCategory = categoryKeys.has(normalizeTopicKey(story.category));

      return matchesStoredReference || matchesReverseReference || matchesExactCategory;
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
      storyGroups: {
        latest: latest.slice(0, 10),
        important: important.slice(0, 5),
        highestEvidence: highestEvidence.slice(0, 5),
        trending,
        historical: historical.slice(0, 5),
        recommended,
      },
    };
  }
}
