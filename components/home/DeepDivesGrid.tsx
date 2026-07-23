/**
 * Deep Dives Grid Component — Release 1
 * Governance: docs/rxs/screens/homepage.md & Editorial Constitution v1.1
 *
 * Long-form investigations and explainers section featuring high visual rhythm.
 */

import Link from 'next/link';
import type { HomepageDeepDive } from '@/features/home/view-model';

interface DeepDivesGridProps {
  deepDives: HomepageDeepDive[];
}

export default function DeepDivesGrid({ deepDives }: DeepDivesGridProps) {
  if (!deepDives || deepDives.length === 0) return null;

  return (
    <section
      aria-labelledby="deep-dives-heading"
      className="py-16 bg-neutral-950 border-b border-neutral-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-10 border-b border-neutral-800 gap-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
              DEEP DIVES
            </span>
            <h2 id="deep-dives-heading" className="text-2xl sm:text-3xl font-serif text-white">
              Investigations & Long-Form Analysis
            </h2>
          </div>
          <Link
            href="/investigations"
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
          >
            View all investigations →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deepDives.map((item) => (
            <article
              key={item.slug}
              className="flex flex-col rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden group hover:border-neutral-700 transition-colors"
            >
              <Link
                href={`/story/${item.slug}`}
                className="block aspect-[16/10] bg-neutral-950 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                tabIndex={-1}
                aria-hidden="true"
              >
                {item.heroImage ? (
                  <img
                    src={item.heroImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-600 font-serif text-lg font-bold">
                    INVESTIGATION
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-neutral-950/90 backdrop-blur border border-neutral-800 text-[10px] uppercase font-mono tracking-widest text-emerald-400 px-2.5 py-1 rounded">
                  {item.category}
                </div>
              </Link>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                    <span>{item.readingTime} min read</span>
                    {item.trustSignals[0] && (
                      <>
                        <span>•</span>
                        <span className="text-neutral-300">✓ {item.trustSignals[0].label}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-xl font-bold font-serif leading-snug text-white group-hover:text-emerald-300 transition-colors">
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

                <div className="pt-4 border-t border-neutral-800/60 flex items-center justify-between">
                  <Link
                    href={`/story/${item.slug}`}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
                  >
                    Read investigation →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
