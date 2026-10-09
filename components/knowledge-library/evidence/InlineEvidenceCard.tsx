'use client';

import React, { useState } from 'react';
import type { EvidenceRef } from '@/types/canonical';
import { getSource } from '@/lib/knowledge/source-registry';

interface InlineEvidenceCardProps {
  evidence: EvidenceRef[];
}

export function InlineEvidenceCard({ evidence }: InlineEvidenceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!evidence || evidence.length === 0) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div className="mt-2" onKeyDown={handleKeyDown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center justify-between w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
            {evidence.length}
          </span>
          View Evidence
        </span>
        <span aria-hidden="true" className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-4 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
          {evidence.map((e, i) => {
            const src = getSource(e.sourceId);
            if (!src) return null;
            return (
              <div key={i} className="text-sm border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start gap-3 mb-1.5">
                  <span className="font-semibold text-slate-900 leading-snug">{src.title}</span>
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline shrink-0 text-xs font-medium">
                      View Source
                    </a>
                  )}
                </div>
                {(src.publisher || src.accessedAt) && (
                  <p className="text-xs text-slate-500 mb-2 font-mono">
                    {src.publisher}{src.publisher && src.accessedAt ? ' • ' : ''}{src.accessedAt ? `Retrieved: ${new Date(src.accessedAt).toLocaleDateString()}` : ''}
                  </p>
                )}
                <div className="pl-3 border-l-2 border-blue-300 mt-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${
                      e.relevance === 'direct' ? 'text-blue-600' :
                      e.relevance === 'supporting' ? 'text-teal-600' : 'text-slate-500'
                  }`}>
                    {e.relevance}
                  </span>
                  <p className="text-slate-700 leading-relaxed italic">"{e.excerpt}"</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
