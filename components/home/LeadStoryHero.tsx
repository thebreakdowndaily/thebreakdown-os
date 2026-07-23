/**
 * Lead Story Hero Component — Release 1
 * Governance: docs/rxs/screens/homepage.md & Editorial Constitution v1.1
 *
 * Primary editorial focus component occupying ~60-70% of first-viewport attention.
 * Communicates clarity, authority, and evidence-backed depth without generic CTAs.
 */

import Link from 'next/link';
import type { HomepageLeadStory } from '@/features/home/view-model';

interface LeadStoryHeroProps {
  story: HomepageLeadStory | null;
}

export default function LeadStoryHero({ story }: LeadStoryHeroProps) {
  if (!story) return null;

  return (
    <section
      aria-labelledby="lead-story-heading"
      className="relative overflow-hidden bg-neutral-950 border-b border-neutral-800 text-white py-12 lg:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Editorial Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/60 rounded">
                {story.category} · Explainer
              </span>

              {/* Trust Signals */}
              {story.trustSignals.map((signal) => (
                <span
                  key={signal.id}
                  className="text-[11px] font-mono tracking-wide px-2.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300"
                >
                  ✓ {signal.label}
                </span>
              ))}
            </div>

            <h1
              id="lead-story-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-[1.15] tracking-tight"
            >
              <Link
                href={`/story/${story.slug}`}
                className="hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
              >
                {story.headline}
              </Link>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-300 font-sans leading-relaxed line-clamp-3">
              {story.dek}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 pt-2 border-t border-neutral-800/80">
              <span>By {story.byline}</span>
              <span>•</span>
              <span>Updated {story.updatedAt}</span>
              <span>•</span>
              <span>{story.readingTime} min read</span>
            </div>

            <div className="pt-4">
              <Link
                href={`/story/${story.slug}`}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-6 py-3 rounded-lg text-sm transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                {story.actionText}
              </Link>
            </div>
          </div>

          {/* Hero Visual Column (5 cols) */}
          <div className="lg:col-span-5">
            <Link
              href={`/story/${story.slug}`}
              className="block group relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              tabIndex={-1}
              aria-hidden="true"
            >
              {story.heroImage ? (
                <img
                  src={story.heroImage}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-600">
                  <span className="font-serif text-2xl font-bold tracking-wider text-neutral-700">
                    THE BREAKDOWN
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent pointer-events-none" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
