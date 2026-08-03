import React from 'react';
import type { ScenarioMonitorItem } from '@/lib/intel/executive';

// Governing document: Phase IV sprint brief (Scenario Monitor).
// Reuses the certified Scenario Engine's meaningful flips. Render only — flip selection
// and ranking live in the Executive Intelligence Service.

const IMPACT_TONE: Record<ScenarioMonitorItem['editorialImpact'], string> = {
  high: 'var(--color-error)',
  medium: 'var(--color-warning)',
  low: 'var(--color-brand-400)',
};

function ScenarioCard({ item }: { item: ScenarioMonitorItem }) {
  const tone = IMPACT_TONE[item.editorialImpact];
  return (
    <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.label}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>{item.note}</div>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: tone }}>
          {item.flipCount} flips · {item.editorialImpact}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-2)', flexWrap: 'wrap' }}>
        {item.seatShareTop.map((s) => (
          <span key={s.party} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{s.party} {String(s.seats)}</span>
        ))}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
        Majority threshold: {String(item.majority)} · {String(item.totalSeats)} seats modelled
      </div>
      {item.flips.length > 0 ? (
        <details style={{ marginTop: 'var(--spacing-2)' }}>
          <summary style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Flip seats</summary>
          <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            {item.flips.map((f) => (
              <li key={`${item.scenarioId}-${f.constituency}`}>
                {f.constituency}: {f.from} → {f.to} ({String(f.winnerProbability)}%)
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

export function ScenarioMonitorPanel({ items, totalFlips }: { items: ScenarioMonitorItem[]; totalFlips: number }) {
  return (
    <section aria-label="Scenario monitor">
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-3)' }}>
        {String(items.length)} non-baseline scenarios with ≥3 flips · {String(totalFlips)} total seat flips modelled.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        {items.map((item) => <ScenarioCard key={item.scenarioId} item={item} />)}
      </div>
    </section>
  );
}
