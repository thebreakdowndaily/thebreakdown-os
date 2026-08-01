/**
 * StartHereSection — First-Time Visitor Orientation
 * Governance: docs/rxs/screens/homepage.md · RC-1
 *
 * Answers: "Where do I begin?"
 * Not a features list. Not an onboarding flow. Just four direct entry points.
 * Server Component. No JS required.
 */

import Link from 'next/link';

const FOUNDING_CHAPTER_PATH =
  '/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance';

const entryPoints = [
  {
    id: 'about',
    label: 'What is The Breakdown?',
    description: 'Evidence-first explainers on Indian history, policy, and foreign relations.',
    href: '/about',
    icon: '◎',
  },
  {
    id: 'chapter-1',
    label: 'Read the Founding Chapter',
    description: "India's Inheritance — where the story of modern India begins. 18 verified claims, 31 sources.",
    href: FOUNDING_CHAPTER_PATH,
    icon: '▶',
    featured: true,
  },
  {
    id: 'fix',
    label: 'Explore Policy Fixes',
    description: 'Evidence-backed frameworks for India\'s systemic challenges. Searchable and filterable.',
    href: '/fix',
    icon: '⬡',
  },
  {
    id: 'topics',
    label: 'Browse by Topic',
    description: 'Foreign policy, economy, constitution, climate, AI, elections — organised by domain.',
    href: '/topics',
    icon: '◈',
  },
] as const;

export default function StartHereSection() {
  return (
    <section
      aria-labelledby="start-here-heading"
      className="border-b border-[#1A1A1A] py-16 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 max-w-[3rem]" style={{ backgroundColor: '#C9A84C', opacity: 0.5 }} aria-hidden="true" />
          <h2
            id="start-here-heading"
            className="text-xs font-mono uppercase tracking-[0.2em]"
            style={{ color: '#C9A84C' }}
          >
            Start Here
          </h2>
        </div>

        {/* Entry points grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {entryPoints.map((entry) => (
            <Link
              key={entry.id}
              href={entry.href}
              className="group relative flex flex-col gap-3 p-6 rounded border transition-colors duration-150"
              style={{
                backgroundColor: entry.featured ? '#111408' : '#111111',
                borderColor: entry.featured ? '#C9A84C33' : '#1A1A1A',
              }}
              id={`start-here-${entry.id}`}
              aria-label={entry.label}
            >
              {/* Featured badge */}
              {entry.featured && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ backgroundColor: '#C9A84C22', color: '#C9A84C', border: '1px solid #C9A84C44' }}
                >
                  Begin Here
                </span>
              )}

              {/* Icon */}
              <span
                className="text-xl"
                style={{ color: entry.featured ? '#C9A84C' : '#333' }}
                aria-hidden="true"
              >
                {entry.icon}
              </span>

              {/* Label */}
              <h3 className="text-sm font-semibold text-white leading-snug pr-16 group-hover:text-[#C9A84C] transition-colors duration-150">
                {entry.label}
              </h3>

              {/* Description */}
              <p className="text-xs leading-relaxed" style={{ color: '#666' }}>
                {entry.description}
              </p>

              {/* Arrow */}
              <span
                className="mt-auto text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ color: '#C9A84C' }}
                aria-hidden="true"
              >
                Read →
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
