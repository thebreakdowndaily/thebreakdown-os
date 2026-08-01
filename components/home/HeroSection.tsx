/**
 * HeroSection — Featured Chapter Hero
 * Governance: docs/rxs/screens/homepage.md · RC-1
 *
 * Above-the-fold hero. Two-column layout on desktop.
 * LEFT: Category overline · Headline · Dek · Trust signals · CTAs
 * RIGHT: Editorial stats card with ambient timeline visual
 *
 * Design: Charcoal bg · Gold accent · Playfair Display headline
 * No animations. No parallax. Content is the hero.
 */

import Link from 'next/link';
import type { HomepageLeadStory } from '@/features/home/view-model';

// Canonical chapter path for the founding investigation
// Will be replaced by leadStory.slug once CMS populates it
const FOUNDING_CHAPTER_PATH =
  '/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance';

const FOUNDING_CHAPTER_STATS = {
  claims: 18,
  sources: 31,
  readingTime: 47,
  evidenceGrade: 'A',
  reviewStatus: 'Internal Gold Candidate',
};

interface HeroSectionProps {
  leadStory: HomepageLeadStory | null;
}

export default function HeroSection({ leadStory }: HeroSectionProps) {
  const href = leadStory?.slug
    ? `/story/${leadStory.slug}`
    : FOUNDING_CHAPTER_PATH;

  const headline = leadStory?.headline ?? "India's Inheritance";
  const dek =
    leadStory?.dek ??
    'Partition left India with disputed borders, a shattered economy, 562 princely states, and a foreign policy philosophy it would spend fifteen years trying to define. This is where the story begins.';
  const category = leadStory?.category ?? 'FOUNDING CHAPTER · VOLUME I';
  const readingTime = leadStory?.readingTime ?? FOUNDING_CHAPTER_STATS.readingTime;

  return (
    <section
      aria-label="Featured chapter"
      className="relative border-b border-[#1A1A1A] overflow-hidden"
    >
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #C9A84C 40%, #C9A84C 60%, transparent)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Editorial Content ── */}
          <div className="space-y-7">

            {/* Category / volume overline */}
            <div className="flex items-center gap-3">
              <span
                className="inline-block text-xs font-mono uppercase tracking-[0.18em]"
                style={{ color: '#C9A84C' }}
              >
                {category}
              </span>
              <span className="inline-block w-8 h-px" style={{ backgroundColor: '#C9A84C', opacity: 0.4 }} aria-hidden="true" />
            </div>

            {/* Headline */}
            <h1
              className="font-playfair text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.1] tracking-tight text-white"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              {headline}
            </h1>

            {/* Dek */}
            <p className="text-lg leading-relaxed" style={{ color: '#9A9A9A', maxWidth: '42ch' }}>
              {dek}
            </p>

            {/* Trust signals row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-mono" style={{ color: '#A1A1AA' }}>
              <span>{FOUNDING_CHAPTER_STATS.claims} verified claims</span>
              <span aria-hidden="true" style={{ color: '#2A2A2A' }}>·</span>
              <span>{FOUNDING_CHAPTER_STATS.sources} primary sources</span>
              <span aria-hidden="true" style={{ color: '#2A2A2A' }}>·</span>
              <span>{readingTime} min read</span>
              <span aria-hidden="true" style={{ color: '#2A2A2A' }}>·</span>
              <span style={{ color: '#C9A84C' }}>Evidence Grade {FOUNDING_CHAPTER_STATS.evidenceGrade}</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={href}
                className="inline-flex items-center gap-2 px-7 py-3 rounded text-sm font-semibold tracking-wide transition-colors duration-150"
                style={{ backgroundColor: '#C9A84C', color: '#0A0A0A' }}
                id="hero-read-chapter-cta"
              >
                Read Chapter
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Editorial Stats Card ── */}
          <div
            className="relative rounded-lg border overflow-hidden"
            style={{ backgroundColor: '#111111', borderColor: '#1A1A1A' }}
            aria-label="Chapter knowledge metrics"
          >
            {/* Gold top accent */}
            <div className="h-px" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} aria-hidden="true" />

            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#C9A84C' }}>
                  Knowledge Metrics
                </p>
                <p className="text-sm" style={{ color: '#A1A1AA' }}>
                  Foundations of Indian Foreign Policy · 1947–1962
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: FOUNDING_CHAPTER_STATS.claims, label: 'Verified Claims', accent: true },
                  { value: FOUNDING_CHAPTER_STATS.sources, label: 'Primary Sources', accent: false },
                  { value: readingTime, label: 'Minutes to Read', accent: false },
                  { value: `Grade ${FOUNDING_CHAPTER_STATS.evidenceGrade}`, label: 'Evidence Rating', accent: true },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p
                      className="text-3xl font-bold tracking-tight"
                      style={{ color: stat.accent ? '#C9A84C' : '#F5F5F5', fontFamily: 'var(--font-playfair), Georgia, serif' }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs font-mono uppercase tracking-wider" style={{ color: '#A1A1AA' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Timeline strip */}
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#A1A1AA' }}>
                  Period Covered
                </p>
                <div className="relative h-px" style={{ backgroundColor: '#1F1F1F' }}>
                  {/* Filled portion */}
                  <div
                    className="absolute top-0 left-0 h-full"
                    style={{ width: '100%', background: 'linear-gradient(90deg, #C9A84C, #7A6030)' }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex justify-between text-xs font-mono" style={{ color: '#A1A1AA' }}>
                  <span>1947</span>
                  <span>Independence · Partition · NAM</span>
                  <span>1962</span>
                </div>
              </div>

              {/* Review status */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded text-xs font-mono"
                style={{ backgroundColor: '#0F1A0F', border: '1px solid #1A2E1A', color: '#4CAF50' }}
              >
                <span aria-hidden="true">✓</span>
                {FOUNDING_CHAPTER_STATS.reviewStatus}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
