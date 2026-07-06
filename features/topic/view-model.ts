import type { Story, Entity, TopicPageViewModel } from '@/types/canonical';
import type { Services } from '@/services/registry';

export function buildTopicPage(services: Services, slug: string): TopicPageViewModel | null {
  const topic = services.topics.getTopicBySlug(slug);
  if (!topic) return null;
  const stories = topic.storyIds.map(id => services.stories.getStory(id)).filter(Boolean) as Story[];
  const entities = topic.relatedEntityIds.map(id => services.entities.getEntity(id)).filter(Boolean) as Entity[];
  return {
    topic,
    stories,
    entities,
    seo: { title: topic.name, description: topic.description },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: topic.name, href: `/topic/${topic.slug}` },
    ],
  };
}
