/**
 * The Short Version Briefing Grid — Release 1
 * Governance: docs/rxs/screens/homepage.md & Editorial Constitution v1.1
 *
 * Concise briefing section giving readers immediate context on 3–5 key stories.
 */

import Link from 'next/link';
import type { HomepageBriefing } from '@/features/home/view-model';

interface ShortVersionGridProps {
  briefings: HomepageBriefing[];
}

export default function ShortVersionGrid({ briefings }: ShortVersionGridProps) {
  if (!briefings || briefings.length === 0) return null;

  return (
    <section
      aria-labelledby="short-version-heading"
      className="py-12 bg-neutral-950 border-b border-neutral-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-neutral-800 gap-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
              THE SHORT VERSION
            </span>
            <h2 id="short-version-heading" className="text-2xl sm:text-3xl font-serif text-white">
              What You Need to Understand Today
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-mono">
            Direct briefing · Concise context
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {briefings.map((item, index) => (
            <article
              key={item.slug}
              className="flex flex-col justify-between p-5 rounded-lg bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-colors group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span className="uppercase tracking-wider text-emerald-400 font-medium">
                    0{index + 1} · {item.category}
                  </span>
                  <span>{item.readingTime} min</span>
                </div>

                <h3 className="text-lg font-bold font-serif leading-snug text-white group-hover:text-emerald-300 transition-colors">
                  <Link
                    href={`/story/${item.slug}`}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
                  >
                    {item.headline}
                  </Link>
                </h3>

                <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                {item.trustSignals[0] && (
                  <span className="text-[11px] font-mono text-neutral-400">
                    ✓ {item.trustSignals[0].label}
                  </span>
                )}
                <Link
                  href={`/story/${item.slug}`}
                  className="font-medium text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
                  aria-label={`Understand ${item.headline}`}
                >
                  Understand →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
