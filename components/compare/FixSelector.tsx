'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Fix } from '../../types/canonical';
import { buildCompareUrl, MIN_FIXES, MAX_FIXES, validateComparison } from '../../lib/compare-helpers';
import { MATURITY_CONFIG, INTERVENTION_COLOR_MAP, getEvidenceLabel, getEvidenceTextColor } from '../../lib/fix-helpers';

interface FixSelectorProps {
  fixes: Fix[];
  preselected?: string[];
  sourceSlug?: string;
}

export function FixSelector({ fixes, preselected = [], sourceSlug }: FixSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(preselected));
  const [error, setError] = useState<string | null>(null);

  const toggleFix = useCallback((slug: string) => {
    setError(null);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else if (next.size < MAX_FIXES) {
        next.add(slug);
      } else {
        setError(`Maximum ${MAX_FIXES} solutions can be selected`);
      }
      return next;
    });
  }, []);

  const handleCompare = useCallback(() => {
    const slugs = Array.from(selected);
    const validation = validateComparison(slugs);
    if (!validation.valid) {
      setError(validation.error || 'Invalid selection');
      return;
    }
    router.push(buildCompareUrl(slugs));
  }, [selected, router]);

  const selectedArray = Array.from(selected);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Select Solutions to Compare</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Choose {MIN_FIXES}–{MAX_FIXES} solutions for side-by-side analysis
          </p>
        </div>
        <div className="text-sm text-zinc-500">
          {selected.size}/{MAX_FIXES} selected
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {fixes.map(fix => {
          const isSelected = selected.has(fix.slug);
          const maturity = MATURITY_CONFIG[fix.maturityStatus || 'proposed'];
          const intervention = INTERVENTION_COLOR_MAP[fix.primaryCategory || ''];

          return (
            <button
              key={fix.slug}
              onClick={() => toggleFix(fix.slug)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-brand-400/50 bg-brand-400/5 ring-1 ring-brand-400/20'
                  : 'border-zinc-700/50 bg-zinc-900/30 hover:border-zinc-600/50 hover:bg-zinc-800/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'border-brand-400 bg-brand-400'
                    : 'border-zinc-600'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">{fix.headline}</span>
                    {maturity && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${maturity.className}`}>
                        {maturity.label}
                      </span>
                    )}
                    {intervention && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${intervention}`}>
                        {fix.primaryCategory}
                      </span>
                    )}
                  </div>

                  {fix.problemStatement && (
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{fix.problemStatement}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                    <span className={getEvidenceTextColor(fix.evidenceScore)}>
                      Evidence: {getEvidenceLabel(fix.evidenceScore)}
                    </span>
                    {fix.timeToImpact && (
                      <span>Impact: {fix.timeToImpact}</span>
                    )}
                    {fix.evidenceGrade && (
                      <span>Grade: {fix.evidenceGrade}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedArray.length >= MIN_FIXES && (
        <div className="flex justify-end">
          <button
            onClick={handleCompare}
            className="px-6 py-3 bg-brand-400 text-black font-semibold rounded-xl hover:bg-brand-400/90 transition-colors"
          >
            Compare {selectedArray.length} Solutions
          </button>
        </div>
      )}
    </div>
  );
}
