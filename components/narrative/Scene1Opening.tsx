/**
 * Scene 1 — The Opening Scene (Identity & Platform Intention)
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0 § 6 Scene 1
 * One Question: "Why should I care?"
 *
 * Server Component — no client JS, no hydration, no animations dependent on JS.
 * CSS reveal handled globally by NarrativeReveal utility via IntersectionObserver.
 */

export default function Scene1Opening() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-24 text-center overflow-hidden bg-neutral-950">
      {/* Ambient background grid — purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0f172a_0%,_#030712_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-10">
        {/* Platform identity badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 text-xs font-mono uppercase tracking-widest text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          The World&apos;s First Narrative Intelligence Platform
        </div>

        {/* North Star Motto */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.12] tracking-tight">
          The purpose of The Breakdown is not to{' '}
          <span className="text-neutral-500 line-through decoration-neutral-600">maximise attention</span>
          {'; '}
          <br className="hidden sm:block" />
          it is to{' '}
          <span className="text-emerald-400">maximise understanding</span>.
        </h1>

        {/* Secondary positioning copy */}
        <p className="text-lg sm:text-xl text-neutral-400 font-sans leading-relaxed max-w-2xl mx-auto">
          We do not publish articles.{' '}
          We build <span className="text-neutral-200 font-medium">structured journeys</span>{' '}
          through evidence — so you leave knowing something real.
        </p>

        {/* Three-part differentiation */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-mono text-neutral-500">
          <span className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            Evidence before conclusions
          </span>
          <span className="text-neutral-800" aria-hidden="true">·</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            Uncertainty always visible
          </span>
          <span className="text-neutral-800" aria-hidden="true">·</span>
          <span className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            Reasoning always shown
          </span>
        </div>

        {/* Scroll cue — CSS-only animation */}
        <div className="pt-8">
          <a
            href="#scene-2"
            className="group inline-flex flex-col items-center gap-2 text-neutral-500 hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 rounded"
            aria-label="Begin the journey — scroll to inquiry"
          >
            <span className="text-xs font-mono uppercase tracking-widest">Begin</span>
            <svg
              className="w-5 h-5 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
