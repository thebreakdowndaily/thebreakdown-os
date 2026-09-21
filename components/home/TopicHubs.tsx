/**
 * TopicHubs — Explore by Topic
 * Governance: docs/rxs/screens/homepage.md · AGENTS.md Platform Beta
 *
 * Six topic entry points. Earth-inspired mineral tones.
 * Not a uniform card grid — editorial horizontal strip on desktop,
 * two-column on tablet, single-column stacked on mobile.
 *
 * Design intent:
 *   Topics behave like living dossiers. The visual should communicate
 *   permanence and intellectual seriousness, not a content category page.
 */

import Link from 'next/link';
import type { HomepageTopic } from '@/features/home/view-model';

// Earth-grounded topic accent — each topic gets a mineral color
// that distinguishes it without making the UI a rainbow.
const TOPIC_ACCENTS: Record<string, string> = {
  'foreign-policy': 'var(--color-earth-atmosphere)',
  'economy':        'var(--color-earth-moss)',
  'constitution':   'var(--color-earth-ochre)',
  'elections':      'var(--color-earth-clay)',
  'climate':        'var(--color-earth-forest)',
  'judiciary':      'var(--color-earth-stone)',
};

const STATIC_TOPICS: HomepageTopic[] = [
  {
    slug: 'foreign-policy',
    name: 'Foreign Policy',
    description: "Non-Alignment, bilateral relations, border disputes, and India's strategic doctrine since 1947.",
  },
  {
    slug: 'economy',
    name: 'Indian Economy',
    description: 'Planning, liberalisation, growth, inequality, fiscal policy, and structural reform.',
  },
  {
    slug: 'constitution',
    name: 'Constitution',
    description: 'The founding document — its framers, Constituent Assembly debates, amendments, and interpretations.',
  },
  {
    slug: 'elections',
    name: 'Elections',
    description: 'Electoral systems, results data, coalition politics, and the evolution of Indian democracy.',
  },
  {
    slug: 'climate',
    name: 'Climate',
    description: "India's climate vulnerability, energy transition, agricultural risk, and international commitments.",
  },
  {
    slug: 'judiciary',
    name: 'Judiciary',
    description: 'Supreme Court, landmark judgements, judicial appointments, and rule of law debates.',
  },
];

interface TopicHubsProps {
  topics: HomepageTopic[];
}

function TopicTile({ topic }: { topic: HomepageTopic }) {
  const accent = TOPIC_ACCENTS[topic.slug] ?? 'var(--color-earth-stone)';

  return (
    <Link
      href={`/topic/${topic.slug}`}
      id={`topic-hub-${topic.slug}`}
      className="group flex flex-col gap-3 py-5 px-1 border-b topic-tile transition-colors duration-150"
      style={{
        borderColor: 'var(--color-border-default)',
        textDecoration: 'none',
      }}
    >
      {/* Accent top rule */}
      <div
        className="w-8 h-px shrink-0 transition-all duration-150 group-hover:w-12"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />

      {/* Topic name */}
      <h3
        className="text-base font-semibold leading-snug transition-colors duration-150 group-hover:text-[var(--color-brand-400)]"
        style={{
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-playfair), Georgia, serif',
        }}
      >
        {topic.name}
      </h3>

      {/* Description */}
      {topic.description && (
        <p
          className="text-xs leading-relaxed line-clamp-3"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {topic.description}
        </p>
      )}

      {/* CTA — reveals on hover */}
      <span
        className="text-[10px] font-mono uppercase tracking-[0.14em] transition-all duration-150 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0"
        style={{ color: accent }}
        aria-hidden="true"
      >
        Explore topic →
      </span>
    </Link>
  );
}

export default function TopicHubs({ topics }: TopicHubsProps) {
  const displayTopics = topics.length >= 3 ? topics.slice(0, 6) : STATIC_TOPICS;

  return (
    <section
      aria-labelledby="topics-heading"
      className="border-b py-14 lg:py-20"
      style={{ borderColor: 'var(--color-border-default)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div
              className="h-px w-10 shrink-0"
              style={{ backgroundColor: 'var(--color-earth-ochre)', opacity: 0.5 }}
              aria-hidden="true"
            />
            <h2
              id="topics-heading"
              className="text-[11px] font-mono uppercase tracking-[0.22em]"
              style={{ color: 'var(--color-earth-ochre)' }}
            >
              Explore by Topic
            </h2>
          </div>
          <Link
            href="/topics"
            className="text-[10px] font-mono uppercase tracking-[0.14em] transition-colors duration-150"
            style={{ color: 'var(--color-earth-dust)' }}
          >
            All Topics →
          </Link>
        </div>

        {/* Topic grid — horizontal strip on desktop */}
        <nav aria-label="Topic navigation">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 list-none p-0 m-0">
            {displayTopics.map((topic) => (
              <li key={topic.slug} className="min-w-0">
                <TopicTile topic={topic} />
              </li>
            ))}
          </ul>
        </nav>

      </div>
    </section>
  );
}
