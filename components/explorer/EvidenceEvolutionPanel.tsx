import React from 'react';
import { EvidenceEvolutionProjection } from '@/types/evidence-evolution';
import Link from 'next/link';

interface EvidenceEvolutionPanelProps {
  projection: EvidenceEvolutionProjection;
}

export default function EvidenceEvolutionPanel({ projection }: EvidenceEvolutionPanelProps) {
  const { trajectoryNodes, nodeCount, evolutionDisclaimer, problemSlug } = projection;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              {projection.platformVersion} Evidence Evolution Engine
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              {nodeCount} Trajectories Tracked
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mt-1">
            Evidence Evolution & Historical Snapshot Dashboard
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Track claim revision history, confidence trajectories, and historical snapshot diffs over time.
          </p>
        </div>

        {problemSlug && (
          <Link href={`/problems/${problemSlug}`} className="text-xs font-mono text-emerald-400 hover:underline">
            ← Back to Problem Tree
          </Link>
        )}
      </div>

      {/* Evolution Safeguard Disclaimer (Refinement 1) */}
      <div className="bg-gray-900/80 border border-purple-500/40 rounded-xl p-4 text-xs font-mono text-purple-300 space-y-1">
        <strong className="block uppercase text-[11px] font-bold">📜 Evidence Evolution Safeguard</strong>
        <p className="text-gray-300 text-[11px]">{evolutionDisclaimer}</p>
      </div>

      {/* Trajectory Cards */}
      <div className="space-y-6">
        {trajectoryNodes.map((node) => (
          <div key={node.nodeId} className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 space-y-6 font-mono text-xs">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700 font-bold uppercase">
                  Claim ID: {node.claimId}
                </span>
                <h4 className="text-lg font-bold text-gray-100 mt-2">{node.claimTitle}</h4>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded border border-emerald-500/40 font-bold uppercase">
                Confidence: {node.currentConfidence}
              </span>
            </div>

            {/* Knowledge Drift Summary (Refinement 5) */}
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-800 space-y-1 text-xs">
              <strong className="text-amber-300 text-[10px] uppercase block">Descriptive Knowledge Drift Audit:</strong>
              <p className="text-gray-300 text-[11px]">{node.knowledgeDriftSummary}</p>
            </div>

            {/* Reproducible Historical Snapshots Timeline (Refinements 2, 3) */}
            <div className="space-y-2">
              <strong className="text-xs font-bold text-gray-300 uppercase">Reproducible Historical Snapshots ({node.historicalSnapshots.length})</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {node.historicalSnapshots.map((snap) => (
                  <div key={snap.snapshotId} className="bg-gray-800/40 p-3 rounded-lg border border-gray-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-purple-300 text-[11px]">{snap.snapshotLabel}</strong>
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
                        {snap.confidenceGrade}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[10px] pt-1 border-t border-gray-700/60">{snap.summaryStateNote}</p>
                    <div className="text-[10px] text-gray-500 pt-1 flex justify-between">
                      <span>Claims: {snap.activeClaimCount}</span>
                      <span>Evidence: {snap.activeEvidenceCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Classified Revision Event Log (Refinements 4, 7) */}
            <div className="space-y-2">
              <strong className="text-xs font-bold text-gray-300 uppercase">Classified Revision Event Log ({node.revisionHistory.length})</strong>
              <div className="space-y-2">
                {node.revisionHistory.map((rev) => (
                  <div key={rev.eventId} className="bg-gray-800/40 p-3 rounded-lg border border-gray-800 space-y-1 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40 font-bold uppercase">
                        {rev.classification}
                      </span>
                      <span className="text-gray-400 text-[10px]">{rev.timestamp}</span>
                    </div>
                    <strong className="text-gray-200 block mt-1">{rev.summary}</strong>
                    <p className="text-gray-300 text-[11px]">Rationale: {rev.rationale}</p>
                    <p className="text-gray-400 text-[10px]">Source: {rev.evidenceSourceTitle}</p>
                    <p className="text-emerald-400 text-[10px]">
                      Confidence Transition: {rev.priorConfidence} → {rev.newConfidence}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
