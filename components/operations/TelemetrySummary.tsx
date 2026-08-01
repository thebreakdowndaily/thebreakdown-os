import React from 'react';
import { TelemetryProjection } from '@/types/telemetry';

interface TelemetrySummaryProps {
  projection: TelemetryProjection;
}

export default function TelemetrySummary({ projection }: TelemetrySummaryProps) {
  const { snapshot } = projection;
  const { health, performance, editorial, reliability, usage } = snapshot;

  const isHealthy = health.status === 'Healthy';
  const isWarning = health.status === 'Warning';

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">
              {projection.platformVersion} Telemetry Subsystem
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded border border-blue-500/40 font-bold font-mono">
              Projection v{projection.projectionVersion}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Platform Observability & Telemetry Projection
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border uppercase ${
            isHealthy
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : isWarning
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-red-500/20 text-red-300 border-red-500/40'
          }`}>
            {health.status} Status
          </span>
          <span className="text-xs text-gray-400 font-mono">
            {projection.eventCount} Events
          </span>
        </div>
      </div>

      {/* Metric Families Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Reliability */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Reliability Metrics
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Total API Requests:</span>
              <strong className="text-gray-200 font-mono">{reliability.totalApiRequests}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Errors:</span>
              <strong className="text-red-400 font-mono">{reliability.totalErrors}</strong>
            </div>
            <div className="flex justify-between border-t border-gray-800 pt-1">
              <span className="text-gray-400">Error Rate:</span>
              <strong className="text-emerald-400 font-mono">{(reliability.errorRate * 100).toFixed(2)}%</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Performance */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Performance Metrics
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Avg API Latency:</span>
              <strong className="text-gray-200 font-mono">{performance.avgApiLatencyMs} ms</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">P95 Latency:</span>
              <strong className="text-amber-300 font-mono">{performance.p95ApiLatencyMs} ms</strong>
            </div>
            <div className="flex justify-between border-t border-gray-800 pt-1">
              <span className="text-gray-400">Build Duration:</span>
              <strong className="text-blue-400 font-mono">{performance.buildDurationMs} ms</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Editorial */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Editorial Metrics
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Stories Published:</span>
              <strong className="text-emerald-400 font-mono">{editorial.storiesPublishedCount}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stories Updated:</span>
              <strong className="text-gray-200 font-mono">{editorial.storiesUpdatedCount}</strong>
            </div>
            <div className="flex justify-between border-t border-gray-800 pt-1">
              <span className="text-gray-400">Attestation Coverage:</span>
              <strong className="text-amber-300 font-mono">{(editorial.attestationCoverage * 100).toFixed(0)}%</strong>
            </div>
          </div>
        </div>

        {/* Card 4: Usage */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Usage Metrics
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Searches:</span>
              <strong className="text-gray-200 font-mono">{usage.totalSearches}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Entity Views:</span>
              <strong className="text-gray-200 font-mono">{usage.totalEntityViews}</strong>
            </div>
            <div className="flex justify-between border-t border-gray-800 pt-1">
              <span className="text-gray-400">Dashboard Opens:</span>
              <strong className="text-blue-400 font-mono">{usage.dashboardOpenCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts Panel */}
      {health.activeAlerts.length > 0 && (
        <div className="bg-gray-900/80 p-4 rounded-xl border border-amber-500/30 space-y-2">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
            Active Observability Alerts ({health.activeAlerts.length})
          </span>
          <div className="space-y-1 text-xs text-gray-300">
            {health.activeAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-amber-400">⚠️</span>
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
