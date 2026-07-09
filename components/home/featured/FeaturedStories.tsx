'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { APIStory } from '@/utils/data-layer/types';
import StoryMetadata from './StoryMetadata';
import Skeleton from '@/components/ui/Skeleton';

interface FeaturedStoriesProps {
  stories: APIStory[];
}

function EmptyState() {
  return (
    <section className="py-20 sm:py-24" aria-labelledby="featured-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />
        <p className="text-neutral-500 text-center py-16 text-sm">No featured stories yet.</p>
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="mb-10 sm:mb-12">
      <span className="section-label">Editorial</span>
      <h2
        id="featured-heading"
        className="mt-3 text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight"
        style={{ fontFamily: 'var(--font-editorial)', letterSpacing: '-0.02em' }}
      >
        Featured Analysis
      </h2>
    </div>
  );
}

interface HeroCardProps {
  story: APIStory;
}

function HeroCard({ story }: HeroCardProps) {
  return (
    <article className="group">
      <Link
        href={`/story/${story.slug}`}
        className="block h-full"
        aria-label={`Read: ${story.headline}`}
      >
        <div className="relative h-full overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-900 min-h-[380px] lg:min-h-[480px]">
          {story.heroImage && (
            <Image
              src={story.heroImage}
              alt={story.headline}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              priority
            />
          )}
          {/* Gradient only in bottom third */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" aria-hidden="true" />

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase text-amber-400 bg-neutral-950/70 backdrop-blur-sm border border-amber-400/20 rounded-full">
              {story.category}
            </span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <h3
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight group-hover:text-amber-300 transition-colors duration-200"
              style={{ fontFamily: 'var(--font-editorial)', letterSpacing: '-0.02em' }}
            >
              {story.headline}
            </h3>
            <p className="mt-2 text-sm text-neutral-400 line-clamp-2 max-w-prose">
              {story.summary}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <StoryMetadata
                evidenceScore={story.evidenceScore}
                readingTime={story.readingTime}
                publishedAt={story.publishedAt}
              />
              <span
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-hidden="true"
              >
                Read
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

interface SideCardProps {
  story: APIStory;
}

function SideCard({ story }: SideCardProps) {
  return (
    <article className="group">
      <Link
        href={`/story/${story.slug}`}
        className="flex gap-4 items-start p-4 rounded-xl border border-neutral-800/40 bg-neutral-900/30 hover:bg-neutral-800/40 hover:border-neutral-700/60 transition-all duration-200"
        aria-label={`Read: ${story.headline}`}
      >
        {/* Thumbnail */}
        {story.heroImage && (
          <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden">
            <Image
              src={story.heroImage}
              alt={story.headline}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          </div>
        )}
        {/* Text */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-amber-400/70">
            {story.category}
          </span>
          <h3 className="text-sm font-semibold text-neutral-100 leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {story.headline}
          </h3>
          <StoryMetadata
            evidenceScore={story.evidenceScore}
            readingTime={story.readingTime}
            publishedAt={story.publishedAt}
          />
        </div>
      </Link>
    </article>
  );
}

export default function FeaturedStories({ stories }: FeaturedStoriesProps) {
  const featured = stories.slice(0, 4);
  if (featured.length === 0) return <EmptyState />;

  const [hero, ...side] = featured;

  return (
    <section className="py-20 sm:py-24" aria-labelledby="featured-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
          {/* Hero card — left column */}
          <HeroCard story={hero} />

          {/* Side cards — right column: compact list layout */}
          <div className="flex flex-col gap-3">
            {side.map((story) => (
              <SideCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedStoriesSkeleton() {
  return (
    <section className="py-20 sm:py-24" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-3">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-10 w-56 rounded-lg" />
        </div>
        <div className="grid lg:grid-cols-[3fr_2fr] gap-6">
          <Skeleton className="min-h-[480px] rounded-2xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}