import React from 'react';
import type { Dataset } from '@/utils/types';
import ChartBlock from '@/components/story/blocks/ChartBlock';

interface EntityStatisticsProps {
  statistics: Record<string, number | string>;
  datasets: Dataset[];
}

export default function EntityStatistics({ statistics, datasets }: EntityStatisticsProps) {
  const hasStats = Object.keys(statistics).length > 0;
  const hasDatasets = datasets.length > 0;
  if (!hasStats && !hasDatasets) return null;

  return (
    <section aria-label="Statistics" className="py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Statistics</h2>

      {hasStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Object.entries(statistics).map(([key, value]) => (
            <div key={key} className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-5 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#D4A843]">{value}</p>
              <p className="text-sm text-[#A1A1AA] mt-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          ))}
        </div>
      )}

      {hasDatasets && (
        <div className="space-y-6">
          {datasets.map((dataset, i) => (
            <div key={i} className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-5">
              <h3 className="text-base font-semibold text-[#F5F5F5] mb-1">{dataset.label}</h3>
              {dataset.description && (
                <p className="text-sm text-[#A1A1AA] mb-4">{dataset.description}</p>
              )}
              <ChartBlock
                chartId={`entity-chart-${i}`}
                type="line"
                title={dataset.label}
                data={dataset.data as Array<Record<string, unknown>>}
                xKey={Object.keys(dataset.data[0] || {})[0] || 'year'}
                yKey={Object.keys(dataset.data[0] || {})[1] || 'value'}
              />
              {dataset.source && (
                <p className="text-xs text-[#A1A1AA] mt-3">Source: {dataset.source}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
