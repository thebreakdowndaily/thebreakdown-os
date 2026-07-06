'use client';

import { memo } from 'react';
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS, NODE_TYPE_ICONS } from '../types';

export const GraphLegend = memo(function GraphLegend() {
  const types = Object.entries(NODE_TYPE_LABELS);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
      {types.map(([type, label]) => (
        <span key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-1)', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: NODE_TYPE_COLORS[type] || '#6B7280' }} />
          {NODE_TYPE_ICONS[type] && <span>{NODE_TYPE_ICONS[type]}</span>}
          {label}
        </span>
      ))}
    </div>
  );
});
