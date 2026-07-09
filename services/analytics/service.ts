import type { AnalyticsEvent, DashboardStats } from '@/types/canonical';
import type { AnalyticsPlugin } from './plugins/types';
import { MemoryAnalyticsPlugin } from './plugins/memory';

export interface AnalyticsService {
  track(event: AnalyticsEvent): void;
  getDashboardStats(): DashboardStats;
  getStoryViews(storyId: string): number;
  getTopStories(limit?: number): Array<{ id: string; title: string; views: number }>;
  getTopTopics(limit?: number): Array<{ id: string; name: string; count: number }>;
  getSearchQueries(limit?: number): Array<{ query: string; count: number }>;
}

export class PluginAnalyticsService implements AnalyticsService {
  private plugins: AnalyticsPlugin[] = [];
  private memoryPlugin: MemoryAnalyticsPlugin;

  constructor() {
    this.memoryPlugin = new MemoryAnalyticsPlugin();
    this.registerPlugin(this.memoryPlugin);
  }

  registerPlugin(plugin: AnalyticsPlugin) {
    this.plugins.push(plugin);
  }

  track(event: AnalyticsEvent): void {
    this.plugins.forEach(p => {
      try {
        p.track(event);
      } catch (e) {
        console.error(`Analytics plugin ${p.name} failed:`, e);
      }
    });
  }

  getDashboardStats(): DashboardStats { return this.memoryPlugin.getDashboardStats(); }
  getStoryViews(storyId: string): number { return this.memoryPlugin.getStoryViews(storyId); }
  getTopStories(limit?: number) { return this.memoryPlugin.getTopStories(limit); }
  getTopTopics(limit?: number) { return this.memoryPlugin.getTopTopics(limit); }
  getSearchQueries(limit?: number) { return this.memoryPlugin.getSearchQueries(limit); }
}
