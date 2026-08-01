'use client';

import React from 'react';
import Link from 'next/link';
import type { Fix } from '../../types/canonical';
import { MATURITY_CONFIG, INTERVENTION_COLOR_MAP, getEvidenceLabel, getEvidenceTextColor, HORIZON_LABELS } from '../../lib/fix-helpers';

interface RelatedFixGridProps {
  fixes: Fix[];
  className?: string;
}

export default function RelatedFixGrid({ fixes, className = '' }: RelatedFixGridProps) {
  if (fixes.length === 0) return null;

  return (
    <div className={`bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Available Fixes ({fixes.length})
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {fixes.map(fix => (
          <Link
            key={fix.id || fix.slug}
            href={`/fix/${fix.slug}`}
            className="group block bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-brand-400)]/30 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
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
              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-semibold ${getEvidenceTextColor(fix.evidenceScore)}`}>
                  {getEvidenceLabel(fix.evidenceScore)}
                </span>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors mb-1">
              {fix.headline}
            </h4>

            {fix.problemStatement && (
              <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                {fix.problemStatement}
              </p>
            )}

            <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-tertiary)]">
              {fix.timeToImpact && (
                <span>{HORIZON_LABELS[fix.timeToImpact] || fix.timeToImpact}</span>
              )}
              <span>{fix.readingTime} min read</span>
              {(fix.globalPrecedents || []).length > 0 && (
                <span>{(fix.globalPrecedents || []).length} global precedent{(fix.globalPrecedents || []).length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
