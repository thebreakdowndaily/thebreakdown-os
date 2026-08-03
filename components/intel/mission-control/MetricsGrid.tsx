import React from 'react';
import type { ExecutiveMetric } from '@/lib/intel/executive';
import { ConfidencePill } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Mission Control)
// + Phase IV sprint brief (Executive Summary). Presents the seven executive metrics
// aggregated by the Executive Intelligence Service. Render only — no logic here.

function toneFor(value: number): string {
  if (value >= 70) return 'var(--color-error)';
  if (value >= 40) return 'var(--color-amber-400)';
  return 'var(--color-brand-400)';
}

function MetricCard({ metric }: { metric: ExecutiveMetric }) {
  const tone = toneFor(metric.value);
  return (
    <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-2)' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{metric.label}</span>
        <ConfidencePill tier={metric.confidence} />
      </div>
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: tone, marginTop: 'var(--spacing-2)' }}>{metric.display}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
        {metric.source} · calc v{metric.calculationVersion}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>{metric.primaryDriver}</div>
      <details style={{ marginTop: 'var(--spacing-2)' }}>
        <summary style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', cursor: 'pointer' }}>Basis & limits</summary>
        <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
          {metric.evidenceSummary.map((e) => <li key={e}>{e}</li>)}
          {metric.limitations.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </details>
    </div>
  );
}

export function MetricsGrid({ metrics }: { metrics: ExecutiveMetric[] }) {
  return (
    <section aria-label="Executive metrics">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
        {metrics.map((m) => <MetricCard key={m.key} metric={m} />)}
      </div>
    </section>
  );
}
