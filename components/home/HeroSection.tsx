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
}: {
  claims: number | string;
  sources: number | string;
  readingTime: number;
  evidenceGrade?: string;
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
      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Primary Documentation
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

// ── Featured editorial panel (right column) ──────────────────────────────────

function FeaturedEditorialPanel({
  claims,
  sources,
  readingTime,
  isLeadStory,
  updatedAt,
  category,
  heroImage,
  headline,
  slug,
  byline,
}: {
  claims: number | string;
  sources: number | string;
  readingTime: number;
  isLeadStory: boolean;
  updatedAt?: string;
  category: string;
  heroImage?: string;
  headline: string;
  slug?: string;
  byline?: string;
}) {
  const href = slug ? `/story/${slug}` : FOUNDING_CHAPTER_PATH;

  return (
    <div
      className="relative flex flex-col gap-5 p-6 rounded-2xl overflow-hidden shadow-xl"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
      }}
      aria-label="Featured Story Spotlight"
    >
      {/* Featured visual */}
      {heroImage ? (
        <Link href={href} className="block group aspect-[16/10] rounded-xl overflow-hidden relative bg-neutral-900 border border-neutral-800">
          <img
            src={heroImage}
            alt={headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      ) : (
        <div className="aspect-[16/10] rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center p-6 text-center">
          <p className="font-serif text-lg italic text-neutral-300">
            &ldquo;Transform information into understanding.&rdquo;
          </p>
        </div>
      )}

      {/* Editorial context */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="uppercase tracking-wider text-emerald-400 font-bold">
            {isLeadStory ? category.toUpperCase() : 'HISTORICAL SERIES'}
          </span>
          <span>{readingTime} min read</span>
        </div>

        {!isLeadStory && <PeriodBar />}

        <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-neutral-400">
            {byline || 'The Breakdown Editorial'}
          </span>
          <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {claims} verified · {sources} sources
          </span>
        </div>
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

          {/* ── RIGHT: Featured editorial panel ── */}
          <FeaturedEditorialPanel
            claims={claims}
            sources={sources}
            readingTime={readingTime}
            isLeadStory={isLeadStory}
            updatedAt={leadStory?.updatedAt}
            category={category}
            heroImage={leadStory?.heroImage}
            headline={headline}
            slug={leadStory?.slug}
            byline={leadStory?.byline}
          />

        </div>
      </div>
    </section>
  );
}
