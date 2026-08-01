import React from 'react';
import { PlatformGovernanceProjection } from '@/types/governance';

interface PlatformGovernanceControlPanelProps {
  projection: PlatformGovernanceProjection;
}

export default function PlatformGovernanceControlPanel({ projection }: PlatformGovernanceControlPanelProps) {
  const { overallPosture, policies, recentCorrelatedAudits, complianceChecks, riskEntries, activeWaivers } = projection;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              {projection.platformVersion} Governance, Audit & Compliance
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              Posture: {overallPosture}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Platform Governance Policy & Continuous Audit
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Enforced Policies:</span>
          <span className="px-3 py-1 rounded-full border font-bold uppercase bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
            {policies.filter((p) => p.enforced).length} / {policies.length} Active
          </span>
        </div>
      </div>

      {/* Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Governance Policies */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Enforced Policies</span>
          <strong className="text-2xl text-emerald-400 font-mono">{policies.length} Policies</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Enforcement: 100% Active</span>
          </div>
        </div>

        {/* Card 2: Compliance Framework Checks */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Compliance Controls</span>
          <strong className="text-2xl text-blue-400 font-mono">
            {complianceChecks.filter((c) => c.status === 'COMPLIANT').length} / {complianceChecks.length} Passed
          </strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Framework: PLATFORM-STRICT</span>
          </div>
        </div>

        {/* Card 3: Correlated Audit Stream */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Audit Events Correlated</span>
          <strong className="text-2xl text-purple-400 font-mono">
            {recentCorrelatedAudits.length} Subsystems
          </strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Stream: Unified Timeline</span>
          </div>
        </div>

        {/* Card 4: Active Waivers */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Active Risk Waivers</span>
          <strong className="text-2xl text-amber-300 font-mono">
            {activeWaivers.length} Waiver
          </strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Approved By: {activeWaivers[0]?.approvedBy || 'CTO'}</span>
          </div>
        </div>

      </div>

      {/* Compliance Framework Controls */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Continuous Compliance Audit Controls ({complianceChecks.length})
        </h4>
        <div className="space-y-2 text-xs font-mono">
          {complianceChecks.map((c) => (
            <div key={c.controlId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <strong className="text-amber-400 font-bold block">{c.controlId}: {c.title}</strong>
                <span className="text-[11px] text-gray-400">{c.evidenceSummary}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Correlated Cross-Subsystem Audit Timeline */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Unified Cross-Subsystem Audit Stream ({recentCorrelatedAudits.length})
        </h4>
        <div className="space-y-2 text-xs font-mono">
          {recentCorrelatedAudits.map((event) => (
            <div key={event.eventId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-purple-400 font-bold uppercase block">{event.sourceSubsystem}</span>
                <strong className="text-gray-200">{event.action}</strong> by <span className="text-blue-300">{event.actor}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                CorrelationId: {event.correlationId}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
