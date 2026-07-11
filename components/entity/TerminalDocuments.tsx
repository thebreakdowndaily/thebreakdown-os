import React from 'react';
import Link from 'next/link';
import { EntityTerminalViewModel } from '@/types/canonical';

export default function TerminalDocuments({ viewModel }: { viewModel: EntityTerminalViewModel }) {
  const { documents } = viewModel;

  if (!documents || documents.length === 0) return null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Primary Documents
        </h2>
        <span className="text-xs text-neutral-500 font-mono">{documents.length} FILES</span>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {documents.map((doc) => (
          <Link key={doc.id} href={`/dataset/${doc.slug || doc.id}`} className="group flex items-center justify-between p-3 rounded-lg bg-[#0c0c0c] border border-neutral-800/50 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-amber-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-neutral-300 font-medium group-hover:text-amber-400 transition-colors truncate max-w-[200px]">
                  {doc.title}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  {doc.metadata?.mimeType || 'DOCUMENT'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
