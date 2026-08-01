import React from 'react';
import { PlatformKnowledgeIntelligenceProjection } from '@/types/knowledge-intelligence';

interface PlatformKnowledgeIntelligenceControlPanelProps {
  projection: PlatformKnowledgeIntelligenceProjection;
}

export default function PlatformKnowledgeIntelligenceControlPanel({ projection }: PlatformKnowledgeIntelligenceControlPanelProps) {
  const { consistencyScore, averageConfidenceScore, inferredRelationships, provenanceChains, discoveryItems, consistencyIssues } = projection;

  const prov = provenanceChains[0];

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              {projection.platformVersion} Knowledge Intelligence & Semantic Reasoning
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              Consistency Score: {consistencyScore}/100
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Deterministic Semantic Reasoning & Evidence Provenance Engine
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Avg Confidence:</span>
          <span className="px-3 py-1 rounded-full border font-bold uppercase bg-blue-500/20 text-blue-300 border-blue-500/40">
            {averageConfidenceScore * 100}%
          </span>
        </div>
      </div>

      {/* Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Consistency Score */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Consistency Score</span>
          <strong className="text-2xl text-emerald-400 font-mono">{consistencyScore} / 100</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Contradictions: 0</span>
          </div>
        </div>

        {/* Card 2: Inferred Relationships */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Inferred Relationships</span>
          <strong className="text-2xl text-blue-400 font-mono">{inferredRelationships.length} Inferred</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Rules: INF-01..05</span>
          </div>
        </div>

        {/* Card 3: Evidence Provenance */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Evidence Provenance</span>
          <strong className="text-2xl text-purple-400 font-mono">{provenanceChains.length} Chains</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Verification: 6-Stage</span>
          </div>
        </div>

        {/* Card 4: Cross-Domain Discovery */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Contextual Discovery</span>
          <strong className="text-2xl text-amber-300 font-mono">{discoveryItems.length} Discovered</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Cross-Domain: Active</span>
          </div>
        </div>

      </div>

      {/* Inferred Semantic Relationships */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Inferred Semantic Relationships ({inferredRelationships.length})
        </h4>
        <div className="space-y-2 text-xs font-mono">
          {inferredRelationships.map((rel) => (
            <div key={rel.relationshipId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1">
              <div className="flex justify-between items-center">
                <strong className="text-blue-300 font-bold">{rel.sourceId} → [{rel.relationType}] → {rel.targetId}</strong>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                  {rel.confidenceScore * 100}% Confidence
                </span>
              </div>
              <p className="text-gray-300 text-[11px] font-mono">Rule: {rel.originatingRule}</p>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800 flex justify-between">
                <span>Reasoning: {rel.reasoningTrail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cryptographically Complete Evidence Provenance Chain */}
      {prov && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            Evidence Provenance Chain ({prov.chainId})
          </h4>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-2 text-xs font-mono">
            <p className="text-emerald-300 font-bold text-[11px]">Claim: "{prov.claimText}"</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-gray-400 pt-1 border-t border-gray-800">
              <span>Evidence: {prov.evidenceId}</span>
              <span>Source: {prov.primarySourceId}</span>
              <span>Audit: {prov.verificationAuditId}</span>
              <span>Approval: {prov.editorialApprovalId}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
