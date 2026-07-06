import type { Dataset, DatasetVersion } from '@/types/canonical';
import { getLatestVersion, getAllObservations, getLatestValue, getTrend, getSummary } from '@/features/dataset/view-model';

export interface DatasetAnalysis {
  summary: string;
  trend: 'up' | 'down' | 'stable' | 'insufficient';
  latestValue: number | null;
  primaryMetric: string;
  dataPoints: number;
  dateRange: string;
  volatility: 'low' | 'medium' | 'high';
  anomalies: string[];
  insights: string[];
}

export class DatasetAI {
  analyzeDataset(dataset: Dataset): DatasetAnalysis {
    const version = getLatestVersion(dataset);
    const primaryMetric = dataset.metrics.find(m => m.isPrimary) || dataset.metrics[0];
    const latestValue = version && primaryMetric ? getLatestValue(version, primaryMetric.id) : null;
    const trend = version && primaryMetric ? getTrend(version, primaryMetric.id) : 'insufficient';
    const observations = version && primaryMetric ? getAllObservations(version, primaryMetric.id) : [];
    const dataPoints = observations.length;
    const dateRange = this.getDateRange(observations);
    const volatility = this.calculateVolatility(observations);
    const anomalies = this.detectAnomalies(observations);
    const summary = getSummary(dataset);
    const insights = this.generateInsights(dataset, observations, trend, volatility);

    return {
      summary,
      trend,
      latestValue,
      primaryMetric: primaryMetric?.label || '',
      dataPoints,
      dateRange,
      volatility,
      anomalies,
      insights,
    };
  }

  getNarrative(dataset: Dataset): string {
    const analysis = this.analyzeDataset(dataset);
    const parts: string[] = [
      `**${dataset.title}** — ${dataset.description}`,
      `**Source:** ${dataset.source}`,
      `**Frequency:** ${dataset.frequency}`,
    ];
    if (analysis.latestValue !== null) {
      const primaryMetric = dataset.metrics.find(m => m.isPrimary) || dataset.metrics[0];
      parts.push(`**Latest Value:** ${analysis.latestValue}${primaryMetric?.unit || ''} (${analysis.dateRange})`);
    }
    parts.push(`**Trend:** ${analysis.trend}`);
    parts.push(`**Volatility:** ${analysis.volatility}`);
    parts.push(`**Data Points:** ${analysis.dataPoints}`);

    if (analysis.insights.length > 0) {
      parts.push('**Insights:**');
      analysis.insights.forEach(i => parts.push(`- ${i}`));
    }
    if (analysis.anomalies.length > 0) {
      parts.push('**Anomalies Detected:**');
      analysis.anomalies.forEach(a => parts.push(`- ${a}`));
    }
    return parts.join('\n\n');
  }

  compareDatasets(datasets: Dataset[]): string {
    if (datasets.length < 2) return 'Need at least two datasets to compare.';
    const analyses = datasets.map(d => this.analyzeDataset(d));
    const parts: string[] = ['## Dataset Comparison\n'];
    datasets.forEach((d, i) => {
      const a = analyses[i];
      parts.push(`### ${d.title}`);
      parts.push(`- Latest: ${a.latestValue !== null ? a.latestValue : 'N/A'} ${d.metrics[0]?.unit || ''}`);
      parts.push(`- Trend: ${a.trend}`);
      parts.push(`- Volatility: ${a.volatility}`);
      parts.push(`- Data Points: ${a.dataPoints}`);
      parts.push('');
    });
    return parts.join('\n');
  }

  private getDateRange(observations: { period: string }[]): string {
    if (observations.length === 0) return 'N/A';
    const periods = observations.map(o => o.period).sort();
    return `${periods[0]} → ${periods[periods.length - 1]}`;
  }

  private calculateVolatility(observations: { value: number | null }[]): 'low' | 'medium' | 'high' {
    const values = observations.filter(o => o.value !== null).map(o => o.value as number);
    if (values.length < 3) return 'low';
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / Math.abs(mean || 1);
    if (cv < 0.1) return 'low';
    if (cv < 0.3) return 'medium';
    return 'high';
  }

  private detectAnomalies(observations: { period: string; value: number | null; annotation?: string }[]): string[] {
    const values = observations.filter(o => o.value !== null).map(o => ({ period: o.period, value: o.value as number }));
    if (values.length < 4) return [];
    const mean = values.reduce((s, v) => s + v.value, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((s, v) => s + (v.value - mean) ** 2, 0) / values.length);
    const threshold = 2 * stdDev;
    const anomalies: string[] = [];
    for (const point of values) {
      if (Math.abs(point.value - mean) > threshold) {
        const direction = point.value > mean ? 'spike' : 'drop';
        anomalies.push(`${direction} in ${point.period}: ${point.value.toFixed(2)} (avg: ${mean.toFixed(2)})`);
      }
    }
    return anomalies;
  }

  private generateInsights(dataset: Dataset, observations: { value: number | null }[], trend: string, volatility: string): string[] {
    const insights: string[] = [];
    if (trend === 'up') insights.push(`${dataset.title} shows an upward trend, indicating positive growth.`);
    if (trend === 'down') insights.push(`${dataset.title} is declining. Consider investigating contributing factors.`);
    if (volatility === 'high') insights.push(`High volatility in ${dataset.title} suggests unstable conditions.`);
    const nonNullValues = observations.filter(o => o.value !== null).map(o => o.value as number);
    if (nonNullValues.length > 0) {
      const max = Math.max(...nonNullValues);
      const min = Math.min(...nonNullValues);
      insights.push(`Range: ${min} to ${max} (spread: ${(max - min).toFixed(2)})`);
    }
    if (dataset.category) insights.push(`This dataset is categorized under "${dataset.category}".`);
    return insights;
  }
}
