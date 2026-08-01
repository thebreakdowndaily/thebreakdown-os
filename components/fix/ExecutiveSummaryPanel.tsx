'use client';

import React from 'react';
import type { Fix } from '../../types/canonical';
import { HORIZON_LABELS, formatCostLabel } from '../../lib/fix-helpers';

interface ExecutiveSummaryPanelProps {
  fix: Fix;
}

export default function ExecutiveSummaryPanel({ fix }: ExecutiveSummaryPanelProps) {
  const recommendedCount = (fix.recommendedActions || []).length;

  const rows = [
    { label: 'Problem', value: fix.problemStatement || fix.problem?.title || 'N/A' },
    { label: 'Reform', value: `${recommendedCount} recommended action${recommendedCount !== 1 ? 's' : ''}` },
    { label: 'Impact', value: HORIZON_LABELS[fix.timeToImpact || ''] || 'TBD' },
    { label: 'Cost', value: formatCostLabel(fix.fiscalCost) },
    { label: 'Evidence', value: `${fix.evidenceGrade || 'Moderate'} (${fix.evidenceScore}/100)` },
  ];

  return (
    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-4 mb-4">
      <h3 className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold mb-2">Executive Summary</h3>
      <div className="grid grid-cols-5 gap-3">
        {rows.map(row => (
          <div key={row.label} className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] block mb-0.5">{row.label}</span>
            <span className="text-xs font-medium text-[var(--color-text-primary)] leading-snug block truncate" title={row.value}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
