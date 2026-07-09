'use client';

import { useState, useMemo } from 'react';
import type { Dataset, DatasetVersion } from '@/types/canonical';
import { getLatestVersion, getMetricById } from '@/features/dataset/view-model';
import { DatasetExplorer } from '@/features/dataset/components/DatasetExplorer';

type ViewTab = 'chart' | 'table' | 'raw';

interface DatasetViewTabsProps {
  dataset: Dataset;
}

export function DatasetViewTabs({ dataset }: DatasetViewTabsProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('chart');
  const [selectedMetricId, setSelectedMetricId] = useState(dataset.metrics[0]?.id || '');

  const version: DatasetVersion | undefined = useMemo(() => getLatestVersion(dataset), [dataset]);
  const selectedMetric = useMemo(() => getMetricById(dataset, selectedMetricId), [dataset, selectedMetricId]);

  const observations = useMemo(() => {
    if (!version || !selectedMetricId) return [];
    return version.series.filter(s => s.metricId === selectedMetricId).flatMap(s => s.observations);
  }, [version, selectedMetricId]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-1">{dataset.title}</h1>
        <p className="text-sm text-[#A1A1AA] mb-2">{dataset.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#A1A1AA]">
          <span className="px-2 py-0.5 rounded border border-[#2A2A2A] bg-[#151515]">{dataset.category}</span>
          <span>{dataset.frequency}</span>
          <span>{dataset.metrics.length} metrics</span>
          <span>Source: {dataset.source}</span>
        </div>
      </div>

      {dataset.metrics.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {dataset.metrics.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelectedMetricId(m.id); }}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                selectedMetricId === m.id
                  ? 'bg-[#D4A843] text-[#0A0A0A] border-[#D4A843]'
                  : 'bg-[#151515] text-[#A1A1AA] border-[#2A2A2A] hover:border-[#D4A843]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 bg-[#151515] rounded-lg border border-[#2A2A2A] p-0.5 mb-6 w-fit">
        {([
          { id: 'chart' as const, label: 'Chart' },
          { id: 'table' as const, label: 'Table' },
          { id: 'raw' as const, label: 'Raw Data' },
        ]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id ? 'bg-[#D4A843] text-[#0A0A0A]' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'chart' && (
        <DatasetExplorer dataset={dataset} />
      )}

      {activeTab === 'table' && (
        <div className="bg-[#151515] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2A2A2A] flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#F5F5F5]">{selectedMetric?.label || 'Data'} — Table View</h3>
            <span className="text-xs text-[#A1A1AA]">{observations.length} observations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="px-4 py-3 text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Period</th>
                  <th className="px-4 py-3 text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">{selectedMetric?.label || 'Value'}</th>
                  <th className="px-4 py-3 text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((obs, i) => (
                  <tr key={i} className="border-b border-[#2A2A2A]/50 last:border-0 hover:bg-[#1A1A1A] transition-colors">
                    <td className="px-4 py-2.5 text-[#A1A1AA]">{obs.period}</td>
                    <td className="px-4 py-2.5 text-[#F5F5F5] font-medium">
                      {obs.value !== null ? obs.value.toFixed(selectedMetric?.decimalPlaces ?? 1) : '—'}
                      {selectedMetric?.unit || ''}
                    </td>
                    <td className="px-4 py-2.5 text-[#A1A1AA] text-xs">{obs.annotation || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'raw' && (
        <div className="space-y-4">
          <div className="bg-[#151515] rounded-xl border border-[#2A2A2A] p-4">
            <h3 className="text-sm font-medium text-[#F5F5F5] mb-3">Dataset Metadata</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { label: 'ID', value: dataset.id },
                { label: 'Slug', value: dataset.slug },
                { label: 'Category', value: dataset.category },
                { label: 'Frequency', value: dataset.frequency },
                { label: 'Source', value: dataset.source },
                { label: 'Methodology', value: dataset.methodology },
                { label: 'Created', value: new Date(dataset.createdAt).toLocaleDateString() },
                { label: 'Updated', value: new Date(dataset.updatedAt).toLocaleDateString() },
                { label: 'Versions', value: String(dataset.versions.length) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[#A1A1AA] mb-0.5">{label}</p>
                  <p className="text-[#F5F5F5] font-medium break-all">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {version && (
            <div className="bg-[#151515] rounded-xl border border-[#2A2A2A] p-4">
              <h3 className="text-sm font-medium text-[#F5F5F5] mb-3">Version History</h3>
              <div className="space-y-3">
                {dataset.versions.toSorted((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).map((v) => (
                  <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#1A1A1A]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center text-xs font-bold text-[#A1A1AA]">
                      v{v.version}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#F5F5F5]">{new Date(v.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">{v.notes}</p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">{v.series.length} series, {v.series.reduce((sum, s) => sum + s.observations.length, 0)} observations</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {version && (
            <div className="bg-[#151515] rounded-xl border border-[#2A2A2A] p-4">
              <h3 className="text-sm font-medium text-[#F5F5F5] mb-3">JSON Export</h3>
              <pre className="text-xs text-[#A1A1AA] overflow-x-auto max-h-96 p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                {JSON.stringify({ dataset, version }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
