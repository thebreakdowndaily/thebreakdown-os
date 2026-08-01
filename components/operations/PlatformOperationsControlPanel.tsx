import React from 'react';
import { PlatformOperationsProjection } from '@/types/lifecycle';

interface PlatformOperationsControlPanelProps {
  projection: PlatformOperationsProjection;
}

export default function PlatformOperationsControlPanel({ projection }: PlatformOperationsControlPanelProps) {
  const { activeRollouts, configurationDrifts, sloBudgets, disasterRecoveryChecks, releaseTrains } = projection;

  const activeRollout = activeRollouts[0];
  const drCheck = disasterRecoveryChecks[0];

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">
              {projection.platformVersion} Operations & Lifecycle
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              Release Train: {releaseTrains[0]?.releaseVersion || 'v1.0.0'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Deployment Rollout State & SLO Governance
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Rollout State:</span>
          <span className="px-3 py-1 rounded-full border font-bold uppercase bg-blue-500/20 text-blue-300 border-blue-500/40">
            {activeRollout?.state || 'COMPLETED'}
          </span>
        </div>
      </div>

      {/* Deployment & DR Summary (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Canary Status */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Active Rollout Canary</span>
          <strong className="text-2xl text-emerald-400 font-mono">{activeRollout?.canaryTrafficPercent || 10}% Traffic</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Error Rate: {(activeRollout?.canaryErrorRate || 0.001) * 100}%</span>
          </div>
        </div>

        {/* Card 2: Configuration Drift */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Configuration Drift</span>
          <strong className="text-2xl text-amber-300 font-mono">
            {configurationDrifts.filter((d) => d.hasDrift).length} Drifts
          </strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Total Checked: {configurationDrifts.length}</span>
          </div>
        </div>

        {/* Card 3: DR Readiness */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Disaster Recovery</span>
          <strong className="text-2xl text-blue-400 font-mono">
            {drCheck?.restoreValidationPassed ? 'PASSED' : 'CHECKING'}
          </strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Backup Age: {drCheck?.backupAgeHours || 2.5}h</span>
          </div>
        </div>

        {/* Card 4: Release Train Approvals */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Release Train Approvals</span>
          <strong className="text-2xl text-purple-400 font-mono">
            {releaseTrains[0]?.requiredApprovals.length || 3} Approvals
          </strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Outcome: {releaseTrains[0]?.outcome || 'SUCCESSFUL'}</span>
          </div>
        </div>

      </div>

      {/* Service Level Objectives (SLO) Governance Table */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Service Level Objective (SLO) Error Budgets ({sloBudgets.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          {sloBudgets.map((slo) => (
            <div key={slo.sloId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1">
              <div className="flex justify-between items-center">
                <strong className="text-amber-400 font-bold">{slo.category} SLO</strong>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  {slo.status}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Target: {slo.targetPercent}%</span>
                <span>Current: {slo.currentPercent}%</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800">
                <span>Error Budget: {slo.errorBudgetRemainingPercent}%</span>
                <span>Burn Rate: {slo.burnRate}x</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Drift Matrix (Desired vs Applied vs Observed) */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Configuration Drift Audit (Desired vs Applied vs Observed)
        </h4>
        <div className="space-y-2 text-xs font-mono">
          {configurationDrifts.map((d) => (
            <div key={d.variableName} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <strong className="text-gray-200 block">{d.variableName}</strong>
                <span className="text-[11px] text-gray-400">
                  Desired: {d.desiredValue} | Applied: {d.appliedValue} | Observed: {d.observedRuntimeValue}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                !d.hasDrift
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {!d.hasDrift ? 'IN_SYNC' : 'DRIFTED'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
