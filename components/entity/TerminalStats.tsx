import React from 'react';
import { EntityTerminalViewModel } from '@/types/canonical';

export default function TerminalStats({ viewModel }: { viewModel: EntityTerminalViewModel }) {
  const { statistics } = viewModel;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2">
        Statistics & Trends
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {statistics && statistics.length > 0 ? (
          statistics.map((metric, i) => (
            <div key={i} className="flex flex-col border border-neutral-800/50 rounded-lg p-3 bg-[#0c0c0c]">
              <span className="text-[10px] uppercase text-neutral-500 tracking-wider mb-1">{metric.label}</span>
              <div className="flex items-end justify-between">
                <span className="text-sm font-mono text-white">
                  {metric.value} <span className="text-emerald-400 ml-1">{metric.trend || ''}</span>
                </span>
                <span className="text-xs text-neutral-600 font-mono tracking-tighter overflow-hidden h-4 flex items-end">
                  {/* Mock sparkline for visual density until data supports it */}
                  {'▃▄▅▇█'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 flex items-center justify-center p-4">
            <span className="text-xs font-mono text-neutral-500 uppercase">No Statistics Available</span>
          </div>
        )}
      </div>
    </div>
  );
}
