import React from 'react';
import type { TrustIndex } from '@/lib/intel/trust/types';
import { ConfidencePill } from '@/components/intel/shared/primitives';

// Governing document: AGENTS.md (Institutional Trust Index)
// + docs/intelligence/mission-control-readiness.md (Phase III deliverable 5)
// Mission Control shows one number first: the Institutional Trust Index.
// Presentational only — the value is computed by the Trust Index Service.

function toneFor(value: number): string {
  if (value >= 80) return 'var(--color-brand-400)';
  if (value >= 60) return 'var(--color-amber-400)';
  return 'var(--color-error)';
}

export function TrustIndexPanel({ index }: { index: TrustIndex }) {
  const tone = toneFor(index.value);

  return (
    <section aria-label="Institutional Trust Index">
      <div style={{ padding: 'var(--spacing-6)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Institutional Trust Index
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: tone, marginTop: 'var(--spacing-2)' }}>
              {String(index.value)} / 100
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
              version {index.version} · {index.dataSource} · <ConfidencePill tier={index.confidence} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', maxWidth: 420 }}>
            <div style={{ marginBottom: 'var(--spacing-1)' }}>Composition — {index.confidenceReason}.</div>
            <div>Published weights: evidence coverage 25% · confidence 20% · verification 15% · prediction stability 15% · scenario consistency 15% · research 10%.</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-5)' }}>
          {index.components.map((c) => (
            <div key={c.key} style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{c.label}</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{String(c.value)}</span>
              </div>
              <div style={{ height: 6, background: 'var(--color-bg-secondary)', borderRadius: 3, marginTop: 'var(--spacing-2)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${String(c.value)}%`, background: toneFor(c.value), borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                {Math.round(c.weight * 100)}% weight · contributes {String(c.contribution)} pts
              </div>
            </div>
          ))}
        </div>

        <details style={{ marginTop: 'var(--spacing-4)' }}>
          <summary style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Limitations</summary>
          <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            {index.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
