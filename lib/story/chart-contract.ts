/**
 * Canonical reader chart-block contract.
 *
 * New blocks use `type`, `xKey`, and `yKey`. The adapter accepts the existing
 * CMS `chartType` / `label` / `value` shape so already-authored content keeps
 * rendering while malformed data is safely omitted by BlockRenderer.
 */
export interface CanonicalStructuredChartBlockData {
  chartId: string;
  type: 'bar' | 'line';
  title: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
}

export interface CanonicalSvgChartBlockData {
  chartId: string;
  type: 'svg';
  chartType: string;
  title: string;
  caption?: string;
  url: string;
  altText?: string;
  credit?: string;
  dataSource?: string;
  status?: string;
}

export type CanonicalChartBlockData = CanonicalStructuredChartBlockData | CanonicalSvgChartBlockData;

export function normalizeChartBlockData(raw: unknown): CanonicalChartBlockData | null {
  if (!raw || typeof raw !== 'object') return null;
  const input = raw as Record<string, unknown>;

  // 1. Structured data path: requires valid array data with numeric yKey values
  const structuredType = input.type ?? input.chartType;
  if ((structuredType === 'bar' || structuredType === 'line') && Array.isArray(input.data) && input.data.length > 0) {
    if (input.data.every((row) => row && typeof row === 'object')) {
      const xKey = typeof input.xKey === 'string' && input.xKey ? input.xKey : 'label';
      const yKey = typeof input.yKey === 'string' && input.yKey ? input.yKey : 'value';
      const hasRequiredValues = input.data.every((row) => {
        const record = row as Record<string, unknown>;
        return record[xKey] !== undefined && Number.isFinite(Number(record[yKey]));
      });
      if (hasRequiredValues) {
        return {
          chartId: typeof input.chartId === 'string' && input.chartId ? input.chartId : 'chart',
          type: structuredType,
          title: typeof input.title === 'string' && input.title ? input.title : 'Data visualization',
          data: input.data as Array<Record<string, unknown>>,
          xKey,
          yKey,
        };
      }
    }
  }

  // 2. Authored SVG / image chart path: detects valid image URL
  const url = typeof input.url === 'string' ? input.url.trim() : '';
  if (url.length > 0) {
    const rawChartType = input.chartType ?? input.type;
    const chartType = typeof rawChartType === 'string' && rawChartType.trim() ? rawChartType.trim() : 'chart';
    const title = typeof input.title === 'string' && input.title.trim() ? input.title.trim() : 'Data visualization';

    return {
      chartId: typeof input.chartId === 'string' && input.chartId ? input.chartId : (typeof input.id === 'string' ? input.id : 'chart'),
      type: 'svg',
      chartType,
      title,
      caption: typeof input.caption === 'string' ? input.caption : undefined,
      url,
      altText: typeof input.altText === 'string' ? input.altText : title,
      credit: typeof input.credit === 'string' ? input.credit : undefined,
      dataSource: typeof input.dataSource === 'string' ? input.dataSource : undefined,
      status: typeof input.status === 'string' ? input.status : undefined,
    };
  }

  return null;
}

