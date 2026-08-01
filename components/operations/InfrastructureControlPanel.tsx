import React from 'react';
import { ProductionInfrastructureProjection } from '@/types/infrastructure';

interface InfrastructureControlPanelProps {
  projection: ProductionInfrastructureProjection;
}

export default function InfrastructureControlPanel({ projection }: InfrastructureControlPanelProps) {
  const { recoveryState, provenance, liveness, readiness, health, dependencies, activeIncidents } = projection;

  const isNormal = recoveryState === 'NORMAL';
  const isDegraded = recoveryState === 'DEGRADED';

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">
              {projection.platformVersion} Production Infrastructure
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded border border-blue-500/40 font-bold font-mono">
              Git: {provenance.gitCommit}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Production Reliability & Diagnostic Probes
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Recovery State:</span>
          <span className={`px-3 py-1 rounded-full border font-bold uppercase ${
            isNormal
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : isDegraded
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-red-500/20 text-red-300 border-red-500/40'
          }`}>
            {recoveryState}
          </span>
        </div>
      </div>

      {/* Diagnostic Probes Grid (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Probe 1: Liveness */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Liveness Probe (/api/live)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded">
              {liveness.status}
            </span>
          </div>
          <p className="text-xs text-gray-400">Node process & runtime execution check.</p>
          <div className="text-xs text-gray-300 font-mono pt-1 flex justify-between border-t border-gray-800">
            <span>Latency: {liveness.durationMs}ms</span>
            <span>Uptime: {String(liveness.details.uptimeSeconds)}s</span>
          </div>
        </div>

        {/* Probe 2: Readiness */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Readiness Probe (/api/ready)
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded ${
              readiness.status === 'UP' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-red-500/20 text-red-400 border-red-500/40'
            }`}>
              {readiness.status}
            </span>
          </div>
          <p className="text-xs text-gray-400">HTTP request serving readiness guard.</p>
          <div className="text-xs text-gray-300 font-mono pt-1 flex justify-between border-t border-gray-800">
            <span>Latency: {readiness.durationMs}ms</span>
            <span>Critical OK: {String(readiness.details.criticalHealthy)}</span>
          </div>
        </div>

        {/* Probe 3: Health */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Health Probe (/api/health)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded">
              {health.status}
            </span>
          </div>
          <p className="text-xs text-gray-400">Infrastructure dependency health evaluation.</p>
          <div className="text-xs text-gray-300 font-mono pt-1 flex justify-between border-t border-gray-800">
            <span>Dependencies: {String(health.details.totalDependencies)}</span>
            <span>Degraded: {String(health.details.degradedCount)}</span>
          </div>
        </div>

      </div>

      {/* Infrastructure Dependencies Status */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Infrastructure Dependency Registry ({dependencies.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          {dependencies.map((dep) => (
            <div key={dep.id} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <strong className="text-gray-200 block">{dep.name}</strong>
                <span className="text-[10px] text-gray-400 uppercase">{dep.criticality}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                dep.status === 'HEALTHY'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}>
                {dep.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Operational Incidents */}
      {activeIncidents.length > 0 && (
        <div className="bg-gray-900/80 p-4 rounded-xl border border-red-500/40 space-y-2">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
            Active Infrastructure Incidents ({activeIncidents.length})
          </span>
          <div className="space-y-2 text-xs text-gray-300 font-mono">
            {activeIncidents.map((inc) => (
              <div key={inc.id} className="flex justify-between items-center border-b border-gray-800 pb-1">
                <span>[{inc.severity}] Component: {inc.component}</span>
                <span className="text-red-400 font-bold">{inc.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
