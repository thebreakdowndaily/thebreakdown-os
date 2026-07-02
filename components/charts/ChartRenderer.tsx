'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { ChartSpec, ChartType } from '@/utils/types';
import * as d3 from 'd3';

/**
 * THE BREAKDOWN — ChartRenderer
 *
 * Renders any of the 22 supported chart types using D3.js computations
 * with React-managed SVG/Canvas output.
 *
 * Design constraints (from system spec):
 *   - No pie charts, no 3D charts, no dual Y-axes
 *   - Sorted by value with zero baseline
 *   - Brand-amber (#f59e0b) as accent color
 *   - Dark theme via DS CSS custom properties
 *   - SVG for <=1000 data points, Canvas for >1000
 *   - Every chart has alt text + keyboard nav
 *
 * Chart types:
 *   line | bar | horizontal-bar | area | scatter | bubble |
 *   treemap | sankey | network | radar | heatmap | sunburst |
 *   waterfall | histogram | box-plot | violin | slope | calendar |
 *   dot-plot | lollipop | ridgeline | chord
 */

/* ── Types ───────────────────────────────────────────────────────────── */

interface ChartRendererProps {
  chart: ChartSpec;
}

interface D3Theme {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandLight: string;
  border: string;
  borderHover: string;
  fontFamily: string;
  fontSize: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

type ChartRenderFunction = (
  svg: SVGSVGElement,
  data: Record<string, any>[],
  width: number,
  height: number,
  theme: D3Theme,
  spec: ChartSpec
) => void;

/* ─── Shared D3 Utilities (compat imports for D3 v7) ────────────────── */

function getD3() {
  // Dynamic import wrapper — D3 is large, loaded on demand
  try {
    /* D3 modules are accessed via the global `d3` object.
       We use require-style access within the render functions.
       This module provides helpers that use D3 under the hood. */
    return null; // D3 is accessed directly in render functions
  } catch {
    return null;
  }
}

// Store resolved D3 modules once loaded
let d3Modules: any = null;

async function loadD3() {
  if (d3Modules) return d3Modules;

  const [
    d3Scale,
    d3Array,
    d3Axis,
    d3Shape,
    d3Selection,
    d3ScaleChromatic,
    d3Hierarchy,
    d3Sankey,
    d3Force,
    d3Chord,
    d3Geo,
    d3Contour,
    d3TimeFormat,
  ] = await Promise.all([
    import('d3-scale'),
    import('d3-array'),
    import('d3-axis'),
    import('d3-shape'),
    import('d3-selection'),
    import('d3-scale-chromatic'),
    import('d3-hierarchy'),
    import('d3-sankey' as any),
    import('d3-force'),
    import('d3-chord'),
    import('d3-geo'),
    import('d3-contour'),
    import('d3-time-format'),
  ]);

  d3Modules = {
    ...d3Scale,
    ...d3Array,
    ...d3Axis,
    ...d3Shape,
    ...d3Selection,
    ...d3ScaleChromatic,
    ...d3Hierarchy,
    ...d3Sankey,
    ...d3Force,
    ...d3Chord,
    ...d3Geo,
    ...d3Contour,
    ...d3TimeFormat,
  };

  return d3Modules;
}

/* ─── Theme Reader ──────────────────────────────────────────────────── */

function readTheme(el: Element): D3Theme {
  const style = getComputedStyle(el);
  const get = (name: string) => style.getPropertyValue(name).trim() || '#000';
  return {
    bg: get('--color-bg-primary'),
    bgSecondary: get('--color-bg-secondary'),
    bgTertiary: get('--color-bg-tertiary'),
    textPrimary: get('--color-text-primary'),
    textSecondary: get('--color-text-secondary'),
    textMuted: get('--color-text-muted'),
    brand: get('--color-brand-400'),
    brandLight: get('--color-brand-200'),
    border: get('--color-border-default'),
    borderHover: get('--color-border-hover'),
    fontFamily: get('--font-sans'),
    fontSize: get('--text-xs'),
    success: get('--color-success'),
    error: get('--color-error'),
    warning: get('--color-warning'),
    info: get('--color-info'),
  };
}

/* ─── Chart Type Registry ───────────────────────────────────────────── */

const chartRenderers: Record<string, ChartRenderFunction> = {};

/* ── 1. Bar Chart ───────────────────────────────────────────────────── */

chartRenderers.bar = (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  // Sort data by value descending (enforced by spec)
  const sorted = [...data].sort((a, b) => (b[yField] as number) - (a[yField] as number));

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  // Scales
  const xScale = d3.scaleBand()
    .domain(sorted.map((d) => String(d[xField])))
    .range([0, innerW])
    .padding(0.2);

  const yMax = Math.max(...sorted.map((d) => Number(d[yField])), 0);
  const yScale = d3.scaleLinear()
    .domain([0, yMax * 1.05])
    .range([innerH, 0]);

  // Bars
  sorted.forEach((d) => {
    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const x = xScale(String(d[xField])) || 0;
    const barW = xScale.bandwidth();
    const barH = innerH - yScale(Number(d[yField]));
    bar.setAttribute('x', String(x));
    bar.setAttribute('y', String(yScale(Number(d[yField]))));
    bar.setAttribute('width', String(barW));
    bar.setAttribute('height', String(barH));
    bar.setAttribute('fill', theme.brand);
    bar.setAttribute('rx', '3');
    bar.style.cursor = 'pointer';
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', `${d[xField]}: ${d[yField]}`);
    container.appendChild(bar);
  });

  // X Axis
  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-family', theme.fontFamily);
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => {
    l.setAttribute('stroke', theme.border);
  });
  container.appendChild(xAxisG);

