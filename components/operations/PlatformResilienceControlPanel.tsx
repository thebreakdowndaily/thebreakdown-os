import React from 'react';
import { PlatformResilienceProjection } from '@/types/resilience';

interface PlatformResilienceControlPanelProps {
  projection: PlatformResilienceProjection;
}

export default function PlatformResilienceControlPanel({ projection }: PlatformResilienceControlPanelProps) {
  const { readinessIndex, dependencies, blastRadiusAssessments, recentSimulations, adaptiveRunbooks } = projection;

  const blastRadius = blastRadiusAssessments[0];
  const sim = recentSimulations[0];

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              {projection.platformVersion} Resilience & Adaptive Operations
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              Readiness Index: {readinessIndex.overallReadiness}/100
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Blast Radius Analysis, Fault Simulation & Adaptive Playbooks
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Dependency Graph:</span>
          <span className="px-3 py-1 rounded-full border font-bold uppercase bg-blue-500/20 text-blue-300 border-blue-500/40">
            {dependencies.length} Core Nodes
          </span>
        </div>
      </div>

      {/* Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Readiness Index */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Operational Readiness</span>
          <strong className="text-2xl text-emerald-400 font-mono">{readinessIndex.overallReadiness} / 100</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Governance: {readinessIndex.governanceScore}%</span>
          </div>
        </div>

        {/* Card 2: Blast Radius */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Search Cache Blast Radius</span>
          <strong className="text-2xl text-amber-300 font-mono">{blastRadius?.blastRadiusPercent || 15}%</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Impact: {blastRadius?.estimatedUserImpact || 'LOW'}</span>
          </div>
        </div>

        {/* Card 3: Fault Simulation */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Sandbox Simulation</span>
          <strong className="text-2xl text-blue-400 font-mono">
            {sim?.recoveryPassed ? 'RECOVERED' : 'FAILED'}
          </strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Recovery Time: {sim?.recoveryTimeSeconds || 4.2}s</span>
          </div>
        </div>

        {/* Card 4: Adaptive Runbooks */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Adaptive Playbooks</span>
          <strong className="text-2xl text-purple-400 font-mono">{adaptiveRunbooks.length} Active</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Status: Advisory Only</span>
          </div>
        </div>

      </div>

      {/* Decomposable Readiness Score Matrix */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Decomposable Readiness Index Matrix
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs font-mono">
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Resilience</span>
            <strong className="text-emerald-300 text-base">{readinessIndex.resilienceScore}%</strong>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Lifecycle</span>
            <strong className="text-emerald-300 text-base">{readinessIndex.lifecycleReadinessScore}%</strong>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Governance</span>
            <strong className="text-emerald-300 text-base">{readinessIndex.governanceScore}%</strong>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Security</span>
            <strong className="text-emerald-300 text-base">{readinessIndex.securityScore}%</strong>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Performance</span>
            <strong className="text-emerald-300 text-base">{readinessIndex.performanceScore}%</strong>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Observability</span>
            <strong className="text-emerald-300 text-base">{readinessIndex.observabilityCoverageScore}%</strong>
          </div>
        </div>
      </div>

      {/* Adaptive Operational Playbooks */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Adaptive Operational Playbooks ({adaptiveRunbooks.length})
        </h4>
        <div className="space-y-2 text-xs font-mono">
          {adaptiveRunbooks.map((rbk) => (
            <div key={rbk.runbookId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1">
              <div className="flex justify-between items-center">
                <strong className="text-purple-300 font-bold">{rbk.title}</strong>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                  Advisory Execution
                </span>
              </div>
              <p className="text-gray-300 text-[11px] font-mono">Trigger: {rbk.triggeringCondition}</p>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800 flex justify-between">
                <span>Expected Outcome: {rbk.expectedOutcome}</span>
                <span>Escalation: {rbk.escalationCriteria}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
