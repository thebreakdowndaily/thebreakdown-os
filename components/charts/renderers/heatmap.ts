import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 7. Heatmap ─────────────────────────────────────────────────────── */

ChartRegistry.register('heatmap', (svg, data, width, height, theme, spec) => {
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
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
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
    rect.setAttribute('aria-label', `${String(d[xField])}, ${String(d[yField])}: ${String(d[valueField])}`);
    container.appendChild(rect);
  });

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = d3.axisBottom(xScale);
  d3.select(xAxisG).call(xAxis);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '10');
    t.setAttribute('transform', 'rotate(-45)');
    t.setAttribute('text-anchor', 'end');
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale);
  d3.select(yAxisG).call(yAxis);
  yAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '10');
  });
  yAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(yAxisG);
});