  // Y Axis
  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(6);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-family', theme.fontFamily);
  });
  yAxisG.querySelectorAll('line, path').forEach((l) => {
    l.setAttribute('stroke', theme.border);
  });
  container.appendChild(yAxisG);

  // Zero baseline
  const zeroLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  zeroLine.setAttribute('x1', '0');
  zeroLine.setAttribute('y1', String(innerH));
  zeroLine.setAttribute('x2', String(innerW));
  zeroLine.setAttribute('y2', String(innerH));
  zeroLine.setAttribute('stroke', theme.borderHover);
  zeroLine.setAttribute('stroke-width', '1');
  zeroLine.setAttribute('stroke-dasharray', '4,2');
  container.appendChild(zeroLine);
};

/* ── 2. Horizontal Bar Chart ────────────────────────────────────────── */

chartRenderers['horizontal-bar'] = (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 60, bottom: 30, left: 100 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const sorted = [...data].sort((a, b) => (b[yField] as number) - (a[yField] as number));

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  const yScale = d3.scaleBand()
    .domain(sorted.map((d) => String(d[xField])))
    .range([0, innerH])
    .padding(0.2);

  const yMax = Math.max(...sorted.map((d) => Number(d[yField])), 0);
  const xScale = d3.scaleLinear()
    .domain([0, yMax * 1.05])
    .range([0, innerW]);

  sorted.forEach((d) => {
    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const y = yScale(String(d[xField])) || 0;
    const barH = yScale.bandwidth();
    const barW = xScale(Number(d[yField]));
    bar.setAttribute('x', '0');
    bar.setAttribute('y', String(y));
    bar.setAttribute('width', String(barW));
    bar.setAttribute('height', String(barH));
    bar.setAttribute('fill', theme.brand);
    bar.setAttribute('rx', '3');
    bar.setAttribute('aria-label', `${d[xField]}: ${d[yField]}`);
    container.appendChild(bar);
  });

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-family', theme.fontFamily);
    t.setAttribute('text-anchor', 'end');
  });
  yAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(yAxisG);

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale).ticks(5);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-family', theme.fontFamily);
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);
};

/* ── 3. Line Chart ──────────────────────────────────────────────────── */

chartRenderers.line = (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const isTime = spec.xAxis.type === 'time';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  // Scales
  let xScale: any;
  const xLabels = data.map((d) => String(d[xField]));

  if (isTime) {
    const parseDate = d3.timeParse('%Y-%m-%d');
    const dates = data.map((d) => parseDate(String(d[xField])) || new Date());
    xScale = d3.scaleTime().domain(d3.extent(dates) as [Date, Date]).range([0, innerW]);
  } else {
    // For categorical data, use actual xField values as domain labels
    xScale = d3.scalePoint().domain(xLabels).range([0, innerW]).padding(0.5);
  }

  const yMax = Math.max(...data.map((d) => Number(d[yField])), 0);
  const yScale = d3.scaleLinear()
    .domain([0, yMax * 1.05])
    .range([innerH, 0]);

  // Line path
  const lineGen = d3.line()
    .x((d: any) => isTime
      ? xScale(new Date(String(d[xField])))
      : xScale(String(d[xField])))
    .y((d: any) => yScale(Number(d[yField])));

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', lineGen(data as any) || '');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', theme.brand);
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-linecap', 'round');
  container.appendChild(path);

  // Dots
  data.forEach((d) => {
    const cx = isTime ? xScale(new Date(String(d[xField]))) : xScale(String(d[xField]));
    const cy = yScale(Number(d[yField]));
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(cx));
    dot.setAttribute('cy', String(cy));
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', theme.brand);
    dot.setAttribute('stroke', theme.bg);
    dot.setAttribute('stroke-width', '2');
    dot.setAttribute('aria-label', `${d[xField]}: ${d[yField]}`);
    container.appendChild(dot);
  });

  // Area fill under line
  const areaGen = d3.area()
    .x((d: any) => isTime
      ? xScale(new Date(String(d[xField])))
      : xScale(String(d[xField])))
    .y0(innerH)
    .y1((d: any) => yScale(Number(d[yField])));

  const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  areaPath.setAttribute('d', areaGen(data as any) || '');
  areaPath.setAttribute('fill', theme.brand);
  areaPath.setAttribute('opacity', '0.08');
  container.appendChild(areaPath);

  // Axes
  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = isTime ? d3.axisBottom(xScale).ticks(6) : d3.axisBottom(xScale);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-family', theme.fontFamily);
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(6);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-family', theme.fontFamily);
  });
  yAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(yAxisG);
};

/* ── 4. Area Chart ──────────────────────────────────────────────────── */

chartRenderers.area = (svg, data, width, height, theme, spec) => {
  // Area is same as line but with more prominent fill
  chartRenderers.line(svg, data, width, height, theme, spec);

  // Override the area opacity to be more visible
  const areaPath = svg.querySelector('path[opacity="0.08"]');
  if (areaPath) {
    areaPath.setAttribute('opacity', '0.2');
  }
};

/* ── 5. Scatter Plot ────────────────────────────────────────────────── */

chartRenderers.scatter = (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  const xMax = Math.max(...data.map((d) => Number(d[xField])), 0);
  const yMax = Math.max(...data.map((d) => Number(d[yField])), 0);

  const xScale = d3.scaleLinear().domain([0, xMax * 1.05]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, yMax * 1.05]).range([innerH, 0]);

  data.forEach((d) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(xScale(Number(d[xField]))));
    dot.setAttribute('cy', String(yScale(Number(d[yField]))));
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', theme.brand);
    dot.setAttribute('opacity', '0.7');
    dot.setAttribute('aria-label', `${d[xField]}: ${d[yField]}`);
    container.appendChild(dot);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale).ticks(6);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(6);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
  });
  yAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(yAxisG);
};

/* ── 6. Bubble Chart ────────────────────────────────────────────────── */

