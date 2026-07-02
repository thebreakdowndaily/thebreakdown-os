'use client';

import type { Block } from '@/utils/cms-data';

interface EvidenceBlockProps {
  block: Block;
  onUpdate: (data: Record<string, any>) => void;
}

export default function EvidenceBlock({ block, onUpdate }: EvidenceBlockProps) {
  const d = block.data;

  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--color-surface-secondary)',
        borderRadius: '8px',
        border: '1px solid var(--color-border-subtle)',
        borderLeft: '3px solid var(--color-amber-500)',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--color-amber-500)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '10px',
        }}
      >
        🔬 Evidence
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '3px' }}>
          Claim
        </label>
        <textarea
          value={d.claim || ''}
          onChange={(e) => onUpdate({ ...d, claim: e.target.value })}
          placeholder="What claim does this evidence support?"
          rows={2}
          style={{
            width: '100%',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            background: 'var(--color-surface-primary)',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '3px' }}>
          Data / Evidence
        </label>
        <textarea
          value={d.data || ''}
          onChange={(e) => onUpdate({ ...d, data: e.target.value })}
          placeholder="The actual data or evidence text..."
          rows={2}
          style={{
            width: '100%',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            background: 'var(--color-surface-primary)',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '3px' }}>
            Source Name
          </label>
          <input
            value={d.source || ''}
            onChange={(e) => onUpdate({ ...d, source: e.target.value })}
            placeholder="Source name"
            style={{
              width: '100%',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '6px',
              padding: '7px 10px',
              fontSize: '12px',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-primary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '3px' }}>
            Trust Tier
          </label>
          <select
            value={d.tier ?? 1}
            onChange={(e) => onUpdate({ ...d, tier: parseInt(e.target.value) })}
            style={{
              width: '100%',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '6px',
              padding: '7px 10px',
              fontSize: '12px',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-primary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          >
            <option value={1}>Tier 1 (Official/ Primary)</option>
            <option value={2}>Tier 2 (Verified Secondary)</option>
            <option value={3}>Tier 3 (Industry/ Media)</option>
            <option value={4}>Tier 4 (Unverified)</option>
            <option value={5}>Tier 5 (Low Credibility)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
