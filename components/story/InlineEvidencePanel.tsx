'use client';

import { useState } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

interface InlineEvidencePanelProps {
  claimId: string;
  statement: string;
  status: 'supported' | 'unverified' | 'mixed' | 'not_supported';
  explanation: string;
  sources?: Array<{ title: string; url: string; publisher?: string }>;
  limitations?: string;
}

export function InlineEvidencePanel({
  claimId,
  statement,
  status,
  explanation,
  sources,
  limitations,
}: InlineEvidencePanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      // TASK-07: evidence interaction signals learning intent.
      captureEvent('evidence_expanded', {
        content_id: claimId,
        claim_id: claimId,
        evidence_path: status,
      });
    }
  };

  const statusBadge =
    status === 'supported'
      ? { label: 'Supported by Evidence', bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' }
      : status === 'mixed'
      ? { label: 'Mixed Evidence', bg: 'bg-amber-950/60 text-amber-400 border-amber-800/40' }
      : status === 'not_supported'
      ? { label: 'Not Supported', bg: 'bg-red-950/60 text-red-400 border-red-800/40' }
      : { label: 'Unverified / Needs Review', bg: 'bg-neutral-900 text-neutral-400 border-neutral-800' };

  return (
    <span className="inline-block my-1">
      <button
        onClick={togglePanel}
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 transition-colors"
        aria-expanded={isOpen}
      >
        <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Evidence [{status}]</span>
      </button>

      {isOpen && (
        <div className="my-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-3 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
              }}
              className="text-neutral-400 hover:text-neutral-300 text-xs font-mono"
            >
              Close ✕
            </button>
          </div>

          <p className="text-sm font-semibold text-white leading-snug">{statement}</p>

          {explanation && <p className="text-xs text-neutral-300 leading-relaxed">{explanation}</p>}

          {limitations && (
            <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/30 text-xs text-amber-300">
              <span className="font-mono uppercase font-bold block mb-0.5">Limitations / Nuance</span>
              {limitations}
            </div>
          )}

          {sources && sources.length > 0 && (
            <div className="pt-2 border-t border-neutral-800 text-xs">
              <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold block mb-1">Sources</span>
              <ul className="space-y-1">
                {sources.map((s, i) => (
                  <li key={i}>
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-analytics="source"
                        data-content-id={claimId}
                        data-source-title={s.title}
                        data-source-domain=""
                        className="text-emerald-400 hover:underline font-medium"
                      >
                        {s.title}
                      </a>
                    ) : (
                      <span className="text-neutral-300">{s.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </span>
  );
}
