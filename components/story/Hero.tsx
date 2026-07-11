import React from 'react';
import Image from 'next/image';
import ActionBar from '@/components/story/ActionBar';
import VersionHistory from '@/components/story/VersionHistory';
import type { Story } from '@/types/canonical';

interface HeroProps {
  story: Story;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));

const evidenceBadgeStyle = (score: number) => {
  if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

const evidenceDotStyle = (score: number) => {
  if (score >= 80) return 'bg-green-400';
  if (score >= 60) return 'bg-amber-400';
  return 'bg-red-400';
};

const Hero: React.FC<HeroProps> = ({ story }) => {
  const { headline, summary, heroImage, publishedAt, readingTime, evidenceScore, sources, category, slug, versionHistory } = story;
  const sourceCount = sources?.length || 0;

  return (
    <section
      className="w-full bg-surface-primary mb-8"
      aria-label="Story hero"
    >
      <div className="w-full max-w-7xl mx-auto px-6 pt-6">
        <div className="relative w-full h-[60vh] min-h-[500px] rounded-xl overflow-hidden border border-border shadow-2xl flex flex-col justify-end">
          
          {/* Background Image */}
          {heroImage && (
            <Image
              src={heroImage}
              alt={headline}
              fill
              priority
              className="object-cover z-0"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          )}

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

          {/* Content Overlay */}
          <div className="relative z-20 w-full p-8 lg:p-12 text-white">
            <div className="max-w-4xl flex flex-col gap-5">
              
              {/* Category Badge */}
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm border border-white/20 bg-black/40 text-white text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm">
                    {category}
                  </span>
                )}
              </div>

              {/* Headline */}
              <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold text-white leading-[1.1] font-serif tracking-tight drop-shadow-lg">
                {headline}
              </h1>

              {/* Summary */}
              <p className="text-[clamp(1.1rem,1.5vw,1.25rem)] text-white/90 leading-relaxed max-w-3xl drop-shadow-md">
                {summary}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border text-[12px] font-bold uppercase tracking-widest backdrop-blur-sm ${evidenceBadgeStyle(evidenceScore)}`}
                  title={`Evidence score: ${String(evidenceScore)}%`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${evidenceDotStyle(evidenceScore)}`} />
                  {evidenceScore}% Evidence
                </span>

                {sourceCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-blue-500/30 bg-blue-500/20 text-blue-300 text-[12px] font-bold uppercase tracking-widest backdrop-blur-sm">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    {sourceCount} {sourceCount === 1 ? 'Source' : 'Sources'}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-white/20 bg-black/40 text-white/90 text-[12px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {readingTime} min read
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-white/20 bg-black/40 text-white/90 text-[12px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(publishedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions Bar (below the image) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 pb-2 border-b border-border mb-4">
          <div className="flex flex-col">
            <span className="text-text-muted text-xs font-bold uppercase tracking-widest">Story Actions</span>
          </div>
          <div className="flex items-center gap-3">
            {versionHistory && versionHistory.length > 0 && (
              <VersionHistory history={versionHistory} />
            )}
            <ActionBar slug={slug} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;