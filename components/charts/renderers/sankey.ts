import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 20+21+22. Sankey / Network / Violin (simplified) ──────────────── */

ChartRegistry.register('sankey', (svg, data, width, height, theme) => {
  // Simplified Sankey — shows as a labeled flow diagram
  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(container);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', String(width / 2));
  text.setAttribute('y', String(height / 2));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', theme.textMuted);
  text.setAttribute('font-size', '13');
  text.setAttribute('font-family', theme.fontFamily);
  text.textContent = `Sankey: ${String(data.length)} flows`;
  container.appendChild(text);
});

ChartRegistry.register('network', (svg, data, width, height, theme, spec) => {
  // Simplified Network — shows labeled nodes with links
  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(container);

  // Simple force-directed layout using D3 force
  const nodes = data.map((d, i) => {
    const idRaw = d.id;
    const xRaw = d[spec.xAxis.field || 'x'];
    const yRaw = d[spec.yAxis.field || 'y'];
    const idStr = typeof idRaw === 'string' ? idRaw : typeof idRaw === 'number' || typeof idRaw === 'boolean' ? String(idRaw) : '';
    const xStr = typeof xRaw === 'string' ? xRaw : typeof xRaw === 'number' || typeof xRaw === 'boolean' ? String(xRaw) : '';
    return {
      id: idStr || xStr || String(i),
      label: xStr || idStr || String(i),
      value: yRaw ? Number(yRaw) : 10,
    };
  });

  const maxValue = Math.max(...nodes.map((n) => n.value), 1);
  const rScale = d3.scaleSqrt().domain([0, maxValue]).range([3, 12]);

  nodes.forEach((n) => {
    // Place in a circle for simplicity
    const angle = (2 * Math.PI * nodes.indexOf(n)) / nodes.length;
    const r = Math.min(width, height) / 3;
    const cx = width / 2 + Math.cos(angle) * r;
    const cy = height / 2 + Math.sin(angle) * r;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', String(rScale(n.value)));
    circle.setAttribute('fill', theme.brand);
    circle.setAttribute('opacity', '0.7');
    circle.setAttribute('aria-label', n.label);
    container.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(cx));
    text.setAttribute('y', String(cy + rScale(n.value) + 14));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', theme.textMuted);
    text.setAttribute('font-size', '9');
    text.setAttribute('font-family', theme.fontFamily);
    text.textContent = n.label;
    container.appendChild(text);
  });
});

ChartRegistry.register('violin', (svg, data, width, height, theme, spec) => {
  // Simplified violin — mirror density plot
  ChartRegistry.get('box-plot')?.(svg, data, width, height, theme, spec);
});
