import React from 'react';
import { EditorialTask } from '@/types/canonical';

export default function EditorialQueue({ tasks }: { tasks: EditorialTask[] }) {
  const priorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-neutral-400 bg-neutral-800 border-neutral-700';
    }
  };

  const statusColor = (s: string) => {
    if (s === 'assigned') return 'text-purple-400 border-purple-500/30';
    if (s === 'pending') return 'text-amber-400 border-amber-500/30';
    return 'text-emerald-400 border-emerald-500/30';
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Editorial Queue
        </h2>
        <span className="text-sm font-mono text-neutral-400">{tasks.length} Pending Tasks</span>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#111] border-b border-neutral-800 text-neutral-400 font-mono text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Task</th>
              <th className="px-6 py-4 font-medium">Priority</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Owner</th>
              <th className="px-6 py-4 font-medium text-right">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-neutral-900/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-neutral-200 group-hover:text-emerald-400 transition-colors">{task.title}</span>
                    <span className="text-xs text-neutral-500 font-mono mt-1">Ref: {task.evidence.sourceId}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${priorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-black ${statusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-400">
                  {task.owner || <span className="text-neutral-600 italic">Unassigned</span>}
                </td>
                <td className="px-6 py-4 text-right font-mono text-neutral-400 text-xs">
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 font-mono text-sm">
                  Queue is clear. Excellent work.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
