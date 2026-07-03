import Link from 'next/link';
import Image from 'next/image';
import type { RelatedStory } from '@/utils/types';

interface FeaturedStoryCardProps {
  story: RelatedStory;
  size: 'large' | 'small';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    economy: 'Economy', policy: 'Policy', technology: 'Tech',
    environment: 'Environment', education: 'Education',
    diplomacy: 'Diplomacy', investigation: 'Investigation',
    solutions: 'Solutions', geopolitics: 'Geopolitics',
  };
  return labels[category] || category;
}

function FeaturedStoryCard({ story, size }: FeaturedStoryCardProps) {
  return (
    <Link
      href={`/story/${story.slug}`}
      className={`group relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/30 transition-all duration-300 ${
        size === 'large' ? 'row-span-2' : ''
      }`}
    >
      <div className={`relative ${size === 'large' ? 'aspect-[4/3]' : 'aspect-[16/9]'}`}>
        {story.heroImage && (
          <Image
            src={story.heroImage}
            alt={story.headline}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
      </div>
      <div className={`absolute bottom-0 left-0 right-0 p-4 sm:p-5 ${size === 'large' ? 'sm:p-6' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {categoryLabel(story.category)}
          </span>
          <span className="text-xs text-gray-400">{story.readingTime} min</span>
        </div>
        <h3 className={`font-bold text-white leading-tight group-hover:text-amber-400 transition-colors duration-200 ${
          size === 'large' ? 'text-xl sm:text-2xl' : 'text-sm sm:text-base'
        }`}>
          {story.headline}
        </h3>
        {size === 'large' && (
          <p className="mt-2 text-sm text-gray-400 line-clamp-2">{story.summary}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-amber-400 font-semibold">{story.evidenceScore}%</span>
          <span className="text-xs text-gray-500">{formatDate(story.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

interface FeaturedStoriesProps {
  primary: RelatedStory;
  secondary: RelatedStory[];
}

export default function FeaturedStories({ primary, secondary }: FeaturedStoriesProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-6 bg-amber-500 rounded-full" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Featured Stories</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Large card */}
        <FeaturedStoryCard story={primary} size="large" />

        {/* Small cards stacked */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {secondary.slice(0, 2).map((story) => (
            <FeaturedStoryCard key={story.slug} story={story} size="small" />
          ))}
        </div>
      </div>
    </section>
  );
}
