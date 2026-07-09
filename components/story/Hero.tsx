import React from 'react';
import Image from 'next/image';
import StoryImage from '@/components/story/StoryImage';
import type { APITimelineEvent, APIChart, APIGeoData } from '@/utils/data-layer/types';
import HeroVisual from '@/components/home/hero/HeroVisual';

interface HeroProps {
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  author: { name: string; avatar?: string; bio?: string; url?: string };
  evidenceScore: number;
  sources?: number;
  charts?: APIChart[];
  geoData?: APIGeoData;
  timeline?: APITimelineEvent[];
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));

const Hero: React.FC<HeroProps> = ({
  headline,
  summary,
  heroImage,
  publishedAt,
  readingTime,
  author,
  evidenceScore,
  sources = 0,
  charts,
  geoData,
  timeline,
}) => {
  return (
    <section
      className="w-full bg-neutral-950 overflow-hidden border-b border-neutral-900"
      aria-label="Story hero"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 min-h-[60vh] py-16 lg:py-24 items-center">
          {/* Left: Content */}
          <div className="flex flex-col gap-8">
            <div className="space-y-6">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-[-0.025em] text-white"
                style={{ fontFamily: 'var(--font-editorial)' }}
              >
                {headline}
              </h1>
              
              <div className="flex items-center gap-5 text-xs text-neutral-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
                  {evidenceScore}% evidence score
                </span>
                {sources > 0 && <span>{sources} sources</span>}
                <span>{readingTime} min read</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-neutral-800/60">
              {author.avatar ? (
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
              ) : (
                <span
                  className="w-11 h-11 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-sm"
                >
                  {author.name.charAt(0)}
                </span>
              )}
              <div>
                <span className="font-medium text-sm text-neutral-200">{author.name}</span>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                  {author.bio && <span>{author.bio}</span>}
                  {author.bio && <span>&middot;</span>}
                  <span>{formatDate(publishedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual (uses unified HeroVisual from home) */}
          <div className="relative">
             <HeroVisual 
                headline={headline}
                heroImage={heroImage}
                timeline={timeline}
                charts={charts}
                geoData={geoData}
             />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
