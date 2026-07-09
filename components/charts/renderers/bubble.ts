import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 6. Bubble Chart ────────────────────────────────────────────────── */

ChartRegistry.register('bubble', (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const sizeField = spec.sizeField || 'value';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
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
    dot.setAttribute('aria-label', `${String(d[xField])}, ${String(d[yField])}, size: ${String(d[sizeField])}`);
    container.appendChild(dot);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = d3.axisBottom(xScale).ticks(6);
  d3.select(xAxisG).call(xAxis);
  xAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  xAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(6);
  d3.select(yAxisG).call(yAxis);
  yAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  yAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(yAxisG);
});
