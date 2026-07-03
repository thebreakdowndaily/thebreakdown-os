import HeroStats from './HeroStats';
import HeroActions from './HeroActions';
import HeroHighlights from './HeroHighlights';

interface HeroContentProps {
  headline: string;
  summary: string;
  evidenceScore: number;
  sourcesCount: number;
  updatedAt: string;
  readingTime: number;
  category: string;
  storySlug: string;
  keyPoints: string[];
}

export default function HeroContent({
  headline, summary, evidenceScore, sourcesCount, updatedAt,
  readingTime, category, storySlug, keyPoints,
}: HeroContentProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breaking badge + category */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          Breaking
        </div>
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{category}</span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight">
        {headline}
      </h1>

      {/* Tagline */}
      <p className="text-base sm:text-lg text-gray-400 max-w-lg leading-relaxed">
        Complex stories. Clear analysis.
      </p>

      {/* Trust signals */}
      <HeroStats
        evidenceScore={evidenceScore}
        sourcesCount={sourcesCount}
        updatedAt={updatedAt}
        readingTime={readingTime}
      />

      {/* Summary */}
      <p className="text-gray-300 max-w-xl leading-relaxed text-sm">
        {summary}
      </p>

      {/* CTAs */}
      <HeroActions storySlug={storySlug} />

      {/* Key Findings */}
      <HeroHighlights keyPoints={keyPoints} />
    </div>
  );
}
