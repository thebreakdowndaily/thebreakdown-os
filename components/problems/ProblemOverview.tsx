'use client';

import React from 'react';
import type { Problem } from '../../lib/problem-helpers';
import { PROBLEM_CATEGORIES } from '../../lib/problem-helpers';
import { EVIDENCE_GRADE_CONFIG, HORIZON_LABELS, formatCostLabel, formatDate } from '../../lib/fix-helpers';

interface ProblemOverviewProps {
  problem: Problem;
}

export default function ProblemOverview({ problem }: ProblemOverviewProps) {
  const primaryFix = problem.fixes[0];
  const category = PROBLEM_CATEGORIES[problem.category];

  return (
    <div id="overview" className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--color-brand-400)]">{category?.label}</span>
        <span className="text-[var(--color-text-tertiary)]">&middot;</span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${
          problem.severity === 'critical' ? 'text-red-400' :
          problem.severity === 'high' ? 'text-amber-400' :
          'text-gray-400'
        }`}>
          {problem.severity} severity
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] mb-3 leading-tight">
        {problem.title}
      </h1>

      <p className="text-[var(--color-text-secondary)] leading-relaxed mb-5 max-w-3xl">
        {problem.description}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <StatBlock label="Severity" value={problem.severity} color={
          problem.severity === 'critical' ? 'text-red-400' :
          problem.severity === 'high' ? 'text-amber-400' :
          'text-gray-400'
        } />
        <StatBlock label="Evidence" value={problem.evidenceGrade} color={
          EVIDENCE_GRADE_CONFIG[problem.evidenceGrade]?.color || 'text-gray-400'
        } />
        <StatBlock label="Related Fixes" value={String(problem.fixCount)} color="text-[var(--color-brand-400)]" />
        <StatBlock label="Stories" value={String(problem.storyCount)} color="text-blue-400" />
      </div>

      {primaryFix && (
        <div className="flex flex-wrap gap-3 text-[10px] text-[var(--color-text-tertiary)]">
          {primaryFix.timeToImpact && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {HORIZON_LABELS[primaryFix.timeToImpact] || primaryFix.timeToImpact}
            </span>
          )}
          {primaryFix.fiscalCost?.amount && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {primaryFix.fiscalCost.amount} {primaryFix.fiscalCost.currency}
            </span>
          )}
          {primaryFix.lastVerified && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Verified {formatDate(primaryFix.lastVerified)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-3 text-center">
      <span className={`block text-lg font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider">{label}</span>
    </div>
  );
}
