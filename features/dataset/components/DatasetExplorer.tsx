'use client';

import { useState, useMemo } from 'react';
import type { Dataset, DatasetVersion, Observation } from '@/types/canonical';
import { DatasetHero } from './DatasetHero';
import { DatasetMetadata } from './DatasetMetadata';
import { DatasetChart } from './DatasetChart';
import { DatasetTable } from './DatasetTable';
import { DatasetFilters } from './DatasetFilters';
import { DatasetDownload } from './DatasetDownload';
import { DatasetSources } from './DatasetSources';
import { getLatestVersion } from '../view-model';

export function DatasetExplorer({ dataset }: { dataset: Dataset }) {
  const [selectedMetricId, setSelectedMetricId] = useState(dataset.metrics[0]?.id || '');
  const [selectedVizId, setSelectedVizId] = useState(dataset.visualizations[0]?.id || '');

  const version: DatasetVersion | undefined = useMemo(() => getLatestVersion(dataset), [dataset]);
  const selectedMetric = useMemo(() => dataset.metrics.find(m => m.id === selectedMetricId), [dataset, selectedMetricId]);
  const selectedViz = useMemo(() => dataset.visualizations.find(v => v.id === selectedVizId), [dataset, selectedVizId]);

  const observations: Observation[] = useMemo(() => {
    if (!version || !selectedMetricId) return [];
    return version.series.filter(s => s.metricId === selectedMetricId).flatMap(s => s.observations);
  }, [version, selectedMetricId]);

  if (!version) return null;

  const showChart = !!(selectedViz && selectedMetric && observations.length > 0);

  return (
    <div className="space-y-8">
      <DatasetHero dataset={dataset} />
      <DatasetMetadata dataset={dataset} version={version} />

      <div>
        <h2 className="text-lg font-semibold text-[#F5F5F5] mb-3">Methodology</h2>
        <p className="text-sm text-[#A1A1AA]">{dataset.methodology}</p>
      </div>

      <DatasetFilters
        metrics={dataset.metrics}
        selectedMetricId={selectedMetricId}
        onMetricChange={setSelectedMetricId}
      />

      {selectedMetric && (
        <div>
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-1">{selectedMetric.label}</h2>
          <p className="text-sm text-[#A1A1AA] mb-4">{selectedMetric.description}</p>

          {dataset.visualizations.length > 0 && (
            <div className="mb-4 flex gap-2 flex-wrap">
              {dataset.visualizations.map(viz => (
                <button
                  key={viz.id}
                  onClick={function() { setSelectedVizId(viz.id); }}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    selectedVizId === viz.id
                      ? 'bg-[#D4A843] text-[#0A0A0A] border-[#D4A843]'
                      : 'bg-[#151515] text-[#A1A1AA] border-[#2A2A2A] hover:border-[#D4A843]'
                  }`}
                >
                  {viz.title}
                </button>
              ))}
            </div>
          )}

          {showChart && (
            <div className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-4">
              <DatasetChart visualization={selectedViz} observations={observations} metrics={[selectedMetric]} />
            </div>
          )}

          <div className="mt-6 bg-[#151515] rounded-lg border border-[#2A2A2A] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2A2A2A]">
              <h3 className="text-sm font-medium text-[#F5F5F5]">Data Table</h3>
            </div>
            <DatasetTable
              observations={observations}
              columns={[
                { key: 'period', label: 'Period' },
                { key: 'value', label: selectedMetric.label },
                { key: 'annotation', label: 'Notes' },
              ]}
            />
          </div>
        </div>
      )}

      <DatasetDownload dataset={dataset} observations={observations} metricLabel={selectedMetric?.label || ''} />
      <DatasetSources dataset={dataset} />
    </div>
  );
}
