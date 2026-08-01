'use client';

import React from 'react';
import type { Fix } from '../../types/canonical';
import { deriveFactualSummary } from '../../lib/compare-helpers';

interface EditorialRecommendationProps {
  fixes: Fix[];
}

export function EditorialRecommendation({ fixes }: EditorialRecommendationProps) {
  const summary = deriveFactualSummary(fixes);

  const items: Array<{ label: string; fix: Fix | null; metric: string; color: string }> = [
    {
      label: 'Highest Evidence',
      fix: summary.highestEvidence,
      metric: summary.highestEvidence ? `${summary.highestEvidence.evidenceScore}/100` : '',
      color: 'text-emerald-400',
    },
    {
      label: 'Lowest Implementation Cost',
      fix: summary.lowestCost,
      metric: summary.lowestCost?.fiscalCost?.amount
        ? `${summary.lowestCost.fiscalCost.currency} ${summary.lowestCost.fiscalCost.amount}`
        : 'Budget Neutral',
      color: 'text-blue-400',
    },
    {
      label: 'Fastest Expected Impact',
      fix: summary.fastestImpact,
      metric: summary.fastestImpact?.timeToImpact || '',
      color: 'text-amber-400',
    },
    {
      label: 'Lowest Complexity',
      fix: summary.lowestComplexity,
      metric: '',
      color: 'text-indigo-400',
    },
    {
      label: 'Strongest Research Base',
      fix: summary.strongestResearch,
      metric: summary.strongestResearch
        ? `${(summary.strongestResearch.sourceIds || []).length + (summary.strongestResearch.sources || []).length} sources`
        : '',
      color: 'text-purple-400',
    },
  ];

  const validItems = items.filter(item => item.fix !== null);

  if (validItems.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Factual Summary</h3>
        <p className="text-sm text-zinc-400 mt-1">
          Objective comparisons derived from canonical metadata
        </p>
      </div>

      <div className="grid gap-3">
        {validItems.map(item => (
          <div
            key={item.label}
            className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-700/50"
          >
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium uppercase tracking-wider ${item.color}`}>
                {item.label}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white">{item.fix!.headline}</div>
              {item.metric && (
                <div className="text-xs text-zinc-400">{item.metric}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Editorial Note</div>
            <p className="text-sm text-zinc-300">
              The summaries above are derived from canonical metadata and evidence grades.
              They represent factual comparisons, not editorial recommendations.
              An overall recommendation, if provided, reflects editorial judgement based on the evidence — not an algorithmic ranking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
