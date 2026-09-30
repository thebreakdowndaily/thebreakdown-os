import React from 'react';
import type { NewsroomSignal } from '@/types/newsroom-intelligence';

interface SignalTableProps {
  signals: NewsroomSignal[];
}

export function SignalTable({ signals }: SignalTableProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Recent Real-World Signals</h2>
      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left border-collapse text-sm" aria-label="Recent Real-World Signals Table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
              <th className="p-3 font-medium">Event Signal</th>
              <th className="p-3 font-medium">Priority</th>
              <th className="p-3 font-medium">Sources</th>
              <th className="p-3 font-medium">State</th>
              <th className="p-3 font-medium">Obs</th>
            </tr>
          </thead>
          <tbody>
            {signals.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                  Sensor array active. Awaiting first detected event from monitored feeds.
                </td>
              </tr>
            ) : (
              signals.map((signal) => (
                <tr
                  key={signal.id}
                  className="border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                >
                  <td className="p-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{signal.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{signal.summary}</div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        signal.priority === 'P0'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          : signal.priority === 'P1'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {signal.priority}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {signal.independentSourceCount} indep
                    </span>
                    {signal.primarySourceCount > 0 && (
                      <span className="text-green-600 dark:text-green-400 ml-1 font-semibold">
                        ({signal.primarySourceCount} pri)
                      </span>
                    )}
                  </td>
                  <td className="p-3 capitalize text-xs text-gray-600 dark:text-gray-400">
                    {signal.lifecycleState}
                  </td>
                  <td className="p-3 text-gray-500 font-mono text-xs">
                    {signal.observationCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
