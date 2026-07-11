import React from 'react';

export default function CoverageHeatmap() {
  // Mock data for terminal-style heatmap
  const data = [
    { year: 2023, bars: '███', count: 3 },
    { year: 2024, bars: '███████', count: 7 },
    { year: 2025, bars: '██████████', count: 10 },
    { year: 2026, bars: '████████', count: 8 },
  ];

  return (
    <div className="font-mono text-xs text-neutral-400 p-3 bg-neutral-900 rounded-lg border border-neutral-800">
      <h4 className="uppercase tracking-widest text-neutral-500 mb-2">Coverage Heatmap</h4>
      <div className="flex flex-col gap-1">
        {data.map((row) => (
          <div key={row.year} className="flex items-center gap-2">
            <span className="text-neutral-500 w-8">{row.year}</span>
            <span className="text-amber-500/80">{row.bars}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
