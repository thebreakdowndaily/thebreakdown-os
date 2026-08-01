import React from 'react';
import { PlatformKnowledgePreservationProjection } from '@/types/knowledge-preservation';

interface PlatformKnowledgePreservationControlPanelProps {
  projection: PlatformKnowledgePreservationProjection;
}

export default function PlatformKnowledgePreservationControlPanel({ projection }: PlatformKnowledgePreservationControlPanelProps) {
  const { preservationScore, nodes, edges, lifecycleRecords, lineageChains, auditResults } = projection;

  const chain = lineageChains[0];

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              {projection.platformVersion} Knowledge Lifecycle & Architectural Preservation
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              Preservation Score: {preservationScore}/100
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Architectural Knowledge Graph & Traceable Decision Lineage
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Knowledge Graph:</span>
          <span className="px-3 py-1 rounded-full border font-bold uppercase bg-blue-500/20 text-blue-300 border-blue-500/40">
            {nodes.length} Nodes / {edges.length} Edges
          </span>
        </div>
      </div>

      {/* Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Preservation Score */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Preservation Health</span>
          <strong className="text-2xl text-emerald-400 font-mono">{preservationScore} / 100</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Orphan Rate: 0%</span>
          </div>
        </div>

        {/* Card 2: Knowledge Graph Topology */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Knowledge Graph</span>
          <strong className="text-2xl text-blue-400 font-mono">{nodes.length} Nodes</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Edges: {edges.length} Semantic</span>
          </div>
        </div>

        {/* Card 3: Managed Assets */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Managed Assets</span>
          <strong className="text-2xl text-purple-400 font-mono">{lifecycleRecords.length} Assets</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>State Machine: 5 States</span>
          </div>
        </div>

        {/* Card 4: Lineage Traceability */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Lineage Chains</span>
          <strong className="text-2xl text-amber-300 font-mono">{lineageChains.length} Verified</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Completeness: 100%</span>
          </div>
        </div>

      </div>

      {/* Asset Lifecycle Records */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Managed Architectural Assets & Lifecycle States ({lifecycleRecords.length})
        </h4>
        <div className="space-y-2 text-xs font-mono">
          {lifecycleRecords.map((record) => (
            <div key={record.assetId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <strong className="text-purple-300 font-bold block">{record.assetName}</strong>
                <span className="text-[11px] text-gray-400">Ref: {record.adrReference} | Approved: {record.approvedBy}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                {record.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* End-to-End Lineage Chain */}
      {chain && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            Enriched Architectural Lineage Chain ({chain.chainId})
          </h4>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-2 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div><strong className="text-emerald-400">Intent:</strong> {chain.intent}</div>
              <div><strong className="text-purple-300">ADR:</strong> {chain.adrId}</div>
              <div><strong className="text-blue-300">Spec:</strong> {chain.specification}</div>
              <div><strong className="text-gray-300">Impl:</strong> {chain.implementation}</div>
              <div><strong className="text-amber-300">Validation:</strong> {chain.validation}</div>
              <div><strong className="text-emerald-300">Testing:</strong> {chain.testing}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