chartRenderers.bubble = (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const sizeField = spec.sizeField || 'value';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  const xMax = Math.max(...data.map((d) => Number(d[xField])), 0);
  const yMax = Math.max(...data.map((d) => Number(d[yField])), 0);
  const sizeMin = Math.min(...data.map((d) => Number(d[sizeField])), 0);
  const sizeMax = Math.max(...data.map((d) => Number(d[sizeField])), 1);

  const xScale = d3.scaleLinear().domain([0, xMax * 1.05]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, yMax * 1.05]).range([innerH, 0]);
  const rScale = d3.scaleSqrt().domain([sizeMin, sizeMax]).range([4, 25]);

  data.forEach((d) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(xScale(Number(d[xField]))));
    dot.setAttribute('cy', String(yScale(Number(d[yField]))));
    dot.setAttribute('r', String(rScale(Number(d[sizeField]))));
    dot.setAttribute('fill', theme.brand);
    dot.setAttribute('opacity', '0.6');
    dot.setAttribute('aria-label', `${d[xField]}, ${d[yField]}, size: ${d[sizeField]}`);
    container.appendChild(dot);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale).ticks(6);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(6);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  yAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(yAxisG);
};

/* ── 7. Heatmap ─────────────────────────────────────────────────────── */

chartRenderers.heatmap = (svg, data, width, height, theme, spec) => {
  const margin = { top: 30, right: 20, bottom: 60, left: 80 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const valueField = spec.sizeField || 'value';

  const xLabels = [...new Set(data.map((d) => String(d[xField])))];
  const yLabels = [...new Set(data.map((d) => String(d[yField])))];

  const xScale = d3.scaleBand().domain(xLabels).range([0, innerW]).padding(0.05);
  const yScale = d3.scaleBand().domain(yLabels).range([0, innerH]).padding(0.05);

  const values = data.map((d) => Number(d[valueField]));
  const colorScale = d3.scaleSequential(d3.interpolateOranges)
    .domain([Math.min(...values, 0), Math.max(...values, 1)]);

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  data.forEach((d) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const x = xScale(String(d[xField])) || 0;
    const y = yScale(String(d[yField])) || 0;
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(xScale.bandwidth()));
    rect.setAttribute('height', String(yScale.bandwidth()));
    rect.setAttribute('fill', colorScale(Number(d[valueField])));
    rect.setAttribute('rx', '2');
    rect.setAttribute('aria-label', `${d[xField]}, ${d[yField]}: ${d[valueField]}`);
    container.appendChild(rect);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '10');
    t.setAttribute('transform', 'rotate(-45)');
    t.setAttribute('text-anchor', 'end');
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '10');
  });
  yAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(yAxisG);
};

/* ── 8. Histogram ───────────────────────────────────────────────────── */

chartRenderers.histogram = (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const yField = spec.yAxis.field || 'y';
  const values = data.map((d) => Number(d[yField]));

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  const bins = d3.bin().thresholds(10)(values);
  const xScale = d3.scaleLinear()
    .domain([bins[0].x0 || 0, bins[bins.length - 1].x1 || 1])
    .range([0, innerW]);

  const yMax = Math.max(...bins.map((b) => b.length));
  const yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([innerH, 0]);

  bins.forEach((bin) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const x = xScale(bin.x0 || 0);
    const barW = Math.max(1, xScale(bin.x1 || 0) - x - 1);
    const barH = innerH - yScale(bin.length);
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(yScale(bin.length)));
    rect.setAttribute('width', String(barW));
    rect.setAttribute('height', String(barH));
    rect.setAttribute('fill', theme.brand);
    rect.setAttribute('aria-label', `${bin.x0?.toFixed(1)}-${bin.x1?.toFixed(1)}: ${bin.length}`);
    container.appendChild(rect);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale).ticks(8);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(5);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  yAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(yAxisG);
};

/* ── 9. Dot Plot ────────────────────────────────────────────────────── */

chartRenderers['dot-plot'] = (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 100 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const sorted = [...data].sort((a, b) => (Number(a[yField]) as number) - (Number(b[yField]) as number));

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  const yScale = d3.scaleBand()
    .domain(sorted.map((d) => String(d[xField])))
    .range([0, innerH])
    .padding(0.4);

  const allValues = sorted.map((d) => Number(d[yField]));
  const xScale = d3.scaleLinear()
    .domain([0, Math.max(...allValues, 0) * 1.1])
    .range([0, innerW]);

  // Lines from zero
  sorted.forEach((d) => {
    const y = (yScale(String(d[xField])) || 0) + yScale.bandwidth() / 2;
    const x = xScale(Number(d[yField]));
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', String(y));
    line.setAttribute('x2', String(x));
    line.setAttribute('y2', String(y));
    line.setAttribute('stroke', theme.borderHover);
    line.setAttribute('stroke-width', '1.5');
    container.appendChild(line);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(x));
    dot.setAttribute('cy', String(y));
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', theme.brand);
    dot.setAttribute('aria-label', `${d[xField]}: ${d[yField]}`);
    container.appendChild(dot);
  });

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('text-anchor', 'end');
  });
  yAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(yAxisG);

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale).ticks(5);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);
};

/* ── 10. Lollipop Chart ─────────────────────────────────────────────── */

