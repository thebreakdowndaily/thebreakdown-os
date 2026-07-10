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
    <div className="rounded-lg bg-surface-secondary border border-border p-5">
      <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4">Evidence</h3>

      <div className="flex items-center justify-between mb-4">
        <EvidenceScore score={overallScore} label="Overall Score" />
        <div className="text-right">
          <span className="text-2xl font-bold text-text-primary tabular-nums leading-none tracking-tight">{verifiedClaims}</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">Verified Claims</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Primary Sources</span>
        <span className="text-sm font-semibold text-text-primary tabular-nums">{primarySources.length}</span>
      </div>

      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Sources</span>
        <SourceGroup sources={allSources} compact />
      </div>
    </div>
  );
}
