'use client';

import type { Block } from '@/utils/cms-data';

interface CalloutBlockProps {
  block: Block;
  onUpdate: (data: Record<string, unknown>) => void;
}

const CALLOUT_TYPES = [
  { value: 'info', label: 'ℹ️ Info', color: 'var(--color-blue-500)' },
  { value: 'warning', label: '⚠️ Warning', color: 'var(--color-orange-500)' },
  { value: 'danger', label: '🚨 Danger', color: 'var(--color-rose-500)' },
  { value: 'tip', label: '💡 Tip', color: 'var(--color-emerald-500)' },
];

export default function CalloutBlock({ block, onUpdate }: CalloutBlockProps) {
  const d = block.data;
  const calloutType = CALLOUT_TYPES.find((t) => t.value === d.type) || CALLOUT_TYPES[0];

  return (
    <div
      style={{
        padding: '16px',
        background: `color-mix(in srgb, ${calloutType.color} 10%, var(--color-surface-secondary))`,
        borderRadius: '8px',
        border: `1px solid color-mix(in srgb, ${calloutType.color} 30%, transparent)`,
        borderLeft: `4px solid ${calloutType.color}`,
      }}
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '16px' }}>{CALLOUT_TYPES.find((t) => t.value === d.type)?.label.split(' ')[0]}</span>
        <select
          value={(d.type as string) || 'info'}
          onChange={(e) => { onUpdate({ ...d, type: e.target.value }); }}
          style={{
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 600,
            color: calloutType.color,
            background: 'var(--color-surface-primary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        >
          {CALLOUT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <input
        value={(d.title as string) || ''}
        onChange={(e) => { onUpdate({ ...d, title: e.target.value }); }}
        placeholder="Callout title..."
        style={{
          width: '100%',
          border: 'none',
          padding: '0 0 6px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          background: 'transparent',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />

      <textarea
        value={(d.body as string) || ''}
        onChange={(e) => { onUpdate({ ...d, body: e.target.value }); }}
        placeholder="Callout body text..."
        rows={3}
        style={{
          width: '100%',
          border: 'none',
          padding: '0',
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          background: 'transparent',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: 1.5,
        }}
      />
    </div>
  );
}
