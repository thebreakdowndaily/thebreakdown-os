import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 15. Treemap ────────────────────────────────────────────────────── */

ChartRegistry.register('treemap', (svg, data, width, height, theme, spec) => {
  const yField = spec.yAxis.field || 'y';
  const xField = spec.xAxis.field || 'x';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(container);

  const root = d3.hierarchy<Record<string, unknown>>({ children: data })
    .sum((d) => {
      const nodeData = d.data as Record<string, unknown>;
      return typeof nodeData[yField] === 'number' ? nodeData[yField] : Number(nodeData[yField]) || 0;
    })
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const treemapLayout = d3.treemap<Record<string, unknown>>().size([width, height]).padding(2);
  treemapLayout(root);

  const maxVal = Math.max(...data.map((d) => Number(d[yField])), 1);
  const colorScale = d3.scaleSequential(d3.interpolateOranges)
    .domain([0, maxVal]);

  root.leaves().forEach((_node) => {
    const node = _node as d3.HierarchyNode<Record<string, unknown>> & { x0: number; y0: number; x1: number; y1: number };
    const d = node.data;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(node.x0));
    rect.setAttribute('y', String(node.y0));
    rect.setAttribute('width', String(Math.max(1, node.x1 - node.x0)));
    rect.setAttribute('height', String(Math.max(1, node.y1 - node.y0)));
    rect.setAttribute('fill', colorScale(Number(d[yField])));
    rect.setAttribute('rx', '2');
    rect.setAttribute('aria-label', `${String(d[xField])}: ${String(d[yField])}`);
    container.appendChild(rect);

    if ((node.x1 - node.x0) > 40 && (node.y1 - node.y0) > 20) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String((node.x0 + node.x1) / 2));
      text.setAttribute('y', String((node.y0 + node.y1) / 2));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', '#fff');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-family', theme.fontFamily);
      text.textContent = String(d[xField]);
      container.appendChild(text);
    }
  });
});
