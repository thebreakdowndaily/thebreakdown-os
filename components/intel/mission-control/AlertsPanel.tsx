import React from 'react';
import type { EditorialAlert, EditorialAlertSeverity } from '@/lib/intel/executive';
import { ConfidencePill } from '@/components/intel/shared/primitives';

// Governing document: Phase IV sprint brief (Editorial Alerts).
// Surfaces only meaningful, actionable alerts. Render only — alert construction and
// severity ordering live in the Executive Intelligence Service.

const SEVERITY_TONE: Record<EditorialAlertSeverity, string> = {
  critical: 'var(--color-error)',
  high: 'var(--color-warning)',
  medium: 'var(--color-amber-400)',
  info: 'var(--color-brand-400)',
};

function AlertCard({ alert }: { alert: EditorialAlert }) {
  const tone = SEVERITY_TONE[alert.severity];
  return (
    <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', borderLeft: `3px solid ${tone}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{alert.title}</span>
          <ConfidencePill tier={alert.confidence} />
        </div>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: tone }}>{alert.severity}</span>
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>{alert.detail}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
        <strong>Action:</strong> {alert.action}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
        Basis: {alert.basis} · {alert.source}
      </div>
    </div>
  );
}

export function AlertsPanel({ alerts }: { alerts: EditorialAlert[] }) {
  if (alerts.length === 0) {
    return <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No alerts to action right now.</div>;
  }
  return (
    <section aria-label="Editorial alerts">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        {alerts.map((a) => <AlertCard key={a.id} alert={a} />)}
      </div>
    </section>
  );
}
