'use client';

import { useMemo } from 'react';
import type { Visualization, Observation, Metric } from '@/types/canonical';

interface DatasetChartProps {
  visualization: Visualization;
  observations: Observation[];
  metrics: Metric[];
}

const SVG_W = 600;
const SVG_H = 300;
const PAD = { top: 20, right: 20, bottom: 40, left: 60 };
const PLOT_W = SVG_W - PAD.left - PAD.right;
const PLOT_H = SVG_H - PAD.top - PAD.bottom;

function buildLineElements(pts: Array<{ period: string; value: number }>, yMin: number, yMax: number) {
  const xScaleFn = (i: number) => PAD.left + (i / Math.max(pts.length - 1, 1)) * PLOT_W;
  const yScaleFn = (v: number) => PAD.top + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScaleFn(i).toFixed(1)},${yScaleFn(p.value).toFixed(1)}`).join(' ');
  const area = `${path} L${xScaleFn(pts.length - 1).toFixed(1)},${String(PAD.top + PLOT_H)} L${xScaleFn(0).toFixed(1)},${String(PAD.top + PLOT_H)} Z`;
  return { path, area, xScale: xScaleFn, yScale: yScaleFn };
}

function buildBarView(pts: Array<{ period: string; value: number }>, yMin: number, yMax: number, title: string) {
  const { xScale, yScale } = buildLineElements(pts, yMin, yMax);
  const barW = Math.max(4, PLOT_W / pts.length - 2);
  const viewBoxStr = '0 0 ' + String(SVG_W) + ' ' + String(SVG_H);
  return (
    <svg viewBox={viewBoxStr} className="w-full h-auto" role="img" aria-label={title}>
      <text x={SVG_W / 2} y={16} textAnchor="middle" fill="#A1A1AA" fontSize="12">{title}</text>
      <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={PAD.left + PLOT_W} y2={PAD.top + PLOT_H} stroke="#2A2A2A" />
      {pts.map((p, i) => (
        <rect
          key={p.period}
          x={xScale(i) - barW / 2}
          y={yScale(p.value)}
          width={barW}
          height={PLOT_H - (yScale(p.value) - PAD.top)}
          fill="#D4A843"
          rx={1}
        />
      ))}
      {pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 8)) === 0).map((p) => (
        <text key={p.period} x={xScale(pts.indexOf(p))} y={PAD.top + PLOT_H + 16} textAnchor="middle" fill="#A1A1AA" fontSize="10">
          {p.period}
        </text>
      ))}
    </svg>
  );
}

function buildPieView(observations: Observation[], metrics: Metric[], title: string) {
  const items = metrics.map(m => ({
    label: m.label,
    total: observations.filter(o => o.value !== null).reduce((s, o) => s + (o.value || 0), 0),
  }));
  const grandTotal = items.reduce((s, m) => s + m.total, 0) || 1;
  const COLORS = ['#D4A843', '#22C55E', '#3B82F6', '#F43F5E', '#A855F7', '#F97316'];
  const cxNum = SVG_W / 2;
  const cyNum = SVG_H / 2;
  const rNum = Math.min(PLOT_W, PLOT_H) / 2 - 10;
  const viewBoxStr = '0 0 ' + String(SVG_W) + ' ' + String(SVG_H);

  const segments: Array<{ key: string; d: string; fill: string }> = [];
  let startAngle = -Math.PI / 2;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const angle = (item.total / grandTotal) * 2 * Math.PI;
    if (angle === 0) continue;
    const x1 = cxNum + rNum * Math.cos(startAngle);
    const y1 = cyNum + rNum * Math.sin(startAngle);
    const x2 = cxNum + rNum * Math.cos(startAngle + angle);
    const y2 = cyNum + rNum * Math.sin(startAngle + angle);
    const large = Number(angle > Math.PI);
    const d = 'M' + String(cxNum) + ',' + String(cyNum) + ' L' + String(x1) + ',' + String(y1) + ' A' + String(rNum) + ',' + String(rNum) + ' 0 ' + String(large) + ' 1 ' + String(x2) + ',' + String(y2) + ' Z';
    segments.push({ key: item.label, d, fill: COLORS[i % COLORS.length] });
    startAngle += angle;
  }

  return (
    <svg viewBox={viewBoxStr} className="w-full h-auto" role="img" aria-label={title}>
      <text x={SVG_W / 2} y={16} textAnchor="middle" fill="#A1A1AA" fontSize="12">{title}</text>
      {segments.map((seg) => (
        <path key={seg.key} d={seg.d} fill={seg.fill} />
      ))}
      <text x={SVG_W / 2} y={SVG_H / 2} textAnchor="middle" fill="#F5F5F5" fontSize="12">
        {title}
      </text>
    </svg>
  );
}

function buildLineView(pts: Array<{ period: string; value: number }>, yMin: number, yMax: number, title: string, showPoints: boolean) {
  const { path, area, xScale, yScale } = buildLineElements(pts, yMin, yMax);
  const viewBoxStr = '0 0 ' + String(SVG_W) + ' ' + String(SVG_H);
  return (
    <svg viewBox={viewBoxStr} className="w-full h-auto" role="img" aria-label={title}>
      <text x={SVG_W / 2} y={16} textAnchor="middle" fill="#A1A1AA" fontSize="12">{title}</text>
      <clipPath id="plot-clip">
        <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} />
      </clipPath>
      <path d={area} fill="#D4A843" fillOpacity={0.1} clipPath="url(#plot-clip)" />
      <path d={path} fill="none" stroke="#D4A843" strokeWidth={2} clipPath="url(#plot-clip)" />
      {showPoints && pts.map((p, i) => (
        <circle key={p.period} cx={xScale(i)} cy={yScale(p.value)} r={3} fill="#D4A843" clipPath="url(#plot-clip)" />
      ))}
    </svg>
  );
}

export function DatasetChart({ visualization, observations, metrics }: DatasetChartProps) {
  const active = useMemo(() => {
    return observations.filter(o => o.value !== null) as { period: string; value: number }[];
  }, [observations]);

  const computed = useMemo(() => {
    const values = active.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padding = range * 0.1;
    return { pts: active, yMin: min - padding, yMax: max + padding };
  }, [active]);

  const { pts, yMin, yMax } = computed;

  if (visualization.type === 'bar') {
    return buildBarView(pts, yMin, yMax, visualization.title);
  }

  if (visualization.type === 'pie') {
    return buildPieView(observations, metrics, visualization.title);
  }

  const showPoints = visualization.config.showPoints !== false;
  return buildLineView(pts, yMin, yMax, visualization.title, showPoints);
}
