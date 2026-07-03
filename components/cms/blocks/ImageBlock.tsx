'use client';

import Image from 'next/image';
import type { Block, ImageBlockData } from '@/utils/cms-data';

interface ImageBlockProps {
  block: Block;
  onUpdate: (data: Record<string, unknown>) => void;
}

export default function ImageBlock({ block, onUpdate }: ImageBlockProps) {
  const d = block.data as ImageBlockData;

  return (
    <div>
      <div
        style={{
          marginBottom: '10px',
          padding: '20px',
          background: 'var(--color-surface-secondary)',
          borderRadius: '8px',
          border: '1px dashed var(--color-border-subtle)',
          textAlign: 'center',
        }}
      >
        {d.src ? (
          <div>
            <div
              style={{
                width: '100%',
                height: '160px',
                position: 'relative',
                background: `var(--color-surface-primary)`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: '13px',
                overflow: 'hidden',
              }}
            >
              <Image src={d.src} alt={d.alt || ''} fill style={{ objectFit: 'cover', borderRadius: '6px' }} />
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
            🖼️ No image selected
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          value={d.src || ''}
          onChange={(e) => { onUpdate({ ...d, src: e.target.value }); }}
          placeholder="Image URL..."
          style={{
            width: '100%',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-surface-secondary)',
            outline: 'none',
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input
            value={d.alt || ''}
            onChange={(e) => { onUpdate({ ...d, alt: e.target.value }); }}
            placeholder="Alt text (accessibility)"
            style={{
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '6px',
              padding: '7px 10px',
              fontSize: '12px',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-secondary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <input
            value={d.credit || ''}
            onChange={(e) => { onUpdate({ ...d, credit: e.target.value }); }}
            placeholder="Photo credit"
            style={{
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '6px',
              padding: '7px 10px',
              fontSize: '12px',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-secondary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <input
          value={d.caption || ''}
          onChange={(e) => { onUpdate({ ...d, caption: e.target.value }); }}
          placeholder="Caption text..."
          style={{
            width: '100%',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            padding: '7px 10px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-secondary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>
    </div>
  );
}
