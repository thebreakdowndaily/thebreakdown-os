import React from 'react';
import EntityConfidencePanel from './EntityConfidencePanel';
import CoverageHeatmap from './CoverageHeatmap';
import { Entity } from '@/types/canonical';

interface EntityIntelligenceHeaderProps {
  entity: Entity;
  storyCount: number;
}

export default function EntityIntelligenceHeader({ entity, storyCount }: EntityIntelligenceHeaderProps) {
  const hasImage = !!entity.image;

  return (
    <div className="relative border-b border-neutral-800 bg-[#0c0c0c] overflow-hidden">
      {/* Background Hero Layer */}
      {hasImage && (
        <div className="absolute inset-0 z-0 opacity-20 mask-image-gradient-b">
          <img
            src={entity.image}
            alt=""
            className="w-full h-full object-cover grayscale"
          />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          
          <div className="flex items-start gap-6">
            {/* Entity Logo / Portrait Slot */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-neutral-900 border-2 border-neutral-800 rounded-xl flex items-center justify-center shrink-0 shadow-2xl overflow-hidden relative">
               {hasImage ? (
                 <img
                  src={entity.image}
                  alt={entity.name}
                  className="w-full h-full object-cover"
                />
               ) : (
                 <span className="text-3xl sm:text-4xl text-neutral-600 font-serif">
                   {entity.name.charAt(0)}
                 </span>
               )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700 uppercase">
                  {entity.type}
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-neutral-500 font-mono tracking-wider">ACTIVE</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-2">
                {entity.name}
              </h1>
              
              {entity.aliases && entity.aliases.length > 0 && (
                <p className="text-sm text-neutral-400 font-mono">
                  AKA: {entity.aliases.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Right side: Trust Signals & Heatmap */}
          <div className="flex flex-col gap-4 lg:items-end w-full lg:w-auto">
            <CoverageHeatmap />
            <EntityConfidencePanel
              confidence={97}
              evidenceCount={storyCount}
              sourceCount={18}
              officialCount={11}
              mediaCount={7}
              researchCount={24}
              updatedAt="2 hours ago"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
