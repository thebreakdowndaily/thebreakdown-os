'use client';

import type { APIStory } from '@/utils/data-layer/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeroProps {
  story: APIStory;
}

export default function Hero({ story }: HeroProps) {
  // Use visualAssets if available from the pipeline, fallback to story.heroImage
  const heroImage = (story as any).visualAssets?.hero?.resolvedAsset?.optimization.cdnUrl || story.heroImage;

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex flex-col justify-end overflow-hidden group">
      {/* Background Image */}
      {heroImage ? (
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={heroImage}
            alt={story.headline}
            className="w-full h-full object-cover"
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl space-y-6"
        >
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-[72px] leading-[1.1] font-bold text-white tracking-tight">
            {story.headline}
          </h1>

          {/* One-line deck / Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono tracking-widest uppercase text-emerald-400 mt-6 mb-4">
            <span className="bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/20">{story.category}</span>
            <span>•</span>
            <span>{story.readingTime} Min Read</span>
            {story.evidenceScore > 0 && (
              <>
                <span>•</span>
                <span className="text-white">{story.evidenceScore}% Confidence</span>
              </>
            )}
          </div>

          {/* Quick Brief */}
          <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed max-w-3xl font-medium">
            {story.summary}
          </p>

          {/* Key Facts / Metadata */}
          {story.keyPoints && story.keyPoints.length > 0 && (
            <div className="flex flex-col gap-2 mt-6">
              <span className="text-xs uppercase text-neutral-500 tracking-widest font-bold">Key Facts</span>
              <ul className="list-disc pl-5 text-neutral-300 space-y-1">
                {story.keyPoints.slice(0, 3).map((point, i) => (
                  <li key={i} className="text-sm">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="pt-8">
            <Link 
              href={`/story/${story.slug}`}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-full font-bold transition-colors"
            >
              Read Story
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}