import Link from 'next/link';
import Image from 'next/image';
import type { APIStory } from '@/utils/data-layer/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StoryMetadata from './StoryMetadata';

interface FeaturedHeroCardProps {
  story: APIStory;
}

export default function FeaturedHeroCard({ story }: FeaturedHeroCardProps) {
  return (
    <Card className="relative col-span-1 md:col-span-1 lg:row-span-2 overflow-hidden" accent="gold">
      <Link href={`/story/${story.slug}`} className="block h-full">
        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[280px] overflow-hidden">
          {story.heroImage && (
            <Image
              src={story.heroImage}
              alt={story.headline}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/10 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-7">
          <Badge variant="category">{story.category}</Badge>
          <h2 className="mt-3 text-xl sm:text-2xl lg:text-3xl font-bold text-[#F5F5F5] leading-tight group-hover:text-[#D4A843] transition-colors duration-200">
            {story.headline}
          </h2>
          <p className="mt-2 text-sm text-[#A1A1AA] line-clamp-2 max-w-prose">
            {story.summary}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <StoryMetadata
              evidenceScore={story.evidenceScore}
              readingTime={story.readingTime}
              publishedAt={story.publishedAt}
            />
            <span className="text-sm font-medium text-[#D4A843] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Read &rarr;
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
