'use client';

import React from 'react';
import type { ClaimData } from './types';
import CitationLink from './CitationLink';

interface ProvenanceDrawerProps {
  claim: ClaimData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProvenanceDrawer({ claim, isOpen, onClose }: ProvenanceDrawerProps) {
  if (!isOpen || !claim) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Provenance details"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg h-full bg-[#0A0A0A] border-l border-[#27272a] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4A843]">
                Provenance Spine
              </span>
              <h2 className="text-lg font-bold text-[#F5F5F5] mt-1 font-serif">Verification Details</h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#A1A1AA] hover:text-white font-mono text-xs border border-[#27272a] rounded px-2 py-1 bg-[#1A1A1A]"
              aria-label="Close drawer"
            >
              Close
            </button>
          </div>

          {/* Statement */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#737373]">Claim statement</h3>
            <div className="p-4 bg-[#121212] border border-[#27272a] rounded-lg">
              <p className="text-sm font-semibold italic text-[#F5F5F5] leading-relaxed">
                &ldquo;{claim.text}&rdquo;
              </p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#121212] border border-[#27272a] rounded-lg text-center">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[#737373] mb-1">Status</span>
              <span className="text-sm font-bold uppercase text-[#D4A843]">{claim.status}</span>
            </div>
            <div className="p-3 bg-[#121212] border border-[#27272a] rounded-lg text-center">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[#737373] mb-1">Confidence</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{claim.confidence}%</span>
            </div>
          </div>

          {/* Sourcing Spine */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#737373]">Sourcing Spine</h3>
            <div className="space-y-2">
              {claim.sources.map((src, i) => (
                <div key={i} className="p-3 bg-[#121212]/50 border border-[#27272a]/60 rounded-md flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-[#F5F5F5]">{src.name}</span>
                    <span className="text-[10px] text-[#A1A1AA]">{src.group === 'primary' ? 'Primary Source' : 'Secondary/Context'}</span>
                  </div>
                  <CitationLink source={src} />
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Evidence Chain */}
          {claim.supportingEvidence && claim.supportingEvidence.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#737373]">Evidence Chain</h3>
              <ul className="list-disc pl-5 space-y-2 text-xs text-[#A1A1AA] font-sans">
                {claim.supportingEvidence.map((e, idx) => (
                  <li key={idx} className="leading-relaxed">{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#27272a] pt-4 mt-6 text-[9px] font-mono text-[#737373] flex items-center justify-between">
          <span>Verification Engine v2.0</span>
          <span>Checked: {claim.verifiedAt || 'n/a'}</span>
        </div>
      </div>
    </div>
  );
}
