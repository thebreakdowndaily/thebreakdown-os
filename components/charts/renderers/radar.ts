import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 12. Radar Chart ────────────────────────────────────────────────── */

ChartRegistry.register('radar', (svg, data, width, height, theme, spec) => {
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
  container.setAttribute('transform', `translate(${String(margin.left + centerX)},${String(margin.top + centerY)})`);
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
    return `${String(Math.cos(angle) * r)},${String(Math.sin(angle) * r)}`;
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
});
