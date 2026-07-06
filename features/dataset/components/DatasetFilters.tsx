'use client';

import type { Metric } from '@/types/canonical';

export function DatasetFilters({
  metrics, selectedMetricId, onMetricChange,
}: {
  metrics: Metric[];
  selectedMetricId: string;
  onMetricChange: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Metrics</h2>
      <div className="flex gap-2 flex-wrap">
        {metrics.map(metric => (
          <button
            key={metric.id}
            onClick={function() { onMetricChange(metric.id); }}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              selectedMetricId === metric.id
                ? 'bg-[#D4A843] text-[#0A0A0A] border-[#D4A843]'
                : 'bg-[#151515] text-[#A1A1AA] border-[#2A2A2A] hover:border-[#D4A843]'
            }`}
          >
            {metric.label}
            {metric.isPrimary && <span className="ml-2 text-xs opacity-60">●</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
