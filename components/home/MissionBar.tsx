/**
 * MissionBar — Three Trust Pillars
 * Governance: docs/rxs/screens/homepage.md · RC-1
 *
 * Answers: "Why should I trust The Breakdown?"
 * Three concise, evidence-specific trust signals.
 * Server Component. No interactivity needed.
 */

const pillars = [
  {
    id: 'evidence-first',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          stroke="#C9A84C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    headline: 'Evidence Before Conclusions',
    body: 'Every claim is sourced. Every source is cited. Every citation links to the primary document.',
  },
  {
    id: 'uncertainty-visible',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 0v8m0 0l3-3m-3 3l-3-3"
          stroke="#C9A84C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    headline: 'Uncertainty Always Visible',
    body: 'Where historians disagree, we say so. Where evidence is incomplete, we mark it. No false certainty.',
  },
  {
    id: 'reasoning-shown',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h0a2 2 0 002-2M9 5a2 2 0 012-2h0a2 2 0 012 2"
          stroke="#C9A84C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    headline: 'Reasoning Always Shown',
    body: 'We show our work. Claim → Evidence → Source → Document. You can verify every step yourself.',
  },
] as const;

export default function MissionBar() {
  return (
    <section
      aria-label="Our editorial principles"
      className="border-b border-[#1A1A1A]"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">{pillar.icon}</div>
              {/* Text */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  {pillar.headline}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
                  {pillar.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
