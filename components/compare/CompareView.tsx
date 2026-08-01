'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Fix } from '../../types/canonical';
import {
  parseCompareSlugs,
  resolveFixes,
  buildCompareUrl,
  validateComparison,
  MIN_FIXES,
  MAX_FIXES,
} from '../../lib/compare-helpers';
import { FixSelector } from './FixSelector';
import { ComparisonMatrix } from './ComparisonMatrix';
import { EvidenceSynthesis } from './EvidenceSynthesis';
import { EditorialRecommendation } from './EditorialRecommendation';
import Link from 'next/link';

interface CompareViewProps {
  allFixes: Fix[];
  initialFixes: string | null;
}

export function CompareView({ allFixes, initialFixes }: CompareViewProps) {
  const router = useRouter();
  const initialSlugs = useMemo(() => parseCompareSlugs(initialFixes ? `?fixes=${initialFixes}` : null), [initialFixes]);
  const selectedFixes = useMemo(() => resolveFixes(initialSlugs, allFixes), [initialSlugs, allFixes]);

  const [showSelector, setShowSelector] = useState(selectedFixes.length < MIN_FIXES);

  const handleSelect = useCallback((slugs: string[]) => {
    const validation = validateComparison(slugs);
    if (validation.valid) {
      router.push(buildCompareUrl(slugs));
      setShowSelector(false);
    }
  }, [router]);

  if (selectedFixes.length < MIN_FIXES) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/fix"
            className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            ← Back to Fix Hub
          </Link>
        </div>
        <FixSelector
          fixes={allFixes}
          preselected={initialSlugs}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/fix"
          className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          ← Back to Fix Hub
        </Link>
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="text-sm text-brand-400 hover:text-brand-400/80 transition-colors"
        >
          {showSelector ? 'Hide selector' : 'Change selection'}
        </button>
      </div>

      {showSelector && (
        <FixSelector
          fixes={allFixes}
          preselected={initialSlugs}
        />
      )}

      <ComparisonMatrix fixes={selectedFixes} />
      <EvidenceSynthesis fixes={selectedFixes} />
      <EditorialRecommendation fixes={selectedFixes} />

      <div className="border-t border-zinc-800 pt-8 mt-8">
        <div className="flex flex-wrap gap-3">
          {selectedFixes.map(fix => (
            <Link
              key={fix.slug}
              href={`/fix/${fix.slug}`}
              className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-300 hover:text-white hover:border-zinc-600/50 transition-colors"
            >
              Read full analysis: {fix.headline}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
