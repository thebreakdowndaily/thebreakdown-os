import React from 'react';
import { GlobalPrecedentProjection } from '@/types/precedent-explorer';
import Link from 'next/link';

interface GlobalPrecedentsPanelProps {
  projection: GlobalPrecedentProjection;
}

export default function GlobalPrecedentsPanel({ projection }: GlobalPrecedentsPanelProps) {
  const { precedents, precedentCount, descriptiveDisclaimer, problemSlug } = projection;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              {projection.platformVersion} Global Implementation Precedents
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              {precedentCount} Precedents Mapped
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mt-1">
            Global & Historical Implementation Precedents Explorer
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Examine international and historical policy implementations with contextual applicability constraints.
          </p>
        </div>

        {problemSlug && (
          <Link href={`/problems/${problemSlug}`} className="text-xs font-mono text-emerald-400 hover:underline">
            ← Back to Problem Tree
          </Link>
        )}
      </div>

      {/* Descriptive Safeguard Disclaimer (Refinement 1) */}
      <div className="bg-gray-900/80 border border-blue-500/40 rounded-xl p-4 text-xs font-mono text-blue-300 space-y-1">
        <strong className="block uppercase text-[11px] font-bold">🌍 Descriptive Precedent Safeguard</strong>
        <p className="text-gray-300 text-[11px]">{descriptiveDisclaimer}</p>
      </div>

      {/* Precedent Cards */}
      <div className="space-y-6">
        {precedents.map((prec) => (
          <div key={prec.precedentId} className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 space-y-4 font-mono text-xs">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/40 font-bold uppercase">
                  {prec.region} • {prec.implementationYearRange}
                </span>
                <h4 className="text-lg font-bold text-gray-100 mt-2">{prec.jurisdictionName}</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase">Context Similarity</span>
                <strong className="text-base text-emerald-400">{prec.contextSimilarityScore}% Match</strong>
              </div>
            </div>

            <p className="text-gray-300 text-xs">{prec.contextSummary}</p>

            {/* Comparable vs Differences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-800/40 p-3 rounded-lg border border-gray-800">
              <div>
                <strong className="text-emerald-300 text-[10px] uppercase block mb-1">Comparable Characteristics:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-gray-300 text-[11px]">
                  {prec.comparableCharacteristics.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong className="text-amber-300 text-[10px] uppercase block mb-1">Major Differences:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-gray-300 text-[11px]">
                  {prec.majorDifferences.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-gray-800">
              <span>Chronology: {prec.chronology.length} Milestones</span>
              <span>Outcomes: {prec.observedOutcomes.length} Metrics</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
