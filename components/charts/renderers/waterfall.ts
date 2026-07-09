import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 11. Waterfall Chart ────────────────────────────────────────────── */

ChartRegistry.register('waterfall', (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
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
    rect.setAttribute('aria-label', `${b.label}: ${b.value >= 0 ? '+' : ''}${String(b.value)}`);
    container.appendChild(rect);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = d3.axisBottom(xScale);
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
