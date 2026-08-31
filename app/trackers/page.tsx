import { Metadata } from 'next';
import Link from 'next/link';
import { getAllTrackers } from '@/lib/trackers/registry';

export const metadata: Metadata = {
  title: 'Policy & Issue Trackers | The Breakdown',
  description:
    'Living, evidence-backed policy and issue trackers monitoring major Indian legislative overhauls, industrial investments, and welfare schemes.',
  openGraph: {
    title: 'Policy & Issue Trackers | The Breakdown',
    description:
      'Living, evidence-backed policy and issue trackers monitoring major Indian legislative overhauls, industrial investments, and welfare schemes.',
    type: 'website',
  },
};

export default function TrackersIndexPage() {
  const trackers = getAllTrackers();

  return (
    <main className="min-h-screen bg-surface-canvas text-neutral-100 px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'The Breakdown Policy & Issue Trackers',
            description: 'Living, evidence-backed issue trackers monitoring Indian public policy and industry.',
            publisher: { '@type': 'Organization', name: 'The Breakdown' },
          }),
        }}
      />

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <header className="space-y-4 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Knowledge Operating System
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              Live Trackers
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Policy &amp; Issue Trackers
          </h1>
          <p className="text-base text-neutral-300 max-w-3xl leading-relaxed font-serif">
            Living knowledge systems with continuous provenance tracking. Each tracker maps statutory statuses, verified empirical data, legislative timelines, and primary official documents without editorial noise.
          </p>
        </header>

        {/* Tracker Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trackers.map((t) => (
            <article
              key={t.id}
              className="bg-neutral-900/60 border border-neutral-800/80 hover:border-emerald-500/40 rounded-2xl p-6 space-y-5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                    {t.topic}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Updated: {t.lastUpdated}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white leading-snug">
                  <Link href={`/trackers/${t.slug}`} className="hover:text-emerald-300 transition-colors">
                    {t.title}
                  </Link>
                </h2>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {t.subtitle}
                </p>

                {/* Status snippet */}
                <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                    Status:
                  </span>
                  <p className="line-clamp-2 text-neutral-200">{t.currentStatus}</p>
                </div>
              </div>

              {/* Data points preview */}
              <div className="space-y-3 pt-3 border-t border-neutral-800/60">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {t.keyDataPoints.slice(0, 2).map((dp, i) => (
                    <div key={i} className="p-2 rounded bg-neutral-950/40 border border-neutral-800/40">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block truncate">{dp.label}</span>
                      <strong className="text-sm font-mono text-emerald-300 truncate block">{dp.value}</strong>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/trackers/${t.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono font-bold transition-colors"
                >
                  Explore Tracker &amp; Evidence Chain →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
