import React from 'react';
import StoryImage from '@/components/story/StoryImage';
import { cn } from '@/utils/cn';

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
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));

const evidenceBadgeStyle = (score: number) => {
  if (score >= 80) return 'bg-green-500/10 text-green-500 border-green-500/20';
  if (score >= 60) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  return 'bg-red-500/10 text-red-500 border-red-500/20';
};
const evidenceDotStyle = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

const Hero: React.FC<HeroProps> = ({
  headline,
  summary,
  heroImage,
  publishedAt,
  readingTime,
  author,
  evidenceScore,
  sources = 0,
}) => {
  return (
    <section
      className="w-full bg-surface-primary overflow-hidden border-b border-border"
      aria-label="Story hero"
    >
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 min-h-[50vh] py-12 lg:py-16 items-center">
          {/* Left: Content */}
          <div className="flex flex-col gap-6">
            <h1
              className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-text-primary leading-[1.1] font-serif tracking-tight"
            >
              {headline}
            </h1>
            <p
              className="text-[clamp(1rem,1.5vw,1.25rem)] text-text-secondary leading-relaxed max-w-2xl"
            >
              {summary}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span
                className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[11px] font-bold uppercase tracking-widest", evidenceBadgeStyle(evidenceScore))}
                title={`Evidence score: ${String(evidenceScore)}%`}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", evidenceDotStyle(evidenceScore))} />
                {evidenceScore}% Evidence
              </span>

              {sources > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[11px] font-bold uppercase tracking-widest">
                  {sources} Sources
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border border-border bg-surface-tertiary text-text-muted text-[11px] font-bold uppercase tracking-widest">
                {readingTime} min read
              </span>
            </div>

            <div
              className="flex items-center gap-3 pt-6 mt-4 border-t border-border"
            >
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-10 h-10 rounded bg-surface-tertiary object-cover grayscale"
                />
              ) : (
                <span
                  className="w-10 h-10 rounded bg-surface-tertiary border border-border text-text-primary flex items-center justify-center font-bold text-sm"
                >
                  {author.name.charAt(0)}
                </span>
              )}
              <div>
                <span className="font-bold text-sm text-text-primary uppercase tracking-widest">{author.name}</span>
                {author.bio && (
                  <p className="text-xs text-text-muted mt-0.5">{author.bio}</p>
                )}
              </div>
              <span className="text-text-muted text-xs ml-auto uppercase tracking-widest font-semibold">{formatDate(publishedAt)}</span>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative h-[300px] lg:h-[450px] rounded-lg overflow-hidden border border-border bg-surface-secondary">
            {heroImage ? (
              <StoryImage
                src={heroImage}
                alt=""
                className="w-full h-full object-cover grayscale opacity-90"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
