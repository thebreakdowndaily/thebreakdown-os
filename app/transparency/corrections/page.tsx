import type { Metadata } from 'next';
import Link from 'next/link';
import { listPublishedCorrections } from '@/services/editorial/corrections-service';

export const metadata: Metadata = {
  title: 'Corrections & Errata Ledger — The Breakdown',
  description:
    'Institutional record of all factual corrections, clarifications, and source amendments across The Breakdown Knowledge Platform, governed by Editorial Constitution Article XIII.',
  alternates: {
    canonical: 'https://thebreakdown.in/transparency/corrections',
  },
  openGraph: {
    title: 'Corrections & Errata Ledger — The Breakdown',
    description:
      'Institutional record of all factual corrections, clarifications, and source amendments across The Breakdown.',
    url: 'https://thebreakdown.in/transparency/corrections',
    type: 'website',
  },
};

export const revalidate = 3600; // 1 hour ISR

export default async function CorrectionsPage() {
  const corrections = await listPublishedCorrections();

  return (
    <main className="min-h-screen bg-surface-primary text-text-primary">
      {/* Header */}
      <section className="border-b border-border bg-surface-secondary/40 py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold uppercase tracking-wider mb-4">
            Editorial Constitution Article XIII
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-text-primary">
            Corrections & Errata Ledger
          </h1>
          <p className="mt-4 text-base md:text-lg text-text-muted leading-relaxed max-w-3xl">
            The Breakdown operates on institutional transparency. We do not stealth-edit stories.
            Every factual correction, misattributed source, or substantive clarification is permanently
            projected here and flagged on the original story.
          </p>
        </div>
      </section>

      {/* Main Ledger Content */}
      <section className="py-12 px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Corrections Policy Box */}
        <div className="p-6 rounded-xl border border-border bg-surface-secondary mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Institutional Corrections Policy
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Our verification desk reviews every reader submission and internal post-publication audit.
            If a challenge establishes that published data, wording, or attribution was inaccurate, an append-only
            record is committed to this ledger and displayed at the top of the relevant story. Readers can
            submit factual challenges using the &ldquo;Report Error&rdquo; button on any story or claim card.
          </p>
        </div>

        {/* Ledger List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-serif font-bold text-text-primary">
              Published Corrections ({corrections.length})
            </h2>
            <span className="text-xs text-text-muted font-mono">Immutable Public Projection</span>
          </div>

          {corrections.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-xl">
              <svg className="w-8 h-8 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-text-primary">Zero Unresolved Errata</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                All currently published knowledge objects have passed the Gold Standard Review with zero open factual challenges.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {corrections.map((item) => (
                <article
                  key={item.id}
                  className="p-5 rounded-xl border border-border bg-surface hover:border-text-muted transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30">
                      {item.category}
                    </span>
                    <time dateTime={item.createdAt} className="text-text-muted">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  <p className="text-sm text-text-primary leading-relaxed font-medium">
                    {item.explanation}
                  </p>

                  {item.previousWording && (
                    <div className="text-xs text-text-muted bg-surface-secondary p-3 rounded-lg border border-border space-y-1">
                      <div>
                        <span className="font-semibold text-red-400">Previous wording:</span>{' '}
                        <span className="line-through">{item.previousWording}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-400">Corrected wording:</span>{' '}
                        <span className="text-text-primary">{item.correctedWording}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-xs flex items-center justify-between">
                    <Link
                      href={`/story/${item.storySlug || item.storyId}`}
                      className="text-brand-500 hover:text-brand-400 font-medium inline-flex items-center gap-1"
                    >
                      View Corrected Story &rarr;
                    </Link>
                    <span className="text-[10px] text-text-muted font-mono">ID: {item.id.slice(0, 8)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
