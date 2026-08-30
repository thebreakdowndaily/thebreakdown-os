/**
 * ─── DemandMetricsBar ────────────────────────────────────────────────────────
 *
 * Summary metrics row for the Demand Intelligence dashboard.
 * Same grid pattern as NewsroomDashboardClient metrics section.
 *
 * Governing document: docs/editorial/story-selection-framework.md
 */

import type { DemandSummaryMetrics } from '@/types/demand-intelligence';

const CATEGORY_LABELS: Record<string, string> = {
  foreign_policy: 'Foreign Policy',
  defence: 'Defence',
  economy: 'Economy',
  governance: 'Governance',
  judiciary: 'Judiciary',
  history: 'History',
  elections: 'Elections',
  society: 'Society',
};

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface DemandMetricsBarProps {
  metrics: DemandSummaryMetrics;
}

function MetricCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        padding: 'var(--spacing-3)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          color: color ?? 'var(--color-text-primary)',
          marginTop: 'var(--spacing-1)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function DemandMetricsBar({ metrics }: DemandMetricsBarProps) {
  return (
    <section
      aria-label="Demand summary metrics"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--spacing-3)',
        marginBottom: 'var(--spacing-6)',
      }}
    >
      <MetricCell label="Queries Tracked" value={String(metrics.totalQueries)} />
      <MetricCell label="Monthly Volume" value={formatVolume(metrics.totalMonthlyVolume)} />
      <MetricCell label="Coverage Gaps" value={String(metrics.gapCount)} color="#c2410c" />
      <MetricCell label="Uncovered" value={String(metrics.uncoveredCount)} color="#b91c1c" />
      <MetricCell label="Rising Demand" value={String(metrics.risingCount + metrics.spikeCount)} color="var(--color-brand-400)" />
      <MetricCell
        label="Top Category"
        value={CATEGORY_LABELS[metrics.topCategory] ?? metrics.topCategory}
      />
    </section>
  );
}
