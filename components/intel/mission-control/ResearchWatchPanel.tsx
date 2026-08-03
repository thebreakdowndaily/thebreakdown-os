import React from 'react';
import type { ResearchWatch } from '@/lib/intel/executive';
import { ConfidencePill } from '@/components/intel/shared/primitives';

// Governing document: Phase IV sprint brief (Research Watch).
// Summarizes the Research KB. Render only — finding/gap construction lives in the
// Executive Intelligence Service.

export function ResearchWatchPanel({ watch }: { watch: ResearchWatch }) {
  return (
    <section aria-label="Research watch">
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-3)' }}>
        Dataset {watch.dataSource} · research cutoff {watch.researchCutoff} · {String(watch.predictionGapCount)} predictions carry data gaps.
      </div>

      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
        Highest-impact findings
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
        {watch.findings.map((f, i) => (
          <div key={`${f.constituency}-${i}`} style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{f.title}</span>
              <ConfidencePill tier={f.confidence} />
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>{f.constituency} — {f.detail}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
        Outstanding research gaps
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {watch.gaps.map((g) => (
          <div key={g.category} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            <strong>{g.label}:</strong> {g.detail}
          </div>
        ))}
      </div>
    </section>
  );
}