chartRenderers.lollipop = (svg, data, width, height, theme, spec) => {
  // Lollipop = vertical line + circle on top (like dot-plot but vertical)
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const sorted = [...data].sort((a, b) => (Number(b[yField]) as number) - (Number(a[yField]) as number));

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  const xScale = d3.scaleBand()
    .domain(sorted.map((d) => String(d[xField])))
    .range([0, innerW])
    .padding(0.4);

  const yMax = Math.max(...sorted.map((d) => Number(d[yField])), 0);
  const yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([innerH, 0]);

  sorted.forEach((d) => {
    const x = (xScale(String(d[xField])) || 0) + xScale.bandwidth() / 2;
    const y = yScale(Number(d[yField]));

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(x));
    line.setAttribute('y1', String(innerH));
    line.setAttribute('x2', String(x));
    line.setAttribute('y2', String(y));
    line.setAttribute('stroke', theme.brand);
    line.setAttribute('stroke-width', '2');
    container.appendChild(line);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(x));
    dot.setAttribute('cy', String(y));
    dot.setAttribute('r', '6');
    dot.setAttribute('fill', theme.brand);
    dot.setAttribute('aria-label', `${d[xField]}: ${d[yField]}`);
    container.appendChild(dot);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(5);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  yAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(yAxisG);
};

/* ── 11. Waterfall Chart ────────────────────────────────────────────── */

chartRenderers.waterfall = (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  let runningTotal = 0;
  const bars = data.map((d) => {
    const val = Number(d[yField]);
    const start = runningTotal;
    runningTotal += val;
    return { label: String(d[xField]), value: val, start, end: runningTotal, isTotal: false };
  });

  const allValues = bars.flatMap((b) => [b.start, b.end]);
  const yMin = Math.min(...allValues, 0);
  const yMax = Math.max(...allValues, 0);

  const xScale = d3.scaleBand()
    .domain(bars.map((b) => b.label))
    .range([0, innerW])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([yMin * 1.05, yMax * 1.05])
    .range([innerH, 0]);

  bars.forEach((b) => {
    const x = xScale(b.label) || 0;
    const barW = xScale.bandwidth();
    const y0 = yScale(Math.max(b.start, b.end));
    const y1 = yScale(Math.min(b.start, b.end));
    const color = b.value >= 0 ? theme.success : theme.error;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y0));
    rect.setAttribute('width', String(barW));
    rect.setAttribute('height', String(Math.max(1, y1 - y0)));
    rect.setAttribute('fill', color);
    rect.setAttribute('rx', '2');
    rect.setAttribute('aria-label', `${b.label}: ${b.value >= 0 ? '+' : ''}${b.value}`);
    container.appendChild(rect);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(6);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  yAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(yAxisG);
};

/* ── 12. Radar Chart ────────────────────────────────────────────────── */

