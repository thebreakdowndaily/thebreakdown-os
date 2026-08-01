import React from 'react';
import { JobProjection } from '@/types/jobs';

interface JobsSummaryProps {
  projection: JobProjection;
}

export default function JobsSummary({ projection }: JobsSummaryProps) {
  const { categoryBreakdown, recentResults } = projection;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">
              {projection.platformVersion} Platform Automation Subsystem
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/40 font-bold font-mono">
              Job Projection v{projection.projectionVersion}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Operational Job Automation & Execution Summary
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
            {projection.completedCount} Completed
          </span>
          <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40">
            {projection.pendingCount} Pending
          </span>
          {projection.failedCount > 0 && (
            <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/40 font-bold">
              {projection.failedCount} Failed
            </span>
          )}
        </div>
      </div>

      {/* Statistics Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Enqueued */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Enqueued Jobs</span>
          <strong className="text-2xl text-amber-300 font-mono">{projection.totalEnqueued}</strong>
          <span className="text-[11px] text-gray-400 block pt-1">Across all categories</span>
        </div>

        {/* Card 2: Queue Status */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Active Queue Depth</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl text-blue-400 font-mono">{projection.pendingCount}</strong>
            <span className="text-xs text-gray-400">pending / {projection.runningCount} running</span>
          </div>
          <span className="text-[11px] text-gray-400 block pt-1">Priority-based queue</span>
        </div>

        {/* Card 3: Performance */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Average Job Latency</span>
          <strong className="text-2xl text-emerald-400 font-mono">{projection.averageDurationMs} ms</strong>
          <span className="text-[11px] text-gray-400 block pt-1">Deterministic execution</span>
        </div>

        {/* Card 4: Category Breakdown */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1 text-xs">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Category Breakdown</span>
          <div className="space-y-0.5 pt-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Maintenance:</span>
              <strong className="text-gray-200 font-mono">{categoryBreakdown.MAINTENANCE}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Integrity:</span>
              <strong className="text-gray-200 font-mono">{categoryBreakdown.INTEGRITY}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Search:</span>
              <strong className="text-gray-200 font-mono">{categoryBreakdown.SEARCH}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Execution Results Table */}
      {recentResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            Recent Job Execution Log ({recentResults.length})
          </h4>
          <div className="space-y-2 text-xs font-mono">
            {recentResults.map((r) => (
              <div key={r.executionId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                    r.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {r.status}
                  </span>
                  <span className="text-gray-200 font-bold">{r.jobId}</span>
                  <span className="text-gray-400 text-[11px]">{r.outputSummary}</span>
                </div>
                <div className="text-gray-400 text-[11px] flex items-center gap-3">
                  <span>Attempts: {r.attemptsUsed}</span>
                  <span>Duration: {r.durationMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
