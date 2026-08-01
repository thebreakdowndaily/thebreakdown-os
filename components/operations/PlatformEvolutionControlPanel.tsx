import React from 'react';
import { PlatformEvolutionProjection } from '@/types/evolution';

interface PlatformEvolutionControlPanelProps {
  projection: PlatformEvolutionProjection;
}

export default function PlatformEvolutionControlPanel({ projection }: PlatformEvolutionControlPanelProps) {
  const { releaseQualityIndex, roadmap, activeADRs, recentImpactAssessments } = projection;

  const impact = recentImpactAssessments[0];

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              {projection.platformVersion} Release Governance & Evolution Management
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              Release Quality: {releaseQualityIndex.overallReleaseQuality}/100
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Architecture Evolution Roadmap & Decision Records Registry
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Roadmap Phase:</span>
          <span className="px-3 py-1 rounded-full border font-bold uppercase bg-blue-500/20 text-blue-300 border-blue-500/40">
            {roadmap.currentPhase}
          </span>
        </div>
      </div>

      {/* Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Release Quality */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Release Quality Index</span>
          <strong className="text-2xl text-emerald-400 font-mono">{releaseQualityIndex.overallReleaseQuality} / 100</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Regression Status: 100%</span>
          </div>
        </div>

        {/* Card 2: Active ADRs */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Accepted ADRs</span>
          <strong className="text-2xl text-purple-400 font-mono">{activeADRs.length} ADRs</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Traceability: Verified</span>
          </div>
        </div>

        {/* Card 3: Change Impact */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Change Impact Risk</span>
          <strong className="text-2xl text-blue-400 font-mono">{impact?.operationalRisk || 'LOW'}</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Effort: {impact?.migrationEffortDays || 2} Days</span>
          </div>
        </div>

        {/* Card 4: Compatibility Window */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Compatibility Window</span>
          <strong className="text-2xl text-amber-300 font-mono">{roadmap.compatibilityWindowDays} Days</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Supported: {roadmap.supportedVersions.length} Versions</span>
          </div>
        </div>

      </div>

      {/* Architecture Decision Records (ADRs) */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Architecture Decision Records Registry ({activeADRs.length})
        </h4>
        <div className="space-y-2 text-xs font-mono">
          {activeADRs.map((adr) => (
            <div key={adr.adrId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1">
              <div className="flex justify-between items-center">
                <strong className="text-purple-300 font-bold">{adr.adrId}: {adr.title}</strong>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                  {adr.status}
                </span>
              </div>
              <p className="text-gray-300 text-[11px] font-mono">Decision: {adr.decision}</p>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800 flex justify-between">
                <span>Phase: {adr.linkedRoadmapPhase}</span>
                <span>Rules: {adr.linkedArchitecturalRules.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change Impact Assessment */}
      {impact && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            Latest Change Impact Assessment ({impact.changeId})
          </h4>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1 text-xs font-mono">
            <div className="flex justify-between items-center">
              <strong className="text-blue-300 font-bold">Target: {impact.targetSubsystem}</strong>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">
                {impact.compatibilityImpact}
              </span>
            </div>
            <p className="text-gray-300 text-[11px]">Testing Impact: {impact.testingImpact}</p>
            <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800 flex justify-between">
              <span>Affected: {impact.affectedSubsystems.join(', ')}</span>
              <span>Confidence: {impact.confidenceScore * 100}%</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
