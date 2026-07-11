import React from 'react';
import Link from 'next/link';
import { Claim } from '@/types/canonical';

export default function EvidencePanel({ claims }: { claims?: Claim[] }) {
  if (!claims || claims.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col min-h-[200px] opacity-50">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 mb-4">
          Verified Evidence
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs font-mono text-neutral-500 uppercase">No extracted claims found.</span>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'strong': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'moderate': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-neutral-400 bg-neutral-800 border-neutral-700';
    }
  };

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Verified Evidence
        </h2>
        <span className="text-xs text-neutral-500 font-mono">{claims.length} CLAIMS</span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
        {claims.map((claim) => (
          <div key={claim.id} className="border border-neutral-800 rounded-lg p-4 bg-neutral-900 group transition-all hover:border-neutral-700">
            <div className="flex items-start justify-between gap-4 mb-3">
              <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${getStatusColor(claim.status)}`}>
                {claim.status}
              </span>
              <span className="text-xs font-mono text-emerald-400">
                {claim.confidence.toFixed(2)} CONF
              </span>
            </div>
            
            <p className="text-sm text-neutral-200 leading-relaxed font-medium mb-3">
              "{claim.claim}"
            </p>
            
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800/50 mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-neutral-500">Tier</span>
                <span className="text-xs font-mono text-neutral-400">T{claim.tier}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-neutral-500">Source</span>
                {claim.sourceUrl ? (
                  <a href={claim.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1">
                    {claim.source.substring(0, 15)}... <span className="text-[10px]">↗</span>
                  </a>
                ) : (
                  <span className="text-xs font-mono text-neutral-500">{claim.source}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
