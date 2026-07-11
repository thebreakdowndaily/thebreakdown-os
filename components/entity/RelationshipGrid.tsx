import React from 'react';
import Link from 'next/link';
import { Entity } from '@/types/canonical';

// Since Entity is still monolithic, we mock the relationship metadata 
// that will eventually come from `EntityRelationship[]`.
const getMockRelationshipMeta = (targetType: string) => {
  const roles = targetType === 'person' ? ['Founder', 'Executive', 'Critic'] : ['Subsidiary', 'Partner', 'Competitor'];
  return {
    role: roles[Math.floor(Math.random() * roles.length)],
    confidence: (0.8 + Math.random() * 0.19).toFixed(2), // 0.80 to 0.99
    evidenceCount: Math.floor(Math.random() * 50) + 1,
    latestInteraction: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
  };
};

export default function RelationshipGrid({ relatedEntities }: { relatedEntities: Entity[] }) {
  if (!relatedEntities || relatedEntities.length === 0) return null;

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Relationship Neighborhood
        </h2>
        <span className="text-xs text-neutral-500 font-mono">{relatedEntities.length} NODES</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedEntities.map(entity => {
          const meta = getMockRelationshipMeta(entity.type);
          
          return (
            <Link key={entity.slug} href={`/entity/${entity.slug}`} className="block group">
              <div className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-lg p-4 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1 block">
                      {meta.role}
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

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-800/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-neutral-500">Confidence</span>
                    <span className="text-xs text-emerald-400 font-mono">{meta.confidence}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-neutral-500">Evidence</span>
                    <span className="text-xs text-neutral-300 font-mono">{meta.evidenceCount} docs</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-neutral-500">Latest</span>
                    <span className="text-xs text-neutral-400 font-mono">{meta.latestInteraction}</span>
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
