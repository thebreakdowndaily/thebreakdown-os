'use client';

import React, { useState } from 'react';
import type { SourcesMethodologyData } from './types';

export default function SourcesMethodologyBlock({ cases }: SourcesMethodologyData) {
  const [filter, setFilter] = useState<string>('ALL');

  const categories = ['ALL', 'FACT', 'COURT OBSERVATION', 'AUDIT FINDING', 'ATTRIBUTED CLAIM', 'REPORTER ANALYSIS'] as const;

  const filteredCases = filter === 'ALL' 
    ? (cases || []) 
    : (cases || []).filter((c) => c.category === filter);

  return (
    <section 
      id="sources-methodology"
      aria-label="Sources and Evidentiary Methodology" 
      className="my-12 p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-neutral-800 shadow-xl"
    >
      <header className="border-b border-neutral-800 pb-5 mb-6">
        <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#FFD900] bg-[#FFD900]/10 px-2.5 py-0.5 rounded border border-[#FFD900]/20 inline-block mb-2">
          Methodological Transparency
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Sources, Jurisprudence &amp; Methodology
        </h3>
        <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
          In accordance with The Breakdown&apos;s Editorial Constitution, every material assertion is classified by its evidentiary category.
        </p>

        {/* Filter Pills */}
        <div 
          role="group" 
          aria-label="Filter sources by evidence category"
          className="flex flex-wrap gap-2 mt-4"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              aria-pressed={filter === cat}
              className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-colors ${
                filter === cat
                  ? 'bg-[#FFD900] text-black font-bold'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Case Dossiers Accordion / List */}
      <div className="space-y-4">
        {filteredCases.map((c, i) => (
          <details
            key={i}
            className="group rounded-xl bg-[#141414] border border-neutral-800 p-4 open:bg-[#181818] transition-colors"
          >
            <summary className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer list-none focus:outline-none focus:ring-1 focus:ring-[#FFD900] rounded">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                    c.category === 'FACT'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : c.category === 'AUDIT FINDING'
                      ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                      : c.category === 'COURT OBSERVATION'
                      ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                      : c.category === 'ATTRIBUTED CLAIM'
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  }`}
                >
                  {c.category}
                </span>
                <h4 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#FFD900] transition-colors">
                  {c.caseTitle}
                </h4>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                {c.date} &darr;
              </span>
            </summary>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 text-xs sm:text-sm space-y-2">
              <div>
                <strong className="text-neutral-400 font-mono text-[11px] uppercase block">
                  What This Source Directly Establishes:
                </strong>
                <p className="text-neutral-200 leading-relaxed mt-0.5">
                  {c.whatSourceEstablishes}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-mono text-neutral-400">
                <div>
                  <span className="text-neutral-500 block">Primary Source:</span>
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-[#FFD900] underline"
                    >
                      {c.primarySource}
                    </a>
                  ) : (
                    <span className="text-neutral-300">{c.primarySource}</span>
                  )}
                </div>
                {c.secondarySource && (
                  <div>
                    <span className="text-neutral-500 block">Secondary Cross-Check:</span>
                    <span className="text-neutral-300">{c.secondarySource}</span>
                  </div>
                )}
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
