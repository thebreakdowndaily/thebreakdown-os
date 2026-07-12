import type { Dataset } from '@/types/canonical';
import { getServices } from '@/services/registry';

export interface DatasetAnalytics {
  mostViewed: Array<{ slug: string; title: string; views: number }>;
  mostDownloaded: Array<{ slug: string; title: string; downloads: number }>;
  oldestDatasets: Array<{ slug: string; title: string; daysSinceUpdate: number }>;
  categoryBreakdown: Array<{ category: string; count: number }>;
  totalDatasets: number;
  totalObservations: number;
  averageMetrics: number;
}

export class DatasetAnalyticsService {
  private views = new Map<string, number>();
  private downloads = new Map<string, number>();

  trackView(slug: string): void {
    this.views.set(slug, (this.views.get(slug) || 0) + 1);
  }

  trackDownload(slug: string): void {
    this.downloads.set(slug, (this.downloads.get(slug) || 0) + 1);
  }

  async getAnalytics(): Promise<DatasetAnalytics> {
    const services = getServices();
    const datasets = (await services.datasets.getDatasets()).data;
    const now = new Date();

    const categoryCount = new Map<string, number>();
    let totalObs = 0;
    let totalMetrics = 0;

    for (const d of datasets) {
      categoryCount.set(d.category, (categoryCount.get(d.category) || 0) + 1);
      totalMetrics += d.metrics.length;
      for (const v of d.versions) {
        for (const s of v.series) {
          totalObs += s.observations.length;
        }
      }
    }

    const mostViewed = Array.from(this.views.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([slug, views]) => {
        const ds = datasets.find(d => d.slug === slug);
        return { slug, title: ds?.title || slug, views };
      });

    const mostDownloaded = Array.from(this.downloads.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([slug, downloads]) => {
        const ds = datasets.find(d => d.slug === slug);
        return { slug, title: ds?.title || slug, downloads };
      });

    const oldestDatasets = datasets
      .map(d => ({ ...d, daysSinceUpdate: Math.floor((now.getTime() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24)) }))
      .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate)
      .slice(0, 10)
      .map(d => ({ slug: d.slug, title: d.title, daysSinceUpdate: d.daysSinceUpdate }));

    const categoryBreakdown = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));

    return {
      mostViewed,
      mostDownloaded,
      oldestDatasets,
      categoryBreakdown,
      totalDatasets: datasets.length,
      totalObservations: totalObs,
      averageMetrics: datasets.length > 0 ? Math.round(totalMetrics / datasets.length) : 0,
    };
  }

  getViews(slug: string): number {
    return this.views.get(slug) || 0;
  }

  getDownloads(slug: string): number {
    return this.downloads.get(slug) || 0;
  }

  reset(): void {
    this.views.clear();
    this.downloads.clear();
  }
}
