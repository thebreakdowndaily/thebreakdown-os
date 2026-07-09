import Badge from '@/components/ui/Badge';
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
  headline, summary, evidenceScore, sourcesCount,
  readingTime, category, storySlug, keyPoints,
}: HeroContentProps) {
  return (
    <div className="space-y-7 animate-slideUp">
      {/* Category label */}
      <div className="flex items-center gap-3">
        <span className="section-label">{category}</span>
      </div>

      {/* Headline — editorial serif, large */}
      <h1
        id="hero-headline"
        className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-[-0.025em] text-white"
        style={{ fontFamily: 'var(--font-editorial)' }}
      >
        {headline}
      </h1>

      {/* Summary */}
      <p className="text-lg text-neutral-400 leading-relaxed max-w-lg">
        {summary}
      </p>

      {/* Trust signals */}
      <div className="flex items-center gap-5 text-xs text-neutral-500 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
          {evidenceScore}% evidence score
        </span>
        <span>{sourcesCount} sources</span>
        <span>{readingTime} min read</span>
      </div>

      {/* CTA */}
      <HeroActions storySlug={storySlug} />

      {/* Key points */}
      {keyPoints.length > 0 && (
        <div className="pt-6 border-t border-neutral-800">
          <HeroHighlights keyPoints={keyPoints} />
        </div>
      )}
    </div>
  );
}
