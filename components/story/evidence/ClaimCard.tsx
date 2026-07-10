'use client';

import { useState, useId } from 'react';
import { cn } from '@/utils/cn';
import type { StoryClaim } from './types';
import ConfidenceBadge from './ConfidenceBadge';
import SourceGroup from './SourceGroup';

export default function ClaimCard({ claim }: { claim: StoryClaim }) {
  const [hovered, setHovered] = useState(false);
  const uid = useId();

  return (
    <div
      id={claim.id}
      className={cn(
        "bg-surface-secondary border-b border-border transition-all duration-200",
        hovered && "bg-surface-tertiary"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="py-4 sm:py-5 px-1 sm:px-2">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-[0.95rem] text-text-primary font-medium leading-relaxed font-serif">
            {claim.text} 
            {claim.sources.length > 0 && (
              <sup className="ml-1 text-xs text-brand-400 font-sans cursor-pointer hover:underline">[{claim.sources.length}]</sup>
            )}
          </p>
          <ConfidenceBadge status={claim.status} confidence={claim.confidence} />
        </div>

        <div
          className="transition-all duration-200 overflow-hidden"
          style={{
            maxHeight: hovered ? '500px' : '0px',
            opacity: hovered ? 1 : 0,
          }}
        >
          <div className="pt-4 mt-2 border-t border-border space-y-4">
            {claim.supportingEvidence.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">
                  Supporting Evidence
                </span>
                <ul className="space-y-2">
                  {claim.supportingEvidence.map((ev, i) => (
                    <li key={i} className="text-[0.8rem] text-text-secondary flex items-start gap-3 border-l-2 border-brand-400 pl-3">
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Citations</span>
              <SourceGroup sources={claim.sources} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  verified: 'var(--color-green-500)',
  strong: 'var(--color-blue-500)',
  moderate: 'var(--color-brand-400)',
  unverified: 'var(--color-red-500)',
};
