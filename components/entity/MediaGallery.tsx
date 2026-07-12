import React from 'react';
import { AssetReference } from '@/types/canonical';

export default function MediaGallery({ media }: { media?: AssetReference[] }) {
  if (!media || media.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col min-h-[200px] opacity-50">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 mb-4">
          Media Assets
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs font-mono text-neutral-500 uppercase">No visual assets found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Media Assets
        </h2>
        <span className="text-xs text-neutral-500 font-mono">{media.length} ITEMS</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {media.map((ref) => {
          const url = ref.resolvedAsset?.optimization.cdnUrl;
          const title = ref.resolvedAsset?.title || ref.resolvedAsset?.altText || 'Asset';
          const credit = ref.resolvedAsset?.attribution?.credit || '';
          const license = ref.resolvedAsset?.attribution?.license || '';
          return (
            <div key={ref.assetId} className="relative aspect-video rounded-lg overflow-hidden border border-neutral-800 group cursor-pointer bg-neutral-900">
              {url ? (
                <img
                  src={url}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">No Image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{credit || 'Uncredited'}</span>
                  <span className="text-[10px] text-neutral-300 uppercase tracking-widest">{license}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
