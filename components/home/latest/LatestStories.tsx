'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { KnowledgeStory } from '@/services/stories/pipeline/builder';

interface LatestStoriesProps {
  stories: any[]; // These are resolved KnowledgeStory outputs
}

export default function LatestStories({ stories }: LatestStoriesProps) {
  if (!stories || stories.length === 0) return null;

  return (
    <section className="py-24 bg-neutral-950 border-t border-neutral-900" aria-labelledby="latest-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-12 border-b border-neutral-800 pb-4">
          <h2 id="latest-heading" className="text-3xl font-serif text-white">Further Reading</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => {
            const visualAssets = story.visualAssets;
            const heroImage = visualAssets?.hero?.resolvedAsset?.optimization.cdnUrl || story.raw?.heroImage;
            const logos = visualAssets?.logos || [];

            return (
              <motion.article 
                key={story.raw?.slug || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-col"
              >
                <Link href={`/story/${story.raw?.slug}`} className="block flex-1">
                  <div className="aspect-[4/3] bg-neutral-900 rounded-lg overflow-hidden relative mb-4">
                    {heroImage && (
                      <img
                        src={heroImage}
                        alt={story.raw?.headline}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur border border-neutral-800 text-[10px] uppercase tracking-widest text-emerald-400 px-2 py-1 rounded">
                      {story.raw?.category || 'News'}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                      <span>{story.raw?.readingTime || 5} Min Read</span>
                      {story.qualityScore?.score && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-500">QS {story.qualityScore.score}</span>
                        </>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors">
                      {story.raw?.headline}
                    </h3>
                    
                    <p className="text-sm text-neutral-400 line-clamp-3">
                      {story.raw?.summary}
                    </p>
                  </div>
                </Link>

                {logos.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-900 flex flex-wrap gap-2">
                    {logos.slice(0, 4).map((logo: any, idx: number) => (
                      <div key={idx} className="w-6 h-6 bg-white rounded flex items-center justify-center p-0.5" title={logo.resolvedAsset?.title}>
                        <img src={logo.resolvedAsset?.optimization.cdnUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    ))}
                    {logos.length > 4 && (
                      <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center text-[10px] text-neutral-500">
                        +{logos.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
