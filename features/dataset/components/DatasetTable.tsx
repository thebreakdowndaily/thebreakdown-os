'use client';

import type { Observation } from '@/types/canonical';

export function DatasetTable({ observations, columns }: { observations: Observation[]; columns: { key: string; label: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[#2A2A2A]">
            {columns.map(col => (
              <th key={col.key} className="text-left py-3 px-4 text-[#A1A1AA] font-medium uppercase tracking-wider text-xs">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {observations.map((obs, i) => (
            <tr key={obs.period + '-' + String(i)} className="border-b border-[#2A2A2A]/50 hover:bg-[#151515] transition-colors">
              <td className="py-3 px-4 text-[#F5F5F5] font-mono">{obs.period}</td>
              <td className="py-3 px-4 text-[#22C55E] font-mono">{obs.value !== null ? obs.value.toFixed(1) : '—'}</td>
              <td className="py-3 px-4 text-[#A1A1AA] text-xs">{obs.annotation || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
