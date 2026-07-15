'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { EvidenceSummaryBlockData } from '@/types/canonical';
import { EvidenceCard } from '../evidence/EvidenceCard';
import { useState } from 'react';

export const EvidenceSummaryBlock: FC<BlockComponentProps> = ({ data }) => {
  const {
    claim, evidenceSummary, confidence,
    primarySources, secondarySources, academicPapers,
    datasets, verificationDate, contradictions, editorNotes
  } = data as unknown as EvidenceSummaryBlockData;

  const [expanded, setExpanded] = useState(false);

  const confidenceStyle = confidence === 'established' ? 'bg-green-100 text-green-700' : confidence === 'debated' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  const confidenceLabel = confidence === 'established' ? 'Established' : confidence === 'debated' ? 'Debated' : 'Contested';

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden my-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        aria-expanded={expanded}
      >
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Evidence Summary</span>
          <p className="mt-1 text-sm font-medium text-gray-800">{claim}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${confidenceStyle}`}>
            {confidenceLabel}
          </span>
          <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''} text-gray-400`}>▾</span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 py-4 space-y-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 leading-relaxed">{evidenceSummary}</p>

          <div className="space-y-2">
            <EvidenceCard label="Primary Sources" items={primarySources} color="green" defaultOpen />
            <EvidenceCard label="Secondary Sources" items={secondarySources} color="blue" />
            <EvidenceCard label="Academic Papers" items={academicPapers} color="purple" />
            <EvidenceCard label="Datasets" items={datasets} color="cyan" />
            {contradictions.length > 0 && (
              <EvidenceCard label="Contradictions / Counter-Evidence" items={contradictions} color="red" />
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
            <span>Verified: {verificationDate}</span>
            {editorNotes && (
              <span className="italic">Editor&apos;s note: {editorNotes}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