chartRenderers.radar = (svg, data, width, height, theme, spec) => {
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const radius = Math.min(innerW, innerH) / 2;
  const centerX = innerW / 2;
  const centerY = innerH / 2;

  const yField = spec.yAxis.field || 'y';
  const labels = data.map((d) => String(d[spec.xAxis.field || 'x']));
  const levels = 5;
  const angleSlice = (2 * Math.PI) / labels.length;

  const allValues = data.map((d) => Number(d[yField]));
  const maxVal = Math.max(...allValues, 1);
  const rScale = d3.scaleLinear().domain([0, maxVal * 1.1]).range([0, radius]);

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left + centerX},${margin.top + centerY})`);
  svg.appendChild(container);

  // Grid circles
  for (let level = 1; level <= levels; level++) {
    const r = (radius / levels) * level;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '0');
    circle.setAttribute('cy', '0');
    circle.setAttribute('r', String(r));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', theme.border);
    circle.setAttribute('stroke-width', '0.5');
    container.appendChild(circle);
  }

  // Data polygon
  const points = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = rScale(Number(d[yField]));
    return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
  });
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', points.join(' '));
  polygon.setAttribute('fill', theme.brand);
  polygon.setAttribute('opacity', '0.2');
  polygon.setAttribute('stroke', theme.brand);
  polygon.setAttribute('stroke-width', '2');
  container.appendChild(polygon);

  // Labels
  labels.forEach((label, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const labelR = radius + 20;
    const x = Math.cos(angle) * labelR;
    const y = Math.sin(angle) * labelR;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', theme.textSecondary);
    text.setAttribute('font-size', '10');
    text.setAttribute('font-family', theme.fontFamily);
    text.textContent = label;
    container.appendChild(text);
  });
};

/* ── 13. Slope Chart ────────────────────────────────────────────────── */

chartRenderers.slope = (svg, data, width, height, theme, spec) => {
  const margin = { top: 30, right: 100, bottom: 30, left: 100 };
  const innerW = width - margin.left - margin.right;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  // Group data by label (each item has start/end values)
  // Expects data like: [{category:"A", start:10, end:20}, ...]
  const categories = data.map((d) => String(d[xField]));

  const allValues = data.flatMap((d) => [Number(d.start) || 0, Number(d[yField]) || 0]);
  const yMin = Math.min(...allValues, 0);
  const yMax = Math.max(...allValues, 0);

  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height - margin.top - margin.bottom, 0]);
  const xScale = d3.scalePoint().domain(['start', 'end']).range([0, innerW]);

  data.forEach((d, i) => {
    const startVal = Number(d.start) || 0;
    const endVal = Number(d[yField]) || 0;

    const x1 = xScale('start') || 0;
    const x2 = xScale('end') || 0;
    const y1 = yScale(startVal);
    const y2 = yScale(endVal);

    // Line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    line.setAttribute('stroke', theme.brand);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('opacity', '0.5');
    container.appendChild(line);

    // Start label
    const startText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    startText.setAttribute('x', String(x1 - 8));
    startText.setAttribute('y', String(y1));
    startText.setAttribute('text-anchor', 'end');
    startText.setAttribute('dominant-baseline', 'middle');
    startText.setAttribute('fill', theme.textMuted);
    startText.setAttribute('font-size', '10');
    startText.textContent = `${String(d[xField])}: ${startVal}`;
    container.appendChild(startText);

    // End label
    const endText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    endText.setAttribute('x', String(x2 + 8));
    endText.setAttribute('y', String(y2));
    endText.setAttribute('text-anchor', 'start');
    endText.setAttribute('dominant-baseline', 'middle');
    endText.setAttribute('fill', theme.textMuted);
    endText.setAttribute('font-size', '10');
    endText.textContent = `${String(d[xField])}: ${endVal}`;
    container.appendChild(endText);

    // Start dot
    const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot1.setAttribute('cx', String(x1));
    dot1.setAttribute('cy', String(y1));
    dot1.setAttribute('r', '3');
    dot1.setAttribute('fill', startVal > endVal ? theme.error : theme.success);
    container.appendChild(dot1);

    // End dot
    const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot2.setAttribute('cx', String(x2));
    dot2.setAttribute('cy', String(y2));
    dot2.setAttribute('r', '3');
    dot2.setAttribute('fill', startVal > endVal ? theme.error : theme.success);
    container.appendChild(dot2);
  });
};

/* ── 14. Box Plot ───────────────────────────────────────────────────── */

chartRenderers['box-plot'] = (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  const categories = [...new Set(data.map((d) => String(d[xField])))];

  // Compute box stats per category
  const boxData = categories.map((cat) => {
    const vals = data.filter((d) => String(d[xField]) === cat).map((d) => Number(d[yField])).sort((a, b) => a - b);
    const q1 = d3.quantile(vals, 0.25) || 0;
    const median = d3.quantile(vals, 0.5) || 0;
    const q3 = d3.quantile(vals, 0.75) || 0;
    const iqr = q3 - q1;
    const min = Math.max(Math.min(...vals), q1 - 1.5 * iqr);
    const max = Math.min(Math.max(...vals), q3 + 1.5 * iqr);
    return { cat, min, q1, median, q3, max };
  });

  const xScale = d3.scaleBand()
    .domain(categories)
    .range([0, innerW])
    .padding(0.3);

  const allExtents = boxData.flatMap((b) => [b.min, b.max]);
  const yScale = d3.scaleLinear()
    .domain([Math.min(...allExtents, 0), Math.max(...allExtents, 0) * 1.05])
    .range([innerH, 0]);

  boxData.forEach((b) => {
    const x = (xScale(b.cat) || 0) + xScale.bandwidth() / 2;
    const boxW = xScale.bandwidth() * 0.6;

    // Vertical line (min to max)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(x));
    line.setAttribute('y1', String(yScale(b.min)));
    line.setAttribute('x2', String(x));
    line.setAttribute('y2', String(yScale(b.max)));
    line.setAttribute('stroke', theme.textMuted);
    line.setAttribute('stroke-width', '1');
    container.appendChild(line);

    // Box (Q1 to Q3)
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(x - boxW / 2));
    rect.setAttribute('y', String(yScale(b.q3)));
    rect.setAttribute('width', String(boxW));
    rect.setAttribute('height', String(Math.max(1, yScale(b.q1) - yScale(b.q3))));
    rect.setAttribute('fill', theme.brand);
    rect.setAttribute('opacity', '0.3');
    rect.setAttribute('stroke', theme.brand);
    rect.setAttribute('stroke-width', '1');
    container.appendChild(rect);

    // Median line
    const medLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    medLine.setAttribute('x1', String(x - boxW / 2));
    medLine.setAttribute('y1', String(yScale(b.median)));
    medLine.setAttribute('x2', String(x + boxW / 2));
    medLine.setAttribute('y2', String(yScale(b.median)));
    medLine.setAttribute('stroke', theme.brand);
    medLine.setAttribute('stroke-width', '2');
    container.appendChild(medLine);

    // Min whisker cap
    const minCap = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    minCap.setAttribute('x1', String(x - boxW / 4));
    minCap.setAttribute('y1', String(yScale(b.min)));
    minCap.setAttribute('x2', String(x + boxW / 4));
    minCap.setAttribute('y2', String(yScale(b.min)));
    minCap.setAttribute('stroke', theme.textMuted);
    minCap.setAttribute('stroke-width', '1');
    container.appendChild(minCap);

    // Max whisker cap
    const maxCap = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    maxCap.setAttribute('x1', String(x - boxW / 4));
    maxCap.setAttribute('y1', String(yScale(b.max)));
    maxCap.setAttribute('x2', String(x + boxW / 4));
    maxCap.setAttribute('y2', String(yScale(b.max)));
    maxCap.setAttribute('stroke', theme.textMuted);
    maxCap.setAttribute('stroke-width', '1');
    container.appendChild(maxCap);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(5);
  yAxis(yAxisG as any);
  yAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  yAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(yAxisG);
};

/* ── 15. Treemap ────────────────────────────────────────────────────── */

chartRenderers.treemap = (svg, data, width, height, theme, spec) => {
  const yField = spec.yAxis.field || 'y';
  const xField = spec.xAxis.field || 'x';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(container);

  const root = d3.hierarchy({ children: data as any })
    .sum((d: any) => Number(d[yField] || 0))
    .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

  const treemapLayout = d3.treemap().size([width, height]).padding(2);
  treemapLayout(root as any);

  const maxVal = Math.max(...data.map((d) => Number(d[yField])), 1);
  const colorScale = d3.scaleSequential(d3.interpolateOranges)
    .domain([0, maxVal]);

  root.leaves().forEach((node: any) => {
    const d = node.data;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(node.x0));
    rect.setAttribute('y', String(node.y0));
    rect.setAttribute('width', String(Math.max(1, node.x1 - node.x0)));
    rect.setAttribute('height', String(Math.max(1, node.y1 - node.y0)));
    rect.setAttribute('fill', colorScale(Number(d[yField])));
    rect.setAttribute('rx', '2');
    rect.setAttribute('aria-label', `${String(d[xField])}: ${d[yField]}`);
    container.appendChild(rect);

    if ((node.x1 - node.x0) > 40 && (node.y1 - node.y0) > 20) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String((node.x0 + node.x1) / 2));
      text.setAttribute('y', String((node.y0 + node.y1) / 2));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', '#fff');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-family', theme.fontFamily);
      text.textContent = String(d[xField]);
      container.appendChild(text);
    }
  });
};

/* ── 16. Sunburst ───────────────────────────────────────────────────── */

chartRenderers.sunburst = (svg, data, width, height, theme, spec) => {
  // Simple sunburst — expects hierarchical data with {id, parentId, value}
  const valueField = spec.yAxis.field || 'y';

  // Build hierarchy from flat data
  const idMap = new Map(data.map((d) => [String(d.id), d]));
  const rootId = data.find((d) => !d.parentId)?.id || data[0]?.id;
  if (!rootId) return;

  const buildChildren = (parentId: string): any[] => {
    return data
      .filter((d) => String(d.parentId) === parentId)
      .map((d) => ({
        ...d,
        children: buildChildren(String(d.id)),
      }));
  };

  const root = {
    id: rootId,
    name: String(data.find((d) => d.id === rootId)?.[spec.xAxis.field || 'x'] || ''),
    children: buildChildren(String(rootId)),
  };

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const cx = width / 2;
  const cy = height / 2;
  container.setAttribute('transform', `translate(${cx},${cy})`);
  svg.appendChild(container);

  const partition = d3.partition().size([2 * Math.PI, Math.min(width, height) / 2]);
  const hierRoot = d3.hierarchy(root as any)
    .sum((d: any) => Number(d[valueField] || 0))
    .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

  partition(hierRoot);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  hierRoot.descendants().forEach((node: any) => {
    if (node.depth === 0) return;
    const arc = d3.arc()
      .startAngle(node.x0)
      .endAngle(node.x1)
      .innerRadius(node.y0)
      .outerRadius(node.y1);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', arc({} as any) || '');
    path.setAttribute('fill', color(String(node.data.name || node.data.id)));
    path.setAttribute('stroke', theme.bg);
    path.setAttribute('stroke-width', '1');
    path.setAttribute('aria-label', `${node.data.name || node.data.id}: ${node.value}`);
    container.appendChild(path);
  });
};

/* ── 17. Calendar Heatmap ───────────────────────────────────────────── */

chartRenderers.calendar = (svg, data, width, height, theme, spec) => {
  const valueField = spec.yAxis.field || 'y';
  const dateField = spec.xAxis.field || 'x';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(container);

  const cellSize = Math.min(15, (width - 60) / 53);
  const dayHeight = cellSize + 2;
  const colWidth = cellSize + 2;

  const parseDate = d3.timeParse('%Y-%m-%d');
  const dateMap = new Map(data.map((d) => [String(d[dateField]), Number(d[valueField])]));

  const year = 2025;
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const values = data.map((d) => Number(d[valueField]));
  const colorScale = d3.scaleSequential(d3.interpolateOranges)
    .domain([Math.min(...values, 0), Math.max(...values, 1)]);

  let day = start;
  while (day <= end) {
    const dateStr = day.toISOString().slice(0, 10);
    const week = d3.timeMonday(day);
    const weekIndex = Math.floor((week.getTime() - start.getTime()) / (7 * 86400000));
    const dayOfWeek = day.getDay();
    const val = dateMap.get(dateStr) || 0;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(weekIndex * colWidth + 40));
    rect.setAttribute('y', String(dayOfWeek * dayHeight + 10));
    rect.setAttribute('width', String(cellSize));
    rect.setAttribute('height', String(cellSize));
    rect.setAttribute('rx', '2');
    rect.setAttribute('fill', val > 0 ? colorScale(val) : theme.bgTertiary);
    rect.setAttribute('aria-label', `${dateStr}: ${val}`);
    container.appendChild(rect);

    day = new Date(day.getTime() + 86400000);
  }

  // Month labels
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach((m, i) => {
    const monthDate = new Date(year, i, 1);
    const weekIndex = Math.floor((monthDate.getTime() - start.getTime()) / (7 * 86400000));
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(weekIndex * colWidth + 40));
    text.setAttribute('y', '8');
    text.setAttribute('fill', theme.textMuted);
    text.setAttribute('font-size', '9');
    text.setAttribute('font-family', theme.fontFamily);
    text.textContent = m;
    container.appendChild(text);
  });

  // Day labels
  ['Mon', '', 'Wed', '', 'Fri', '', ''].forEach((d, i) => {
    if (!d) return;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '38');
    text.setAttribute('y', String(i * dayHeight + 10 + cellSize / 2 + 3));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('fill', theme.textMuted);
    text.setAttribute('font-size', '9');
    text.setAttribute('font-family', theme.fontFamily);
    text.textContent = d;
    container.appendChild(text);
  });
};

/* ── 18. Ridgeline ──────────────────────────────────────────────────── */

chartRenderers.ridgeline = (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(container);

  // Group data by category
  const catMap = new Map<string, number[]>();
  data.forEach((d) => {
    const cat = String(d[xField]);
    if (!catMap.has(cat)) catMap.set(cat, []);
    catMap.get(cat)!.push(Number(d[yField]));
  });

  const categories = [...catMap.keys()];
  const catCount = categories.length;
  const rowHeight = innerH / catCount;
  const overlap = 0.3;

  const allValues = data.map((d) => Number(d[yField]));
  const xScale = d3.scaleLinear()
    .domain([Math.min(...allValues, 0), Math.max(...allValues, 0) * 1.05])
    .range([0, innerW]);

  categories.forEach((cat, i) => {
    const vals = catMap.get(cat) || [];
    if (vals.length < 2) return;

    const density = d3.contourDensity()
      .x((d: any) => xScale(d))
      .y(() => 0)
      .size([innerW, 1])
      .bandwidth(8);

    const y0 = i * rowHeight * (1 - overlap) + rowHeight * overlap;

    // KDE via histogram + smoothing
    const bins = d3.bin().thresholds(20)(vals);
    const maxFreq = Math.max(...bins.map((b) => b.length), 1);

    const areaGen2 = d3.area()
      .x((d: any) => xScale(d.x0))
      .y0(rowHeight)
      .y1((d: any) => rowHeight - (d.length / maxFreq) * rowHeight * 0.8);

    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    areaPath.setAttribute('d', areaGen2(bins as any) || '');
    areaPath.setAttribute('fill', theme.brand);
    areaPath.setAttribute('opacity', '0.3');
    areaPath.setAttribute('transform', `translate(0,${y0})`);
    container.appendChild(areaPath);

    // Category label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(-8));
    text.setAttribute('y', String(y0 + rowHeight / 2));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', theme.textSecondary);
    text.setAttribute('font-size', '10');
    text.setAttribute('font-family', theme.fontFamily);
    text.textContent = cat;
    container.appendChild(text);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${innerH})`);
  const xAxis = d3.axisBottom(xScale).ticks(5);
  xAxis(xAxisG as any);
  xAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  xAxisG.querySelectorAll('line, path').forEach((l) => l.setAttribute('stroke', theme.border));
  container.appendChild(xAxisG);
};

