import Link from 'next/link';
import Image from 'next/image';
import type { APIStory } from '@/utils/data-layer/types';
import StoryBadge from './StoryBadge';
import StoryMetadata from './StoryMetadata';

interface FeaturedStoryCardProps {
  story: APIStory;
}

export default function FeaturedStoryCard({ story }: FeaturedStoryCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-xl bg-[#151515] border border-gray-800 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
      <Link href={`/story/${story.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          {story.heroImage && (
            <Image
              src={story.heroImage}
              alt={story.headline}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/10 to-transparent" />
        </div>
        <div className="p-4 sm:p-5">
          <StoryBadge category={story.category} />
          <h2 className="mt-2 text-base sm:text-lg font-bold text-white leading-snug group-hover:text-amber-400 transition-colors duration-200">
            {story.headline}
          </h2>
          <p className="mt-1.5 text-sm text-gray-400 line-clamp-2">
            {story.summary}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <StoryMetadata
              evidenceScore={story.evidenceScore}
              readingTime={story.readingTime}
              publishedAt={story.publishedAt}
            />
            <span className="text-sm font-medium text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Read &rarr;
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
