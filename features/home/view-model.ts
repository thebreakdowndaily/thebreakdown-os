import type { Story, HomepageViewModel, PageSection } from '@/types/canonical';
import type { Services } from '@/services/registry';
import type { APIStory, APIFix, APITopic } from '@/utils/data-layer/types';
import { storyToAPIStory, fixToAPIFix, topicToAPITopic } from '@/lib/mappers/to-api-types';

export interface HomepageData {
  seo: { title: string; description: string; canonical: string; ogType: string };
  topStory: APIStory | null;
  stories: APIStory[];
  investigations: APIStory[];
  fixes: APIFix[];
  topics: APITopic[];
  sections: PageSection[];
  allStories: Story[];
}

export function buildHomepage(services: Services): HomepageData {
  const allStories = [...services.stories.getStories({ pageSize: 20 }).data]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const topStoryCanonical = allStories[0];
  const topStory = topStoryCanonical ? storyToAPIStory(topStoryCanonical) : null;
  const stories = allStories.map(storyToAPIStory);
  const investigations = [...allStories]
    .filter(s => s.evidenceScore >= 90 && s.slug !== topStoryCanonical?.slug)
    .sort((a, b) => b.evidenceScore - a.evidenceScore || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 4)
    .map(storyToAPIStory);
  const fixes = services.fixes.getFixes().data.map(fixToAPIFix);
  const topics = services.topics.getTopics().data.map(topicToAPITopic);

  const trending = stories.slice(0, 3);
  const latest = stories.slice(3, 6);

  return {
    seo: { title: 'The Breakdown — India Explained', description: 'Independent, data-driven journalism on Indian policy, politics, and society.', canonical: 'https://thebreakdown.in', ogType: 'website' },
    topStory,
    stories,
    investigations,
    fixes,
    topics,
    allStories,
    sections: [
      { id: 'hero', component: 'Hero', props: { story: topStoryCanonical } },
      { id: 'featured', component: 'FeaturedStories', props: { stories: trending } },
      { id: 'latest', component: 'LatestInvestigations', props: { stories: latest } },
      { id: 'topics', component: 'TopicExplorer', props: { topics } },
    ],
  };
}
