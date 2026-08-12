/**
 * TopicHubs — Six Domain Entry Points
 * Governance: docs/rxs/screens/homepage.md · RC-1
 *
 * Six topic tiles. Compact. Editorial.
 * Maps HomepageTopic[] from view-model to clean domain tiles.
 * Falls back to static topics when CMS data is empty.
 * Server Component. No JS.
 */

import Link from 'next/link';
import type { HomepageTopic } from '@/features/home/view-model';

const STATIC_TOPICS = [
  {
    slug: 'foreign-policy',
    name: 'Foreign Policy',
    description: 'Non-Alignment, bilateral relations, border disputes, and strategic doctrine.',
  },
  {
    slug: 'economy',
    name: 'Indian Economy',
    description: 'Planning, liberalisation, growth, inequality, and fiscal policy.',
  },
  {
    slug: 'constitution',
    name: 'Constitution',
    description: 'The founding document — its framers, debates, amendments, and interpretations.',
  },
  {
    slug: 'elections',
    name: 'Elections',
    description: 'Electoral systems, results, coalitions, and the evolution of Indian democracy.',
  },
  {
    slug: 'climate',
    name: 'Climate',
    description: "India's climate vulnerability, energy transition, and international commitments.",
  },
  {
    slug: 'judiciary',
    name: 'Judiciary',
    description: 'Supreme Court, landmark judgements, judicial appointments, and rule of law.',
  },
];

interface TopicHubsProps {
  topics: HomepageTopic[];
}

export default function TopicHubs({ topics }: TopicHubsProps) {
  // Use CMS topics if populated (≥ 3), else fall back to curated static list
  const displayTopics = topics.length >= 3 ? topics.slice(0, 6) : STATIC_TOPICS;

  return (
    <section
      aria-labelledby="topics-heading"
      className="border-b border-[#1A1A1A] py-16 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-12" style={{ backgroundColor: '#C9A84C', opacity: 0.5 }} aria-hidden="true" />
            <h2
              id="topics-heading"
              className="text-xs font-mono uppercase tracking-[0.2em]"
              style={{ color: '#C9A84C' }}
            >
              Browse by Topic
            </h2>
          </div>
          <Link
            href="/topics"
            className="text-xs font-mono uppercase tracking-wider transition-colors duration-150"
            style={{ color: '#A1A1AA' }}
          >
            All Topics →
          </Link>
        </div>

        {/* Topic grid */}
        <nav aria-label="Topic navigation">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 list-none p-0 m-0">
            {displayTopics.map((topic) => (
              <li key={topic.slug}>
                <Link
                  href={`/topic/${topic.slug}`}
                  className="group flex flex-col gap-2 p-4 rounded border transition-colors duration-150 h-full"
                  style={{ backgroundColor: '#111111', borderColor: '#1A1A1A' }}
                  id={`topic-hub-${topic.slug}`}
                >
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#C9A84C] transition-colors duration-150 leading-snug">
                    {topic.name}
                  </h3>
                  {(topic.description) && (
                    <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: '#A1A1AA' }}>
                      {topic.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

      </div>
    </section>
  );
}
