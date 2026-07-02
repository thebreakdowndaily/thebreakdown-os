'use client';

import type { Block } from '@/utils/cms-data';

interface QuoteBlockProps {
  block: Block;
  onUpdate: (data: Record<string, any>) => void;
}

export default function QuoteBlock({ block, onUpdate }: QuoteBlockProps) {
  const d = block.data;

  return (
    <div
      style={{
        padding: '20px',
        background: 'var(--color-surface-secondary)',
        borderRadius: '8px',
        border: '1px solid var(--color-border-subtle)',
        borderLeft: '4px solid var(--color-amber-500)',
      }}
    >
      <div
        style={{
          fontSize: '28px',
          color: 'var(--color-amber-500)',
          lineHeight: 0.6,
          marginBottom: '8px',
          opacity: 0.5,
        }}
      >
        &ldquo;
      </div>

      <textarea
        value={d.text || ''}
        onChange={(e) => onUpdate({ ...d, text: e.target.value })}
        placeholder="The quote text..."
        rows={3}
        style={{
          width: '100%',
          border: 'none',
          borderRadius: '0',
          padding: '0',
          fontSize: '16px',
          fontWeight: 500,
          fontStyle: 'italic',
          lineHeight: 1.6,
          color: 'var(--color-text-primary)',
          background: 'transparent',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border-subtle)',
        }}
      >
        <input
          value={d.speaker || ''}
          onChange={(e) => onUpdate({ ...d, speaker: e.target.value })}
          placeholder="Speaker name"
          style={{
            flex: 1,
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            padding: '7px 10px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            background: 'var(--color-surface-primary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <input
          value={d.context || ''}
          onChange={(e) => onUpdate({ ...d, context: e.target.value })}
          placeholder="Context (e.g., during press conference)"
          style={{
            flex: 1,
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            padding: '7px 10px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-primary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>
    </div>
  );
}