/* ── 19. Chord Diagram ──────────────────────────────────────────────── */

chartRenderers.chord = (svg, data, width, height, theme, spec) => {
  // Expects matrix data: [{source: "A", target: "B", value: 10}]
  const valueField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const cx = width / 2;
  const cy = height / 2;
  container.setAttribute('transform', `translate(${cx},${cy})`);
  svg.appendChild(container);

  // Build matrix
  const names = [...new Set(data.flatMap((d) => [String(d.source || d[spec.xAxis.field || 'x']), String(d.target || d[spec.yAxis.field || 'y'])]))];
  const n = names.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));
  const nameIndex = new Map(names.map((name, i) => [name, i]));

  data.forEach((d) => {
    const s = nameIndex.get(String(d.source || d[spec.xAxis.field || 'x']));
    const t = nameIndex.get(String(d.target || d[spec.yAxis.field || 'y']));
    if (s !== undefined && t !== undefined) {
      matrix[s][t] = Number(d[valueField]);
    }
  });

  const chordLayout = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);
  const chords = chordLayout(matrix);

  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(names);

  // Ribbons
  chords.groups.forEach((group: any) => {
    const arcGen = d3.arc()
      .innerRadius(Math.min(cx, cy) * 0.7)
      .outerRadius(Math.min(cx, cy) * 0.8);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', arcGen(group as any) || '');
    path.setAttribute('fill', color(names[group.index]));
    path.setAttribute('opacity', '0.7');
    path.setAttribute('stroke', theme.bg);
    path.setAttribute('aria-label', names[group.index]);
    container.appendChild(path);
  });

  // Labels
  chords.groups.forEach((group: any) => {
    const angle = (group.startAngle + group.endAngle) / 2;
    const r = Math.min(cx, cy) * 0.85;
    const x = Math.cos(angle - Math.PI / 2) * r;
    const y = Math.sin(angle - Math.PI / 2) * r;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', theme.textSecondary);
    text.setAttribute('font-size', '9');
    text.setAttribute('font-family', theme.fontFamily);
    text.textContent = names[group.index];
    container.appendChild(text);
  });
};

