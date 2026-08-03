import React from 'react';
import type { NewsroomProductivity } from '@/lib/intel/executive';

// Governing document: Phase IV sprint brief (Newsroom Productivity).
// Read-only view of the pipeline's productive state. Render only — counts derive from
// certified engine outputs inside the Executive Intelligence Service.

export function NewsroomPanel({ newsroom }: { newsroom: NewsroomProductivity }) {
  return (
    <section aria-label="Newsroom productivity">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
        <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>Briefs available</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{String(newsroom.briefsAvailable)}</div>
        </div>
        <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>Open investigations</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{String(newsroom.openInvestigations)}</div>
        </div>
        <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>Pending verification</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{String(newsroom.pendingVerification)}</div>
        </div>
      </div>

      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
        Editorial readiness by factor
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {newsroom.editorialReadiness.map((f) => (
          <div key={f.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>{f.label} · weight {Math.round(f.weight * 100)}%</span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>avg {String(f.avg)}</span>
            </div>
            <div style={{ height: 6, background: 'var(--color-bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${String(f.avg)}%`, background: f.avg >= 70 ? 'var(--color-error)' : f.avg >= 40 ? 'var(--color-amber-400)' : 'var(--color-brand-400)', borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)' }}>{newsroom.note}</div>
    </section>
  );
}
