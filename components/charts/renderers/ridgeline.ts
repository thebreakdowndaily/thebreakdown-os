import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 18. Ridgeline ──────────────────────────────────────────────────── */

ChartRegistry.register('ridgeline', (svg, data, width, height, theme, spec) => {
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
  svg.appendChild(container);

  // Group data by category
  const catMap = new Map<string, number[]>();
  data.forEach((d) => {
    const cat = String(d[xField]);
    const arr = catMap.get(cat);
    if (arr) {
      arr.push(Number(d[yField]));
    } else {
      catMap.set(cat, [Number(d[yField])]);
    }
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

    const y0 = i * rowHeight * (1 - overlap) + rowHeight * overlap;

    // KDE via histogram + smoothing
    const bins = d3.bin().thresholds(20)(vals);
    const maxFreq = Math.max(...bins.map((b) => b.length), 1);

    const areaGen2 = d3.area<d3.Bin<number, number>>()
      .x((d) => xScale(d.x0 ?? 0))
      .y0(rowHeight)
      .y1((d) => rowHeight - (d.length / maxFreq) * rowHeight * 0.8);

    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    areaPath.setAttribute('d', areaGen2(bins) || '');
    areaPath.setAttribute('fill', theme.brand);
    areaPath.setAttribute('opacity', '0.3');
    areaPath.setAttribute('transform', `translate(0,${String(y0)})`);
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
  xAxisG.setAttribute('transform', `translate(0,${String(innerH)})`);
  const xAxis = d3.axisBottom(xScale).ticks(5);
  d3.select(xAxisG).call(xAxis);
  xAxisG.querySelectorAll('text').forEach((t) => { t.setAttribute('fill', theme.textMuted); t.setAttribute('font-size', '11'); });
  xAxisG.querySelectorAll('line, path').forEach((l) => { l.setAttribute('stroke', theme.border); });
  container.appendChild(xAxisG);
});
