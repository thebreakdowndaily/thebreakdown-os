'use client';

import { memo } from 'react';
import type { ViewportState } from '../types';

interface GraphToolbarProps {
  viewport: ViewportState;
  searchQuery: string;
  onSearch: (q: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
  mini?: boolean;
}

export const GraphToolbar = memo(function GraphToolbar({
  viewport, searchQuery, onSearch, onZoomIn, onZoomOut, onReset, onFit, mini,
}: GraphToolbarProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
      padding: 'var(--spacing-2) var(--spacing-3)',
      background: 'var(--color-bg-secondary)',
      borderBottom: '1px solid var(--color-border-default)',
      flexWrap: 'wrap',
    }}>
      {!mini && (
        <div style={{ position: 'relative', flex: 1, minWidth: 160, maxWidth: 280 }}>
          <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-text-muted)', pointerEvents: 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { onSearch(e.target.value); }}
            placeholder="Search nodes..."
            style={{
              width: '100%', padding: 'var(--spacing-1-5) var(--spacing-2) var(--spacing-1-5) 28px',
              background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)',
              fontSize: '12px', outline: 'none',
            }}
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: 'var(--spacing-1)', marginLeft: 'auto' }}>
        <ToolbarButton label="Zoom In" onClick={onZoomIn} symbol="+" />
        <ToolbarButton label="Zoom Out" onClick={onZoomOut} symbol="−" />
        <ToolbarButton label="Reset View" onClick={onReset} symbol="⟲" />
        {!mini && <ToolbarButton label="Fit to Screen" onClick={onFit} symbol="⤡" />}
        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '0 var(--spacing-1)' }}>
          {Math.round(viewport.scale * 100)}%
        </span>
      </div>
    </div>
  );
});

function ToolbarButton({ label, onClick, symbol }: { label: string; onClick: () => void; symbol: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)', cursor: 'pointer',
        color: 'var(--color-text-secondary)', fontSize: '14px',
      }}
    >
      {symbol}
    </button>
  );
}
