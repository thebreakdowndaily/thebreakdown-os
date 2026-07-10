'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { APIStory } from '@/utils/data-layer/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StoryMetadata from './StoryMetadata';
import Skeleton from '@/components/ui/Skeleton';

interface FeaturedStoriesProps {
  stories: APIStory[];
}

export default function FeaturedStories({ stories }: FeaturedStoriesProps) {
  const featured = stories.slice(0, 4);
  if (featured.length === 0) {
    return (
      <section className="py-16 sm:py-20" aria-labelledby="featured-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-10 sm:mb-12">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-[#D4A843] bg-[#D4A843]/10 rounded-full mb-2">Editorial</span>
              <h2 id="featured-heading" className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">Featured Analysis</h2>
            </div>
          </div>
          <p className="text-[#A1A1AA] text-center py-12">No featured stories yet.</p>
        </div>
      </section>
    );
  }

  const [hero, ...side] = featured;

  return (
    <section className="py-16 sm:py-20" aria-labelledby="featured-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-[#D4A843] bg-[#D4A843]/10 rounded-full mb-2">Editorial</span>
            <h2 id="featured-heading" className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">Featured Analysis</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <article className="md:col-span-1 lg:row-span-2 group">
            <Link href={`/story/${hero.slug}`} className="block h-full" aria-label={`Read: ${hero.headline}`}>
              <Card className="relative h-full overflow-hidden" accent="gold">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[320px] lg:min-h-[420px] overflow-hidden">
                  <Image
                    src={hero.heroImage || '/images/og-default.jpg'}
                    alt={hero.headline}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="category">{hero.category}</Badge>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F5F5F5] leading-tight group-hover:text-[#D4A843] transition-colors duration-200">
                    {hero.headline}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-[#A1A1AA] line-clamp-3 max-w-prose">
                    {hero.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <StoryMetadata
                      evidenceScore={hero.evidenceScore}
                      readingTime={hero.readingTime}
                      publishedAt={hero.publishedAt}
                    />
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D4A843] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Read
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </article>

          <div className="flex flex-col gap-4 sm:gap-6">
            {side.map((story, index) => (
              <article key={story.id} className="group">
                <Link href={`/story/${story.slug}`} className="block" aria-label={`Read: ${story.headline}`}>
                  <Card className="relative overflow-hidden" accent="gold">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={story.heroImage || '/images/og-default.jpg'}
                        alt={story.headline}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <Badge variant="category">{story.category}</Badge>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5] leading-snug group-hover:text-[#D4A843] transition-colors duration-200">
                        {story.headline}
                      </h3>
                      <p className="mt-1.5 text-sm text-[#A1A1AA] line-clamp-2">
                        {story.summary}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <StoryMetadata
                          evidenceScore={story.evidenceScore}
                          readingTime={story.readingTime}
                          publishedAt={story.publishedAt}
                        />
                        <span className="text-sm font-medium text-[#D4A843] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Read
                          <svg className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedStoriesSkeleton() {
  return (
    <section className="py-16 sm:py-20" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-10 sm:mb-12">
          <div className="h-6 w-40 bg-[#151515] rounded animate-pulse" />
          <div className="h-10 w-48 bg-[#151515] rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="md:col-span-1 lg:row-span-2">
            <Skeleton className="aspect-[4/3] lg:aspect-auto lg:h-[420px] min-h-[320px] rounded-xl" />
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            <Skeleton className="aspect-[16/9] rounded-xl" />
            <Skeleton className="aspect-[16/9] rounded-xl" />
            <Skeleton className="aspect-[16/9] rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}