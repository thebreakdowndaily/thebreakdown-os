'use client';

import { useState, useMemo, useCallback } from 'react';

const PAD = { top: 20, right: 20, bottom: 40, left: 60 };
const COLORS = ['#D4A843', '#22C55E', '#3B82F6', '#EF4444', '#A855F7'];

function formatValue(v: number): string {
  if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

interface ChartBlockData {
  chartId: string;
  type: string;
  title: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
}

export default function ChartBlock({ chartId, type, title, data, xKey, yKey }: ChartBlockData) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const parsedData = useMemo(() => {
    return data.map((d) => ({
      label: String(d[xKey] ?? ''),
      value: Number(d[yKey]) || 0,
    }));
  }, [data, xKey, yKey]);

  const displayData = useMemo(() => {
    if (!zoomRange) return parsedData;
    return parsedData.slice(zoomRange[0], zoomRange[1] + 1);
  }, [parsedData, zoomRange]);

  const values = displayData.map((d) => d.value);
  const vMin = Math.min(...values, 0);
  const vMax = Math.max(...values);
  const vRange = vMax - vMin || 1;

  const svgW = 700;
  const svgH = 300;
  const plotW = svgW - PAD.left - PAD.right;
  const plotH = svgH - PAD.top - PAD.bottom;
  const stepX = displayData.length > 1 ? plotW / (displayData.length - 1) : plotW / 2;

  const xScale = useCallback((i: number) => PAD.left + (displayData.length > 1 ? (i / (displayData.length - 1)) * plotW : plotW / 2), [displayData.length, plotW]);
  const yScale = useCallback((v: number) => PAD.top + plotH - ((v - vMin) / vRange) * plotH, [plotH, vMin, vRange]);

  const linePath = displayData.length > 1
    ? displayData.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.value).toFixed(1)}`).join(' ')
    : '';

  const areaPath = displayData.length > 1
    ? `${linePath} L${xScale(displayData.length - 1).toFixed(1)},${PAD.top + plotH} L${xScale(0).toFixed(1)},${PAD.top + plotH} Z`
    : '';

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (type !== 'line') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * svgW;
    const idx = Math.round(((svgX - PAD.left) / plotW) * (parsedData.length - 1));
    if (idx >= 0 && idx < parsedData.length) {
      setIsDragging(true);
      setDragStart(idx);
    }
  }, [type, plotW, parsedData.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * svgW;
    const idx = Math.round(((svgX - PAD.left) / plotW) * (displayData.length - 1));

    if (isDragging && dragStart !== null) {
      return;
    }

    if (idx >= 0 && idx < displayData.length) {
      setTooltip({
        x: svgX,
        y: yScale(displayData[idx].value),
        label: displayData[idx].label,
        value: displayData[idx].value,
      });
    }
  }, [displayData, isDragging, dragStart, plotW, svgW, yScale]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging || dragStart === null) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * svgW;
    const dragEnd = Math.round(((svgX - PAD.left) / plotW) * (parsedData.length - 1));
    const from = Math.max(0, Math.min(dragStart, dragEnd));
    const to = Math.min(parsedData.length - 1, Math.max(dragStart, dragEnd));
    if (to - from >= 2) {
      setZoomRange([from, to]);
    }
    setIsDragging(false);
    setDragStart(null);
  }, [isDragging, dragStart, plotW, svgW, parsedData.length]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setIsDragging(false);
    setDragStart(null);
  }, []);

  return (
    <section id={`chart-${chartId}`} aria-label={title} className="py-8 sm:py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest">{title}</h2>
        {zoomRange && (
          <button
            type="button"
            onClick={() => setZoomRange(null)}
            className="text-[10px] font-bold uppercase tracking-widest text-brand-400 hover:text-brand-500 transition-colors"
          >
            Reset zoom
          </button>
        )}
      </div>

      <div className="rounded-lg bg-surface-primary border border-border p-4 sm:p-6 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-auto select-none"
          style={{ touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label={`Chart: ${title}`}
        >
          {isDragging && dragStart !== null && type === 'line' && (
            <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="var(--color-brand-400, #D4A843)" opacity={0.05} />
          )}

          {Array.from({ length: 5 }).map((_, i) => {
            const v = vMin + (vRange / 4) * i;
            const y = yScale(v);
            return (
              <g key={i}>
                <line x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y} stroke="currentColor" className="text-border" strokeWidth={1} />
                <text x={PAD.left - 8} y={y + 3} textAnchor="end" fill="currentColor" className="text-text-muted" fontSize={10} fontFamily="monospace">
                  {formatValue(v)}
                </text>
              </g>
            );
          })}

          {type === 'line' && (
            <>
              {areaPath && (
                <path d={areaPath} fill="url(#gradient)" opacity={0.15} />
              )}
              {linePath && (
                <path d={linePath} fill="none" stroke="var(--color-brand-400, #D4A843)" strokeWidth={2} strokeLinejoin="round" />
              )}
            </>
          )}

          {type === 'bar' && displayData.map((d, i) => {
            const x = xScale(i) - stepX / 2 + 4;
            const w = Math.max(stepX - 8, 8);
            const h = ((d.value - vMin) / vRange) * plotH;
            const y = PAD.top + plotH - h;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={h}
                fill={COLORS[i % COLORS.length]}
                rx={1}
                opacity={0.85}
                className="hover:opacity-100 transition-opacity"
              />
            );
          })}

          {type === 'line' && displayData.map((d, i) => (
            <circle
              key={i}
              cx={xScale(i)}
              cy={yScale(d.value)}
              r={3.5}
              fill="var(--color-brand-400, #D4A843)"
              stroke="var(--color-surface-primary, #0A0A0A)"
              strokeWidth={1.5}
              className="hover:r-5 transition-all"
            />
          ))}

          {displayData.map((d, i) => {
            const x = type === 'bar' ? xScale(i) : xScale(i);
            const labelAngle = displayData.length > 8 ? 30 : 0;
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={PAD.top + plotH + 16}
                textAnchor="end"
                transform={`rotate(${labelAngle}, ${x}, ${PAD.top + plotH + 16})`}
                fill="currentColor"
                className="text-text-muted"
                fontSize={10}
                fontFamily="monospace"
              >
                {d.label}
              </text>
            );
          })}

          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-400, #D4A843)" />
              <stop offset="100%" stopColor="var(--color-brand-400, #D4A843)" stopOpacity={0} />
            </linearGradient>
          </defs>

          {tooltip && (
            <g>
              <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + plotH} stroke="var(--color-brand-400, #D4A843)" strokeWidth={1} strokeDasharray="3,2" />
              <rect x={tooltip.x + 10} y={tooltip.y - 24} width={120} height={38} rx={2} fill="var(--color-surface-secondary, #151515)" stroke="var(--color-border, #2A2A2A)" />
              <text x={tooltip.x + 16} y={tooltip.y - 10} fill="currentColor" className="text-text-primary" fontSize={11} fontFamily="monospace" fontWeight={600}>
                {formatValue(tooltip.value)}
              </text>
              <text x={tooltip.x + 16} y={tooltip.y + 4} fill="currentColor" className="text-text-secondary" fontSize={9}>
                {tooltip.label}
              </text>
            </g>
          )}
        </svg>

        {type === 'line' && parsedData.length > 5 && (
          <p className="text-[10px] text-text-muted/60 text-center mt-3 uppercase tracking-widest">
            Drag to select a range to zoom in
          </p>
        )}
      </div>
    </section>
  );
}
