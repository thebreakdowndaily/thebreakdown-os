import React from 'react';
import { ControlPlaneProjection } from '@/types/control-plane';

interface OperationsControlPlaneProps {
  projection: ControlPlaneProjection;
}

export default function OperationsControlPlane({ projection }: OperationsControlPlaneProps) {
  const { snapshot, recentControlEvents } = projection;
  const { health, configuration, telemetrySummary, jobsSummary } = snapshot;

  const isHealthy = health.severity === 'HEALTHY';
  const isWarning = health.severity === 'WARNING';

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 p-6 space-y-6 font-sans">
      
      {/* Top Header Banner */}
      <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              {projection.platformVersion} Operations Control Plane
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded border border-purple-500/40 font-bold font-mono">
              Env: {configuration.environment}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-100 mt-1">
            Platform Operational Command & Control
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-gray-400 font-mono block">System Status</span>
            <strong className={`text-sm font-mono font-bold px-3 py-1 rounded-full border uppercase inline-block mt-0.5 ${
              isHealthy
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : isWarning
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-red-500/20 text-red-300 border-red-500/40'
            }`}>
              {projection.systemStatusLabel}
            </strong>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Subsystem Health */}
        <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/60 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Subsystem Health Status
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Telemetry:</span>
              <strong className="text-emerald-400 font-mono">{health.subsystemStatuses.telemetry}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Automation:</span>
              <strong className="text-emerald-400 font-mono">{health.subsystemStatuses.jobs}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Editorial:</span>
              <strong className="text-emerald-400 font-mono">{health.subsystemStatuses.editorial}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Telemetry Metrics */}
        <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/60 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Telemetry Subsystem
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Stream Events:</span>
              <strong className="text-gray-200 font-mono">{telemetrySummary.totalEvents}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">API Error Rate:</span>
              <strong className="text-emerald-400 font-mono">{(telemetrySummary.errorRate * 100).toFixed(2)}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg API Latency:</span>
              <strong className="text-gray-200 font-mono">{telemetrySummary.avgLatencyMs} ms</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Automation Queue */}
        <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/60 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Automation Subsystem
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Enqueued Jobs:</span>
              <strong className="text-gray-200 font-mono">{jobsSummary.totalEnqueued}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Completed Jobs:</span>
              <strong className="text-emerald-400 font-mono">{jobsSummary.completedCount}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Queue Depth:</span>
              <strong className="text-blue-400 font-mono">{jobsSummary.pendingCount} pending</strong>
            </div>
          </div>
        </div>

        {/* Card 4: Configuration */}
        <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/60 space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            Runtime Configuration
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Build Version:</span>
              <strong className="text-gray-200 font-mono">{configuration.buildVersion}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Maintenance Mode:</span>
              <strong className="text-gray-200 font-mono">{configuration.maintenanceMode ? 'ACTIVE' : 'OFF'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Concurrent Jobs:</span>
              <strong className="text-amber-300 font-mono">{configuration.maxConcurrentJobs}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts Panel */}
      {health.activeAlerts.length > 0 && (
        <div className="bg-gray-800/80 p-4 rounded-xl border border-amber-500/40 space-y-2">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
            Active Control Plane Alerts ({health.activeAlerts.length})
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

      {/* Recent Control Plane Events Log */}
      {recentControlEvents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            Control Plane Audit Log ({recentControlEvents.length})
          </h4>
          <div className="space-y-2 text-xs font-mono">
            {recentControlEvents.map((evt) => (
              <div key={evt.eventId} className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/60 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-blue-500/40">
                    {evt.type}
                  </span>
                  <span className="text-gray-200 font-bold">{evt.eventId}</span>
                  <span className="text-gray-400">Source: {evt.source}</span>
                </div>
                <span className="text-gray-400 text-[11px]">{evt.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
