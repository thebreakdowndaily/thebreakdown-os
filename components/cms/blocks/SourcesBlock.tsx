'use client';

import type { Block, SourcesBlockData } from '@/utils/cms-data';

interface SourcesBlockProps {
  block: Block;
  onUpdate: (data: Record<string, unknown>) => void;
}

const TIER_LABELS: Record<number, string> = {
  1: 'Tier 1 — Official/Primary',
  2: 'Tier 2 — Verified Secondary',
  3: 'Tier 3 — Industry/Media',
  4: 'Tier 4 — Unverified',
  5: 'Tier 5 — Low Credibility',
};

export default function SourcesBlock({ block, onUpdate }: SourcesBlockProps) {
  const d = block.data as SourcesBlockData;
  const sources = d.sources;

  const updateSource = (idx: number, field: string, value: string | number) => {
    const next = [...sources];
    next[idx] = { ...next[idx], [field]: value };
    onUpdate({ ...d, sources: next });
  };

  const addSource = () => { onUpdate({ ...d, sources: [...sources, { title: '', url: '', accessedAt: '', tier: 2 }] }); };
  const removeSource = (idx: number) => { onUpdate({ ...d, sources: sources.filter((_, i) => i !== idx) }); };

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
        📚 Sources & References
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {sources.map((src, i) => (
          <div
            key={i}
            style={{
              padding: '10px 12px',
              background: 'var(--color-surface-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--color-border-subtle)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '8px', marginBottom: '6px' }}>
              <input
                value={src.title}
                onChange={(e) => { updateSource(i, 'title', e.target.value); }}
                placeholder="Source title..."
                style={{
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-surface-primary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <select
                value={src.tier}
                onChange={(e) => { updateSource(i, 'tier', parseInt(e.target.value)); }}
                style={{
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '10px',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-surface-primary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              >
                {[1, 2, 3, 4, 5].map((t) => (
                  <option key={t} value={t}>{TIER_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                value={src.url}
                onChange={(e) => { updateSource(i, 'url', e.target.value); }}
                placeholder="https://..."
                style={{
                  flex: 1,
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                  background: 'var(--color-surface-primary)',
                  outline: 'none',
                }}
              />
              <input
                type="date"
                value={src.accessedAt}
                onChange={(e) => { updateSource(i, 'accessedAt', e.target.value); }}
                style={{
                  width: '120px',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  background: 'var(--color-surface-primary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {sources.length > 1 && (
                <button onClick={() => { removeSource(i); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: '14px', opacity: 0.4, padding: '4px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-rose-500)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.opacity = '0.4'; }}
                >✕</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSource}
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
        + Add Source
      </button>
    </div>
  );
}
