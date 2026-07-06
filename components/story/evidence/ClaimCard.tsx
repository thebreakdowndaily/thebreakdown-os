'use client';

import { useState, useId } from 'react';
import type { StoryClaim } from './types';
import ConfidenceBadge from './ConfidenceBadge';
import SourceGroup from './SourceGroup';

export default function ClaimCard({ claim }: { claim: StoryClaim }) {
  const [hovered, setHovered] = useState(false);
  const uid = useId();

  return (
    <div
      id={claim.id}
      className="rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] transition-all duration-200"
      style={{
        borderColor: hovered ? `${STATUS_COLORS[claim.status]}40` : undefined,
        boxShadow: hovered ? `0 0 0 1px ${STATUS_COLORS[claim.status]}20` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-sm text-[#F5F5F5] font-medium leading-relaxed">{claim.text}</p>
          <ConfidenceBadge status={claim.status} confidence={claim.confidence} />
        </div>

        <div className="flex items-center gap-4 text-xs text-[#A1A1AA]/60 mb-3">
          <span>Primary Sources: <span className="text-[#A1A1AA] tabular-nums">{claim.sources.length}</span></span>
          {claim.supportingEvidence.length > 0 && (
            <span>
              Evidence: <span className="text-[#A1A1AA] tabular-nums">{claim.supportingEvidence.length}</span> items
            </span>
          )}
        </div>

        <div
          className="transition-all duration-200 overflow-hidden"
          style={{
            maxHeight: hovered ? '500px' : '0px',
            opacity: hovered ? 1 : 0,
          }}
        >
          <div className="pt-3 border-t border-[#2A2A2A] space-y-3">
            {claim.supportingEvidence.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1.5 block">
                  Supporting Evidence
                </span>
                <ul className="space-y-1">
                  {claim.supportingEvidence.map((ev, i) => (
                    <li key={i} className="text-xs text-[#A1A1AA]/70 flex items-start gap-2">
                      <span className="text-[#D4A843] mt-0.5 shrink-0">&#9654;</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1.5 block">Sources</span>
              <SourceGroup sources={claim.sources} />
            </div>

            <a
              href={`#claim-${claim.id}-sources`}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#D4A843] hover:text-[#D4A843]/80 transition-colors"
            >
              View Sources &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  verified: '#22C55E',
  strong: '#3B82F6',
  moderate: '#D4A843',
  unverified: '#EF4444',
};
