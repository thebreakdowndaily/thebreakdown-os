import * as d3 from 'd3';
import { ChartRegistry } from './registry';

ChartRegistry.register('bar', (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  // Sort data by value descending (enforced by spec)
  const sorted = [...data].sort((a, b) => (b[yField] as number) - (a[yField] as number));

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
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
    bar.setAttribute('role', 'graphics-symbol');
    bar.setAttribute('tabindex', '0');
    bar.setAttribute('aria-label', `${String(d[xField])}: ${String(d[yField])}`);
    container.appendChild(bar);
  });

  // X Axis
  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = d3.axisBottom(xScale);
  d3.select(xAxisG).call(xAxis);
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
  d3.select(yAxisG).call(yAxis);
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
});

ChartRegistry.register('horizontal-bar', (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 60, bottom: 30, left: 100 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const sorted = [...data].sort((a, b) => (b[yField] as number) - (a[yField] as number));

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
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
    bar.setAttribute('role', 'graphics-symbol');
    bar.setAttribute('tabindex', '0');
    bar.setAttribute('aria-label', `${String(d[xField])}: ${String(d[yField])}`);
    container.appendChild(bar);
  });

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale);
  d3.select(yAxisG).call(yAxis);
  yAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-family', theme.fontFamily);
    t.setAttribute('text-anchor', 'end');
  });
  yAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(yAxisG);

  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = d3.axisBottom(xScale).ticks(5);
  d3.select(xAxisG).call(xAxis);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-family', theme.fontFamily);
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(xAxisG);
});

ChartRegistry.register('line', (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';
  const isTime = spec.xAxis.type === 'time';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
  svg.appendChild(container);

  // Scales
  let xScale: d3.ScalePoint<string> | d3.ScaleTime<number, number>;
  const xLabels = data.map((d) => String(d[xField]));

  if (isTime) {
    const parseDate = d3.timeParse('%Y-%m-%d');
    const dates = data.map((d) => parseDate(String(d[xField])) || new Date());
    xScale = d3.scaleTime().domain(d3.extent(dates) as [Date, Date]).range([0, innerW]);
  } else {
    xScale = d3.scalePoint().domain(xLabels).range([0, innerW]).padding(0.5);
  }

  const yMax = Math.max(...data.map((d) => Number(d[yField])), 0);
  const yScale = d3.scaleLinear()
    .domain([0, yMax * 1.05])
    .range([innerH, 0]);

  // Line path
  const lineGen = d3.line<Record<string, unknown>>()
    .x((d) => {
      const rawX = isTime
        ? (xScale as (v: Date) => number | undefined)(new Date(String(d[xField])))
        : (xScale as (v: string) => number | undefined)(String(d[xField]));
      return rawX ?? 0;
    })
    .y((d) => yScale(Number(d[yField])));

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', lineGen(data) || '');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', theme.brand);
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-linecap', 'round');
  container.appendChild(path);

  // Dots
  data.forEach((d) => {
    const cx = isTime
      ? (xScale as (v: Date) => number | undefined)(new Date(String(d[xField])))
      : (xScale as (v: string) => number | undefined)(String(d[xField]));
    const cy = yScale(Number(d[yField]));
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(cx));
    dot.setAttribute('cy', String(cy));
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', theme.brand);
    dot.setAttribute('stroke', theme.bg);
    dot.setAttribute('stroke-width', '2');
    dot.setAttribute('role', 'graphics-symbol');
    dot.setAttribute('tabindex', '0');
    dot.setAttribute('aria-label', `${String(d[xField])}: ${String(d[yField])}`);
    container.appendChild(dot);
  });

  // Area fill under line
  const areaGen = d3.area<Record<string, unknown>>()
    .x((d) => (isTime
      ? (xScale as (v: Date) => number | undefined)(new Date(String(d[xField])))
      : (xScale as (v: string) => number | undefined)(String(d[xField]))) ?? 0)
    .y0(innerH)
    .y1((d) => yScale(Number(d[yField])));

  const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  areaPath.setAttribute('d', areaGen(data) || '');
  areaPath.setAttribute('fill', theme.brand);
  areaPath.setAttribute('opacity', '0.08');
  container.appendChild(areaPath);

  // Axes
  const xAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = isTime ? d3.axisBottom(xScale as unknown as d3.AxisScale<d3.NumberValue>).ticks(6) : d3.axisBottom(xScale as unknown as d3.AxisScale<string>);
  d3.select(xAxisG).call(xAxis);
  xAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-family', theme.fontFamily);
  });
  xAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(xAxisG);

  const yAxisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const yAxis = d3.axisLeft(yScale).ticks(6);
  d3.select(yAxisG).call(yAxis);
  yAxisG.querySelectorAll('text').forEach((t) => {
    t.setAttribute('fill', theme.textMuted);
    t.setAttribute('font-size', '11');
    t.setAttribute('font-family', theme.fontFamily);
  });
  yAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(yAxisG);
});
