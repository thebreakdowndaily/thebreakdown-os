/**
 * SectionHeader — Reusable editorial section header primitive
 * Governance: docs/rxs/component-philosophy.md · AGENTS.md Platform Beta
 *
 * Earth-inspired: ochre hairline + small mono label is the
 * signature section marker of The Breakdown. Consistent across all pages.
 *
 * Supports both:
 * 1. Simple editorial label: <SectionHeader label="Knowledge Library" href="/series" />
 * 2. Eyebrow + Title pattern: <SectionHeader eyebrow="Solutions" title="The Fix" description="..." />
 */

import Link from 'next/link';

// Accent color options — Earth material palette
const ACCENT_COLORS: Record<string, string> = {
  ochre:       'var(--color-earth-ochre)',
  amber:       'var(--color-earth-ochre)',
  atmosphere:  'var(--color-earth-atmosphere)',
  blue:        'var(--color-earth-atmosphere)',
  moss:        'var(--color-earth-moss)',
  green:       'var(--color-earth-moss)',
  clay:        'var(--color-earth-clay)',
  forest:      'var(--color-earth-forest)',
  dust:        'var(--color-earth-dust)',
  stone:       'var(--color-earth-stone)',
};

export interface SectionHeaderProps {
  /** Primary label (when eyebrow is not used) */
  label?: string;
  /** Eyebrow / overline text */
  eyebrow?: string;
  /** Main heading title (when eyebrow is used) */
  title?: string;
  /** Optional secondary description text */
  description?: string;
  /** Link to show on the right: href + label */
  href?: string;
  linkLabel?: string;
  /** Earth accent color name — defaults to 'ochre' */
  accent?: string;
  /** Optional heading id for aria-labelledby */
  id?: string;
  /** Optional custom class names */
  className?: string;
}

export default function SectionHeader({
  label,
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'View all →',
  accent = 'ochre',
  id,
  className = '',
}: SectionHeaderProps) {
  const accentColor = ACCENT_COLORS[accent] ?? accent;
  const overlineText = eyebrow || (!title ? label : undefined);
  const mainHeading = title || (eyebrow ? undefined : label);

  return (
    <div className={`flex items-start justify-between mb-8 sm:mb-10 ${className}`}>
      <div>
        {overlineText && (
          <div className="flex items-center gap-3 mb-2">
            <div
              className="h-px w-8 shrink-0"
              style={{ backgroundColor: accentColor, opacity: 0.6 }}
              aria-hidden="true"
            />
            <span
              className="text-[11px] font-mono uppercase tracking-[0.22em] font-semibold"
              style={{ color: accentColor }}
            >
              {overlineText}
            </span>
          </div>
        )}

        {mainHeading && (
          <h2
            id={id}
            className="text-2xl sm:text-3xl font-bold font-serif text-[var(--color-text-primary)] leading-tight"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            {mainHeading}
          </h2>
        )}

        {description && (
          <p
            className="text-sm mt-2 text-[var(--color-text-secondary)] max-w-2xl leading-relaxed"
            style={{ fontFamily: 'var(--font-reading), Georgia, serif' }}
          >
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="text-xs font-mono uppercase tracking-[0.14em] text-[var(--color-earth-dust)] hover:text-[var(--color-brand-400)] transition-colors duration-150 shrink-0 mt-1"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
