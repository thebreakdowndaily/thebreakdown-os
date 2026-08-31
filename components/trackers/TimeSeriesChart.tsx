'use client';

import { useState } from 'react';
import type { TrackerTimeSeries } from '@/lib/trackers/types';
import { captureEvent } from '@/lib/analytics/capture';

interface TimeSeriesChartProps {
  series: TrackerTimeSeries;
  trackerId?: string;
}

export default function TimeSeriesChart({ series, trackerId = 'generic' }: TimeSeriesChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  if (!series || !series.data || series.data.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 text-xs text-neutral-400 font-mono">
        No time-series data available for this series.
      </div>
    );
  }

  const data = series.data;
  const values = data.map((d) => d.value);
  const minVal = Math.min(0, ...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  // Chart dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minVal) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  const handlePointHover = (idx: number | null) => {
    setActiveIdx(idx);
    if (idx !== null) {
      captureEvent('chart_interacted', { chart_id: series.id, tracker_id: trackerId });
    }
  };

  const toggleViewMode = () => {
    const next = viewMode === 'chart' ? 'table' : 'chart';
    setViewMode(next);
    captureEvent('chart_interacted', { chart_id: series.id, tracker_id: trackerId });
  };

  return (
    <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white font-mono">{series.title}</h3>
          </div>
          {series.subtitle && <p className="text-xs text-neutral-400 mt-0.5">{series.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
            {series.unit}
          </span>
          <button
            type="button"
            onClick={toggleViewMode}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline transition-colors px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900"
            aria-label={`Switch to ${viewMode === 'chart' ? 'Table' : 'Chart'} view`}
          >
            {viewMode === 'chart' ? 'View Table' : 'View Chart'}
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div className="relative">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[380px] select-none"
              role="img"
              aria-label={`${series.title}: trend line chart from ${data[0].date} to ${data[data.length - 1].date}`}
            >
              <defs>
                <linearGradient id={`grad-${series.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.5, 1].map((pct, i) => {
                const y = paddingTop + chartHeight * (1 - pct);
                const val = (minVal + range * pct).toFixed(1);
                return (
                  <g key={i} className="text-neutral-600">
                    <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.5" />
                    <text x={paddingX - 6} y={y + 3} textAnchor="end" className="text-[9px] fill-neutral-300 font-mono">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area & Line */}
              <path d={areaD} fill={`url(#grad-${series.id})`} />
              <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Interactive Points */}
              {points.map((p, i) => {
                const isActive = activeIdx === i;
                return (
                  <g key={i} className="cursor-pointer" tabIndex={0} onFocus={() => handlePointHover(i)} onBlur={() => handlePointHover(null)} onMouseEnter={() => handlePointHover(i)} onMouseLeave={() => handlePointHover(null)}>
                    <circle cx={p.x} cy={p.y} r={isActive ? 6 : 3.5} fill="#10b981" stroke="#0a0a0a" strokeWidth="2" className="transition-all" />
                    <text x={p.x} y={svgHeight - 12} textAnchor="middle" className="text-[10px] fill-neutral-300 font-mono">
                      {p.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Tooltip / Active Point Callout */}
          {activeIdx !== null && points[activeIdx] && (
            <div className="mt-2 p-2.5 rounded-lg bg-neutral-950 border border-emerald-500/40 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400 font-medium">{points[activeIdx].date}:</span>
              <span className="text-emerald-400 font-bold">
                {points[activeIdx].value.toLocaleString()} {series.unit}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse" aria-label={series.title}>
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2 px-3">Period</th>
                <th className="py-2 px-3 text-right">Value ({series.unit})</th>
                <th className="py-2 px-3">Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {data.map((d, i) => (
                <tr key={i} className="hover:bg-neutral-800/40 text-neutral-200">
                  <td className="py-2 px-3 font-semibold text-white">{d.date}</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold">{d.value.toLocaleString()}</td>
                  <td className="py-2 px-3 text-neutral-400">{d.label || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
        <span>Source: {series.source}</span>
        {series.frequency && <span>Frequency: {series.frequency}</span>}
      </div>
    </div>
  );
}
