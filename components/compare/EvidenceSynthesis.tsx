'use client';

import React from 'react';
import type { Fix } from '../../types/canonical';
import { aggregateEvidence } from '../../lib/compare-helpers';
import { EVIDENCE_GRADE_CONFIG } from '../../lib/fix-helpers';

interface EvidenceSynthesisProps {
  fixes: Fix[];
}

export function EvidenceSynthesis({ fixes }: EvidenceSynthesisProps) {
  const evidence = aggregateEvidence(fixes);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Evidence Synthesis</h3>
        <p className="text-sm text-zinc-400 mt-1">
          Aggregated evidence analysis across {fixes.length} solutions
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Average Evidence</div>
          <div className="text-2xl font-bold text-white mt-1">{evidence.averageScore}</div>
          <div className="text-xs text-zinc-400">/ 100</div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Avg Confidence</div>
          <div className="text-2xl font-bold text-white mt-1">{evidence.averageConfidence}%</div>
          <div className="text-xs text-zinc-400">of max</div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Sources</div>
          <div className="text-2xl font-bold text-white mt-1">{evidence.totalSources}</div>
          <div className="text-xs text-zinc-400">cited</div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Evidence Gaps</div>
          <div className={`text-2xl font-bold mt-1 ${evidence.evidenceGaps.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {evidence.evidenceGaps.length}
          </div>
          <div className="text-xs text-zinc-400">identified</div>
        </div>
      </div>

      {Object.keys(evidence.gradeDistribution).length > 0 && (
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Evidence Grade Distribution</div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(evidence.gradeDistribution).map(([grade, count]) => {
              const config = EVIDENCE_GRADE_CONFIG[grade];
              return (
                <div key={grade} className="flex items-center gap-2">
                  {config ? (
                    <span className={`text-xs px-2 py-1 rounded-full ${config.className}`}>
                      {config.label}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-zinc-700/50 text-zinc-400">
                      {grade}
                    </span>
                  )}
                  <span className="text-sm text-zinc-300">×{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {evidence.highestEvidence && evidence.lowestEvidence && evidence.highestEvidence.slug !== evidence.lowestEvidence.slug && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
            <div className="text-xs text-emerald-400 uppercase tracking-wider">Highest Evidence</div>
            <div className="text-sm text-white mt-2 font-medium">{evidence.highestEvidence.headline}</div>
            <div className="text-xs text-zinc-400 mt-1">Score: {evidence.highestEvidence.evidenceScore}/100</div>
          </div>

          <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
            <div className="text-xs text-amber-400 uppercase tracking-wider">Lowest Evidence</div>
            <div className="text-sm text-white mt-2 font-medium">{evidence.lowestEvidence.headline}</div>
            <div className="text-xs text-zinc-400 mt-1">Score: {evidence.lowestEvidence.evidenceScore}/100</div>
          </div>
        </div>
      )}

      {evidence.evidenceGaps.length > 0 && (
        <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
          <div className="text-xs text-amber-400 uppercase tracking-wider mb-3">Evidence Gaps</div>
          <div className="space-y-2">
            {evidence.evidenceGaps.map((gap, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="text-amber-400 mt-0.5">!</span>
                <div>
                  <span className="text-zinc-300 font-medium">{gap.fix}</span>
                  <span className="text-zinc-500"> — </span>
                  <span className="text-zinc-400">{gap.gap}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
