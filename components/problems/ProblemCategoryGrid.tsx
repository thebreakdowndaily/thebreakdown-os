'use client';

import React from 'react';
import Link from 'next/link';
import type { ProblemCategory } from '../../lib/problem-helpers';
import { PROBLEM_CATEGORIES, getCategoryStats, extractProblems } from '../../lib/problem-helpers';

interface ProblemCategoryGridProps {
  className?: string;
}

function CategoryIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg className={className || 'w-6 h-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
    </svg>
  );
}

export default function ProblemCategoryGrid({ className = '' }: ProblemCategoryGridProps) {
  const problems = extractProblems();
  const stats = getCategoryStats(problems);

  const categories = (Object.keys(PROBLEM_CATEGORIES) as ProblemCategory[]).filter(
    cat => stats[cat].problemCount > 0
  );

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {categories.map(cat => {
        const config = PROBLEM_CATEGORIES[cat];
        const s = stats[cat];
        return (
          <Link
            key={cat}
            href="#search"
            className="group block bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-brand-400)]/40 hover:shadow-lg hover:shadow-[var(--color-brand-400)]/5 transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[var(--color-brand-400)]/10 text-[var(--color-brand-400)] group-hover:bg-[var(--color-brand-400)]/20 transition-colors">
                <CategoryIcon path={config.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors">
                  {config.label}
                </h3>
                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2">
                  {config.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-tertiary)]">
              <span>
                <span className="font-semibold text-[var(--color-text-primary)]">{s.problemCount}</span> problem{s.problemCount !== 1 ? 's' : ''}
              </span>
              <span>
                <span className="font-semibold text-[var(--color-text-primary)]">{s.fixCount}</span> Fix{s.fixCount !== 1 ? 'es' : ''}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
