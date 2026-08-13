'use client';

import React from 'react';
import type { EvidenceSource } from './types';

interface CitationLinkProps {
  source: EvidenceSource;
  inlineText?: string;
  onClick?: (source: EvidenceSource) => void;
}

export default function CitationLink({ source, inlineText, onClick }: CitationLinkProps) {
  const tierLabels: Record<number, string> = {
    1: 'T1 Primary Archival',
    2: 'T2 Government Record',
    3: 'T3 Court Judgment',
    4: 'T4 Peer Reviewed',
    5: 'T5 Reputable Secondary',
    6: 'T6 Eyewitness Account',
    7: 'T7 Statistical Dataset',
    8: 'T8 Expert Analysis',
  };

  const badgeColor = source.tier && source.tier <= 3
    ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20'
    : 'text-[#D4A843] bg-[#D4A843]/10 border-[#D4A843]/20';

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(source);
    }
  };

  return (
    <span className="inline-flex items-center gap-1 font-sans">
      {inlineText && <span className="text-[#D4D4D8]">{inlineText}</span>}
      <a
        href={source.url || '#'}
        target={source.url ? '_blank' : undefined}
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeColor} hover:brightness-110 transition-all`}
        title={source.tier ? tierLabels[source.tier] : 'Source details'}
      >
        {source.name}
        {source.tier ? ` [${String(source.tier)}]` : ''}
      </a>
    </span>
  );
}
