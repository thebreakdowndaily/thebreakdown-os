'use client';

import React from 'react';
import type { Fix, FixMetric } from '../../types/canonical';

interface SuccessMetricsDashboardProps {
  metrics: FixMetric[];
}

function MetricCard({ metric }: { metric: FixMetric }) {
  return (
    <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-4">
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] block mb-1">{metric.name}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-amber-400">{metric.currentValue}</span>
        <svg className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span className="text-lg font-bold text-emerald-400">{metric.targetValue}</span>
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--color-text-tertiary)]">
        <span>{metric.dataSource}</span>
        {metric.updateFrequency && (
          <>
            <span>·</span>
            <span>{metric.updateFrequency}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessMetricsDashboard({ metrics }: SuccessMetricsDashboardProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Success Metrics
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metrics.map((metric, i) => (
          <MetricCard key={i} metric={metric} />
        ))}
      </div>
    </div>
  );
}
