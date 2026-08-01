'use client';

import { useState, useId } from 'react';
import { cn } from '@/utils/cn';
import type { StoryClaim } from './types';
import ConfidenceBadge from './ConfidenceBadge';
import SourceGroup from './SourceGroup';

function normalizeCounterArgument(ca: any): { title?: string; argument: string; source?: string; confidence?: string } {
  if (typeof ca === 'string') {
    return { argument: ca };
  }
  if (ca && typeof ca === 'object') {
    return {
      title: ca.title || ca.viewpoint || undefined,
      argument: ca.argument || '',
      source: ca.source || ca.proponents || undefined,
      confidence: ca.confidence || undefined,
    };
  }
  return { argument: '' };
}

export default function ClaimCard({ claim, index }: { claim: StoryClaim; index?: number }) {
  const [hovered, setHovered] = useState(false);
  const uid = useId();

  const match = claim.id.match(/^claim-(.+)-v\d+-[a-f0-9]{12}$/) || claim.id.match(/^claim-(.+)-[a-f0-9]{12}$/) || claim.id.match(/^claim-(.+)-[^-]+$/);
  const storySlug = match ? match[1] : '';
  const legacyId = storySlug && typeof index === 'number' ? `claim-${storySlug}-${index}` : undefined;

  return (
    <div
      id={claim.id}
      className={cn(
        "relative bg-surface-secondary border-b border-border transition-all duration-200",
        hovered && "bg-surface-tertiary"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {legacyId && (
        <span id={legacyId} className="absolute -top-20" aria-hidden="true" />
      )}
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
            maxHeight: hovered ? '700px' : '0px',
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

            {claim.counterArguments && claim.counterArguments.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block" id={`ca-heading-${uid}`}>
                  Alternative Viewpoints
                </h4>
                <ul className="space-y-3" aria-labelledby={`ca-heading-${uid}`}>
                  {claim.counterArguments.map((ca, i) => {
                    const norm = normalizeCounterArgument(ca);
                    if (!norm.argument) return null;
                    return (
                      <li key={i} className="text-[0.8rem] text-text-secondary flex flex-col gap-1 border-l-2 border-red-500/60 pl-3">
                        {norm.title && (
                          <span className="font-semibold text-text-primary text-[0.85rem]">{norm.title}</span>
                        )}
                        <p>{norm.argument}</p>
                        {(norm.source || norm.confidence) && (
                          <div className="flex items-center gap-2 text-[0.7rem] text-text-muted mt-0.5">
                            {norm.source && <span>Proponents/Source: {norm.source}</span>}
                            {norm.confidence && (
                              <span className="uppercase font-mono text-xs">[{norm.confidence} confidence]</span>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
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
  verified: 'var(--color-text-success)',
  strong: 'var(--color-text-info)',
  moderate: 'var(--color-text-warning)',
  unverified: 'var(--color-text-error)',
};
