/**
 * MissionBar — Three Editorial Principles
 * Governance: docs/rxs/screens/homepage.md · AGENTS.md Platform Beta
 *
 * Earth-inspired: deep research environment (darkest background).
 * Answers: "Why should I trust The Breakdown?"
 *
 * Position: after the Knowledge Library, before the newsletter.
 * This placement gives it gravity — it is read after the reader
 * has already engaged, not before they've decided to trust.
 *
 * Three pillars, horizontal on desktop, stacked on mobile.
 * No icons that decorate — only icons that teach.
 */

const pillars = [
  {
    id:       'evidence-first',
    number:   '01',
    headline: 'Evidence Before Conclusions',
    body:     'Every claim is sourced. Every source is cited. Every citation links to the primary document. We show you exactly how we know what we say we know.',
  },
  {
    id:       'uncertainty-visible',
    number:   '02',
    headline: 'Uncertainty Always Visible',
    body:     'Where historians disagree, we say so. Where evidence is incomplete, we mark it. Where we are uncertain, we tell you. No false certainty. No editorial courage.',
  },
  {
    id:       'reasoning-shown',
    number:   '03',
    headline: 'Reasoning Always Shown',
    body:     'We show our work. Claim → Evidence → Source → Document. Every reader can verify every step independently. That is the promise.',
  },
] as const;

export default function MissionBar() {
  return (
    <section
      aria-label="Our editorial principles"
      className="border-b"
      style={{
        backgroundColor: 'var(--color-bg-research)',
        borderColor:     'var(--color-border-default)',
      }}
    >
      {/* Top accent: atmosphere blue (investigation mood) */}
      <div
        className="h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-earth-atmosphere) 30%, var(--color-earth-atmosphere) 70%, transparent 100%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-10">
          <div
            className="h-px w-10 shrink-0"
            style={{ backgroundColor: 'var(--color-earth-ochre)', opacity: 0.4 }}
            aria-hidden="true"
          />
          <h2
            className="text-[11px] font-mono uppercase tracking-[0.22em]"
            style={{ color: 'var(--color-earth-ochre)' }}
          >
            Our Standard
          </h2>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-16">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="flex flex-col gap-4">
              {/* Number anchor */}
              <span
                className="text-4xl font-bold leading-none select-none"
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  color: 'var(--color-border-hover)',
                }}
                aria-hidden="true"
              >
                {pillar.number}
              </span>

              {/* Headline */}
              <h3
                className="text-base font-semibold leading-snug"
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  color: 'var(--color-text-research)',
                }}
              >
                {pillar.headline}
              </h3>

              {/* Ochre hairline rule */}
              <div
                className="w-8 h-px"
                style={{ backgroundColor: 'var(--color-earth-ochre)', opacity: 0.4 }}
                aria-hidden="true"
              />

              {/* Body */}
              <p
                className="text-sm leading-relaxed"
                style={{
                  color:      'var(--color-text-muted)',
                  fontFamily: 'var(--font-reading), Georgia, serif',
                }}
              >
                {pillar.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
