import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 10. Lollipop Chart ─────────────────────────────────────────────── */

ChartRegistry.register('lollipop', (svg, data, width, height, theme, spec) => {
  // Lollipop = vertical line + circle on top (like dot-plot but vertical)
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const sorted = [...data].sort((a, b) => (Number(b[yField])) - (Number(a[yField])));

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
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
    dot.setAttribute('aria-label', `${String(d[xField])}: ${String(d[yField])}`);
    container.appendChild(dot);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = d3.axisBottom(xScale);
  d3.select(xAxisG).call(xAxis);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(5);
  d3.select(yAxisG).call(yAxis);
  yAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  yAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(yAxisG);
});
