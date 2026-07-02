import React from 'react';
import StoryImage from '@/components/story/StoryImage';

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

const evidenceBadgeBg = (score: number) => {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#E4A11D';
  if (score >= 40) return '#EF4444';
  return '#EF4444';
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
      className="w-full bg-[#0B1020] overflow-hidden"
      aria-label="Story hero"
    >
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 min-h-[60vh] py-12 lg:py-0 items-center">
          {/* Left: Content */}
          <div className="flex flex-col gap-6 lg:py-16">
            <h1
              className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-[#F8FAFC] leading-tight"
            >
              {headline}
            </h1>
            <p
              className="text-[clamp(0.95rem,1.5vw,1.125rem)] text-[#94A3B8] leading-relaxed max-w-2xl"
            >
              {summary}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#story-content"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E4A11D] text-[#0B1020] font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                Read Story &rarr;
              </a>

              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: `${evidenceBadgeBg(evidenceScore)}20`, color: evidenceBadgeBg(evidenceScore) }}
                title={`Evidence score: ${evidenceScore}%`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: evidenceBadgeBg(evidenceScore) }} />
                {evidenceScore}% Evidence
              </span>

              {sources > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#3B82F6]/20 text-[#3B82F6]">
                  {sources} Sources
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#94A3B8]/20 text-[#94A3B8]">
                {readingTime} min read
              </span>
            </div>

            <div
              className="flex items-center gap-3 pt-4 mt-2 border-t border-[#1E293B]"
            >
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span
                  className="w-10 h-10 rounded-full bg-[#E4A11D] text-[#0B1020] flex items-center justify-center font-bold text-sm"
                >
                  {author.name.charAt(0)}
                </span>
              )}
              <div>
                <span className="font-medium text-sm text-[#F8FAFC]">{author.name}</span>
                {author.bio && (
                  <p className="text-xs text-[#94A3B8] mt-0.5">{author.bio}</p>
                )}
              </div>
              <span className="text-[#94A3B8] text-xs ml-auto">{formatDate(publishedAt)}</span>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative h-[300px] lg:h-[500px] rounded-xl overflow-hidden">
            {heroImage ? (
              <StoryImage
                src={heroImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#111827] flex items-center justify-center">
                <svg className="w-16 h-16 text-[#E4A11D]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
