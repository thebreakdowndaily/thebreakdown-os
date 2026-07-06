'use client';

import type { Dataset, Observation } from '@/types/canonical';

export function DatasetDownload({ dataset, observations, metricLabel }: { dataset: Dataset; observations: Observation[]; metricLabel: string }) {
  const csvContent = [
    '"Period","' + metricLabel + '","Annotation"',
    ...observations.map(o => '"' + o.period + '",' + (o.value !== null ? String(o.value) : 'NA') + ',"' + (o.annotation || '') + '"'),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  return (
    <div className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-4">
      <h2 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Download</h2>
      <div className="flex gap-3 flex-wrap">
        <a
          href={url}
          download={`${dataset.slug}-data.csv`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#D4A843] text-[#0A0A0A] hover:bg-[#D4A843]/90 transition-colors"
        >
          Download CSV
        </a>
        <a
          href={dataset.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#151515] text-[#A1A1AA] border border-[#2A2A2A] hover:border-[#D4A843] transition-colors"
        >
          Source: {dataset.source}
        </a>
      </div>
    </div>
  );
}
