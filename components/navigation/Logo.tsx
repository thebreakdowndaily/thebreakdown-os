import Link from 'next/link';

/**
 * Logo — RC-1 Editorial Wordmark
 * Playfair Display serif · gold accent · no graphic mark needed
 */
export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-0 shrink-0 group"
      aria-label="The Breakdown — Home"
    >
      <span
        className="text-lg font-bold leading-none tracking-tight transition-colors duration-150"
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          color: '#C9A84C',
        }}
      >
        The Breakdown
      </span>
      <span
        className="hidden sm:inline-block ml-3 text-[10px] font-mono uppercase tracking-[0.2em] leading-none self-center pt-0.5"
        style={{ color: '#A1A1AA' }}
      >
        India Explained
      </span>
    </Link>
  );
}
