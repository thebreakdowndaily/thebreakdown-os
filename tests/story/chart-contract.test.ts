import { describe, expect, test } from 'vitest';
import { normalizeChartBlockData } from '../../lib/story/chart-contract';

describe('canonical chart block contract', () => {
  test('adapts the existing CMS chart shape', () => {
    expect(normalizeChartBlockData({
      chartType: 'bar',
      title: 'Coverage',
      data: [{ label: '2025', value: 12 }],
    })).toEqual({
      chartId: 'chart',
      type: 'bar',
      title: 'Coverage',
      data: [{ label: '2025', value: 12 }],
      xKey: 'label',
      yKey: 'value',
    });
  });

  test('rejects malformed or unsupported chart data safely', () => {
    expect(normalizeChartBlockData({ chartType: 'pie', data: [{ label: 'A', value: 1 }] })).toBeNull();
    expect(normalizeChartBlockData({ type: 'line', data: [{ label: 'A', value: 'not-a-number' }] })).toBeNull();
    expect(normalizeChartBlockData({ type: 'bar', data: [] })).toBeNull();
    expect(normalizeChartBlockData({ type: 'bar', data: [{ label: 'A' }] })).toBeNull();
    expect(normalizeChartBlockData(undefined)).toBeNull();
    expect(normalizeChartBlockData(null)).toBeNull();
  });

  test('preserves custom xKey and yKey when present and valid', () => {
    expect(normalizeChartBlockData({
      chartId: 'growth-chart',
      type: 'line',
      title: 'GDP Growth',
      data: [{ year: '2024', gdp: 7.2 }, { year: '2025', gdp: 6.8 }],
      xKey: 'year',
      yKey: 'gdp',
    })).toEqual({
      chartId: 'growth-chart',
      type: 'line',
      title: 'GDP Growth',
      data: [{ year: '2024', gdp: 7.2 }, { year: '2025', gdp: 6.8 }],
      xKey: 'year',
      yKey: 'gdp',
    });
  });

  test('detects authored SVG/image chart and extracts canonical SVG chart shape', () => {
    expect(normalizeChartBlockData({
      chartType: 'bar',
      title: 'Casualties of Partition — death toll estimates by source',
      caption: 'Death toll estimates from official, press, and scholarly sources.',
      url: '/images/library/chapter-1/charts/chart-death-toll-estimates.svg',
      dataSource: 'Scholarly aggregates',
      credit: 'Synthesis of cited estimates',
      status: 'recreated',
    })).toEqual({
      chartId: 'chart',
      type: 'svg',
      chartType: 'bar',
      title: 'Casualties of Partition — death toll estimates by source',
      caption: 'Death toll estimates from official, press, and scholarly sources.',
      url: '/images/library/chapter-1/charts/chart-death-toll-estimates.svg',
      altText: 'Casualties of Partition — death toll estimates by source',
      dataSource: 'Scholarly aggregates',
      credit: 'Synthesis of cited estimates',
      status: 'recreated',
    });
  });

  test('supports existing authored comparison charts with SVG URLs', () => {
    expect(normalizeChartBlockData({
      id: 'b-vis-chart-5',
      chartType: 'comparison',
      title: 'India-Pakistan military balance, 1947',
      caption: 'Comparison of manpower, equipment, and budgets at Partition.',
      url: '/images/library/chapter-1/charts/chart-military-balance-1947.svg',
      dataSource: 'Auchinleck partition committee; Raghavan; Cohen',
    })).toEqual({
      chartId: 'b-vis-chart-5',
      type: 'svg',
      chartType: 'comparison',
      title: 'India-Pakistan military balance, 1947',
      caption: 'Comparison of manpower, equipment, and budgets at Partition.',
      url: '/images/library/chapter-1/charts/chart-military-balance-1947.svg',
      altText: 'India-Pakistan military balance, 1947',
      dataSource: 'Auchinleck partition committee; Raghavan; Cohen',
      credit: undefined,
      status: undefined,
    });
  });

  test('rejects empty or whitespace-only SVG URLs safely', () => {
    expect(normalizeChartBlockData({ chartType: 'bar', url: '' })).toBeNull();
    expect(normalizeChartBlockData({ chartType: 'comparison', url: '   ' })).toBeNull();
  });

  test('supports all authored chart types with SVG URLs: combined, timeline, stacked-bar, pie, and line', () => {
    const types = ['combined', 'timeline', 'stacked-bar', 'pie', 'line'];
    for (const t of types) {
      const res = normalizeChartBlockData({
        chartType: t,
        title: `Chart ${t}`,
        url: `/images/library/charts/chart-${t}.svg`,
      });
      expect(res).not.toBeNull();
      expect(res?.type).toBe('svg');
      if (res?.type === 'svg') {
        expect(res.chartType).toBe(t);
        expect(res.url).toBe(`/images/library/charts/chart-${t}.svg`);
      }
    }
  });

  test('preserves structured chart shape contract strictly without svg contamination', () => {
    const structured = normalizeChartBlockData({
      chartType: 'bar',
      title: 'GDP Data',
      data: [{ label: 'Q1', value: 100 }],
    });
    expect(structured).toEqual({
      chartId: 'chart',
      type: 'bar',
      title: 'GDP Data',
      data: [{ label: 'Q1', value: 100 }],
      xKey: 'label',
      yKey: 'value',
    });
    // Ensure no svg fields leak into structured chart contract
    expect((structured as any).url).toBeUndefined();
    expect((structured as any).chartType).toBeUndefined();
  });
});


