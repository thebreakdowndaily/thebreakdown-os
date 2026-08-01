'use client';

import React from 'react';
import Link from 'next/link';

interface GettingStartedGuideProps {
  problemSlug: string;
  hasStory: boolean;
  hasFix: boolean;
  hasEntities: boolean;
  className?: string;
}

interface Step {
  label: string;
  description: string;
  href: string;
  icon: string;
}

export default function GettingStartedGuide({ problemSlug, hasStory, hasFix, hasEntities, className = '' }: GettingStartedGuideProps) {
  const steps: Step[] = [
    {
      label: 'Read the Investigation',
      description: 'Understand the full context with data and evidence',
      href: '#overview',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
    {
      label: 'Understand the Problem',
      description: 'Explore root causes and who is affected',
      href: '#root-causes',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      label: 'Explore the Evidence',
      description: 'Review data, sources, and verification status',
      href: '#related-fixes',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      label: 'Compare Solutions',
      description: 'See available fixes and their trade-offs',
      href: '/problems/' + problemSlug + '/compare',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    },
    {
      label: 'Track Progress',
      description: 'Monitor implementation metrics and updates',
      href: '#related-fixes',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
  ];

  return (
    <div className={`bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        New to this issue?
      </h3>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <Link
            key={i}
            href={step.href}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-surface-secondary)] transition-colors group"
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-brand-400)]/10 flex items-center justify-center text-[var(--color-brand-400)]">
              <span className="text-xs font-bold">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] block">
                {step.label}
              </span>
              <span className="text-[10px] text-[var(--color-text-tertiary)]">
                {step.description}
              </span>
            </div>
            <svg className="w-3 h-3 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
