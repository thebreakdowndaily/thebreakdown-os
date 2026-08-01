'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Problem, ProblemCategory } from '../../lib/problem-helpers';
import { PROBLEM_CATEGORIES, searchProblems } from '../../lib/problem-helpers';
import { EVIDENCE_GRADE_CONFIG } from '../../lib/fix-helpers';

interface ProblemSearchProps {
  problems: Problem[];
  onFilterChange?: (filtered: Problem[]) => void;
  className?: string;
}

export default function ProblemSearch({ problems, onFilterChange, className = '' }: ProblemSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | 'all'>('all');

  const filtered = useMemo(() => {
    let result = problems;
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (query) {
      result = searchProblems(result, query);
    }
    return result;
  }, [problems, query, selectedCategory]);

  React.useEffect(() => {
    onFilterChange?.(filtered);
  }, [filtered, onFilterChange]);

  const categoriesWithProblems = useMemo(() => {
    const cats = new Set(problems.map(p => p.category));
    return (Object.keys(PROBLEM_CATEGORIES) as ProblemCategory[]).filter(c => cats.has(c));
  }, [problems]);

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search problems, issues, policy areas..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-400)]/50 focus:border-[var(--color-brand-400)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[var(--color-brand-400)]/15 text-[var(--color-brand-400)] border-[var(--color-brand-400)]/30'
              : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          All ({problems.length})
        </button>
        {categoriesWithProblems.map(cat => {
          const count = problems.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedCategory === cat
                  ? 'bg-[var(--color-brand-400)]/15 text-[var(--color-brand-400)] border-[var(--color-brand-400)]/30'
                  : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {PROBLEM_CATEGORIES[cat].label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-[var(--color-text-tertiary)]">No problems match your search.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {filtered.map(problem => (
          <Link
            key={problem.slug}
            href={`/problems/${problem.slug}`}
            className="group block bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-brand-400)]/40 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  problem.severity === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  problem.severity === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {problem.severity}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  EVIDENCE_GRADE_CONFIG[problem.evidenceGrade]?.className || ''
                }`}>
                  {problem.evidenceGrade} evidence
                </span>
              </div>
              <span className="text-[10px] text-[var(--color-text-tertiary)]">
                {problem.fixCount} Fix{problem.fixCount !== 1 ? 'es' : ''}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors mb-1">
              {problem.title}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
              {problem.description}
            </p>

            <div className="flex items-center gap-3 mt-3 text-[10px] text-[var(--color-text-tertiary)]">
              {problem.storyCount > 0 && <span>{problem.storyCount} stor{problem.storyCount !== 1 ? 'ies' : 'y'}</span>}
              {problem.entityCount > 0 && <span>{problem.entityCount} entit{problem.entityCount !== 1 ? 'ies' : 'y'}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
