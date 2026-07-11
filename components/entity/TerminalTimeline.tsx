import React from 'react';
import { EntityTerminalViewModel } from '@/types/canonical';

export default function TerminalTimeline({ viewModel }: { viewModel: EntityTerminalViewModel }) {
  const { timeline } = viewModel;

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col min-h-[150px] opacity-50">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 mb-4">
          Evidence Timeline
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs font-mono text-neutral-500 uppercase">No Timeline Events Extracted Yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Evidence Timeline
        </h2>
        <span className="text-xs text-neutral-500 font-mono">{timeline.length} EVENTS</span>
      </div>

      <div className="relative border-l border-neutral-800 ml-3 space-y-6">
        {timeline.map((event, index) => (
          <div key={event.id || index} className="relative pl-6">
            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#0c0c0c]" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">
                {new Date(event.date).toLocaleDateString()}
              </span>
              <h3 className="text-sm font-bold text-white leading-snug">
                {event.title}
              </h3>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 pt-2 border-t border-neutral-800/50 font-mono text-[10px] uppercase">
                <span className="text-neutral-500">EVIDENCE: <span className="text-neutral-300">{event.storyId ? 1 : 0} DOCS</span></span>
                <span className="text-neutral-500">CONFIDENCE: <span className="text-emerald-400">HIGH</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
