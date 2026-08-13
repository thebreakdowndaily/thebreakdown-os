'use client';

import React from 'react';
import type { ClaimData } from './types';

interface ClaimCardProps {
  claim: ClaimData;
  onClick?: (claim: ClaimData) => void;
}

export default function ClaimCard({ claim, onClick }: ClaimCardProps) {
  const statusStyles = {
    verified: 'border-[#10b981]/30 bg-[#10b981]/5 text-[#10b981]',
    strong: 'border-[#3b82f6]/30 bg-[#3b82f6]/5 text-[#3b82f6]',
    moderate: 'border-[#f59e0b]/30 bg-[#f59e0b]/5 text-[#f59e0b]',
    contested: 'border-[#ef4444]/30 bg-[#ef4444]/5 text-[#ef4444]',
    debunked: 'border-[#71717a]/30 bg-[#71717a]/5 text-[#71717a]',
  };

  const statusLabels = {
    verified: 'Verified',
    strong: 'Strong',
    moderate: 'Moderate',
    contested: 'Contested',
    debunked: 'Debunked',
  };

  return (
    <div
      onClick={() => onClick?.(claim)}
      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${statusStyles[claim.status]} hover:shadow-md hover:scale-[1.01]`}
      role="button"
      tabIndex={0}
      aria-label={`Claim: ${claim.text}. Status: ${statusLabels[claim.status]}`}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
          {statusLabels[claim.status]} • {claim.confidence}% Confidence
        </span>
        {claim.verifiedAt && (
          <span className="text-[9px] font-mono opacity-60">
            Checked: {claim.verifiedAt}
          </span>
        )}
      </div>
      <p className="text-sm font-medium leading-relaxed text-[#F5F5F5] mb-2 font-sans">
        &ldquo;{claim.text}&rdquo;
      </p>
      {claim.explanation && (
        <p className="text-xs text-[#A1A1AA] leading-relaxed font-sans mb-3">
          {claim.explanation}
        </p>
      )}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#27272a]/20">
        <span className="text-[9px] font-mono text-[#737373] uppercase tracking-widest">Sources:</span>
        <div className="flex flex-wrap gap-1.5">
          {claim.sources.map((s, i) => (
            <span key={i} className="text-[9px] font-mono bg-[#1A1A1A] border border-[#27272a] text-[#A1A1AA] px-1.5 py-0.5 rounded-sm">
              {s.name} {s.tier ? `(T${s.tier})` : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
