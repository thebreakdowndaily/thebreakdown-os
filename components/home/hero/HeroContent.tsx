import Badge from '@/components/ui/Badge';
import Heading from '@/components/ui/Heading';
import Stack from '@/components/ui/Stack';
import Divider from '@/components/ui/Divider';
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
    <Stack gap="lg" className="animate-fade-in">
      <div className="flex items-center gap-3">
        <Badge variant="breaking">Breaking</Badge>
        <span className="text-xs text-[#A1A1AA] font-medium uppercase tracking-wider">{category}</span>
      </div>

      <Heading level="display" as="h1">
        {headline}
      </Heading>

      <p className="text-base sm:text-lg text-[#A1A1AA] max-w-lg leading-relaxed">
        Complex stories. Clear analysis.
      </p>

      <HeroStats
        evidenceScore={evidenceScore}
        sourcesCount={sourcesCount}
        keyPointsCount={keyPoints.length}
        readingTime={readingTime}
      />

      <p className="text-[#A1A1AA] max-w-xl leading-relaxed text-sm">
        {summary}
      </p>

      <HeroActions storySlug={storySlug} />

      {keyPoints.length > 0 && (
        <>
          <Divider />
          <HeroHighlights keyPoints={keyPoints} />
        </>
      )}
    </Stack>
  );
}
