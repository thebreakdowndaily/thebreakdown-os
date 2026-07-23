/**
 * Topic Taxonomy Section Component — Release 1
 * Governance: docs/rxs/screens/homepage.md & Editorial Constitution v1.1
 *
 * Clean taxonomy grid linking to top-level knowledge topics.
 */

import Link from 'next/link';
import type { HomepageTopic } from '@/features/home/view-model';

interface TopicTaxonomySectionProps {
  topics: HomepageTopic[];
}

export default function TopicTaxonomySection({ topics }: TopicTaxonomySectionProps) {
  if (!topics || topics.length === 0) return null;

  return (
    <section
      aria-labelledby="topics-section-heading"
      className="py-16 bg-neutral-900 border-b border-neutral-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-neutral-800 gap-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
              TAXONOMY
            </span>
            <h2 id="topics-section-heading" className="text-2xl sm:text-3xl font-serif text-white">
              Explore by Subject & Policy Area
            </h2>
          </div>
          <Link
            href="/topics"
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
          >
            All topic hubs →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topic/${topic.slug}`}
              className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-900 transition-all group flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-2">
                  Topic
                </span>
                <h3 className="text-base font-serif font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {topic.name}
                </h3>
                {topic.description && (
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1 font-sans">
                    {topic.description}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono text-neutral-500 group-hover:text-emerald-400">
                <span>Explore</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
