'use client';

import type { Block } from '@/utils/cms-data';

interface StatisticsBlockProps {
  block: Block;
  onUpdate: (data: Record<string, any>) => void;
}

export default function StatisticsBlock({ block, onUpdate }: StatisticsBlockProps) {
  const stats: Array<{ value: string; label: string; change: string; direction: 'up' | 'down' }> = block.data.stats || [];

  const updateStat = (idx: number, field: string, value: any) => {
    const next = [...stats];
    next[idx] = { ...next[idx], [field]: value };
    onUpdate({ ...block.data, stats: next });
  };

  const addStat = () => onUpdate({ ...block.data, stats: [...stats, { value: '', label: '', change: '', direction: 'up' }] });
  const removeStat = (idx: number) => onUpdate({ ...block.data, stats: stats.filter((_, i) => i !== idx) });

  return (
    <div>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '10px',
        }}
      >
        🔢 Key Statistics
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '14px',
              background: 'var(--color-surface-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--color-border-subtle)',
              position: 'relative',
            }}
          >
            <input
              value={stat.value}
              onChange={(e) => updateStat(i, 'value', e.target.value)}
              placeholder="e.g. 6.50%"
              style={{
                width: '100%',
                border: 'none',
                padding: '0 0 4px 0',
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--color-amber-500)',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
              }}
            />
            <input
              value={stat.label}
              onChange={(e) => updateStat(i, 'label', e.target.value)}
              placeholder="Label"
              style={{
                width: '100%',
                border: 'none',
                padding: '0 0 4px 0',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={stat.direction}
                onChange={(e) => updateStat(i, 'direction', e.target.value)}
                style={{
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  color: stat.direction === 'up' ? 'var(--color-emerald-500)' : 'var(--color-rose-500)',
                  background: 'var(--color-surface-primary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                }}
              >
                <option value="up">▲ Up</option>
                <option value="down">▼ Down</option>
              </select>
              <input
                value={stat.change}
                onChange={(e) => updateStat(i, 'change', e.target.value)}
                placeholder="e.g. +0.1pp"
                style={{
                  flex: 1,
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  color: 'var(--color-text-secondary)',
                  background: 'var(--color-surface-primary)',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                }}
              />
              {stats.length > 1 && (
                <button onClick={() => removeStat(i)} style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: '12px', opacity: 0.4, padding: '2px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-rose-500)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.opacity = '0.4'; }}
                >✕</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addStat}
        style={{
          marginTop: '8px',
          width: '100%',
          padding: '8px',
          border: '1px dashed var(--color-border-subtle)',
          borderRadius: '8px',
          background: 'none',
          color: 'var(--color-text-tertiary)',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-amber-500)'; e.currentTarget.style.color = 'var(--color-amber-500)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
      >
        + Add Statistic
      </button>
    </div>
  );
}
