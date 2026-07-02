'use client';

import type { Block } from '@/utils/cms-data';

interface BlockToolbarProps {
  block: Block;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleCollapse: () => void;
  dragHandlers: {
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    draggable: boolean;
  };
}

export default function BlockToolbar({
  block,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onToggleCollapse,
  dragHandlers,
}: BlockToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 0',
        userSelect: 'none',
      }}
    >
      {/* Drag handle */}
      <div
        {...dragHandlers}
        style={{
          cursor: 'grab',
          padding: '4px',
          color: 'var(--color-text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '4px',
          opacity: 0.5,
        }}
        title="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="19" r="1.5" />
        </svg>
      </div>

      {/* Position indicator */}
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--color-text-tertiary)',
          fontFamily: 'var(--font-mono)',
          minWidth: '32px',
        }}
      >
        {index + 1}/{total}
      </span>

      {/* Move up */}
      <button
        onClick={onMoveUp}
        disabled={index === 0}
        style={{
          background: 'none',
          border: 'none',
          color: index === 0 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
          cursor: index === 0 ? 'not-allowed' : 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          opacity: index === 0 ? 0.3 : 0.7,
        }}
        title="Move up"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
      </button>

      {/* Move down */}
      <button
        onClick={onMoveDown}
        disabled={index === total - 1}
        style={{
          background: 'none',
          border: 'none',
          color: index === total - 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
          cursor: index === total - 1 ? 'not-allowed' : 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          opacity: index === total - 1 ? 0.3 : 0.7,
        }}
        title="Move down"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      <div style={{ flex: 1 }} />

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-tertiary)',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          opacity: 0.5,
        }}
        title={block.collapsed ? 'Expand' : 'Collapse'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {block.collapsed
            ? <><path d="m9 18 6-6-6-6"/></>
            : <><path d="m6 9 6 6 6-6"/></>
          }
        </svg>
      </button>

      {/* Duplicate */}
      <button
        onClick={onDuplicate}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-tertiary)',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          opacity: 0.5,
        }}
        title="Duplicate block"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-tertiary)',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          opacity: 0.4,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-rose-500)'; e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.opacity = '0.4'; }}
        title="Delete block"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </div>
  );
}
