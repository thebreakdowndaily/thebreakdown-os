import type { Metadata } from 'next';
import Link from 'next/link';
import SearchBar from '@/components/ui/SearchBar';

/**
 * 404 — Not Found
 * Governance: AGENTS.md Platform Beta
 *
 * Brand-voiced 404. The Breakdown voice: precise, editorial, human.
 * Not a generic error page. A moment to redirect curiosity.
 *
 * Earth-inspired design: deep research environment (darkest surface),
 * because the reader is in unfamiliar territory.
 */

export const metadata: Metadata = {
  title: 'Page Not Found — The Breakdown',
};

export default function NotFound() {
  const suggestedLinks = [
    { label: 'Knowledge Library',   href: '/series' },
    { label: 'Investigations',      href: '/investigations' },
    { label: 'Founding Chapter',    href: '/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance' },
    { label: 'Browse all Topics',   href: '/topics' },
  ];

  return (
    <main
      id="main-content"
      className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-20"
      role="alert"
      style={{ backgroundColor: 'var(--color-bg-research)' }}
    >
      {/* Number — large archival anchor */}
      <span
        className="text-[120px] sm:text-[180px] font-bold leading-none select-none mb-4"
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          color:      'var(--color-border-default)',
          lineHeight: '0.85',
        }}
        aria-hidden="true"
      >
        404
      </span>

      {/* Ochre accent line */}
      <div
        className="w-16 h-px mb-8"
        style={{ backgroundColor: 'var(--color-earth-ochre)' }}
        aria-hidden="true"
      />

      {/* Headline */}
      <h1
        className="text-2xl sm:text-3xl font-bold text-center mb-3"
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          color:      'var(--color-text-research)',
        }}
      >
        We couldn't find that page.
      </h1>

      {/* Body */}
      <p
        className="text-sm leading-relaxed text-center mb-8 max-w-sm"
        style={{
          color:      'var(--color-text-muted)',
          fontFamily: 'var(--font-reading), Georgia, serif',
        }}
      >
        The page you're looking for doesn't exist or has been moved.
        Try searching for what you need, or explore the library.
      </p>

      {/* Search */}
      <div className="w-full max-w-sm mb-8">
        <SearchBar />
      </div>

      {/* Suggested links */}
      <nav aria-label="Suggested pages" className="flex flex-col items-center gap-3 mb-8">
        <p
          className="text-[10px] font-mono uppercase tracking-[0.18em]"
          style={{ color: 'var(--color-earth-dust)' }}
        >
          Or try one of these
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {suggestedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-mono px-3 py-1.5 rounded transition-colors duration-150"
              style={{
                backgroundColor: 'var(--color-bg-research-card)',
                border:          '1px solid var(--color-border-research)',
                color:           'var(--color-earth-dust)',
                textDecoration:  'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Back home */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold transition-colors duration-150"
        style={{
          backgroundColor: 'var(--color-earth-ochre)',
          color:           'var(--color-text-inverse)',
          textDecoration:  'none',
        }}
      >
        ← Return to The Breakdown
      </Link>
    </main>
  );
}
