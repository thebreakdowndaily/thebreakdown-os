'use client';

import { memo } from 'react';
import { NODE_TYPE_LABELS, NODE_TYPE_COLORS } from '../types';
import type { GraphFilterState } from '../types';

interface GraphFiltersProps {
  filters: GraphFilterState;
  onToggle: (type: keyof GraphFilterState) => void;
}

export const GraphFilters = memo(function GraphFilters({ filters, onToggle }: GraphFiltersProps) {
  const entries = Object.entries(NODE_TYPE_LABELS) as Array<[keyof GraphFilterState, string]>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1-5)' }}>
      {entries.map(([type, label]) => (
        <button
          key={type}
          onClick={() => { onToggle(type); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-1)',
            padding: 'var(--spacing-1) var(--spacing-2)',
            fontSize: '11px', fontWeight: 500,
            background: filters[type] ? 'color-mix(in srgb, ' + (NODE_TYPE_COLORS[type] || '#6B7280') + ' 15%, transparent)' : 'var(--color-bg-secondary)',
            color: filters[type] ? (NODE_TYPE_COLORS[type] || '#A1A1AA') : 'var(--color-text-muted)',
            border: '1px solid', borderColor: filters[type] ? (NODE_TYPE_COLORS[type] || '#2A2A2A') : 'var(--color-border-default)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            transition: 'all 0.15s', opacity: filters[type] ? 1 : 0.5,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: NODE_TYPE_COLORS[type] || '#6B7280' }} />
          {label}
        </button>
      ))}
    </div>
  );
});
