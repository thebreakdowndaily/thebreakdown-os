'use client';

import React from 'react';
import Link from 'next/link';
import type { NextBestUnderstandingPlan, CognitiveStep } from '@/lib/comprehension/next-best-understanding';

interface NextBestUnderstandingProps {
  plan: NextBestUnderstandingPlan;
}

const STEP_STYLE_MAP: Record<string, {
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  hoverBorder: string;
  iconColor: string;
}> = {
  prerequisite: {
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400 border border-amber-500/20',
    borderColor: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/50',
    iconColor: 'text-amber-400',
  },
  institutional_actor: {
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400 border border-sky-500/20',
    borderColor: 'border-sky-500/20',
    hoverBorder: 'hover:border-sky-500/50',
    iconColor: 'text-sky-400',
  },
  structural_fix: {
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400 border border-purple-500/20',
    borderColor: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/50',
    iconColor: 'text-purple-400',
  },
  downstream_consequence: {
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400 border border-emerald-500/20',
    borderColor: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
  },
  upstream_cause: {
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400 border border-teal-500/20',
    borderColor: 'border-teal-500/20',
    hoverBorder: 'hover:border-teal-500/50',
    iconColor: 'text-teal-400',
  },
};

export default function NextBestUnderstanding({ plan }: NextBestUnderstandingProps) {
  if (!plan || !plan.steps || plan.steps.length === 0) return null;

  return (
    <section
      aria-label="Next Best Understanding Roadmap"
      className="my-16 p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 shadow-2xl backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              Cognitive Next Step
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Next Best Understanding
          </h2>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono text-neutral-400 bg-neutral-950/80 border border-neutral-800">
          Scaffolded Learning Journey
        </span>
      </div>

      {/* Editorial Rationale Banner */}
      {plan.rationale && (
        <div className="my-6 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/60 flex items-start gap-3">
          <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed italic">
            <strong className="text-emerald-300 not-italic font-semibold">Editorial Guidance: </strong>
            {plan.rationale}
          </p>
        </div>
      )}

      {/* Step Grid (2x2 on desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {plan.steps.map((step, idx) => {
          const style = STEP_STYLE_MAP[step.type] || STEP_STYLE_MAP.prerequisite;
          return (
            <Link
              key={idx}
              href={step.url}
              className={`group flex flex-col justify-between p-5 rounded-xl bg-neutral-950/60 border ${style.borderColor} ${style.hoverBorder} transition-all duration-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${style.badgeText} ${style.badgeBg}`}>
                    {step.badgeLabel}
                  </span>
                  {step.estimatedMinutes && (
                    <span className="text-[11px] font-mono text-neutral-400">
                      {step.estimatedMinutes} min read
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug mb-1">
                  {step.title}
                </h3>

                {step.subtitle && (
                  <p className="text-xs font-mono text-neutral-400 mb-2">
                    {step.subtitle}
                  </p>
                )}

                <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3">
                  {step.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-emerald-400 transition-colors">
                <span className="font-medium">Explore Cognitive Step</span>
                <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
