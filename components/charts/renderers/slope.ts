import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 13. Slope Chart ────────────────────────────────────────────────── */

ChartRegistry.register('slope', (svg, data, width, height, theme, spec) => {
  const margin = { top: 30, right: 100, bottom: 30, left: 100 };
  const innerW = width - margin.left - margin.right;

  const xField = spec.xAxis.field || 'x';
  const yField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  container.setAttribute('transform', `translate(${String(margin.left)},${String(margin.top)})`);
  svg.appendChild(container);

  // Group data by label (each item has start/end values)
  // Expects data like: [{category:"A", start:10, end:20}, ...]
  const allValues = data.flatMap((d) => [Number(d.start) || 0, Number(d[yField]) || 0]);
  const yMin = Math.min(...allValues, 0);
  const yMax = Math.max(...allValues, 0);

  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height - margin.top - margin.bottom, 0]);
  const xScale = d3.scalePoint().domain(['start', 'end']).range([0, innerW]);

  data.forEach((d) => {
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
    startText.textContent = `${String(d[xField])}: ${String(startVal)}`;
    container.appendChild(startText);

    // End label
    const endText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    endText.setAttribute('x', String(x2 + 8));
    endText.setAttribute('y', String(y2));
    endText.setAttribute('text-anchor', 'start');
    endText.setAttribute('dominant-baseline', 'middle');
    endText.setAttribute('fill', theme.textMuted);
    endText.setAttribute('font-size', '10');
    endText.textContent = `${String(d[xField])}: ${String(endVal)}`;
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
});
