
import { ChartRegistry } from './registry';

/* ── 4. Area Chart ──────────────────────────────────────────────────── */

ChartRegistry.register('area', (svg, data, width, height, theme, spec) => {
  // Area is same as line but with more prominent fill
  ChartRegistry.get('line')?.(svg, data, width, height, theme, spec);

  // Override the area opacity to be more visible
  const areaPath = svg.querySelector('path[opacity="0.08"]');
  if (areaPath) {
    areaPath.setAttribute('opacity', '0.2');
  }
});
