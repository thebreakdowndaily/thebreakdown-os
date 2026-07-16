'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Topic } from '@/types/canonical';

interface TrendingTopicsProps {
  topics: Topic[];
}

export default function TrendingTopics({ topics }: TrendingTopicsProps) {
  if (!topics || topics.length === 0) return null;

  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-neutral-900" aria-labelledby="topics-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-12 border-b border-neutral-800 pb-4">
          <h2 id="topics-heading" className="text-3xl font-serif text-white">Explore by Topic</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topics.slice(0, 4).map((topic, index) => (
            <motion.article 
              key={topic.id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors"
            >
              <Link href={`/topic/${topic.slug}`} className="block flex-1 flex flex-col">
                <div className="h-40 bg-neutral-950 relative overflow-hidden">
                  <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                    {/* Placeholder for Topic Image */}
                    <span className="text-neutral-700 text-5xl font-black uppercase opacity-20">{topic.name.slice(0,2)}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {topic.name}
                    </h3>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-neutral-400 line-clamp-2 mb-4 flex-1">
                    {topic.description || `Explore intelligence and latest stories regarding ${topic.name}.`}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 uppercase tracking-widest mt-auto pt-4 border-t border-neutral-800/50">
                    <div className="flex flex-col">
                      <span className="text-white text-lg font-mono">{topic.storyIds?.length || 0}</span>
                      <span className="text-[9px]">Stories</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-lg font-mono">{topic.relatedEntityIds?.length || 0}</span>
                      <span className="text-[9px]">Entities</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
