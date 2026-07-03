import Link from 'next/link';
import Image from 'next/image';
import type { RelatedStory } from '@/utils/types';

interface HomeHeroProps {
  story: RelatedStory;
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    economy: 'Economy',
    policy: 'Policy',
    technology: 'Technology',
    environment: 'Environment',
    education: 'Education',
    diplomacy: 'Diplomacy',
    investigation: 'Investigation',
    solutions: 'Solutions',
    geopolitics: 'Geopolitics',
  };
  return labels[category] || category;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function HomeHero({ story }: HomeHeroProps) {
  return (
    <section className="relative w-full min-h-[80vh] flex items-center bg-[#0A0A0A] overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column — editorial */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Breaking
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              {story.headline}
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-xl leading-relaxed">
              {story.summary}
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Evidence</span>
                <span className="text-lg font-bold text-amber-500">{story.evidenceScore}%</span>
              </div>
              <div className="w-px h-5 bg-gray-700" />
              <span className="text-sm text-gray-400">{story.readingTime} min read</span>
              <div className="w-px h-5 bg-gray-700" />
              <span className="text-sm text-gray-500">{formatDate(story.publishedAt)}</span>
            </div>

            <Link
              href={`/story/${story.slug}`}
              className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-all duration-200 group text-sm"
            >
              Read Breakdown
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right column — visual */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
              {story.heroImage && (
                <Image
                  src={story.heroImage}
                  alt={story.headline}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
            </div>

            {/* Overlay card */}
            <div className="absolute -bottom-4 -left-4 right-4 lg:-bottom-6 lg:-left-6 lg:right-6 bg-[#0A0A0A]/90 backdrop-blur-xl border border-gray-800 rounded-xl p-4 lg:p-5 shadow-2xl">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {categoryLabel(story.category)}
                </span>
                <span className="text-xs text-gray-400">{story.readingTime} min</span>
                <span className="text-xs text-amber-400 font-semibold">{story.evidenceScore}%</span>
                <span className="text-xs text-gray-500 ml-auto">{formatDate(story.publishedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle gradient edge */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
    </section>
  );
}
