'use client';

import type { DashboardData } from '@/utils/dashboard-data';

interface StatsCardsProps {
  stats: DashboardData['stats'];
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '12px',
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {accent && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: accent,
            borderRadius: '4px 0 0 4px',
          }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {sub && (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              marginTop: '2px',
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
      }}
    >
      <StatCard label="Stories Today" value={stats.storiesToday} sub="4 published" accent="var(--color-amber-500)" />
      <StatCard label="Research Queue" value={stats.researchQueue} sub="2 in progress" accent="var(--color-blue-500)" />
      <StatCard label="Editorial Review" value={stats.editorialQueue} sub="1 overdue" accent="var(--color-orange-500)" />
      <StatCard label="Publishing Queue" value={stats.publishingQueue} sub="2 critical" accent="var(--color-rose-500)" />
      <StatCard label="Monitors Active" value={stats.activeMonitors} sub={`${String(stats.criticalAlerts)} critical alerts`} accent="var(--color-cyan-500)" />
      <StatCard label="Published This Week" value={stats.publishedThisWeek} sub={`Avg score: ${String(stats.avgEvidenceScore)}`} accent="var(--color-emerald-500)" />
    </div>
  );
}
