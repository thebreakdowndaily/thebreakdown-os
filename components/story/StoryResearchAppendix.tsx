'use client';

import { useState } from 'react';
import type { ResearchAppendixPresentation } from '@/lib/story/presentation-model';

interface StoryResearchAppendixProps {
  research?: ResearchAppendixPresentation;
}

export function StoryResearchAppendix({ research }: StoryResearchAppendixProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!research) return null;

  const { claims, sources, faq, versionHistory } = research;
  if ((!claims || claims.length === 0) && (!sources || sources.length === 0) && (!faq || faq.length === 0)) {
    return null;
  }

  // De-duplicate sources by URL and title to eliminate repetitive displays
  const uniqueSources = sources ? Array.from(
    new Map(sources.map((s) => [s.url || s.title, s])).values()
  ) : [];

  return (
    <section id="research-appendix" className="my-12 pt-8 border-t border-neutral-800/80">
      <details
        className="group border border-neutral-800/90 rounded-2xl bg-neutral-900/50 backdrop-blur-sm overflow-hidden transition-all duration-200"
        open={isOpen}
        onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="p-6 cursor-pointer list-none flex items-center justify-between hover:bg-neutral-800/40 transition-colors select-none">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400">
                Sources & Methodology
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Evidence Ledger & Source Notes
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              {uniqueSources.length} source{uniqueSources.length === 1 ? '' : 's'} · {claims?.length || 0} documented claim{claims?.length === 1 ? '' : 's'} · Click to {isOpen ? 'collapse' : 'inspect verification ledger'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-neutral-400 group-hover:text-emerald-400 shrink-0 ml-4">
            <span className="hidden sm:inline">{isOpen ? 'Hide Evidence' : 'Inspect Evidence'}</span>
            <span className="text-base group-open:rotate-180 transition-transform duration-200" aria-hidden="true">
              ▼
            </span>
          </div>
        </summary>

        <div className="p-6 pt-2 border-t border-neutral-800/80 space-y-8">
          {/* De-duplicated Primary Sources Table */}
          {uniqueSources.length > 0 && (
            <div className="space-y-3" id="sources-ledger">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400">
                  Documents & Reporting ({uniqueSources.length})
                </h4>
                <span className="text-[11px] font-mono text-neutral-400">
                  Source links, deduplicated
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uniqueSources.map((src, i) => (
                  <div
                    key={src.url || i}
                    id={`source-${i + 1}`}
                    className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col justify-between gap-2.5 hover:border-neutral-700/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                          [{i + 1}] {src.organization || src.publisher || 'Official Record'}
                        </span>
                        {src.sourceType && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                            {src.sourceType}
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                        {src.title}
                      </h5>
                      {src.date && (
                        <p className="text-[11px] text-neutral-400 font-mono">Date: {src.date}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                      {src.url ? (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] rounded text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1.5"
                        >
                          <span>Open source</span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <span className="text-[11px] font-mono text-neutral-400">
                          Archival Repository Record
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documented Claims & Findings Ledger */}
          {claims && claims.length > 0 && (
            <div className="space-y-3" id="claims-ledger">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400">
                  Documented Claims & Findings ({claims.length})
                </h4>
                <span className="text-[11px] font-mono text-neutral-400">
                  Verification status mapped to evidence
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {claims.map((claim) => {
                  const badge =
                    claim.status === 'supported'
                      ? { label: 'Verified Finding', bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' }
                      : claim.status === 'mixed'
                      ? { label: 'Mixed / Developing', bg: 'bg-amber-950/60 text-amber-400 border-amber-800/40' }
                      : claim.status === 'not_supported'
                      ? { label: 'Clarified Misconception', bg: 'bg-red-950/60 text-red-400 border-red-800/40' }
                      : { label: 'Documented Claim', bg: 'bg-neutral-900 text-neutral-400 border-neutral-800' };

                  return (
                    <article
                      key={claim.id}
                      aria-labelledby={`claim-title-${claim.id}`}
                      className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">ID: {claim.id}</span>
                      </div>
                      <p id={`claim-title-${claim.id}`} className="text-xs sm:text-sm font-semibold text-white leading-snug">
                        {claim.statement}
                      </p>
                      {claim.explanation && (
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {claim.explanation}
                        </p>
                      )}
                      {claim.sources && claim.sources.length > 0 && (
                        <div className="pt-1.5 text-xs text-neutral-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-mono text-[10px] uppercase font-bold text-neutral-400">
                            Citations:
                          </span>
                          {claim.sources.map((s, i) => (
                            <span key={i} className="text-emerald-400 text-xs">
                              {s.url ? (
                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {s.title}
                                </a>
                              ) : (
                                s.title
                              )}
                              {i < claim.sources.length - 1 && ' ·'}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Research & Editorial Methodology */}
          <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/60 space-y-2 text-xs text-neutral-400">
            <h5 className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Methodology & Fact-Checking Standard
            </h5>
            <p className="leading-relaxed">
              Every factual finding reported by The Breakdown is verified against primary statutory gazettes, parliamentary filings, regulatory disclosures, and peer-reviewed empirical datasets. All claims undergo our 7-Phase Gold Standard review. Where evidence is evolving or conflicting interpretations exist, findings are explicitly demarcated in the Claims Ledger.
            </p>
          </div>

          {/* FAQ Accordion */}
          {faq && faq.length > 0 && (
            <div className="space-y-3" id="faq">
              <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400">
                Frequently Asked Questions
              </h4>
              <div className="space-y-2">
                {faq.map((item, i) => (
                  <details key={i} className="group p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                    <summary className="font-semibold text-xs sm:text-sm text-white cursor-pointer list-none flex items-center justify-between">
                      <span>{item.question}</span>
                      <span aria-hidden="true" className="text-neutral-400 group-open:rotate-180 transition-transform font-mono text-xs">▼</span>
                    </summary>
                    <p className="mt-2 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-2">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Revision History */}
          {versionHistory && versionHistory.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-neutral-800/60">
              <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-neutral-400">
                Revision & Corrections History
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-400 font-mono">
                {versionHistory.map((v, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-neutral-400 shrink-0">{v.date}</span>
                    <span className="text-neutral-300">{v.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
