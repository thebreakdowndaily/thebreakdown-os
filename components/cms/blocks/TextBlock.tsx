'use client';

import { useRef, useCallback } from 'react';
import type { Block } from '@/utils/cms-data';

interface TextBlockProps {
  block: Block;
  onUpdate: (data: Record<string, unknown>) => void;
}

const FORMAT_BUTTONS = [
  { label: 'B', tag: 'b', title: 'Bold' },
  { label: 'I', tag: 'i', title: 'Italic' },
  { label: 'U', tag: 'u', title: 'Underline' },
  { label: 'H2', tag: 'h2', title: 'Heading' },
  { label: '•', tag: 'li', title: 'List' },
  { label: '🔗', tag: 'a', title: 'Link' },
];

export default function TextBlock({ block, onUpdate }: TextBlockProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, value?: string) => {
    const doc = document as unknown as Record<string, (command: string, show: boolean, value?: string) => boolean>;
    doc['execCommand'](command, false, value);
    editorRef.current?.focus();
    // Update data after formatting
    setTimeout(() => {
      if (editorRef.current) {
        onUpdate({ html: editorRef.current.innerHTML });
      }
    }, 0);
  }, [onUpdate]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onUpdate({ html: editorRef.current.innerHTML });
    }
  }, [onUpdate]);

  return (
    <div>
      {/* Formatting toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '6px 8px',
          background: 'var(--color-surface-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '8px 8px 0 0',
          borderBottom: 'none',
          flexWrap: 'wrap',
        }}
      >
        {FORMAT_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            title={btn.title}
            onClick={() => { exec(btn.tag === 'h2' ? 'formatBlock' : btn.tag === 'a' ? 'createLink' : btn.tag === 'li' ? 'insertUnorderedList' : btn.tag.toLowerCase(), btn.tag === 'h2' ? '<h2>' : btn.tag === 'a' ? 'https://' : undefined); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: btn.label === 'B' || btn.label === 'I' ? '14px' : '12px',
              fontWeight: btn.label === 'B' ? 700 : 400,
              fontStyle: btn.label === 'I' ? 'italic' : 'normal',
              textDecoration: btn.label === 'U' ? 'underline' : 'none',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            {btn.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
          contentEditable
        </span>
      </div>

      {/* Rich text editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        dangerouslySetInnerHTML={{ __html: block.data.html || '<p>Start writing...</p>' }}
        style={{
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '0 0 8px 8px',
          padding: '14px',
          minHeight: '120px',
          fontSize: '14px',
          lineHeight: 1.7,
          color: 'var(--color-text-primary)',
          background: 'var(--color-surface-secondary)',
          outline: 'none',
          cursor: 'text',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}
