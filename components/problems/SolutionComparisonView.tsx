'use client';

import React from 'react';
import Link from 'next/link';
import type { Problem } from '../../lib/problem-helpers';
import type { Fix } from '../../types/canonical';
import { MATURITY_CONFIG, INTERVENTION_COLOR_MAP, getEvidenceLabel, getEvidenceTextColor, HORIZON_LABELS } from '../../lib/fix-helpers';

interface SolutionComparisonViewProps {
  problem: Problem;
}

function ComparisonRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-4 py-3 border-b border-[var(--color-border)] last:border-0">
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold self-start mt-0.5">
        {label}
      </span>
      <div className="text-sm text-[var(--color-text-secondary)]">{children}</div>
    </div>
  );
}

function FixColumn({ fix }: { fix: Fix }) {
  return (
    <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
          MATURITY_CONFIG[fix.maturityStatus || 'proposed']?.className || ''
        }`}>
          {MATURITY_CONFIG[fix.maturityStatus || 'proposed']?.label || 'Proposed'}
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
          INTERVENTION_COLOR_MAP[fix.primaryCategory || ''] || ''
        }`}>
          {fix.primaryCategory}
        </span>
      </div>

      <Link href={`/fix/${fix.slug}`} className="group">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors mb-1">
          {fix.headline}
        </h3>
      </Link>

      {fix.problemStatement && (
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3 mb-3">
          {fix.problemStatement}
        </p>
      )}

      <div className="space-y-0">
        <ComparisonRow label="Evidence">
          <span className={`font-semibold ${getEvidenceTextColor(fix.evidenceScore)}`}>
            {getEvidenceLabel(fix.evidenceScore)}
          </span>
        </ComparisonRow>
        <ComparisonRow label="Time to Impact">
          {fix.timeToImpact ? HORIZON_LABELS[fix.timeToImpact] || fix.timeToImpact : '—'}
        </ComparisonRow>
        <ComparisonRow label="Fiscal Cost">
          {fix.fiscalCost?.amount ? `${fix.fiscalCost.amount} ${fix.fiscalCost.currency}` : '—'}
        </ComparisonRow>
        <ComparisonRow label="Global Precedents">
          {(fix.globalPrecedents || []).length > 0
            ? `${(fix.globalPrecedents || []).length} precedent${(fix.globalPrecedents || []).length !== 1 ? 's' : ''}`
            : '—'}
        </ComparisonRow>
        <ComparisonRow label="Reading Time">
          {fix.readingTime} min
        </ComparisonRow>
      </div>

      <Link
        href={`/fix/${fix.slug}`}
        className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--color-brand-400)] hover:text-[var(--color-brand-400)]/80 transition-colors"
      >
        Read full analysis
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

export default function SolutionComparisonView({ problem }: SolutionComparisonViewProps) {
  if (problem.fixes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <p className="text-sm text-[var(--color-text-tertiary)]">No fixes available for comparison.</p>
        <Link href={`/problems/${problem.slug}`} className="mt-4 inline-flex items-center gap-1 text-xs text-[var(--color-brand-400)]">
          Back to problem
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/problems/${problem.slug}`} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text-primary)]">
            Solution Comparison
          </h1>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {problem.title} &middot; {problem.fixes.length} fix{problem.fixes.length !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${
        problem.fixes.length === 2 ? 'md:grid-cols-2' :
        problem.fixes.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : ''
      }`}>
        {problem.fixes.map(fix => (
          <FixColumn key={fix.id || fix.slug} fix={fix} />
        ))}
      </div>
    </div>
  );
}
