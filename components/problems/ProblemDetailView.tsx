'use client';

import React from 'react';
import Link from 'next/link';
import type { Problem } from '../../lib/problem-helpers';
import ProblemOverview from './ProblemOverview';
import RootCauseGraph from './RootCauseGraph';
import RelatedFixGrid from './RelatedFixGrid';
import KnowledgeConnections from './KnowledgeConnections';
import GettingStartedGuide from './GettingStartedGuide';

interface ProblemDetailViewProps {
  problem: Problem;
}

function Breadcrumbs({ problem }: { problem: Problem }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <li>
          <Link href="/problems" className="hover:text-[var(--color-brand-400)] transition-colors">
            Problems
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-[var(--color-text-primary)] font-medium" aria-current="page">
          {problem.title}
        </li>
      </ol>
    </nav>
  );
}

export default function ProblemDetailView({ problem }: ProblemDetailViewProps) {
  const hasStory = problem.storyCount > 0;
  const hasFix = problem.fixCount > 0;
  const hasEntities = problem.entityCount > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Breadcrumbs problem={problem} />

      <ProblemOverview problem={problem} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {problem.fixes.length > 0 && (
            <section id="root-causes" aria-label="Root cause analysis">
              {problem.fixes.map(fix => (
                <RootCauseGraph key={fix.id || fix.slug} fix={fix} className="mb-4" />
              ))}
            </section>
          )}

          <section id="related-fixes" aria-label="Available fixes">
            <RelatedFixGrid fixes={problem.fixes} />
          </section>

          <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
            <Link
              href={`/compare?fixes=${problem.fixes.map(f => f.slug).join(',')}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-400)]/10 border border-[var(--color-brand-400)]/30 rounded-lg text-xs font-medium text-[var(--color-brand-400)] hover:bg-[var(--color-brand-400)]/20 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Structured Comparison
            </Link>
            <Link
              href={`/problems/${problem.slug}/compare`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-primary)] hover:border-[var(--color-brand-400)]/40 hover:text-[var(--color-brand-400)] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Compare All Solutions
            </Link>
            <Link
              href="/fix"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-400)] transition-colors"
            >
              Browse The Fix Hub
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <KnowledgeConnections problem={problem} />

          <GettingStartedGuide
            problemSlug={problem.slug}
            hasStory={hasStory}
            hasFix={hasFix}
            hasEntities={hasEntities}
          />
        </div>
      </div>
    </div>
  );
}
