'use client';

import type { Block } from '@/utils/cms-data';

interface ChartBlockProps {
  block: Block;
  onUpdate: (data: Record<string, unknown>) => void;
}

const CHART_TYPES = ['bar', 'line', 'pie', 'area', 'scatter', 'radar', 'heatmap', 'treemap'];

export default function ChartBlock({ block, onUpdate }: ChartBlockProps) {
  const d = block.data;
  const dataPoints: Array<{ label: string; value: number }> = (d.data as Array<{ label: string; value: number }> | undefined) ?? [];

  const updateMeta = (field: string, value: string) => { onUpdate({ ...d, [field]: value }); };

  const updateDataPoint = (idx: number, field: string, value: string) => {
    const next = [...dataPoints];
    next[idx] = { ...next[idx], [field]: field === 'value' ? parseFloat(value) || 0 : value };
    onUpdate({ ...d, data: next });
  };

  const addDataPoint = () => { onUpdate({ ...d, data: [...dataPoints, { label: '', value: 0 }] }); };

  const removeDataPoint = (idx: number) => { onUpdate({ ...d, data: dataPoints.filter((_, i) => i !== idx) }); };

  return (
    <div>
      <div style={{ marginBottom: '14px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
          Chart Title
        </label>
        <input
          value={(d.title as string) || ''}
          onChange={(e) => { updateMeta('title', e.target.value); }}
          placeholder="Chart title..."
          style={{
            width: '100%',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            background: 'var(--color-surface-secondary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
          Chart Type
        </label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CHART_TYPES.map((ct) => (
            <button
              key={ct}
              onClick={() => { updateMeta('chartType', ct); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border-subtle)',
                background: d.chartType === ct ? 'var(--color-amber-500)' : 'var(--color-surface-secondary)',
                color: d.chartType === ct ? '#000' : 'var(--color-text-secondary)',
                fontSize: '11px',
                fontWeight: d.chartType === ct ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontFamily: 'inherit',
              }}
            >
              {ct}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Data Points
          </label>
          <button
            onClick={addDataPoint}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-amber-500)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            + Add
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {dataPoints.map((dp, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                value={dp.label}
                onChange={(e) => { updateDataPoint(i, 'label', e.target.value); }}
                placeholder="Label"
                style={{
                  flex: 1,
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-surface-secondary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <input
                type="number"
                value={dp.value}
                onChange={(e) => { updateDataPoint(i, 'value', e.target.value); }}
                placeholder="Value"
                style={{
                  width: '80px',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-surface-secondary)',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'right',
                }}
              />
              {dataPoints.length > 1 && (
                <button
                  onClick={() => { removeDataPoint(i); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    opacity: 0.4,
                    padding: '4px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-rose-500)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.opacity = '0.4'; }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '3px' }}>
          Caption
        </label>
        <input
          value={(d.caption as string) || ''}
          onChange={(e) => { updateMeta('caption', e.target.value); }}
          placeholder="Source attribution for the chart data..."
          style={{
            width: '100%',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            padding: '7px 10px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-secondary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>
    </div>
  );
}
