'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Dataset, DatasetVersion, Observation } from '@/types/canonical';
import { getLatestVersion, getAllObservations } from '@/features/dataset/view-model';

export interface DatasetState {
  dataset: Dataset | null;
  loading: boolean;
  error: string | null;
  version: DatasetVersion | undefined;
  observations: Observation[];
  selectedMetricId: string;
  selectedVizId: string;
}

export function useDataset(slug: string) {
  const [state, setState] = useState<DatasetState>({
    dataset: null,
    loading: true,
    error: null,
    version: undefined,
    observations: [],
    selectedMetricId: '',
    selectedVizId: '',
  });

  useEffect(() => {
    if (!slug) return;
    setState(prev => ({ ...prev, loading: true }));
    fetch(`/api/v1/datasets/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error(`Dataset not found: ${slug}`);
        return res.json();
      })
      .then((body: { data: Dataset }) => {
        const dataset = body.data;
        const version = getLatestVersion(dataset);
        const metricId = dataset.metrics[0]?.id || '';
        const vizId = dataset.visualizations[0]?.id || '';
        const observations = version ? getAllObservations(version, metricId) : [];
        setState({
          dataset, loading: false, error: null, version,
          observations, selectedMetricId: metricId, selectedVizId: vizId,
        });
      })
      .catch(err => setState(prev => ({ ...prev, loading: false, error: err.message, dataset: prev.dataset })));
  }, [slug]);

  const selectMetric = useCallback((metricId: string) => {
    setState(prev => {
      if (!prev.version) return prev;
      return { ...prev, selectedMetricId: metricId, observations: getAllObservations(prev.version, metricId) };
    });
  }, []);

  const selectViz = useCallback((vizId: string) => {
    setState(prev => ({ ...prev, selectedVizId: vizId }));
  }, []);

  return { ...state, selectMetric, selectViz };
}
