import React from 'react';
import IntelligentImage from '@/lib/media/components/IntelligentImage';
import { EntityTerminalViewModel } from '@/types/canonical';

export default function TerminalMedia({ viewModel }: { viewModel: EntityTerminalViewModel }) {
  const { media } = viewModel;

  if (!media || media.length === 0) return null;

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Media Intel
        </h2>
        <span className="text-xs text-neutral-500 font-mono">{media.length} FILES</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {media.map((asset) => (
          <div key={asset.id} className="relative group overflow-hidden rounded bg-neutral-900 border border-neutral-800 aspect-square">
            <IntelligentImage
              asset={asset as any}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Meta overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
              <span className="text-[10px] text-emerald-400 font-mono uppercase truncate">{asset.title || 'Untitled'}</span>
              <span className="text-[9px] text-neutral-400 font-mono uppercase">{asset.verificationStatus || 'VERIFIED'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
