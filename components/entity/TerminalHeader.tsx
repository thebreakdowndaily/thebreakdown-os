import React from 'react';
import IntelligentImage from '@/lib/media/components/IntelligentImage';
import CoverageHeatmap from './CoverageHeatmap';
import { EntityTerminalViewModel } from '@/types/canonical';

export default function TerminalHeader({ viewModel }: { viewModel: EntityTerminalViewModel }) {
  const { hero, logo, name, type, aliases, health } = viewModel;

  return (
    <div className="relative border-b border-neutral-800 bg-[#0c0c0c] overflow-hidden">
      {/* Background Hero Layer */}
      {hero && (
        <div className="absolute inset-0 z-0 opacity-20 mask-image-gradient-b">
          <IntelligentImage
            asset={hero as any}
            priority={true}
            className="w-full h-full object-cover grayscale"
          />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          
          <div className="flex items-start gap-6">
            {/* Entity Logo / Portrait Slot */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-neutral-900 border-2 border-neutral-800 rounded-xl flex items-center justify-center shrink-0 shadow-2xl overflow-hidden relative">
               {logo || hero ? (
                 <IntelligentImage
                  asset={(logo || hero) as any}
                  priority={true}
                  className="w-full h-full object-cover"
                />
               ) : (
                 <span className="text-3xl sm:text-4xl text-neutral-600 font-serif">
                   {name.charAt(0)}
                 </span>
               )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 uppercase">
                  {type}
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-neutral-500 font-mono tracking-wider">ACTIVE</span>
                
                {viewModel.freshness && (
                  <>
                    <span className="text-neutral-700">•</span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Verified {viewModel.freshness.lastVerified}
                    </span>
                  </>
                )}
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-2">
                {name}
              </h1>
              
              {aliases && aliases.length > 0 && (
                <p className="text-sm text-neutral-400 font-mono">
                  AKA: {aliases.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Right side: Trust Signals & Heatmap */}
          <div className="flex flex-col gap-4 lg:items-end w-full lg:w-auto">
            <CoverageHeatmap />
            
            {/* Bloomberg-Style Entity Health Panel */}
            <div className="font-mono text-[10px] sm:text-xs text-neutral-400 p-3 bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-neutral-800 flex flex-wrap gap-4 items-center">
              <div className="flex flex-col">
                <span className="uppercase tracking-widest text-neutral-500 mb-1">Confidence</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{health.confidence}%</span>
                </div>
              </div>
              <div className="w-px h-6 bg-neutral-800 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="uppercase tracking-widest text-neutral-500 mb-1">Evidence</span>
                <span className="text-white">{health.evidenceCount}</span>
              </div>
              <div className="w-px h-6 bg-neutral-800 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="uppercase tracking-widest text-neutral-500 mb-1">Sources</span>
                <span className="text-white">{health.sourceCount}</span>
              </div>
              <div className="w-px h-6 bg-neutral-800 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="uppercase tracking-widest text-neutral-500 mb-1">Relationships</span>
                <span className="text-white">{health.relationshipCount}</span>
              </div>
              <div className="w-px h-6 bg-neutral-800 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="uppercase tracking-widest text-neutral-500 mb-1">Media</span>
                <span className="text-white">{health.mediaCount}</span>
              </div>
              <div className="w-px h-6 bg-neutral-800 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="uppercase tracking-widest text-neutral-500 mb-1">Claims</span>
                <span className="text-white">{health.claimCount}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
