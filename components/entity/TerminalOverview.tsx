import React from 'react';
import { EntityTerminalViewModel } from '@/types/canonical';

export default function TerminalOverview({ viewModel }: { viewModel: EntityTerminalViewModel }) {
  const { description, type, aliases } = viewModel;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2">
        Executive Overview
      </h2>
      <p className="text-neutral-300 leading-relaxed text-sm">
        {description}
      </p>
      
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-neutral-500 w-24">Type</span>
          <span className="text-sm text-neutral-300 capitalize">{type}</span>
        </div>
        
        {aliases && aliases.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-xs uppercase text-neutral-500 w-24 mt-0.5">Aliases</span>
            <span className="text-sm text-neutral-300 font-mono">
              {aliases.join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
