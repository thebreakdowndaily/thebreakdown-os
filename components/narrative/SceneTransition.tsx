/**
 * SceneTransition — Declarative Contemplative Pause
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0 § 6
 *
 * Renders a full-height pause section with a single line of ambient text
 * between narrative scenes. Server Component — CSS only, no lifecycle manager.
 *
 * Usage:
 *   <SceneTransition text="Every headline is part of a bigger story." />
 */

interface SceneTransitionProps {
  text: string;
  /** Optional section ID for anchor linking */
  id?: string;
}

export default function SceneTransition({ text, id }: SceneTransitionProps) {
  return (
    <div
      id={id}
      aria-hidden="true"
      data-narrative-reveal
      className="relative flex items-center justify-center min-h-[40vh] bg-neutral-950 px-6 overflow-hidden"
    >
      {/* Ambient vertical rule */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-neutral-700 to-transparent"
        aria-hidden="true"
      />

      <p className="text-center text-neutral-500 text-lg sm:text-xl font-serif italic tracking-wide max-w-2xl leading-relaxed select-none">
        {text}
      </p>

      {/* Ambient vertical rule — bottom */}
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-neutral-700 via-neutral-700/50 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
