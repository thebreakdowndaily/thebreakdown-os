'use client';

import type { Dataset } from '@/types/canonical';

export function DatasetSources({ dataset }: { dataset: Dataset }) {
  return (
    <div className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-4">
      <h2 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Source & Methodology</h2>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Source</p>
          <a href={dataset.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#D4A843] hover:underline">
            {dataset.source}
          </a>
        </div>
        <div>
          <p className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Methodology</p>
          <p className="text-sm text-[#F5F5F5]">{dataset.methodology}</p>
        </div>
        <div>
          <p className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Tags</p>
          <div className="flex gap-2 flex-wrap">
            {dataset.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs rounded bg-[#2A2A2A] text-[#A1A1AA]">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
