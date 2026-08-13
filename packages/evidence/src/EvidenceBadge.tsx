import React from 'react';

interface EvidenceBadgeProps {
  field: string;
  authority: string;
  source: string;
  quality: string;
}

export default function EvidenceBadge({ field, authority, source, quality }: EvidenceBadgeProps) {
  const isAuthentic = quality === 'AUTHENTIC';
  const isDerived = quality === 'DERIVED';
  const isNotAvailable = quality.startsWith('NOT_AVAILABLE');

  const badgeColor = isAuthentic
    ? 'bg-[#22C55E]/15 text-[#22C55E]'
    : isDerived
    ? 'bg-[#D4A843]/15 text-[#D4A843]'
    : isNotAvailable
    ? 'bg-[#FF3B30]/15 text-[#FF6B61]'
    : 'bg-[#2A2A2A] text-[#A1A1AA]';

  return (
    <details className="group inline-block">
      <summary className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2A2A2A] bg-[#151515] px-1.5 py-0.5 text-[10px] text-[#6B6B6B] transition-colors hover:border-[#D4A843]/40 hover:text-[#D4A843] select-none list-none group-open:text-[#D4A843] group-open:border-[#D4A843]/40">
        source
      </summary>
      <div className="absolute mt-1 z-50 w-72 rounded-xl border border-[#2A2A2A] bg-[#111111] p-3 text-xs" role="group" aria-label={`Source for ${field}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B6B6B]">{field}</span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
            {quality.replace(/_/g, ' ')}
          </span>
        </div>
        <dl className="space-y-1.5">
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-[#6B6B6B]">Authority</dt>
            <dd className="text-right text-[#E5E5E5]">{authority}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-[#6B6B6B]">Dataset</dt>
            <dd className="font-mono text-right text-[#D4A843]">{source}</dd>
          </div>
        </dl>
      </div>
    </details>
  );
}
