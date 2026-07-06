import type { Story, Topic, Entity, Dataset, DatasetPageViewModel, DatasetVersion } from '@/types/canonical';
import type { Services } from '@/services/registry';

export function buildDatasetPage(services: Services, slug: string): DatasetPageViewModel | null {
  const dataset = services.datasets.getDatasetBySlug(slug);
  if (!dataset) return null;
  const relatedStories = dataset.relatedStoryIds.map(id => services.stories.getStory(id)).filter(Boolean) as Story[];
  const relatedTopics = dataset.relatedTopicIds.map(id => services.topics.getTopic(id)).filter(Boolean) as Topic[];
  const relatedEntities = dataset.relatedEntityIds.map(id => services.entities.getEntity(id)).filter(Boolean) as Entity[];
  return {
    dataset,
    relatedStories,
    relatedTopics,
    relatedEntities,
    versions: dataset.versions,
    seo: { title: dataset.title, description: dataset.description },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Datasets', href: '/datasets' },
      { label: dataset.title, href: `/dataset/${dataset.slug}` },
    ],
  };
}

export function getLatestVersion(dataset: Dataset): DatasetVersion | undefined {
  return dataset.versions.toSorted((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0];
}

export function getAllObservations(version: DatasetVersion, metricId: string) {
  return version.series.filter(s => s.metricId === metricId).flatMap(s => s.observations);
}

export function getMetricById(dataset: Dataset, metricId: string) {
  return dataset.metrics.find(m => m.id === metricId);
}

export function getVisualizationById(dataset: Dataset, vizId: string) {
  return dataset.visualizations.find(v => v.id === vizId);
}

export function getLatestValue(version: DatasetVersion, metricId: string): number | null {
  const obs = getAllObservations(version, metricId);
  return obs.length > 0 ? obs[obs.length - 1].value : null;
}

export function getTrend(version: DatasetVersion, metricId: string): 'up' | 'down' | 'stable' | 'insufficient' {
  const obs = getAllObservations(version, metricId).filter(o => o.value !== null);
  if (obs.length < 2) return 'insufficient';
  const last = obs[obs.length - 1].value!;
  const prev = obs[obs.length - 2].value!;
  const diff = ((last - prev) / Math.abs(prev)) * 100;
  if (diff > 2) return 'up';
  if (diff < -2) return 'down';
  return 'stable';
}

export function getSummary(dataset: Dataset): string {
  const latestVersion = getLatestVersion(dataset);
  if (!latestVersion) return `${dataset.title} — ${dataset.description}`;
  const primaryMetric = dataset.metrics.find(m => m.isPrimary);
  if (!primaryMetric) return `${dataset.title} — ${dataset.description}`;
  const latestValue = getLatestValue(latestVersion, primaryMetric.id);
  const trend = getTrend(latestVersion, primaryMetric.id);
  const trendWord = trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable';
  return `${dataset.title}: ${primaryMetric.label} at ${latestValue}${primaryMetric.unit} (${trendWord}). Source: ${dataset.source}.`;
}

export function formatDatasetValue(value: number | null, metric?: { unit: string; decimalPlaces: number }): string {
  if (value === null) return '—';
  const decimals = metric?.decimalPlaces ?? 1;
  const formatted = value.toFixed(decimals);
  return metric?.unit ? `${formatted}${metric.unit}` : formatted;
}
