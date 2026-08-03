import React from 'react';
import type { ConfidenceTier } from '@/lib/intel/scoring/types';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit; Part 14 — Editorial Intelligence)
// Shared presentational primitives for intel modules. No logic here — render only.
// Canonical location for these primitives. Do not fork a copy into another module.

export function SectionCard({ id, title, subtitle, children }: { id?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined}>
      <div style={{ padding: 'var(--spacing-6)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
        <h2 id={id ? `${id}-title` : undefined} style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h2>
        {subtitle ? <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>{subtitle}</p> : null}
        <div style={{ marginTop: 'var(--spacing-4)' }}>{children}</div>
      </div>
    </section>
  );
}

const CONFIDENCE_COLOR: Record<ConfidenceTier, string> = {
  VERY_HIGH: 'var(--color-brand-400)',
  HIGH: 'var(--color-brand-400)',
  MEDIUM: 'var(--color-amber-400)',
  LOW: 'var(--color-warning)',
  VERY_LOW: 'var(--color-error)',
};

export function ConfidencePill({ tier }: { tier: ConfidenceTier }) {
  return (
    <span
      style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        color: CONFIDENCE_COLOR[tier],
        background: 'color-mix(in srgb, var(--color-bg-primary) 60%, transparent)',
        border: `1px solid ${CONFIDENCE_COLOR[tier]}`,
      }}
    >
      {tier.replace('_', ' ')}
    </span>
  );
}

export function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'good' | 'warn' | 'bad' }) {
  const color = tone === 'good' ? 'var(--color-brand-400)' : tone === 'warn' ? 'var(--color-warning)' : tone === 'bad' ? 'var(--color-error)' : 'var(--color-text-secondary)';
  return (
    <span
      style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        color,
        background: 'color-mix(in srgb, var(--color-bg-primary) 60%, transparent)',
        border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

export function MiniCard({ title, children, tone }: { title: string; children: React.ReactNode; tone?: 'good' | 'warn' | 'bad' }) {
  const borderColor = tone === 'good' ? 'var(--color-brand-400)' : tone === 'warn' ? 'var(--color-warning)' : tone === 'bad' ? 'var(--color-error)' : 'var(--color-border-subtle)';
  return (
    <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: `1px solid ${borderColor}` }}>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>{title}</div>
      {children}
    </div>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{children}</span>;
}

export function TwoCol({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>{children}</div>;
}
