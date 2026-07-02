'use client';

import { BLOCK_META, type BlockType } from '@/utils/cms-data';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
  storyBlockCount: number;
}

const BLOCK_CATEGORIES: { label: string; types: BlockType[] }[] = [
  {
    label: 'Core',
    types: ['hero', 'text', 'image', 'quote', 'callout'],
  },
  {
    label: 'Data',
    types: ['chart', 'statistics', 'evidence', 'table'],
  },
  {
    label: 'Structure',
    types: ['timeline', 'faq', 'sources'],
  },
];

export default function BlockPalette({ onAddBlock, storyBlockCount }: BlockPaletteProps) {
  return (
    <div
      style={{
        width: '240px',
        background: 'var(--color-surface-elevated)',
        borderLeft: '1px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <h3
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          Add Block
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '4px 0 0 0' }}>
          Click to add after the last block
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {BLOCK_CATEGORIES.map((cat) => (
          <div key={cat.label} style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '6px',
                padding: '0 4px',
              }}
            >
              {cat.label}
            </div>
            {cat.types.map((type) => {
              const meta = BLOCK_META[type];
              return (
                <button
                  key={type}
                  onClick={() => { onAddBlock(type); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-text-primary)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'left',
                    transition: 'all 0.12s',
                    marginBottom: '2px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-secondary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{meta.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500 }}>{meta.label}</div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: 'var(--color-text-tertiary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {meta.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Block count */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border-subtle)',
          fontSize: '11px',
          color: 'var(--color-text-tertiary)',
          textAlign: 'center',
        }}
      >
        {storyBlockCount} block{storyBlockCount !== 1 ? 's' : ''} in story
      </div>
    </div>
  );
}
