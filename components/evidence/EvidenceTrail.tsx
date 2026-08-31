'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { captureEvent, buildOutboundParams } from '@/lib/analytics/capture';

export interface EvidenceTrailSource {
  title: string;
  url?: string;
  type?: string;
  tier?: number;
  tierLabel?: string;
  isPrimary?: boolean;
}

export interface EvidenceTrailDocument {
  title: string;
  url?: string;
  type?: string;
  date?: string;
  summary?: string;
}

export interface EvidenceTrailItem {
  id?: string;
  claim: string;
  explanation?: string;
  status?: 'supported' | 'mixed' | 'not_supported' | 'uncertain' | 'verified' | 'true' | 'false' | 'misleading' | string;
  confidence?: number;
  sources?: EvidenceTrailSource[];
  primaryDocument?: EvidenceTrailDocument;
  lastVerified?: string;
}

export interface EvidenceTrailProps {
  storySlug: string;
  items?: EvidenceTrailItem[];
  evidenceScore?: number;
  relatedTrackerSlug?: string;
  relatedTrackerTitle?: string;
  className?: string;
}

const statusBadgeConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  supported: { label: 'Supported', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
  verified: { label: 'Verified', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
  true: { label: 'Verified True', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
  mixed: { label: 'Mixed / Partial', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60' },
  misleading: { label: 'Misleading / Contextual', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60' },
  not_supported: { label: 'Not Supported', bg: 'bg-red-950/60', text: 'text-red-400', border: 'border-red-800/60' },
  false: { label: 'False', bg: 'bg-red-950/60', text: 'text-red-400', border: 'border-red-800/60' },
  uncertain: { label: 'Uncertain', bg: 'bg-neutral-900', text: 'text-neutral-400', border: 'border-neutral-700' },
};

export default function EvidenceTrail({
  storySlug,
  items = [],
  evidenceScore,
  relatedTrackerSlug,
  relatedTrackerTitle,
  className = '',
}: EvidenceTrailProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedClaims, setExpandedClaims] = useState<Record<number, boolean>>({});

  if (!items || items.length === 0) return null;

  const toggleMain = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState) {
      captureEvent('evidence_expanded', {
        content_id: storySlug,
        claim_id: 'all',
        evidence_path: 'story_trail',
      });
    }
  };

  const toggleClaim = (index: number, claimId?: string) => {
    setExpandedClaims((prev) => {
      const nextVal = !prev[index];
      if (nextVal) {
        captureEvent('evidence_expanded', {
          content_id: storySlug,
          claim_id: claimId || String(index + 1),
          evidence_path: 'claim_item',
        });
      }
      return { ...prev, [index]: nextVal };
    });
  };

  const totalSources = items.reduce((acc, it) => acc + (it.sources?.length || 0), 0);

  return (
    <section
      aria-label="Evidence Provenance Trail"
      className={`my-8 p-5 sm:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 shadow-lg text-neutral-100 ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-emerald-400">
              Evidence Provenance Trail
            </span>
            {evidenceScore && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Score: {evidenceScore}/100
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            Why We Say This — Step-by-Step Verification Chain
          </h3>
          <p className="text-xs text-neutral-400">
            {items.length} verified {items.length === 1 ? 'claim' : 'claims'} supported by {totalSources > 0 ? totalSources : 'primary'} cited sources &amp; official documents.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {relatedTrackerSlug && (
            <Link
              href={`/trackers/${relatedTrackerSlug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-colors"
            >
              <span>📊 Live Tracker</span>
            </Link>
          )}

          <button
            type="button"
            onClick={toggleMain}
            aria-expanded={isExpanded}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-medium border border-neutral-700 transition-colors flex items-center gap-2"
          >
            <span>{isExpanded ? 'Collapse Trail' : 'Inspect Evidence'}</span>
            <span aria-hidden="true" className="text-neutral-400">{isExpanded ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {/* Concise Preview (when collapsed) */}
      {!isExpanded && (
        <div className="pt-4 space-y-2">
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/60 flex items-start justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block">
                Primary Core Assertion:
              </span>
              <p className="font-medium text-neutral-200 leading-snug">{items[0].claim}</p>
              {items[0].sources && items[0].sources.length > 0 && (
                <p className="text-[11px] text-neutral-400 font-mono">
                  Primary Source: <span className="text-emerald-400">{items[0].sources[0].title}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={toggleMain}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline shrink-0 mt-1"
            >
              Expand All ({items.length}) →
            </button>
          </div>
        </div>
      )}

      {/* Expanded Provenance Chain */}
      {isExpanded && (
        <div className="pt-6 space-y-5">
          {items.map((item, idx) => {
            const badge = statusBadgeConfig[item.status || 'supported'] || statusBadgeConfig.supported;
            const isClaimOpen = expandedClaims[idx] !== false; // default open in expanded view

            return (
              <article
                key={idx}
                className="p-4 sm:p-5 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-3.5"
              >
                {/* 1. What We Know (Claim) */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-500">[{idx + 1}]</span>
                      <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">
                        What We Assert:
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-white leading-snug">
                    {item.claim}
                  </h4>
                </div>

                {/* 2. Why We Know It (Evidence & Explanation) */}
                {item.explanation && (
                  <div className="pl-3.5 border-l-2 border-emerald-500/40 space-y-1 text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-900/30 p-2.5 rounded-r-lg">
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                      Why We Know It (Empirical Evidence):
                    </span>
                    <p>{item.explanation}</p>
                  </div>
                )}

                {/* 3. Who Published It (Sources) & 4. Primary Document */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  {/* Sources List */}
                  {item.sources && item.sources.length > 0 && (
                    <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                        Verified Sources ({item.sources.length}):
                      </span>
                      <div className="space-y-1">
                        {item.sources.map((src, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between gap-2">
                            <span className="text-neutral-200 truncate">{src.title}</span>
                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  captureEvent('source_opened', buildOutboundParams(storySlug, src.url || '', src.title));
                                }}
                                className="text-emerald-400 hover:text-emerald-300 underline shrink-0"
                              >
                                View ↗
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Document */}
                  {item.primaryDocument && (
                    <div className="p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-sky-400 block">
                        Primary Official Document:
                      </span>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-neutral-200 font-sans font-medium">{item.primaryDocument.title}</p>
                          {item.primaryDocument.date && (
                            <span className="text-[10px] text-neutral-400">{item.primaryDocument.date}</span>
                          )}
                        </div>
                        {item.primaryDocument.url && (
                          <a
                            href={item.primaryDocument.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              captureEvent('document_opened', {
                                content_id: storySlug,
                                document_title: item.primaryDocument?.title || '',
                              });
                            }}
                            className="text-sky-400 hover:text-sky-300 underline shrink-0"
                          >
                            Read Doc ↗
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification Date */}
                {item.lastVerified && (
                  <div className="text-[10px] font-mono text-neutral-500 pt-1">
                    Last independent verification audit: <span className="text-neutral-400">{item.lastVerified}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
