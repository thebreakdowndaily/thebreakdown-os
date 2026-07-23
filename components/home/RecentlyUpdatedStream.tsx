/**
 * Recently Updated Stories Component — Release 1
 * Governance: docs/rxs/screens/homepage.md & Editorial Constitution v1.1
 *
 * Accountability-oriented update stream for verified public stories.
 */

import Link from 'next/link';
import type { HomepageUpdate } from '@/features/home/view-model';

interface RecentlyUpdatedStreamProps {
  updates: HomepageUpdate[];
}

export default function RecentlyUpdatedStream({ updates }: RecentlyUpdatedStreamProps) {
  if (!updates || updates.length === 0) return null;

  return (
    <section
      aria-labelledby="recent-updates-heading"
      className="py-16 bg-neutral-950 border-b border-neutral-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-neutral-800 gap-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
              ACCOUNTABILITY STREAM
            </span>
            <h2 id="recent-updates-heading" className="text-2xl sm:text-3xl font-serif text-white">
              Recently Updated Stories
            </h2>
          </div>
          <Link
            href="/stories"
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
          >
            View all stories →
          </Link>
        </div>

        <div className="divide-y divide-neutral-800/80">
          {updates.map((item) => (
            <article
              key={item.slug}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start sm:items-center gap-4">
                <span className="text-xs font-mono text-neutral-400 shrink-0 min-w-[70px]">
                  {item.dateStr}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-medium">
                      {item.category}
                    </span>
                    <span className="text-neutral-600 text-xs">•</span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {item.readingTime} min read
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-emerald-300 transition-colors">
                    <Link
                      href={`/story/${item.slug}`}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
                    >
                      {item.headline}
                    </Link>
                  </h3>
                </div>
              </div>

              <Link
                href={`/story/${item.slug}`}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 shrink-0 self-start sm:self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
              >
                Read story →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
