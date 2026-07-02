'use client';

import type { Block } from '@/utils/cms-data';

interface FAQBlockProps {
  block: Block;
  onUpdate: (data: Record<string, any>) => void;
}

export default function FAQBlock({ block, onUpdate }: FAQBlockProps) {
  const items: Array<{ question: string; answer: string }> = block.data.items || [];

  const updateItem = (idx: number, field: string, value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: value };
    onUpdate({ ...block.data, items: next });
  };

  const addItem = () => onUpdate({ ...block.data, items: [...items, { question: '', answer: '' }] });
  const removeItem = (idx: number) => onUpdate({ ...block.data, items: items.filter((_, i) => i !== idx) });

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
        ❓ Frequently Asked Questions
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '12px',
              background: 'var(--color-surface-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--color-border-subtle)',
              position: 'relative',
            }}
          >
            <input
              value={item.question}
              onChange={(e) => updateItem(i, 'question', e.target.value)}
              placeholder="Question..."
              style={{
                width: '100%',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                background: 'var(--color-surface-primary)',
                outline: 'none',
                marginBottom: '6px',
                fontFamily: 'inherit',
              }}
            />
            <textarea
              value={item.answer}
              onChange={(e) => updateItem(i, 'answer', e.target.value)}
              placeholder="Answer..."
              rows={3}
              style={{
                width: '100%',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                background: 'var(--color-surface-primary)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
            />
            {items.length > 1 && (
              <button
                onClick={() => removeItem(i)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  opacity: 0.4,
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

      <button
        onClick={addItem}
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
        + Add FAQ Item
      </button>
    </div>
  );
}
