/**
 * HeroSection — Featured Chapter / Story Hero
 * Governance: docs/rxs/screens/homepage.md · AGENTS.md Platform Beta
 *
 * Earth-inspired editorial hero: Dark Discovery environment.
 * Full-width asymmetric composition: editorial text left, typographic
 * knowledge panel right. No generic data cards.
 *
 * Design intent:
 *   - Editorial first, evidence-aware second.
 *   - Display typography (Playfair) creates visual authority.
 *   - Ochre accent signals editorial importance.
 *   - Evidence signals are inline, not a separate dashboard.
 *   - Warm ivory text on deep charcoal = maximum editorial legibility.
 */

import Link from 'next/link';
import type { HomepageLeadStory } from '@/features/home/view-model';
import type { TrustMetrics } from '@/lib/knowledge/trust-metrics';

// Canonical path for the founding chapter (fallback when CMS has no lead story)
const FOUNDING_CHAPTER_PATH =
  '/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance';

const FOUNDING_CHAPTER_DEFAULTS = {
  headline:     "India's Inheritance",
  dek:          'Partition left India with disputed borders, a shattered economy, 562 princely states, and a foreign policy philosophy it would spend fifteen years trying to define. This is where the story begins.',
  category:     'FOUNDING CHAPTER',
  volume:       'VOLUME I · INDIA & THE WORLD',
  readingTime:  47,
  evidenceGrade: 'A',
  reviewStatus: 'Internal Gold Candidate',
};

interface HeroSectionProps {
  leadStory: HomepageLeadStory | null;
  trustMetrics?: TrustMetrics | null;
}

// ── Evidence signal strip ────────────────────────────────────────────────────

function EvidenceSignalStrip({
  claims,
  sources,
  readingTime,
  evidenceGrade,
}: {
  claims: number | string;
  sources: number | string;
  readingTime: number;
  evidenceGrade: string;
}) {
  const items = [
    { value: claims,       label: 'verified claims' },
    { value: sources,      label: 'primary sources' },
    { value: `${readingTime} min`, label: 'read' },
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono"
      style={{ color: 'var(--color-earth-dust)' }}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true" style={{ color: 'var(--color-border-hover)' }}>·</span>}
          <span style={{ color: 'var(--color-text-muted)' }}>{item.value}</span>
          <span>{item.label}</span>
        </span>
      ))}
      <span aria-hidden="true" style={{ color: 'var(--color-border-hover)' }}>·</span>
      <span>
        Evidence Grade{' '}
        <span style={{ color: 'var(--color-earth-ochre)', fontWeight: 600 }}>
          {evidenceGrade}
        </span>
      </span>
    </div>
  );
}

// ── Period timeline bar (founding chapter only) ──────────────────────────────

function PeriodBar() {
  return (
    <div className="space-y-2">
      <p
        className="text-[10px] font-mono uppercase tracking-[0.2em]"
        style={{ color: 'var(--color-earth-dust)' }}
      >
        Period Covered
      </p>
      <div
        className="relative h-px"
        style={{ backgroundColor: 'var(--color-border-default)' }}
      >
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, var(--color-earth-ochre), var(--color-earth-clay))',
          }}
          aria-hidden="true"
        />
      </div>
      <div
        className="flex justify-between text-[10px] font-mono"
        style={{ color: 'var(--color-earth-dust)' }}
      >
        <span>1947</span>
        <span>Independence · Partition · NAM</span>
        <span>1962</span>
      </div>
    </div>
  );
}

// ── Knowledge panel (right column) ──────────────────────────────────────────

function KnowledgePanel({
  claims,
  sources,
  readingTime,
  evidenceGrade,
  reviewStatus,
  isLeadStory,
  updatedAt,
  category,
}: {
  claims: number | string;
  sources: number | string;
  readingTime: number;
  evidenceGrade: string;
  reviewStatus: string;
  isLeadStory: boolean;
  updatedAt?: string;
  category: string;
}) {
  const stats = [
    { value: claims,                label: 'Verified Claims',   accent: true  },
    { value: sources,               label: 'Primary Sources',   accent: false },
    { value: `${readingTime}`,      label: 'Minutes to Read',   accent: false },
    { value: `Grade ${evidenceGrade}`, label: 'Evidence Rating', accent: true },
  ];

  return (
    <div
      className="relative flex flex-col gap-8 p-8 rounded"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
      }}
      aria-label="Knowledge metrics for this chapter"
    >
      {/* Left-edge ochre accent */}
      <div
        className="absolute top-0 left-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(180deg, var(--color-earth-ochre) 0%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div>
        <p
          className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1"
          style={{ color: 'var(--color-earth-ochre)' }}
        >
          Knowledge Metrics
        </p>
        <p
          className="text-xs font-mono"
          style={{ color: 'var(--color-earth-dust)' }}
        >
          {isLeadStory ? category.toUpperCase() : 'Foundations of Indian Foreign Policy · 1947–1962'}
        </p>
      </div>

      {/* Stats grid — 2×2 */}
      <div className="grid grid-cols-2 gap-5">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p
              className="text-3xl font-bold leading-none tracking-tight mb-1"
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                color: stat.accent
                  ? 'var(--color-earth-ochre)'
                  : 'var(--color-text-primary)',
              }}
            >
              {stat.value}
            </p>
            <p
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: 'var(--color-earth-dust)' }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Timeline bar (founding chapter) or update timestamp (lead story) */}
      {!isLeadStory ? (
        <PeriodBar />
      ) : updatedAt ? (
        <div>
          <p
            className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1"
            style={{ color: 'var(--color-earth-dust)' }}
          >
            Updated
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {updatedAt}
          </p>
        </div>
      ) : null}

      {/* Review status pill */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded text-xs font-mono"
        style={{
          backgroundColor: 'var(--color-evidence-verified)',
          border: '1px solid var(--color-evidence-verified-border)',
          color: 'var(--color-evidence-verified-text)',
        }}
      >
        <span aria-hidden="true">✓</span>
        <span>{reviewStatus}</span>
      </div>
    </div>
  );
}

