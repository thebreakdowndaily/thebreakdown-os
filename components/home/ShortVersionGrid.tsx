/**
 * ShortVersionGrid — THE BRIEF
 * Governance: docs/rxs/screens/homepage.md · AGENTS.md Platform Beta
 *
 * "Three things worth understanding today."
 * Earth-inspired design: numbered editorial list with warm mineral tones.
 * NOT a dashboard — a briefing. Compact, human, fast.
 *
 * Visual character:
 *   - Large numbered section with ochre accent
 *   - Each item: numbered marker + category + headline + summary + time
 *   - Warm graphite background (slightly warmer than homepage base)
 *   - Source Serif 4 for headlines — reading warmth even in briefings
 *
 * Renders null if no briefings are available (conditional rendering handled
 * by HomepageLayout — this component does not invent data).
 */

import Link from 'next/link';
import type { HomepageBriefing } from '@/features/home/view-model';

interface ShortVersionGridProps {
  briefings: HomepageBriefing[];
}

// ── Category color map — Earth palette, not rainbow ──────────────────────────
// Only three semantic categories get distinct colors. Everything else is stone.

function getCategoryColor(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('economy') || cat.includes('data'))       return 'var(--color-earth-moss)';
  if (cat.includes('govern') || cat.includes('policy'))      return 'var(--color-earth-atmosphere)';
  if (cat.includes('foreign') || cat.includes('geopolit'))   return 'var(--color-earth-clay)';
  return 'var(--color-earth-ochre)';
}

// ── Brief item ────────────────────────────────────────────────────────────────

function BriefItem({
  item,
  index,
}: {
  item: HomepageBriefing;
  index: number;
}) {
  const numeral = String(index + 1).padStart(2, '0');
  const categoryColor = getCategoryColor(item.category);

  return (
    <article className="brief-item group flex gap-6 py-6">
      {/* Number column */}
      <div className="flex-shrink-0 w-10 pt-0.5">
        <span
          className="text-2xl font-bold font-mono leading-none"
          style={{
            color: 'var(--color-border-hover)',
            fontFamily: 'var(--font-playfair), Georgia, serif',
          }}
          aria-hidden="true"
        >
          {numeral}
        </span>
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Category + time */}
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-mono uppercase tracking-[0.18em] font-semibold"
            style={{ color: categoryColor }}
          >
            {item.category}
          </span>
          <span
            className="text-[10px] font-mono"
            style={{ color: 'var(--color-earth-dust)' }}
          >
            {item.readingTime} min
          </span>
        </div>

        {/* Headline */}
        <h3
          className="text-lg leading-snug transition-colors duration-150"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          <Link
            href={`/story/${item.slug}`}
            className="group-hover:text-[var(--color-brand-400)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-400)] rounded"
            style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}
          >
            {item.headline}
          </Link>
        </h3>

        {/* Summary */}
        <p
          className="text-sm leading-relaxed line-clamp-2"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-reading), Georgia, serif',
          }}
        >
          {item.summary}
        </p>

        {/* Trust signal + CTA */}
        <div className="flex items-center justify-between pt-1">
          {item.trustSignals[0] ? (
            <span
              className="text-[10px] font-mono flex items-center gap-1.5"
              style={{ color: 'var(--color-evidence-verified-text)' }}
            >
              <span aria-hidden="true">✓</span>
              {item.trustSignals[0].label}
            </span>
          ) : (
            <span />
          )}
          <Link
            href={`/story/${item.slug}`}
            className="text-xs font-mono transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-400)] rounded"
            style={{ color: 'var(--color-earth-ochre)' }}
            aria-label={`Understand: ${item.headline}`}
          >
            Understand →
          </Link>
        </div>
      </div>
    </article>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function ShortVersionGrid({ briefings }: ShortVersionGridProps) {
  if (!briefings || briefings.length === 0) return null;

  const displayItems = briefings.slice(0, 3);

  return (
    <section
      aria-labelledby="brief-heading"
      className="border-b"
      style={{ borderColor: 'var(--color-border-default)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 lg:gap-20">

          {/* ── Left: section label ── */}
          <div className="lg:pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-px shrink-0"
                style={{ backgroundColor: 'var(--color-earth-ochre)', opacity: 0.5 }}
                aria-hidden="true"
              />
              <h2
                id="brief-heading"
                className="text-[11px] font-mono uppercase tracking-[0.22em]"
                style={{ color: 'var(--color-earth-ochre)' }}
              >
                The Brief
              </h2>
            </div>
            <p
              className="text-base leading-snug"
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                color: 'var(--color-text-primary)',
                maxWidth: '22ch',
              }}
            >
              {displayItems.length === 1
                ? 'One thing worth understanding today'
                : `${displayItems.length} things worth understanding today`}
            </p>
            <p
              className="mt-3 text-xs font-mono"
              style={{ color: 'var(--color-earth-dust)' }}
            >
              Direct briefing · Concise context
            </p>
          </div>

          {/* ── Right: brief items ── */}
          <div
            className="divide-y"
            style={{ borderColor: 'var(--color-border-default)' }}
          >
            <style>{`
              .brief-item:first-child { padding-top: 0; }
            `}</style>
            {displayItems.map((item, i) => (
              <BriefItem key={item.slug} item={item} index={i} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
