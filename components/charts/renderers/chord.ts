import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 19. Chord Diagram ──────────────────────────────────────────────── */

ChartRegistry.register('chord', (svg, data, width, height, theme, spec) => {
  // Expects matrix data: [{source: "A", target: "B", value: 10}]
  const valueField = spec.yAxis.field || 'y';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const cx = width / 2;
  const cy = height / 2;
  container.setAttribute('transform', `translate(${String(cx)},${String(cy)})`);
  svg.appendChild(container);

  // Build matrix
  const names = [...new Set(data.flatMap((d) => [String(d.source || d[spec.xAxis.field || 'x']), String(d.target || d[spec.yAxis.field || 'y'])]))];
  const n = names.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(0));
  const nameIndex = new Map(names.map((name, i) => [name, i]));

  data.forEach((d) => {
    const s = nameIndex.get(String(d.source || d[spec.xAxis.field || 'x']));
    const t = nameIndex.get(String(d.target || d[spec.yAxis.field || 'y']));
    if (s !== undefined && t !== undefined) {
      matrix[s][t] = Number(d[valueField]);
    }
  });

  const chordLayout = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);
  const chords = chordLayout(matrix);

  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(names);

  // Ribbons
  chords.groups.forEach((group) => {
    const arcGen = d3.arc()
      .innerRadius(Math.min(cx, cy) * 0.7)
      .outerRadius(Math.min(cx, cy) * 0.8);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', arcGen(group as unknown as d3.DefaultArcObject) || '');
    path.setAttribute('fill', color(names[group.index]));
    path.setAttribute('opacity', '0.7');
    path.setAttribute('stroke', theme.bg);
    path.setAttribute('aria-label', names[group.index]);
    container.appendChild(path);
  });

  // Labels
  chords.groups.forEach((group) => {
    const angle = (group.startAngle + group.endAngle) / 2;
    const r = Math.min(cx, cy) * 0.85;
    const x = Math.cos(angle - Math.PI / 2) * r;
    const y = Math.sin(angle - Math.PI / 2) * r;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', theme.textSecondary);
    text.setAttribute('font-size', '9');
    text.setAttribute('font-family', theme.fontFamily);
    text.textContent = names[group.index];
    container.appendChild(text);
  });
});
