import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 16. Sunburst ───────────────────────────────────────────────────── */

ChartRegistry.register('sunburst', (svg, data, width, height, theme, spec) => {
  // Simple sunburst — expects hierarchical data with {id, parentId, value}
  const valueField = spec.yAxis.field || 'y';

  // Build hierarchy from flat data
  const rootItem = data.find((d) => !d.parentId) ?? data[0];
  const rootId = String(rootItem.id);
  if (!rootId) return;

  const buildChildren = (parentId: string): Record<string, unknown>[] => {
    return data
      .filter((d) => String(d.parentId) === parentId)
      .map((d) => ({
        ...d,
        children: buildChildren(String(d.id)),
      }));
  };

  const found = data.find((d) => String(d.id) === rootId);
  const root = {
    id: rootId,
    name: found ? String(found[spec.xAxis.field || 'x']) : '',
    children: buildChildren(rootId),
  };

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const cx = width / 2;
  const cy = height / 2;
  container.setAttribute('transform', `translate(${String(cx)},${String(cy)})`);
  svg.appendChild(container);

  const partition = d3.partition<Record<string, unknown>>().size([2 * Math.PI, Math.min(width, height) / 2]);
  const hierRoot = d3.hierarchy<Record<string, unknown>>(root)
    .sum((d) => {
      const nodeData = d.data as Record<string, unknown>;
      return typeof nodeData[valueField] === 'number' ? nodeData[valueField] : Number(nodeData[valueField]) || 0;
    })
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  partition(hierRoot);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  hierRoot.descendants().forEach((_node) => {
    const node = _node as d3.HierarchyNode<Record<string, unknown>> & { x0: number; y0: number; x1: number; y1: number };
    if (node.depth === 0) return;
    const arc = d3.arc<d3.DefaultArcObject>()
      .startAngle(node.x0)
      .endAngle(node.x1)
      .innerRadius(node.y0)
      .outerRadius(node.y1);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', arc(node as unknown as d3.DefaultArcObject) || '');
    path.setAttribute('fill', color(String(node.data.name || node.data.id)));
    path.setAttribute('stroke', theme.bg);
    path.setAttribute('stroke-width', '1');
    path.setAttribute('aria-label', `${String(node.data.name || node.data.id)}: ${String(node.value)}`);
    container.appendChild(path);
  });
});
