import React from 'react';
import { PerformanceProjection, CacheTierMetrics, BudgetComplianceResult, SlowOperationEvent } from '@/types/performance';

interface PerformanceControlPanelProps {
  projection: PerformanceProjection;
}

export default function OperationsPerformanceControlPanel({ projection }: PerformanceControlPanelProps) {
  const {
    overallCompliance = 'COMPLIANT',
    budgets = [],
    cacheEfficiency = [],
    capacityTrend,
    recentSlowOperations = [],
  } = projection;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">
              {projection.platformVersion} Infrastructure Subsystem
            </span>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded border font-bold font-mono ${
                overallCompliance === 'COMPLIANT'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : overallCompliance === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}
            >
              Status: {overallCompliance}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mt-1">
            Performance Infrastructure & Scalability Telemetry
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Real-time multi-tier cache efficiency, budget compliance, and capacity projections.
          </p>
        </div>
      </div>

      {/* Capacity Trend Summary */}
      {capacityTrend && (
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <span className="text-xs font-bold text-gray-300 uppercase">System Capacity & Saturation Projection</span>
            <span className="text-emerald-400 font-bold">
              Saturation Point: {capacityTrend.estimatedSaturationPoint} req/sec
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Avg Throughput</span>
              <strong className="text-gray-200 text-sm">{capacityTrend.averageThroughput} rps</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Peak Throughput</span>
              <strong className="text-amber-300 text-sm">{capacityTrend.peakThroughput} rps</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Concurrency</span>
              <strong className="text-emerald-300 text-sm">{capacityTrend.sustainedConcurrency} active</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase">Memory Usage</span>
              <strong className="text-purple-300 text-sm">{capacityTrend.memoryUtilizationMb} MB</strong>
            </div>
          </div>
        </div>
      )}

      {/* Cache Tier Efficiency Table */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Multi-Tier Cache Efficiency Metrics
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {cacheEfficiency.map((c: CacheTierMetrics) => (
            <div key={c.tier} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1">
              <span className="text-amber-400 font-bold block">{c.tier}</span>
              <div className="flex justify-between">
                <span className="text-gray-400">Hit Ratio:</span>
                <strong className="text-emerald-300 font-bold">{(c.hitRatio * 100).toFixed(0)}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entries:</span>
                <span className="text-gray-200">{c.currentEntries} / {c.maxSize}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800">
                <span>Hits: {c.hitCount}</span>
                <span>Misses: {c.missCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Compliance Matrix */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Performance Budget Compliance Matrix ({budgets.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {budgets.map((b: BudgetComplianceResult) => (
            <div key={b.budgetId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <strong className="text-gray-200 block">{b.metricName}</strong>
                <span className="text-gray-400 text-[11px]">Target: {b.targetValue} | Measured: {b.measuredValue}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                b.status === 'COMPLIANT'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Slow Operation Telemetry Log */}
      {recentSlowOperations.length > 0 && (
        <div className="bg-gray-900/80 p-4 rounded-xl border border-amber-500/40 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Slow Operation Telemetry Log ({recentSlowOperations.length})
          </span>
          <div className="space-y-1 text-xs text-gray-300 font-mono">
            {recentSlowOperations.map((so: SlowOperationEvent) => (
              <div key={so.eventId} className="flex justify-between items-center border-b border-gray-800 pb-1">
                <span>[{so.subsystem}] {so.operation}</span>
                <span className="text-amber-300 font-bold">{so.durationMs}ms (Threshold: {so.thresholdMs}ms)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
