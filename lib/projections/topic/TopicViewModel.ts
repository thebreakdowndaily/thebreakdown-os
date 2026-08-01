/**
 * ─── Bounded Projection Context: Topic ──────────────────────────────────────
 * Frontend View Model Contract for Topic Landing Hubs.
 * Consumed strictly by app/(public)/topics/[slug] components.
 */

export interface TopicFeaturedStoryViewModel {
  id: string;
  slug: string;
  title: string;
  headline: string;
  summary: string;
  heroImage: string;
  category: string;
  readingTimeMinutes: number;
  publishedAt: string;
}

export interface TopicProjectedEntityViewModel {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  storyCount: number;
}

export interface TopicTimelineNodeViewModel {
  date: string;
  title: string;
  description: string;
}

export interface TopicSEOViewModel {
  title: string;
  description: string;
  canonicalUrl: string;
}

export interface TopicViewModel {
  id: string;
  slug: string;
  name: string;
  description: string;
  overview?: string;
  image?: string;
  totalStoriesCount: number;
  featuredStories: TopicFeaturedStoryViewModel[];
  projectedEntities: TopicProjectedEntityViewModel[];
  timelineNodes: TopicTimelineNodeViewModel[];
  seo: TopicSEOViewModel;
}
