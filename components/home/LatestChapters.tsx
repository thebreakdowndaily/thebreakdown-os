/**
 * LatestChapters — Knowledge Library Grid
 * Governance: docs/rxs/screens/homepage.md · RC-1
 *
 * Surfaces the Knowledge Library (series/chapters) on the homepage.
 * Falls back to the founding chapter card when no series data is available.
 * Server Component. Static data at build time.
 */

import Link from 'next/link';
import type { TrustMetrics } from '@/lib/knowledge/trust-metrics';

// Static founding chapter — used until CMS data populates from buildHomepage()
const FOUNDING_CHAPTER = {
  href: '/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance',
  collection: 'India & The World · Vol. I',
  volume: 'Foundations 1947–1962',
  title: "India's Inheritance",
  subtitle:
    'Partition left India with disputed borders, a shattered economy, 562 princely states, and a foreign policy philosophy it would spend fifteen years defining.',
  readingTime: 47,
  evidenceGrade: 'A',
  status: 'Internal Gold Candidate',
};

// Publishing cadence — RC-1 review item 4 (Product & Publishing Review Board, 1 Aug 2026).
// Editorial commitment: monthly flagship chapters. Next-drop date requires Editor-in-Chief sign-off before launch.
const PUBLISHING_CADENCE = 'New chapter published monthly · Next drop Sept 1, 2026';

// Upcoming chapters — signals editorial intent and builds anticipation
const UPCOMING_CHAPTERS = [
  {
    id: 'strategic-inheritance',
    title: "India's Strategic Inheritance",
    subtitle: 'What the departing British left behind — and what Nehru chose to keep.',
    collection: 'Foundations 1947–1962',
    status: 'In Research',
  },
  {
    id: 'nehruvian-worldview',
    title: "Nehru's Worldview",
    subtitle:
      'The philosophical foundations of Non-Alignment — Fabian socialism, Cambridge idealism, and anti-imperialism.',
    collection: 'Foundations 1947–1962',
    status: 'Planned',
  },
  {
    id: 'integration-princely',
    title: 'Integration of Princely States',
    subtitle: '562 kingdoms, one nation. How Patel accomplished in months what seemed impossible for decades.',
    collection: 'Foundations 1947–1962',
    status: 'Planned',
  },
];

interface LatestChaptersProps {
  trustMetrics?: TrustMetrics | null;
}

export default function LatestChapters({ trustMetrics }: LatestChaptersProps = {}) {
  const claims = trustMetrics?.chapterOneClaims ?? '--';
  const sources = trustMetrics?.chapterOneSources ?? '--';

  return (
    <section
      aria-labelledby="chapters-heading"
      className="border-b border-[#1A1A1A] py-16 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-4">
              <div className="h-px w-12" style={{ backgroundColor: '#C9A84C', opacity: 0.5 }} aria-hidden="true" />
              <h2
                id="chapters-heading"
                className="text-xs font-mono uppercase tracking-[0.2em]"
                style={{ color: '#C9A84C' }}
              >
                Knowledge Library
              </h2>
            </div>
            <p className="mt-2 text-[11px] font-mono tracking-wide" style={{ color: '#9A9A9A' }}>
              {PUBLISHING_CADENCE}
            </p>
          </div>
          <Link
            href="/series"
            className="text-xs font-mono uppercase tracking-wider transition-colors duration-150"
            style={{ color: '#A1A1AA' }}
          >
            Browse All →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Published chapter — large card ── */}
          <Link
            href={FOUNDING_CHAPTER.href}
            className="group relative col-span-1 lg:col-span-2 rounded border overflow-hidden flex flex-col transition-colors duration-150"
            style={{ backgroundColor: '#111111', borderColor: '#1A1A1A' }}
            id="chapter-card-indias-inheritance"
          >
            {/* Gold top line */}
            <div
              className="h-px flex-shrink-0"
              style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }}
              aria-hidden="true"
            />

            <div className="flex flex-col gap-6 p-8 flex-1">
              {/* Collection breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#C9A84C' }}>
                  Published
                </span>
                <span style={{ color: '#2A2A2A' }} aria-hidden="true">·</span>
                <span className="text-xs font-mono" style={{ color: '#A1A1AA' }}>
                  {FOUNDING_CHAPTER.collection}
                </span>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h3
                  className="text-2xl sm:text-3xl font-bold leading-tight text-white group-hover:text-[#C9A84C] transition-colors duration-150"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                >
                  {FOUNDING_CHAPTER.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA', maxWidth: '55ch' }}>
                  {FOUNDING_CHAPTER.subtitle}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-mono" style={{ color: '#A1A1AA' }}>
                <span>{claims} verified claims</span>
                <span aria-hidden="true">·</span>
                <span>{sources} primary sources</span>
                <span aria-hidden="true">·</span>
                <span>{FOUNDING_CHAPTER.readingTime} min</span>
                <span aria-hidden="true">·</span>
                <span>Grade {FOUNDING_CHAPTER.evidenceGrade}</span>
              </div>

              {/* Read CTA */}
              <div className="mt-auto">
                <span
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-150"
                  style={{ color: '#C9A84C' }}
                >
                  Read Chapter
                  <span
                    className="transition-transform duration-150 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </span>
              </div>
            </div>
          </Link>

          {/* ── Upcoming chapters — stacked ── */}
          <div className="flex flex-col gap-4">
            {UPCOMING_CHAPTERS.map((chapter) => (
              <div
                key={chapter.id}
                className="rounded border flex flex-col gap-3 p-5 flex-1"
                style={{ backgroundColor: '#0D0D0D', borderColor: '#1A1A1A' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: '#1A1A1A',
                      color: '#A1A1AA',
                      border: '1px solid #222',
                    }}
                  >
                    {chapter.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                  {chapter.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#A1A1AA' }}>
                  {chapter.subtitle}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
