'use client';

import React, { useState } from 'react';
import type { Fix } from '../../types/canonical';
import {
  COMPARISON_DIMENSIONS,
  getComparisonValue,
  getComparisonFraction,
  getComparisonBarColor,
} from '../../lib/compare-helpers';
import { MATURITY_CONFIG, INTERVENTION_COLOR_MAP, REVERSIBILITY_CONFIG, SCALABILITY_CONFIG } from '../../lib/compare-helpers';

interface ComparisonMatrixProps {
  fixes: Fix[];
}

type Category = 'all' | 'evidence' | 'implementation' | 'impact' | 'context';

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All',
  evidence: 'Evidence',
  implementation: 'Implementation',
  impact: 'Impact',
  context: 'Context',
};

export function ComparisonMatrix({ fixes }: ComparisonMatrixProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const dimensions = activeCategory === 'all'
    ? [...COMPARISON_DIMENSIONS]
    : COMPARISON_DIMENSIONS.filter(d => d.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Structured Comparison</h3>
        <div className="flex gap-1 bg-zinc-900/50 rounded-lg p-1">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeCategory === cat
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700/50">
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider py-3 px-4 w-[180px]">
                Dimension
              </th>
              {fixes.map(fix => (
                <th key={fix.slug} className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider py-3 px-4">
                  <div className="space-y-1">
                    <div className="font-semibold text-white normal-case text-sm">{fix.headline}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {MATURITY_CONFIG[fix.maturityStatus || 'proposed'] && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${MATURITY_CONFIG[fix.maturityStatus || 'proposed'].className}`}>
                          {MATURITY_CONFIG[fix.maturityStatus || 'proposed'].label}
                        </span>
                      )}
                      {fix.primaryCategory && INTERVENTION_COLOR_MAP[fix.primaryCategory] && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${INTERVENTION_COLOR_MAP[fix.primaryCategory]}`}>
                          {fix.primaryCategory}
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dimensions.map((dim, idx) => {
              const hasBar = ['evidenceScore', 'confidence', 'feasibility', 'politicalDifficulty'].includes(dim.key);
              const even = idx % 2 === 0;

              return (
                <tr
                  key={dim.key}
                  className={`border-b border-zinc-800/50 ${even ? 'bg-zinc-900/20' : ''}`}
                >
                  <td className="py-3 px-4 text-sm font-medium text-zinc-300">
                    {dim.label}
                  </td>
                  {fixes.map(fix => {
                    const value = getComparisonValue(fix, dim.key);
                    const frac = hasBar ? getComparisonFraction(fix, dim.key) : null;
                    const barColor = hasBar ? getComparisonBarColor(fix, dim.key) : null;

                    return (
                      <td key={fix.slug} className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="text-sm text-zinc-200">{value}</span>
                          {frac !== null && barColor !== null && (
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${barColor}`}
                                style={{ width: `${Math.min(frac * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
