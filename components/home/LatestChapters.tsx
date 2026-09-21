/**
 * LatestChapters — Knowledge Library Section
 * Governance: docs/rxs/screens/homepage.md · AGENTS.md Platform Beta
 *
 * Earth-inspired design: archival, intellectual, permanent.
 * Asymmetric layout: large published chapter card (2/3) + upcoming
 * chapters column (1/3). NOT a uniform three-column card grid.
 *
 * Visual character — the Library should feel permanent:
 *   - Larger whitespace
 *   - Chapter numerals as visual anchors
 *   - Understated editorial typography
 *   - Ochre accent for published state only
 *   - Status pills for upcoming chapters (muted mineral)
 */

import Link from 'next/link';
import type { TrustMetrics } from '@/lib/knowledge/trust-metrics';

// Canonical founding chapter path
const FOUNDING_CHAPTER = {
  href:    '/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance',
  number:  '01',
  collection: 'India & The World · Vol. I',
  volume:  'Foundations 1947–1962',
  title:   "India's Inheritance",
  subtitle:
    'Partition left India with disputed borders, a shattered economy, 562 princely states, and a foreign policy philosophy it would spend fifteen years trying to define.',
  readingTime: 47,
  evidenceGrade: 'A',
};

// Editorial publishing commitment
const PUBLISHING_CADENCE = 'Monthly flagship chapters · Next drop September 2026';

const UPCOMING_CHAPTERS = [
  {
    id:         'strategic-inheritance',
    number:     '02',
    title:      "India's Strategic Inheritance",
    subtitle:   'What the departing British left behind — and what Nehru chose to keep.',
    collection: 'Foundations 1947–1962',
    status:     'In Research',
    statusType: 'research' as const,
  },
  {
    id:         'nehruvian-worldview',
    number:     '03',
    title:      "Nehru's Worldview",
    subtitle:   'The philosophical foundations of Non-Alignment — Fabian socialism, Cambridge idealism, anti-imperialism.',
    collection: 'Foundations 1947–1962',
    status:     'Planned',
    statusType: 'planned' as const,
  },
  {
    id:         'integration-princely',
    number:     '04',
    title:      'Integration of Princely States',
    subtitle:   '562 kingdoms, one nation. How Patel accomplished in months what seemed impossible for decades.',
    collection: 'Foundations 1947–1962',
    status:     'Planned',
    statusType: 'planned' as const,
  },
];

const statusStyles = {
  research: {
    bg:     'var(--color-evidence-partial)',
    border: 'var(--color-evidence-partial-border)',
    text:   'var(--color-evidence-partial-text)',
  },
  planned: {
    bg:     'var(--color-bg-tertiary)',
    border: 'var(--color-border-default)',
    text:   'var(--color-earth-dust)',
  },
};

interface LatestChaptersProps {
  trustMetrics?: TrustMetrics | null;
}

export default function LatestChapters({ trustMetrics }: LatestChaptersProps = {}) {
  const claims  = trustMetrics?.chapterOneClaims  ?? '--';
  const sources = trustMetrics?.chapterOneSources ?? '--';

  return (
    <section
      aria-labelledby="chapters-heading"
      className="border-b py-14 lg:py-20"
      style={{ borderColor: 'var(--color-border-default)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div
                className="h-px w-10 shrink-0"
                style={{ backgroundColor: 'var(--color-earth-ochre)', opacity: 0.5 }}
                aria-hidden="true"
              />
              <h2
                id="chapters-heading"
                className="text-[11px] font-mono uppercase tracking-[0.22em]"
                style={{ color: 'var(--color-earth-ochre)' }}
              >
                Knowledge Library
              </h2>
            </div>
            <p
              className="text-xs font-mono ml-14"
              style={{ color: 'var(--color-earth-dust)' }}
            >
              {PUBLISHING_CADENCE}
            </p>
          </div>
          <Link
            href="/series"
            className="text-[10px] font-mono uppercase tracking-[0.14em] transition-colors duration-150"
            style={{ color: 'var(--color-earth-dust)' }}
          >
            Browse all →
          </Link>
        </div>

        {/* Asymmetric layout: 2fr + 1fr */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* ── Published chapter — feature card ── */}
          <Link
            href={FOUNDING_CHAPTER.href}
            className="group relative flex flex-col overflow-hidden rounded transition-colors duration-150"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-default)',
              textDecoration: 'none',
            }}
            id="chapter-card-indias-inheritance"
          >
            {/* Ochre gradient top line */}
            <div
              className="h-px shrink-0"
              style={{ background: 'linear-gradient(90deg, var(--color-earth-ochre) 0%, var(--color-earth-clay) 50%, transparent 100%)' }}
              aria-hidden="true"
            />

            <div className="flex flex-col gap-6 p-8 lg:p-10 flex-1">
              {/* Chapter number — large archival anchor */}
              <div className="flex items-start gap-6">
                <span
                  className="text-6xl font-bold leading-none tracking-tight shrink-0 select-none"
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    color: 'var(--color-border-hover)',
                    lineHeight: '0.8',
                  }}
                  aria-hidden="true"
                >
                  {FOUNDING_CHAPTER.number}
                </span>
                <div className="flex flex-col gap-1 pt-1">
                  <span
                    className="text-[10px] font-mono uppercase tracking-[0.2em]"
                    style={{ color: 'var(--color-earth-ochre)' }}
                  >
                    Published
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {FOUNDING_CHAPTER.collection}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h3
                  className="text-2xl sm:text-3xl font-bold leading-tight transition-colors duration-150 group-hover:text-[var(--color-brand-400)]"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: 'var(--color-text-primary)' }}
                >
                  {FOUNDING_CHAPTER.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-reading), Georgia, serif',
                    maxWidth: '55ch',
                  }}
                >
                  {FOUNDING_CHAPTER.subtitle}
                </p>
              </div>

              {/* Evidence stats */}
              <div
                className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-mono"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <span>{claims} verified claims</span>
                <span aria-hidden="true">·</span>
                <span>{sources} primary sources</span>
                <span aria-hidden="true">·</span>
                <span>{FOUNDING_CHAPTER.readingTime} min</span>
                <span aria-hidden="true">·</span>
                <span style={{ color: 'var(--color-earth-ochre)' }}>Grade {FOUNDING_CHAPTER.evidenceGrade}</span>
              </div>

              {/* CTA */}
              <div className="mt-auto">
                <span
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-150"
                  style={{ color: 'var(--color-earth-ochre)' }}
                >
                  Read Chapter
                  <span className="transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </Link>

          {/* ── Upcoming chapters — stacked ── */}
          <div className="flex flex-col gap-3">
            {UPCOMING_CHAPTERS.map((chapter) => {
              const style = statusStyles[chapter.statusType];
              return (
                <div
                  key={chapter.id}
                  className="flex flex-col gap-3 p-5 rounded flex-1"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  {/* Number + status */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-2xl font-bold leading-none"
                      style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        color: 'var(--color-border-hover)',
                      }}
                      aria-hidden="true"
                    >
                      {chapter.number}
                    </span>
                    <span
                      className="text-[10px] font-mono uppercase tracking-[0.14em] px-2 py-1 rounded"
                      style={{
                        backgroundColor: style.bg,
                        border:          `1px solid ${style.border}`,
                        color:           style.text,
                      }}
                    >
                      {chapter.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-sm font-semibold leading-snug"
                    style={{
                      fontFamily: 'var(--font-playfair), Georgia, serif',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {chapter.title}
                  </h3>

                  {/* Subtitle */}
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {chapter.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
