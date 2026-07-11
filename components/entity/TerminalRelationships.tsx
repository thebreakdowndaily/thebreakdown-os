import React from 'react';
import Link from 'next/link';
import IntelligentImage from '@/lib/media/components/IntelligentImage';
import { EntityTerminalViewModel } from '@/types/canonical';

export default function TerminalRelationships({ viewModel }: { viewModel: EntityTerminalViewModel }) {
  const { relationships } = viewModel;

  if (!relationships || relationships.length === 0) return null;

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Relationship Neighborhood
        </h2>
        <span className="text-xs text-neutral-500 font-mono">{relationships.length} NODES</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relationships.map(rel => {
          const { entity, confidence, role, evidence, latestMention } = rel;
          const confidencePercent = Math.round(confidence * 100);
          
          return (
            <Link key={entity.slug} href={`/entity/${entity.slug}`} className="block group">
              <div className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-lg p-4 transition-all duration-200 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1 block">
                      {role || 'Related'}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {entity.name}
                    </h3>
                  </div>
                  {entity.image ? (
                    <img src={entity.image} alt={entity.name} className="w-10 h-10 rounded bg-neutral-800 object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500">
                      {entity.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-800/50 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-neutral-500">Confidence</span>
                    <span className="text-xs text-emerald-400 font-mono">{confidencePercent}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-neutral-500">Evidence</span>
                    <span className="text-xs text-neutral-300 font-mono">{evidence} docs</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-neutral-500">Latest</span>
                    <span className="text-xs text-neutral-400 font-mono">
                       {/* Format loosely for now */}
                       {latestMention ? new Date(latestMention).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
