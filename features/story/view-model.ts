import type { Story, Topic, Entity, StoryPageViewModel } from '@/types/canonical';
import type { Services } from '@/services/registry';

export function buildStoryPage(services: Services, slug: string): StoryPageViewModel | null {
  const story = services.stories.getStoryBySlug(slug);
  if (!story) return null;
  const relatedStories = story.relatedStoryIds.map(id => services.stories.getStory(id)).filter(Boolean) as Story[];
  const relatedTopics = story.relatedTopicIds.map(id => services.topics.getTopic(id)).filter(Boolean) as Topic[];
  const relatedEntities = story.relatedEntityIds.map(id => services.entities.getEntity(id)).filter(Boolean) as Entity[];
  return {
    story,
    relatedStories,
    relatedTopics,
    relatedEntities,
    seo: { title: story.headline, description: story.summary },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: story.title, href: `/story/${story.slug}` },
    ],
  };
}
