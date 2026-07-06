import Image from 'next/image';
import Heading from '@/components/ui/Heading';
import Badge from '@/components/ui/Badge';
import StoryMeta from './StoryMeta';

interface StoryHeroProps {
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  evidenceScore: number;
  category: string;
  author: { name: string; avatar?: string; bio?: string };
  sourcesCount: number;
}

export default function StoryHero({
  headline, summary, heroImage, publishedAt, updatedAt,
  readingTime, evidenceScore, category, author, sourcesCount,
}: StoryHeroProps) {
  return (
    <div className="w-full">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="evidence">{evidenceScore}</Badge>
          <Badge variant="category">{category}</Badge>
        </div>

        <Heading level="display" as="h1" className="mb-4">
          {headline}
        </Heading>

        <p className="text-lg sm:text-xl text-[#A1A1AA] leading-relaxed max-w-3xl mb-6">
          {summary}
        </p>

        <StoryMeta
          author={author}
          publishedAt={publishedAt}
          updatedAt={updatedAt}
          readingTime={readingTime}
          evidenceScore={evidenceScore}
          category={category}
          sourcesCount={sourcesCount}
        />
      </div>

      {heroImage && (
        <div className="relative w-full aspect-[2/1] sm:aspect-[2.4/1] max-h-[600px]">
          <Image
            src={heroImage}
            alt={headline}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        </div>
      )}
    </div>
  );
}
