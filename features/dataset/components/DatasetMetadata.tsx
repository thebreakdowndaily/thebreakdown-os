'use client';

import type { Dataset, DatasetVersion } from '@/types/canonical';

export function DatasetMetadata({ dataset, version }: { dataset: Dataset; version: DatasetVersion }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#151515] rounded-lg border border-[#2A2A2A]">
      <div>
        <p className="text-xs text-[#A1A1AA] uppercase tracking-wider">Source</p>
        <p className="text-sm text-[#F5F5F5] mt-1">{dataset.source}</p>
      </div>
      <div>
        <p className="text-xs text-[#A1A1AA] uppercase tracking-wider">Unit</p>
        <p className="text-sm text-[#F5F5F5] mt-1">{dataset.unitLabel}</p>
      </div>
      <div>
        <p className="text-xs text-[#A1A1AA] uppercase tracking-wider">Version</p>
        <p className="text-sm text-[#F5F5F5] mt-1">{version.version}</p>
      </div>
      <div>
        <p className="text-xs text-[#A1A1AA] uppercase tracking-wider">Published</p>
        <p className="text-sm text-[#F5F5F5] mt-1">{new Date(version.publishedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
