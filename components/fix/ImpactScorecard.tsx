'use client';

import React from 'react';
import type { Fix } from '../../types/canonical';
import { computeImpactScores } from '../../lib/fix-helpers';

interface ImpactScorecardProps {
  fix: Fix;
}

function ConfidenceRow({ label, level, color }: { label: string; level: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      <span className={`text-xs font-semibold ${color}`}>{level}</span>
    </div>
  );
}

function BarRow({ label, fraction, color }: { label: string; fraction: number; color: string }) {
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--color-surface-secondary)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.round(fraction * 100)}%` }} />
      </div>
    </div>
  );
}

export default function ImpactScorecard({ fix }: ImpactScorecardProps) {
  const s = computeImpactScores(fix);

  return (
    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Assessment
      </h3>
      <div className="divide-y divide-[var(--color-border)]">
        <BarRow label="Expected Impact" fraction={s.impactFrac} color="bg-[var(--color-brand-400)]" />
        <ConfidenceRow label="Impact Level" level={s.impactLabel} color={s.impactColor} />
        <BarRow label="Feasibility" fraction={s.feasibility.frac} color="bg-emerald-400" />
        <ConfidenceRow label="Political Difficulty" level={s.political.label} color="text-amber-400" />
        <div className="flex items-center justify-between py-2.5">
          <span className="text-xs text-[var(--color-text-secondary)]">Fiscal Cost</span>
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">{s.costLabel}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-xs text-[var(--color-text-secondary)]">Confidence</span>
          <span className={`text-xs font-semibold ${s.confidenceFrac >= 0.8 ? 'text-emerald-400' : s.confidenceFrac >= 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
            {s.confidenceLabel}
          </span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-xs text-[var(--color-text-secondary)]">Assessment Basis</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)] italic">{s.assessmentBasis}</span>
        </div>
      </div>
    </div>
  );
}
