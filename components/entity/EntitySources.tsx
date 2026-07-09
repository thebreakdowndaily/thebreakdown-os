import React from 'react';
import type { PrimarySource } from '@/utils/types';

interface EntitySourcesProps {
  sources: PrimarySource[];
}

export default function EntitySources({ sources }: EntitySourcesProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="w-full">
      <ul className="space-y-4">
        {sources.map((source, i) => (
          <li key={i} className="group relative bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-sm font-medium text-neutral-200 group-hover:text-amber-400 transition-colors">
                    {source.name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-neutral-500 bg-neutral-800">
                    {source.type || 'Source'}
                  </span>
                </div>
                {source.description && (
                  <p className="text-sm text-neutral-400 leading-relaxed mb-3 max-w-3xl">
                    {source.description}
                  </p>
                )}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-amber-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Source
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
