/**
 * ─── Scorecard Metric Card (Newsroom Intelligence) ───────────────────────────
 *
 * Presentational card for the Newsroom Intelligence Scorecard. Read-only.
 * Tone encodes direction only where the metric is a measured quality signal;
 * the scorecard defines no targets, so no card carries a pass/fail judgement.
 *
 * Server Component by design: the scorecard page renders it on the server and
 * calls formatMs/formatPct/formatNumber during server rendering.
 */

export function formatMs(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  const minutes = ms / 60000;
  if (minutes < 1) return String(ms) + ' ms';
  if (minutes < 60) return String(Math.round(minutes * 10) / 10) + ' min';
  return String(Math.round((minutes / 60) * 10) / 10) + ' h';
}

export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return String(Math.round(value * 100)) + '%';
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return String(value);
}

interface ScorecardCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: 'neutral' | 'critical' | 'warn' | 'good' | 'frozen';
}

const TONE_COLORS: Record<NonNullable<ScorecardCardProps['tone']>, { value: string; label: string }> = {
  neutral: { value: 'var(--color-text-primary)', label: 'var(--color-text-muted)' },
  critical: { value: '#b91c1c', label: 'var(--color-text-muted)' },
  warn: { value: '#c2410c', label: 'var(--color-text-muted)' },
  good: { value: '#15803d', label: 'var(--color-text-muted)' },
  frozen: { value: 'var(--color-text-primary)', label: 'var(--color-text-muted)' },
};

export function ScorecardCard({ label, value, sub, tone = 'neutral' }: ScorecardCardProps) {
  const colors = TONE_COLORS[tone];
  return (
    <div
      style={{
        padding: 'var(--spacing-4)',
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-md)',
        border: tone === 'frozen' ? '1px solid #c7d2fe' : '1px solid var(--color-border-subtle)',
      }}
    >
      <div style={{ fontSize: '11px', color: colors.label, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: colors.value, marginTop: 'var(--spacing-1)' }}>
        {value}
      </div>
      {sub ? (
        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}
