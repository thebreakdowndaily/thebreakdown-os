import React from 'react';
import IntelligentImage from '@/lib/media/components/IntelligentImage';
import { AssetReference, ImageAsset } from '@/types/canonical';

// Mock resolver since we only have asset references, not the full asset yet.
// In Phase 4, the EntityResolver will populate full ImageAsset models here.
const generateMockImageAsset = (ref: AssetReference): ImageAsset => {
  return {
    id: ref.assetId,
    slug: ref.assetId,
    type: 'image',
    title: `Asset ${ref.assetId}`,
    altText: `Asset ${ref.assetId}`,
    metadata: { width: 800, height: 600, mimeType: 'image/jpeg', aiGenerated: false },
    attribution: { caption: 'Archival Photo', credit: 'Getty Images', license: 'editorial' },
    optimization: {
      cdnUrl: `https://picsum.photos/seed/${ref.assetId}/800/600`, // Mock URL for gallery
    },
    relationships: { entities: [], topics: [], stories: [], collections: [] },
    currentVersion: 1,
    versions: [],
    priority: 'editorial',
    confidence: 0.95,
    usageCount: 1,
    verificationStatus: 'verified',
    uploadedAt: new Date().toISOString(),
    usageGraph: { stories: [], topics: [], entities: [], homepages: [], newsletters: [], collections: [] }
  };
};

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
          const asset = generateMockImageAsset(ref);
          return (
            <div key={ref.assetId} className="relative aspect-video rounded-lg overflow-hidden border border-neutral-800 group cursor-pointer bg-neutral-900">
              <IntelligentImage
                asset={asset}
                priority={false}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{asset.attribution.credit}</span>
                  <span className="text-[10px] text-neutral-300 uppercase tracking-widest">{asset.attribution.license}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
