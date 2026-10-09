import React from 'react';
import type { DiscoveryTask } from '@/services/radar/discovery/queue';
import type { SourceCandidate } from '@/services/radar/discovery/types';

interface DiscoveryQueueViewProps {
  tasks: DiscoveryTask[];
  candidates?: SourceCandidate[];
}

export function DiscoveryQueueView({ tasks, candidates = [] }: DiscoveryQueueViewProps) {
  const p0Tasks = tasks.filter((t) => t.priority === 'P0');
  const p1Tasks = tasks.filter((t) => t.priority === 'P1');
  const otherTasks = tasks.filter((t) => t.priority !== 'P0' && t.priority !== 'P1');

  const pendingCandidates = candidates.filter(
    (c) => c.validationStatus === 'candidate' || c.validationStatus === 'validated'
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Autonomous Discovery Queue &amp; Editorial Review
          </h2>
          <p className="text-xs text-gray-500">
            Self-improving sensing loop · Human-in-the-loop activation gate
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 rounded font-medium">
            {p0Tasks.length} P0 High Priority
          </span>
          <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 rounded font-medium">
            {pendingCandidates.length} Candidates for Review
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prioritized Discovery Tasks */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Prioritized Discovery Tasks ({tasks.length})
          </h3>
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No pending discovery tasks. Coverage is optimal.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {[...p0Tasks, ...p1Tasks, ...otherTasks].map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded border border-gray-200 dark:border-gray-700/50 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.priority === 'P0'
                          ? 'bg-red-600 text-white'
                          : task.priority === 'P1'
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {task.priority} · {task.gapType}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-mono">{task.countryCode}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    Target: {task.geographyName} · Beat: {task.targetBeat}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mt-0.5">{task.reason}</p>
                  {task.recommendedInstitutions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-[11px]">
                      <span className="text-gray-500 font-medium">Recommended Institutions: </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {task.recommendedInstitutions.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Human Editorial Approval Gate */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Discovered Candidates Awaiting Approval ({pendingCandidates.length})
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-800 rounded font-semibold text-gray-700 dark:text-gray-300">
              STRICT HUMAN GATE
            </span>
          </div>

          {pendingCandidates.length === 0 ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/20 rounded border border-dashed border-gray-300 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-500">No candidates currently awaiting review.</p>
              <p className="text-[11px] text-gray-400 mt-1">
                New candidates discovered by crawler will appear here for editorial verification before activation.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {pendingCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded border border-gray-200 dark:border-gray-700/50 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                      {cand.organizationName}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {cand.validationStatus}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px] truncate">{cand.url}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500">
                      Beat: {cand.beat} · Class: {cand.authorityClass}
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-[11px] font-medium bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      title="Human gate: click to approve candidate for active monitoring"
                    >
                      Approve &amp; Activate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
