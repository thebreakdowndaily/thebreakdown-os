import type { Story, Topic, Entity, HomepageViewModel, PageSection } from '@/types/canonical';
import type { Services } from '@/services/registry';

export function buildHomepage(services: Services): HomepageViewModel {
  const stories = services.stories.getStories({ pageSize: 10 }).data;
  const topics = services.topics.getTopics().data;
  const topStory = stories[0];
  const trending = stories.slice(0, 3);
  const latest = stories.slice(3, 6);

  return {
    seo: { title: 'The Breakdown — India Explained', description: 'Independent, data-driven journalism on Indian policy, politics, and society.' },
    sections: [
      { id: 'hero', component: 'Hero', props: { story: topStory } },
      { id: 'featured', component: 'FeaturedStories', props: { stories: trending } },
      { id: 'latest', component: 'LatestInvestigations', props: { stories: latest } },
      { id: 'topics', component: 'TopicExplorer', props: { topics } },
    ],
  };
}
