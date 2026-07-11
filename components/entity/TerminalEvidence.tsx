import React from 'react';
import { EntityTerminalViewModel } from '@/types/canonical';

export default function TerminalEvidence({ viewModel }: { viewModel: EntityTerminalViewModel }) {
  const { claims } = viewModel;

  if (!claims || claims.length === 0) return null;

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Verified Claims
        </h2>
        <span className="text-xs text-neutral-500 font-mono">{claims.length} CLAIMS</span>
      </div>

      <div className="space-y-4">
        {claims.map((claim) => (
          <div key={claim.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${claim.status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <div className="flex flex-col gap-2">
                <p className="text-sm text-neutral-200 leading-snug">
                  {claim.claim}
                </p>
                <div className="flex items-center gap-3 text-[10px] uppercase font-mono tracking-widest">
                  <span className="text-neutral-500">SOURCE: <span className="text-neutral-300">{claim.source}</span></span>
                  <span className="text-neutral-500">CONFIDENCE: <span className={claim.confidence > 0.9 ? 'text-emerald-400' : 'text-amber-400'}>{Math.round(claim.confidence * 100)}%</span></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
