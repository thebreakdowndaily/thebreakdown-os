import React from 'react';
import type { RadarSourceDefinition, RadarSourceHealth, RadarSourceScheduleState } from '@/services/radar/types';

interface SensorTableProps {
  sources: RadarSourceDefinition[];
  healthMap: Map<string, RadarSourceHealth>;
  evaluatedStates: Map<string, RadarSourceScheduleState>;
}

export function SensorTable({ sources, healthMap, evaluatedStates }: SensorTableProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Monitored Sensor Array</h2>
      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left border-collapse text-sm" aria-label="Monitored Sensor Table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
              <th className="p-3 font-medium">Source</th>
              <th className="p-3 font-medium">Schedule</th>
              <th className="p-3 font-medium">Health</th>
              <th className="p-3 font-medium">Failures</th>
              <th className="p-3 font-medium">Latency</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => {
              const health = healthMap.get(source.id);
              const schedState =
                evaluatedStates.get(source.id) || (source.enabled ? 'READY' : 'DISABLED');
              const failures = health?.consecutiveFailures || 0;

              return (
                <tr
                  key={source.id}
                  className="border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                >
                  <td className="p-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{source.name}</div>
                    <div className="text-xs text-gray-500 uppercase font-mono">
                      {source.collectorType} · {source.pollIntervalMinutes}m · {source.beat}
                      {source.syndicatedFrom && ` · [${source.syndicatedFrom}]`}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        schedState === 'DUE'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : schedState === 'RUNNING'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : schedState === 'BACKOFF'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          : schedState === 'STALE'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {schedState}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        health?.status === 'healthy'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : health?.status === 'degraded'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          : health?.status === 'failing'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {health?.status || 'new'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">
                    {failures > 0 ? (
                      <span className="text-red-600 font-semibold">
                        {failures} (backoff {health?.backoffMinutes || 0}m)
                      </span>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td className="p-3 text-gray-500 font-mono text-xs">
                    {health?.averageFetchMs ? `${Math.round(health.averageFetchMs)}ms` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