// ── Hero root ────────────────────────────────────────────────────────────────

export default function HeroSection({ leadStory, trustMetrics }: HeroSectionProps) {
  const href         = leadStory?.slug ? `/story/${leadStory.slug}` : FOUNDING_CHAPTER_PATH;
  const headline     = leadStory?.headline     ?? FOUNDING_CHAPTER_DEFAULTS.headline;
  const dek          = leadStory?.dek          ?? FOUNDING_CHAPTER_DEFAULTS.dek;
  const category     = leadStory?.category     ?? FOUNDING_CHAPTER_DEFAULTS.category;
  const readingTime  = leadStory?.readingTime  ?? FOUNDING_CHAPTER_DEFAULTS.readingTime;
  const evidenceGrade = leadStory?.stats?.evidenceGrade ?? FOUNDING_CHAPTER_DEFAULTS.evidenceGrade;
  const reviewStatus = leadStory?.stats?.reviewStatus   ?? FOUNDING_CHAPTER_DEFAULTS.reviewStatus;

  const claims  = leadStory?.stats?.claims  ?? (trustMetrics?.chapterOneClaims  ?? '--');
  const sources = leadStory?.stats?.sources ?? (trustMetrics?.chapterOneSources ?? '--');

  const isLeadStory = Boolean(leadStory?.slug);

  return (
    <section
      aria-label={isLeadStory ? 'Featured story' : 'Featured chapter'}
      className="relative border-b"
      style={{ borderColor: 'var(--color-border-default)' }}
    >
      {/* Ochre top accent hairline */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--color-earth-ochre) 30%, var(--color-earth-ochre) 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-start">

          {/* ── LEFT: Editorial content ── */}
          <div className="flex flex-col gap-6 lg:py-4">

            {/* Category overline */}
            <div className="flex items-center gap-3">
              <span
                className="text-[11px] font-mono uppercase tracking-[0.2em]"
                style={{ color: 'var(--color-earth-ochre)' }}
              >
                {category}
              </span>
              {FOUNDING_CHAPTER_DEFAULTS.volume && !isLeadStory && (
                <>
                  <span
                    className="w-6 h-px flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-earth-ochre)', opacity: 0.35 }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-[11px] font-mono uppercase tracking-[0.16em]"
                    style={{ color: 'var(--color-earth-dust)' }}
                  >
                    {FOUNDING_CHAPTER_DEFAULTS.volume}
                  </span>
                </>
              )}
            </div>

            {/* Headline — large Playfair Display */}
            <h1
              className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.06] tracking-tight"
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                color: 'var(--color-text-primary)',
                maxWidth: '18ch',
              }}
            >
              {headline}
            </h1>

            {/* Dek — warm readable */}
            <p
              className="text-lg leading-relaxed"
              style={{
                color: 'var(--color-text-secondary)',
                maxWidth: '48ch',
                fontFamily: 'var(--font-reading), Georgia, serif',
              }}
            >
              {dek}
            </p>

            {/* Evidence signals — inline, not a card */}
            <EvidenceSignalStrip
              claims={claims}
              sources={sources}
              readingTime={readingTime}
              evidenceGrade={evidenceGrade}
            />

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={href}
                className="inline-flex items-center gap-2 px-7 py-3 rounded text-sm font-semibold tracking-wide transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--color-earth-ochre)',
                  color: 'var(--color-text-inverse)',
                }}
                id="hero-read-cta"
              >
                {isLeadStory ? 'Read Story' : 'Read Chapter'}
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/series"
                className="inline-flex items-center gap-1.5 text-sm font-mono transition-colors duration-150"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Browse Library
              </Link>
            </div>

          </div>

          {/* ── RIGHT: Knowledge panel ── */}
          <KnowledgePanel
            claims={claims}
            sources={sources}
            readingTime={readingTime}
            evidenceGrade={evidenceGrade}
            reviewStatus={reviewStatus}
            isLeadStory={isLeadStory}
            updatedAt={leadStory?.updatedAt}
            category={category}
          />

        </div>
      </div>
    </section>
  );
}
