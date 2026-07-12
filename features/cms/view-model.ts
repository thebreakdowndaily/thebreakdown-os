import type { Story, DashboardStats, ActivityEntry } from '@/types/canonical';
import type { Services } from '@/services/registry';

export async function buildCMSDashboard(services: Services): Promise<DashboardStats> {
  const stories = (await services.stories.getStories({ pageSize: 100 })).data;
  const topics = (await services.topics.getTopics()).data;
  const entities = (await services.entities.getEntities()).data;
  const timelines = (await services.timelines.getTimelines()).data;
  const fixes = (await services.fixes.getFixes()).data;
  const media = (await services.media.getMedia()).data;
  const datasets = (await services.datasets.getDatasets()).data;

  const drafts = stories.filter(s => s.status === 'draft').length;
  const review = stories.filter(s => s.status === 'review' || s.status === 'fact_check').length;
  const scheduled = stories.filter(s => s.status === 'scheduled').length;
  const published = stories.filter(s => s.status === 'published' || s.status === 'updated').length;

  const storyMap = new Map(stories.map(s => [s.id, s]));

  const recentActivity: ActivityEntry[] = stories
    .filter(s => s.updatedBy || s.updatedAt)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20)
    .map(s => ({
      id: `story:${s.id}`,
      type: `story:${s.status === 'published' ? 'published' : 'updated'}`,
      label: `${s.status === 'published' ? 'Published' : 'Updated'} "${s.title}"`,
      timestamp: s.updatedAt,
      userId: s.updatedBy,
      link: `/cms/story/${s.id}`,
    }));

  return {
    totalStories: stories.length,
    totalTopics: topics.length,
    totalEntities: entities.length,
    totalTimelines: timelines.length,
    totalFixes: fixes.length,
    totalMedia: media.length,
    totalDatasets: datasets.length,
    drafts,
    review,
    scheduled,
    published,
    recentActivity,
    topStories: services.analytics.getTopStories(5),
    topTopics: services.analytics.getTopTopics(5),
    searchQueries: services.analytics.getSearchQueries(5),
  };
}
