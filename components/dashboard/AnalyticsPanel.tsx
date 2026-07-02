'use client';

import type { AnalyticsMetric } from '@/utils/dashboard-data';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

interface AnalyticsPanelProps {
  metrics: AnalyticsMetric[];
}

/**
 * AnalyticsPanel — Tab in the main dashboard.
 * Shows learning-centered analytics with real data from the Analytics Engine.
 */
export default function AnalyticsPanel({ metrics }: AnalyticsPanelProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '12px',
        overflow: 'hidden',
        padding: '20px',
      }}
    >
      {/* Quick summary row — existing static metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0',
          marginBottom: '24px',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border-subtle)',
              borderRight: '1px solid var(--color-border-subtle)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                marginBottom: '6px',
              }}
            >
              {metric.label}
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.1,
              }}
            >
              {metric.value}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
                fontSize: '12px',
                color:
                  metric.direction === 'up'
                    ? 'var(--color-emerald-500)'
                    : 'var(--color-rose-500)',
              }}
            >
              <span style={{ fontSize: '10px' }}>
                {metric.direction === 'up' ? '▲' : '▼'}
              </span>
              <span style={{ fontWeight: 600 }}>
                {metric.change > 0 ? '+' : ''}{metric.change}
                {metric.label.includes('Score') || metric.label.includes('Time') ? '' : '%'}
              </span>
              <span style={{ color: 'var(--color-text-tertiary)' }}>
                {metric.period}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Learning-centered analytics dashboard */}
      <AnalyticsDashboard />
    </div>
  );
}
