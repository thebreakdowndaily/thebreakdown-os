import React from 'react';
import type { RadarPipelineRunRecord } from '@/services/radar/types';

interface MetricCardsProps {
  totalSources: number;
  healthyCount: number;
  failingCount: number;
  dueCount: number;
  activeSourcesCount: number;
  signalCount: number;
  latestRun: RadarPipelineRunRecord | null;
}

export function MetricCards({
  totalSources,
  healthyCount,
  failingCount,
  dueCount,
  activeSourcesCount,
  signalCount,
  latestRun,
}: MetricCardsProps) {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Monitored Sources
          </h2>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-light">{totalSources}</p>
            <span className="text-xs text-gray-500">
              ({healthyCount} healthy, {failingCount} degraded)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Sources Due for Poll
          </h2>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-light text-amber-600 dark:text-amber-400">{dueCount}</p>
            <span className="text-xs text-gray-500">of {activeSourcesCount} active</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Active Signals
          </h2>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-light text-blue-600 dark:text-blue-400">{signalCount}</p>
            <span className="text-xs text-gray-500">triage queue</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Last Poll Run
          </h2>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-medium">
              {latestRun
                ? `${latestRun.sourcesPolled} sources (${latestRun.cycleDurationMs}ms)`
                : 'Awaiting 1st run'}
            </p>
          </div>
          {latestRun && (
            <span className="text-xs text-gray-500">
              {new Date(latestRun.generatedAt).toLocaleTimeString()} · {latestRun.newArtifacts} new /{' '}
              {latestRun.changedArtifacts} chg
            </span>
          )}
        </div>
      </section>

      {latestRun && (
        <section className="bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800 mb-8 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Last Pipeline Telemetry ({latestRun.id})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <span className="text-xs text-gray-500 block">Sources Polled</span>
              <span className="text-xl font-medium">{latestRun.sourcesPolled}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">New Artifacts</span>
              <span className="text-xl font-medium text-green-600 dark:text-green-400">
                {latestRun.newArtifacts}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Changed Artifacts</span>
              <span className="text-xl font-medium text-amber-600 dark:text-amber-400">
                {latestRun.changedArtifacts}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Unchanged (Deduped)</span>
              <span className="text-xl font-medium text-gray-500">{latestRun.unchanged}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">P50 Latency</span>
              <span className="text-xl font-medium">
                {latestRun.medianDetectionLatencyMs
                  ? `${Math.round(latestRun.medianDetectionLatencyMs / 1000)}s`
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">P90 Latency</span>
              <span className="text-xl font-medium">
                {latestRun.p90DetectionLatencyMs
                  ? `${Math.round(latestRun.p90DetectionLatencyMs / 1000)}s`
                  : '—'}
              </span>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
