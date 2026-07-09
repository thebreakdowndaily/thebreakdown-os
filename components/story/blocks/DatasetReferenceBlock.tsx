'use client';

import { useMemo, useState } from 'react';
import type { Dataset } from '@/types/canonical';

export interface DatasetReferenceData {
  datasetSlug: string;
  datasetTitle?: string;
  metricId?: string;
  showChart?: boolean;
  showTable?: boolean;
  showLatest?: boolean;
}

export function DatasetReferenceBlock(props: DatasetReferenceData) {
  const { datasetSlug, datasetTitle, metricId, showLatest } = props;
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(!datasetTitle);

  useMemo(() => {
    if (datasetTitle) return;
    fetch(`/api/v1/datasets/${datasetSlug}`)
      .then(r => r.json())
      .then((body: any) => {
        setDataset(body.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [datasetSlug, datasetTitle]);

  const metric = useMemo(() => {
    const ds = datasetTitle ? null : dataset;
    if (!ds) return null;
    const mId = metricId || ds.metrics.find(m => m.isPrimary)?.id || ds.metrics[0]?.id;
    return mId ? { id: mId, metric: ds.metrics.find(m => m.id === mId) } : null;
  }, [dataset, metricId, datasetTitle]);

  const latestValue = useMemo(() => {
    if (!dataset || !metric) return null;
    const version = dataset.versions.toSorted(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )[0];
    if (!version) return null;
    const series = version.series.filter(s => s.metricId === metric.id).flatMap(s => s.observations);
    return series.length > 0 ? series[series.length - 1] : null;
  }, [dataset, metric]);

  if (loading) {
    return (
      <div className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-4 animate-pulse">
        <div className="h-4 bg-[#2A2A2A] rounded w-1/3 mb-3" />
        <div className="h-3 bg-[#2A2A2A] rounded w-2/3" />
      </div>
    );
  }

  if (datasetTitle && showLatest) {
    return (
      <div className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-4">
        <a href={`/dataset/${datasetSlug}`} className="text-sm font-medium text-[#D4A843] hover:underline">
          {datasetTitle}
        </a>
        <p className="text-xs text-[#A1A1AA] mt-1">Dataset reference — always updated from source</p>
      </div>
    );
  }

  return (
    <div className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-4">
      <div className="flex items-center justify-between mb-2">
        <a href={`/dataset/${datasetSlug}`} className="text-sm font-medium text-[#D4A843] hover:underline">
          {dataset?.title || datasetTitle || datasetSlug}
        </a>
        <span className="text-xs text-[#A1A1AA] bg-[#2A2A2A] px-2 py-0.5 rounded">
          {dataset?.frequency || 'data'}
        </span>
      </div>
      {metric?.metric && latestValue && (
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl font-bold text-[#F5F5F5]">
            {latestValue.value}{metric.metric.unit}
          </span>
          <span className="text-xs text-[#A1A1AA]">{metric.metric.label}</span>
        </div>
      )}
      <p className="text-xs text-[#A1A1AA] mt-2">
        Source: {dataset?.source || 'Verified'}
        <span className="mx-1">·</span>
        <a href={`/dataset/${datasetSlug}`} className="text-[#D4A843] hover:underline">View full dataset</a>
      </p>
    </div>
  );
}
