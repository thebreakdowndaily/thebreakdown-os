/**
 * ─── Bounded Projection Transformer: Topic ──────────────────────────────────
 * Converts canonical backend Topic objects into clean TopicViewModel projections.
 */

import type { Topic, Story, Entity } from '@/types/canonical';
import type { TopicViewModel, TopicFeaturedStoryViewModel, TopicProjectedEntityViewModel } from './TopicViewModel';

export function transformFeaturedStoryToView(story: Story): TopicFeaturedStoryViewModel {
  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    headline: story.headline || story.title,
    summary: story.summary,
    heroImage: story.heroImage || '/assets/images/placeholder.jpg',
    category: story.category || 'Topic Analysis',
    readingTimeMinutes: story.readingTime || 5,
    publishedAt: story.publishedAt,
  };
}

export function transformProjectedEntityToView(entity: Entity): TopicProjectedEntityViewModel {
  return {
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    type: entity.type || 'organization',
    description: entity.description,
    storyCount: entity.storyCount || (entity.relatedStoryIds ? entity.relatedStoryIds.length : 0),
  };
}

export function transformTopicToViewModel(
  topic: Topic,
  storiesMap: Map<string, Story> = new Map(),
  entitiesMap: Map<string, Entity> = new Map()
): TopicViewModel {
  const featuredStories: TopicFeaturedStoryViewModel[] = (topic.featuredStoryIds || [])
    .map((id) => storiesMap.get(id))
    .filter((s): s is Story => s !== undefined)
    .map(transformFeaturedStoryToView);

  const projectedEntities: TopicProjectedEntityViewModel[] = (topic.relatedEntityIds || [])
    .map((id) => entitiesMap.get(id))
    .filter((e): e is Entity => e !== undefined)
    .map(transformProjectedEntityToView);

  const timelineNodes = (topic.timeline || []).map((t) => ({
    date: t.date,
    title: t.title,
    description: t.description,
  }));

  return {
    id: topic.id,
    slug: topic.slug,
    name: topic.name,
    description: topic.description,
    overview: topic.overview,
    image: topic.image || '/assets/images/topic-placeholder.jpg',
    totalStoriesCount: topic.storyIds ? topic.storyIds.length : featuredStories.length,
    featuredStories,
    projectedEntities,
    timelineNodes,
    seo: {
      title: `${topic.name} — Essential Context & Reporting | The Breakdown`,
      description: topic.description,
      canonicalUrl: `https://thebreakdown.in/topics/${topic.slug}`,
    },
  };
}
