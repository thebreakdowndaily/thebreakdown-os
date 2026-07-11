import React from 'react';

interface EntityConfidencePanelProps {
  confidence: number;
  evidenceCount: number;
  sourceCount: number;
  officialCount: number;
  mediaCount: number;
  researchCount: number;
  updatedAt: string;
}

export default function EntityConfidencePanel({
  confidence,
  evidenceCount,
  sourceCount,
  officialCount,
  mediaCount,
  researchCount,
  updatedAt,
}: EntityConfidencePanelProps) {
  return (
    <div className="font-mono text-xs text-neutral-400 p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex flex-wrap gap-4 items-center">
      <div className="flex flex-col">
        <span className="uppercase tracking-widest text-neutral-500 mb-1">Confidence</span>
        <span className="text-emerald-400 font-bold">{confidence}%</span>
      </div>
      <div className="w-px h-6 bg-neutral-800"></div>
      <div className="flex flex-col">
        <span className="uppercase tracking-widest text-neutral-500 mb-1">Evidence</span>
        <span className="text-white">{evidenceCount}</span>
      </div>
      <div className="flex flex-col">
        <span className="uppercase tracking-widest text-neutral-500 mb-1">Sources</span>
        <span className="text-white">{sourceCount}</span>
      </div>
      <div className="w-px h-6 bg-neutral-800"></div>
      <div className="flex flex-col">
        <span className="uppercase tracking-widest text-neutral-500 mb-1">Official</span>
        <span className="text-white">{officialCount}</span>
      </div>
      <div className="flex flex-col">
        <span className="uppercase tracking-widest text-neutral-500 mb-1">Media</span>
        <span className="text-white">{mediaCount}</span>
      </div>
      <div className="flex flex-col">
        <span className="uppercase tracking-widest text-neutral-500 mb-1">Research</span>
        <span className="text-white">{researchCount}</span>
      </div>
      <div className="w-px h-6 bg-neutral-800"></div>
      <div className="flex flex-col">
        <span className="uppercase tracking-widest text-neutral-500 mb-1">Updated</span>
        <span className="text-white">{updatedAt}</span>
      </div>
    </div>
  );
}
