import React from 'react';
import type { ChartDef } from '@/types/canonical';
import ChartRenderer from '@/components/charts/ChartRenderer';

interface ChartsProps {
  charts: ChartDef[];
}

/**
 * Convert ChartDef (Story format) to ChartSpec (VisualPlan format).
 * ChartRenderer expects ChartSpec; Charts.tsx bridges the two data models.
 */
function chartDefToSpec(def: ChartDef, index: number) {
  // Encode the raw data array as JSON in source for ChartRenderer to parse
  const encodedData = def.data.length > 0 ? JSON.stringify(def.data) : '';

  return {
    chartId: `chart-${String(index)}-${def.type}`,
    type: (def.type || def.chartType) as any,
    purpose: def.title || 'Data visualization',
    question: def.description,
    xAxis: {
      label: def.xKey || 'X',
      field: def.xKey || 'x',
      type: 'category' as const,
    },
    yAxis: {
      label: def.yKey || 'Y',
      field: def.yKey || 'y',
      type: 'numeric' as const,
    },
    dataset: {
      source: encodedData,
      fields: def.data.length > 0 ? Object.keys(def.data[0]) : [],
      transformations: [],
    },
    colorField: def.color,
    interactive: false,
    caption: def.title || '',
    altText: `${def.type} chart showing ${def.title || 'data'}`,
    sortOrder: 'none' as const,
    zeroBaseline: true,
    responsive: true,
    lazyLoad: true,
  };
}

const Charts: React.FC<ChartsProps> = ({ charts }) => {
  if (charts.length === 0) return null;

  return (
    <section aria-label="Charts and visualizations" style={{
      width: '100%',
      maxWidth: 'var(--max-width-content)',
      margin: '0 auto',
      padding: 'var(--spacing-8) var(--spacing-4)',
    }}>
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-6)',
      }}>
        Charts &amp; Visualizations
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-6)',
      }}>
        {charts.map((chart, i) => (
          <ChartRenderer
            key={`chart-${String(i)}`}
            chart={chartDefToSpec(chart, i)}
          />
        ))}
      </div>
    </section>
  );
};

export default Charts;
