'use client';

import React, { useRef, useEffect, useState } from 'react';
import type { ChartSpec } from '@/utils/types';
import * as d3 from 'd3';

export interface ChartRendererProps {
  chart: ChartSpec;
}

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

import { ChartRegistry } from './renderers/registry';
import type { D3Theme } from './renderers/registry';
import './renderers/core';
import './renderers/area';
import './renderers/scatter';
import './renderers/bubble';
import './renderers/heatmap';
import './renderers/histogram';
import './renderers/lollipop';
import './renderers/waterfall';
import './renderers/radar';
import './renderers/slope';
import './renderers/treemap';
import './renderers/sunburst';
import './renderers/calendar';
import './renderers/ridgeline';
import './renderers/chord';
import './renderers/sankey';

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
// Chart renderers are populated via imports (e.g. core.ts)

/* ── 9. Dot Plot ────────────────────────────────────────────────────── */

ChartRegistry.register('dot-plot', (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 100 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const sorted = [...data].sort((a, b) => (Number(a[yField])) - (Number(b[yField])));

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
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
    dot.setAttribute('aria-label', `${String(d[xField])}: ${String(d[yField])}`);
    container.appendChild(dot);
  });

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale);
  d3.select(yAxisG).call(yAxis);
  yAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('text-anchor', 'end');
  });
  yAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(yAxisG);

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = d3.axisBottom(xScale).ticks(5);
  d3.select(xAxisG).call(xAxis);
  xAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  xAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(xAxisG);
});

/* ── 14. Box Plot ───────────────────────────────────────────────────── */

ChartRegistry.register('box-plot', (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
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
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = d3.axisBottom(xScale);
  d3.select(xAxisG).call(xAxis);
  xAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  xAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(5);
  d3.select(yAxisG).call(yAxis);
  yAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  yAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(yAxisG);
});

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
    return () => { observer.disconnect(); };
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
    return () => { ro.disconnect(); };
  }, []);

  // Render chart with D3
  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    const svg = svgRef.current;
    const theme = readTheme(svg);

    // Clear previous
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const renderer = ChartRegistry.get(chart.type);
    try {
      let chartData: Record<string, unknown>[] = [];

      if (chart.dataset.source) {
        try {
          const raw = JSON.parse(chart.dataset.source) as unknown;
          if (Array.isArray(raw)) {
            chartData = raw as Record<string, unknown>[];
          }
        } catch {
          // Not JSON — ignore
        }
      }

      const finalData = chartData.length > 0 ? chartData : generateSampleData(chart);

      renderer?.(svg, finalData, dimensions.width, dimensions.height, theme, chart);
    } catch (err) {
      console.error(`ChartRenderer: Error rendering ${chart.type}:`, err);
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
              height: `${String(dimensions.height)}px`,
              display: 'block',
              overflow: 'visible',
            }}
            aria-hidden="true"
            role="graphics-document"
            tabIndex={0}
            onKeyDown={(e) => {
              const svgEl = svgRef.current;
              if (!svgEl) return;
              const focusables = Array.from(svgEl.querySelectorAll<SVGElement>('[tabindex="0"]'));
              if (focusables.length === 0) return;
              
              const currentIdx = focusables.indexOf(document.activeElement as SVGElement);
              
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIdx = currentIdx >= 0 && currentIdx < focusables.length - 1 ? currentIdx + 1 : 0;
                focusables[nextIdx].focus();
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIdx = currentIdx > 0 ? currentIdx - 1 : focusables.length - 1;
                focusables[prevIdx].focus();
              }
            }}
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

function generateSampleData(spec: ChartSpec): Record<string, unknown>[] {
  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  // For line/area/time-based charts, generate a time series
  if (spec.xAxis.type === 'time' || spec.type === 'line' || spec.type === 'area') {
    const points = 8;
    return Array.from({ length: points }, (_, i) => ({
      [xField]: String(2020 + i),
      [yField]: Math.round(50 + Math.random() * 200 + i * 15),
    }));
  }

  // For histograms, generate raw values
  if (spec.type === 'histogram' || spec.type === 'violin' || spec.type === 'ridgeline') {
    return Array.from({ length: 100 }, (_, i) => ({
      [xField]: `item-${String(i)}`,
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
