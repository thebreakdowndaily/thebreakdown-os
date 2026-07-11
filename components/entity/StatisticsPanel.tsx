import React from 'react';
import { EntitySignals } from '@/types/canonical';

export default function StatisticsPanel({ signals }: { signals?: EntitySignals }) {
  // Mock extended metrics for Bloomberg-style data density
  const metrics = [
    { label: 'Coverage Trend', value: '+14.2%', sparkline: '▃▄▅▇█' },
    { label: 'Mention Velocity', value: '42/hr', sparkline: ' ▂▃▄▅' },
    { label: 'Story Velocity', value: '12/day', sparkline: '▃▅▆▇█' },
    { label: 'Entity Rank', value: '#4', sparkline: '██▇▆▅' },
    { label: 'Evidence Growth', value: '+8%', sparkline: '▂▃▄▆▇' },
    { label: 'Relationship Growth', value: '+3 edges', sparkline: '  ▂▃▄' },
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2">
        Statistics & Trends
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="flex flex-col border border-neutral-800/50 rounded-lg p-3 bg-[#0c0c0c]">
            <span className="text-[10px] uppercase text-neutral-500 tracking-wider mb-1">{metric.label}</span>
            <div className="flex items-end justify-between">
              <span className="text-sm font-mono text-emerald-400">{metric.value}</span>
              <span className="text-xs text-neutral-600 font-mono tracking-tighter overflow-hidden h-4 flex items-end">
                {metric.sparkline}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
