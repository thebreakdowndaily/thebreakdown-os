import type { AnalyticsEvent, DashboardStats } from '@/types/canonical';
import { AnalyticsPlugin } from './types';

export class MemoryAnalyticsPlugin implements AnalyticsPlugin {
  name = 'memory';
  
  private events: AnalyticsEvent[] = [];
  private views = new Map<string, number>();
  private topicCounts = new Map<string, { name: string; count: number }>();
  private searchQueries = new Map<string, number>();

  track(event: AnalyticsEvent): void {
    this.events.push(event);
    if (event.storyId && event.type === 'story:view') {
      this.views.set(event.storyId, (this.views.get(event.storyId) || 0) + 1);
    }
    if (event.topicId && event.type === 'topic:view') {
      const current = this.topicCounts.get(event.topicId) || { name: '', count: 0 };
      current.count += 1;
      this.topicCounts.set(event.topicId, current);
    }
    if (event.type === 'search') {
      const q = (event.metadata?.query as string) || '';
      if (q) {
        this.searchQueries.set(q, (this.searchQueries.get(q) || 0) + 1);
      }
    }
  }

  getDashboardStats(): DashboardStats {
    return {
      totalStories: 0,
      totalTopics: 0,
      totalEntities: 0,
      totalTimelines: 0,
      totalFixes: 0,
      totalMedia: 0,
      totalDatasets: 0,
      drafts: 0,
      review: 0,
      scheduled: 0,
      published: 0,
      recentActivity: this.events.slice(-20).reverse().map(e => ({
        id: e.timestamp,
        type: e.type,
        label: e.type,
        timestamp: e.timestamp,
        userId: e.userId,
        link: e.storyId ? `/cms/story/${e.storyId}` : undefined,
      })),
      topStories: this.getTopStories(5),
      topTopics: this.getTopTopics(5),
      searchQueries: this.getSearchQueries(5),
    };
  }

  getStoryViews(storyId: string): number {
    return this.views.get(storyId) || 0;
  }

  getTopStories(limit = 5): Array<{ id: string; title: string; views: number }> {
    return Array.from(this.views.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, views]) => ({ id, title: id, views }));
  }

  getTopTopics(limit = 5): Array<{ id: string; name: string; count: number }> {
    return Array.from(this.topicCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([id, val]) => ({ id, name: val.name || id, count: val.count }));
  }

  getSearchQueries(limit = 5): Array<{ query: string; count: number }> {
    return Array.from(this.searchQueries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }
}
