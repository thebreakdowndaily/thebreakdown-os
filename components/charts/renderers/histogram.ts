import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 8. Histogram ───────────────────────────────────────────────────── */

ChartRegistry.register('histogram', (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const yField = spec.yAxis.field || 'y';
  const values = data.map((d) => Number(d[yField]));

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
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
    rect.setAttribute('aria-label', `${String(bin.x0?.toFixed(1))}-${String(bin.x1?.toFixed(1))}: ${String(bin.length)}`);
    container.appendChild(rect);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = d3.axisBottom(xScale).ticks(8);
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
