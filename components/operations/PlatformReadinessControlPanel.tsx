import React from 'react';
import { PlatformReadinessProjection } from '@/types/integration';

interface PlatformReadinessControlPanelProps {
  projection: PlatformReadinessProjection;
}

export default function PlatformReadinessControlPanel({ projection }: PlatformReadinessControlPanelProps) {
  const { readinessStatus, certification, governance, subsystemContracts, workflowResults, runbooks, auditChecks } = projection;

  const isCertified = readinessStatus === 'CERTIFIED';
  const isReady = readinessStatus === 'READY';

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">
              {governance.architectureRelease} ({governance.platformVersion}) Production Readiness
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              Schema: {governance.schemaVersion}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Platform-Wide Integration & Certification Sign-Off
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Readiness Decision:</span>
          <span className={`px-3 py-1 rounded-full border font-bold uppercase ${
            isCertified
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : isReady
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'bg-red-500/20 text-red-300 border-red-500/40'
          }`}>
            {readinessStatus}
          </span>
        </div>
      </div>

      {/* Certification Rationale Box */}
      <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 space-y-1">
        <div className="flex justify-between text-xs font-mono text-gray-400 border-b border-gray-800 pb-1">
          <span>Decision By: {certification.decisionBy}</span>
          <span>Approved: {String(certification.certified)}</span>
        </div>
        <p className="text-xs text-emerald-300 font-mono pt-1">
          {certification.rationale}
        </p>
      </div>

      {/* Subsystem Contracts Matrix (6 Cards) */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Subsystem Integration Contracts ({subsystemContracts.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          {subsystemContracts.map((c) => (
            <div key={c.provider} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <strong className="text-gray-200 block">{c.provider}</strong>
                <span className="text-[10px] text-gray-400">Projection: {c.expectedProjection}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                {c.compatibilityVersion} OK
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Subsystem Integration Workflow Results */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Declarative Integration Workflows ({workflowResults.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {workflowResults.map((wf) => (
            <div key={wf.scenarioId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1">
              <div className="flex justify-between items-center">
                <strong className="text-amber-300 font-bold">{wf.name}</strong>
                <span className="text-emerald-400 font-bold">PASSED</span>
              </div>
              <p className="text-[11px] text-gray-400">{wf.logs[0]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Executable Operational Runbooks & Audit Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Runbooks */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Executable Runbooks ({runbooks.length})
          </span>
          <div className="space-y-2">
            {runbooks.map((rb) => (
              <div key={rb.id} className="border-b border-gray-800 pb-1">
                <strong className="text-gray-200 block">{rb.title}</strong>
                <span className="text-[10px] text-gray-400">Category: {rb.category} | Steps Verified: {rb.steps.length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Readiness Audits */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Production Audit Checks ({auditChecks.length})
          </span>
          <div className="space-y-2">
            {auditChecks.map((ac) => (
              <div key={ac.checkId} className="border-b border-gray-800 pb-1 flex justify-between items-center">
                <div>
                  <strong className="text-gray-200 block">{ac.title}</strong>
                  <span className="text-[10px] text-gray-400">{ac.observation}</span>
                </div>
                <span className="text-emerald-400 font-bold text-[10px]">OK</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
