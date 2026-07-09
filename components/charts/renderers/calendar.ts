import * as d3 from 'd3';
import { ChartRegistry } from './registry';

/* ── 17. Calendar Heatmap ───────────────────────────────────────────── */

ChartRegistry.register('calendar', (svg, data, width, height, theme, spec) => {
  const valueField = spec.yAxis.field || 'y';
  const dateField = spec.xAxis.field || 'x';

  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(container);

  const cellSize = Math.min(15, (width - 60) / 53);
  const dayHeight = cellSize + 2;
  const colWidth = cellSize + 2;

  const dateMap = new Map(data.map((d) => [String(d[dateField]), Number(d[valueField])]));

  const year = 2025;
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const values = data.map((d) => Number(d[valueField]));
  const colorScale = d3.scaleSequential(d3.interpolateOranges)
    .domain([Math.min(...values, 0), Math.max(...values, 1)]);

  let day = start;
  while (day <= end) {
    const dateStr = day.toISOString().slice(0, 10);
    const week = d3.timeMonday(day);
    const weekIndex = Math.floor((week.getTime() - start.getTime()) / (7 * 86400000));
    const dayOfWeek = day.getDay();
    const val = dateMap.get(dateStr) || 0;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(weekIndex * colWidth + 40));
    rect.setAttribute('y', String(dayOfWeek * dayHeight + 10));
    rect.setAttribute('width', String(cellSize));
    rect.setAttribute('height', String(cellSize));
    rect.setAttribute('rx', '2');
    rect.setAttribute('fill', val > 0 ? colorScale(val) : theme.bgTertiary);
    rect.setAttribute('aria-label', `${dateStr}: ${String(val)}`);
    container.appendChild(rect);

    day = new Date(day.getTime() + 86400000);
  }

  // Month labels
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach((m, i) => {
    const monthDate = new Date(year, i, 1);
    const weekIndex = Math.floor((monthDate.getTime() - start.getTime()) / (7 * 86400000));
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(weekIndex * colWidth + 40));
    text.setAttribute('y', '8');
    text.setAttribute('fill', theme.textMuted);
    text.setAttribute('font-size', '9');
    text.setAttribute('font-family', theme.fontFamily);
    text.textContent = m;
    container.appendChild(text);
  });

  // Day labels
  ['Mon', '', 'Wed', '', 'Fri', '', ''].forEach((d, i) => {
    if (!d) return;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '38');
    text.setAttribute('y', String(i * dayHeight + 10 + cellSize / 2 + 3));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('fill', theme.textMuted);
    text.setAttribute('font-size', '9');
    text.setAttribute('font-family', theme.fontFamily);
    text.textContent = d;
    container.appendChild(text);
  });
});
