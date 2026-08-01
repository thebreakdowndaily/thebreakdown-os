import React from 'react';
import { PerformanceAuditReport } from '@/types/performance';

interface PerformanceControlPanelProps {
  report: PerformanceAuditReport;
}

export default function PerformanceControlPanel({ report }: PerformanceControlPanelProps) {
  const { benchmarks, memorySnapshot, routeMetrics, overallStatus, performanceDisclaimer } = report;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
              {report.platformVersion} Operational Dashboard
            </span>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded border font-bold font-mono ${
                overallStatus === 'OPTIMAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              Status: {overallStatus}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mt-1">
            Performance Infrastructure & Scalability Telemetry
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Internal telemetry monitoring microsecond projection latency, LRU cache efficiency, and memory allocations.
          </p>
        </div>
      </div>

      {/* Performance Infrastructure Safeguard Banner (Refinement 1) */}
      <div className="bg-gray-900/80 border border-cyan-500/40 rounded-xl p-4 text-xs font-mono text-cyan-300 space-y-1">
        <strong className="block uppercase text-[11px] font-bold">⚡ Performance Infrastructure Safeguard</strong>
        <p className="text-gray-300 text-[11px]">{performanceDisclaimer}</p>
      </div>

      {/* Route SLO Performance Budgets (Refinements 3, 7) */}
      <div className="space-y-3 font-mono text-xs">
        <strong className="text-xs font-bold text-gray-300 uppercase">Route Service Level Objectives (SLOs) & Latency Budgets</strong>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {routeMetrics.map((rm) => (
            <div key={rm.routePath} className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
              <div className="flex justify-between items-center">
                <strong className="text-gray-200 text-xs">{rm.routePath}</strong>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                  Budget: &lt;{rm.sloBudgetMs}ms
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 border-t border-gray-800 pt-2">
                <div>P50: <span className="text-emerald-400 font-bold">{rm.p50LatencyMs}ms</span></div>
                <div>P95: <span className="text-cyan-400 font-bold">{rm.p95LatencyMs}ms</span></div>
                <div>P99: <span className="text-purple-400 font-bold">{rm.p99LatencyMs}ms</span></div>
              </div>
              <div className="text-[10px] text-gray-500 pt-1 flex justify-between">
                <span>Cache Hit Ratio: {(rm.cacheHitRatio * 100).toFixed(1)}%</span>
                <span className="text-emerald-400 font-bold">Compliant</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projection Builder Benchmarks (Refinement 4) */}
      <div className="space-y-3 font-mono text-xs">
        <strong className="text-xs font-bold text-gray-300 uppercase">Microsecond Projection Builder Latency Benchmarks</strong>
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benchmarks.map((bm) => (
              <div key={bm.benchmarkId} className="bg-gray-800/40 p-3 rounded-lg border border-gray-800 space-y-1 text-[11px]">
                <div className="flex justify-between items-center">
                  <strong className="text-cyan-300">{bm.projectionType}</strong>
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
                    {bm.metadata.cacheState}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                  <span>Build: <strong className="text-emerald-400">{bm.buildDurationMs.toFixed(3)}ms</strong></span>
                  <span>Lookup: <strong className="text-cyan-400">{bm.cacheLookupMs.toFixed(2)}ms</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categorized Memory Profile Snapshot (Refinement 6) */}
      <div className="space-y-3 font-mono text-xs">
        <strong className="text-xs font-bold text-gray-300 uppercase">Heap Memory Categorized Profile Snapshot</strong>
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
            <span className="text-[10px] text-gray-400 block uppercase">Canonical</span>
            <strong className="text-cyan-300 text-sm font-bold">{(memorySnapshot.canonicalObjectsBytes / 1024 / 1024).toFixed(1)} MB</strong>
          </div>
          <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
            <span className="text-[10px] text-gray-400 block uppercase">Projections</span>
            <strong className="text-emerald-300 text-sm font-bold">{(memorySnapshot.projectionAllocationsBytes / 1024 / 1024).toFixed(1)} MB</strong>
          </div>
          <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
            <span className="text-[10px] text-gray-400 block uppercase">LRU Cache</span>
            <strong className="text-purple-300 text-sm font-bold">{(memorySnapshot.cacheOccupancyBytes / 1024 / 1024).toFixed(1)} MB</strong>
          </div>
          <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-800">
            <span className="text-[10px] text-gray-400 block uppercase">Temp Alloc</span>
            <strong className="text-amber-300 text-sm font-bold">{(memorySnapshot.temporaryAllocationsBytes / 1024 / 1024).toFixed(1)} MB</strong>
          </div>
        </div>
      </div>

    </div>
  );
}
