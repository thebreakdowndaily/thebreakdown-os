'use client';

import EvidenceScore from './EvidenceScore';
import SourceGroup from './SourceGroup';
import type { StoryClaim, EvidenceSource } from './types';

function flattenSources(claims: StoryClaim[]): EvidenceSource[] {
  const seen = new Set<string>();
  const all: EvidenceSource[] = [];
  for (const c of claims) {
    for (const s of c.sources) {
      if (!seen.has(s.name)) {
        seen.add(s.name);
        all.push(s);
      }
    }
  }
  return all;
}

export default function EvidencePanel({
  overallScore,
  verifiedClaims,
  claims,
}: {
  overallScore: number;
  verifiedClaims: number;
  claims: StoryClaim[];
}) {
  const allSources = flattenSources(claims);
  const primarySources = allSources.filter((s) => s.group === 'government' || s.group === 'primary');

  return (
    <div className="rounded-2xl bg-[#151515] border border-[#2A2A2A] p-5">
      <h3 className="text-sm font-bold text-[#F5F5F5] mb-4">Evidence</h3>

      <div className="flex items-center justify-between mb-4">
        <EvidenceScore score={overallScore} label="Overall Score" />
        <div className="text-right">
          <span className="text-xl font-bold text-[#F5F5F5] tabular-nums">{verifiedClaims}</span>
          <p className="text-[10px] text-[#A1A1AA]">Verified Claims</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#2A2A2A]">
        <span className="text-xs text-[#A1A1AA]">Primary Sources</span>
        <span className="text-sm font-semibold text-[#F5F5F5] tabular-nums">{primarySources.length}</span>
      </div>

      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2 block">Sources</span>
        <SourceGroup sources={allSources} compact />
      </div>
    </div>
  );
}
