'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Entity } from '@/types/canonical';

interface EntitySpotlightProps {
  entities: Entity[];
}

export default function EntitySpotlight({ entities }: EntitySpotlightProps) {
  if (!entities || entities.length === 0) return null;

  const labels = ['Today', 'This Week', 'Trending'];

  return (
    <section className="py-24 bg-neutral-950 border-t border-neutral-900" aria-labelledby="spotlight-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-12 border-b border-neutral-800 pb-4">
          <h2 id="spotlight-heading" className="text-3xl font-serif text-white">Key Thinkers and Organizations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {entities.slice(0, 3).map((entity, index) => (
            <motion.div 
              key={entity.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-[#0a0a0a] rounded-2xl border border-neutral-800 p-8 shadow-xl flex flex-col items-center text-center group hover:border-emerald-500/50 transition-colors"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-6">
                {labels[index] || 'Spotlight'}
              </div>

              {/* Portrait */}
              <div className="w-32 h-32 rounded-full border-4 border-neutral-900 overflow-hidden shrink-0 bg-neutral-900 relative mb-6">
                 <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-neutral-800">
                   {entity.name.charAt(0)}
                 </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="inline-flex items-center gap-2 bg-emerald-950/30 border border-emerald-900/50 px-3 py-1 rounded-full text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                  {entity.type}
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {entity.name}
                </h3>

                <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3">
                  {entity.description}
                </p>

                <div className="flex justify-center gap-8 pt-4">
                  <div className="flex flex-col text-center">
                    <span className="text-xl font-light text-white mb-1">98%</span>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Confidence</span>
                  </div>
                  <div className="flex flex-col text-center">
                    <span className="text-xl font-light text-white mb-1">{entity.storyCount || 0}</span>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Mentions</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-900 mt-4">
                  <Link 
                    href={`/entity/${entity.slug}`}
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold text-xs tracking-widest uppercase transition-colors"
                  >
                    Read Profile
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
