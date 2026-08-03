import React from 'react';
import type { EvidenceHealth, EvidenceCategoryRow } from '@/lib/intel/executive';

// Governing document: Phase IV sprint brief (Evidence Health).
// Summarizes the Evidence Engine's registered coverage and debt. Render only — the
// aggregation lives in the Executive Intelligence Service.

function toneFor(value: number): string {
  if (value >= 70) return 'var(--color-brand-400)';
  if (value >= 40) return 'var(--color-amber-400)';
  return 'var(--color-error)';
}

function CategoryRow({ c }: { c: EvidenceCategoryRow }) {
  const tone = toneFor(c.pct);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>{c.label}</span>
        <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{String(c.pct)}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--color-bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${String(c.pct)}%`, background: tone, borderRadius: 3 }} />
      </div>
    </div>
  );
}

export function EvidenceHealthPanel({ health }: { health: EvidenceHealth }) {
  return (
    <section aria-label="Evidence health">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
        <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>Avg coverage</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: toneFor(health.avgCoverage) }}>{String(health.avgCoverage)}%</div>
        </div>
        <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>Evidence debt</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{String(health.totalDebt)}</div>
        </div>
        <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>Research completeness</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: toneFor(health.researchCompleteness) }}>{String(health.researchCompleteness)}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {health.categoryCoverage.map((c) => <CategoryRow key={c.category} c={c} />)}
      </div>

      {health.missingDatasets.length > 0 ? (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', marginTop: 'var(--spacing-3)' }}>
          Datasets not fully present: {health.missingDatasets.join('; ')}.
        </div>
      ) : null}

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)' }}>
        Highest debt seats: {health.highestDebt.slice(0, 3).map((h) => `${h.constituency} (${String(h.debt)})`).join(', ')}.
      </div>

      <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
        {health.limitations.map((l) => <li key={l}>{l}</li>)}
      </ul>
    </section>
  );
}