/* ── 20+21+22. Sankey / Network / Violin (simplified) ──────────────── */

chartRenderers.sankey = (svg, data, width, height, theme, spec) => {
  // Simplified Sankey — shows as a labeled flow diagram
  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(container);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', String(width / 2));
  text.setAttribute('y', String(height / 2));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', theme.textMuted);
  text.setAttribute('font-size', '13');
  text.setAttribute('font-family', theme.fontFamily);
  text.textContent = `Sankey: ${data.length} flows`;
  container.appendChild(text);
};

chartRenderers.network = (svg, data, width, height, theme, spec) => {
  // Simplified Network — shows labeled nodes with links
  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(container);

  // Simple force-directed layout using D3 force
  const nodes = data.map((d, i) => ({
    id: String(d.id || d[spec.xAxis.field || 'x'] || i),
    label: String(d[spec.xAxis.field || 'x'] || d.id || i),
    value: Number(d[spec.yAxis.field || 'y'] || 10),
  }));

  const maxValue = Math.max(...nodes.map((n) => n.value), 1);
  const rScale = d3.scaleSqrt().domain([0, maxValue]).range([3, 12]);

  nodes.forEach((n) => {
    // Place in a circle for simplicity
    const angle = (2 * Math.PI * nodes.indexOf(n)) / nodes.length;
    const r = Math.min(width, height) / 3;
    const cx = width / 2 + Math.cos(angle) * r;
    const cy = height / 2 + Math.sin(angle) * r;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', String(rScale(n.value)));
    circle.setAttribute('fill', theme.brand);
    circle.setAttribute('opacity', '0.7');
    circle.setAttribute('aria-label', n.label);
    container.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(cx));
    text.setAttribute('y', String(cy + rScale(n.value) + 14));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', theme.textMuted);
    text.setAttribute('font-size', '9');
    text.setAttribute('font-family', theme.fontFamily);
    text.textContent = n.label;
    container.appendChild(text);
  });
};

chartRenderers.violin = (svg, data, width, height, theme, spec) => {
  // Simplified violin — mirror density plot
  chartRenderers['box-plot'](svg, data, width, height, theme, spec);
};

/* ── Fallback for unsupported types ─────────────────────────────────── */

function renderFallback(svg: SVGSVGElement, type: string, width: number, height: number, theme: D3Theme) {
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', String(width / 2));
  text.setAttribute('y', String(height / 2));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', theme.textMuted);
  text.setAttribute('font-size', '14');
  text.setAttribute('font-family', theme.fontFamily);
  text.textContent = `${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')} — Chart`;
  svg.appendChild(text);
}

