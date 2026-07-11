import React from 'react';
import { AssetReference } from '@/types/canonical';

export default function DocumentPanel({ documents }: { documents?: AssetReference[] }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col min-h-[200px] opacity-50">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 mb-4">
          Primary Source Documents
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs font-mono text-neutral-500 uppercase">No primary documents linked.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Primary Source Documents
        </h2>
        <span className="text-xs text-neutral-500 font-mono">{documents.length} FILES</span>
      </div>

      <div className="flex flex-col gap-3">
        {documents.map((doc, i) => (
          <div key={i} className="flex items-center gap-4 p-3 border border-neutral-800 bg-neutral-900 hover:border-amber-500/50 rounded-lg transition-colors cursor-pointer group">
            {/* Mock PDF/DOC Icon */}
            <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-neutral-200 truncate group-hover:text-amber-400 transition-colors">
                {/* Mocking name since AssetReference only has assetId currently without a resolver */}
                Document_{doc.assetId.substring(0, 8)}.pdf
              </h3>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                Role: {doc.role}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-neutral-500 font-mono">2.4 MB</span>
              <button className="text-xs text-blue-400 hover:underline">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
