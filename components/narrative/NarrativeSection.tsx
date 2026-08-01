/**
 * NarrativeSection — Shared Server Layout Primitive
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0
 *
 * Consistent min-h-screen section wrapper for every narrative scene.
 * Provides: aria-labelledby, anchor ID, reveal-ready data attribute,
 * vertical rhythm, and keyboard focus landmark. Server Component — no hydration.
 */

interface NarrativeSectionProps {
  id: string;
  label: string;
  children: React.ReactNode;
  /** Optional additional Tailwind classes for the section */
  className?: string;
  /** Whether this section uses a dark background (default: true) */
  dark?: boolean;
}

export default function NarrativeSection({
  id,
  label,
  children,
  className = '',
  dark = true,
}: NarrativeSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-narrative-reveal
      className={`relative min-h-screen flex flex-col justify-center ${dark ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-950'} ${className}`}
    >
      {/* Visually hidden section landmark for screen readers */}
      <h2 id={headingId} className="sr-only">
        {label}
      </h2>

      {children}
    </section>
  );
}