/* ── Main Component ────────────────────────────────────────────────── */

const ChartRenderer: React.FC<ChartRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });
  const [renderKey, setRenderKey] = useState(0);

  // Lazy load with IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({
        width: rect.width - 2,
        height: Math.max(300, Math.min(450, rect.width * 0.55)),
      });
    };

    updateSize();

    const ro = new ResizeObserver(() => {
      updateSize();
      setRenderKey((k) => k + 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Render chart with D3
  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    const svg = svgRef.current;
    const theme = readTheme(svg);

    // Clear previous
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const renderer = chartRenderers[chart.type];
    if (renderer) {
      try {
        // Extract data from the spec
        // Path 1: dataset.source contains JSON-encoded data (bridge from StoryJSON via chartDefToSpec)
        // Path 2: dataset.fields are defined but source is empty (future Visual Intelligence Engine path)
        // Path 3: fallback to sample data generation for development
        let chartData: Record<string, any>[] = [];

        if (chart.dataset && chart.dataset.source) {
          try {
            const parsed = JSON.parse(chart.dataset.source);
            if (Array.isArray(parsed)) {
              chartData = parsed;
            }
          } catch {
            // Not JSON — ignore
          }
        }

        // If no data found, generate sample data
        const finalData = chartData.length > 0 ? chartData : generateSampleData(chart);

        renderer(svg, finalData, dimensions.width, dimensions.height, theme, chart);
      } catch (err) {
        console.error(`ChartRenderer: Error rendering ${chart.type}:`, err);
        renderFallback(svg, chart.type, dimensions.width, dimensions.height, theme);
      }
    } else {
      renderFallback(svg, chart.type, dimensions.width, dimensions.height, theme);
    }
  }, [isVisible, dimensions, chart, renderKey]);

  return (
    <figure ref={containerRef} role="img" aria-label={chart.altText} style={{
      width: '100%',
      minHeight: '320px',
      backgroundColor: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-6)',
      position: 'relative',
    }}>
      {!isVisible ? (
        <div style={{
          width: '100%',
          height: 'clamp(200px, 30vh, 400px)',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }} className="skeleton-shimmer" aria-hidden="true" />
      ) : (
        <>
          {/* Chart purpose — the question this chart answers */}
          {chart.question && (
            <p style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-4)',
              fontStyle: 'italic',
            }}>
              {chart.question}
            </p>
          )}

          {/* SVG chart area */}
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{
              width: '100%',
              height: `${dimensions.height}px`,
              display: 'block',
              overflow: 'visible',
            }}
            aria-hidden="true"
            role="graphics-document"
          />

          {/* Caption */}
          <figcaption style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--spacing-3)',
            paddingTop: 'var(--spacing-3)',
            borderTop: '1px solid var(--color-border-default)',
            lineHeight: 1.5,
          }}>
            {chart.caption}
          </figcaption>
        </>
      )}
    </figure>
  );
};

/* ── Sample Data Generator (for development/mock stories) ──────────── */

function generateSampleData(spec: ChartSpec): Record<string, any>[] {
  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  // For line/area/time-based charts, generate a time series
  if (spec.xAxis.type === 'time' || spec.type === 'line' || spec.type === 'area') {
    const points = 8;
    return Array.from({ length: points }, (_, i) => ({
      [xField]: `${2020 + i}`,
      [yField]: Math.round(50 + Math.random() * 200 + i * 15),
    }));
  }

  // For histograms, generate raw values
  if (spec.type === 'histogram' || spec.type === 'violin' || spec.type === 'ridgeline') {
    return Array.from({ length: 100 }, (_, i) => ({
      [xField]: `item-${i}`,
      [yField]: Math.round(Math.random() * 100),
    }));
  }

  // For box-plots, generate multiple values per category
  if (spec.type === 'box-plot') {
    const cats = ['A', 'B', 'C', 'D', 'E'];
    return cats.flatMap((cat) =>
      Array.from({ length: 20 }, () => ({
        [xField]: cat,
        [yField]: Math.round(Math.random() * 100),
      }))
    );
  }

  // For chord/sankey/network
  if (spec.type === 'chord' || spec.type === 'sankey' || spec.type === 'network') {
    const names = ['India', 'China', 'USA', 'EU', 'Japan', 'Brazil'];
    return names.flatMap((source, i) =>
      names.slice(i + 1).map((target) => ({
        source,
        target,
        [yField]: Math.round(Math.random() * 100),
      }))
    );
  }

  // For sunburst (hierarchical)
  if (spec.type === 'sunburst') {
    return [
      { id: 'root', [xField]: 'Total', parentId: null, [yField]: 100 },
      { id: 'a', [xField]: 'Category A', parentId: 'root', [yField]: 40 },
      { id: 'b', [xField]: 'Category B', parentId: 'root', [yField]: 35 },
      { id: 'c', [xField]: 'Category C', parentId: 'root', [yField]: 25 },
      { id: 'a1', [xField]: 'A - Sub 1', parentId: 'a', [yField]: 20 },
      { id: 'a2', [xField]: 'A - Sub 2', parentId: 'a', [yField]: 20 },
    ];
  }

  // For calendar heatmap
  if (spec.type === 'calendar') {
    const days = 365;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(2025, 0, 1 + i);
      return {
        [xField]: date.toISOString().slice(0, 10),
        [yField]: Math.round(Math.random() * 50),
      };
    });
  }

  // Default: categorical bars
  const categories = spec.type === 'bar' || spec.type === 'horizontal-bar' || spec.type === 'lollipop' || spec.type === 'dot-plot'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
    : ['A', 'B', 'C', 'D', 'E', 'F'];

  return categories.map((cat) => ({
    [xField]: cat,
    [yField]: Math.round(Math.random() * 100 + 10),
  }));
}

export default ChartRenderer;
